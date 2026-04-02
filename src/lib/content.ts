import { getPayloadClient } from "./payload.ts";
import type { Where } from "payload";

type RelationDoc = {
  id: string;
  slug?: string;
  name?: string;
  title?: string;
  profileSlug?: string;
};

export type PublicAuthor = {
  id: string;
  name: string;
  profileSlug: string;
  bio?: string;
  jobTitle?: string;
  expertise: string[];
  avatarURL?: string;
};

export type SeoData = {
  metaTitle?: string;
  metaDescription?: string;
  canonicalPath?: string;
  ogImageURL?: string;
  twitterImageURL?: string;
  noIndex?: boolean;
};

export type BlockTone = "mist" | "night" | "sand";

export type EditorialBlock =
  | {
      blockType: "story";
      id: string;
      eyebrow?: string;
      title: string;
      body: string;
      tone: BlockTone;
    }
  | {
      blockType: "facts";
      id: string;
      eyebrow?: string;
      title: string;
      intro?: string;
      tone: BlockTone;
      items: Array<{ value: string; label: string; detail?: string }>;
    }
  | {
      blockType: "links";
      id: string;
      eyebrow?: string;
      title: string;
      intro?: string;
      tone: BlockTone;
      items: Array<{ label: string; href: string; description?: string }>;
    }
  | {
      blockType: "cta";
      id: string;
      eyebrow?: string;
      title: string;
      body: string;
      tone: BlockTone;
      primaryLabel: string;
      primaryHref: string;
      secondaryLabel?: string;
      secondaryHref?: string;
    };

export type HomepageContent = {
  heroBadge?: string;
  heroTitle: string;
  heroDescription: string;
  primaryCTA?: { label: string; href: string };
  secondaryCTA?: { label?: string; href?: string };
  heroHighlights: Array<{ value: string; label: string }>;
  contentBlocks: EditorialBlock[];
  seo?: SeoData;
};

export type CalculatorCategory = {
  id: string;
  name: string;
  slug: string;
  summary?: string;
  introContent?: string;
  isFeatured?: boolean;
  contentBlocks: EditorialBlock[];
  seo?: SeoData;
};

export type CalculatorDoc = {
  id: string;
  title: string;
  slug: string;
  calculatorKey: string;
  shortDescription: string;
  intro: string;
  seoBody: string;
  interpretationNotes: string;
  formulaName?: string;
  formulaExpression?: string;
  formulaDescription?: string;
  isFeatured?: boolean;
  howToSteps: string[];
  examples: Array<{ title: string; narrative: string }>;
  faq: Array<{ question: string; answer: string }>;
  category?: RelationDoc;
  relatedCalculators: RelationDoc[];
  relatedArticles: RelationDoc[];
  publishedAt?: string;
  contentBlocks: EditorialBlock[];
  seo?: SeoData;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  articleType: string;
  launchWave?: string;
  coverImageURL?: string;
  publishedAt?: string;
  updatedAt?: string;
  author?: PublicAuthor;
  relatedCategory?: RelationDoc;
  relatedCalculators: RelationDoc[];
  relatedArticles: RelationDoc[];
  seo?: SeoData;
};

type RawDoc = Record<string, unknown>;

const asObject = <T extends Record<string, unknown>>(value: unknown): T | null => {
  return value && typeof value === "object" ? (value as T) : null;
};

const asString = (value: unknown): string | undefined => {
  return typeof value === "string" ? value : undefined;
};

const asStringOrEmpty = (value: unknown): string => {
  return asString(value) ?? "";
};

const mapSEO = (doc: RawDoc): SeoData | undefined => {
  const seo = asObject<RawDoc>(doc.seo);
  if (!seo) {
    return undefined;
  }

  return {
    metaTitle: asString(seo.metaTitle),
    metaDescription: asString(seo.metaDescription),
    canonicalPath: asString(seo.canonicalPath),
    ogImageURL: asString(seo.ogImageURL),
    twitterImageURL: asString(seo.twitterImageURL),
    noIndex: Boolean(seo.noIndex),
  };
};

