import { AudienceHub } from "@/components/audience-hub";
import {
  listArticlesByAudience,
  listCalculatorsByAudience,
  listCategories,
} from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 900;

export const metadata = buildMetadata({
  title: "Calculatoare online pentru persoane",
  description:
    "Hub pentru persoane: fitness, auto, finante personale, energie si conversii utile, cu calculatoare explicate si ghiduri care ajuta la decizie.",
  path: "/pentru-persoane",
});

const categorySlugs = new Set([
  "fitness",
  "auto",
  "energie",
  "energie-pentru-casa",
  "conversii",
  "finante",
  "salarii-si-taxe",
  "credite-si-economii",
]);

export default async function ConsumerHubPage() {
  const [categories, calculators, articles] = await Promise.all([
    listCategories(20),
    listCalculatorsByAudience("consumer", 12),
    listArticlesByAudience({ audience: "consumer", limit: 6 }),
  ]);

  return (
    <AudienceHub
      badge="Pentru persoane"
      title="Calculatoare si ghiduri pentru deciziile de zi cu zi ale persoanelor."
      description="Aici grupam paginile cele mai utile pentru sanatate, alimentatie, costuri auto, facturi, energie pentru casa, conversii si finante personale. Ideea nu este doar sa afli o cifra, ci sa intelegi ce faci mai departe cu ea."
      path="/pentru-persoane"
      audienceLabel="Pentru persoane"
      spotlightLabel="Cum folosesti hub-ul"
      spotlightDescription="Pornesti de la intrebarea concreta, continui cu calculatorul potrivit si mergi mai departe spre ghidurile care iti explica ce inseamna rezultatul in practica."
      decisionPillars={[
        "Sanatate, nutritie si compozitie corporala",
        "Costuri auto si estimari de drum",
        "Energie pentru casa, utilitati si conversii practice",
      ]}
      journeys={[
        {
          label: "Sanatate",
          title: "Porneste cu compozitia corporala si necesarul caloric",
          description:
            "Daca vrei sa intelegi greutatea, aportul caloric sau hidratarea, incepe din clusterul fitness si continua cu ghidurile care traduc cifra in actiune.",
          href: "/calculatoare/fitness",
        },
        {
          label: "Costuri auto",
          title: "Compara consumul, costul si timpul aceluiasi drum",
          description:
            "Pentru decizii auto bune, combina consumul real, costul pe drum si timpul estimat in acelasi traseu de cautare.",
          href: "/calculatoare/auto",
        },
        {
          label: "Facturi si utilitati",
          title: "Leaga consumul de cost si de conversiile tehnice necesare",
          description:
            "In energie si utilitati, raspunsul bun apare cand treci de la unitati la bani si apoi la decizia practica de consum.",
          href: "/calculatoare/energie",
        },
        {
          label: "Panouri si consum casa",
          title: "Porneste din factura si continua spre panouri, BTU si amortizare",
          description:
            "Noua verticala energie pentru casa leaga consumul real al locuintei de cost, productie fotovoltaica, climatizare si investitii energetice.",
          href: "/calculatoare/energie-pentru-casa",
        },
        {
          label: "Salarii",
          title: "Compara oferta, tariful orar si venitul anual in acelasi flux",
          description:
            "Pentru oferte noi, renegocieri sau claritate pe brut versus net, noua verticala salarii si taxe este un punct de pornire foarte bun.",
          href: "/calculatoare/salarii-si-taxe",
        },
        {
          label: "Credite si economii",
          title: "Leaga rata maxima, costul total si obiectivele de economisire",
          description:
            "Cand compari un credit, un avans sau un obiectiv mare, noua verticala credite si economii te ajuta sa pui scenariile in aceeasi imagine.",
          href: "/calculatoare/credite-si-economii",
        },
      ]}
      categories={categories.filter((category) => categorySlugs.has(category.slug))}
      calculators={calculators}
      articles={articles}
    />
  );
}
