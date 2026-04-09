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
          "    throw new TypeError(\"Could not resolve loadEnvConfig from @next/env\");",
          "}",
        ].join("\n"),
      );

    await fs.writeFile(loadEnvModulePath, patchedSource, "utf8");
  } catch {
    // noop
  }
};

const reviewedStatuses = new Set(["reviewed", "published"]);
const publishableEditorialStatuses = new Set(["approved", "scheduled"]);

const getChecklistSummary = (docs, type) => {
  const items = docs.map((doc) => {
    const checklist = asRecord(doc.editorialChecklist);
    const schedule = asRecord(doc.publishingSchedule);
    const aiDraft = asRecord(doc.aiDraft);

    return {
      id: String(doc.id),
      title: asString(doc.title),
      slug: asString(doc.slug),
      status: asString(doc._status) || "draft",
      editorialStatus: asString(doc.editorialStatus),
      reviewStatus: type === "articles" ? asString(aiDraft.reviewStatus) : undefined,
      publishReady: asBoolean(checklist.publishReady),
      schemaValidated: asBoolean(checklist.schemaValidated),
      finalReviewDone: asBoolean(checklist.finalReviewDone),
      slot: asString(schedule.slot),
      priority: Number(schedule.priority ?? 999),
      earliestAt: asString(schedule.earliestAt),
      publishedAt: asString(doc.publishedAt),
      updatedAt: asString(doc.updatedAt),
    };
  });

  const queued = items.filter(
    (item) => item.status !== "published" && publishableEditorialStatuses.has(item.editorialStatus)
  );

  const ready = queued.filter(
    (item) =>
      item.publishReady &&
      item.schemaValidated &&
      item.finalReviewDone &&
      (type !== "articles" || reviewedStatuses.has(item.reviewStatus ?? "draft"))
  );

  const blocked = queued.filter((item) => !ready.includes(item));

  return {
    total: docs.length,
    queued: queued.length,
    ready: ready.length,
    blocked: blocked.length,
    slotCounts: {
      morning: queued.filter((item) => item.slot === "morning").length,
      evening: queued.filter((item) => item.slot === "evening").length,
      none: queued.filter((item) => !item.slot || item.slot === "none").length,
    },
    topReady: ready
      .sort((left, right) => left.priority - right.priority)
      .slice(0, 5)
      .map((item) => ({
        title: item.title,
        slug: item.slug,
        slot: item.slot,
        priority: item.priority,
        earliestAt: item.earliestAt,
      })),
    topBlocked: blocked
      .sort((left, right) => left.priority - right.priority)
      .slice(0, 5)
      .map((item) => ({
        title: item.title,
        slug: item.slug,
        slot: item.slot,
        priority: item.priority,
        blockers: [
          !item.publishReady ? "publishReady:false" : null,
          !item.schemaValidated ? "schemaValidated:false" : null,
          !item.finalReviewDone ? "finalReviewDone:false" : null,
          type === "articles" && !reviewedStatuses.has(item.reviewStatus ?? "draft")
            ? `reviewStatus:${item.reviewStatus || "draft"}`
            : null,
        ].filter(Boolean),
      })),
  };
};

const summarizeAffiliateClicks = (docs) => {
  const now = Date.now();
  const last7Days = docs.filter((doc) => {
    const createdAt = asString(doc.createdAt);
    return createdAt && now - new Date(createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000;
  });

  const topOffers = new Map();
  for (const doc of last7Days) {
    const offerKey = asString(doc.offerKey) || "unknown";
    topOffers.set(offerKey, (topOffers.get(offerKey) ?? 0) + 1);
  }

  return {
    totalSampled: docs.length,
    last7Days: last7Days.length,
    topOffers: Array.from(topOffers.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([offerKey, clicks]) => ({ offerKey, clicks })),
  };
};

await loadEnvFile();
await patchPayloadLoadEnvInterop();

const configPath = process.env.PAYLOAD_CONFIG_PATH
  ? path.resolve(rootDir, process.env.PAYLOAD_CONFIG_PATH)
  : path.join(rootDir, "src", "cms.config.ts");

console.log(`[ops-report] Loading config from ${configPath}`);

const importedConfig = await import(pathToFileURL(configPath).href);
const config = await (importedConfig.default ?? importedConfig);
config.telemetry = false;

const payload = await getPayload({ config });

try {
  const [
    categories,
    calculators,
    articles,
    redirects,
    notFoundEvents,
    affiliateClicks,
    recentCalculators,
    recentArticles,
  ] = await Promise.all([
    payload.find({ collection: "calculator-categories", limit: 1, pagination: false, draft: false }),
    payload.find({ collection: "calculators", limit: 500, pagination: false, draft: true, depth: 0, overrideAccess: true }),
    payload.find({ collection: "articles", limit: 500, pagination: false, draft: true, depth: 0, overrideAccess: true }),
    payload.find({ collection: "redirects", limit: 1, pagination: false, draft: false, depth: 0, overrideAccess: true }),
    payload.find({
      collection: "not-found-events",
      limit: 20,
      pagination: false,
      draft: false,
      depth: 0,
      overrideAccess: true,
      sort: "-hits",
    }),
    payload.find({
      collection: "affiliate-click-events",
      limit: 200,
      pagination: false,
      draft: false,
      depth: 0,
      overrideAccess: true,
      sort: "-createdAt",
    }),
    payload.find({
      collection: "calculators",
      limit: 5,
      pagination: false,
      draft: false,
      depth: 0,
      overrideAccess: true,
      sort: "-publishedAt",
    }),
    payload.find({
      collection: "articles",
      limit: 5,
      pagination: false,
      draft: false,
      depth: 0,
      overrideAccess: true,
      sort: "-publishedAt",
    }),
  ]);

  const report = {
    ok: true,
    action: "ops-report",
    checkedAt: new Date().toISOString(),
    counts: {
      categories: categories.totalDocs,
      calculators: calculators.totalDocs,
      articles: articles.totalDocs,
      redirects: redirects.totalDocs,
      notFoundEvents: notFoundEvents.totalDocs,
      affiliateClickEvents: affiliateClicks.totalDocs,
    },
    publishingQueue: {
      calculators: getChecklistSummary(calculators.docs, "calculators"),
      articles: getChecklistSummary(articles.docs, "articles"),
    },
    recentPublishing: {
      calculators: recentCalculators.docs.map((doc) => ({
        title: asString(doc.title),
        slug: asString(doc.slug),
        publishedAt: asString(doc.publishedAt),
      })),
      articles: recentArticles.docs.map((doc) => ({
        title: asString(doc.title),
        slug: asString(doc.slug),
        publishedAt: asString(doc.publishedAt),
      })),
    },
    topNotFounds: notFoundEvents.docs.map((doc) => ({
      path: asString(doc.path),
      hits: Number(doc.hits ?? 0),
      lastSeenAt: asString(doc.lastSeenAt),
      source: asString(doc.source),
    })),
    affiliateClicks: summarizeAffiliateClicks(affiliateClicks.docs),
  };

  console.log(JSON.stringify(report, null, 2));
} finally {
  await payload.destroy();
}
