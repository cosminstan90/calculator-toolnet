import { AdSlotLazy } from "@/components/ad-slot-lazy";
import { CalculatorsIndexExplorer } from "@/components/calculators-index-explorer";
import { CategoryCard } from "@/components/category-card";
import { JsonLd } from "@/components/json-ld";
import {
  buildCalculatorPath,
  listCalculators,
  listCategories,
} from "@/lib/content";
import { fallbackCalculators, fallbackCategories } from "@/lib/frontend-fallbacks";
import {
  buildBreadcrumbJsonLd,
  buildCollectionJsonLd,
  buildItemListJsonLd,
  buildMetadata,
} from "@/lib/seo";
import { adsConfig } from "@/lib/ads";
import Link from "next/link";

export const revalidate = 900;

export const metadata = buildMetadata({
  title: "Calculatoare online pe categorii",
  description:
    "Descopera calculatoare online pentru nutritie si antrenament, auto, energie, imobiliare si conversii, fiecare cu explicatia formulei si exemple practice.",
  path: "/calculatoare",
});

export default async function CalculatorsIndexPage() {
  const [categories, calculators] = await Promise.all([listCategories(20), listCalculators(100)]);
  const displayCategories = categories.length ? categories : fallbackCategories;
  const baseCalculators = calculators.length ? calculators : fallbackCalculators;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          buildCollectionJsonLd({
            name: "Calculatoare online pe categorii",
            description:
              "Index complet de calculatoare online pentru nutritie si antrenament, auto, energie si conversii.",
            path: "/calculatoare",
          }),
          buildBreadcrumbJsonLd([
            { name: "Acasa", path: "/" },
            { name: "Calculatoare", path: "/calculatoare" },
          ]),
          buildItemListJsonLd({
            name: "Calculatoare disponibile",
            path: "/calculatoare",
            items: baseCalculators.map((calculator) => ({
              name: calculator.title,
              path: buildCalculatorPath(calculator),
            })),
          }),
        ]}
      />
      <section className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-slate-950 px-6 py-8 text-white shadow-[0_35px_100px_-60px_rgba(15,23,42,0.9)] sm:px-8 sm:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(124,227,189,0.24),transparent_28%),radial-gradient(circle_at_90%_20%,rgba(244,184,96,0.16),transparent_24%),linear-gradient(135deg,rgba(4,11,20,0.96)_0%,rgba(10,23,37,0.96)_54%,rgba(16,34,53,0.92)_100%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-300">
              Toate calculatoarele
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              Calculatoare online pe categorii, usor de cautat si usor de inteles.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
              Aici gasesti toate tool-urile disponibile in platforma. Fiecare pagina include calculatorul propriu-zis,
              explicatia formulei, exemple de calcul, FAQ si legaturi catre pagini apropiate.
            </p>
          </div>
          <CalculatorsIndexExplorer calculators={baseCalculators} initialQuery="" />
        </div>
      </section>

      <section className="cv-auto mt-12 grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
        <div>
          <p className="section-kicker">Categorii principale</p>
          <h2 className="mt-4 section-title">Incepe cu domeniul potrivit, apoi mergi direct la calculul care te intereseaza.</h2>
          <p className="mt-5 section-copy max-w-md">
            Hub-urile sunt organizate dupa intentie: nutritie si antrenament, costuri auto, energie sau conversii uzuale. Astfel ajungi mai repede la pagina relevanta.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          {displayCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="cv-auto mt-14 grid gap-4 lg:grid-cols-2">
        <Link
          href="/pentru-persoane"
          className="group rounded-[2rem] border border-slate-300/70 bg-[linear-gradient(180deg,rgba(255,252,247,0.96)_0%,rgba(248,243,235,0.84)_100%)] p-6 text-slate-950 shadow-[0_22px_80px_-55px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1 hover:border-emerald-300"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700">
            Ruta rapida pentru persoane
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight">
            Mergi direct spre calcule pentru sanatate, auto, facturi si finante personale.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            Daca vrei un traseu mai simplu decat indexul complet, hub-ul pentru persoane grupeaza cele mai utile pagini pentru deciziile de zi cu zi.
          </p>
        </Link>

        <Link
          href="/pentru-firme"
          className="group rounded-[2rem] border border-slate-950/10 bg-slate-950 p-6 text-white shadow-[0_22px_80px_-55px_rgba(15,23,42,0.7)] transition duration-300 hover:-translate-y-1 hover:border-amber-300/40"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200/80">
            Ruta rapida pentru firme
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight">
            Intra direct in calculatoare pentru marje, costuri, TVA si operare.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Hub-ul pentru firme reduce zgomotul si iti arata mai repede paginile relevante pentru afaceri, finante, constructii si imobiliare.
          </p>
        </Link>
      </section>

      {adsConfig.slots.calculatorsHubInline ? (
        <section className="cv-auto mt-10">
          <AdSlotLazy
            slot={adsConfig.slots.calculatorsHubInline}
            label="Mesaj sponsorizat"
            className="mx-auto max-w-[980px]"
          />
        </section>
      ) : null}
    </div>
  );
}
