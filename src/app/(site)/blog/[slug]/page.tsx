import { AdSlotLazy } from "@/components/ad-slot-lazy";
import { AudienceBadge } from "@/components/audience-badge";
import { CommercialCtaPanel } from "@/components/commercial-cta-panel";
import { JsonLd } from "@/components/json-ld";
import {
  buildArticlePath,
  buildAuthorPath,
  getArticleBySlug,
  listSuggestedArticles,
  listSuggestedCalculatorsForArticle,
} from "@/lib/content";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildMetadata,
  buildPersonJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo";
import { recordNotFoundEvent } from "@/lib/routing";
import { adsConfig } from "@/lib/ads";
import { getCommercialCta } from "@/lib/commercial-cta";
import { organizationConfig } from "@/lib/site";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;

export const revalidate = 900;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return buildMetadata({
      title: "Articol inexistent",
      description: "Articolul cautat nu a fost gasit.",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: article.seo?.metaTitle ?? article.title,
    description: article.seo?.metaDescription ?? article.excerpt,
    path: article.seo?.canonicalPath ?? `/blog/${article.slug}`,
    noIndex: article.seo?.noIndex,
  });
}

export default async function BlogArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    const headerStore = await headers();
    await recordNotFoundEvent({
      path: `/blog/${slug}`,
      referer: headerStore.get("referer"),
      userAgent: headerStore.get("user-agent"),
      method: "GET",
      source: "blog-route",
    });
    notFound();
  }

  const [suggestedArticles, suggestedCalculators] = await Promise.all([
    listSuggestedArticles({ article, limit: 4 }),
    listSuggestedCalculatorsForArticle({ article, limit: 6 }),
  ]);
  const quickLinks = [
    ...(suggestedCalculators[0]
      ? [
          {
            href:
              suggestedCalculators[0].category?.slug && suggestedCalculators[0].slug
                ? `/calculatoare/${suggestedCalculators[0].category.slug}/${suggestedCalculators[0].slug}`
                : "/calculatoare",
            label: "Calculator util",
          },
        ]
      : []),
    ...(article.relatedCategory?.slug
      ? [
          {
            href: `/calculatoare/${article.relatedCategory.slug}`,
            label: "Hub categorie",
          },
        ]
      : []),
    {
      href: "#articole-conexe",
      label: "Articole conexe",
    },
  ];
  const commercialCta = getCommercialCta({
    categorySlug: article.relatedCategory?.slug,
    audience: article.audience,
    kind: "article",
    sourcePath: `/blog/${article.slug}`,
  });

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            name: article.title,
            description: article.excerpt,
            path: `/blog/${article.slug}`,
          }),
          buildArticleJsonLd({
            title: article.title,
            description: article.excerpt,
            path: `/blog/${article.slug}`,
            publishedAt: article.publishedAt,
            modifiedAt: article.updatedAt,
            imageURL: article.coverImageURL,
            articleSection: article.relatedCategory?.name ?? article.articleType,
            author: article.author
              ? {
                  name: article.author.name,
                  path: buildAuthorPath(article.author),
                  description: article.author.bio,
                  jobTitle: article.author.jobTitle,
                  imageURL: article.author.avatarURL,
                }
              : undefined,
          }),
          ...(article.author
            ? [
                buildPersonJsonLd({
                  name: article.author.name,
                  path: buildAuthorPath(article.author),
                  description: article.author.bio,
                  jobTitle: article.author.jobTitle,
                  imageURL: article.author.avatarURL,
                  expertise: article.author.expertise,
                }),
              ]
            : []),
          buildBreadcrumbJsonLd([
            { name: "Acasa", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: article.title, path: `/blog/${article.slug}` },
          ]),
        ]}
      />

      <article className="paper-panel rounded-[2.4rem] p-6 sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700">{article.articleType}</p>
        <div className="mt-3">
          <AudienceBadge audience={article.audience} />
        </div>
        <h1 className="mt-3 text-4xl font-black leading-tight text-slate-950 sm:text-5xl">{article.title}</h1>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
          {article.publishedAt ? (
            <span>Publicat: {new Date(article.publishedAt).toLocaleDateString("ro-RO")}</span>
          ) : null}
          {article.updatedAt && article.updatedAt !== article.publishedAt ? (
            <span>Actualizat: {new Date(article.updatedAt).toLocaleDateString("ro-RO")}</span>
          ) : null}
          {article.author ? (
            <Link href={buildAuthorPath(article.author)} className="font-medium text-emerald-700 hover:underline">
              Autor: {article.author.name}
            </Link>
          ) : null}
          <span>{organizationConfig.projectName}</span>
        </div>
        <p className="mt-5 text-base leading-8 text-slate-700">{article.excerpt}</p>

        <section className="mt-8 rounded-[1.6rem] border border-slate-200 bg-slate-50/90 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700">
            Pe scurt
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Ce afli rapid din acest articol
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                Articolul iti explica {article.relatedCategory?.name?.toLowerCase() ?? "subiectul"} intr-un mod orientat spre decizie, nu doar spre definitii. Daca vrei sa aplici imediat informatia, continua cu calculatorul sau categoria cea mai apropiata.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <article className="rounded-[1.2rem] border border-white bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
                  Subiect
                </p>
                <p className="mt-2 text-sm font-bold text-slate-950">
                  {article.relatedCategory?.name ?? article.articleType}
                </p>
              </article>
              <article className="rounded-[1.2rem] border border-white bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-700">
                  Tip pagina
                </p>
                <p className="mt-2 text-sm font-bold text-slate-950">
                  {article.articleType}
                </p>
              </article>
              <article className="rounded-[1.2rem] border border-white bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">
                  Urmator pas
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {quickLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:border-emerald-400 hover:text-emerald-700"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </section>

        <div className="mt-8 space-y-5">
          {article.content.split("\n").map((paragraph, index) =>
            paragraph.trim().length > 0 ? (
              <p key={`${index}-${paragraph.slice(0, 12)}`} className="text-base leading-8 text-slate-800">
                {paragraph}
              </p>
            ) : null
          )}
        </div>
      </article>

      {adsConfig.slots.articleInline ? (
        <section className="cv-auto mt-8">
          <AdSlotLazy
            slot={adsConfig.slots.articleInline}
            label="Publicitate relevanta"
            className="mx-auto max-w-[980px]"
          />
        </section>
      ) : null}

      {commercialCta ? (
        <section className="cv-auto mt-8">
          <CommercialCtaPanel cta={commercialCta} />
        </section>
      ) : null}

      {suggestedCalculators.length > 0 ? (
        <section id="articole-conexe" className="cv-auto paper-panel mt-8 rounded-[2rem] p-6">
          <h2 className="text-2xl font-black text-slate-900">Calculatoare utile din acelasi subiect</h2>
          <p className="mt-2 text-sm leading-7 text-slate-700">Daca vrei sa aplici imediat informatia din articol, incepe cu unul dintre calculatoarele legate direct de subiect.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestedCalculators.map((calculator) => (
              <Link
                key={calculator.id}
                href={calculator.category?.slug && calculator.slug
                  ? `/calculatoare/${calculator.category.slug}/${calculator.slug}`
                  : "/calculatoare"}
                className="rounded-full border border-slate-300 bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-emerald-400 hover:text-emerald-700"
              >
                {calculator.title ?? calculator.slug}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {suggestedArticles.length > 0 ? (
        <section className="cv-auto paper-panel mt-8 rounded-[2rem] p-6">
          <h2 className="text-2xl font-black text-slate-900">Articole conexe</h2>
          <p className="mt-2 text-sm leading-7 text-slate-700">Continua cu ghiduri apropiate daca vrei sa aprofundezi sau sa compari mai multe perspective asupra aceluiasi subiect.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {suggestedArticles.map((related) => (
              <Link
                key={related.id}
                href={buildArticlePath(related.slug)}
                className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 transition-colors hover:border-emerald-300 hover:bg-emerald-50/60"
              >
                <h3 className="text-base font-bold text-slate-950">{related.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {article.relatedCategory?.slug ? (
        <section className="cv-auto paper-panel mt-8 rounded-[2rem] p-6">
          <h2 className="text-xl font-black text-slate-900">Continua in hub-ul categoriei</h2>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            Daca vrei sa mergi din articol spre tool-uri si pagini din acelasi cluster, continua in categoria{" "}
            <Link
              href={`/calculatoare/${article.relatedCategory.slug}`}
              className="font-semibold text-emerald-700 hover:underline"
            >
              {article.relatedCategory.name ?? article.relatedCategory.slug}
            </Link>
            .
          </p>
        </section>
      ) : null}

      <section className="cv-auto paper-panel mt-8 rounded-[2rem] p-6">
        <h2 className="text-xl font-black text-slate-900">Feedback si corectii</h2>
        <p className="mt-2 text-sm leading-7 text-slate-700">
          Daca observi o informatie incorecta sau o explicatie care trebuie imbunatatita, ne poti scrie la{" "}
          <a href={`mailto:${organizationConfig.correctionsEmail}`} className="font-semibold text-emerald-700 hover:underline">
            {organizationConfig.correctionsEmail}
          </a>
          .
        </p>
      </section>

      <div className="mt-6">
        <Link href="/blog" className="text-sm font-semibold text-emerald-700 hover:underline">
          Inapoi la blog
        </Link>
      </div>
    </div>
  );
}
