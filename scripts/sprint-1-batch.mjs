import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { getPayload } from "payload";

import { SPRINT_B_30_PAGE_ROADMAP } from "../src/lib/seo-roadmap.ts";
import { SPRINT_1_CLUSTERS } from "../src/lib/sprint-1.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const asRecord = (value) => (value && typeof value === "object" ? value : {});
const asString = (value) => (typeof value === "string" ? value : "");
const asBoolean = (value) => value === true;

const getRelationID = (value) => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object" && "id" in value) {
    return String(value.id);
  }

  return "";
};

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
  const loadEnvModulePath = path.join(rootDir, "node_modules", "payload", "dist", "bin", "loadEnv.js");

  try {
    const source = await fs.readFile(loadEnvModulePath, "utf8");
    if (source.includes("nextEnvImportNs.loadEnvConfig")) return;

    const patchedSource = source
      .replace("import nextEnvImport from '@next/env';", "import * as nextEnvImportNs from '@next/env';")
      .replace(
        "const { loadEnvConfig } = nextEnvImport;",
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

const getChecklistBlockers = (doc, collection) => {
  const checklist = asRecord(doc.editorialChecklist);
  const aiDraft = asRecord(doc.aiDraft);
  const blockers = [];

  if (!["approved", "scheduled", "published"].includes(asString(doc.editorialStatus))) {
    blockers.push(`editorial status: ${asString(doc.editorialStatus) || "draft"}`);
  }
  if (collection === "articles" && !["reviewed", "published"].includes(asString(aiDraft.reviewStatus))) {
    blockers.push(`review editorial: ${asString(aiDraft.reviewStatus) || "draft"}`);
  }
  if (!asBoolean(checklist.schemaValidated)) blockers.push("schema validata");
  if (!asBoolean(checklist.finalReviewDone)) blockers.push("review final gata");
  if (!asBoolean(checklist.publishReady)) blockers.push("publish ready");
  return blockers;
};

await loadEnvFile();
await patchPayloadLoadEnvInterop();

const configPath = process.env.PAYLOAD_CONFIG_PATH
  ? path.resolve(rootDir, process.env.PAYLOAD_CONFIG_PATH)
  : path.join(rootDir, "src", "cms.config.ts");

console.log(`[sprint-1-batch] Loading config from ${configPath}`);

const importedConfig = await import(pathToFileURL(configPath).href);
const config = await (importedConfig.default ?? importedConfig);
config.telemetry = false;

const payload = await getPayload({ config });

try {
  const [categories, calculators, articles] = await Promise.all([
    payload.find({
      collection: "calculator-categories",
      draft: true,
      depth: 0,
      overrideAccess: true,
      pagination: false,
      limit: 100,
    }),
    payload.find({
      collection: "calculators",
      draft: true,
      depth: 0,
      overrideAccess: true,
      pagination: false,
      limit: 500,
    }),
    payload.find({
      collection: "articles",
      draft: true,
      depth: 0,
      overrideAccess: true,
      pagination: false,
      limit: 500,
    }),
  ]);

  const categoryByID = new Map(
    categories.docs.map((doc) => [String(doc.id), { slug: asString(doc.slug), name: asString(doc.name) }]),
  );

  const tier1 = SPRINT_B_30_PAGE_ROADMAP.filter(
    (page) => page.priorityTier === "tier-1" && SPRINT_1_CLUSTERS.includes(page.cluster),
  );

  const docs = [
    ...calculators.docs.map((doc) => {
      const category = categoryByID.get(getRelationID(doc.category));
      return {
        slug: asString(doc.slug),
        title: asString(doc.title),
        kind: "calculator",
        cluster: category?.slug ?? "",
        status:
          asString(doc._status) === "published" || asString(doc.editorialStatus) === "published"
            ? "published"
            : getChecklistBlockers(doc, "calculators").length === 0
              ? "ready-now"
              : "blocked",
        blockers: getChecklistBlockers(doc, "calculators"),
      };
    }),
    ...articles.docs.map((doc) => {
      const category = categoryByID.get(getRelationID(doc.relatedCategory));
      return {
        slug: asString(doc.slug),
        title: asString(doc.title),
        kind: "article",
        cluster: category?.slug ?? "",
        status:
          asString(doc._status) === "published" || asString(doc.editorialStatus) === "published"
            ? "published"
            : getChecklistBlockers(doc, "articles").length === 0
              ? "ready-now"
              : "blocked",
        blockers: getChecklistBlockers(doc, "articles"),
      };
    }),
  ];

  const docsBySlug = new Map(docs.map((doc) => [doc.slug, doc]));

  const clusters = SPRINT_1_CLUSTERS.map((cluster) => {
    const pages = tier1.filter((page) => page.cluster === cluster);
    const resolved = pages.map((page) => ({
      ...page,
      ...(docsBySlug.get(page.slug) ?? { status: page.kind === "hub" ? "missing-hub" : "missing", blockers: [] }),
    }));

    const readyNow = resolved.filter((page) => page.status === "ready-now");
    const blocked = resolved.filter((page) => page.status === "blocked");
    const published = resolved.filter((page) => page.status === "published");
    const missing = resolved.filter((page) => page.status === "missing" || page.status === "missing-hub");

    const queueCompleteTargets = readyNow
      .filter((item) => item.kind !== "hub")
      .reduce(
        (acc, item) => {
          if (item.kind === "calculator") acc.calculators.push(item.slug);
          if (item.kind === "article") acc.articles.push(item.slug);
          return acc;
        },
        { calculators: [], articles: [] },
      );

    return {
      cluster,
      totals: {
        tier1Pages: pages.length,
        readyNow: readyNow.length,
        blocked: blocked.length,
        published: published.length,
        missing: missing.length,
      },
      readyNow,
      blocked,
      published,
      missing,
      commands: {
        queueCompleteCalculators:
          queueCompleteTargets.calculators.length > 0
            ? `npm run ops:queue-complete -- --collection=calculators --slugs=${queueCompleteTargets.calculators.join(",")}`
            : undefined,
        queueCompleteArticles:
          queueCompleteTargets.articles.length > 0
            ? `npm run ops:queue-complete -- --collection=articles --slugs=${queueCompleteTargets.articles.join(",")}`
            : undefined,
      },
    };
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        action: "sprint-1-batch",
        checkedAt: new Date().toISOString(),
        clusters,
        nextMoves: clusters.flatMap((cluster) => [
          ...cluster.blocked.slice(0, 2).map((item) => `${cluster.cluster}: deblocheaza ${item.slug}`),
          ...cluster.missing.slice(0, 1).map((item) => `${cluster.cluster}: lipseste ${item.slug}`),
        ]).slice(0, 12),
      },
      null,
      2,
    ),
  );
} finally {
  await payload.destroy();
}