const asTone = (value: unknown): BlockTone => {
  if (value === "night" || value === "sand") {
    return value;
  }
  return "mist";
};

const mapContentBlocks = (value: unknown): EditorialBlock[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const blocks: EditorialBlock[] = [];
  for (const [index, entry] of value.entries()) {
    const block = asObject<RawDoc>(entry);
    if (!block) {
      continue;
    }

    const blockType = asString(block.blockType);
    const id = asString(block.id) ?? `${blockType ?? "block"}-${index}`;
    const tone = asTone(block.tone);

    if (blockType === "story") {
      blocks.push({
        blockType,
        id,
        eyebrow: asString(block.eyebrow),
        title: asStringOrEmpty(block.title),
        body: asStringOrEmpty(block.body),
        tone,
      });
      continue;
    }

    if (blockType === "facts") {
      blocks.push({
        blockType,
        id,
        eyebrow: asString(block.eyebrow),
        title: asStringOrEmpty(block.title),
        intro: asString(block.intro),
        tone,
        items: Array.isArray(block.items)
          ? block.items.map((item) => {
              const fact = asObject<RawDoc>(item);
              return {
                value: asStringOrEmpty(fact?.value),
                label: asStringOrEmpty(fact?.label),
                detail: asString(fact?.detail),
              };
            })
          : [],
      });
      continue;
    }

    if (blockType === "links") {
      blocks.push({
        blockType,
        id,
        eyebrow: asString(block.eyebrow),
        title: asStringOrEmpty(block.title),
        intro: asString(block.intro),
        tone,
        items: Array.isArray(block.items)
          ? block.items.map((item) => {
              const link = asObject<RawDoc>(item);
              return {
                label: asStringOrEmpty(link?.label),
                href: asStringOrEmpty(link?.href),
                description: asString(link?.description),
              };
            })
          : [],
      });
      continue;
    }

    if (blockType === "cta") {
      blocks.push({
        blockType,
        id,
        eyebrow: asString(block.eyebrow),
        title: asStringOrEmpty(block.title),
        body: asStringOrEmpty(block.body),
        tone,
        primaryLabel: asStringOrEmpty(block.primaryLabel),
        primaryHref: asStringOrEmpty(block.primaryHref),
        secondaryLabel: asString(block.secondaryLabel),
        secondaryHref: asString(block.secondaryHref),
      });
    }
  }

  return blocks;
};

const mapRelation = (value: unknown): RelationDoc | undefined => {
  const relation = asObject<RawDoc>(value);
  if (!relation?.id) {
    return undefined;
  }

  return {
    id: String(relation.id),
    slug: asString(relation.slug),
    name: asString(relation.name),
    title: asString(relation.title),
    profileSlug: asString(relation.profileSlug),
  };
};

const mapPublicAuthor = (doc: RawDoc): PublicAuthor | undefined => {
  if (!doc.id) {
    return undefined;
  }

  const name = asString(doc.name) ?? "Echipa editoriala";
  const fallbackSlug = `autor-${String(doc.id)}`;
  return {
    id: String(doc.id),
    name,
    profileSlug: asString(doc.profileSlug) ?? fallbackSlug,
    bio: asString(doc.bio),
    jobTitle: asString(doc.jobTitle),
    expertise: Array.isArray(doc.expertise)
      ? doc.expertise
          .map((item) => asObject<RawDoc>(item))
          .map((item) => asString(item?.label) ?? "")
          .filter(Boolean)
      : [],
    avatarURL: asString(doc.avatarURL),
  };
};

const extractRelationID = (value: unknown): string | undefined => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  const relation = asObject<RawDoc>(value);
  return relation?.id ? String(relation.id) : undefined;
};

