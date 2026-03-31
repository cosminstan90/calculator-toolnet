import { getPayloadClient } from "@/lib/payload";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const internalToken = process.env.CONTENT_HEALTH_TOKEN;
  const providedToken = request.headers.get("x-health-token");

  if (!internalToken || providedToken !== internalToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await getPayloadClient();
  const [categories, calculators, articles, redirects, notFoundEvents] = await Promise.all([
    payload.find({ collection: "calculator-categories", limit: 1, pagination: false, draft: false }),
    payload.find({ collection: "calculators", limit: 200, pagination: false, draft: false, depth: 0 }),
    payload.find({ collection: "articles", limit: 200, pagination: false, draft: false, depth: 0 }),
    payload.find({ collection: "redirects", limit: 200, pagination: false, draft: false, depth: 0, overrideAccess: true }),
    payload.find({ collection: "not-found-events", limit: 200, pagination: false, draft: false, depth: 0, overrideAccess: true }),
  ]);

  const calculatorDocs = calculators.docs as Array<Record<string, unknown>>;
  const missingSeo = calculatorDocs.filter((doc) => !doc.seo).length;
  const missingDescriptions = calculatorDocs.filter((doc) => typeof doc.shortDescription !== "string").length;

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    categories: categories.totalDocs,
    calculators: calculators.totalDocs,
    articles: articles.totalDocs,
    redirects: redirects.totalDocs,
    notFoundEvents: notFoundEvents.totalDocs,
    issues: {
      calculatorsMissingSeo: missingSeo,
      calculatorsMissingDescription: missingDescriptions,
    },
  });
}
