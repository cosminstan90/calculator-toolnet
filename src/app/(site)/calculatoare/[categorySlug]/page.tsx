import { AdSlot } from "@/components/ad-slot";
import { ArticleCard } from "@/components/article-card";
import { CalculatorCard } from "@/components/calculator-card";
import { CommercialCtaPanel } from "@/components/commercial-cta-panel";
import { EditorialBlocks } from "@/components/editorial-blocks";
import { JsonLd } from "@/components/json-ld";
import {
  buildCalculatorPath,
  getCategoryBySlug,
  listArticlesByCategory,
  listCalculatorsByCategory,
} from "@/lib/content";
import { getCommercialCta } from "@/lib/commercial-cta";
import {
  buildBreadcrumbJsonLd,
  buildCollectionJsonLd,
  buildItemListJsonLd,
  buildMetadata,
} from "@/lib/seo";
import { adsConfig } from "@/lib/ads";
import { recordNotFoundEvent } from "@/lib/routing";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

type Params = Promise<{ categorySlug: string }>;

export const revalidate = 900;

const categoryPlaybooks: Record<
  string,
  {
    audience: string;
    scenarios: string[];
    nextHub?: { label: string; href: string };
  }
> = {
  fitness: {
    audience: "Mai ales pentru persoane care urmaresc sanatatea, nutritia si performanta.",
    scenarios: [
      "Porneste cu calculatorul care iti raspunde la intrebarea principala: IMC, calorii, proteine sau hidratare.",
      "Continua cu un calculator complementar daca rezultatul depinde de obiectiv, nu doar de o singura valoare.",
      "Verifica articolul asociat atunci cand cifra trebuie interpretata, nu doar memorata.",
    ],
    nextHub: { label: "Hub persoane", href: "/pentru-persoane" },
  },
  auto: {
    audience: "Pentru persoane si firme care vor costuri, timp si scenarii de drum mai realiste.",
    scenarios: [
      "Calculeaza mai intai consumul sau costul real al drumului.",
      "Compara apoi costul pe kilometru si timpul estimat pentru doua scenarii diferite.",
      "Daca decizia implica buget, valideaza rezultatul cu ghidul editorial din categorie.",
    ],
    nextHub: { label: "Hub persoane", href: "/pentru-persoane" },
  },
  energie: {
    audience: "Pentru persoane si firme care au nevoie de conversii tehnice, consum sau cost energetic.",
    scenarios: [
      "Clarifica mai intai daca ai nevoie de putere, energie sau cost.",
      "Leaga conversia de un calculator de consum sau cost ca sa obtii valoare practica.",
      "Foloseste ghidurile cand vrei sa compari aparate sau sa explici factura.",
    ],
    nextHub: { label: "Hub persoane", href: "/pentru-persoane" },
  },
  constructii: {
    audience: "Pentru persoane, echipe mici si firme care estimeaza materiale sau volume de lucru.",
    scenarios: [
      "Porneste din suprafata sau volum, apoi adauga marja de pierdere si contextul lucrarii.",
      "Compara doua materiale sau doua metode de calcul inainte de aprovizionare.",
      "Continua cu ghidul categoriei daca rezultatul trebuie transformat in deviz sau lista de cumparaturi.",
    ],
    nextHub: { label: "Hub firme", href: "/pentru-firme" },
  },
  business: {
    audience: "In primul rand pentru firme care compara pret, marja, cost si rentabilitate.",
    scenarios: [
      "Porneste cu intrebarea concreta: pret, marja, markup, prag de rentabilitate sau ROI.",
      "Valideaza apoi rezultatul cu un al doilea calculator financiar sau comercial apropiat.",
      "Foloseste ghidurile cand decizia depinde si de context fiscal sau operational.",
    ],
    nextHub: { label: "Hub firme", href: "/pentru-firme" },
  },
  finante: {
    audience: "Pentru persoane si firme care compara procente, TVA, rate, economii si cost total.",
    scenarios: [
      "Clarifica baza de calcul: net, brut, fara TVA sau cu TVA.",
      "Compara scenariul initial cu varianta inversa sau cu o alternativa apropiata.",
      "Continua cu articolul suport cand decizia depinde de interpretare, nu doar de formula.",
    ],
    nextHub: { label: "Hub firme", href: "/pentru-firme" },
  },
  "salarii-si-taxe": {
    audience: "Pentru persoane si firme care compara oferte, timp lucrat, venit anual sau brut versus net.",
    scenarios: [
      "Porneste cu scenariul concret: crestere salariala, tarif orar, venit anual sau taxare efectiva.",
      "Leaga calculul de orele reale lucrate si de structura venitului, nu doar de suma lunara afisata.",
      "Foloseste ghidurile pentru a interpreta corect diferenta dintre brut, net, bonusuri si valoarea reala a ofertei.",
    ],
    nextHub: { label: "Hub persoane", href: "/pentru-persoane" },
  },
  "credite-si-economii": {
    audience: "Pentru persoane si firme mici care compara rate, credite, refinantare, avans si obiective de economisire.",
    scenarios: [
      "Porneste cu intrebarea principala: ce rata iti permiti, cat costa total creditul sau in cat timp ajungi la un obiectiv.",
      "Compara apoi scenariul initial cu o varianta mai prudenta pentru a vedea cat de sensibila este decizia la schimbari mici.",
      "Continua cu ghidurile cand ai nevoie de context despre cost total, refinantare, fond de urgenta sau leasing versus credit.",
    ],
    nextHub: { label: "Hub persoane", href: "/pentru-persoane" },
  },
};

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
  const playbook = categoryPlaybooks[category.slug];
  const commercialCta = getCommercialCta({
    categorySlug: category.slug,
    audience: category.audience,
    kind: "category",
    sourcePath: `/calculatoare/${category.slug}`,
  });
  const featuredCalculator =
    calculators.find((calculator) => calculator.isFeatured) ?? calculators[0];
  const supportingCalculators = featuredCalculator
    ? calculators.filter((calculator) => calculator.id !== featuredCalculator.id).slice(0, 5)
    : calculators.slice(0, 6);

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
          buildItemListJsonLd({
            name: `Calculatoare din ${category.name}`,
            path: `/calculatoare/${category.slug}`,
            items: calculators.map((calculator) => ({
              name: calculator.title,
              path: buildCalculatorPath(calculator),
            })),
          }),
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

      {playbook ? (
        <section className="mt-12 grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <p className="section-kicker">Cum folosesti categoria</p>
            <h2 className="mt-4 section-title">Aceasta categorie functioneaza cel mai bine cand legi calculatorul de scenariul real, nu doar de formula.</h2>
            <p className="mt-5 section-copy max-w-md">{playbook.audience}</p>
            {playbook.nextHub ? (
              <Link
                href={playbook.nextHub.href}
                className="mt-6 inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-800 transition-colors hover:border-emerald-400 hover:bg-emerald-100"
              >
                Continua in {playbook.nextHub.label}
              </Link>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {playbook.scenarios.map((scenario) => (
              <article
                key={scenario}
                className="rounded-[1.4rem] border border-slate-200 bg-white/90 p-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.22)]"
              >
                <p className="text-sm leading-7 text-slate-700">{scenario}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {featuredCalculator ? (
        <section className="mt-14 grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div>
            <p className="section-kicker">Punct de intrare</p>
            <h2 className="mt-4 section-title">Daca vrei sa incepi rapid, acesta este calculatorul care te pune cel mai repede in context.</h2>
            <p className="mt-5 section-copy max-w-md">
              Am ales un punct de intrare puternic pentru categoria {category.name.toLowerCase()}, apoi l-am completat cu pagini care continua logic aceeasi intentie.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <CalculatorCard key={featuredCalculator.id} calculator={featuredCalculator} />
            {supportingCalculators.map((calculator) => (
              <CalculatorCard key={calculator.id} calculator={calculator} />
            ))}
          </div>
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

      {adsConfig.slots.categoryInline ? (
        <section className="mt-10">
          <AdSlot
            slot={adsConfig.slots.categoryInline}
            label="Publicitate"
            className="mx-auto max-w-[980px]"
          />
        </section>
      ) : null}

      {commercialCta ? (
        <section className="mt-10">
          <CommercialCtaPanel cta={commercialCta} />
        </section>
      ) : null}

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
