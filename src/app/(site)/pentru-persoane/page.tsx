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

const categorySlugs = new Set(["fitness", "auto", "energie", "conversii", "finante"]);

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
      description="Aici grupam paginile cele mai utile pentru sanatate, alimentatie, costuri auto, facturi, conversii si finante personale. Ideea nu este doar sa afli o cifra, ci sa intelegi ce faci mai departe cu ea."
      path="/pentru-persoane"
      audienceLabel="Pentru persoane"
      spotlightLabel="Cum folosesti hub-ul"
      spotlightDescription="Pornesti de la intrebarea concreta, continui cu calculatorul potrivit si mergi mai departe spre ghidurile care iti explica ce inseamna rezultatul in practica."
      decisionPillars={[
        "Sanatate, nutritie si compozitie corporala",
        "Costuri auto si estimari de drum",
        "Energie, utilitati si conversii practice",
      ]}
      categories={categories.filter((category) => categorySlugs.has(category.slug))}
      calculators={calculators}
      articles={articles}
    />
  );
}
