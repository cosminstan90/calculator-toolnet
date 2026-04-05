import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { getPayload } from "payload";

import { LAUNCH_PLAN_DAYS, LAUNCH_PLAN_TIMEZONE } from "../src/lib/launch-plan.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const checklistKeys = [
  "strategyValidated",
  "coreContentReady",
  "examplesReady",
  "faqReady",
  "seoReady",
  "internalLinksReady",
  "schemaValidated",
  "finalReviewDone",
  "publishReady",
];

const checklistLabels = {
  strategyValidated: "strategie/formula validate",
  coreContentReady: "continut principal gata",
  examplesReady: "exemple gata",
  faqReady: "faq gata",
  seoReady: "seo gata",
  internalLinksReady: "linkuri interne gata",
  schemaValidated: "schema validata",
  finalReviewDone: "review final gata",
  publishReady: "publish ready",
};

const asRecord = (value) =>
  value && typeof value === "object" ? value : {};

const asString = (value) => (typeof value === "string" ? value : "");

const asBoolean = (value) => value === true;

const getCliArg = (name) => {
  const prefix = `--${name}=`;
  const match = process.argv.find((argument) => argument.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
};

const limit = Number.parseInt(getCliArg("limit") ?? "15", 10);

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

const getMissingChecklistItems = (doc) => {
  const checklist = asRecord(doc.editorialChecklist);

  return checklistKeys
    .filter((key) => !asBoolean(checklist[key]))
    .map((key) => checklistLabels[key] ?? key);
};

const buildFocusItem = ({ collection, key, date, slot, doc }) => {
  if (!doc) {
    return {
      date,
      slot,
      collection,
      key,
      title: "",
      status: "missing",
      actionItems: ["document lipsa in CMS"],
    };
  }

  const actionItems = [];
  const reviewStatus = asString(asRecord(doc.aiDraft).reviewStatus) || "draft";
  const missingChecklist = getMissingChecklistItems(doc);

  if (collection === "articles" && !["reviewed", "published"].includes(reviewStatus)) {
    actionItems.push(`review editorial: ${reviewStatus}`);
  }

  if (!["approved", "scheduled", "published"].includes(asString(doc.editorialStatus))) {
    actionItems.push(`editorial status: ${asString(doc.editorialStatus) || "draft"} -> approved/scheduled`);
  }

  actionItems.push(...missingChecklist);

  return {
    date,
    slot,
    collection,
    key,
    title: asString(doc.title),
    status: actionItems.length === 0 ? "ready" : "needs-work",
    actionItems,
  };
};

await loadEnvFile();
await patchPayloadLoadEnvInterop();

const configPath = process.env.PAYLOAD_CONFIG_PATH
  ? path.resolve(rootDir, process.env.PAYLOAD_CONFIG_PATH)
  : path.join(rootDir, "src", "cms.config.ts");

console.log(`[launch-plan-focus] Loading config from ${configPath}`);

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
      buildFocusItem({
        date: day.date,
        slot: "08:00",
        collection: "articles",
        key: day.morning.articleSlug,
        doc: articleMap.get(day.morning.articleSlug),
      }),
      buildFocusItem({
        date: day.date,
        slot: "08:00",
        collection: "calculators",
        key: day.morning.calculatorKey,
        doc: calculatorMap.get(day.morning.calculatorKey),
      }),
      buildFocusItem({
        date: day.date,
        slot: "17:00",
        collection: "calculators",
        key: day.evening.calculatorKey,
        doc: calculatorMap.get(day.evening.calculatorKey),
      }),
    );
  }

  const focusItems = orderedItems.slice(0, Math.max(1, limit));

  console.log(
    JSON.stringify(
      {
        ok: true,
        action: "launch-plan-focus",
        timezone: LAUNCH_PLAN_TIMEZONE,
        limit,
        items: focusItems,
      },
      null,
      2,
    ),
  );
} finally {
  await payload.destroy();
}
