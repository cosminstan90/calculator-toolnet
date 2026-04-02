import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { getPayload } from "payload";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const VALID_SLOTS = new Set(["morning", "evening"]);
const PUBLISHABLE_EDITORIAL_STATUSES = new Set(["approved", "scheduled"]);

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
        `[publish-scheduled] Skipping loadEnv interop patch because the expected Payload helper shape was not found at ${loadEnvModulePath}`,
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
          "    throw new TypeError(\"Could not resolve loadEnvConfig from @next/env\");",
          "}",
        ].join("\n"),
      );

    await fs.writeFile(loadEnvModulePath, patchedSource, "utf8");
    console.log(
      `[publish-scheduled] Patched ${loadEnvModulePath} for @next/env interop.`,
    );
  } catch (error) {
    console.warn("[publish-scheduled] Could not patch Payload loadEnv helper.", error);
  }
};

const getCliArg = (name) => {
  const prefix = `--${name}=`;
  const match = process.argv.find((argument) => argument.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
};

const timezone = process.env.PUBLISHING_TIMEZONE ?? "Europe/Bucharest";
const dryRun = process.argv.includes("--dry-run");

const currentHourInTimezone = () => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    hour12: false,
  });

  return Number.parseInt(formatter.format(new Date()), 10);
};

const resolveSlot = () => {
  const explicitSlot = getCliArg("slot");

  if (explicitSlot && VALID_SLOTS.has(explicitSlot)) {
    return explicitSlot;
  }

  const hour = currentHourInTimezone();
  return hour < 12 ? "morning" : "evening";
};

const formatLocalDate = (value) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date(value));
};

const getTodayLocalDate = () => formatLocalDate(new Date());

const compareCandidates = (left, right) => {
  const leftSchedule = asRecord(left.publishingSchedule);
  const rightSchedule = asRecord(right.publishingSchedule);

  const leftPriority = Number(leftSchedule.priority ?? 999);
  const rightPriority = Number(rightSchedule.priority ?? 999);

  if (leftPriority !== rightPriority) {
    return leftPriority - rightPriority;
  }

  const leftEarliest = asString(leftSchedule.earliestAt);
  const rightEarliest = asString(rightSchedule.earliestAt);

  if (leftEarliest !== rightEarliest) {
    if (!leftEarliest) return -1;
    if (!rightEarliest) return 1;
    return leftEarliest.localeCompare(rightEarliest);
  }

  const leftUpdatedAt = asString(left.updatedAt);
  const rightUpdatedAt = asString(right.updatedAt);

  return leftUpdatedAt.localeCompare(rightUpdatedAt);
};

const isEligibleForSlot = (collection, doc, slot) => {
  if (asString(doc._status) === "published") {
    return false;
  }

  if (!PUBLISHABLE_EDITORIAL_STATUSES.has(asString(doc.editorialStatus))) {
    return false;
  }

  const checklist = asRecord(doc.editorialChecklist);
  if (!asBoolean(checklist.publishReady)) {
    return false;
  }

  const schedule = asRecord(doc.publishingSchedule);
  if (asString(schedule.slot) !== slot) {
    return false;
  }

  const earliestAt = asString(schedule.earliestAt);
  if (earliestAt && new Date(earliestAt).getTime() > Date.now()) {
    return false;
  }

  if (collection === "articles") {
    const aiDraft = asRecord(doc.aiDraft);
    const reviewStatus = asString(aiDraft.reviewStatus);

    if (!["reviewed", "published"].includes(reviewStatus)) {
      return false;
    }
  }

  return true;
};

const alreadyPublishedInSlotToday = (doc, slot) => {
  const schedule = asRecord(doc.publishingSchedule);
  const lastPublishedSlot = asString(schedule.lastAutoSlot);
  const lastPublishedAt = asString(schedule.lastAutoAt);

  if (!lastPublishedAt || lastPublishedSlot !== slot) {
    return false;
  }

  return formatLocalDate(lastPublishedAt) === getTodayLocalDate();
};

const pickCandidate = (collection, docs, slot) =>
  docs.filter((doc) => isEligibleForSlot(collection, doc, slot)).sort(compareCandidates)[0];

const hasSlotRunToday = (docs, slot) =>
  docs.some((doc) => alreadyPublishedInSlotToday(doc, slot));

const buildUpdatePayload = (doc, slot, nowIso) => ({
  _status: "published",
  editorialStatus: "published",
  publishedAt: asString(doc.publishedAt) || nowIso,
  publishingSchedule: {
    ...asRecord(doc.publishingSchedule),
    lastAutoAt: nowIso,
    lastAutoSlot: slot,
  },
});

const publishOne = async ({ payload, collection, docs, slot, nowIso }) => {
  if (hasSlotRunToday(docs, slot)) {
    return {
      collection,
      status: "skipped",
      reason: `slot-already-ran-${slot}-today`,
    };
  }

  const candidate = pickCandidate(collection, docs, slot);

  if (!candidate) {
    return {
      collection,
      status: "skipped",
      reason: "no-eligible-documents",
    };
  }

  const summary = {
    id: candidate.id,
    title: asString(candidate.title),
    slug: asString(candidate.slug),
    editorialStatus: asString(candidate.editorialStatus),
    priority: Number(asRecord(candidate.publishingSchedule).priority ?? 999),
    slot,
  };

  if (dryRun) {
    return {
      collection,
      status: "dry-run",
      candidate: summary,
    };
  }

  await payload.update({
    collection,
    id: candidate.id,
    overrideAccess: true,
    draft: false,
    data: buildUpdatePayload(candidate, slot, nowIso),
  });

  return {
    collection,
    status: "published",
    candidate: summary,
  };
};

await loadEnvFile();
await patchPayloadLoadEnvInterop();

const configPath = process.env.PAYLOAD_CONFIG_PATH
  ? path.resolve(rootDir, process.env.PAYLOAD_CONFIG_PATH)
  : path.join(rootDir, "src", "cms.config.ts");

console.log(`[publish-scheduled] Loading config from ${configPath}`);

const importedConfig = await import(pathToFileURL(configPath).href);
const config = await (importedConfig.default ?? importedConfig);
config.telemetry = false;

const slot = resolveSlot();
const nowIso = new Date().toISOString();

console.log(
  `[publish-scheduled] Running slot=${slot} timezone=${timezone} dryRun=${dryRun}`,
);

const payload = await getPayload({ config });

try {
  const calculatorDocs = await payload.find({
    collection: "calculators",
    depth: 0,
    pagination: false,
    limit: 500,
    overrideAccess: true,
  });

  const articleDocs =
    slot === "morning"
      ? await payload.find({
          collection: "articles",
          depth: 0,
          pagination: false,
          limit: 500,
          overrideAccess: true,
        })
      : { docs: [] };

  const results = [];

  if (slot === "morning") {
    results.push(
      await publishOne({
        payload,
        collection: "articles",
        docs: articleDocs.docs,
        slot,
        nowIso,
      }),
    );
  }

  results.push(
    await publishOne({
      payload,
      collection: "calculators",
      docs: calculatorDocs.docs,
      slot,
      nowIso,
    }),
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        action: "publish-scheduled",
        slot,
        timezone,
        dryRun,
        executedAt: nowIso,
        results,
      },
      null,
      2,
    ),
  );
} finally {
  await payload.destroy();
}