const mapHomepage = (doc: RawDoc): HomepageContent => {
  const primaryCTA = asObject<RawDoc>(doc.primaryCTA);
  const secondaryCTA = asObject<RawDoc>(doc.secondaryCTA);

  return {
    heroBadge: asString(doc.heroBadge),
    heroTitle:
      asString(doc.heroTitle) ??
      "Calculatoare online construite sa raspunda repede si sa explice corect.",
    heroDescription:
      asString(doc.heroDescription) ??
      "Hub de calculatoare online pentru fitness, auto, energie si conversii.",
    primaryCTA: primaryCTA
      ? { label: asStringOrEmpty(primaryCTA.label), href: asString(primaryCTA.href) ?? "/calculatoare" }
      : undefined,
    secondaryCTA: secondaryCTA
      ? { label: asString(secondaryCTA.label), href: asString(secondaryCTA.href) }
      : undefined,
    heroHighlights: Array.isArray(doc.heroHighlights)
      ? doc.heroHighlights.map((item) => {
          const highlight = asObject<RawDoc>(item);
          return {
            value: asStringOrEmpty(highlight?.value),
            label: asStringOrEmpty(highlight?.label),
          };
        })
      : [],
    contentBlocks: mapContentBlocks(doc.contentBlocks),
    seo: mapSEO(doc),
  };
};

const mapCategory = (doc: RawDoc): CalculatorCategory => ({
  id: String(doc.id),
  name: asStringOrEmpty(doc.name),
  slug: asStringOrEmpty(doc.slug),
  summary: asString(doc.summary),
  introContent: asString(doc.introContent),
  isFeatured: Boolean(doc.isFeatured),
  contentBlocks: mapContentBlocks(doc.contentBlocks),
  seo: mapSEO(doc),
});

const mapCalculator = (doc: RawDoc): CalculatorDoc => ({
  id: String(doc.id),
  title: asStringOrEmpty(doc.title),
  slug: asStringOrEmpty(doc.slug),
  calculatorKey: asStringOrEmpty(doc.calculatorKey),
  shortDescription: asStringOrEmpty(doc.shortDescription),
  intro: asStringOrEmpty(doc.intro),
  seoBody: asStringOrEmpty(doc.seoBody),
  interpretationNotes: asStringOrEmpty(doc.interpretationNotes),
  formulaName: asString(doc.formulaName),
  formulaExpression: asString(doc.formulaExpression),
  formulaDescription: asString(doc.formulaDescription),
  isFeatured: Boolean(doc.isFeatured),
  howToSteps: Array.isArray(doc.howToSteps)
    ? doc.howToSteps
        .map((item) => asObject<RawDoc>(item))
        .map((item) => asString(item?.step) ?? "")
        .filter(Boolean)
    : [],
  examples: Array.isArray(doc.examples)
    ? doc.examples.map((item) => {
        const example = asObject<RawDoc>(item);
        return {
          title: asStringOrEmpty(example?.title),
          narrative: asStringOrEmpty(example?.narrative),
        };
      })
    : [],
  faq: Array.isArray(doc.faq)
    ? doc.faq.map((item) => {
        const faq = asObject<RawDoc>(item);
        return {
          question: asStringOrEmpty(faq?.question),
          answer: asStringOrEmpty(faq?.answer),
        };
      })
    : [],
  category: mapRelation(doc.category),
  relatedCalculators: Array.isArray(doc.relatedCalculators)
    ? doc.relatedCalculators
        .map((item) => mapRelation(item))
        .filter(Boolean) as RelationDoc[]
    : [],
  relatedArticles: Array.isArray(doc.relatedArticles)
    ? doc.relatedArticles.map((item) => mapRelation(item)).filter(Boolean) as RelationDoc[]
    : [],
  publishedAt: asString(doc.publishedAt),
  contentBlocks: mapContentBlocks(doc.contentBlocks),
  seo: mapSEO(doc),
});

