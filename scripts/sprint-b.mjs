import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { getPayload } from "payload";

import {
  SPRINT_B_30_PAGE_ROADMAP,
  SPRINT_B_CLUSTERS,
  SPRINT_B_GLOBAL_GAPS,
} from "../src/lib/seo-roadmap.ts";
import { summarizeNotFounds } from "../src/lib/not-found-analysis.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const asRecord = (value) => (value && typeof value === "object" ? value : {});
const asString = (value) => (typeof value === "string" ? value : "");
const asBoolean = (value) => value === true;
const asNumber = (value) =>
  typeof value === "number" ? value : Number.parseInt(String(value ?? "0"), 10) || 0;

const getCliArg = (name) => {
  const prefix = `--${name}=`;
  const match = process.argv.find((argument) => argument.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
};

const limit = Number.parseInt(getCliArg("limit") ?? "30", 10);

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

const getRelationID = (value) => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object" && "id" in value) {
    return String(value.id);
  }

  return "";
};

const getChecklistBlockers = (doc, collection) => {
  const checklist = asRecord(doc.editorialChecklist);
  const aiDraft = asRecord(doc.aiDraft);
  const editorialStatus = asString(doc.editorialStatus) || "draft";
  const blockers = [];

  if (!["approved", "scheduled", "published"].includes(editorialStatus)) {
    blockers.push(`editorial status: ${editorialStatus}`);
  }

  if (collection === "articles") {
    const reviewStatus = asString(aiDraft.reviewStatus) || "draft";
    if (!["reviewed", "published"].includes(reviewStatus)) {
      blockers.push(`review editorial: ${reviewStatus}`);
    }
  }

  if (!asBoolean(checklist.schemaValidated)) blockers.push("schema validata");
  if (!asBoolean(checklist.finalReviewDone)) blockers.push("review final gata");
  if (!asBoolean(checklist.publishReady)) blockers.push("publish ready");

  return blockers;
};

const isReadyNow = (doc, collection) => getChecklistBlockers(doc, collection).length === 0;

const mapDoc = (doc, collection, categoriesByID) => {
  const schedule = asRecord(doc.publishingSchedule);
  const categoryID =
    collection === "calculators"
      ? getRelationID(doc.category)
      : getRelationID(doc.relatedCategory);
  const category = categoryID ? categoriesByID.get(categoryID) : undefined;

  return {
    id: String(doc.id),
    collection,
    title: asString(doc.title),
    slug: asString(doc.slug),
    status: asString(doc._status) || "draft",
    editorialStatus: asString(doc.editorialStatus) || "draft",
    completion: asNumber(doc.editorialCompletion),
    batch: asString(doc.releaseBatch) || "fara-batch",
    categorySlug: category?.slug ?? "",
    categoryName: category?.name ?? "",
    priority: asNumber(schedule.priority) || 999,
    slot: asString(schedule.slot) || "none",
    earliestAt: asString(schedule.earliestAt),
    blockers: getChecklistBlockers(doc, collection),
    readyNow: isReadyNow(doc, collection),
    published: asString(doc._status) === "published" || asString(doc.editorialStatus) === "published",
  };
};

const sortByPriority = (items) =>
  [...items].sort((left, right) => {
    if (left.priority !== right.priority) return left.priority - right.priority;
    if (left.readyNow !== right.readyNow) return Number(right.readyNow) - Number(left.readyNow);
    return left.title.localeCompare(right.title);
  });

const annotateRoadmapPage = (page, docsBySlug, categoriesBySlug) => {
  if (page.kind === "hub") {
    const category = categoriesBySlug.get(page.slug);
    return {
      ...page,
      exists: Boolean(category),
      status: category ? "existing-hub" : "missing-hub",
      href: category ? `/calculatoare/${page.slug}` : undefined,
    };
  }

  const doc = docsBySlug.get(page.slug);
  return {
    ...page,
    exists: Boolean(doc),
    status: doc
      ? doc.published
        ? "published"
        : doc.readyNow
          ? "ready-now"
          : "blocked"
      : "missing",
    collection: doc?.collection,
    editorialStatus: doc?.editorialStatus,
    completion: doc?.completion,
    blockers: doc?.blockers ?? [],
    href: doc
      ? doc.collection === "calculators"
        ? `/calculatoare/${doc.categorySlug}/${doc.slug}`
        : `/blog/${doc.slug}`
      : undefined,
  };
};

await loadEnvFile();
await patchPayloadLoadEnvInterop();

const configPath = process.env.PAYLOAD_CONFIG_PATH
  ? path.resolve(rootDir, process.env.PAYLOAD_CONFIG_PATH)
  : path.join(rootDir, "src", "cms.config.ts");

console.log(`[sprint-b] Loading config from ${configPath}`);

const importedConfig = await import(pathToFileURL(configPath).href);
const config = await (importedConfig.default ?? importedConfig);
config.telemetry = false;

const payload = await getPayload({ config });

