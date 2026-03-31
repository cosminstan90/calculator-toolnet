import { ArticleCard } from "@/components/article-card";
import { CalculatorCard } from "@/components/calculator-card";
import { CategoryCard } from "@/components/category-card";
import { EditorialBlocks } from "@/components/editorial-blocks";
import { JsonLd } from "@/components/json-ld";
import {
  buildCalculatorPath,
  getHomepageContent,
  listCategories,
  listFeaturedCalculators,
  listRecentArticles,
} from "@/lib/content";
import {
  fallbackArticles,
  fallbackCalculators,
  fallbackCategories,
  fallbackHeroHighlights,
} from "@/lib/frontend-fallbacks";
import { buildOrganizationJsonLd, buildWebsiteJsonLd } from "@/lib/seo";
import Link from "next/link";

export const revalidate = 900;

export default async function HomePage() {
  const [homepage, categories, calculators, articles] = await Promise.all([
    getHomepageContent(),
    listCategories(8),
    listFeaturedCalculators(8),
    listRecentArticles(4),
  ]);

  const displayCategories = categories.length ? categories : fallbackCategories;
  const displayCalculators = calculators.length ? calculators : fallbackCalculators;
  const displayArticles = articles.length ? articles : fallbackArticles;
  const heroHighlights = homepage?.heroHighlights.length
    ? homepage.heroHighlights
    : fallbackHeroHighlights;
  const spotlightCalculator = displayCalculators[0];
  const supportCalculators = displayCalculators.slice(1, 5);

  return (
    <>
      <JsonLd data={[buildOrganizationJsonLd(), buildWebsiteJsonLd()]} />

      <section className="relative overflow-hidden border-b border-white/10 bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(124,227,189,0.26),transparent_28%),radial-gradient(circle_at_88%_14%,rgba(244,184,96,0.18),transparent_24%),linear-gradient(135deg,rgba(4,11,20,0.98)_0%,rgba(8,18,31,0.94)_46%,rgba(14,35,54,0.96)_100%)]" />
        <div className="absolute right-[10%] top-20 h-56 w-56 rounded-full border border-white/10 bg-emerald-200/10 blur-3xl drift-slow pulse-glow" />
        <div className="mx-auto grid min-h-[calc(100svh-81px)] w-full max-w-[1600px] lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
          <div className="relative flex items-center px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="hero-fade max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-emerald-300">
                {homepage?.heroBadge ?? "Calculatoare online clare si rapide"}
              </p>
              <h1 className="mt-5 text-5xl font-black leading-[0.92] text-white sm:text-6xl xl:text-7xl">
                {homepage?.heroTitle ?? "Calcule utile, explicate pe inteles si gata de folosit."}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                {homepage?.heroDescription ?? "Gasesti calculatoare pentru fitness, auto, energie si conversii, fiecare insotit de formula, exemple, FAQ si legaturi catre resurse relevante."}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={homepage?.primaryCTA?.href ?? "/calculatoare"} className="rounded-full bg-emerald-300 px-6 py-3 text-sm font-semibold text-slate-950 transition-transform duration-200 hover:-translate-y-0.5">
                  {homepage?.primaryCTA?.label ?? "Vezi toate calculatoarele"}
                </Link>
                <Link href={homepage?.secondaryCTA?.href ?? "/metodologie"} className="rounded-full border border-white/15 bg-white/6 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:border-emerald-300/40 hover:bg-white/10">
                  {homepage?.secondaryCTA?.label ?? "Cum construim paginile"}
                </Link>
              </div>
              <div className="mt-12 grid gap-5 border-t border-white/10 pt-6 sm:grid-cols-3">
                {heroHighlights.map((highlight, index) => (
                  <article key={`${highlight.label}-${index}`}>
                    <p className="text-2xl font-black text-white sm:text-3xl">{highlight.value}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{highlight.label}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="relative border-t border-white/10 px-4 py-8 sm:px-6 lg:border-l lg:border-t-0 lg:px-8 lg:py-12">
            <div className="absolute inset-y-0 left-0 hidden w-px bg-gradient-to-b from-transparent via-white/12 to-transparent lg:block" />
            <div className="grid h-full content-end gap-6 section-rise">
              <article className="rounded-[2.2rem] border border-white/12 bg-white/6 p-6 backdrop-blur-md">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-200/80">
                  Cauta pe categorii
                </p>
                <h2 className="mt-4 max-w-sm text-3xl font-black leading-tight text-white">
                  Intri din categorie, continui cu calculatorul potrivit si aprofundezi cand ai nevoie.
                </h2>
                <div className="mt-8 space-y-4">
                  {displayCategories.slice(0, 4).map((category, index) => (
                    <Link key={category.id} href={`/calculatoare/${category.slug}`} className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <h3 className="mt-1 text-xl font-black text-white">{category.name}</h3>
                      </div>
                      <p className="max-w-[14rem] text-right text-sm leading-6 text-slate-300">{category.summary}</p>
                    </Link>
                  ))}
                </div>
              </article>

              {spotlightCalculator ? (
                <Link href={buildCalculatorPath(spotlightCalculator)} className="rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_100%)] p-6 transition duration-300 hover:border-emerald-300/40">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-200/80">
                    Calculator recomandat
                  </p>
                  <h3 className="mt-3 text-2xl font-black text-white">{spotlightCalculator.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{spotlightCalculator.shortDescription}</p>
                  <p className="mt-6 text-sm font-semibold text-emerald-200">Deschide calculatorul</p>
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1440px] px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        <section className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div>
            <p className="section-kicker">Categorii principale</p>
            <h2 className="mt-4 section-title">Hub-uri care te duc repede la raspunsul de care ai nevoie.</h2>
            <p className="mt-5 section-copy max-w-md">
              Fiecare categorie reuneste calculatoare apropiate ca intentie si face legatura catre explicatii utile, astfel incat navigarea sa ramana simpla si coerenta.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {displayCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        <section className="mt-24 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="section-kicker">Calculatoare populare</p>
            <h2 className="mt-4 section-title">Instrumente gandite pentru uz rapid, dar suficient de bine explicate incat sa inspire incredere.</h2>
            <p className="mt-5 section-copy max-w-lg">
              Pagina unui calculator nu se opreste la rezultat. Ea trebuie sa explice formula, sa ofere exemple si sa trimita mai departe catre pagini sau articole apropiate.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {supportCalculators.map((calculator) => (
              <CalculatorCard key={calculator.id} calculator={calculator} />
            ))}
          </div>
        </section>

        {homepage?.contentBlocks.length ? (
          <section className="mt-24">
            <EditorialBlocks blocks={homepage.contentBlocks} />
          </section>
        ) : null}

        <section className="mt-24 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="section-kicker">Ghiduri si explicatii</p>
            <h2 className="mt-4 section-title">Articolele completeaza calculele cu context, interpretare si exemple reale.</h2>
            <p className="mt-5 section-copy max-w-md">
              Blogul sustine cautarile informationale si ajuta utilizatorul sa inteleaga ce inseamna rezultatul obtinut, cand il poate folosi si ce limitari trebuie avute in vedere.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {displayArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>

        <section className="paper-panel mt-24 rounded-[2.4rem] px-6 py-8 sm:px-8 sm:py-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="section-kicker">Mai departe</p>
              <h2 className="mt-4 text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
                Incepe cu calculatorul potrivit, apoi continua cu explicatiile care te ajuta sa folosesti corect rezultatul.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href="/calculatoare" className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5">
                Exploreaza calculatoarele
              </Link>
              <Link href="/contact" className="rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-900 transition-colors hover:border-emerald-300 hover:text-emerald-700">
                Pune o intrebare
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
