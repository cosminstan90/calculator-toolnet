import { ensureCalculatorFaq } from "@/lib/calculator-content";
import { getCalculatorDefinition, type CalculatorKey } from "@/lib/calculator-registry";
import type { Payload } from "payload";

type ImportEntity = "calculator" | "article" | "redirect";

type ParsedImportData = {
  calculators: Array<Record<string, unknown>>;
  articles: Array<Record<string, unknown>>;
  redirects: Array<Record<string, unknown>>;
};

type ImportResult = {
  calculators: { created: number; updated: number; skipped: number };
  articles: { created: number; updated: number; skipped: number };
  redirects: { created: number; updated: number; skipped: number };
  errors: string[];
};

const parseCSV = (input: string): string[][] => {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      row.push(current);
      current = "";
      if (row.some((cell) => cell.length > 0)) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    current += char;
  }

  row.push(current);
  if (row.some((cell) => cell.length > 0)) {
    rows.push(row);
  }

  return rows;
};

const tryParseJSON = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

export const parseImportContent = (raw: string, format?: string): ParsedImportData => {
  const normalizedFormat = format?.toLowerCase();

  if (normalizedFormat === "json" || raw.trim().startsWith("{") || raw.trim().startsWith("[")) {
    const parsed = JSON.parse(raw) as
      | ParsedImportData
      | Array<Record<string, unknown>>;

    if (Array.isArray(parsed)) {
      return { calculators: [], articles: [], redirects: parsed };
    }

    return {
      calculators: Array.isArray(parsed.calculators) ? parsed.calculators : [],
      articles: Array.isArray(parsed.articles) ? parsed.articles : [],
      redirects: Array.isArray(parsed.redirects) ? parsed.redirects : [],
    };
  }

  const rows = parseCSV(raw);
  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((column) => column.trim());
  const grouped: ParsedImportData = { calculators: [], articles: [], redirects: [] };

  for (const row of dataRows) {
    const record: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      record[header] = row[index]?.trim() ?? "";
    });

    const type = String(record.type ?? "").toLowerCase() as ImportEntity;
    if (type === "calculator") grouped.calculators.push(record);
    if (type === "article") grouped.articles.push(record);
    if (type === "redirect") grouped.redirects.push(record);
  }

  return grouped;
};

const toBoolean = (value: unknown, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return fallback;
};

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

