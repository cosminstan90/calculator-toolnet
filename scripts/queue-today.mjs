import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { getPayload } from "payload";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const asRecord = (value) => (value && typeof value === "object" ? value : {});
const asString = (value) => (typeof value === "string" ? value : "");
const asBoolean = (value) => value === true;
const asNumber = (value) =>
  typeof value === "number" ? value : Number.parseInt(String(value ?? "0"), 10) || 0;

const reviewedStatuses = new Set(["reviewed", "published"]);

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
    // noop
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
  } catch {
    // noop
  }
};

const buildActionItems = (doc, collection) => {
  const checklist = asRecord(doc.editorialChecklist);
  const aiDraft = asRecord(doc.aiDraft);
  const editorialStatus = asString(doc.editorialStatus) || "draft";
  const items = [];

  if (!["approved", "scheduled", "published"].includes(editorialStatus)) {
    items.push(`editorial status: ${editorialStatus} -> approved/scheduled`);
  }

  if (collection === "articles") {
    const reviewStatus = asString(aiDraft.reviewStatus) || "draft";
    if (!reviewedStatuses.has(reviewStatus)) {
      items.push(`review editorial: ${reviewStatus}`);
    }
  }

  if (!asBoolean(checklist.schemaValidated)) items.push("schema validata");
  if (!asBoolean(checklist.finalReviewDone)) items.push("review final gata");
  if (!asBoolean(checklist.publishReady)) items.push("publish ready");

  return items;
};

const mapDoc = (doc, collection) => {
  const schedule = asRecord(doc.publishingSchedule);
  const aiDraft = asRecord(doc.aiDraft);

  return {
    collection,
    title: asString(doc.title),
    slug: asString(doc.slug),
    status: asString(doc._status) || "draft",
    editorialStatus: asString(doc.editorialStatus) || "draft",
    reviewStatus: collection === "articles" ? asString(aiDraft.reviewStatus) || "draft" : undefined,
    completion: asNumber(doc.editorialCompletion),
    slot: asString(schedule.slot) || "none",
    priority: asNumber(schedule.priority) || 999,
    earliestAt: asString(schedule.earliestAt),
    actionItems: buildActionItems(doc, collection),
  };
};

const sortByPriority = (items) =>
  [...items].sort((left, right) => {
    if (left.priority !== right.priority) return left.priority - right.priority;
    return left.title.localeCompare(right.title);
  });

await loadEnvFile();
await patchPayloadLoadEnvInterop();

const configPath = process.env.PAYLOAD_CONFIG_PATH
  ? path.resolve(rootDir, process.env.PAYLOAD_CONFIG_PATH)
  : path.join(rootDir, "src", "cms.config.ts");

console.log(`[queue-today] Loading config from ${configPath}`);

const importedConfig = await import(pathToFileURL(configPath).href);
const config = await (importedConfig.default ?? importedConfig);
config.telemetry = false;

const payload = await getPayload({ config });

try {
  const [calculators, articles] = await Promise.all([
    payload.find({
      collection: "calculators",
      depth: 0,
      draft: true,
      pagination: false,
      limit: 500,
      overrideAccess: true,
    }),
    payload.find({
      collection: "articles",
      depth: 0,
      draft: true,
      pagination: false,
      limit: 500,
      overrideAccess: true,
    }),
  ]);

  const docs = [
    ...calculators.docs.map((doc) => mapDoc(doc, "calculators")),
    ...articles.docs.map((doc) => mapDoc(doc, "articles")),
  ].filter((doc) => doc.status !== "published" && ["approved", "scheduled"].includes(doc.editorialStatus));

  const ready = docs.filter((doc) => doc.actionItems.length === 0);
  const blocked = docs.filter((doc) => doc.actionItems.length > 0);

  const morningArticle = sortByPriority(
    ready.filter((doc) => doc.collection === "articles" && doc.slot === "morning"),
  )[0];
  const morningCalculator = sortByPriority(
    ready.filter((doc) => doc.collection === "calculators" && doc.slot === "morning"),
  )[0];
  const eveningCalculator = sortByPriority(
    ready.filter((doc) => doc.collection === "calculators" && doc.slot === "evening"),
  )[0];

  const closeToReady = sortByPriority(
    blocked.filter((doc) => doc.actionItems.length <= 2),
  ).slice(0, 6);

  const editorialReviewQueue = sortByPriority(
    blocked.filter(
      (doc) =>
        doc.collection === "articles" &&
        (doc.reviewStatus === "draft" || doc.reviewStatus === "in_review"),
    ),
  ).slice(0, 6);

  console.log(
    JSON.stringify(
      {
        ok: true,
        action: "queue-today",
        checkedAt: new Date().toISOString(),
        timezone: "Europe/Bucharest",
        today: {
          morningArticle,
          morningCalculator,
          eveningCalculator,
        },
        closeToReady,
        editorialReviewQueue,
        suggestedRoutine: [
          "ruleaza ops:ops-report",
          "ruleaza ops:queue-worklist -- --limit=20",
          "valideaza lotul ready now",
          "ruleaza ops:queue-complete pentru documentele revizuite",
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await payload.destroy();
}
