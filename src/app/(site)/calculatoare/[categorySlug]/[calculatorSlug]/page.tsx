import { AdSlot } from "@/components/ad-slot";
import { CalculatorCard } from "@/components/calculator-card";
import { CalculatorRunner } from "@/components/calculator-runner";
import { DecisionSupportPanel } from "@/components/decision-support-panel";
import { EditorialBlocks } from "@/components/editorial-blocks";
import { JsonLd } from "@/components/json-ld";
import {
  buildArticlePath,
  buildCalculatorPath,
  getCalculatorByRoute,
  listSuggestedArticlesForCalculator,
  listRelatedCalculators,
} from "@/lib/content";
import {
  buildBreadcrumbJsonLd,
  buildFAQJsonLd,
  buildHowToJsonLd,
  buildMetadata,
  buildWebApplicationJsonLd,
} from "@/lib/seo";
import { adsConfig } from "@/lib/ads";
import { buildDecisionSupport } from "@/lib/decision-support";
import { recordNotFoundEvent } from "@/lib/routing";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";

type Params = Promise<{ categorySlug: string; calculatorSlug: string }>;

export const revalidate = 900;

const splitParagraphs = (value: string) =>
  value
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export async function generateMetadata({ params }: { params: Params }) {
  const { categorySlug, calculatorSlug } = await params;
  const calculator = await getCalculatorByRoute({ categorySlug, calculatorSlug });

  if (!calculator) {
    return buildMetadata({
      title: "Calculator inexistent",
      description: "Calculatorul cautat nu a fost gasit.",
      path: `/calculatoare/${categorySlug}/${calculatorSlug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: calculator.seo?.metaTitle ?? calculator.title,
    description: calculator.seo?.metaDescription ?? calculator.shortDescription,
    path: calculator.seo?.canonicalPath ?? `/calculatoare/${categorySlug}/${calculator.slug}`,
    noIndex: calculator.seo?.noIndex,
  });
}

export default async function CalculatorPage({ params }: { params: Params }) {
  const { categorySlug, calculatorSlug } = await params;
  const calculator = await getCalculatorByRoute({ categorySlug, calculatorSlug });

  if (!calculator) {
    const headerStore = await headers();
    await recordNotFoundEvent({
      path: `/calculatoare/${categorySlug}/${calculatorSlug}`,
      referer: headerStore.get("referer"),
      userAgent: headerStore.get("user-agent"),
      method: "GET",
      source: "calculator-route",
    });
    notFound();
  }

  const [relatedCalculators, suggestedArticles] = await Promise.all([
    listRelatedCalculators(calculator, 6),
    listSuggestedArticlesForCalculator({ calculator, limit: 4 }),
  ]);
  const seoParagraphs = splitParagraphs(calculator.seoBody);
  const interpretationParagraphs = splitParagraphs(calculator.interpretationNotes);
  const contextualCalculatorLinks = relatedCalculators.slice(0, 3);
  const contextualArticleLinks = suggestedArticles.filter((item) => item.slug);
  const decisionSupport = buildDecisionSupport(calculator);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Acasa", path: "/" },
            { name: "Calculatoare", path: "/calculatoare" },
            {
              name: calculator.category?.name ?? "Categorie",
              path: `/calculatoare/${categorySlug}`,
            },
            {
              name: calculator.title,
              path: `/calculatoare/${categorySlug}/${calculator.slug}`,
            },
          ]),
          buildWebApplicationJsonLd({
            name: calculator.title,
            description: calculator.shortDescription,
            path: `/calculatoare/${categorySlug}/${calculator.slug}`,
            applicationCategory: calculator.category?.name ?? "Calculator",
          }),
          buildHowToJsonLd({
            name: calculator.title,
            description: calculator.shortDescription,
            path: `/calculatoare/${categorySlug}/${calculator.slug}`,
            steps: calculator.howToSteps,
          }),
          ...(calculator.faq.length > 0 ? [buildFAQJsonLd(calculator.faq)] : []),
        ]}
      />

      <section className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-slate-950 p-6 text-white shadow-[0_35px_100px_-60px_rgba(15,23,42,0.9)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(124,227,189,0.22),transparent_30%),radial-gradient(circle_at_88%_16%,rgba(244,184,96,0.14),transparent_24%),linear-gradient(140deg,rgba(4,11,20,0.98)_0%,rgba(8,18,31,0.95)_54%,rgba(12,38,51,0.94)_100%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-300">
              {calculator.category?.name ?? "Calculator"}
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">{calculator.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">{calculator.intro}</p>
            {calculator.publishedAt || calculator.updatedAt ? (
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-300/85">
                {calculator.publishedAt ? (
                  <span>Publicat: {formatDate(calculator.publishedAt)}</span>
                ) : null}
                {calculator.updatedAt && calculator.updatedAt !== calculator.publishedAt ? (
                  <span>Actualizat: {formatDate(calculator.updatedAt)}</span>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-[1.7rem] border border-white/12 bg-white/6 p-5 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200/80">Formula folosita</p>
              <p className="mt-3 text-lg font-bold text-white">{calculator.formulaName}</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">{calculator.formulaExpression}</p>
            </article>
            <article className="rounded-[1.7rem] border border-white/12 bg-white/6 p-5 backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/80">Ce gasesti pe pagina</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">Calculator live, explicatie de formula, exemple de calcul, FAQ si legaturi catre pagini conexe.</p>
            </article>
          </div>
        </div>
      </section>

      <div className="mt-8">
        <CalculatorRunner calculatorKey={calculator.calculatorKey} />
      </div>

      {adsConfig.slots.calculatorInline ? (
        <section className="mt-8">
          <AdSlot
            slot={adsConfig.slots.calculatorInline}
            label="Publicitate"
            className="mx-auto max-w-[980px]"
          />
        </section>
      ) : null}

      <section className="mt-10">
        <DecisionSupportPanel data={decisionSupport} />
      </section>

      <section className="paper-panel mt-10 rounded-[2rem] p-6 sm:p-8">
        <p className="section-kicker">Formula explicata</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <h2 className="text-3xl font-black text-slate-950">{calculator.formulaName}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">{calculator.formulaExpression}</p>
          </div>
          <p className="text-sm leading-8 text-slate-700">
            {calculator.formulaDescription}
          </p>
        </div>
      </section>

      <section className="paper-panel mt-10 rounded-[2rem] p-6 sm:p-8">
        <p className="section-kicker">Exemple de calcul</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {calculator.examples.map((example, index) => (
            <article key={`${example.title}-${index}`} className="rounded-[1.4rem] border border-slate-300/70 bg-white/70 p-4">
              <h3 className="text-lg font-black text-slate-950">{example.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-700">{example.narrative}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="paper-panel mt-10 rounded-[2rem] p-6 sm:p-8">
        <p className="section-kicker">Interpretare si context</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            {seoParagraphs.map((paragraph, index) => (
              <p key={`seo-paragraph-${index}`} className="text-sm leading-8 text-slate-700">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="space-y-4">
            {interpretationParagraphs.map((paragraph, index) => (
              <p key={`interpretation-paragraph-${index}`} className="text-sm leading-8 text-slate-700">
                {paragraph}
              </p>
            ))}
            {contextualCalculatorLinks.length > 0 || contextualArticleLinks.length > 0 ? (
              <div className="rounded-[1.4rem] border border-emerald-200 bg-emerald-50/80 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700">
                  Continua cu pagini relevante
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-700">
                  Pentru context suplimentar, continua cu{" "}
                  {contextualCalculatorLinks.map((item, index) => (
                    <Fragment key={`calculator-link-${item.id}`}>
                      {index > 0 ? ", " : null}
                      <Link
                        href={buildCalculatorPath(item)}
                        className="font-semibold text-emerald-700 underline decoration-emerald-300 underline-offset-4"
                      >
                        {item.title ?? item.slug}
                      </Link>
                    </Fragment>
                  ))}
                  {contextualCalculatorLinks.length > 0 && contextualArticleLinks.length > 0
                    ? " si "
                    : null}
                  {contextualArticleLinks.map((item, index) => (
                    <Fragment key={`article-link-${item.id}`}>
                      {index > 0 ? ", " : null}
                      <Link
                        href={buildArticlePath(item.slug ?? "")}
                        className="font-semibold text-emerald-700 underline decoration-emerald-300 underline-offset-4"
                      >
                        {item.title ?? item.slug}
                      </Link>
                    </Fragment>
                  ))}
                  .
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {calculator.contentBlocks.length > 0 ? (
        <section className="mt-10">
          <EditorialBlocks blocks={calculator.contentBlocks} />
        </section>
      ) : null}

      {calculator.faq.length > 0 ? (
        <section className="paper-panel mt-10 rounded-[2rem] p-6">
          <h2 className="text-2xl font-bold text-slate-950">Intrebari frecvente</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700">Intrebarile de mai jos clarifica modul de calcul, interpretarea uzuala si situatiile in care merita sa compari mai multe scenarii.</p>
          <div className="mt-4 space-y-4">
            {calculator.faq.map((item, index) => (
              <details key={`${item.question}-${index}`} className="rounded-[1.25rem] border border-slate-300/70 bg-white/70 p-4">
                <summary className="cursor-pointer text-sm font-bold text-slate-950">{item.question}</summary>
                <p className="mt-2 text-sm leading-7 text-slate-700">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {relatedCalculators.length > 0 ? (
        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-kicker">Calculatoare similare</p>
              <h2 className="mt-3 text-3xl font-black text-slate-950">Daca vrei sa compari scenarii apropiate, continua cu aceste pagini.</h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {relatedCalculators.map((item) => (
              <CalculatorCard key={item.id} calculator={item} />
            ))}
          </div>
        </section>
      ) : null}

      {suggestedArticles.length > 0 ? (
        <section className="paper-panel mt-10 rounded-[2rem] p-6">
          <h2 className="text-2xl font-bold text-slate-950">Articole conexe</h2>
          <p className="mt-2 text-sm leading-7 text-slate-700">Daca vrei mai mult context despre formula sau despre modul de interpretare, continua cu articolele de mai jos.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestedArticles.map((article) => (
              <Link
                key={article.id}
                href={buildArticlePath(article.slug)}
                className="rounded-full border border-slate-300 bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-emerald-400 hover:text-emerald-700"
              >
                {article.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="paper-panel mt-10 rounded-[2rem] p-6">
        <h2 className="text-xl font-bold text-slate-950">Legaturi interne</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/calculatoare" className="rounded-full border border-slate-300 bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-emerald-400 hover:text-emerald-700">
            Toate calculatoarele
          </Link>
          <Link href={`/calculatoare/${categorySlug}`} className="rounded-full border border-slate-300 bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-emerald-400 hover:text-emerald-700">
            Categoria {calculator.category?.name ?? categorySlug}
          </Link>
          <Link href={buildCalculatorPath(calculator)} className="rounded-full border border-slate-300 bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-emerald-400 hover:text-emerald-700">
            Canonical pagina
          </Link>
        </div>
      </section>
    </div>
  );
}
