import { getPayloadClient } from "@/lib/payload";
import { NextResponse } from "next/server";

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const asString = (value: unknown): string => (typeof value === "string" ? value : "");
const asBoolean = (value: unknown): boolean => value === true;

const reviewedStatuses = new Set(["reviewed", "published"]);
const publishableEditorialStatuses = new Set(["approved", "scheduled"]);

const summarizeQueue = (
  docs: Array<Record<string, unknown>>,
  type: "articles" | "calculators",
) => {
  const queue = docs
    .map((doc) => {
      const checklist = asRecord(doc.editorialChecklist);
      const schedule = asRecord(doc.publishingSchedule);
      const aiDraft = asRecord(doc.aiDraft);

      return {
        title: asString(doc.title),
        slug: asString(doc.slug),
        status: asString(doc._status),
        editorialStatus: asString(doc.editorialStatus),
        reviewStatus: asString(aiDraft.reviewStatus),
        publishReady: asBoolean(checklist.publishReady),
        schemaValidated: asBoolean(checklist.schemaValidated),
        finalReviewDone: asBoolean(checklist.finalReviewDone),
        slot: asString(schedule.slot),
        priority: Number(schedule.priority ?? 999),
      };
    })
    .filter(
      (item) =>
        item.status !== "published" &&
        publishableEditorialStatuses.has(item.editorialStatus),
    );

  const ready = queue.filter(
    (item) =>
      item.publishReady &&
      item.schemaValidated &&
      item.finalReviewDone &&
      (type !== "articles" || reviewedStatuses.has(item.reviewStatus || "draft")),
  );

  return {
    queued: queue.length,
    ready: ready.length,
    blocked: queue.length - ready.length,
    topReady: ready
      .sort((left, right) => left.priority - right.priority)
      .slice(0, 5)
      .map((item) => ({
        title: item.title,
        slug: item.slug,
        slot: item.slot,
        priority: item.priority,
      })),
  };
};

export async function GET(request: Request) {
  const internalToken = process.env.OPS_HEALTH_TOKEN ?? process.env.CONTENT_HEALTH_TOKEN;
  const providedToken = request.headers.get("x-health-token");

  if (!internalToken || providedToken !== internalToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await getPayloadClient();
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
    payload.find({ collection: "calculators", limit: 200, pagination: false, draft: true, depth: 0, overrideAccess: true }),
    payload.find({ collection: "articles", limit: 200, pagination: false, draft: true, depth: 0, overrideAccess: true }),
    payload.find({ collection: "redirects", limit: 1, pagination: false, draft: false, depth: 0, overrideAccess: true }),
    payload.find({
      collection: "not-found-events",
      limit: 10,
      pagination: false,
      draft: false,
      depth: 0,
      overrideAccess: true,
      sort: "-hits",
    }),
    payload.find({
      collection: "affiliate-click-events",
      limit: 50,
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

  return NextResponse.json({
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
      calculators: summarizeQueue(calculators.docs as Array<Record<string, unknown>>, "calculators"),
      articles: summarizeQueue(articles.docs as Array<Record<string, unknown>>, "articles"),
    },
    topNotFounds: notFoundEvents.docs.map((doc) => ({
      path: asString(doc.path),
      hits: Number(doc.hits ?? 0),
      source: asString(doc.source),
      lastSeenAt: asString(doc.lastSeenAt),
    })),
    recentAffiliateClicks: affiliateClicks.docs.map((doc) => ({
      offerKey: asString(doc.offerKey),
      sourcePath: asString(doc.sourcePath),
      sourceType: asString(doc.sourceType),
      createdAt: asString(doc.createdAt),
    })),
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
  });
}
