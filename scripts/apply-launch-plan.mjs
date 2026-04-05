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

const dryRun = process.argv.includes("--dry-run");

const asRecord = (value) =>
  value && typeof value === "object" ? value : {};

const asString = (value) => (typeof value === "string" ? value : "");

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
        `[apply-launch-plan] Skipping loadEnv interop patch because the expected Payload helper shape was not found at ${loadEnvModulePath}`,
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
      `[apply-launch-plan] Patched ${loadEnvModulePath} for @next/env interop.`,
    );
  } catch (error) {
    console.warn("[apply-launch-plan] Could not patch Payload loadEnv helper.", error);
  }
};

const buildArticleUpdate = (doc, earliestAt, priority) => {
  const nextAiDraft = asRecord(doc.aiDraft);

  return {
    editorialStatus: asString(doc._status) === "published" ? "published" : "scheduled",
    publishingSchedule: {
      ...asRecord(doc.publishingSchedule),
      slot: "morning",
      priority,
      earliestAt,
    },
    aiDraft: {
      ...nextAiDraft,
      reviewStatus: asString(nextAiDraft.reviewStatus) || "draft",
    },
  };
};

const buildCalculatorUpdate = (doc, slot, earliestAt, priority) => ({
  editorialStatus: asString(doc._status) === "published" ? "published" : "scheduled",
  publishingSchedule: {
    ...asRecord(doc.publishingSchedule),
    slot,
    priority,
    earliestAt,
  },
});

const summarizeSchedule = (doc) => ({
  slot: asString(asRecord(doc.publishingSchedule).slot) || "none",
  priority: Number(asRecord(doc.publishingSchedule).priority ?? 999),
  earliestAt: asString(asRecord(doc.publishingSchedule).earliestAt),
  editorialStatus: asString(doc.editorialStatus) || "draft",
});

await loadEnvFile();
await patchPayloadLoadEnvInterop();

const configPath = process.env.PAYLOAD_CONFIG_PATH
  ? path.resolve(rootDir, process.env.PAYLOAD_CONFIG_PATH)
  : path.join(rootDir, "src", "cms.config.ts");

console.log(`[apply-launch-plan] Loading config from ${configPath}`);

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

  const articleMap = new Map(
    articleDocs.docs.map((doc) => [asString(doc.slug), doc]),
  );
  const calculatorMap = new Map(
    calculatorDocs.docs.map((doc) => [asString(doc.calculatorKey), doc]),
  );

  const results = [];

  for (const [index, day] of LAUNCH_PLAN_DAYS.entries()) {
    const morningPriority = index + 1;
    const eveningPriority = index + 1;

    const morningEarliestAt = getLaunchPlanEarliestAt(day.date, "morning");
    const eveningEarliestAt = getLaunchPlanEarliestAt(day.date, "evening");

    const articleDoc = articleMap.get(day.morning.articleSlug);
    if (!articleDoc) {
      results.push({
        collection: "articles",
        key: day.morning.articleSlug,
        status: "missing",
      });
    } else {
      const data = buildArticleUpdate(articleDoc, morningEarliestAt, morningPriority);
      if (!dryRun) {
        await payload.update({
          collection: "articles",
          id: articleDoc.id,
          overrideAccess: true,
          draft: asString(articleDoc._status) !== "published",
          data,
        });
      }
      results.push({
        collection: "articles",
        key: day.morning.articleSlug,
        status: dryRun ? "dry-run" : "scheduled",
        ...summarizeSchedule(data),
      });
    }

    const morningCalculatorDoc = calculatorMap.get(day.morning.calculatorKey);
    if (!morningCalculatorDoc) {
      results.push({
        collection: "calculators",
        key: day.morning.calculatorKey,
        status: "missing",
      });
    } else {
      const data = buildCalculatorUpdate(
        morningCalculatorDoc,
        "morning",
        morningEarliestAt,
        morningPriority,
      );
      if (!dryRun) {
        await payload.update({
          collection: "calculators",
          id: morningCalculatorDoc.id,
          overrideAccess: true,
          draft: asString(morningCalculatorDoc._status) !== "published",
          data,
        });
      }
      results.push({
        collection: "calculators",
        key: day.morning.calculatorKey,
        status: dryRun ? "dry-run" : "scheduled",
        ...summarizeSchedule(data),
      });
    }

    const eveningCalculatorDoc = calculatorMap.get(day.evening.calculatorKey);
    if (!eveningCalculatorDoc) {
      results.push({
        collection: "calculators",
        key: day.evening.calculatorKey,
        status: "missing",
      });
    } else {
      const data = buildCalculatorUpdate(
        eveningCalculatorDoc,
        "evening",
        eveningEarliestAt,
        eveningPriority,
      );
      if (!dryRun) {
        await payload.update({
          collection: "calculators",
          id: eveningCalculatorDoc.id,
          overrideAccess: true,
          draft: asString(eveningCalculatorDoc._status) !== "published",
          data,
        });
      }
      results.push({
        collection: "calculators",
        key: day.evening.calculatorKey,
        status: dryRun ? "dry-run" : "scheduled",
        ...summarizeSchedule(data),
      });
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        action: "apply-launch-plan",
        timezone: LAUNCH_PLAN_TIMEZONE,
        dryRun,
        scheduledDays: LAUNCH_PLAN_DAYS.length,
        results,
      },
      null,
      2,
    ),
  );
} finally {
  await payload.destroy();
}