const mapArticle = (doc: RawDoc): Article => ({
  id: String(doc.id),
  title: asStringOrEmpty(doc.title),
  slug: asStringOrEmpty(doc.slug),
  excerpt: asStringOrEmpty(doc.excerpt),
  content: asStringOrEmpty(doc.content),
  articleType: asString(doc.articleType) ?? "guide",
  launchWave: asString(doc.launchWave),
  coverImageURL: asString(doc.coverImageURL),
  publishedAt: asString(doc.publishedAt),
  updatedAt: asString(doc.updatedAt),
  author: mapPublicAuthor(asObject<RawDoc>(doc.author) ?? {}),
  relatedCategory: mapRelation(doc.relatedCategory),
  relatedCalculators: Array.isArray(doc.relatedCalculators)
    ? doc.relatedCalculators.map((item) => mapRelation(item)).filter(Boolean) as RelationDoc[]
    : [],
  relatedArticles: Array.isArray(doc.relatedArticles)
    ? doc.relatedArticles.map((item) => mapRelation(item)).filter(Boolean) as RelationDoc[]
    : [],
  seo: mapSEO(doc),
});

const attachAuthorsToArticles = async (docs: RawDoc[]): Promise<Article[]> => {
  const articles = docs.map((doc) => mapArticle(doc));
  const authorIDs = Array.from(
    new Set(docs.map((doc) => extractRelationID(doc.author)).filter(Boolean) as string[])
  );

  if (authorIDs.length === 0) {
    return articles;
  }

  const payload = await getPayloadClient();
  const authorResult = await payload.find({
    collection: "users",
    depth: 0,
    limit: authorIDs.length,
    overrideAccess: true,
    pagination: false,
    where: {
      id: {
        in: authorIDs,
      },
    },
  });

  const authorMap = new Map(
    authorResult.docs
      .map((doc) => mapPublicAuthor(doc as RawDoc))
      .filter((author): author is PublicAuthor => Boolean(author))
      .map((author) => [author.id, author] as const)
  );

  return articles.map((article, index) => {
    if (article.author) {
      return article;
    }

    const authorID = extractRelationID(docs[index]?.author);
    return authorID ? { ...article, author: authorMap.get(authorID) } : article;
  });
};

const safeRun = async <T>(action: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await action();
  } catch (error) {
    console.error("[content] query failed", error);
    return fallback;
  }
};

export const buildCategoryPath = (categorySlug: string) => `/calculatoare/${categorySlug}`;
export const buildCalculatorPath = (calculator: { category?: RelationDoc; slug: string }) => {
  const categorySlug = calculator.category?.slug;
  return categorySlug ? `/calculatoare/${categorySlug}/${calculator.slug}` : "/calculatoare";
};
export const buildArticlePath = (articleSlug: string) => `/blog/${articleSlug}`;
export const buildAuthorPath = (author: Pick<PublicAuthor, "profileSlug">) =>
  `/autori/${author.profileSlug}`;

export const getHomepageContent = async (): Promise<HomepageContent | null> => {
  return safeRun(async () => {
    const payload = await getPayloadClient();
    const result = await payload.findGlobal({ slug: "homepage", draft: false, depth: 0 });
    return mapHomepage(result as RawDoc);
  }, null);
};

export const listCategories = async (limit = 12): Promise<CalculatorCategory[]> => {
  return safeRun(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "calculator-categories",
      draft: false,
      depth: 0,
      limit,
      sort: "sortOrder",
    });
    return result.docs.map((doc) => mapCategory(doc as RawDoc));
  }, []);
};

export const getCategoryBySlug = async (slug: string): Promise<CalculatorCategory | null> => {
  return safeRun(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "calculator-categories",
      draft: false,
      depth: 0,
      limit: 1,
      where: { slug: { equals: slug } },
    });
    return result.docs[0] ? mapCategory(result.docs[0] as RawDoc) : null;
  }, null);
};

export const listFeaturedCalculators = async (limit = 8): Promise<CalculatorDoc[]> => {
  return safeRun(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "calculators",
      draft: false,
      depth: 2,
      limit,
      sort: "sortOrder",
      where: { isFeatured: { equals: true } },
    });
    return result.docs.map((doc) => mapCalculator(doc as RawDoc));
  }, []);
};

