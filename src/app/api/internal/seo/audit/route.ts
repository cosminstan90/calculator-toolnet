import { getPayloadClient } from "@/lib/payload";
import { tokenMatches } from "@/lib/internal-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

const asString = (value: unknown) => (typeof value === "string" ? value : "");

const countWords = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

export async function GET(request: Request) {
  const expectedToken = process.env.SEO_AUDIT_TOKEN;
  const providedToken = request.headers.get("x-seo-audit-token");

  if (!tokenMatches(expectedToken, providedToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rate = checkRateLimit({
    request,
    scope: "internal_seo_audit",
    limit: 20,
    windowMs: 60_000,
  });

  if (!rate.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const payload = await getPayloadClient();
  const [calculators, articles, categories, allArticles] = await Promise.all([
    payload.find({ collection: "calculators", depth: 0, pagination: false, limit: 500, draft: false }),
    payload.find({ collection: "articles", depth: 0, pagination: false, limit: 500, draft: false }),
    payload.find({ collection: "calculator-categories", depth: 0, pagination: false, limit: 100, draft: false }),
    payload.find({
      collection: "articles",
      depth: 0,
      pagination: false,
      limit: 500,
      draft: true,
      overrideAccess: true,
    }),
  ]);

  const calculatorDocs = calculators.docs as Array<Record<string, unknown>>;
  const articleDocs = articles.docs as Array<Record<string, unknown>>;
  const categoryDocs = categories.docs as Array<Record<string, unknown>>;
  const allArticleDocs = allArticles.docs as Array<Record<string, unknown>>;

  const report = {
    checkedAt: new Date().toISOString(),
    totals: {
      categories: categoryDocs.length,
      calculators: calculatorDocs.length,
      articles: articleDocs.length,
      articleDrafts: allArticleDocs.filter((doc) => doc._status === "draft").length,
      articlePublished: allArticleDocs.filter((doc) => doc._status === "published").length,
    },
    findings: {
      calculatorsMissingFaq: calculatorDocs.filter((doc) => !Array.isArray(doc.faq) || doc.faq.length === 0).map((doc) => doc.slug),
      calculatorsMissingSeo: calculatorDocs.filter((doc) => !doc.seo).map((doc) => doc.slug),
      calculatorsMissingBody: calculatorDocs.filter((doc) => typeof doc.seoBody !== "string" || !(doc.seoBody as string).trim()).map((doc) => doc.slug),
      articlesMissingExcerpt: articleDocs.filter((doc) => typeof doc.excerpt !== "string" || !(doc.excerpt as string).trim()).map((doc) => doc.slug),
      articlesShortContent: allArticleDocs
        .filter((doc) => countWords(`${asString(doc.excerpt)} ${asString(doc.content)}`) < 800)
        .map((doc) => doc.slug),
      articlesMissingMetaTitle: allArticleDocs
        .filter((doc) => countWords(asString((doc.seo as Record<string, unknown> | undefined)?.metaTitle)) === 0)
        .map((doc) => doc.slug),
      articlesMissingMetaDescription: allArticleDocs
        .filter((doc) => countWords(asString((doc.seo as Record<string, unknown> | undefined)?.metaDescription)) === 0)
        .map((doc) => doc.slug),
      articlesBadTitleLength: allArticleDocs
        .filter((doc) => {
          const length = asString((doc.seo as Record<string, unknown> | undefined)?.metaTitle).trim().length;
          return length > 0 && (length < 30 || length > 60);
        })
        .map((doc) => doc.slug),
      articlesBadDescriptionLength: allArticleDocs
        .filter((doc) => {
          const length = asString((doc.seo as Record<string, unknown> | undefined)?.metaDescription).trim().length;
          return length > 0 && (length < 120 || length > 160);
        })
        .map((doc) => doc.slug),
      articlesMissingRelatedCalculators: allArticleDocs
        .filter((doc) => !Array.isArray(doc.relatedCalculators) || doc.relatedCalculators.length === 0)
        .map((doc) => doc.slug),
      articlesMissingLaunchWave: allArticleDocs
        .filter((doc) => !asString(doc.launchWave).trim())
        .map((doc) => doc.slug),
      categoriesMissingIntro: categoryDocs.filter((doc) => typeof doc.introContent !== "string" || !(doc.introContent as string).trim()).map((doc) => doc.slug),
    },
  };

  return NextResponse.json(report);
}
