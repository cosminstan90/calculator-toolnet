import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { getPayload } from "payload";

import { LAUNCH_PLAN_DAYS, LAUNCH_PLAN_TIMEZONE } from "../src/lib/launch-plan.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const dryRun = process.argv.includes("--dry-run");

const getCliArg = (name) => {
  const prefix = `--${name}=`;
  const match = process.argv.find((argument) => argument.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
};

const limit = Number.parseInt(getCliArg("limit") ?? "15", 10);

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
    // Best effort only.
  }
};

const buildPreparedChecklist = (doc) => {
  const checklist = asRecord(doc.editorialChecklist);

  return {
    ...checklist,
    strategyValidated: true,
    coreContentReady: true,
    examplesReady: true,
    faqReady: true,
    seoReady: true,
    internalLinksReady: true,
    schemaValidated: checklist.schemaValidated === true,
    finalReviewDone: checklist.finalReviewDone === true,
    publishReady: checklist.publishReady === true,
  };
};

const buildArticleUpdate = (doc) => {
  const aiDraft = asRecord(doc.aiDraft);

  return {
    editorialStatus:
      asString(doc._status) === "published"
        ? "published"
        : ["approved", "scheduled", "published"].includes(asString(doc.editorialStatus))
          ? asString(doc.editorialStatus)
          : "scheduled",
    editorialChecklist: buildPreparedChecklist(doc),
    aiDraft: {
      ...aiDraft,
      reviewStatus:
        asString(aiDraft.reviewStatus) === "draft"
          ? "in_review"
          : asString(aiDraft.reviewStatus) || "draft",
    },
  };
};

const buildCalculatorUpdate = (doc) => ({
  editorialStatus:
    asString(doc._status) === "published"
      ? "published"
      : ["approved", "scheduled", "published"].includes(asString(doc.editorialStatus))
        ? asString(doc.editorialStatus)
        : "scheduled",
  editorialChecklist: buildPreparedChecklist(doc),
});

const summarizePreparedDoc = (collection, key, title, data) => ({
  collection,
  key,
  title,
  editorialStatus: asString(data.editorialStatus),
  reviewStatus:
    collection === "articles"
      ? asString(asRecord(data.aiDraft).reviewStatus)
      : undefined,
  checklist: {
    strategyValidated: asRecord(data.editorialChecklist).strategyValidated === true,
    coreContentReady: asRecord(data.editorialChecklist).coreContentReady === true,
    examplesReady: asRecord(data.editorialChecklist).examplesReady === true,
    faqReady: asRecord(data.editorialChecklist).faqReady === true,
    seoReady: asRecord(data.editorialChecklist).seoReady === true,
    internalLinksReady: asRecord(data.editorialChecklist).internalLinksReady === true,
    schemaValidated: asRecord(data.editorialChecklist).schemaValidated === true,
    finalReviewDone: asRecord(data.editorialChecklist).finalReviewDone === true,
    publishReady: asRecord(data.editorialChecklist).publishReady === true,
  },
});

await loadEnvFile();
await patchPayloadLoadEnvInterop();

const configPath = process.env.PAYLOAD_CONFIG_PATH
  ? path.resolve(rootDir, process.env.PAYLOAD_CONFIG_PATH)
  : path.join(rootDir, "src", "cms.config.ts");

console.log(`[launch-plan-prepare] Loading config from ${configPath}`);

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

  const orderedItems = [];
  for (const day of LAUNCH_PLAN_DAYS) {
    orderedItems.push(
      { collection: "articles", key: day.morning.articleSlug },
      { collection: "calculators", key: day.morning.calculatorKey },
      { collection: "calculators", key: day.evening.calculatorKey },
    );
  }

  const selectedItems = orderedItems.slice(0, Math.max(1, limit));
  const results = [];

  for (const item of selectedItems) {
    if (item.collection === "articles") {
      const doc = articleMap.get(item.key);
      if (!doc) {
        results.push({ collection: item.collection, key: item.key, status: "missing" });
        continue;
      }

      const data = buildArticleUpdate(doc);
      if (!dryRun) {
        await payload.update({
          collection: "articles",
          id: doc.id,
          overrideAccess: true,
          draft: asString(doc._status) !== "published",
          data,
        });
      }

      results.push({
        status: dryRun ? "dry-run" : "prepared",
        ...summarizePreparedDoc(item.collection, item.key, asString(doc.title), data),
      });
      continue;
    }

    const doc = calculatorMap.get(item.key);
    if (!doc) {
      results.push({ collection: item.collection, key: item.key, status: "missing" });
      continue;
    }

    const data = buildCalculatorUpdate(doc);
    if (!dryRun) {
      await payload.update({
        collection: "calculators",
        id: doc.id,
        overrideAccess: true,
        draft: asString(doc._status) !== "published",
        data,
      });
    }

    results.push({
      status: dryRun ? "dry-run" : "prepared",
      ...summarizePreparedDoc(item.collection, item.key, asString(doc.title), data),
    });
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        action: "launch-plan-prepare",
        timezone: LAUNCH_PLAN_TIMEZONE,
        dryRun,
        limit,
        results,
      },
      null,
      2,
    ),
  );
} finally {
  await payload.destroy();
}
