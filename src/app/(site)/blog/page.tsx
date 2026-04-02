import { ArticleCard } from "@/components/article-card";
import { JsonLd } from "@/components/json-ld";
import { buildArticlePath } from "@/lib/content";
import { listRecentArticles } from "@/lib/content";
import { fallbackArticles } from "@/lib/frontend-fallbacks";
import {
  buildBreadcrumbJsonLd,
  buildCollectionJsonLd,
  buildItemListJsonLd,
  buildMetadata,
} from "@/lib/seo";

export const revalidate = 900;

export const metadata = buildMetadata({
  title: "Blog calculatoare online - ghiduri si explicatii",
  description:
    "Citeste ghiduri despre BMI, calorii, consum auto, conversii si alte subiecte care completeaza calculatoarele online.",
  path: "/blog",
});

export default async function BlogIndexPage() {
  const articles = await listRecentArticles(40);
  const displayArticles = articles.length ? articles : fallbackArticles;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          buildCollectionJsonLd({
            name: "Blog calculatoare online",
            description:
              "Ghiduri si explicatii care completeaza calculatoarele online cu exemple, context si interpretari clare.",
            path: "/blog",
          }),
          buildBreadcrumbJsonLd([
            { name: "Acasa", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
          buildItemListJsonLd({
            name: "Articole recente",
            path: "/blog",
            items: displayArticles.map((article) => ({
              name: article.title,
              path: buildArticlePath(article.slug),
            })),
          }),
        ]}
      />
      <section className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-slate-950 px-6 py-8 text-white shadow-[0_35px_100px_-60px_rgba(15,23,42,0.9)] sm:px-8 sm:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(124,227,189,0.22),transparent_28%),radial-gradient(circle_at_88%_16%,rgba(244,184,96,0.14),transparent_24%),linear-gradient(135deg,rgba(5,11,20,0.98)_0%,rgba(9,20,33,0.96)_52%,rgba(19,35,49,0.94)_100%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-300">
              Blog si explicatii
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              Ghiduri care explica rezultatele si contextul din spatele fiecarui calculator.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
              Articolele completeaza paginile de calculator cu explicatii, exemple, interpretari si raspunsuri la intrebarile pe care utilizatorii le cauta cel mai des.
            </p>
          </div>
          <div className="rounded-[1.9rem] border border-white/12 bg-white/6 p-5 backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-200/80">Publicare controlata</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Publicam gradual, dupa review editorial si verificari SEO, pentru ca fiecare articol sa intre intr-un cluster util si sa poata sustine paginile functionale relevante.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
        <div>
          <p className="section-kicker">Biblioteca editoriala</p>
          <h2 className="mt-4 section-title">Articole scrise pentru claritate, nu pentru volum.</h2>
          <p className="mt-5 section-copy max-w-md">
            Fiecare ghid trebuie sa raspunda unei intrebari reale, sa faca legatura cu un calculator potrivit si sa ofere suficient context incat utilizatorul sa poata continua informat.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {displayArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    </div>
  );
}