export const importContent = async (
  payload: Payload,
  input: ParsedImportData
): Promise<ImportResult> => {
  const result: ImportResult = {
    calculators: { created: 0, updated: 0, skipped: 0 },
    articles: { created: 0, updated: 0, skipped: 0 },
    redirects: { created: 0, updated: 0, skipped: 0 },
    errors: [],
  };

  const [categories, calculators, articles, redirects, users] = await Promise.all([
    payload.find({
      collection: "calculator-categories",
      depth: 0,
      pagination: false,
      limit: 100,
      overrideAccess: true,
    }),
    payload.find({
      collection: "calculators",
      depth: 0,
      pagination: false,
      limit: 500,
      overrideAccess: true,
    }),
    payload.find({
      collection: "articles",
      depth: 0,
      pagination: false,
      limit: 500,
      overrideAccess: true,
    }),
    payload.find({
      collection: "redirects",
      depth: 0,
      pagination: false,
      limit: 500,
      overrideAccess: true,
    }),
    payload.find({
      collection: "users",
      depth: 0,
      pagination: false,
      limit: 1,
      overrideAccess: true,
    }),
  ]);

  const categoryMap = new Map(
    categories.docs.map((doc) => [String((doc as { slug?: string }).slug ?? ""), doc.id])
  );
  const calculatorMap = new Map(
    calculators.docs.map((doc) => [String((doc as { calculatorKey?: string }).calculatorKey ?? ""), doc])
  );
  const articleMap = new Map(
    articles.docs.map((doc) => [String((doc as { slug?: string }).slug ?? ""), doc])
  );
  const redirectMap = new Map(
    redirects.docs.map((doc) => [String((doc as { sourcePath?: string }).sourcePath ?? ""), doc])
  );
  const authorID = users.docs[0]?.id;

  for (const entry of input.calculators) {
    const key = String(entry.calculatorKey ?? "") as CalculatorKey;
    if (!key) {
      result.errors.push("Calculator import skipped: missing calculatorKey.");
      result.calculators.skipped += 1;
      continue;
    }

    try {
      const definition = getCalculatorDefinition(key);
      const existing = calculatorMap.get(key) as { id: string | number } | undefined;
      const relatedCalculatorKeys = tryParseJSON(entry.relatedCalculatorKeys) as string[] | undefined;
      const relatedArticleSlugs = tryParseJSON(entry.relatedArticleSlugs) as string[] | undefined;
      const examples = tryParseJSON(entry.examplesJson) as
        | Array<{ title: string; narrative: string }>
        | undefined;
      const faq = tryParseJSON(entry.faqJson) as
        | Array<{ question: string; answer: string }>
        | undefined;

      const data = {
        title: String(entry.title ?? definition.title),
        slug: String(entry.slug ?? definition.slug),
        calculatorKey: key,
        category:
          categoryMap.get(String(entry.categorySlug ?? definition.categorySlug)) ??
          categoryMap.get(definition.categorySlug),
        shortDescription: String(entry.shortDescription ?? definition.summary),
        intro: String(entry.intro ?? definition.summary),
        seoBody: String(entry.seoBody ?? definition.formulaDescription),
        interpretationNotes: String(
          entry.interpretationNotes ??
            "Rezultatul este orientativ si trebuie interpretat in contextul concret al utilizatorului."
        ),
        examples:
          examples && examples.length > 0
            ? examples
            : [{ title: "Exemplu importat", narrative: "Completeaza acest exemplu dupa import." }],
        faq: ensureCalculatorFaq(key, faq),
        howToSteps: definition.howToSteps.map((step) => ({ step })),
        isFeatured: toBoolean(entry.isFeatured, false),
        sortOrder: toNumber(entry.sortOrder, 0),
        seo: {
          metaTitle: String(entry.metaTitle ?? `${definition.title} online`),
          metaDescription: String(entry.metaDescription ?? definition.summary),
          canonicalPath: String(
            entry.canonicalPath ??
              `/calculatoare/${definition.categorySlug}/${String(entry.slug ?? definition.slug)}`
          ),
        },
        relatedCalculators: (relatedCalculatorKeys ?? [])
          .map((relatedKey) =>
            (calculatorMap.get(relatedKey) as { id?: string | number } | undefined)?.id
          )
          .filter(Boolean),
        relatedArticles: (relatedArticleSlugs ?? [])
          .map((slug) => (articleMap.get(slug) as { id?: string | number } | undefined)?.id)
          .filter(Boolean),
        _status: "published" as const,
      };

      if (existing?.id) {
        await payload.update({
          collection: "calculators",
          id: existing.id,
          overrideAccess: true,
          draft: false,
          data,
        });
        result.calculators.updated += 1;
      } else {
        await payload.create({
          collection: "calculators",
          overrideAccess: true,
          draft: false,
          data,
        });
        result.calculators.created += 1;
      }
    } catch (error) {
      result.errors.push(`Calculator ${key} failed: ${String(error)}`);
      result.calculators.skipped += 1;
    }
  }

  for (const entry of input.articles) {
    const slug = String(entry.slug ?? "").trim();
    if (!slug || !authorID) {
      result.errors.push(`Article import skipped: missing slug or author for ${slug || "unknown"}.`);
      result.articles.skipped += 1;
      continue;
    }

    const existing = articleMap.get(slug) as { id?: string | number } | undefined;
    const relatedCalculatorKeys = tryParseJSON(entry.relatedCalculatorKeys) as string[] | undefined;
    const relatedArticleSlugs = tryParseJSON(entry.relatedArticleSlugs) as string[] | undefined;
    const publishArticle = toBoolean(entry.publishByDefault, false);

    const data = {
      title: String(entry.title ?? slug),
      slug,
      excerpt: String(entry.excerpt ?? ""),
      content: String(entry.content ?? ""),
      articleType: String(entry.articleType ?? "guide"),
      relatedCategory: categoryMap.get(String(entry.relatedCategorySlug ?? "")),
      relatedCalculators: (relatedCalculatorKeys ?? [])
        .map((key) => (calculatorMap.get(key) as { id?: string | number } | undefined)?.id)
        .filter(Boolean),
      relatedArticles: (relatedArticleSlugs ?? [])
        .map((item) => (articleMap.get(item) as { id?: string | number } | undefined)?.id)
        .filter(Boolean),
      launchWave: String(entry.launchWave ?? "backlog"),
      author: authorID,
      publishedAt: publishArticle ? new Date().toISOString() : undefined,
      aiDraft: { reviewStatus: publishArticle ? "reviewed" : "draft" },
      seo: {
        metaTitle: String(entry.metaTitle ?? entry.title ?? slug),
        metaDescription: String(entry.metaDescription ?? entry.excerpt ?? ""),
        canonicalPath: String(entry.canonicalPath ?? `/blog/${slug}`),
      },
      _status: publishArticle ? ("published" as const) : ("draft" as const),
    };

    if (existing?.id) {
      await payload.update({
        collection: "articles",
        id: existing.id,
        overrideAccess: true,
        draft: !publishArticle,
        data,
      });
      result.articles.updated += 1;
    } else {
      await payload.create({
        collection: "articles",
        overrideAccess: true,
        draft: !publishArticle,
        data,
      });
      result.articles.created += 1;
    }
  }

  for (const entry of input.redirects) {
    const sourcePath = String(entry.sourcePath ?? "").trim();
    const destinationPath = String(entry.destinationPath ?? "").trim();
    if (!sourcePath || !destinationPath) {
      result.errors.push("Redirect import skipped: missing sourcePath or destinationPath.");
      result.redirects.skipped += 1;
      continue;
    }

    const existing = redirectMap.get(sourcePath) as { id?: string | number } | undefined;
    const data = {
      sourcePath,
      destinationPath,
      statusCode: String(entry.statusCode ?? "308"),
      isEnabled: toBoolean(entry.isEnabled, true),
      notes: String(entry.notes ?? ""),
    };

    if (existing?.id) {
      await payload.update({
        collection: "redirects",
        id: existing.id,
        overrideAccess: true,
        draft: false,
        data,
      });
      result.redirects.updated += 1;
    } else {
      await payload.create({
        collection: "redirects",
        overrideAccess: true,
        draft: false,
        data,
      });
      result.redirects.created += 1;
    }
  }

  return result;
};



