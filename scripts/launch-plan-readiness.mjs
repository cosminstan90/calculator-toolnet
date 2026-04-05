import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { getPayload } from "payload";

import {
  LAUNCH_PLAN_DAYS,
  LAUNCH_PLAN_TIMEZONE,
  getLaunchPlanEarliestAt,
} from "../src/lib/launch-plan.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const PUBLISHABLE_EDITORIAL_STATUSES = new Set(["approved", "scheduled"]);
const REVIEW_READY_STATUSES = new Set(["reviewed", "published"]);

const asRecord = (value) =>
  value && typeof value === "object" ? value : {};

const asString = (value) => (typeof value === "string" ? value : "");

const asBoolean = (value) => value === true;

const loadEnvFile = async () => {
  const envPath = path.join(rootDir, ".env");

  try {
    const raw = await fs.readFile(envPath, "utf8");

    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();

      if (!process.env[key]) {
        process.env[key] = value.replace(/^['"]|['"]$/g, "");
      }
    }
  } catch {
    // Variables may also be provided by the shell / process manager.
  }
};

const patchPayloadLoadEnvInterop = async () => {
  const loadEnvModulePath = path.join(
    rootDir,
    "node_modules",
    "payload",
    "dist",
    "bin",
    "loadEnv.js",
  );

  try {
    const source = await fs.readFile(loadEnvModulePath, "utf8");

    if (source.includes("nextEnvImportNs.loadEnvConfig")) {
      return;
    }

    const importLine = "import nextEnvImport from '@next/env';";
    const destructureLine = "const { loadEnvConfig } = nextEnvImport;";

    if (!source.includes(importLine) || !source.includes(destructureLine)) {
      console.warn(
        `[launch-plan-readiness] Skipping loadEnv interop patch because the expected Payload helper shape was not found at ${loadEnvModulePath}`,
      );
      return;
    }

    const patchedSource = source
      .replace(importLine, "import * as nextEnvImportNs from '@next/env';")
      .replace(
        destructureLine,
        [
          "const loadEnvConfig =",
          "    nextEnvImportNs.loadEnvConfig ?? nextEnvImportNs.default?.loadEnvConfig;",
          "if (typeof loadEnvConfig !== 'function') {",
          '    throw new TypeError("Could not resolve loadEnvConfig from @next/env");',
          "}",
        ].join("\n"),
      );

    await fs.writeFile(loadEnvModulePath, patchedSource, "utf8");
    console.log(
      `[launch-plan-readiness] Patched ${loadEnvModulePath} for @next/env interop.`,
    );
  } catch (error) {
    console.warn(
      "[launch-plan-readiness] Could not patch Payload loadEnv helper.",
      error,
    );
  }
};

const buildBlockers = ({
  collection,
  doc,
  expectedSlot,
  expectedPriority,
  expectedEarliestAt,
}) => {
  const blockers = [];

  if (!doc) {
    blockers.push("missing-document");
    return blockers;
  }

  if (asString(doc._status) === "published") {
    blockers.push("already-published");
  }

  const editorialStatus = asString(doc.editorialStatus);
  if (!PUBLISHABLE_EDITORIAL_STATUSES.has(editorialStatus)) {
    blockers.push(`editorial-status:${editorialStatus || "missing"}`);
  }

  const checklist = asRecord(doc.editorialChecklist);
  if (!asBoolean(checklist.publishReady)) {
    blockers.push("publish-ready:false");
  }

  const schedule = asRecord(doc.publishingSchedule);
  if (asString(schedule.slot) !== expectedSlot) {
    blockers.push(`slot:${asString(schedule.slot) || "missing"}`);
  }

  const currentPriority = Number(schedule.priority ?? 999);
  if (currentPriority !== expectedPriority) {
    blockers.push(`priority:${Number.isFinite(currentPriority) ? currentPriority : "missing"}`);
  }

  if (asString(schedule.earliestAt) !== expectedEarliestAt) {
    blockers.push(`earliestAt:${asString(schedule.earliestAt) || "missing"}`);
  }

  if (collection === "articles") {
    const reviewStatus = asString(asRecord(doc.aiDraft).reviewStatus);
    if (!REVIEW_READY_STATUSES.has(reviewStatus)) {
      blockers.push(`review-status:${reviewStatus || "missing"}`);
    }
  }

  return blockers;
};

const summarizeDoc = ({
  collection,
  key,
  expectedSlot,
  expectedPriority,
  expectedEarliestAt,
  doc,
}) => {
  if (!doc) {
    return {
      collection,
      key,
      status: "missing",
      blockers: ["missing-document"],
    };
  }

  const blockers = buildBlockers({
    collection,
    doc,
    expectedSlot,
    expectedPriority,
    expectedEarliestAt,
  });

  return {
    collection,
    key,
    title: asString(doc.title),
    status: blockers.length === 0 ? "ready" : "blocked",
    blockers,
    current: {
      status: asString(doc._status) || "draft",
      editorialStatus: asString(doc.editorialStatus) || "draft",
      publishReady: asBoolean(asRecord(doc.editorialChecklist).publishReady),
      slot: asString(asRecord(doc.publishingSchedule).slot) || "none",
      priority: Number(asRecord(doc.publishingSchedule).priority ?? 999),
      earliestAt: asString(asRecord(doc.publishingSchedule).earliestAt),
      reviewStatus:
        collection === "articles"
          ? asString(asRecord(doc.aiDraft).reviewStatus) || "draft"
          : undefined,
    },
    expected: {
      slot: expectedSlot,
      priority: expectedPriority,
      earliestAt: expectedEarliestAt,
    },
  };
};

await loadEnvFile();
await patchPayloadLoadEnvInterop();

const configPath = process.env.PAYLOAD_CONFIG_PATH
  ? path.resolve(rootDir, process.env.PAYLOAD_CONFIG_PATH)
  : path.join(rootDir, "src", "cms.config.ts");

console.log(`[launch-plan-readiness] Loading config from ${configPath}`);

const importedConfig = await import(pathToFileURL(configPath).href);
const config = await (importedConfig.default ?? importedConfig);
config.telemetry = false;

const payload = await getPayload({ config });

try {
  const articleDocs = await payload.find({
    collection: "articles",
    depth: 0,
    pagination: false,
    limit: 500,
    overrideAccess: true,
  });

  const calculatorDocs = await payload.find({
    collection: "calculators",
    depth: 0,
    pagination: false,
    limit: 500,
    overrideAccess: true,
  });

  const articleMap = new Map(articleDocs.docs.map((doc) => [asString(doc.slug), doc]));
  const calculatorMap = new Map(
    calculatorDocs.docs.map((doc) => [asString(doc.calculatorKey), doc]),
  );

  const days = [];
  const allItems = [];

  for (const [index, day] of LAUNCH_PLAN_DAYS.entries()) {
    const priority = index + 1;
    const morningEarliestAt = getLaunchPlanEarliestAt(day.date, "morning");
    const eveningEarliestAt = getLaunchPlanEarliestAt(day.date, "evening");

    const articleItem = summarizeDoc({
      collection: "articles",
      key: day.morning.articleSlug,
      expectedSlot: "morning",
      expectedPriority: priority,
      expectedEarliestAt: morningEarliestAt,
      doc: articleMap.get(day.morning.articleSlug),
    });

    const morningCalculatorItem = summarizeDoc({
      collection: "calculators",
      key: day.morning.calculatorKey,
      expectedSlot: "morning",
      expectedPriority: priority,
      expectedEarliestAt: morningEarliestAt,
      doc: calculatorMap.get(day.morning.calculatorKey),
    });

    const eveningCalculatorItem = summarizeDoc({
      collection: "calculators",
      key: day.evening.calculatorKey,
      expectedSlot: "evening",
      expectedPriority: priority,
      expectedEarliestAt: eveningEarliestAt,
      doc: calculatorMap.get(day.evening.calculatorKey),
    });

    const items = [articleItem, morningCalculatorItem, eveningCalculatorItem];
    allItems.push(...items);

    days.push({
      date: day.date,
      readyCount: items.filter((item) => item.status === "ready").length,
      blockedCount: items.filter((item) => item.status === "blocked").length,
      missingCount: items.filter((item) => item.status === "missing").length,
      items,
    });
  }

  const blockedItems = allItems.filter((item) => item.status === "blocked");
  const missingItems = allItems.filter((item) => item.status === "missing");
  const readyItems = allItems.filter((item) => item.status === "ready");

  const blockerCounts = new Map();
  for (const item of blockedItems) {
    for (const blocker of item.blockers) {
      blockerCounts.set(blocker, (blockerCounts.get(blocker) ?? 0) + 1);
    }
  }

  const topBlockers = Array.from(blockerCounts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([blocker, count]) => ({ blocker, count }));

  console.log(
    JSON.stringify(
      {
        ok: true,
        action: "launch-plan-readiness",
        timezone: LAUNCH_PLAN_TIMEZONE,
        totals: {
          days: LAUNCH_PLAN_DAYS.length,
          items: allItems.length,
          ready: readyItems.length,
          blocked: blockedItems.length,
          missing: missingItems.length,
        },
        topBlockers,
        days,
      },
      null,
      2,
    ),
  );
} finally {
  await payload.destroy();
}
