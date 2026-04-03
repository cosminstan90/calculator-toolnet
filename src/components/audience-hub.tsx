import { AdSlot } from "@/components/ad-slot";
import { ArticleCard } from "@/components/article-card";
import { CalculatorCard } from "@/components/calculator-card";
import { CategoryCard } from "@/components/category-card";
import { JsonLd } from "@/components/json-ld";
import { adsConfig } from "@/lib/ads";
import type { Article, CalculatorCategory, CalculatorDoc } from "@/lib/content";
import { buildCalculatorPath } from "@/lib/content";
import {
  buildBreadcrumbJsonLd,
  buildCollectionJsonLd,
  buildItemListJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo";
import Link from "next/link";

type AudienceHubProps = {
  badge: string;
  title: string;
  description: string;
  path: string;
  spotlightLabel: string;
  spotlightDescription: string;
  audienceLabel: string;
  decisionPillars: string[];
  categories: CalculatorCategory[];
  calculators: CalculatorDoc[];
  articles: Article[];
};

export const AudienceHub = ({
  badge,
  title,
  description,
  path,
  spotlightLabel,
  spotlightDescription,
  audienceLabel,
  decisionPillars,
  categories,
  calculators,
  articles,
}: AudienceHubProps) => {
  const spotlightCalculator = calculators[0];
  const supportCalculators = calculators.slice(1, 7);
  const jsonLd = [
    buildCollectionJsonLd({
      name: title,
      description,
      path,
    }),
    buildWebPageJsonLd({
      name: title,
      description,
      path,
    }),
    buildBreadcrumbJsonLd([
      { name: "Acasa", path: "/" },
      { name: audienceLabel, path },
    ]),
    buildItemListJsonLd({
      name: `${title} - calculatoare recomandate`,
      path,
      items: calculators.slice(0, 10).map((calculator) => ({
        name: calculator.title,
        path: buildCalculatorPath(calculator),
      })),
    }),
  ];

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <JsonLd data={jsonLd} />

      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950 px-6 py-8 text-white shadow-[0_40px_120px_-70px_rgba(15,23,42,0.92)] sm:px-8 sm:py-10 lg:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(124,227,189,0.22),transparent_24%),radial-gradient(circle_at_88%_18%,rgba(244,184,96,0.18),transparent_22%),linear-gradient(135deg,rgba(4,11,20,0.98)_0%,rgba(10,23,37,0.95)_52%,rgba(16,34,53,0.92)_100%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-300">
              {badge}
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">{description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/calculatoare"
                className="rounded-full bg-emerald-300 px-5 py-3 text-sm font-semibold text-slate-950 transition-transform duration-200 hover:-translate-y-0.5"
              >
                Vezi toate calculatoarele
              </Link>
              <Link
                href="/blog"
                className="rounded-full border border-white/15 bg-white/6 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:border-emerald-300/40 hover:bg-white/10"
              >
                Vezi ghidurile
              </Link>
            </div>
          </div>

          <article className="rounded-[2rem] border border-white/12 bg-white/6 p-6 backdrop-blur-md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200/80">
              {spotlightLabel}
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-300">{spotlightDescription}</p>
            <div className="mt-6 grid gap-3">
              {decisionPillars.map((pillar) => (
                <div
                  key={pillar}
                  className="rounded-[1.2rem] border border-white/10 bg-slate-950/35 px-4 py-3 text-sm font-medium text-slate-100"
                >
                  {pillar}
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="mt-12 grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
        <div>
          <p className="section-kicker">Navigare rapida</p>
          <h2 className="mt-4 section-title">Incepe din clusterul potrivit, apoi mergi direct la calculul sau ghidul de care ai nevoie.</h2>
          <p className="mt-5 section-copy max-w-md">
            Hub-ul este organizat pentru {audienceLabel.toLowerCase()}, astfel incat sa combini raspunsul rapid cu contextul necesar unei decizii bune.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {spotlightCalculator ? (
        <section className="mt-20 grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <p className="section-kicker">Start recomandat</p>
            <h2 className="mt-4 section-title">Calculatorul care te pune rapid pe directia buna.</h2>
            <p className="mt-5 section-copy max-w-md">
              Am ales un punct de intrare puternic pentru acest hub, apoi l-am completat cu pagini care merg natural mai departe in aceeasi decizie.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <CalculatorCard calculator={spotlightCalculator} />
            {supportCalculators.map((calculator) => (
              <CalculatorCard key={calculator.id} calculator={calculator} />
            ))}
          </div>
        </section>
      ) : null}

      {adsConfig.slots.calculatorsHubInline ? (
        <section className="mt-12">
          <AdSlot
            slot={adsConfig.slots.calculatorsHubInline}
            label="Mesaj sponsorizat"
            className="mx-auto max-w-[980px]"
          />
        </section>
      ) : null}

      <section className="mt-20 grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
        <div>
          <p className="section-kicker">Ghiduri suport</p>
          <h2 className="mt-4 section-title">Articole care traduc rezultatele in decizii si pasi concreti.</h2>
          <p className="mt-5 section-copy max-w-md">
            Nu vrem doar un raspuns numeric. Vrem si context: interpretare, capcane, comparatii si pasii urmatori potriviti.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      <section className="paper-panel mt-24 rounded-[2.4rem] px-6 py-8 sm:px-8 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="section-kicker">Mai departe</p>
            <h2 className="mt-4 text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
              Continua din hub-ul {audienceLabel.toLowerCase()} spre paginile care iti economisesc timp si clarifica decizia.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link
              href="/calculatoare"
              className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5"
            >
              Index complet
            </Link>
            <Link
              href="/metodologie"
              className="rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-900 transition-colors hover:border-emerald-300 hover:text-emerald-700"
            >
              Cum construim paginile
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
