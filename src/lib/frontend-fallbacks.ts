import type { Article, CalculatorCategory, CalculatorDoc } from "./content.ts";

export const fallbackHeroHighlights: Array<{ value: string; label: string }> = [
  { value: "20", label: "calculatoare disponibile in primul hub" },
  { value: "4", label: "categorii principale de cautare" },
  { value: "FAQ", label: "explicatii si raspunsuri integrate in pagini" },
];

export const fallbackCategories: Array<Pick<CalculatorCategory, "id" | "name" | "slug" | "summary">> = [
  {
    id: "nutritie-si-antrenament",
    name: "Nutritie si antrenament",
    slug: "nutritie-si-antrenament",
    summary: "BMI, calorii, TDEE, proteine si alte calcule utile pentru obiective de greutate, forma si nutritie.",
  },
  {
    id: "auto",
    name: "Auto",
    slug: "auto",
    summary: "Consum, cost pe kilometru, cost de drum si alte estimari practice pentru soferi.",
  },
  {
    id: "energie",
    name: "Energie",
    slug: "energie",
    summary: "Costuri de consum, putere, conversii si formule folosite frecvent in zona electrica.",
  },
  {
    id: "conversii",
    name: "Conversii",
    slug: "conversii",
    summary: "Transformari rapide intre unitati uzuale pentru temperatura, greutate, lungime si putere.",
  },
];

export const fallbackCalculators: Array<
  Pick<CalculatorDoc, "id" | "title" | "slug" | "shortDescription" | "category" | "audience">
> = [
  {
    id: "bmi",
    title: "Calculator BMI / IMC",
    slug: "calculator-bmi-imc",
    shortDescription: "Afla rapid indicele de masa corporala si intervalul in care se incadreaza rezultatul tau.",
    audience: "consumer",
    category: { id: "nutritie-si-antrenament", name: "Nutritie si antrenament", slug: "nutritie-si-antrenament" },
  },
  {
    id: "tdee",
    title: "Calculator necesar caloric zilnic",
    slug: "calculator-necesar-caloric-zilnic",
    shortDescription: "Estimeaza necesarul zilnic de calorii in functie de activitate, varsta, greutate si obiectiv.",
    audience: "consumer",
    category: { id: "nutritie-si-antrenament", name: "Nutritie si antrenament", slug: "nutritie-si-antrenament" },
  },
  {
    id: "kw-cp",
    title: "Convertor kW in CP",
    slug: "kw-in-cp",
    shortDescription: "Converteste rapid kilowatii in cai putere pentru masini, motoare si fise tehnice.",
    audience: "both",
    category: { id: "auto", name: "Auto", slug: "auto" },
  },
  {
    id: "consum-combustibil",
    title: "Calculator consum combustibil",
    slug: "consum-combustibil",
    shortDescription: "Calculeaza consumul real pe baza kilometrilor parcursi si a cantitatii de combustibil alimentate.",
    audience: "consumer",
    category: { id: "auto", name: "Auto", slug: "auto" },
  },
];

export const fallbackArticles: Array<
  Pick<Article, "id" | "slug" | "title" | "excerpt" | "articleType" | "audience">
> = [
  {
    id: "ghid-bmi",
    slug: "cum-se-interpreteaza-bmi",
    title: "Cum se interpreteaza BMI in mod corect",
    excerpt: "Cand te ajuta BMI, unde devine insuficient si cum il folosesti alaturi de alte repere utile.",
    articleType: "Ghid",
    audience: "consumer",
  },
  {
    id: "ghid-tdee",
    slug: "cum-estimezi-tdee",
    title: "Cum estimezi TDEE fara sa supraevaluezi activitatea",
    excerpt: "Un ghid practic despre factorii de activitate si erorile frecvente care apar la calculul necesarului caloric.",
    articleType: "Explicativ",
    audience: "consumer",
  },
  {
    id: "ghid-consum",
    slug: "cum-calculezi-consumul-auto",
    title: "Cum calculezi consumul auto real",
    excerpt: "Formula de baza, exemple rapide si principalii factori care pot schimba rezultatul in utilizarea de zi cu zi.",
    articleType: "Auto",
    audience: "consumer",
  },
  {
    id: "ghid-conversii",
    slug: "diferenta-dintre-kw-si-cp",
    title: "kW vs CP: diferenta si cand folosesti fiecare unitate",
    excerpt: "Explicam ce masoara fiecare unitate si de ce conversia corecta conteaza in specificatiile tehnice auto.",
    articleType: "Conversii",
    audience: "both",
  },
];

