import { ArticleCard } from "@/components/article-card";
import { CalculatorCard } from "@/components/calculator-card";
import { EditorialBlocks } from "@/components/editorial-blocks";
import { JsonLd } from "@/components/json-ld";
import {
  getCategoryBySlug,
  listArticlesByCategory,
  listCalculatorsByCategory,
} from "@/lib/content";
import {
  buildBreadcrumbJsonLd,
  buildCollectionJsonLd,
  buildMetadata,
} from "@/lib/seo";
import { recordNotFoundEvent } from "@/lib/routing";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

type Params = Promise<{ categorySlug: string }>;

export const revalidate = 900;

export async function generateMetadata({ params }: { params: Params }) {
  const { categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    return buildMetadata({
      title: "Categoria nu exista",
      description: "Categoria cautata nu a fost gasita.",
      path: `/calculatoare/${categorySlug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: category.seo?.metaTitle ?? `${category.name} - calculatoare online`,
    description: category.seo?.metaDescription ?? category.summary ?? `Calculatoare din categoria ${category.name}.`,
    path: category.seo?.canonicalPath ?? `/calculatoare/${category.slug}`,
    noIndex: category.seo?.noIndex,
  });
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    const headerStore = await headers();
    await recordNotFoundEvent({
      path: `/calculatoare/${categorySlug}`,
      referer: headerStore.get("referer"),
      userAgent: headerStore.get("user-agent"),
      method: "GET",
      source: "category-route",
    });
    notFound();
  }

  const [calculators, articles] = await Promise.all([
    listCalculatorsByCategory(category.id, 100),
    listArticlesByCategory({ categoryID: category.id, limit: 8 }),
  ]);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          buildCollectionJsonLd({
            name: `Calculatoare ${category.name}`,
            description: category.summary ?? `Hub pentru ${category.name}.`,
            path: `/calculatoare/${category.slug}`,
          }),
          buildBreadcrumbJsonLd([
            { name: "Acasa", path: "/" },
            { name: "Calculatoare", path: "/calculatoare" },
            { name: category.name, path: `/calculatoare/${category.slug}` },
          ]),
        ]}
      />

      <section className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-slate-950 px-6 py-8 text-white shadow-[0_35px_100px_-60px_rgba(15,23,42,0.9)] sm:px-8 sm:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,227,189,0.2),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(244,184,96,0.18),transparent_22%),linear-gradient(135deg,rgba(2,6,23,0.95)_0%,rgba(15,23,42,0.95)_45%,rgba(6,78,59,0.84)_100%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-300">Categorie</p>
            <h1 className="mt-4 text-4xl font-black sm:text-5xl">{category.name}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
              {category.introContent ?? category.summary}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-[1.7rem] border border-white/12 bg-white/6 p-5 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-200/80">Hub activ</p>
              <p className="mt-3 text-4xl font-black text-white">{calculators.length}</p>
              <p className="mt-2 text-sm text-slate-300">calculatoare disponibile in categorie</p>
            </article>
            <article className="rounded-[1.7rem] border border-white/12 bg-white/6 p-5 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200/80">Context editorial</p>
              <p className="mt-3 text-4xl font-black text-white">{articles.length}</p>
              <p className="mt-2 text-sm text-slate-300">ghiduri si articole asociate</p>
            </article>
          </div>
        </div>
      </section>

      {category.contentBlocks.length > 0 ? (
        <section className="mt-10">
          <EditorialBlocks blocks={category.contentBlocks} />
        </section>
      ) : null}

      <section className="mt-12 grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
        <div>
          <p className="section-kicker">Calculatoare din categorie</p>
          <h2 className="mt-4 section-title">Alege rapid instrumentul potrivit, fara sa iesi din acelasi flux de cautare.</h2>
          <p className="mt-5 section-copy max-w-md">
            Pagina categoriei reuneste tool-uri apropiate ca intentie si te lasa sa continui fie catre un calculator specific, fie catre continutul care explica mai bine rezultatele.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {calculators.map((calculator) => (
            <CalculatorCard key={calculator.id} calculator={calculator} />
          ))}
        </div>
      </section>

      {articles.length > 0 ? (
        <section className="mt-14 grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div>
            <p className="section-kicker">Ghiduri relevante</p>
            <h2 className="mt-4 section-title">Explicatiile completeaza calculul si reduc ambiguitatea.</h2>
            <p className="mt-5 section-copy max-w-md">
              Articolele din jurul categoriei clarifica formulele, interpretarile uzuale si scenariile in care utilizatorul are nevoie sa compare mai multe calcule apropiate.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
