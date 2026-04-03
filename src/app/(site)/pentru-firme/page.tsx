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
    "Hub pentru firme: marje, markup, ROI, TVA, economii, constructii si decizii operationale, cu ghiduri si calculatoare gandite pentru context comercial.",
  path: "/pentru-firme",
});

const categorySlugs = new Set(["business", "finante", "constructii", "energie", "conversii"]);

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
      categories={categories.filter((category) => categorySlugs.has(category.slug))}
      calculators={calculators}
      articles={articles}
    />
  );
}
