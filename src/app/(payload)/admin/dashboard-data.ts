import type { Payload } from "payload";
import {
  SPRINT_B_30_PAGE_ROADMAP,
  SPRINT_B_CLUSTERS,
} from "../../../lib/seo-roadmap.ts";
import { summarizeNotFounds } from "../../../lib/not-found-analysis.ts";
import { EXECUTION_SPRINTS } from "../../../lib/execution-roadmap.ts";
import { SPRINT_3_CONTENT_RULES, SPRINT_3_TIER_2_TARGETS } from "../../../lib/sprint-3.ts";
import {
  SPRINT_4_CTA_SURFACES,
  SPRINT_4_MONEY_PAGE_PATTERNS,
  SPRINT_4_SUPPORT_PAGE_PATTERNS,
} from "../../../lib/sprint-4.ts";

type Sprint3ClusterSlug = keyof typeof SPRINT_3_TIER_2_TARGETS;

type QueueItem = {
  id: string;
  title: string;
  href: string;
  priority: number;
  earliestAt?: string;
  batch?: string;
};

type DraftInsight = {
  id: string;
  title: string;
  slug: string;
  href: string;
  type: "article" | "calculator";
  audience: string;
  completion: number;
  editorialStatus?: string;
  slot?: string;
  priority: number;
  batch?: string;
  earliestAt?: string;
  blockers: string[];
};

export type DashboardData = {
  metrics: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  morningArticle?: QueueItem;
  morningCalculator?: QueueItem;
  eveningCalculator?: QueueItem;
  topNotFound: Array<{
    id: string;
    path: string;
    hits: number;
    lastSeenAt?: string;
  }>;
  affiliateSummary: Array<{
    offerKey: string;
    clicks: number;
  }>;
  topAffiliateSources: Array<{
    sourcePath: string;
    clicks: number;
    sourceType?: string;
    offerKeys: string[];
  }>;
  topAffiliateCategories: Array<{
    categorySlug: string;
    clicks: number;
    audiences: string[];
  }>;
  readyToPublish: DraftInsight[];
  closeToReady: DraftInsight[];
  needsEditorialReview: DraftInsight[];
  blockedDrafts: DraftInsight[];
  blockerSummary: Array<{
    label: string;
    count: number;
  }>;
  todayChecklist: Array<{
    label: string;
    item?: QueueItem;
    description: string;
  }>;
  sprintB: {
    clusters: Array<{
      slug: string;
      label: string;
      readyCount: number;
      publishedCount: number;
      missingCorePages: number;
      nextPages: Array<{
        title: string;
        slug: string;
        kind: "hub" | "calculator" | "article";
        status: "published" | "ready-now" | "blocked" | "missing" | "existing-hub" | "missing-hub";
      }>;
    }>;
    roadmap: Array<{
      cluster: string;
      title: string;
      slug: string;
      kind: "hub" | "calculator" | "article";
      priorityTier: "tier-1" | "tier-2" | "tier-3";
      status: "published" | "ready-now" | "blocked" | "missing" | "existing-hub" | "missing-hub";
      href?: string;
    }>;
    contentGaps: Array<{
      path: string;
      hits: number;
      lastSeenAt?: string;
    }>;
  };
  sprint3: {
    contentRules: string[];
    clusters: Array<{
      slug: string;
      label: string;
      priorityTargets: Array<{
        slug: string;
        kind: "calculator" | "article";
        status: "published" | "ready-now" | "blocked" | "missing";
      }>;
      missingCoreCalculators: number;
      missingCoreArticles: number;
    }>;
  };
  sprint4: {
    ctaSurfaces: string[];
    moneyCandidates: Array<{
      slug: string;
      cluster: string;
      kind: "calculator" | "article";
      status: "published" | "ready-now" | "blocked" | "missing";
    }>;
    supportPages: Array<{
      slug: string;
      cluster: string;
      kind: "calculator" | "article";
      status: "published" | "ready-now" | "blocked" | "missing";
    }>;
  };
  executionRoadmap: {
    currentFocus: string;
    nextMoves: string[];
    sprints: Array<{
      id: "sprint-1" | "sprint-2" | "sprint-3" | "sprint-4";
      title: string;
      status: "not-started" | "in-progress" | "complete";
      goal: string;
      summary: Array<{ label: string; value: string }>;
      nextActions: string[];
    }>;
  };
  workflowSlices: {
    batches: Array<{ label: string; count: number }>;
    audiences: Array<{ label: string; count: number }>;
    statuses: Array<{ label: string; count: number }>;
    slots: Array<{ label: string; count: number }>;
  };
  recentPublished: Array<{
    id: string;
    title: string;
    href: string;
    type: "article" | "calculator";
    publishedAt?: string;
  }>;
};

