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

const getCliArg = (name) => {
  const prefix = `--${name}=`;
  const match = process.argv.find((argument) => argument.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
};

const limit = Number.parseInt(getCliArg("limit") ?? "15", 10);
const collectionFilter = getCliArg("collection");

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

const buildActionItems = (doc, type) => {
  const checklist = asRecord(doc.editorialChecklist);
  const aiDraft = asRecord(doc.aiDraft);
  const editorialStatus = asString(doc.editorialStatus) || "draft";
  const items = [];

  if (!["approved", "scheduled", "published"].includes(editorialStatus)) {
    items.push(`editorial status: ${editorialStatus} -> approved/scheduled`);
  }

  if (type === "articles") {
    const reviewStatus = asString(aiDraft.reviewStatus) || "draft";
    if (!["reviewed", "published"].includes(reviewStatus)) {
      items.push(`review editorial: ${reviewStatus}`);
    }
  }

  if (!asBoolean(checklist.schemaValidated)) {
    items.push("schema validata");
  }
  if (!asBoolean(checklist.finalReviewDone)) {
    items.push("review final gata");
  }
  if (!asBoolean(checklist.publishReady)) {
    items.push("publish ready");
  }

  return items;
};

const mapDoc = (doc, collection) => {
  const schedule = asRecord(doc.publishingSchedule);
  return {
    collection,
    title: asString(doc.title),
    slug: asString(doc.slug),
    editorialStatus: asString(doc.editorialStatus),
    priority: Number(schedule.priority ?? 999),
    slot: asString(schedule.slot),
    earliestAt: asString(schedule.earliestAt),
    actionItems: buildActionItems(doc, collection),
  };
};

await loadEnvFile();
await patchPayloadLoadEnvInterop();

const configPath = process.env.PAYLOAD_CONFIG_PATH
  ? path.resolve(rootDir, process.env.PAYLOAD_CONFIG_PATH)
  : path.join(rootDir, "src", "cms.config.ts");

console.log(`[queue-worklist] Loading config from ${configPath}`);

const importedConfig = await import(pathToFileURL(configPath).href);
const config = await (importedConfig.default ?? importedConfig);
config.telemetry = false;

const payload = await getPayload({ config });

try {
  const docs = [];

  if (!collectionFilter || collectionFilter === "calculators") {
    const calculators = await payload.find({
      collection: "calculators",
      depth: 0,
      pagination: false,
      limit: 500,
      overrideAccess: true,
    });
    docs.push(...calculators.docs.map((doc) => mapDoc(doc, "calculators")));
  }

  if (!collectionFilter || collectionFilter === "articles") {
    const articles = await payload.find({
      collection: "articles",
      depth: 0,
      pagination: false,
      limit: 500,
      overrideAccess: true,
    });
    docs.push(...articles.docs.map((doc) => mapDoc(doc, "articles")));
  }

  const queuedDocs = docs
    .filter((doc) => ["approved", "scheduled"].includes(doc.editorialStatus))
    .sort((left, right) => left.priority - right.priority)
    .slice(0, Math.max(1, limit));

  console.log(
    JSON.stringify(
      {
        ok: true,
        action: "queue-worklist",
        limit,
        collection: collectionFilter ?? "all",
        items: queuedDocs,
      },
      null,
      2,
    ),
  );
} finally {
  await payload.destroy();
}
