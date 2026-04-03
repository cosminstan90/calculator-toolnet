import type { Payload } from "payload";

type QueueItem = {
  id: string;
  title: string;
  href: string;
  priority: number;
  earliestAt?: string;
  batch?: string;
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
    recentPublished,
  };
};