export const listCalculators = async (limit = 100): Promise<CalculatorDoc[]> => {
  return safeRun(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "calculators",
      draft: false,
      depth: 2,
      limit,
      sort: "sortOrder",
    });
    return result.docs.map((doc) => mapCalculator(doc as RawDoc));
  }, []);
};

export const listCalculatorsByCategory = async (
  categoryID: string,
  limit = 100
): Promise<CalculatorDoc[]> => {
  return safeRun(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "calculators",
      draft: false,
      depth: 2,
      limit,
      sort: "sortOrder",
      where: { category: { equals: categoryID } },
    });
    return result.docs.map((doc) => mapCalculator(doc as RawDoc));
  }, []);
};

export const getCalculatorBySlug = async (slug: string): Promise<CalculatorDoc | null> => {
  return safeRun(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "calculators",
      draft: false,
      depth: 2,
      limit: 1,
      where: { slug: { equals: slug } },
    });
    return result.docs[0] ? mapCalculator(result.docs[0] as RawDoc) : null;
  }, null);
};

export const getCalculatorByRoute = async (args: {
  categorySlug: string;
  calculatorSlug: string;
}): Promise<CalculatorDoc | null> => {
  const calculator = await getCalculatorBySlug(args.calculatorSlug);
  if (!calculator || calculator.category?.slug !== args.categorySlug) {
    return null;
  }
  return calculator;
};

export const listRelatedCalculators = async (
  calculator: CalculatorDoc,
  limit = 6
): Promise<CalculatorDoc[]> => {
  const categoryID = calculator.category?.id;

  if (calculator.relatedCalculators.length > 0) {
    return safeRun(async () => {
      const payload = await getPayloadClient();
      const result = await payload.find({
        collection: "calculators",
        draft: false,
        depth: 2,
        limit,
        where: {
          id: {
            in: calculator.relatedCalculators.map((item) => item.id),
          },
        },
      });
      return result.docs.map((doc) => mapCalculator(doc as RawDoc));
    }, []);
  }

  if (!categoryID) {
    return [];
  }

  return safeRun(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "calculators",
      draft: false,
      depth: 2,
      limit,
      sort: "sortOrder",
      where: {
        and: [
          { category: { equals: categoryID } },
          { id: { not_equals: calculator.id } },
        ],
      },
    });
    return result.docs.map((doc) => mapCalculator(doc as RawDoc));
  }, []);
};

export const listRecentArticles = async (limit = 8): Promise<Article[]> => {
  return safeRun(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "articles",
      draft: false,
      depth: 2,
      limit,
      sort: "-publishedAt",
    });
    return attachAuthorsToArticles(result.docs as RawDoc[]);
  }, []);
};

export const listArticlesByAuthor = async (args: {
  authorID: string;
  limit?: number;
}): Promise<Article[]> => {
  return safeRun(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "articles",
      draft: false,
      depth: 2,
      limit: args.limit ?? 12,
      sort: "-publishedAt",
      where: {
        author: {
          equals: args.authorID,
        },
      },
    });
    return attachAuthorsToArticles(result.docs as RawDoc[]);
  }, []);
};

export const listArticlesByCategory = async (args: {
  categoryID?: string;
  limit?: number;
}): Promise<Article[]> => {
  const whereAnd: Where[] = [];
  if (args.categoryID) {
    whereAnd.push({ relatedCategory: { equals: args.categoryID } });
  }

  return safeRun(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "articles",
      draft: false,
      depth: 2,
      limit: args.limit ?? 8,
      sort: "-publishedAt",
      where: whereAnd.length > 0 ? { and: whereAnd } : undefined,
    });
    return attachAuthorsToArticles(result.docs as RawDoc[]);
  }, []);
};