type CollectionDoc = Record<string, unknown> & { id?: string | number };

const asString = (value: unknown) =>
  typeof value === "string" ? value : undefined;

const asNumber = (value: unknown) =>
  typeof value === "number" ? value : Number(value ?? 0);

const asBoolean = (value: unknown) => value === true;

const CHECKLIST_LABELS: Record<string, string> = {
  strategyValidated: "Formula sau angle",
  coreContentReady: "Continut principal",
  examplesReady: "Exemple",
  faqReady: "FAQ",
  seoReady: "SEO",
  internalLinksReady: "Linkuri interne",
  schemaValidated: "Schema",
  finalReviewDone: "Review final",
  publishReady: "Publish ready",
};

const getNested = (value: unknown, path: string[]) => {
  let current = value;
  for (const segment of path) {
    if (!current || typeof current !== "object") {
      return undefined;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current;
};

const getChecklistBlockers = (doc: CollectionDoc) => {
  const checklist = getNested(doc, ["editorialChecklist"]);
  const blockers: string[] = [];

  if (!checklist || typeof checklist !== "object") {
    return ["Checklist lipsa"];
  }

  for (const [key, label] of Object.entries(CHECKLIST_LABELS)) {
    if ((checklist as Record<string, unknown>)[key] !== true) {
      blockers.push(label);
    }
  }

  return blockers;
};

const getPublishBlockers = (doc: CollectionDoc, now: Date) => {
  const blockers = getChecklistBlockers(doc);
  const status = asString(doc.editorialStatus);
  const slot = asString(getNested(doc, ["publishingSchedule", "slot"]));
  const earliestAt = asString(getNested(doc, ["publishingSchedule", "earliestAt"]));
  const draftStatus = asString(doc._status);

  if (draftStatus !== "draft") {
    blockers.unshift("Nu mai este draft");
  }

  if (status !== "approved" && status !== "scheduled") {
    blockers.unshift("Status editorial");
  }

  if (!slot || slot === "none") {
    blockers.unshift("Slot scheduler");
  }

  if (earliestAt && new Date(earliestAt) > now) {
    blockers.unshift("Data minima");
  }

  return Array.from(new Set(blockers));
};

const isEligibleForAutopublish = (doc: CollectionDoc, now: Date) => {
  const status = asString(doc.editorialStatus);
  const draftStatus = asString(doc._status);
  const publishReady = asBoolean(getNested(doc, ["editorialChecklist", "publishReady"]));
  const earliestAt = asString(getNested(doc, ["publishingSchedule", "earliestAt"]));

  if (draftStatus !== "draft") {
    return false;
  }

  if (status !== "approved" && status !== "scheduled") {
    return false;
  }

  if (!publishReady) {
    return false;
  }

  if (earliestAt && new Date(earliestAt) > now) {
    return false;
  }

  return true;
};

const buildQueueItem = (
  adminRoute: string,
  collection: "articles" | "calculators",
  doc: CollectionDoc,
): QueueItem => ({
  id: String(doc.id ?? ""),
  title: asString(doc.title) ?? "Untitled",
  href: `${adminRoute === "/" ? "" : adminRoute}/collections/${collection}/${String(doc.id ?? "")}`,
  priority: asNumber(getNested(doc, ["publishingSchedule", "priority"])) || 999,
  earliestAt: asString(getNested(doc, ["publishingSchedule", "earliestAt"])),
  batch: asString(doc.releaseBatch),
});

const sortQueue = (items: QueueItem[]) =>
  [...items].sort((left, right) => {
    if (left.priority !== right.priority) {
      return left.priority - right.priority;
    }

    return (left.title || "").localeCompare(right.title || "");
  });

const buildDraftInsight = (
  adminRoute: string,
  collection: "articles" | "calculators",
  doc: CollectionDoc,
  now: Date,
): DraftInsight => ({
  id: String(doc.id ?? ""),
  title: asString(doc.title) ?? "Untitled",
  slug: asString(doc.slug) ?? "",
  href: `${adminRoute === "/" ? "" : adminRoute}/collections/${collection}/${String(doc.id ?? "")}`,
  type: collection === "articles" ? "article" : "calculator",
  audience: asString(doc.audience) ?? "both",
  completion: asNumber(doc.editorialCompletion) || 0,
  editorialStatus: asString(doc.editorialStatus),
  slot: asString(getNested(doc, ["publishingSchedule", "slot"])),
  priority: asNumber(getNested(doc, ["publishingSchedule", "priority"])) || 999,
  batch: asString(doc.releaseBatch),
  earliestAt: asString(getNested(doc, ["publishingSchedule", "earliestAt"])),
  blockers: getPublishBlockers(doc, now),
});

const sortDraftInsights = (items: DraftInsight[]) =>
  [...items].sort((left, right) => {
    if (left.completion !== right.completion) {
      return right.completion - left.completion;
    }

    if (left.priority !== right.priority) {
      return left.priority - right.priority;
    }

    return left.title.localeCompare(right.title);
  });

const buildCountList = (items: DraftInsight[], mapper: (item: DraftInsight) => string) =>
  Array.from(
    items.reduce((acc, item) => {
      const key = mapper(item);
      if (!key || key === "none") {
        return acc;
      }

      acc.set(key, (acc.get(key) ?? 0) + 1);
      return acc;
    }, new Map<string, number>()),
  )
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
    .slice(0, 8);

const relationID = (value: unknown) => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object" && "id" in (value as Record<string, unknown>)) {
    return String((value as Record<string, unknown>).id);
  }

  return undefined;
};