try {
  const [categories, calculators, articles, notFoundEvents] = await Promise.all([
    payload.find({
      collection: "calculator-categories",
      draft: true,
      depth: 0,
      overrideAccess: true,
      pagination: false,
      limit: 100,
      sort: "sortOrder",
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
    payload.find({
      collection: "not-found-events",
      draft: false,
      depth: 0,
      overrideAccess: true,
      pagination: false,
      limit: 50,
      sort: "-hits",
    }),
  ]);

  const categoriesByID = new Map(
    categories.docs.map((doc) => [String(doc.id), { slug: asString(doc.slug), name: asString(doc.name) }]),
  );
  const categoriesBySlug = new Map(
    categories.docs.map((doc) => [asString(doc.slug), { id: String(doc.id), name: asString(doc.name) }]),
  );

  const mappedCalculators = calculators.docs.map((doc) => mapDoc(doc, "calculators", categoriesByID));
  const mappedArticles = articles.docs.map((doc) => mapDoc(doc, "articles", categoriesByID));
  const allDocs = [...mappedCalculators, ...mappedArticles];
  const docsBySlug = new Map(allDocs.map((doc) => [doc.slug, doc]));

  const clusterSummary = SPRINT_B_CLUSTERS.map((cluster) => {
    const clusterCalculators = mappedCalculators.filter((doc) => doc.categorySlug === cluster.slug);
    const clusterArticles = mappedArticles.filter((doc) => doc.categorySlug === cluster.slug);
    const presentCalculatorSlugs = new Set(clusterCalculators.map((doc) => doc.slug));
    const presentArticleSlugs = new Set(clusterArticles.map((doc) => doc.slug));
    const readyDocs = sortByPriority(
      [...clusterCalculators, ...clusterArticles].filter((doc) => doc.readyNow && !doc.published),
    ).slice(0, 6);
    const blockedClose = sortByPriority(
      [...clusterCalculators, ...clusterArticles].filter(
        (doc) => !doc.readyNow && doc.blockers.length <= 2 && !doc.published,
      ),
    ).slice(0, 6);

    return {
      slug: cluster.slug,
      label: cluster.label,
      audience: cluster.audience,
      businessGoal: cluster.businessGoal,
      primaryIntent: cluster.primaryIntent,
      priorityQuestions: cluster.priorityQuestions,
      commercialAngles: cluster.commercialAngles,
      linkingRules: cluster.linkingRules,
      coverage: {
        calculatorsPresent: cluster.coreCalculators.filter((slug) => presentCalculatorSlugs.has(slug)).length,
        calculatorsTarget: cluster.coreCalculators.length,
        articlesPresent: cluster.coreArticles.filter((slug) => presentArticleSlugs.has(slug)).length,
        articlesTarget: cluster.coreArticles.length,
      },
      missingCoreCalculators: cluster.coreCalculators.filter((slug) => !presentCalculatorSlugs.has(slug)),
      missingCoreArticles: cluster.coreArticles.filter((slug) => !presentArticleSlugs.has(slug)),
      live: {
        calculators: clusterCalculators.filter((doc) => doc.published).length,
        articles: clusterArticles.filter((doc) => doc.published).length,
      },
      ready: {
        calculators: clusterCalculators.filter((doc) => doc.readyNow && !doc.published).length,
        articles: clusterArticles.filter((doc) => doc.readyNow && !doc.published).length,
      },
      nextReadyDocs: readyDocs.map((doc) => ({
        collection: doc.collection,
        title: doc.title,
        slug: doc.slug,
        priority: doc.priority,
        slot: doc.slot,
      })),
      blockedButClose: blockedClose.map((doc) => ({
        collection: doc.collection,
        title: doc.title,
        slug: doc.slug,
        blockers: doc.blockers,
      })),
    };
  });

  const roadmap = SPRINT_B_30_PAGE_ROADMAP.map((page) =>
    annotateRoadmapPage(page, docsBySlug, categoriesBySlug),
  );

  const notFoundSummary = summarizeNotFounds(
    notFoundEvents.docs.map((doc) => ({
      path: asString(doc.path),
      hits: asNumber(doc.hits),
      source: asString(doc.source),
      lastSeenAt: asString(doc.lastSeenAt),
    })),
  );

  const nextSevenDays = roadmap
    .filter((page) => page.status === "ready-now" || page.status === "blocked")
    .slice(0, Math.max(1, Math.min(limit, 12)));

  console.log(
    JSON.stringify(
      {
        ok: true,
        action: "sprint-b",
        checkedAt: new Date().toISOString(),
        summary: {
          clusters: clusterSummary.length,
          readyNow: allDocs.filter((doc) => doc.readyNow && !doc.published).length,
          published: allDocs.filter((doc) => doc.published).length,
          roadmapPages: roadmap.length,
        },
        clusters: clusterSummary,
        roadmap: roadmap.slice(0, Math.max(1, limit)),
        nextSevenDays,
        globalContentGaps: {
          from404: notFoundSummary.topContentGaps,
          strategic: SPRINT_B_GLOBAL_GAPS,
        },
        internalLinkingPriorities: SPRINT_B_CLUSTERS.map((cluster) => ({
          cluster: cluster.slug,
          hubPaths: cluster.hubPaths,
          supportPages: cluster.supportPages,
          linkingRules: cluster.linkingRules,
        })),
      },
      null,
      2,
    ),
  );
} finally {
  await payload.destroy();
}
