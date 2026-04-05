import { AudienceHub } from "@/components/audience-hub";
import {
  listArticlesByAudience,
  listCalculatorsByAudience,
  listCategories,
} from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 900;

export const metadata = buildMetadata({
  title: "Calculatoare online pentru firme",
  description:
    "Hub pentru firme: marje, markup, ROI, TVA, economii, constructii, imobiliare si decizii operationale, cu ghiduri si calculatoare gandite pentru context comercial.",
  path: "/pentru-firme",
});

const categorySlugs = new Set([
  "business",
  "finante",
  "constructii",
  "energie",
  "conversii",
  "salarii-si-taxe",
  "credite-si-economii",
  "imobiliare",
]);

export default async function BusinessHubPage() {
  const [categories, calculators, articles] = await Promise.all([
    listCategories(20),
    listCalculatorsByAudience("business", 12),
    listArticlesByAudience({ audience: "business", limit: 6 }),
  ]);

  return (
    <AudienceHub
      badge="Pentru firme"
      title="Calculatoare si ghiduri pentru costuri, preturi, marje si decizii operationale."
      description="Acest hub pune impreuna calculatoare pentru profitabilitate, costuri, taxe, constructii si estimari utile in operare. Ne intereseaza nu doar formula, ci si cum folosesti rezultatul in ofertare, bugetare si prioritizare."
      path="/pentru-firme"
      audienceLabel="Pentru firme"
      spotlightLabel="Decision support pentru business"
      spotlightDescription="Gandim paginile astfel incat sa poti porni de la un calcul simplu si sa continui logic spre articolul sau tool-ul care clarifica decizia comerciala."
      decisionPillars={[
        "Preturi, marje si rentabilitate",
        "Taxe, procente si scenarii financiare",
        "Estimari operationale pentru lucrari si materiale",
      ]}
      journeys={[
        {
          label: "Pricing",
          title: "Compara rapid marja, markup si rentabilitatea",
          description:
            "Cand decizia are legatura cu pretul, profitul sau ROI-ul, incepe cu clusterul business si continua cu scenariile financiare complementare.",
          href: "/calculatoare/business",
        },
        {
          label: "Taxe si salarii",
          title: "Leaga venitul, taxarea si costul real al unei decizii salariale",
          description:
            "Noua verticala salarii si taxe te ajuta sa compari cresterea salariala, tariful orar, venitul anual si taxarea efectiva intr-un flux coerent.",
          href: "/calculatoare/salarii-si-taxe",
        },
        {
          label: "Finantare",
          title: "Compara rata, costul total si structura scenariului de finantare",
          description:
            "Clusterul credite si economii este util si pentru firme mici care compara leasing, credit, refinantare sau disciplina de cash buffer.",
          href: "/calculatoare/credite-si-economii",
        },
        {
          label: "Estimari operative",
          title: "Porneste din materiale, volum si necesar de lucru",
          description:
            "Pentru proiecte, lucrari si costuri de executie, clusterul constructii iti da punctul de plecare bun si te trimite spre ghidurile potrivite.",
          href: "/calculatoare/constructii",
        },
        {
          label: "Imobiliare",
          title: "Compara randamentul, vacanta si costurile unei proprietati",
          description:
            "Pentru investitii mici sau comparatii de proiect, verticala imobiliare leaga costul total, randamentul si bufferul real al proprietatii.",
          href: "/calculatoare/imobiliare",
        },
      ]}
      categories={categories.filter((category) => categorySlugs.has(category.slug))}
      calculators={calculators}
      articles={articles}
    />
  );
}