const classifyMonetization = (slug: string, title: string, kind: "hub" | "calculator" | "article") => {
  if (kind === "hub") return "traffic-page" as const;
  const haystack = `${slug} ${title}`.toLowerCase();

  if (SPRINT_4_MONEY_PAGE_PATTERNS.some((pattern) => haystack.includes(pattern))) {
    return "money-page-candidate" as const;
  }

  if (SPRINT_4_SUPPORT_PAGE_PATTERNS.some((pattern) => haystack.includes(pattern))) {
    return "support-page" as const;
  }

  return "traffic-page" as const;
};

export const loadDashboardData = async (
  payload: Payload,
  adminRoute: string,
): Promise<DashboardData> => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    calculatorsQueueResult,
    articlesQueueResult,
    notFoundResult,
    affiliateResult,
    recentArticlesResult,
    recentCalculatorsResult,
    articleCountResult,
    calculatorCountResult,
    draftArticlesResult,
    draftCalculatorsResult,
  ] = await Promise.all([
    payload.find({
      collection: "calculators",
      depth: 0,
      draft: true,
      overrideAccess: true,
      pagination: false,
      limit: 100,
      sort: "publishingSchedule.priority",
      where: {
        "publishingSchedule.slot": {
          in: ["morning", "evening"],
        },
      },
    }),
    payload.find({
      collection: "articles",
      depth: 0,
      draft: true,
      overrideAccess: true,
      pagination: false,
      limit: 100,
      sort: "publishingSchedule.priority",
      where: {
        "publishingSchedule.slot": {
          equals: "morning",
        },
      },
    }),
    payload.find({
      collection: "not-found-events",
      depth: 0,
      overrideAccess: true,
      pagination: false,
      limit: 5,
      sort: "-hits",
    }),
    payload.find({
      collection: "affiliate-click-events",
      depth: 0,
      overrideAccess: true,
      pagination: false,
      limit: 100,
      sort: "-createdAt",
    }).catch(() => ({ docs: [] as CollectionDoc[] })),
    payload.find({
      collection: "articles",
      depth: 0,
      overrideAccess: true,
      pagination: false,
      limit: 6,
      sort: "-publishedAt",
      where: {
        and: [
          { _status: { equals: "published" } },
          { publishedAt: { greater_than_equal: sevenDaysAgo } },
        ],
      },
    }),
    payload.find({
      collection: "calculators",
      depth: 0,
      overrideAccess: true,
      pagination: false,
      limit: 6,
      sort: "-publishedAt",
      where: {
        and: [
          { _status: { equals: "published" } },
          { publishedAt: { greater_than_equal: sevenDaysAgo } },
        ],
      },
    }),
    payload.find({
      collection: "articles",
      depth: 0,
      overrideAccess: true,
      limit: 1,
      where: {
        and: [
          { _status: { equals: "published" } },
          { publishedAt: { greater_than_equal: sevenDaysAgo } },
        ],
      },
    }),
    payload.find({
      collection: "calculators",
      depth: 0,
      overrideAccess: true,
      limit: 1,
      where: {
        and: [
          { _status: { equals: "published" } },
          { publishedAt: { greater_than_equal: sevenDaysAgo } },
        ],
      },
    }),
    payload.find({
      collection: "articles",
      depth: 0,
      draft: true,
      overrideAccess: true,
      pagination: false,
      limit: 30,
      sort: "-editorialCompletion",
      where: {
        _status: {
          equals: "draft",
        },
      },
    }),
    payload.find({
      collection: "calculators",
      depth: 0,
      draft: true,
      overrideAccess: true,
      pagination: false,
      limit: 30,
      sort: "-editorialCompletion",
      where: {
        _status: {
          equals: "draft",
        },
      },
    }),
  ]);

  const morningArticle = sortQueue(
    (articlesQueueResult.docs as CollectionDoc[])
      .filter((doc) => isEligibleForAutopublish(doc, now))
      .map((doc) => buildQueueItem(adminRoute, "articles", doc)),
  )[0];

  const morningCalculator = sortQueue(
    (calculatorsQueueResult.docs as CollectionDoc[])
      .filter(
        (doc) =>
          asString(getNested(doc, ["publishingSchedule", "slot"])) === "morning" &&
          isEligibleForAutopublish(doc, now),
      )
      .map((doc) => buildQueueItem(adminRoute, "calculators", doc)),
  )[0];

  const eveningCalculator = sortQueue(
    (calculatorsQueueResult.docs as CollectionDoc[])
      .filter(
        (doc) =>
          asString(getNested(doc, ["publishingSchedule", "slot"])) === "evening" &&
          isEligibleForAutopublish(doc, now),
      )
      .map((doc) => buildQueueItem(adminRoute, "calculators", doc)),
  )[0];

  const affiliateSummaryMap = new Map<string, number>();
  for (const doc of affiliateResult.docs as CollectionDoc[]) {
    const offerKey = asString(doc.offerKey);
    if (!offerKey) {
      continue;
    }

    affiliateSummaryMap.set(offerKey, (affiliateSummaryMap.get(offerKey) ?? 0) + 1);
  }

  const affiliateSummary = Array.from(affiliateSummaryMap.entries())
    .map(([offerKey, clicks]) => ({ offerKey, clicks }))
    .sort((left, right) => right.clicks - left.clicks)
    .slice(0, 5);

  const affiliateSourcesMap = new Map<
    string,
    { clicks: number; offerKeys: Set<string>; sourceType?: string }
  >();

  for (const doc of affiliateResult.docs as CollectionDoc[]) {
    const sourcePath = asString(doc.sourcePath);
    if (!sourcePath) {
      continue;
    }

    const current =
      affiliateSourcesMap.get(sourcePath) ??
      {
        clicks: 0,
        offerKeys: new Set<string>(),
        sourceType: asString(doc.sourceType),
      };

    current.clicks += 1;
    const offerKey = asString(doc.offerKey);
    if (offerKey) {
      current.offerKeys.add(offerKey);
    }
    if (!current.sourceType) {
      current.sourceType = asString(doc.sourceType);
    }

    affiliateSourcesMap.set(sourcePath, current);
  }

  const topAffiliateSources = Array.from(affiliateSourcesMap.entries())
    .map(([sourcePath, value]) => ({
      sourcePath,
      clicks: value.clicks,
      sourceType: value.sourceType,
      offerKeys: Array.from(value.offerKeys).sort(),
    }))
    .sort((left, right) => right.clicks - left.clicks)
    .slice(0, 5);

  const affiliateCategoriesMap = new Map<
    string,
    { clicks: number; audiences: Set<string> }
  >();

  for (const doc of affiliateResult.docs as CollectionDoc[]) {
    const categorySlug = asString(doc.categorySlug);
    if (!categorySlug) {
      continue;
    }

    const current =
      affiliateCategoriesMap.get(categorySlug) ??
      {
        clicks: 0,
        audiences: new Set<string>(),
      };

    current.clicks += 1;
    const audience = asString(doc.audience);
    if (audience) {
      current.audiences.add(audience);
    }

    affiliateCategoriesMap.set(categorySlug, current);
  }

  const topAffiliateCategories = Array.from(affiliateCategoriesMap.entries())
    .map(([categorySlug, value]) => ({
      categorySlug,
      clicks: value.clicks,
      audiences: Array.from(value.audiences).sort(),
    }))
    .sort((left, right) => right.clicks - left.clicks)
    .slice(0, 5);

  const draftInsights = sortDraftInsights([
    ...(draftArticlesResult.docs as CollectionDoc[]).map((doc) =>
      buildDraftInsight(adminRoute, "articles", doc, now),
    ),
    ...(draftCalculatorsResult.docs as CollectionDoc[]).map((doc) =>
      buildDraftInsight(adminRoute, "calculators", doc, now),
    ),
  ]);

  const clusterDraftInsights = draftInsights.map((item) => {
    const originalDoc =
      item.type === "calculator"
        ? (draftCalculatorsResult.docs as CollectionDoc[]).find((doc) => String(doc.id ?? "") === item.id)
        : (draftArticlesResult.docs as CollectionDoc[]).find((doc) => String(doc.id ?? "") === item.id);

    const categoryID =
      item.type === "calculator"
        ? relationID(originalDoc?.category)
        : relationID(originalDoc?.relatedCategory);

    return {
      ...item,
      categoryID,
      rawStatus:
        asString(originalDoc?._status) === "published" ||
        asString(originalDoc?.editorialStatus) === "published",
    };
  });

  const readyToPublish = draftInsights
    .filter((item) => item.blockers.length === 0)
    .slice(0, 6);

  const closeToReady = draftInsights
    .filter((item) => item.blockers.length > 0 && item.blockers.length <= 2)
    .slice(0, 6);

  const needsEditorialReview = draftInsights
    .filter(
      (item) =>
        item.type === "article" &&
        item.blockers.some((blocker) => blocker.includes("Review") || blocker.includes("review")),
    )
    .slice(0, 6);

  const blockedDrafts = draftInsights
    .filter((item) => item.blockers.length > 0 && item.completion >= 55)
    .slice(0, 6);

  const blockerCounts = new Map<string, number>();
  for (const item of draftInsights) {
    for (const blocker of item.blockers) {
      blockerCounts.set(blocker, (blockerCounts.get(blocker) ?? 0) + 1);
    }
  }

  const blockerSummary = Array.from(blockerCounts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 6);

  const workflowSlices = {
    batches: buildCountList(draftInsights, (item) => item.batch ?? "fara-batch"),
    audiences: buildCountList(draftInsights, (item) => item.audience),
    statuses: buildCountList(draftInsights, (item) => item.editorialStatus ?? "draft"),
    slots: buildCountList(draftInsights, (item) => item.slot ?? "none"),
  };

  const categoryDocsResult = await payload.find({
    collection: "calculator-categories",
    depth: 0,
    overrideAccess: true,
    pagination: false,
    limit: 100,
    draft: true,
  });

  const categorySlugByID = new Map(
    (categoryDocsResult.docs as CollectionDoc[]).map((doc) => [
      String(doc.id ?? ""),
      asString(doc.slug) ?? "",
    ]),
  );

  const sprintBClusterPages = clusterDraftInsights.map((item) => ({
    ...item,
    clusterSlug: item.categoryID ? (categorySlugByID.get(item.categoryID) ?? "") : "",
  }));

  const roadmap = SPRINT_B_30_PAGE_ROADMAP.map((page) => {
    if (page.kind === "hub") {
      const exists = (categoryDocsResult.docs as CollectionDoc[]).some(
        (doc) => asString(doc.slug) === page.slug,
      );
      return {
        cluster: page.cluster,
        title: page.title,
        slug: page.slug,
        kind: page.kind,
        priorityTier: page.priorityTier,
        status: exists ? ("existing-hub" as const) : ("missing-hub" as const),
        href: exists ? `/calculatoare/${page.slug}` : undefined,
      };
    }

    const matchingDraft = sprintBClusterPages.find((item) => item.slug === page.slug);
    const status = matchingDraft
      ? matchingDraft.rawStatus
        ? ("published" as const)
        : matchingDraft.blockers.length === 0
        ? ("ready-now" as const)
        : ("blocked" as const)
      : ("missing" as const);

    return {
      cluster: page.cluster,
      title: page.title,
      slug: page.slug,
      kind: page.kind,
      priorityTier: page.priorityTier,
      status,
      href: matchingDraft?.href,
    };
  });

  const notFoundSummary = summarizeNotFounds(
    (notFoundResult.docs as CollectionDoc[]).map((doc) => ({
      path: asString(doc.path) ?? "/",
      hits: asNumber(doc.hits) || 0,
      source: asString(doc.source),
      lastSeenAt: asString(doc.lastSeenAt),
    })),
  );

  const sprintBClusters = SPRINT_B_CLUSTERS.map((cluster) => {
    const clusterItems = sprintBClusterPages.filter((item) => item.clusterSlug === cluster.slug);
    const nextPages = roadmap
      .filter((page) => page.cluster === cluster.slug)
      .slice(0, 4);

    const presentSlugs = new Set(clusterItems.map((item) => item.slug));
    const missingCorePages =
      cluster.coreCalculators.filter((slug) => !presentSlugs.has(slug)).length +
      cluster.coreArticles.filter((slug) => !presentSlugs.has(slug)).length;

    return {
      slug: cluster.slug,
      label: cluster.label,
      readyCount: clusterItems.filter((item) => item.blockers.length === 0).length,
      publishedCount: clusterItems.filter((item) => item.rawStatus).length,
      missingCorePages,
      nextPages,
    };
  });

  const sprint3Clusters = SPRINT_B_CLUSTERS.map((cluster) => {
    const priorityTargets = (
      SPRINT_3_TIER_2_TARGETS[cluster.slug as Sprint3ClusterSlug] ?? []
    ).map((slug) => {
      const page = roadmap.find((item) => item.slug === slug);
      return {
        slug,
        kind: (page?.kind === "article" ? "article" : "calculator") as "calculator" | "article",
        status: (page?.status ?? "missing") as "published" | "ready-now" | "blocked" | "missing",
      };
    });

    return {
      slug: cluster.slug,
      label: cluster.label,
      priorityTargets,
      missingCoreCalculators: cluster.coreCalculators.filter(
        (slug) => !roadmap.some((page) => page.slug === slug && page.status !== "missing"),
      ).length,
      missingCoreArticles: cluster.coreArticles.filter(
        (slug) => !roadmap.some((page) => page.slug === slug && page.status !== "missing"),
      ).length,
    };
  });

  const sprint4Pages = roadmap.filter((page) => page.kind !== "hub");
  const sprint4Classified = sprint4Pages.map((page) => ({
    slug: page.slug,
    cluster: page.cluster,
    kind: page.kind as "calculator" | "article",
    status: page.status as "published" | "ready-now" | "blocked" | "missing",
    classification: classifyMonetization(page.slug, page.title, page.kind),
  }));

  const roadmapTier1 = roadmap.filter((page) => page.priorityTier === "tier-1");
  const roadmapTier2 = roadmap.filter((page) => page.priorityTier === "tier-2");
  const roadmapTier1Done = roadmapTier1.filter(
    (page) => page.status === "published" || page.status === "ready-now" || page.status === "existing-hub",
  );
  const roadmapTier2Done = roadmapTier2.filter(
    (page) => page.status === "published" || page.status === "ready-now" || page.status === "existing-hub",
  );

  const executionRoadmap = {
    currentFocus: "sprint-1",
    nextMoves: [
      ...closeToReady.slice(0, 3).map((item) => `${item.type}: ${item.slug}`),
      ...needsEditorialReview.slice(0, 2).map((item) => `review: ${item.slug}`),
      ...(notFoundSummary.topContentGaps[0] ? [`content-gap: ${notFoundSummary.topContentGaps[0].path}`] : []),
    ].slice(0, 6),
    sprints: EXECUTION_SPRINTS.map((sprint): DashboardData["executionRoadmap"]["sprints"][number] => {
      if (sprint.id === "sprint-1") {
        const status: DashboardData["executionRoadmap"]["sprints"][number]["status"] =
          roadmapTier1Done.length === 0
            ? "not-started"
            : roadmapTier1Done.length >= roadmapTier1.length
              ? "complete"
              : "in-progress";

        return {
          id: sprint.id,
          title: sprint.title,
          status,
          goal: sprint.goal,
          summary: [
            { label: "tier-1 gata", value: `${roadmapTier1Done.length}/${roadmapTier1.length}` },
            { label: "ready now", value: String(readyToPublish.length) },
            { label: "blocked but close", value: String(closeToReady.length) },
          ],
          nextActions: closeToReady.slice(0, 4).map((item) => `${item.type}: ${item.slug}`),
        };
      }

      if (sprint.id === "sprint-2") {
        const status: DashboardData["executionRoadmap"]["sprints"][number]["status"] =
          roadmapTier1Done.length >= Math.max(6, Math.floor(roadmapTier1.length / 2))
          ? "in-progress"
          : "not-started";

        return {
          id: sprint.id,
          title: sprint.title,
          status,
          goal: sprint.goal,
          summary: [
            { label: "clustere", value: String(sprintBClusters.length) },
            { label: "content gaps", value: String(notFoundSummary.topContentGaps.length) },
            { label: "hub-uri", value: String(roadmap.filter((page) => page.kind === "hub").length) },
          ],
          nextActions: [
            "aplica internal linking pe tier-1",
            ...(notFoundSummary.topContentGaps[0] ? [`recupereaza ${notFoundSummary.topContentGaps[0].path}`] : []),
          ],
        };
      }

      if (sprint.id === "sprint-3") {
        const status: DashboardData["executionRoadmap"]["sprints"][number]["status"] =
          roadmapTier2Done.length === 0
            ? "not-started"
            : roadmapTier2Done.length >= roadmapTier2.length
              ? "complete"
              : "in-progress";

        return {
          id: sprint.id,
          title: sprint.title,
          status,
          goal: sprint.goal,
          summary: [
            { label: "tier-2 gata", value: `${roadmapTier2Done.length}/${roadmapTier2.length}` },
            {
              label: "missing core pages",
              value: String(sprintBClusters.reduce((total, cluster) => total + cluster.missingCorePages, 0)),
            },
          ],
          nextActions: roadmapTier2
            .filter((page) => page.status === "blocked" || page.status === "missing")
            .slice(0, 4)
            .map((page) => `${page.kind}: ${page.slug}`),
        };
      }

      return {
        id: sprint.id,
        title: sprint.title,
        status: affiliateSummary.length > 0 ? ("in-progress" as const) : ("not-started" as const),
        goal: sprint.goal,
        summary: [
          { label: "affiliate sources", value: String(topAffiliateSources.length) },
          { label: "affiliate categories", value: String(topAffiliateCategories.length) },
          { label: "candidate pages", value: String(roadmapTier1.filter((page) => page.kind !== "hub").length) },
        ],
        nextActions: [
          "separa traffic pages de money pages",
          "mapeaza CTA-uri doar dupa consolidarea tier-1",
        ],
      };
    }),
  };

  const recentPublished = [
    ...(recentArticlesResult.docs as CollectionDoc[]).map((doc) => ({
      id: String(doc.id ?? ""),
      title: asString(doc.title) ?? "Articol",
      href: `${adminRoute === "/" ? "" : adminRoute}/collections/articles/${String(doc.id ?? "")}`,
      type: "article" as const,
      publishedAt: asString(doc.publishedAt),
    })),
    ...(recentCalculatorsResult.docs as CollectionDoc[]).map((doc) => ({
      id: String(doc.id ?? ""),
      title: asString(doc.title) ?? "Calculator",
      href: `${adminRoute === "/" ? "" : adminRoute}/collections/calculators/${String(doc.id ?? "")}`,
      type: "calculator" as const,
      publishedAt: asString(doc.publishedAt),
    })),
  ]
    .sort((left, right) => {
      const leftTime = left.publishedAt ? new Date(left.publishedAt).getTime() : 0;
      const rightTime = right.publishedAt ? new Date(right.publishedAt).getTime() : 0;
      return rightTime - leftTime;
    })
    .slice(0, 6);

  return {
    metrics: [
      {
        label: "Articole publicate / 7 zile",
        value: String(articleCountResult.totalDocs ?? 0),
        detail: "Ritm editorial din ultima saptamana.",
      },
      {
        label: "Calculatoare publicate / 7 zile",
        value: String(calculatorCountResult.totalDocs ?? 0),
        detail: "Output functional publicat recent.",
      },
      {
        label: "404 monitorizate",
        value: String(notFoundResult.totalDocs ?? notFoundResult.docs.length ?? 0),
        detail: "URL-uri care au nevoie de redirect sau continut.",
      },
      {
        label: "Affiliate clicks logate",
        value: String((affiliateResult.docs as CollectionDoc[]).length),
        detail: "Ultimele click-uri capturate prin /go.",
      },
    ],
    morningArticle,
    morningCalculator,
    eveningCalculator,
    topNotFound: (notFoundResult.docs as CollectionDoc[]).map((doc) => ({
      id: String(doc.id ?? ""),
      path: asString(doc.path) ?? "/",
      hits: asNumber(doc.hits) || 0,
      lastSeenAt: asString(doc.lastSeenAt),
    })),
    affiliateSummary,
    topAffiliateSources,
    topAffiliateCategories,
    readyToPublish,
    blockedDrafts,
    blockerSummary,
    todayChecklist: [
      {
        label: "08:00 articol",
        item: morningArticle,
        description: morningArticle
          ? "Poate fi publicat azi dimineata daca ramane valid."
          : "Nu exista articol publish-ready pe slotul de dimineata.",
      },
      {
        label: "08:00 calculator",
        item: morningCalculator,
        description: morningCalculator
          ? "Calculator publish-ready pentru slotul de dimineata."
          : "Nu exista calculator publish-ready pentru dimineata.",
      },
      {
        label: "17:00 calculator",
        item: eveningCalculator,
        description: eveningCalculator
          ? "Calculator publish-ready pentru slotul de seara."
          : "Nu exista calculator publish-ready pentru seara.",
      },
    ],
    sprintB: {
      clusters: sprintBClusters,
      roadmap: roadmap.slice(0, 10),
      contentGaps: notFoundSummary.topContentGaps.slice(0, 5),
    },
    sprint3: {
      contentRules: [...SPRINT_3_CONTENT_RULES],
      clusters: sprint3Clusters,
    },
    sprint4: {
      ctaSurfaces: [...SPRINT_4_CTA_SURFACES],
      moneyCandidates: sprint4Classified
        .filter((page) => page.classification === "money-page-candidate")
        .slice(0, 8)
        .map(({ classification, ...page }) => {
          void classification;
          return page;
        }),
      supportPages: sprint4Classified
        .filter((page) => page.classification === "support-page")
        .slice(0, 8)
        .map(({ classification, ...page }) => {
          void classification;
          return page;
        }),
    },
    executionRoadmap,
    workflowSlices,
    recentPublished,
    closeToReady,
    needsEditorialReview,
  };
};
