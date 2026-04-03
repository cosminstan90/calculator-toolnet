import type { Payload } from "payload";

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
  href: string;
  type: "article" | "calculator";
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
  readyToPublish: DraftInsight[];
  blockedDrafts: DraftInsight[];
  blockerSummary: Array<{
    label: string;
    count: number;
  }>;
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
  href: `${adminRoute === "/" ? "" : adminRoute}/collections/${collection}/${String(doc.id ?? "")}`,
  type: collection === "articles" ? "article" : "calculator",
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

  const draftInsights = sortDraftInsights([
    ...(draftArticlesResult.docs as CollectionDoc[]).map((doc) =>
      buildDraftInsight(adminRoute, "articles", doc, now),
    ),
    ...(draftCalculatorsResult.docs as CollectionDoc[]).map((doc) =>
      buildDraftInsight(adminRoute, "calculators", doc, now),
    ),
  ]);

  const readyToPublish = draftInsights
    .filter((item) => item.blockers.length === 0)
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
    readyToPublish,
    blockedDrafts,
    blockerSummary,
    recentPublished,
  };
};