export const getArticleBySlug = async (slug: string): Promise<Article | null> => {
  return safeRun(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "articles",
      draft: false,
      depth: 2,
      limit: 1,
      where: { slug: { equals: slug } },
    });
    if (!result.docs[0]) {
      return null;
    }

    const [article] = await attachAuthorsToArticles([result.docs[0] as RawDoc]);
    return article ?? null;
  }, null);
};

export const getPublicAuthorBySlug = async (slug: string): Promise<PublicAuthor | null> => {
  return safeRun(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "users",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: {
        or: [
          { profileSlug: { equals: slug } },
          { id: { equals: slug } },
        ],
      },
    });

    return result.docs[0] ? mapPublicAuthor(result.docs[0] as RawDoc) ?? null : null;
  }, null);
};

export const listAllPublicAuthorsForSitemap = async (): Promise<PublicAuthor[]> => {
  return safeRun(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "users",
      depth: 0,
      overrideAccess: true,
      pagination: false,
      limit: 10000,
      sort: "updatedAt",
    });

    return result.docs
      .map((doc) => mapPublicAuthor(doc as RawDoc))
      .filter((author): author is PublicAuthor => Boolean(author));
  }, []);
};

export const listAllCategoriesForSitemap = async (): Promise<CalculatorCategory[]> => {
  return safeRun(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "calculator-categories",
      draft: false,
      depth: 0,
      pagination: false,
      limit: 1000,
      sort: "updatedAt",
    });
    return result.docs.map((doc) => mapCategory(doc as RawDoc));
  }, []);
};

export const listAllCalculatorsForSitemap = async (): Promise<CalculatorDoc[]> => {
  return safeRun(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "calculators",
      draft: false,
      depth: 2,
      pagination: false,
      limit: 10000,
      sort: "updatedAt",
    });
    return result.docs.map((doc) => mapCalculator(doc as RawDoc));
  }, []);
};

export const listAllArticlesForSitemap = async (): Promise<Article[]> => {
  return safeRun(async () => {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "articles",
      draft: false,
      depth: 0,
      pagination: false,
      limit: 10000,
      sort: "updatedAt",
    });
    return attachAuthorsToArticles(result.docs as RawDoc[]);
  }, []);
};

export const searchSuggestions = async (query: string) => {
  const q = query.trim();
  if (q.length < 2) {
    return [];
  }

  return safeRun(async () => {
    const payload = await getPayloadClient();
    const [calculatorResults, categoryResults, articleResults] = await Promise.all([
      payload.find({
        collection: "calculators",
        draft: false,
        depth: 2,
        limit: 8,
        where: { title: { like: q } },
      }),
      payload.find({
        collection: "calculator-categories",
        draft: false,
        depth: 0,
        limit: 5,
        where: { name: { like: q } },
      }),
      payload.find({
        collection: "articles",
        draft: false,
        depth: 0,
        limit: 5,
        where: { title: { like: q } },
      }),
    ]);

    const suggestions = [
      ...calculatorResults.docs.map((doc) => {
        const calculator = mapCalculator(doc as RawDoc);
        return {
          type: "calculator",
          label: calculator.title,
          url: buildCalculatorPath(calculator),
          secondary: calculator.category?.name ?? "Calculator",
        };
      }),
      ...categoryResults.docs.map((doc) => {
        const category = mapCategory(doc as RawDoc);
        return {
          type: "category",
          label: category.name,
          url: buildCategoryPath(category.slug),
          secondary: "Categorie",
        };
      }),
      ...articleResults.docs.map((doc) => {
        const article = mapArticle(doc as RawDoc);
        return {
          type: "article",
          label: article.title,
          url: buildArticlePath(article.slug),
          secondary: "Articol",
        };
      }),
    ];

    const deduped = new Map<string, (typeof suggestions)[number]>();
    for (const item of suggestions) {
      const key = item.url ?? `${item.type}:${item.label}`;
      if (!deduped.has(key)) {
        deduped.set(key, item);
      }
    }

    return Array.from(deduped.values());
  }, []);
};

