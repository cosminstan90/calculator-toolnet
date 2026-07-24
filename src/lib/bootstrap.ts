import {
  CALCULATOR_KEYS,
  getCalculatorDefinition,
  type CalculatorKey,
} from "./calculator-registry.ts";
import {
  buildEditorialChecklistSeed,
  computeEditorialCompletion,
} from "./editorial-checklist.ts";
import { ensureCalculatorFaq } from "./calculator-content.ts";
import { pick } from "./content-variation.ts";
import type { Payload } from "payload";

type BootstrapOptions = { force?: boolean };
type SeedStatus = "created" | "updated" | "skipped";
type SeedItemResult = { key: string; status: SeedStatus };
type ReleaseBatch =
  | "batch-01"
  | "batch-02"
  | "batch-03"
  | "batch-04"
  | "batch-05"
  | "batch-06"
  | "batch-07"
  | "batch-08"
  | "batch-09"
  | "batch-10"
  | "batch-11"
  | "batch-12"
  | "batch-13"
  | "batch-14"
  | "batch-15"
  | "batch-16"
  | "batch-17"
  | "batch-18";
type EditorialStatus =
  | "draft"
  | "formula_validated"
  | "content_in_progress"
  | "ready_for_review"
  | "approved"
  | "scheduled"
  | "published";
type Audience = "consumer" | "business" | "both";
type PublishingSlot = "none" | "morning" | "evening";
type PublishingScheduleSeed = {
  slot: PublishingSlot;
  priority: number;
  earliestAt?: string;
};
type CounterSummary = {
  created: number;
  updated: number;
  skipped: number;
  items: SeedItemResult[];
};

export type BootstrapCmsResult = {
  homepage: { status: "updated" | "skipped" };
  categories: CounterSummary;
  formulas: CounterSummary;
  calculators: CounterSummary;
  articles: CounterSummary;
  redirects: CounterSummary;
};

type CategorySeed = {
  name: string;
  slug: string;
  summary: string;
  introContent: string;
  sortOrder: number;
  isFeatured: boolean;
};

type CalculatorMeta = {
  shortDescription: string;
  intro: string;
  interpretationNotes: string;
  isFeatured: boolean;
  sortOrder: number;
  examples?: Array<{ title: string; narrative: string }>;
  releaseBatch?: ReleaseBatch;
  editorialStatus?: EditorialStatus;
  audience?: Audience;
  publishByDefault?: boolean;
  publishingSchedule?: PublishingScheduleSeed;
  example: string;
  faq: Array<{ question: string; answer: string }>;
  relatedCalculatorKeys?: CalculatorKey[];
  relatedArticleSlugs?: string[];
  extraBlocks?: Array<Record<string, unknown>>;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalPath?: string;
  };
};

type ArticleSeed = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  articleType: "guide" | "explainer" | "comparison";
  relatedCategorySlug?: string;
  relatedCalculatorKeys?: CalculatorKey[];
  relatedArticleSlugs?: string[];
  launchWave?: "wave-1" | "wave-2" | "backlog";
  releaseBatch?: ReleaseBatch;
  editorialStatus?: EditorialStatus;
  audience?: Audience;
  publishByDefault?: boolean;
  publishingSchedule?: PublishingScheduleSeed;
};

type RedirectSeed = {
  key: string;
  sourcePath: string;
  destinationPath: string;
  statusCode?: "301" | "302" | "307" | "308";
  notes: string;
  publishByDefault?: boolean;
};

const BATCH_01_CALCULATORS: CalculatorKey[] = [
  "bmi",
  "bmr",
  "tdee",
  "calorie-deficit",
  "protein-intake",
  "body-fat-us-navy",
  "fuel-consumption",
  "trip-fuel-cost",
  "kw-cp",
  "electricity-cost",
];

const BATCH_01_ARTICLES = [
  "cum-interpretezi-bmi-corect",
  "bmr-vs-tdee-diferente",
  "cum-setezi-un-deficit-caloric",
  "cate-proteine-ai-nevoie-zilnic",
];

const BATCH_02_CALCULATORS: CalculatorKey[] = [
  "ideal-weight",
  "water-intake",
  "one-rep-max",
  "cost-per-km",
  "travel-time",
  "amps-to-watts",
  "watts-to-kwh",
  "kg-lb",
  "cm-inch",
  "temperature-converter",
];

const BATCH_02_ARTICLES = [
  "cum-calculezi-consumul-real-la-masina",
  "cum-estimezi-costul-unei-calatorii-cu-masina",
  "kw-vs-cp-explicat-simplu",
  "cum-calculezi-consumul-electric-al-unui-aparat",
  "ghid-conversii-kg-lb-cm-inch",
  "cum-estimezi-procentul-de-grasime-corporala",
  "cata-apa-ai-nevoie-zilnic-cu-adevarat",
  "cum-folosesti-one-rep-max-in-antrenament",
  "cost-pe-kilometru-vs-cost-total-drum",
  "cum-transformi-amperii-in-wati-si-wati-in-kwh",
];

const BATCH_03_CALCULATORS: CalculatorKey[] = [
  "room-area",
  "concrete-volume",
  "paint-coverage",
  "tile-coverage",
  "laminate-flooring",
  "food-cost",
  "profit-margin",
  "markup",
  "break-even",
  "roi",
];

const BATCH_03_ARTICLES = [
  "cum-calculezi-suprafata-unei-camere-corect",
  "cum-calculezi-volumul-de-beton-pentru-fundatie",
  "cum-estimezi-necesarul-de-vopsea",
  "cum-calculezi-necesarul-de-gresie-si-faianta",
  "food-cost-explicat-pentru-horeca",
  "marja-vs-markup-explicate-simplu",
  "cum-calculezi-pragul-de-rentabilitate",
  "cum-evaluezi-un-roi-fara-sa-fortezi-cifrele",
];

const BATCH_04_CALCULATORS: CalculatorKey[] = [
  "percentage-of-number",
  "percentage-change",
  "reverse-percentage",
  "discount",
  "vat",
  "reverse-vat",
  "compound-interest",
  "monthly-savings",
  "savings-goal",
  "loan-payment",
];

const BATCH_05_CALCULATORS: CalculatorKey[] = [
  "salary-increase",
  "hourly-rate",
  "monthly-work-hours",
  "annual-income",
  "effective-tax-rate",
];

const BATCH_06_CALCULATORS: CalculatorKey[] = [
  "credit-affordability",
  "debt-to-income",
  "loan-total-cost",
  "refinance-savings",
  "emergency-fund",
  "savings-interest",
  "retirement-savings",
  "goal-timeline",
  "lease-vs-loan",
  "down-payment",
];

const BATCH_07_CALCULATORS: CalculatorKey[] = [
  "roas",
  "break-even-roas",
  "aov",
  "conversion-rate",
  "cpl",
  "cac",
  "target-revenue",
  "gross-profit",
  "net-profit",
  "inventory-turnover",
];

const BATCH_08_CALCULATORS: CalculatorKey[] = [
  "appliance-electricity-cost",
  "monthly-electricity-bill",
  "solar-system-size",
  "solar-production",
  "solar-panel-count",
  "solar-payback",
  "ac-btu",
  "heating-load",
  "heat-pump-size",
  "solar-battery-size",
];

const BATCH_09_CALCULATORS: CalculatorKey[] = [
  "fridge-electricity-cost",
  "boiler-electricity-cost",
  "ac-electricity-cost",
  "led-savings",
  "solar-roof-area",
  "solar-inverter-size",
  "solar-self-consumption",
  "ups-runtime",
  "heating-cost-comparison",
  "solar-co2-savings",
];

const BATCH_10_CALCULATORS: CalculatorKey[] = [
  "price-per-sqm",
  "property-down-payment",
  "property-total-purchase-cost",
  "rent-vs-buy",
  "renovation-budget",
  "furniture-budget",
  "monthly-home-budget",
  "price-negotiation",
  "space-per-person",
  "mortgage-buffer",
];

const BATCH_11_CALCULATORS: CalculatorKey[] = [
  "rental-yield",
  "cash-on-cash-return",
  "vacancy-loss",
  "rent-increase",
  "property-flip-margin",
  "property-management-fee",
  "closing-cost-share",
  "room-rental-income",
  "service-charge-budget",
  "rental-break-even-occupancy",
];

const BATCH_04_ARTICLES = [
  "cum-calculezi-procentele-corect",
  "procent-din-numar-vs-diferenta-procentuala",
  "cum-calculezi-discountul-real",
  "tva-inclus-vs-tva-exclus",
  "cum-functioneaza-dobanda-compusa",
  "cum-planifici-economii-lunare",
  "cum-estimezi-un-obiectiv-de-economisire",
  "cum-citesti-rata-lunară-la-un-credit",
];

const BATCH_05_ARTICLES = [
  "cum-calculezi-cresterea-salariala-corect",
  "cum-transformi-salariul-lunar-in-tarif-orar",
  "cate-ore-lucrezi-intr-o-luna-de-fapt",
  "cum-citesti-diferenta-dintre-brut-net-si-taxare-efectiva",
  "cum-estimezi-venitul-anual-fara-sa-amesteci-bonusurile-cu-salariul",
];

const BATCH_06_ARTICLES = [
  "cum-afli-ce-rata-iti-permiti-fara-sa-iti-blochezi-bugetul",
  "cum-citesti-costul-total-al-unui-credit",
  "cand-merita-refinantarea-si-cand-doar-pare-o-idee-buna",
  "cum-iti-construiesti-fondul-de-urgenta-fara-sa-ramai-fara-lichiditati",
  "cum-planifici-economii-pe-termen-lung-pentru-obiective-mari",
  "leasing-vs-credit-cum-compari-corect-doua-scenarii-de-finantare",
];

const BATCH_07_ARTICLES = [
  "cum-citesti-roas-fara-sa-confunzi-venitul-cu-profitul",
  "break-even-roas-explicat-pentru-campanii-platite",
  "cum-calculezi-cac-si-cpl-fara-sa-amesteci-canalele",
  "aov-si-rata-de-conversie-ce-spun-impreuna-despre-funnel",
  "cum-estimezi-targetul-de-venit-si-profitul-real",
  "rotatia-stocului-explicata-pentru-ecommerce-si-retail",
];

const BATCH_08_ARTICLES = [
  "cum-citesti-factura-de-curent-fara-sa-te-pierzi-in-detalii-inutile",
  "cum-estimezi-consumul-real-al-electrocasnicelor-din-casa",
  "cate-panouri-fotovoltaice-iti-trebuie-de-fapt",
  "cum-estimezi-productia-fotovoltaica-fara-promisiuni-umflate",
  "cum-citesti-amortizarea-unui-sistem-fotovoltaic",
  "cum-alegi-btu-ul-potrivit-pentru-aer-conditionat",
  "centrala-vs-pompa-de-caldura-cum-compari-corect-costurile",
  "cand-merita-o-baterie-fotovoltaica-si-cand-doar-creste-costul",
];

const BATCH_09_ARTICLES = [
  "cat-consuma-un-frigider-in-realitate-si-cum-citesti-corect-eticheta",
  "cat-consuma-un-boiler-electric-si-cand-devine-o-problema-in-factura",
  "cat-consuma-aerul-conditionat-pe-zi-si-pe-luna",
  "cum-calculezi-economia-reala-din-becuri-led",
  "cata-suprafata-de-acoperis-iti-trebuie-pentru-panouri",
  "cum-alegi-corect-puterea-invertorului-fotovoltaic",
  "autoconsum-vs-injectare-ce-conteaza-cu-adevarat-la-un-sistem-fv",
  "cum-estimezi-backup-ul-pentru-ups-sau-baterie",
  "cum-compari-costul-de-incalzire-intre-gaz-si-pompa-de-caldura",
  "cat-co2-poti-evita-cu-un-sistem-fotovoltaic",
];

const BATCH_10_ARTICLES = [
  "cum-citesti-pretul-pe-mp-fara-sa-cazi-in-comparatii-false",
  "ce-intra-de-fapt-in-bugetul-total-de-achizitie-al-unei-locuinte",
  "chirie-vs-cumparare-cum-compari-corect-doua-scenarii",
  "cum-estimezi-un-buget-de-renovare-fara-optimism-periculos",
  "cum-planifici-bugetul-de-mobilare-si-electrocasnice",
  "cat-iti-mananca-locuinta-din-bugetul-lunar",
  "cand-negocierea-pretului-schimba-cu-adevarat-afacerea",
  "cat-spatiu-iti-trebuie-de-fapt-in-functie-de-familie-si-folosinta",
];

const BATCH_11_ARTICLES = [
  "cum-citesti-randamentul-din-chirie-fara-sa-ignori-costurile-ascunse",
  "cash-on-cash-return-explicat-pentru-investitii-imobiliare",
  "cum-estimezi-pierderile-din-vacanta-la-o-proprietate-de-inchiriat",
  "cum-proiectezi-cresterea-chiriei-fara-sa-fortezi-ipotezele",
  "ce-marja-ramane-intr-un-flip-imobiliar-dupa-costurile-reale",
  "cat-te-costa-administrarea-unei-proprietati-inchiriate",
  "cum-citesti-ponderea-costurilor-de-inchidere-intr-o-achizitie",
  "inchiriere-integrala-vs-pe-camera-cum-compari-venitul",
];

const LEGACY_REDIRECT_SEEDS: RedirectSeed[] = [
  {
    key: "legacy-bmi",
    sourcePath: "/calculator-imc",
    destinationPath: "/calculatoare/nutritie-si-antrenament/calculator-bmi-imc",
    statusCode: "308",
    notes:
      "Legacy SEO recovery pentru vechiul calculator IMC/BMI indexat anterior pe domeniu.",
    publishByDefault: true,
  },
  {
    key: "legacy-fuel-consumption",
    sourcePath: "/calculator-combustibil-consum-auto",
    destinationPath: "/calculatoare/auto/calculator-consum-combustibil",
    statusCode: "308",
    notes:
      "Legacy SEO recovery pentru URL-ul istoric de consum combustibil auto.",
    publishByDefault: true,
  },
  {
    key: "legacy-kw-cp",
    sourcePath: "/calculator-kw-cp",
    destinationPath: "/calculatoare/energie/convertor-kw-in-cp",
    statusCode: "308",
    notes:
      "Legacy SEO recovery pentru pagina istorică de conversie KW în CP.",
    publishByDefault: true,
  },
  {
    key: "legacy-concrete-volume",
    sourcePath: "/calculator-beton-fundatie-volum",
    destinationPath: "/calculatoare/constructii/calculator-volum-beton",
    statusCode: "308",
    notes:
      "Legacy SEO recovery pentru calculatorul istoric de volum beton / fundație.",
    publishByDefault: true,
  },
  {
    key: "legacy-bmr-slug",
    sourcePath: "/calculatoare/nutritie-si-antrenament/calculator-bmr",
    destinationPath: "/calculatoare/nutritie-si-antrenament/calculator-metabolism-bazal",
    statusCode: "308",
    notes:
      "Păstrează equity-ul pentru vechiul slug englezesc al calculatorului BMR.",
    publishByDefault: true,
  },
  {
    key: "legacy-tdee-slug",
    sourcePath: "/calculatoare/nutritie-si-antrenament/calculator-tdee",
    destinationPath: "/calculatoare/nutritie-si-antrenament/calculator-necesar-caloric-zilnic",
    statusCode: "308",
    notes:
      "Păstrează equity-ul pentru vechiul slug englezesc al calculatorului TDEE.",
    publishByDefault: true,
  },
  {
    key: "legacy-one-rep-max-slug",
    sourcePath: "/calculatoare/nutritie-si-antrenament/calculator-one-rep-max",
    destinationPath: "/calculatoare/nutritie-si-antrenament/calculator-repetare-maxima-1rm",
    statusCode: "308",
    notes:
      "Păstrează equity-ul pentru vechiul slug englezesc al calculatorului 1RM.",
    publishByDefault: true,
  },
  {
    key: "legacy-cash-on-cash-return-slug",
    sourcePath: "/calculatoare/imobiliare/calculator-cash-on-cash-return",
    destinationPath: "/calculatoare/imobiliare/calculator-randament-capital-propriu",
    statusCode: "308",
    notes:
      "Păstrează equity-ul pentru vechiul slug englezesc al calculatorului de randament capital propriu.",
    publishByDefault: true,
  },
  {
    key: "legacy-fitness-category",
    sourcePath: "/calculatoare/fitness",
    destinationPath: "/calculatoare/nutritie-si-antrenament",
    statusCode: "308",
    notes:
      "Mutare permanentă de la vechiul slug de categorie fitness la varianta în română.",
    publishByDefault: true,
  },
  {
    key: "legacy-business-category",
    sourcePath: "/calculatoare/business",
    destinationPath: "/calculatoare/afaceri",
    statusCode: "308",
    notes:
      "Mutare permanentă de la vechiul slug de categorie business la varianta în română.",
    publishByDefault: true,
  },
  {
    key: "legacy-bmi-category-path",
    sourcePath: "/calculatoare/fitness/calculator-bmi-imc",
    destinationPath: "/calculatoare/nutritie-si-antrenament/calculator-bmi-imc",
    statusCode: "308",
    notes:
      "Păstrează equity-ul pentru vechiul path din categoria fitness al calculatorului BMI.",
    publishByDefault: true,
  },
  {
    key: "legacy-bmr-category-path",
    sourcePath: "/calculatoare/fitness/calculator-bmr",
    destinationPath: "/calculatoare/nutritie-si-antrenament/calculator-metabolism-bazal",
    statusCode: "308",
    notes:
      "Păstrează equity-ul pentru vechiul path din categoria fitness al calculatorului BMR.",
    publishByDefault: true,
  },
  {
    key: "legacy-tdee-category-path",
    sourcePath: "/calculatoare/fitness/calculator-tdee",
    destinationPath: "/calculatoare/nutritie-si-antrenament/calculator-necesar-caloric-zilnic",
    statusCode: "308",
    notes:
      "Păstrează equity-ul pentru vechiul path din categoria fitness al calculatorului TDEE.",
    publishByDefault: true,
  },
  {
    key: "legacy-calorie-deficit-category-path",
    sourcePath: "/calculatoare/fitness/calculator-calorii-slabire",
    destinationPath: "/calculatoare/nutritie-si-antrenament/calculator-calorii-slabire",
    statusCode: "308",
    notes:
      "Păstrează equity-ul pentru vechiul path din categoria fitness al calculatorului pentru slăbire.",
    publishByDefault: true,
  },
  {
    key: "legacy-protein-intake-category-path",
    sourcePath: "/calculatoare/fitness/calculator-necesar-proteine",
    destinationPath: "/calculatoare/nutritie-si-antrenament/calculator-necesar-proteine",
    statusCode: "308",
    notes:
      "Păstrează equity-ul pentru vechiul path din categoria fitness al calculatorului de proteine.",
    publishByDefault: true,
  },
  {
    key: "legacy-body-fat-category-path",
    sourcePath: "/calculatoare/fitness/calculator-grasime-corporala",
    destinationPath: "/calculatoare/nutritie-si-antrenament/calculator-grasime-corporala",
    statusCode: "308",
    notes:
      "Păstrează equity-ul pentru vechiul path din categoria fitness al calculatorului de grăsime corporală.",
    publishByDefault: true,
  },
  {
    key: "legacy-ideal-weight-category-path",
    sourcePath: "/calculatoare/fitness/calculator-greutate-ideala",
    destinationPath: "/calculatoare/nutritie-si-antrenament/calculator-greutate-ideala",
    statusCode: "308",
    notes:
      "Păstrează equity-ul pentru vechiul path din categoria fitness al calculatorului de greutate ideală.",
    publishByDefault: true,
  },
  {
    key: "legacy-water-intake-category-path",
    sourcePath: "/calculatoare/fitness/calculator-aport-zilnic-apa",
    destinationPath: "/calculatoare/nutritie-si-antrenament/calculator-aport-zilnic-apa",
    statusCode: "308",
    notes:
      "Păstrează equity-ul pentru vechiul path din categoria fitness al calculatorului de aport zilnic de apa.",
    publishByDefault: true,
  },
  {
    key: "legacy-one-rep-max-category-path",
    sourcePath: "/calculatoare/fitness/calculator-one-rep-max",
    destinationPath: "/calculatoare/nutritie-si-antrenament/calculator-repetare-maxima-1rm",
    statusCode: "308",
    notes:
      "Păstrează equity-ul pentru vechiul path din categoria fitness al calculatorului 1RM.",
    publishByDefault: true,
  },
  {
    key: "legacy-food-cost-slug",
    sourcePath: "/calculatoare/business/calculator-food-cost",
    destinationPath: "/calculatoare/afaceri/calculator-cost-reteta",
    statusCode: "308",
    notes:
      "Păstrează equity-ul pentru vechiul slug englezesc al calculatorului de cost rețeta.",
    publishByDefault: true,
  },
  {
    key: "legacy-markup-slug",
    sourcePath: "/calculatoare/business/calculator-markup",
    destinationPath: "/calculatoare/afaceri/calculator-adaos-comercial",
    statusCode: "308",
    notes:
      "Păstrează equity-ul pentru vechiul slug englezesc al calculatorului de adaos comercial.",
    publishByDefault: true,
  },
  {
    key: "legacy-break-even-slug",
    sourcePath: "/calculatoare/business/calculator-break-even",
    destinationPath: "/calculatoare/afaceri/calculator-prag-rentabilitate",
    statusCode: "308",
    notes:
      "Păstrează equity-ul pentru vechiul slug englezesc al calculatorului de prag de rentabilitate.",
    publishByDefault: true,
  },
  {
    key: "legacy-roas-slug",
    sourcePath: "/calculatoare/business/calculator-roas",
    destinationPath: "/calculatoare/afaceri/calculator-randament-publicitate",
    statusCode: "308",
    notes:
      "Păstrează equity-ul pentru vechiul slug englezesc al calculatorului ROAS.",
    publishByDefault: true,
  },
  {
    key: "legacy-break-even-roas-slug",
    sourcePath: "/calculatoare/business/calculator-break-even-roas",
    destinationPath: "/calculatoare/afaceri/calculator-prag-roas-rentabil",
    statusCode: "308",
    notes:
      "Păstrează equity-ul pentru vechiul slug englezesc al calculatorului de prag ROAS rentabil.",
    publishByDefault: true,
  },
  {
    key: "legacy-aov-slug",
    sourcePath: "/calculatoare/business/calculator-aov",
    destinationPath: "/calculatoare/afaceri/calculator-valoare-medie-comanda",
    statusCode: "308",
    notes:
      "Păstrează equity-ul pentru vechiul slug englezesc al calculatorului AOV.",
    publishByDefault: true,
  },
  {
    key: "legacy-cpl-slug",
    sourcePath: "/calculatoare/business/calculator-cpl",
    destinationPath: "/calculatoare/afaceri/calculator-cost-prospect",
    statusCode: "308",
    notes:
      "Păstrează equity-ul pentru vechiul slug englezesc al calculatorului CPL.",
    publishByDefault: true,
  },
  {
    key: "legacy-cac-slug",
    sourcePath: "/calculatoare/business/calculator-cac",
    destinationPath: "/calculatoare/afaceri/calculator-cost-achizitie-client",
    statusCode: "308",
    notes:
      "Păstrează equity-ul pentru vechiul slug englezesc al calculatorului CAC.",
    publishByDefault: true,
  },
  {
    key: "legacy-rental-break-even-occupancy-slug",
    sourcePath: "/calculatoare/imobiliare/calculator-grad-ocupare-break-even",
    destinationPath: "/calculatoare/imobiliare/calculator-prag-ocupare-rentabil",
    statusCode: "308",
    notes:
      "Păstrează equity-ul pentru vechiul slug mixt al calculatorului de prag de ocupare rentabil.",
    publishByDefault: true,
  },
];

const defaultReleaseBatchForCalculator = (key: CalculatorKey): ReleaseBatch =>
  BATCH_01_CALCULATORS.includes(key)
    ? "batch-01"
    : BATCH_02_CALCULATORS.includes(key)
      ? "batch-02"
      : BATCH_03_CALCULATORS.includes(key)
        ? "batch-03"
        : BATCH_04_CALCULATORS.includes(key)
          ? "batch-04"
          : BATCH_05_CALCULATORS.includes(key)
            ? "batch-05"
            : BATCH_06_CALCULATORS.includes(key)
              ? "batch-06"
              : BATCH_07_CALCULATORS.includes(key)
                ? "batch-07"
                : BATCH_08_CALCULATORS.includes(key)
                  ? "batch-08"
                  : BATCH_09_CALCULATORS.includes(key)
                    ? "batch-09"
                    : BATCH_10_CALCULATORS.includes(key)
                      ? "batch-10"
                      : BATCH_11_CALCULATORS.includes(key)
                        ? "batch-11"
                        : "batch-18";

const defaultEditorialStatusForCalculator = (key: CalculatorKey): EditorialStatus =>
  BATCH_01_CALCULATORS.includes(key) ? "approved" : "draft";

const defaultAudienceForCategory = (categorySlug: string): Audience => {
  if (categorySlug === "afaceri") {
    return "business";
  }

  if (
    categorySlug === "nutritie-si-antrenament" ||
    categorySlug === "auto" ||
    categorySlug === "conversii" ||
    categorySlug === "energie-pentru-casa"
  ) {
    return "consumer";
  }

  return "both";
};

const defaultAudienceForCalculator = (key: CalculatorKey): Audience =>
  defaultAudienceForCategory(getCalculatorDefinition(key).categorySlug);

const shouldPublishCalculator = (key: CalculatorKey, meta: CalculatorMeta) =>
  meta.publishByDefault === true || BATCH_01_CALCULATORS.includes(key);

const defaultReleaseBatchForArticle = (seed: ArticleSeed): ReleaseBatch => {
  if (BATCH_01_ARTICLES.includes(seed.slug)) {
    return "batch-01";
  }

  if (BATCH_02_ARTICLES.includes(seed.slug)) {
    return "batch-02";
  }

  if (BATCH_03_ARTICLES.includes(seed.slug)) {
    return "batch-03";
  }

  if (BATCH_04_ARTICLES.includes(seed.slug)) {
    return "batch-04";
  }

  if (BATCH_05_ARTICLES.includes(seed.slug)) {
    return "batch-05";
  }

  if (BATCH_06_ARTICLES.includes(seed.slug)) {
    return "batch-06";
  }

  if (BATCH_07_ARTICLES.includes(seed.slug)) {
    return "batch-07";
  }

  if (BATCH_08_ARTICLES.includes(seed.slug)) {
    return "batch-08";
  }

  if (BATCH_09_ARTICLES.includes(seed.slug)) {
    return "batch-09";
  }

  if (BATCH_10_ARTICLES.includes(seed.slug)) {
    return "batch-10";
  }

  if (BATCH_11_ARTICLES.includes(seed.slug)) {
    return "batch-11";
  }

  if (seed.launchWave === "wave-2") {
    return "batch-02";
  }

  return seed.relatedCategorySlug === "finante"
    ? "batch-04"
    : seed.relatedCategorySlug === "credite-si-economii"
      ? "batch-06"
      : seed.relatedCategorySlug === "afaceri"
        ? "batch-07"
        : seed.relatedCategorySlug === "energie-pentru-casa"
          ? "batch-08"
          : seed.relatedCategorySlug === "imobiliare"
            ? "batch-10"
    : seed.relatedCategorySlug === "conversii"
      ? "batch-04"
      : "batch-03";
};

const defaultEditorialStatusForArticle = (seed: ArticleSeed): EditorialStatus =>
  BATCH_01_ARTICLES.includes(seed.slug) ? "approved" : "draft";

const defaultAudienceForArticle = (seed: ArticleSeed): Audience =>
  seed.relatedCategorySlug ? defaultAudienceForCategory(seed.relatedCategorySlug) : "both";

const calculatorDraftQueue = [
  ...BATCH_02_CALCULATORS,
  ...BATCH_03_CALCULATORS,
  ...BATCH_04_CALCULATORS,
  ...BATCH_05_CALCULATORS,
  ...BATCH_06_CALCULATORS,
  ...BATCH_07_CALCULATORS,
  ...BATCH_08_CALCULATORS,
  ...BATCH_09_CALCULATORS,
  ...BATCH_10_CALCULATORS,
  ...BATCH_11_CALCULATORS,
];
const articleDraftQueue = [
  ...BATCH_02_ARTICLES,
  ...BATCH_03_ARTICLES,
  ...BATCH_04_ARTICLES,
  ...BATCH_05_ARTICLES,
  ...BATCH_06_ARTICLES,
  ...BATCH_07_ARTICLES,
  ...BATCH_08_ARTICLES,
  ...BATCH_09_ARTICLES,
  ...BATCH_10_ARTICLES,
  ...BATCH_11_ARTICLES,
];

const defaultPublishingScheduleForCalculator = (
  key: CalculatorKey,
  meta: CalculatorMeta,
): PublishingScheduleSeed => {
  if (shouldPublishCalculator(key, meta)) {
    return { slot: "none", priority: 0 };
  }

  const queueIndex = calculatorDraftQueue.indexOf(key);

  if (queueIndex === -1) {
    return { slot: "none", priority: 999 };
  }

  return {
    slot: queueIndex % 2 === 0 ? "morning" : "evening",
    priority: queueIndex + 1,
  };
};

const defaultPublishingScheduleForArticle = (
  seed: ArticleSeed,
): PublishingScheduleSeed => {
  if (seed.publishByDefault === true || BATCH_01_ARTICLES.includes(seed.slug)) {
    return { slot: "none", priority: 0 };
  }

  const queueIndex = articleDraftQueue.indexOf(seed.slug);

  if (queueIndex === -1) {
    return { slot: "none", priority: 999 };
  }

  return {
    slot: "morning",
    priority: queueIndex + 1,
  };
};

const categoryFrames = {
  "nutritie-si-antrenament": {
    audience:
      "când urmărești compoziția corporală, aportul caloric, hidratarea sau performanța din antrenament",
    caution:
      "În nutriție și antrenament, rezultatul merită corelat cu obiectivul, istoricul personal și cu alte repere relevante, nu folosit izolat.",
    linkingLead:
      "Merită să legi calculatorul de alte tool-uri din aceeași zona, care rafinează interpretarea rezultatului.",
  },
  auto: {
    audience:
      "când vrei să estimezi mai corect costul unui drum, consumul real sau timpul necesar pentru un traseu",
    caution:
      "În zona auto, traficul, stilul de condus, încărcarea mașinii și diferențele de preț pot schimba rezultatul final.",
    linkingLead:
      "Legăturile interne funcționează bine aici pentru că utilizatorul caută de obicei și costul, și consumul, și timpul.",
  },
  energie: {
    audience:
      "când compari specificații tehnice, estimezi consum energetic sau convertești rapid valori folosite în practică",
    caution:
      "În energie și electricitate, rezultatul matematic este clar, dar consumul real depinde și de randament, factor de putere sau mod de folosire.",
    linkingLead:
      "Rezultatul are mai mult sens când îl legi de alte conversii și de ghidurile explicative din aceeași zona.",
  },
  "energie-pentru-casa": {
    audience:
      "când vrei să înțelegi factura, consumul din casă, producția panourilor sau rentabilitatea unei investiții energetice",
    caution:
      "În energia pentru casă, formula este utilă ca reper, dar rezultatul final depinde de obiceiurile reale de consum, orientarea acoperișului, tariful folosit și calitatea echipamentelor.",
    linkingLead:
      "Paginile funcționează cel mai bine când legi consumul, costul, dimensionarea sistemului și amortizarea în același traseu de decizie.",
  },
  conversii: {
    audience:
      "când ai nevoie de un răspuns rapid între două unități și vrei să verifici imediat dacă valoarea este corectă",
    caution:
      "La conversii simple, avantajul competitiv nu vine doar din formula, ci din claritatea explicației și din contextul util oferit pe pagina.",
    linkingLead:
      "Când cauți o conversie vrei răspunsul imediat, dar merită susținut cu linkuri spre alte conversii și pagini explicative.",
  },
  constructii: {
    audience:
      "când estimezi materiale, suprafețe sau volume pentru renovări, finisaje sau lucrări simple de șantier",
    caution:
      "În construcții și amenajări, pierderile de material, neregularitățile și specificațiile reale ale produselor pot schimba necesarul final.",
    linkingLead:
      "Pagini de construcții funcționează bine când le legi între ele: suprafață, volum, vopsea, gresie sau parchet fac parte din același traseu de decizie.",
  },
  afaceri: {
    audience:
      "când vrei să estimezi rapid costuri, marje, rentabilitate sau prețuri de vânzare pentru decizii comerciale",
    caution:
      "În afaceri, formula este utilă ca reper rapid, dar rezultatul trebuie completat cu taxe, comisioane, discounturi și contextul real al pieței.",
    linkingLead:
      "Cauți de obicei mai multe unghiuri ale aceleiași decizii, așa ca merită să verifici și marja, markup, profit și ROI.",
  },
  finante: {
    audience:
      "când vrei să calculezi procente, TVA, rate, economii sau scenarii financiare simple pentru uz personal ori comercial",
    caution:
      "În finanțe, formula oferă un reper bun, dar rezultatul trebuie citit cu atenție atunci când intervin comisioane, taxe suplimentare, condiții contractuale sau dobânzi variabile.",
    linkingLead:
      "Paginile financiare funcționează cel mai bine când legi între ele procentele, TVA-ul, economiile și creditele, pentru că utilizatorul caută de multe ori mai multe unghiuri ale aceleiași decizii.",
  },
  "salarii-si-taxe": {
    audience:
      "când compari venituri, creșterea salarială, orele lucrate sau diferența dintre brut și net într-un scenariu ușor de explicat",
    caution:
      "În zona salariilor și taxării efective, calculatorul este foarte util pentru orientare, dar regulile fiscale concrete și clauzele contractuale pot schimba interpretarea finală.",
    linkingLead:
      "Leagă natural paginile de creștere salarială, tarif orar, venit anual și taxare efectivă pentru a susține un traseu complet de decizie.",
  },
  "credite-si-economii": {
    audience:
      "când compari credite, rate, economii, refinanțare sau obiective financiare pe termen mediu și lung",
    caution:
      "În credite și economii, formula este foarte utilă pentru orientare, dar costul real depinde și de comisioane, asigurări, structura produsului și comportamentul tău financiar.",
    linkingLead:
      "Leagă între ele paginile de rata maximă, cost total credit, refinanțare, fond de urgență și obiective de economisire pentru a susține un traseu complet de decizie.",
  },
  imobiliare: {
    audience:
      "când compari o proprietate prin preț, buget total, cost lunar, chirie, randament sau costuri recurente",
    caution:
      "În imobiliare, formula ajută la orientare, dar rezultatul final depinde și de starea proprietății, structura finanțării, costurile de închidere, neocupare și cheltuielile reale din exploatare.",
    linkingLead:
      "Categoria funcționează bine când legi între ele prețul pe mp, costul total de achiziție, chiria versus cumpărarea, randamentul și costurile recurente.",
  },
} as const;

const readStringField = (doc: { [key: string]: unknown }, field: string): string => {
  const value = doc[field];
  return typeof value === "string" ? value : "";
};

const clampSeoValue = (value: string, maxLength: number) => {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (normalized.length <= maxLength) {
    return normalized;
  }

  if (maxLength <= 3) {
    return normalized.slice(0, maxLength);
  }

  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
};

const buildSeoPayload = ({
  canonicalPath,
  metaDescription,
  metaTitle,
}: {
  canonicalPath: string;
  metaDescription: string;
  metaTitle: string;
}) => ({
  canonicalPath,
  metaDescription: clampSeoValue(metaDescription, 170),
  metaTitle: clampSeoValue(metaTitle, 70),
});

const toSentenceList = (items: string[]) => {
  if (items.length === 0) {
    return "";
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} și ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")} și ${items[items.length - 1]}`;
};

const getCategoryFrame = (categorySlug: string) => {
  if (categorySlug === "auto") {
    return categoryFrames.auto;
  }

  if (categorySlug === "energie") {
    return categoryFrames.energie;
  }

  if (categorySlug === "energie-pentru-casa") {
    return categoryFrames["energie-pentru-casa"];
  }

  if (categorySlug === "conversii") {
    return categoryFrames.conversii;
  }

  if (categorySlug === "constructii") {
    return categoryFrames.constructii;
  }

  if (categorySlug === "afaceri") {
    return categoryFrames.afaceri;
  }

  if (categorySlug === "finante") {
    return categoryFrames.finante;
  }

  if (categorySlug === "salarii-si-taxe") {
    return categoryFrames["salarii-si-taxe"];
  }

  if (categorySlug === "credite-si-economii") {
    return categoryFrames["credite-si-economii"];
  }

  if (categorySlug === "imobiliare") {
    return categoryFrames.imobiliare;
  }

  return categoryFrames["nutritie-si-antrenament"];
};

const buildFallbackCalculatorMeta = (
  key: CalculatorKey,
  definition: ReturnType<typeof getCalculatorDefinition>
) => {
  const categoryFrame = getCategoryFrame(definition.categorySlug);

  return {
    shortDescription: `${definition.summary} Pagina oferă formula explicată, exemple de calcul și context util pentru interpretarea rezultatului.`,
    intro: `${definition.title} te ajută să obții un răspuns rapid, dar și să înțelegi ce înseamnă valoarea calculată în practică. Pagina folosește ${definition.formulaName.toLowerCase()} și îți da direct răspunsul, fără pasi în plus.`,
    interpretationNotes: `${categoryFrame.caution} Rezultatul trebuie verificat în funcție de datele introduse și de scenariul real în care folosești calculatorul.`,
    isFeatured: false,
    sortOrder: 200 + CALCULATOR_KEYS.indexOf(key),
    releaseBatch: defaultReleaseBatchForCalculator(key),
    editorialStatus: defaultEditorialStatusForCalculator(key),
    audience: defaultAudienceForCalculator(key),
    publishByDefault: BATCH_01_CALCULATORS.includes(key),
    example: `Exemplu orientativ pentru ${definition.title.toLowerCase()}, pornind de la valorile standard afișate în formular și ajustat apoi după scenariul tău real.`,
    faq: [
      {
        question: `Cum funcționează ${definition.title.toLowerCase()}?`,
        answer: definition.formulaDescription,
      },
      {
        question: "Când este util acest calculator?",
        answer: `Este util ${categoryFrame.audience}.`,
      },
      {
        question: "Rezultatul este exact?",
        answer:
          "Rezultatul este corect matematic pe baza formulei folosite, dar interpretarea practică depinde de contextul real.",
      },
    ],
  };
};

const homepageSeed = {
  heroBadge: "Calculatoare online clare și utile",
  heroTitle: "Calcule utile, explicate pe înțeles și gata de folosit.",
  heroDescription:
    "Calculatoare Online reunește tool-uri pentru nutriție și antrenament, auto, energie, energie pentru casă, conversii, construcții, afaceri, finanțe, salarii, credite și imobiliare, fiecare completat cu formula folosită, exemple practice, întrebări frecvente și legături către pagini relevante.",
  primaryCTA: { label: "Vezi toate calculatoarele", href: "/calculatoare" },
  secondaryCTA: { label: "Cum construim paginile", href: "/metodologie" },
  heroHighlights: [
    { value: "105", label: "calculatoare disponibile în primele unsprezece loturi" },
    { value: "11", label: "categorii principale de căutare" },
    { value: "FAQ", label: "explicații și răspunsuri integrate în pagini" },
  ],
  contentBlocks: [
    {
      blockType: "story",
      eyebrow: "Ce face diferența",
      title:
        "Fiecare pagina pornește de la un calculator real, dar merge mai departe cu explicații, interpretare și următorul pas util.",
      body: "Scopul platformei nu este doar să afișeze un rezultat rapid, ci să ofere suficient context încât utilizatorul să înțeleagă ce înseamnă cifra obținută și cum se leagă de alte calcule sau ghiduri relevante.",
      tone: "night",
    },
    {
      blockType: "facts",
      eyebrow: "Cum este structurat hub-ul",
      title: "Platforma este gândită pentru răspuns rapid, dar și pentru explorare coerentă.",
      intro:
        "Fiecare pagina are formula, exemple, FAQ, conținut contextual și legături către tool-uri sau articole apropiate.",
      tone: "mist",
      items: [
        { value: "Nutriție", label: "BMI, BMR, TDEE, proteine și calorii" },
        { value: "Auto", label: "consum, cost de drum și timp de călătorie" },
        { value: "Energie", label: "kW în CP, cost electric și conversii utile" },
        { value: "Casa", label: "factura, consum, panouri și climatizare" },
        { value: "Conversii", label: "temperatura, greutate, lungime și unități uzuale" },
        { value: "Construcții", label: "suprafață, beton, vopsea, gresie și parchet" },
        { value: "Afaceri", label: "cost rețeta, marja, adaos comercial, prag rentabilitate și ROI" },
        { value: "Finanțe", label: "procente, TVA, economii, dobânzi și rate" },
        { value: "Salarii", label: "creștere salarială, tarif orar, venit anual și taxare" },
        { value: "Credite", label: "rata maximă, refinanțare, fond de urgență și avans" },
        { value: "Imobiliare", label: "preț pe mp, chirie vs cumpărare și randament" },
      ],
    },
  ],
  seo: buildSeoPayload({
    metaTitle: "Calculatoare Online - credite, energie, imobiliare și afaceri",
    metaDescription:
      "Hub de calculatoare online pentru credite, economii, imobiliare, energie pentru casă, fotovoltaice, nutriție și antrenament, auto, construcții și afaceri, cu formule explicate, exemple practice, FAQ și pagini construite pentru utilitate reală.",
    canonicalPath: "/",
  }),
};

const categorySeeds: CategorySeed[] = [
  {
    name: "Nutriție și antrenament",
    slug: "nutritie-si-antrenament",
    summary: "Calculatoare pentru IMC, metabolism, calorii, proteine și obiective de nutriție.",
    introContent:
      "Categoria Nutriție și antrenament adună tool-uri pentru compoziție corporală, necesar caloric, proteine și alte calcule frecvente în nutriție și antrenament. Fiecare pagina combină formularul cu explicația formulei, exemple de calcul și context editorial care te ajută să folosești corect rezultatul.",
    sortOrder: 10,
    isFeatured: true,
  },
  {
    name: "Auto",
    slug: "auto",
    summary: "Tool-uri pentru consum, cost pe kilometru, costuri de drum și estimări utile pentru șoferi.",
    introContent:
      "Categoria Auto răspunde întrebărilor practice care apar înaintea unui drum sau după alimentare: cât consumă mașină, cât te costa traseul, cât durează și cum compari mai bine mai multe scenarii de consum.",
    sortOrder: 20,
    isFeatured: true,
  },
  {
    name: "Energie",
    slug: "energie",
    summary: "Conversii tehnice și estimări pentru consum, putere și cost electric.",
    introContent:
      "Categoria Energie grupează conversii tehnice și estimări de cost energetic pentru utilizare practică. Este utilă atât pentru specificații de aparate sau motoare, cât și pentru întrebări simple despre consum și cost.",
    sortOrder: 30,
    isFeatured: true,
  },
  {
    name: "Energie pentru casă",
    slug: "energie-pentru-casa",
    summary: "Calculatoare pentru factura, consumul locuinței, panouri fotovoltaice, climatizare și amortizare.",
    introContent:
      "Categoria Energie pentru casă adună calculatoare orientate spre consumul real al locuinței: costul aparatelor, factura lunară, dimensionarea unui sistem fotovoltaic, amortizarea investiției, BTU pentru aer condiționat și necesarul de încălzire. Scopul nu este doar să afli un număr, ci să legi consumul de bani, echipamente și decizii practice.",
    sortOrder: 35,
    isFeatured: true,
  },
  {
    name: "Conversii",
    slug: "conversii",
    summary: "Convertori rapizi pentru unități uzuale și formule folosite frecvent.",
    introContent:
      "Categoria Conversii îți da răspunsul rapid la întrebări recurente, dar fiecare pagina merge dincolo de formula simplă și adaugă exemple, explicații și legături către alte conversii utile.",
    sortOrder: 40,
    isFeatured: false,
  },
  {
    name: "Construcții",
    slug: "constructii",
    summary: "Tool-uri pentru suprafețe, volume și estimări de materiale în amenajări și lucrări simple.",
    introContent:
      "Categoria Construcții reunește calculatoare pentru suprafețe, volum de beton, vopsea, gresie, faianță și parchet. Scopul lor este să transforme formulele simple în estimări utile pentru buget, achiziții și organizarea lucrării.",
    sortOrder: 50,
    isFeatured: true,
  },
  {
    name: "Afaceri",
    slug: "afaceri",
    summary: "Calculatoare pentru cost rețeta, marja, adaos comercial, prag rentabilitate și ROI.",
    introContent:
      "Categoria Afaceri adună calcule simple, dar foarte căutate în vânzări, horeca și management: marja, markup, rentabilitate, ROI și alte repere care ajută la decizii rapide. Fiecare pagina explică formula și limitele interpretării ei în practică.",
    sortOrder: 60,
    isFeatured: true,
  },
  {
    name: "Finanțe",
    slug: "finante",
    summary: "Calculatoare pentru procente, TVA, discount, economii, dobânzi și rate de credit.",
    introContent:
      "Categoria Finanțe reunește calcule rapide pentru procente, discounturi, TVA, economii, dobânda compusă și rate de credit. Este gândită atât pentru persoane care compară costuri și obiective de economisire, cât și pentru firme mici care vor calcule comerciale simple, clare și reutilizabile.",
    sortOrder: 70,
    isFeatured: true,
  },
  {
    name: "Salarii și taxe",
    slug: "salarii-si-taxe",
    summary: "Calculatoare pentru creștere salarială, tarif orar, ore lucrate, venit anual și taxare efectivă.",
    introContent:
      "Categoria Salarii și taxe adună calcule utile pentru compararea ofertelor salariale, transformarea venitului lunar în tarif orar, estimarea orelor lucrate, înțelegerea diferenței dintre brut și net și planificarea venitului anual. Paginile sunt gândite ca instrumente de orientare rapidă, completate de articole care clarifică decizia și limitele interpretării.",
    sortOrder: 80,
    isFeatured: true,
  },
  {
    name: "Credite și economii",
    slug: "credite-si-economii",
    summary: "Calculatoare pentru rate, cost total credit, refinanțare, fond de urgență, economii și obiective financiare.",
    introContent:
      "Categoria Credite și economii adună calculatoare pentru rata maximă suportabilă, grad de îndatorare, cost total credit, refinanțare, fond de urgență și planificarea obiectivelor financiare. Paginile sunt gândite ca instrumente de decizie, nu doar de calcul, astfel încât utilizatorul să poata compară scenarii și să înțeleagă mai ușor ce face mai departe.",
    sortOrder: 90,
    isFeatured: true,
  },
  {
    name: "Imobiliare",
    slug: "imobiliare",
    summary:
      "Calculatoare pentru preț pe mp, buget total de achiziție, chirie vs cumpărare, randament și costuri recurente.",
    introContent:
      "Categoria Imobiliare adună calculatoare pentru compararea unei proprietăți din mai multe unghiuri: preț pe metru pătrat, cost total de achiziție, buget lunar, chirie versus cumpărare, randament din chirie și costuri recurente. Scopul este să transformi o decizie imobiliară într-un scenariu mai clar, nu doar într-o cifră separată de context.",
    sortOrder: 100,
    isFeatured: true,
  },
];

const calculatorMeta: Partial<Record<CalculatorKey, CalculatorMeta>> = {
  bmi: {
    shortDescription: "Calculează rapid indicele de masă corporală pe baza greutății și înălțimii.",
    intro: "Acest calculator BMI estimează indicele de masă corporală și te ajută să înțelegi rapid în ce interval te încadrezi.",
    interpretationNotes: "BMI este orientativ. La sportivi sau persoane cu masă musculară mare, rezultatul poate fi înșelător.",
    isFeatured: true,
    sortOrder: 10,
    example: "La 70 kg și 170 cm, BMI este 24.2.",
    faq: [
      { question: "Ce înseamnă BMI?", answer: "BMI sau IMC este indicele de masă corporală calculat din greutate și înălțime." },
      { question: "Este suficient pentru evaluare?", answer: "Nu. Este un indicator de pornire și trebuie completat cu alți factori." },
    ],
    relatedCalculatorKeys: ["bmr", "tdee", "protein-intake"],
    relatedArticleSlugs: ["cum-interpretezi-bmi-corect"],
  },
  bmr: {
    shortDescription: "Estimează rata metabolica bazala folosind formula Mifflin-St Jeor.",
    intro: "Calculatorul de metabolism bazal arată de câte calorii are nevoie corpul tău în repaus pentru funcțiile vitale, fără să amestece mișcarea zilnică cu nevoia minimă a organismului.",
    interpretationNotes: "BMR nu include activitatea zilnică. Pentru menținere, slăbire sau creștere în greutate, leagă-l imediat de calculatorul de necesar caloric zilnic.",
    isFeatured: true,
    sortOrder: 20,
    example: "Pentru 80 kg, 180 cm și 30 ani, BMR este aproximativ 1780 kcal/zi.",
    faq: [
      { question: "Ce diferența este între BMR și TDEE?", answer: "BMR este consumul în repaus, iar TDEE adaugă activitatea zilnică." },
      { question: "Formula este exactă?", answer: "Este o estimare bună, dar nu un rezultat clinic." },
    ],
    relatedCalculatorKeys: ["tdee", "calorie-deficit", "bmi"],
    relatedArticleSlugs: ["bmr-vs-tdee-diferente"],
  },
  tdee: {
    shortDescription: "Estimează necesarul zilnic de calorii în funcție de metabolism și activitate.",
    intro: "Calculatorul de necesar caloric zilnic combină metabolismul bazal cu nivelul real de activitate, ca să îți dea un reper mult mai bun pentru menținere, deficit sau surplus.",
    interpretationNotes: "Rezultatul este un punct de plecare. Ajustează după 2-3 săptămâni în funcție de evoluția reală.",
    isFeatured: true,
    sortOrder: 30,
    example: "Un BMR de 1650 kcal și activitate moderată duc la aproximativ 2550 kcal/zi.",
    faq: [
      { question: "Cum aleg nivelul de activitate?", answer: "Alege media săptămânii, nu cea mai intensă zi de antrenament." },
      { question: "TDEE se schimbă în timp?", answer: "Da, în funcție de greutate, masă musculară și rutina." },
    ],
    relatedCalculatorKeys: ["bmr", "calorie-deficit", "protein-intake"],
    relatedArticleSlugs: ["bmr-vs-tdee-diferente"],
  },
  "calorie-deficit": {
    shortDescription: "Pornește de la TDEE și estimează țintă zilnică de calorii pentru slăbire.",
    intro: "Calculatorul transformă TDEE-ul într-o țintă practică de calorii pentru un deficit lent, moderat sau agresiv.",
    interpretationNotes: "Pentru mulți utilizatori, deficitul moderat este un punct de plecare mai sustenabil decât varianta agresivă.",
    isFeatured: true,
    sortOrder: 40,
    example: "La un TDEE de 2400 kcal, un deficit moderat duce la circa 1920 kcal/zi.",
    faq: [
      { question: "Ce deficit este recomandat?", answer: "De multe ori 15% până la 20% este un compromis bun între progres și sustenabilitate." },
      { question: "Calculatorul garantează slăbirea?", answer: "Nu. Este un punct de pornire care necesită ajustare în funcție de răspunsul real." },
    ],
    relatedCalculatorKeys: ["tdee", "bmr", "protein-intake"],
    relatedArticleSlugs: ["cum-setezi-un-deficit-caloric"],
  },
  "protein-intake": {
    shortDescription: "Estimează câte grame de proteine ai nevoie zilnic în funcție de greutate și obiectiv.",
    intro: "Calculatorul de proteine este util pentru menținere, slăbire sau creștere musculară când vrei o țintă simplă și ușor de aplicat.",
    interpretationNotes: "Rezultatul este orientativ. Pentru condiții medicale speciale, consulta un specialist.",
    isFeatured: false,
    sortOrder: 50,
    example: "La 75 kg și menținere, 1.8 g/kg înseamnă aproximativ 135 g/zi.",
    faq: [
      { question: "De ce crește necesarul de proteine în deficit?", answer: "Un aport mai mare poate ajuta la menținerea masei musculare și la satietate." },
      { question: "Trebuie împărțite pe mese?", answer: "De obicei este mai ușor să distribui proteinele în 3-5 mese pe zi." },
    ],
    relatedCalculatorKeys: ["tdee", "calorie-deficit", "bmi"],
    relatedArticleSlugs: ["cate-proteine-ai-nevoie-zilnic"],
  },
  "fuel-consumption": {
    shortDescription: "Află consumul mediu în litri la 100 km pe baza distanței și a carburantului consumat.",
    intro: "Calculatorul de consum combustibil este unul dintre cele mai utile tool-uri auto pentru costuri și comparații reale.",
    interpretationNotes: "Rezultatul este mai relevant dacă măsurătoarea acoperă o distanță suficient de lungă.",
    isFeatured: true,
    sortOrder: 60,
    example: "36 litri consumați pe 500 km înseamnă 7.2 l/100 km.",
    faq: [
      { question: "Cum calculez corect consumul real?", answer: "Alimentează până la plin, notează distanța și litrii consumați, apoi aplică formula." },
      { question: "Consumul din bord este suficient?", answer: "Este orientativ, dar calculul manual este de obicei mai apropiat de realitate." },
    ],
    relatedCalculatorKeys: ["trip-fuel-cost", "electricity-cost"],
    relatedArticleSlugs: ["cum-calculezi-consumul-real-la-masina"],
  },
  "trip-fuel-cost": {
    shortDescription: "Estimează câți litri consumi și cât te costa un drum pe baza distanței, consumului și prețului carburantului.",
    intro: "Calculatorul de cost auto transformă consumul mediu și prețul combustibilului într-o estimare financiară ușor de folosit.",
    interpretationNotes: "Rezultatul nu include taxe de drum, parcări sau variații de consum cauzate de trafic ori viteza.",
    isFeatured: true,
    sortOrder: 70,
    example: "La 320 km, 7 l/100 km și 7.45 lei/l, costul este aproximativ 166.88 lei.",
    faq: [
      { question: "Pot folosi consumul mixt din fabrica?", answer: "Da, dar pentru estimări mai bune e preferabil consumul tău mediu real." },
      { question: "Include oraș și autostradă separat?", answer: "Nu în varianta inițială; poți calcula separat două scenarii." },
    ],
    relatedCalculatorKeys: ["fuel-consumption", "kw-cp", "electricity-cost"],
    relatedArticleSlugs: ["cum-estimezi-costul-unei-calatorii-cu-masina"],
  },
  "kw-cp": {
    shortDescription: "Convertește rapid kilowați în cai putere și invers din același calculator.",
    intro: "Convertorul KW în CP este util pentru comparații auto, moto și specificații tehnice unde apar ambele unități.",
    interpretationNotes: "În specificații tehnice pot apărea valori rotunjite, deci sunt posibile diferențe mici față de alte surse.",
    isFeatured: true,
    sortOrder: 80,
    example: "110 kW înseamnă aproximativ 149.56 CP.",
    faq: [
      { question: "Cât înseamnă 1 kW în CP?", answer: "1 kW este aproximativ 1.35962 CP." },
      { question: "Pot converti și invers?", answer: "Da, calculatorul funcționează în ambele sensuri." },
    ],
    relatedCalculatorKeys: ["fuel-consumption", "trip-fuel-cost", "temperature-converter"],
    relatedArticleSlugs: ["kw-vs-cp-explicat-simplu"],
  },
  "electricity-cost": {
    shortDescription: "Estimează consumul lunar și costul energiei electrice pe baza puterii, timpului de utilizare și prețului pe kWh.",
    intro: "Calculatorul este util pentru electrocasnice, aparate de aer condiționat sau orice echipament pentru care vrei o estimare de cost.",
    interpretationNotes: "Consumul real poate varia în funcție de cicluri de funcționare, eficiență aparatului și tariful exact din contract.",
    isFeatured: true,
    sortOrder: 90,
    example: "Un aparat de 1500 W folosit 2 ore/zi consumă circa 90 kWh/luna, adica aproximativ 72 lei la 0.8 lei/kWh.",
    faq: [
      { question: "Cum transform watt în kWh?", answer: "Împărți puterea în W la 1000 pentru a obține kW, apoi înmulțești cu orele de funcționare." },
      { question: "Trebuie să includ toate taxele în prețul pe kWh?", answer: "Ideal da, pentru o estimare mai apropiată de factura finală." },
    ],
    relatedCalculatorKeys: ["watts-to-kwh", "amps-to-watts", "kw-cp"],
    relatedArticleSlugs: ["cum-calculezi-consumul-electric-al-unui-aparat"],
  },
  "body-fat-us-navy": {
    shortDescription: "Estimează procentul de grăsime corporală din circumferințe și înălțime folosind formula US Navy.",
    intro: "Calculatorul de grăsime corporală este util când vrei un reper mai fin decât BMI-ul și ai nevoie de o estimare orientativă a compoziției corporale.",
    interpretationNotes: "Formula este orientativă și depinde mult de măsurători corecte. Diferențe mici de centimetri pot schimba rezultatul mai mult decât te aștepți.",
    isFeatured: false,
    sortOrder: 55,
    example: "Pentru 175 cm, 84 cm talie și 38 cm gât, rezultatul poate fi în jur de 17-18% la bărbați.",
    faq: [
      { question: "Este mai util decât BMI?", answer: "De multe ori oferă mai mult context despre compoziția corporală, dar tot rămâne o estimare, nu o măsurătoare clinică." },
      { question: "Cum măsor corect circumferințele?", answer: "Folosește un centimetru flexibil, stai relaxat și măsoară în același punct de fiecare data pentru comparații coerente." },
    ],
    relatedCalculatorKeys: ["bmi", "ideal-weight", "protein-intake"],
    relatedArticleSlugs: ["cum-estimezi-procentul-de-grasime-corporala"],
  },
  "ideal-weight": {
    shortDescription: "Calculează o greutate ideală orientativă în funcție de înălțime și sex cu formula Devine.",
    intro: "Calculatorul de greutate ideală este util când vrei un reper simplu pentru intervalul de greutate, fără să-l tratezi ca obiectiv rigid.",
    interpretationNotes: "Greutatea ideală este un reper general. Nu surprinde masă musculară, structura corporală sau contextul individual al utilizatorului.",
    isFeatured: false,
    sortOrder: 57,
    example: "La 175 cm, formula Devine estimează aproximativ 70.5 kg pentru femei și 75 kg pentru bărbați.",
    faq: [
      { question: "Greutatea ideală este același lucru cu greutatea sănătoasă?", answer: "Nu neapărat. Este un reper statistic orientativ, nu un verdict medical sau estetic." },
      { question: "De ce merită combinată cu alte calcule?", answer: "Pentru ca BMI-ul, procentul de grăsime și obiectivul personal oferă context mai bun decât o singură valoare." },
    ],
    relatedCalculatorKeys: ["bmi", "body-fat-us-navy", "water-intake"],
    relatedArticleSlugs: ["cum-estimezi-procentul-de-grasime-corporala"],
  },
  "water-intake": {
    shortDescription: "Estimează aportul zilnic de apa pornind de la greutate și oferă un reper ușor de aplicat în rutina.",
    intro: "Calculatorul de apa este gândit pentru utilizatorii care vor un punct de plecare simplu, apoi își ajustează hidratarea în funcție de activitate, sezon și obiceiuri.",
    interpretationNotes: "Rezultatul nu înlocuiește semnalele reale ale corpului sau recomandările medicale. Este mai util ca reper de organizare zilnică.",
    isFeatured: false,
    sortOrder: 58,
    example: "La 70 kg, regulă de 35 ml/kg duce la aproximativ 2450 ml, adica 2.45 litri pe zi.",
    faq: [
      { question: "Trebuie să beau exact atât în fiecare zi?", answer: "Nu. Necesarul variază după temperatura, activitate, alimentație și toleranța personală." },
      { question: "Apa din cafea, ceai sau alimente contează?", answer: "Da, aportul total de lichide contează, dar mulți utilizatori prefera să folosească apa ca reper principal." },
    ],
    relatedCalculatorKeys: ["tdee", "protein-intake", "ideal-weight"],
    relatedArticleSlugs: ["cata-apa-ai-nevoie-zilnic-cu-adevarat"],
  },
  "one-rep-max": {
    shortDescription: "Estimează repetarea maximă și o greutate utilă de antrenament pornind de la o serie submaximală.",
    intro: "Calculatorul de repetare maximă este util când vrei să planifici mai clar intensitatea la exerciții de forța fără să testezi mereu un maxim real în sala.",
    interpretationNotes: "Formula funcționează mai bine pe seturi scurte și execuții curate. La repetări multe sau tehnică instabilă, estimarea devine mai slabă.",
    isFeatured: false,
    sortOrder: 59,
    example: "80 kg pentru 5 repetări duc la un 1RM estimat de aproximativ 93.3 kg și la circa 79.3 kg pentru 85% din 1RM.",
    faq: [
      { question: "Este nevoie să testez un maxim real?", answer: "Nu întotdeauna. Pentru mulți utilizatori, estimarea este suficientă ca reper de programare a antrenamentului." },
      { question: "Pentru câte repetări mai este util calculatorul?", answer: "De obicei funcționează mai bine până în jur de 8-10 repetări, după care precizia scade progresiv." },
    ],
    relatedCalculatorKeys: ["protein-intake", "tdee", "water-intake"],
    relatedArticleSlugs: ["cum-folosesti-one-rep-max-in-antrenament"],
  },
  "temperature-converter": {
    shortDescription: "Convertește instant temperaturile din grade Celsius în Fahrenheit și invers.",
    intro: "Convertorul de temperatura este util în rețete, specificații tehnice, prognoze și contexte internaționale.",
    interpretationNotes: "Pentru uz obișnuit, rotunjirea la una sau două zecimale este suficientă.",
    isFeatured: false,
    sortOrder: 97,
    example: "25C înseamnă 77F.",
    faq: [
      { question: "Care este formula din Celsius în Fahrenheit?", answer: "F = C x 9/5 + 32." },
      { question: "Pot converti și invers?", answer: "Da, calculatorul funcționează în ambele sensuri." },
    ],
    relatedCalculatorKeys: ["kg-lb", "cm-inch"],
    relatedArticleSlugs: ["ghid-conversii-kg-lb-cm-inch"],
  },
  "cost-per-km": {
    shortDescription: "Calculează cât te costa combustibilul pe kilometru și pe 100 km folosind consumul mediu și prețul carburantului.",
    intro: "Calculatorul de cost pe kilometru este util când vrei un reper foarte rapid pentru buget, comparații între mașini sau între două trasee.",
    interpretationNotes: "Rezultatul include doar componenta de carburant. Nu ia în calcul revizii, anvelope, taxe sau deprecierea mașinii.",
    isFeatured: false,
    sortOrder: 75,
    example: "La 7 l/100 km și 7.45 lei/l, costul de carburant este de aproximativ 0.522 lei/km și 52.15 lei/100 km.",
    faq: [
      { question: "Este același lucru cu costul total al mașinii?", answer: "Nu. Aici calculezi doar costul de carburant, nu costul complet de utilizare." },
      { question: "Când este mai util acest calculator?", answer: "Când vrei să compari rapid două mașini, două rute sau impactul unei schimbări de preț la carburant." },
    ],
    relatedCalculatorKeys: ["fuel-consumption", "trip-fuel-cost", "travel-time"],
    relatedArticleSlugs: ["cost-pe-kilometru-vs-cost-total-drum"],
  },
  "travel-time": {
    shortDescription: "Estimează durata unui drum din distanța și viteza medie, în ore și minute ușor de interpretat.",
    intro: "Calculatorul de timp de călătorie este util pentru planificare rapidă, mai ales când vrei să compari două scenarii de traseu sau de viteza medie.",
    interpretationNotes: "Viteza medie reală este de obicei mai mică decât cea imaginată. Traficul, opririle și diferențele de drum pot schimba rapid estimarea.",
    isFeatured: false,
    sortOrder: 76,
    example: "Pentru 320 km și 78 km/h viteza medie, timpul estimat este de aproximativ 4.1 ore, adica 246 minute.",
    faq: [
      { question: "Pot folosi limita legală de viteza?", answer: "Mai bine folosești viteza medie realistă, altfel rezultatul va fi prea optimist." },
      { question: "Calculatorul include opriri sau trafic?", answer: "Nu automat. Le poți integra alegând o viteză medie mai apropiată de scenariul real." },
    ],
    relatedCalculatorKeys: ["trip-fuel-cost", "cost-per-km", "fuel-consumption"],
    relatedArticleSlugs: ["cum-estimezi-costul-unei-calatorii-cu-masina"],
  },
  "amps-to-watts": {
    shortDescription: "Transformă amperii în wati pornind de la tensiune și afișează rezultatul și în kilowați.",
    intro: "Convertorul amperi în wati este util pentru întrebări tehnice simple despre putere electrică, mai ales când eticheta sau discuția pornește de la intensitate.",
    interpretationNotes: "Formula simplă W = A x V este utilă în scenarii de baza. Pentru sisteme mai complexe, factorul de putere sau tipul curentului pot conta.",
    isFeatured: false,
    sortOrder: 85,
    example: "La 10 A și 230 V, rezultatul este 2300 W, adica 2.3 kW.",
    faq: [
      { question: "Formula este mereu suficientă?", answer: "Pentru conversii simple, da. Pentru instalații complexe sau curent alternativ cu factori suplimentari, poate fi doar orientativă." },
      { question: "De ce e util să văd și kW?", answer: "Pentru ca multe specificații și estimări de consum sunt exprimate în kilowați sau kWh, nu doar în wati." },
    ],
    relatedCalculatorKeys: ["watts-to-kwh", "electricity-cost", "kw-cp"],
    relatedArticleSlugs: ["cum-transformi-amperii-in-wati-si-wati-in-kwh"],
  },
  "watts-to-kwh": {
    shortDescription: "Calculează consumul energetic în kWh din puterea aparatului și timpul de funcționare.",
    intro: "Calculatorul W în kWh este puntea practică dintre puterea afișată pe un aparat și consumul pe care îl vezi apoi în estimări de factura.",
    interpretationNotes: "Rezultatul este foarte util pentru estimare, dar consumul real poate varia în funcție de cicluri, randament și funcționarea efectivă a aparatului.",
    isFeatured: false,
    sortOrder: 86,
    example: "1500 W folosiți timp de 2 ore înseamnă 3 kWh consumați.",
    faq: [
      { question: "Care este diferența dintre W și kWh?", answer: "W descrie puterea într-un moment dat, iar kWh descrie energia consumată pe o perioadă de timp." },
      { question: "Cum folosesc rezultatul în costuri?", answer: "Dupa ce obții kWh-ul, îl înmulțești cu prețul energiei pentru a estima costul." },
    ],
    relatedCalculatorKeys: ["electricity-cost", "amps-to-watts", "kw-cp"],
    relatedArticleSlugs: ["cum-transformi-amperii-in-wati-si-wati-in-kwh", "cum-calculezi-consumul-electric-al-unui-aparat"],
  },
  "kg-lb": {
    shortDescription: "Convertește kilogramele în livre și invers pentru situații uzuale din fitness, shopping sau documentație internațională.",
    intro: "Convertorul kg în lb este util când compari rapid greutăți afișate în sisteme diferite și vrei un răspuns instant fără riscul unei conversii greșite.",
    interpretationNotes: "În multe contexte, două zecimale sunt suficiente. Pentru uz cotidian, nu merită să complici afișarea cu mai multă precizie decât ai nevoie.",
    isFeatured: false,
    sortOrder: 95,
    example: "70 kg înseamnă aproximativ 154.32 lb, iar 180 lb înseamnă aproximativ 81.65 kg.",
    faq: [
      { question: "De ce apar frecvent livrele în fitness?", answer: "Pentru ca multe surse internaționale, echipamente și programe de antrenament folosesc sistemul imperial." },
      { question: "Cât de precisă este conversia?", answer: "Formula folosește factorul standard și este suficient de precisă pentru uz obișnuit și comparații practice." },
    ],
    relatedCalculatorKeys: ["cm-inch", "bmi", "temperature-converter"],
    relatedArticleSlugs: ["ghid-conversii-kg-lb-cm-inch"],
  },
  "cm-inch": {
    shortDescription: "Convertește centimetri în inch și invers pentru dimensiuni personale, produse sau specificații internaționale.",
    intro: "Convertorul cm în inch este util în shopping, fitness, design și documentație tehnică, mai ales când alternezi des între sistemul metric și cel imperial.",
    interpretationNotes: "La dimensiuni uzuale, două zecimale sunt suficiente pentru majoritatea scenariilor. Important este mai ales să nu inversezi sensul conversiei.",
    isFeatured: false,
    sortOrder: 96,
    example: "180 cm înseamnă aproximativ 70.87 inch, iar 72 inch înseamnă 182.88 cm.",
    faq: [
      { question: "În ce situații apare cel mai des conversia?", answer: "Apare frecvent la haine, ecrane, înălțime corporală, mobilier și specificații internaționale." },
      { question: "Pot folosi rezultatul direct în alte calcule?", answer: "Da, de exemplu în formule care cer inch sau în conversii succesive pentru înălțime și greutate." },
    ],
    relatedCalculatorKeys: ["kg-lb", "ideal-weight", "temperature-converter"],
    relatedArticleSlugs: ["ghid-conversii-kg-lb-cm-inch"],
  },
  "percentage-of-number": {
    shortDescription: "Calculează rapid cât înseamnă un procent dintr-o sumă, valoare sau baza de comparație.",
    intro: "Calculatorul procent din număr este util când vrei să afli repede cât înseamnă 19% dintr-un preț, 25% dintr-un buget sau orice altă pondere aplicată unei valori de baza.",
    interpretationNotes: "Rezultatul este direct și exact matematic, dar merită verificat dacă folosești procentul pe baza corectă: net, brut, preț inițial sau total final.",
    isFeatured: true,
    sortOrder: 310,
    example: "La o bază de 1.500 lei și un procent de 19%, rezultatul este 285 lei.",
    faq: [
      { question: "Când este util acest calculator?", answer: "Este util pentru TVA, comisioane, discounturi, bonusuri, targete și orice calcul în care procentul se aplică peste o valoare de baza." },
      { question: "Care este cea mai frecvența greșeală?", answer: "Să aplici procentul la suma greșită: de exemplu la total cu TVA în loc de baza netă sau la suma deja redusă." },
    ],
    relatedCalculatorKeys: ["percentage-change", "discount", "vat"],
    relatedArticleSlugs: ["cum-calculezi-procentele-corect"],
  },
  "percentage-change": {
    shortDescription: "Arată cu cât a crescut sau a scăzut o valoare în procente între două momente sau două scenarii.",
    intro: "Calculatorul de diferența procentuală este util pentru prețuri, salarii, trafic, vânzări sau orice comparație între o valoare inițială și una noua.",
    interpretationNotes: "Rezultatul depinde întotdeauna de valoarea inițială, nu de cea noua, așa ca merită verificat ce cifra folosești ca punct de plecare.",
    isFeatured: true,
    sortOrder: 320,
    example: "Dacă o valoare crește de la 100 la 125, diferența absolută este 25, iar creșterea procentuală este 25%.",
    faq: [
      { question: "De ce contează valoarea inițială?", answer: "Pentru ca diferența procentuală se raportează la baza inițială, iar asta schimbă rezultatul față de o comparație intuitivă." },
      { question: "Calculatorul merge și pentru scăderi?", answer: "Da. Dacă valoarea noua este mai mică, rezultatul procentual va fi negativ." },
    ],
    relatedCalculatorKeys: ["percentage-of-number", "reverse-percentage", "discount"],
    relatedArticleSlugs: ["procent-din-numar-vs-diferenta-procentuala"],
  },
  "reverse-percentage": {
    shortDescription: "Recuperează valoarea inițială atunci când știi rezultatul final și procentul de reducere sau majorare.",
    intro: "Calculatorul procent invers este foarte util atunci când vrei să afli prețul inițial dintr-un preț redus sau baza de la care s-a plecat după o creștere procentuală.",
    interpretationNotes: "Este important să alegi corect sensul procentului: reducere sau majorare. Același procent aplicat invers duce la rezultate diferite.",
    isFeatured: false,
    sortOrder: 330,
    example: "Dacă prețul final este 81 lei după o reducere de 10%, prețul inițial a fost 90 lei.",
    faq: [
      { question: "De ce nu pot adăuga pur și simplu procentul înapoi?", answer: "Pentru ca procentul a fost aplicat la baza inițială, nu la valoarea finală redusă." },
      { question: "Când apare cel mai des acest calcul?", answer: "Apare frecvent la promoții, TVA, comisioane și comparații de creștere/scădere." },
    ],
    relatedCalculatorKeys: ["discount", "percentage-of-number", "percentage-change"],
    relatedArticleSlugs: ["procent-din-numar-vs-diferenta-procentuala"],
  },
  discount: {
    shortDescription: "Calculează reducerea în lei și prețul final după aplicarea unui discount procentual.",
    intro: "Calculatorul de discount este util pentru oferte comerciale, comparații de preț și verificarea rapidă a unei promoții înainte de achiziție sau publicare.",
    interpretationNotes: "Un discount mare nu înseamnă automat cel mai bun preț dacă baza inițială este diferită sau dacă apar comisioane și costuri suplimentare.",
    isFeatured: true,
    sortOrder: 340,
    example: "La un preț inițial de 299,99 lei și un discount de 15%, reducerea este de 45 lei, iar prețul final aproximativ 254,99 lei.",
    faq: [
      { question: "Calculatorul merge și pentru reduceri comerciale B2B?", answer: "Da, formula este aceeași, doar contextul diferă: retail, distribuție sau negociere comercială." },
      { question: "Cum verific dacă promoția este reală?", answer: "Compară prețul final, nu doar procentul afișat, și verifică dacă baza inițială este una realistă." },
    ],
    relatedCalculatorKeys: ["reverse-percentage", "vat", "percentage-of-number"],
    relatedArticleSlugs: ["cum-calculezi-discountul-real"],
  },
  vat: {
    shortDescription: "Adaugă TVA peste o bază netă și afișează separat taxa și totalul de plata.",
    intro: "Calculatorul TVA este util pentru facturi, oferte, pricing și orice situație în care ai o sumă netă și vrei să afli totalul cu TVA inclus.",
    interpretationNotes: "Rezultatul este exact matematic, dar în practică merită verificat dacă lucrezi cu baza netă, cu o cotă corectă și cu eventuale excepții fiscale.",
    isFeatured: true,
    sortOrder: 350,
    example: "Pentru o bază netă de 1.000 lei și o cotă TVA de 19%, TVA-ul este 190 lei, iar totalul 1.190 lei.",
    faq: [
      { question: "Când folosesc calculatorul TVA simplu?", answer: "Îl folosești când ai suma fără TVA și vrei să afli valoarea taxei și totalul de plata." },
      { question: "Este suficient pentru orice situație fiscală?", answer: "Nu. Pentru cazuri speciale sau regimuri fiscale particulare, formula standard trebuie verificată separat." },
    ],
    relatedCalculatorKeys: ["reverse-vat", "percentage-of-number", "discount"],
    relatedArticleSlugs: ["tva-inclus-vs-tva-exclus"],
  },
  "reverse-vat": {
    shortDescription: "Scoate TVA-ul dintr-o sumă brută și separă baza netă de componenta fiscală.",
    intro: "Calculatorul TVA invers este util când primești sau compari sume cu TVA inclus și vrei să afli rapid baza netă și taxa inclusă în total.",
    interpretationNotes: "Rezultatul este corect doar dacă suma introdusă include deja TVA-ul și cota aleasă este cea aplicată efectiv în acel caz.",
    isFeatured: false,
    sortOrder: 360,
    example: "Dintr-o sumă de 1.190 lei cu TVA 19%, baza netă este 1.000 lei, iar TVA-ul inclus este 190 lei.",
    faq: [
      { question: "Care este diferența față de calculatorul TVA normal?", answer: "Aici pleci de la suma brută și afli baza netă, în timp ce calculatorul TVA normal pornește de la baza netă." },
      { question: "Când apare în practică?", answer: "Apare des la verificarea facturilor, comparații de preț și reconcilieri rapide între net și brut." },
    ],
    relatedCalculatorKeys: ["vat", "reverse-percentage", "percentage-of-number"],
    relatedArticleSlugs: ["tva-inclus-vs-tva-exclus"],
  },
  "compound-interest": {
    shortDescription: "Estimează cât ajunge o sumă investită în timp atunci când dobânda se capitalizează periodic.",
    intro: "Calculatorul de dobânda compusă este unul dintre cele mai utile tool-uri financiare atunci când vrei să vezi efectul timpului și al capitalizării asupra unei sume inițiale.",
    interpretationNotes: "Rezultatul este un scenariu matematic. În viață reală pot interveni taxe, randamente variabile, comisioane și perioade cu performanța diferită.",
    isFeatured: true,
    sortOrder: 370,
    example: "La 10.000 lei investiți, 7% dobânda anuală, 10 ani și capitalizare lunară, valoarea viitoare trece de 20.000 lei.",
    faq: [
      { question: "De ce este atât de important timpul în dobânda compusă?", answer: "Pentru ca dobânda se reinvestește și produce la rândul ei dobânda, iar efectul crește pe perioade mai lungi." },
      { question: "Este util și pentru depozite, și pentru investiții?", answer: "Da, ca model simplificat de creștere, chiar dacă produsele reale pot avea reguli și randamente diferite." },
    ],
    relatedCalculatorKeys: ["monthly-savings", "savings-goal", "loan-payment"],
    relatedArticleSlugs: ["cum-functioneaza-dobanda-compusa"],
  },
  "monthly-savings": {
    shortDescription: "Arată cât se poate aduna din contribuții lunare recurente pe o perioadă data, cu sau fără dobânda.",
    intro: "Calculatorul de economii lunare este util când vrei să transformi un obicei de economisire într-o sumă finală concretă și ușor de urmărit.",
    interpretationNotes: "Rezultatul depinde mult de disciplină lunară și de randamentul ales. Dacă randamentul este variabil, folosește-l ca reper, nu ca promisiune.",
    isFeatured: true,
    sortOrder: 380,
    example: "La 500 lei economisiți lunar, 5% pe an și 5 ani, suma finală depășește simplă adunare a contribuțiilor lunare.",
    faq: [
      { question: "Ce se întâmplă dacă dobânda este zero?", answer: "Calculatorul reduce scenariul la suma simplă a contribuțiilor lunare pe toată perioada." },
      { question: "Pot folosi acest calculator pentru un fond de urgență?", answer: "Da, este foarte util pentru a vedea în cât timp poți construi un fond țintă." },
    ],
    relatedCalculatorKeys: ["savings-goal", "compound-interest", "loan-payment"],
    relatedArticleSlugs: ["cum-planifici-economii-lunare"],
  },
  "savings-goal": {
    shortDescription: "Calculează ce suma trebuie să economisești lunar ca să ajungi la o țintă financiară într-un termen fix.",
    intro: "Calculatorul de obiectiv economisire este util când pornești de la o țintă clară, cum ar fi avans, vacanță, fond de urgență sau achiziție mare, și vrei să vezi ce ritm lunar îți trebuie.",
    interpretationNotes: "Rezultatul este realist doar dacă perioada și randamentul sunt credibile pentru contextul tău. O țintă prea agresivă poate cere o contribuție lunară greu de susținut.",
    isFeatured: false,
    sortOrder: 390,
    example: "Pentru un obiectiv de 30.000 lei în 4 ani, cu 5% pe an, contribuția lunară este semnificativ mai mică decât într-un scenariu fără dobânda.",
    faq: [
      { question: "Este mai util decât calculatorul de economii lunare?", answer: "Da, atunci când pleci de la țintă finală și vrei să vezi ritmul lunar necesar, nu totalul pe care îl obții." },
      { question: "Pot seta dobânda zero?", answer: "Da. În acel caz calculatorul împarte obiectivul la numărul total de luni." },
    ],
    relatedCalculatorKeys: ["monthly-savings", "compound-interest", "reverse-percentage"],
    relatedArticleSlugs: ["cum-estimezi-un-obiectiv-de-economisire"],
  },
  "loan-payment": {
    shortDescription: "Estimează rata lunară, costul total și dobânda totală pentru un credit cu rambursare în rate egale.",
    intro: "Calculatorul de rata credit este util pentru simulări rapide atunci când vrei să compari sume, perioade și dobânzi înainte de o discuție cu banca sau IFN-ul.",
    interpretationNotes: "Rezultatul este orientativ și nu include automat toate comisioanele, asigurările sau particularitățile contractuale care pot modifica costul total real.",
    isFeatured: true,
    sortOrder: 400,
    example: "La 250.000 lei, 8.5% pe an și 30 de ani, rata lunară poate fi estimată rapid, împreună cu costul total și dobânda plătită.",
    faq: [
      { question: "Calculatorul arată costul total real al creditului?", answer: "Arată scenariul pe baza dobânzii și perioadei, dar costul real poate include și comisioane sau asigurări." },
      { question: "Este util și pentru comparații între oferte?", answer: "Da. Te ajută să vezi rapid cum se schimbă rata și costul total când modifici dobânda sau durata." },
    ],
    relatedCalculatorKeys: ["compound-interest", "monthly-savings", "savings-goal"],
    relatedArticleSlugs: ["cum-citesti-rata-lunară-la-un-credit"],
  },
  "room-area": {
    shortDescription: "Calculează rapid suprafață și perimetrul unei camere pentru renovari, finisaje și estimări de materiale.",
    intro: "Calculatorul de suprafață camera este punctul de plecare pentru multe alte estimări din amenajări: vopsea, parchet, gresie sau buget de materiale.",
    interpretationNotes: "Rezultatul este corect pentru camere dreptunghiulare. Pentru forme neregulate, împarte spațiul în mai multe zone și calculează separat.",
    isFeatured: true,
    sortOrder: 110,
    example: "La 5 m lungime și 4 m lățime, suprafață este 20 mp, iar perimetrul este 18 m.",
    faq: [
      { question: "Când este util perimetrul?", answer: "Perimetrul este util pentru plinte, baghete, brâuri sau pentru verificări rapide înainte de comanda." },
      { question: "Cum calculez o cameră neregulată?", answer: "Împarte camera în dreptunghiuri mai mici, calculează fiecare suprafață separat și apoi adună rezultatele." },
    ],
    relatedCalculatorKeys: ["paint-coverage", "tile-coverage", "laminate-flooring"],
    relatedArticleSlugs: ["cum-calculezi-suprafata-unei-camere-corect"],
  },
  "concrete-volume": {
    shortDescription: "Estimează volumul de beton necesar pentru fundații, plăci și alte turnări simple pornind de la dimensiuni.",
    intro: "Calculatorul de volum beton este util când vrei un reper rapid în metri cubi înainte să comanzi material sau să compari mai multe variante de lucrare.",
    interpretationNotes: "În practică merită să iei și o rezervă rezonabilă pentru pierderi, cofraje neregulate și diferențe față de dimensiunile teoretice.",
    isFeatured: true,
    sortOrder: 120,
    example: "Pentru 10 m lungime, 0.4 m lățime și 80 cm grosime, volumul este 3.2 m3, adica aproximativ 3200 l.",
    faq: [
      { question: "Rezultatul include pierderi?", answer: "Nu. Calculatorul afișează volumul geometric, iar pierderile se adaugă separat în funcție de santier." },
      { question: "Pot folosi calculatorul și pentru placă?", answer: "Da, dacă introduci dimensiunile corecte ale suprafeței și grosimea turnarii." },
    ],
    relatedCalculatorKeys: ["room-area", "paint-coverage", "tile-coverage"],
    relatedArticleSlugs: ["cum-calculezi-volumul-de-beton-pentru-fundatie"],
  },
  "paint-coverage": {
    shortDescription: "Estimează câtă vopsea îți trebuie în funcție de suprafață, numărul de straturi și acoperirea declarată.",
    intro: "Calculatorul de necesar vopsea este util când vrei să transformi rapid suprafață de lucru într-o cantitate orientativă de material.",
    interpretationNotes: "Absorbția suportului, trafaletul folosit și calitatea stratului de baza pot schimba necesarul real față de eticheta produsului.",
    isFeatured: false,
    sortOrder: 130,
    example: "Pentru 48 mp, 2 straturi și o acoperire de 10 mp/l, necesarul este de aproximativ 9.6 l.",
    faq: [
      { question: "De ce contează numărul de straturi?", answer: "Pentru ca fiecare strat consumă material separat, iar suprafață trebuie înmulțită cu numărul de aplicări." },
      { question: "Acoperirea de pe cutie este exactă?", answer: "Este orientativă. În practică, suportul și modul de aplicare pot schimba consumul." },
    ],
    relatedCalculatorKeys: ["room-area", "tile-coverage", "laminate-flooring"],
    relatedArticleSlugs: ["cum-estimezi-necesarul-de-vopsea"],
  },
  "tile-coverage": {
    shortDescription: "Calculează suprafață ajustată cu pierderi și numărul de cutii pentru gresie sau faianță.",
    intro: "Calculatorul de gresie și faianță este util când vrei să știi nu doar suprafață utilă, ci și rezervă realistă pentru tăieturi și pierderi.",
    interpretationNotes: "Modelele cu montaj diagonal, camerele cu multe colțuri sau plăcile cu dimensiuni speciale pot cere un procent mai mare de pierderi.",
    isFeatured: false,
    sortOrder: 140,
    example: "Pentru 24 mp, 10% pierderi și 1.44 mp/cutie, ajungi la circa 26.4 mp și 19 cutii.",
    faq: [
      { question: "Ce procent de pierderi aleg?", answer: "Pentru montaj drept procentul poate fi mai mic, iar pentru diagonal sau multe decupaje merită mai mult." },
      { question: "Se aplică la gresie și faianță în același fel?", answer: "Formula de baza este aceeași; diferă doar contextul și procentul de rezervă ales." },
    ],
    relatedCalculatorKeys: ["room-area", "laminate-flooring", "paint-coverage"],
    relatedArticleSlugs: ["cum-calculezi-necesarul-de-gresie-si-faianta"],
  },
  "laminate-flooring": {
    shortDescription: "Estimează câte pachete de parchet îți trebuie după ce adaugi rezervă pentru tăieturi.",
    intro: "Calculatorul de necesar parchet îți oferă un reper rapid pentru comanda de materiale și te ajută să eviți atât surplusul mare, cât și lipsă de material.",
    interpretationNotes: "Rezervă depinde de modelul de montaj, de forma camerei și de cât de mult material se pierde la tăieturi.",
    isFeatured: false,
    sortOrder: 150,
    example: "Pentru 18 mp, 8% rezervă și 2.22 mp/pachet, ajungi la aproximativ 19.44 mp și 9 pachete.",
    faq: [
      { question: "De ce am nevoie de rezervă?", answer: "Pentru ca montajul produce inevitabil tăieturi, iar o parte din material nu mai poate fi refolosit eficient." },
      { question: "Calculatorul merge și pentru SPC sau vinyl?", answer: "Da, dacă știi acoperirea pe pachet și vrei doar o estimare de suprafață și pachete." },
    ],
    relatedCalculatorKeys: ["room-area", "tile-coverage", "paint-coverage"],
    relatedArticleSlugs: ["cum-calculezi-necesarul-de-gresie-si-faianta"],
  },
  "food-cost": {
    shortDescription: "Calculează food cost-ul și profitul brut pe porție pentru meniuri, cafenele și alte operațiuni horeca.",
    intro: "Calculatorul de food cost este util când vrei să vezi rapid dacă prețul de vânzare lasă suficient spațiu pentru profit și pentru restul costurilor operaționale.",
    interpretationNotes: "Food cost-ul este doar un reper. Pentru decizii bune trebuie completat cu personal, chirie, livrare, ambalaje și alte costuri indirecte.",
    isFeatured: true,
    sortOrder: 210,
    example: "La ingrediente de 12.5 lei și preț de vânzare 35 lei, food cost-ul este de aproximativ 35.71%, iar profitul brut 22.5 lei.",
    faq: [
      { question: "Un food cost mic înseamnă automat produs bun?", answer: "Nu. Trebuie echilibrat cu volum, percepția clientului și costurile totale ale operației." },
      { question: "Pot folosi calculatorul și pentru băuturi?", answer: "Da, formula este aceeași dacă introduci costul direct și prețul de vânzare." },
    ],
    relatedCalculatorKeys: ["profit-margin", "markup", "break-even"],
    relatedArticleSlugs: ["food-cost-explicat-pentru-horeca"],
  },
  "profit-margin": {
    shortDescription: "Calculează marja de profit și profitul brut pornind de la cost și prețul de vânzare.",
    intro: "Calculatorul de marja profit te ajută să vezi ce procent din prețul final rămâne după costul direct și este util pentru pricing și comparații rapide.",
    interpretationNotes: "Marja este utilă ca indicator de decizie, dar nu trebuie confundată cu markup-ul, care raportează profitul la cost, nu la prețul final.",
    isFeatured: true,
    sortOrder: 220,
    example: "La cost 70 lei și preț de vânzare 100 lei, profitul brut este 30 lei, iar marja 30%.",
    faq: [
      { question: "Care este diferența dintre marja și markup?", answer: "Marja raportează profitul la prețul de vânzare, iar markup-ul îl raportează la cost." },
      { question: "De ce contează marja în business?", answer: "Pentru ca ajută la pricing, comparații între produse și la evaluarea sustenabilității comerciale." },
    ],
    relatedCalculatorKeys: ["markup", "break-even", "roi"],
    relatedArticleSlugs: ["marja-vs-markup-explicate-simplu"],
  },
  markup: {
    shortDescription: "Calculează markup-ul comercial pentru a vedea cu cât ai crescut costul de baza până la prețul de vânzare.",
    intro: "Calculatorul de markup este util când lucrezi direct cu procente aplicate peste cost și vrei să compari rapid politica de preț între produse sau scenarii.",
    interpretationNotes: "Markup-ul nu spune direct cât la sută din preț reprezintă profit. Pentru asta trebuie să te uiți și la marja.",
    isFeatured: false,
    sortOrder: 230,
    example: "La cost 70 lei și preț 100 lei, profitul brut este 30 lei, iar markup-ul este aproximativ 42.86%.",
    faq: [
      { question: "Pot avea markup mare și marja mică?", answer: "Da, pentru că cele două procente se raportează la baze diferite." },
      { question: "Când este util markup-ul?", answer: "Când construiești prețul pornind de la cost și vrei o regulă simplă de pricing." },
    ],
    relatedCalculatorKeys: ["profit-margin", "food-cost", "break-even"],
    relatedArticleSlugs: ["marja-vs-markup-explicate-simplu"],
  },
  "break-even": {
    shortDescription: "Estimează câte unități trebuie să vinzi ca să acoperi costurile fixe și să atingi pragul de rentabilitate.",
    intro: "Calculatorul break-even este util pentru scenarii de pricing, planificare și evaluarea rapidă a volumului minim necesar pentru a nu rămâne pe pierdere.",
    interpretationNotes: "Pragul de rentabilitate depinde mult de costurile reale și de variația lor. Dacă prețul sau costul variabil se schimbă, recalcularea este obligatorie.",
    isFeatured: true,
    sortOrder: 240,
    example: "La 10.000 lei costuri fixe, 75 lei preț și 40 lei cost variabil, contribuția este 35 lei/unitate, iar pragul este de aproximativ 286 unități.",
    faq: [
      { question: "Ce se întâmplă dacă contribuția pe unitate este prea mică?", answer: "Pragul de rentabilitate urcă mult și modelul poate deveni dificil de susținut." },
      { question: "Calculatorul include taxe și reduceri?", answer: "Nu automat. Pentru scenarii reale, acestea trebuie integrate în costuri sau în prețul net folosit." },
    ],
    relatedCalculatorKeys: ["profit-margin", "markup", "roi"],
    relatedArticleSlugs: ["cum-calculezi-pragul-de-rentabilitate"],
  },
  roi: {
    shortDescription: "Calculează ROI-ul unei investiții pornind de la costul investiției și valoarea obținută.",
    intro: "Calculatorul ROI este util pentru a evalua rapid dacă o investiție merită comparativ cu alte opțiuni sau scenarii de alocare a bugetului.",
    interpretationNotes: "ROI-ul simplifică realitatea și nu surprinde întotdeauna timpul, riscul sau costul capitalului. Este bun ca reper comparativ, nu ca verdict unic.",
    isFeatured: true,
    sortOrder: 250,
    example: "La o investiție de 10.000 lei și o valoare obținută de 13.500 lei, profitul net este 3.500 lei, iar ROI-ul 35%.",
    faq: [
      { question: "ROI mare înseamnă automat investiție bună?", answer: "Nu. Contează și timpul în care obții rezultatul, riscul și alternativele disponibile." },
      { question: "Pot compară două proiecte doar prin ROI?", answer: "Este un punct de plecare bun, dar merită să compari și durata, cash flow-ul și incertitudinea." },
    ],
    relatedCalculatorKeys: ["break-even", "profit-margin", "markup"],
    relatedArticleSlugs: ["cum-evaluezi-un-roi-fara-sa-fortezi-cifrele"],
  },
  "salary-increase": {
    shortDescription: "Compară salariul actual cu cel țintă și vezi diferența în lei și în procente.",
    intro: "Calculatorul de creștere salarială te ajută să compari rapid oferta actuală cu salariul țintă și să vezi clar diferențele importante.",
    interpretationNotes: "Rezultatul este util pentru orientare, dar o ofertă salarială merită citită împreună cu beneficiile, bonusurile și programul de lucru.",
    isFeatured: true,
    sortOrder: 10,
    audience: "both",
    releaseBatch: "batch-05",
    example: "De la 5.000 lei la 6.200 lei înseamnă o creștere de 1.200 lei, adica aproximativ 24%.",
    faq: [
      { question: "Este mai util să compar lei sau procente?", answer: "Ideal este să le privești împreună. Suma absolută arată impactul direct, iar procentul te ajută să compari mai corect două scenarii." },
      { question: "Include bonusuri și beneficii?", answer: "Nu automat. Dacă vrei o comparație completă, adaugă separat bonusurile și beneficiile recurente." },
    ],
    relatedCalculatorKeys: ["hourly-rate", "annual-income", "effective-tax-rate"],
    relatedArticleSlugs: ["cum-calculezi-cresterea-salariala-corect"],
  },
  "hourly-rate": {
    shortDescription: "Transformă salariul lunar într-un tarif orar orientativ, util pentru comparații și planificare.",
    intro: "Calculatorul de tarif orar te ajută să vezi mai clar cât valorează o oră de lucru atunci când compari oferte, proiecte sau programe diferite.",
    interpretationNotes: "Tariful orar este orientativ. Dacă ai ture, bonusuri variabile sau ore suplimentare, merită să testezi mai multe scenarii.",
    isFeatured: true,
    sortOrder: 20,
    audience: "both",
    releaseBatch: "batch-05",
    example: "Un venit de 6.000 lei și 168 de ore lucrate înseamnă aproximativ 35,71 lei pe ora.",
    faq: [
      { question: "De ce contează tariful orar?", answer: "Te ajută să compari oferte, proiecte sau venituri lunare diferite prin același reper comun." },
      { question: "Ce ore folosesc în calcul?", answer: "Ideal folosești numărul real de ore lucrate în luna analizată, nu doar programul teoretic." },
    ],
    relatedCalculatorKeys: ["monthly-work-hours", "annual-income", "salary-increase"],
    relatedArticleSlugs: ["cum-transformi-salariul-lunar-in-tarif-orar"],
  },
  "monthly-work-hours": {
    shortDescription: "Estimează câte ore lucrezi într-o lună pe baza zilelor lucrătoare și a programului zilnic.",
    intro: "Calculatorul de ore lucrate pe luna este un reper bun când vrei să transformi venitul lunar în tarif orar sau să compari două programe diferite.",
    interpretationNotes: "Rezultatul este orientativ dacă apar ture, zile libere suplimentare sau ore suplimentare neincluse în scenariul standard.",
    isFeatured: false,
    sortOrder: 30,
    audience: "both",
    releaseBatch: "batch-05",
    example: "21 de zile lucrătoare și 8 ore pe zi înseamnă 168 de ore într-o lună obișnuită.",
    faq: [
      { question: "Pot folosi același număr de zile în fiecare luna?", answer: "Nu neapărat. Zilele lucrătoare variază și merită să refaci calculul pentru luna reală analizată." },
      { question: "Include ore suplimentare?", answer: "Doar dacă le adaugi explicit printr-un număr mai mare de ore sau zile." },
    ],
    relatedCalculatorKeys: ["hourly-rate", "annual-income"],
    relatedArticleSlugs: ["cate-ore-lucrezi-intr-o-luna-de-fapt"],
  },
  "annual-income": {
    shortDescription: "Pornește de la venitul lunar și estimează venitul anual, inclusiv bonusurile sau lunile suplimentare.",
    intro: "Calculatorul de venit anual te ajută să vezi imaginea mare atunci când planifici bugetul, compari oferte sau separi salariul de bonusuri.",
    interpretationNotes: "Este o estimare bună pentru planificare, dar rezultatul merită ajustat dacă veniturile variază semnificativ de la o lună la altă.",
    isFeatured: false,
    sortOrder: 40,
    audience: "both",
    releaseBatch: "batch-05",
    example: "La 6.000 lei pe luna, 12 luni și 5.000 lei bonusuri, venitul anual este 77.000 lei.",
    faq: [
      { question: "Include bonusuri și prime?", answer: "Da, dacă le introduci separat în câmpul dedicat bonusurilor anuale." },
      { question: "Este util și pentru compararea ofertelor?", answer: "Da. Venitul anual te ajută să compari oferte cu bonusuri, prime sau luni suplimentare de plata." },
    ],
    relatedCalculatorKeys: ["salary-increase", "hourly-rate", "effective-tax-rate"],
    relatedArticleSlugs: ["cum-estimezi-venitul-anual-fara-sa-amesteci-bonusurile-cu-salariul"],
  },
  "effective-tax-rate": {
    shortDescription: "Compară brutul cu netul și arată diferența absolută și rata efectivă de taxare.",
    intro: "Calculatorul de taxare efectivă te ajută să transformi diferența dintre brut și net într-un reper ușor de citit atunci când compari venituri sau oferte.",
    interpretationNotes: "Rata efectivă este un indicator orientativ. Ea nu explică automat structura exactă a contribuțiilor sau excepțiile fiscale aplicabile în fiecare caz.",
    isFeatured: true,
    sortOrder: 50,
    audience: "both",
    releaseBatch: "batch-05",
    example: "La 10.000 lei brut și 5.850 lei net, diferența este 4.150 lei, adica aproximativ 41,5%.",
    faq: [
      { question: "Pot deduce din asta structura exactă a taxelor?", answer: "Nu complet. Calculatorul arată diferența efectivă dintre brut și net, nu înlocuiește verificarea regulilor fiscale aplicabile." },
      { question: "De ce este utilă rata efectivă?", answer: "Pentru ca te ajută să compari rapid scenarii salariale sau să înțelegi mai clar cât din brut rămâne efectiv disponibil." },
    ],
    relatedCalculatorKeys: ["salary-increase", "annual-income", "hourly-rate"],
    relatedArticleSlugs: ["cum-citesti-diferenta-dintre-brut-net-si-taxare-efectiva"],
  },
  "credit-affordability": {
    shortDescription: "Estimează rata maximă suportabilă și suma finanțabilă pornind de la venit, grad de îndatorare, dobânda și perioada.",
    intro: "Calculatorul de rata maximă suportabilă este util când vrei să vezi rapid ce împrumut poți susține fără să forțezi bugetul lunar.",
    interpretationNotes: "Rezultatul este orientativ. Eligibilitatea reală depinde și de politica instituției, comisioane, scoring și alte angajamente financiare.",
    isFeatured: true,
    sortOrder: 10,
    audience: "both",
    releaseBatch: "batch-06",
    example: "La 8.500 lei venit, 40% grad de îndatorare, fără alte rate, 7,5% dobânda și 240 luni, rata maximă trece de 3.000 lei și suma finanțabilă intră bine în zona locuințelor medii.",
    faq: [
      { question: "Este aceeași cifra cu ce aprobă banca?", answer: "Nu. Calculatorul oferă un reper rapid, dar aprobarea reală depinde și de scoring, comisioane, venituri eligibile și reguli interne." },
      { question: "De ce contează gradul de îndatorare?", answer: "Pentru ca te ajută să păstrezi rata lunară într-o zonă suportabilă și comparabilă între scenarii." },
    ],
    relatedCalculatorKeys: ["debt-to-income", "loan-total-cost", "down-payment"],
    relatedArticleSlugs: ["cum-afli-ce-rata-iti-permiti-fara-sa-iti-blochezi-bugetul"],
  },
  "debt-to-income": {
    shortDescription: "Arată ce procent din venitul lunar este deja consumat de rate și plăți recurente.",
    intro: "Calculatorul de grad de îndatorare este unul dintre cele mai utile repere când vrei să vezi dacă bugetul tău suportă încă o rată sau are deja prea multe obligații recurente.",
    interpretationNotes: "Indicatorul este util doar dacă venitul și plățile lunare sunt comparabile între ele. Bonusurile neregulate sau cheltuielile ocazionale trebuie tratate separat.",
    isFeatured: false,
    sortOrder: 20,
    audience: "both",
    releaseBatch: "batch-06",
    example: "La 8.500 lei venit și 2.200 lei rate recurente, gradul de îndatorare trece puțin de 25%, iar bugetul rămas este încă relativ flexibil.",
    faq: [
      { question: "Include și cheltuielile uzuale ale casei?", answer: "Nu. Calculatorul compară în primul rând venitul cu plățile recurente de datorii, nu cu toate cheltuielile lunare." },
      { question: "Când devine util acest procent?", answer: "Când compari două scenarii de creditare, refinanțare sau buget și vrei un reper simplu și coerent." },
    ],
    relatedCalculatorKeys: ["credit-affordability", "loan-total-cost", "emergency-fund"],
    relatedArticleSlugs: ["cum-afli-ce-rata-iti-permiti-fara-sa-iti-blochezi-bugetul"],
  },
  "loan-total-cost": {
    shortDescription: "Calculează rata lunară, dobânda totală și costul total al unui credit, ca să compari corect perioada, dobânda și presiunea reală pe buget.",
    intro: "Calculatorul de cost total credit este una dintre cele mai importante pagini de decizie când vrei să vezi nu doar cât plătești lunar, ci cât te costa cu adevărat un împrumut pe toată perioada lui.",
    interpretationNotes: "Cifra devine utilă doar dacă pui alături măcar două scenarii: perioada scurtă vs lungă, dobânda actuală vs refinanțare, avans mai mic vs avans mai mare. Costul real poate crește suplimentar prin comisioane, asigurări și alte condiții contractuale.",
    isFeatured: true,
    sortOrder: 30,
    audience: "both",
    releaseBatch: "batch-06",
    example: "La 150.000 lei, 7,5% și 240 luni, rata lunară pare suportabilă, dar costul total ajunge mult peste principalul împrumutat.",
    examples: [
      {
        title: "Credit ipotecar pe termen lung",
        narrative:
          "La 250.000 lei, 7,2% și 360 luni, rata lunară poate părea rezonabilă la prima vedere, dar dobânda totală ajunge să cântărească aproape la fel de greu ca suma finanțată.",
      },
      {
        title: "Perioada mai scurtă, presiune lunară mai mare",
        narrative:
          "Același credit pe 180 luni ridică rata lunară, dar reduce agresiv costul total. Exact aici pagina te ajută să vezi dacă sacrificiul lunar merită pe termen lung.",
      },
      {
        title: "Credit de consum mai scurt, dar mai scump",
        narrative:
          "La o perioadă mică și o dobândă mare, costul total poate rămâne surprinzător de ridicat chiar dacă împrumutul pare ușor de absorbit ca suma.",
      },
    ],
    faq: [
      { question: "De ce nu este suficientă doar rata lunară?", answer: "Pentru ca o rată mai mică poate ascunde un cost total mult mai mare atunci când perioada este foarte lungă și dobânda lucrează mulți ani." },
      { question: "Calculatorul include toate costurile băncii?", answer: "Nu automat. El pornește de la dobânda și perioada, iar costurile suplimentare precum comisioane sau asigurări trebuie adăugate separat în analiza finală." },
      { question: "Când este util să compar două perioade diferite?", answer: "Exact atunci când vrei să vezi dacă economia din rata lunară compensează creșterea costului total pe termen lung." },
      { question: "Cu ce alte pagini merită legat?", answer: "Cu rata maximă suportabilă, refinanțarea și avansul, ca să nu citești creditul izolat de restul bugetului." },
    ],
    relatedCalculatorKeys: ["credit-affordability", "refinance-savings", "down-payment"],
    relatedArticleSlugs: ["cum-citesti-costul-total-al-unui-credit"],
    seo: {
      metaTitle: "Calculator cost total credit și rata lunară",
      metaDescription:
        "Calculează rata lunară, dobânda totală și costul total al unui credit. Compară perioada, dobânda și impactul real asupra bugetului.",
    },
    extraBlocks: [
      {
        blockType: "facts",
        eyebrow: "Răspuns rapid",
        title: "Ce vrei de fapt să afli aici",
        intro:
          "Pagina este utilă când vrei să vezi repede dacă un credit este doar suportabil lunar sau și sănătos ca preț total.",
        tone: "mist",
        items: [
          {
            value: "Rata lunară",
            label: "presiunea imediată pe buget",
            detail:
              "Bună pentru orientare rapidă, dar insuficiența singură.",
          },
          {
            value: "Dobânda totală",
            label: "prețul banilor împrumutați",
            detail:
              "Te ajută să vezi cât plătești în plus peste principal.",
          },
          {
            value: "Cost total",
            label: "cifra care închide comparația",
            detail:
              "Aici se vede cu adevărat diferența dintre scenarii.",
          },
        ],
      },
      {
        blockType: "story",
        eyebrow: "Cum citești bine rezultatul",
        title: "O rata suportabilă nu înseamnă automat un credit bun",
        body:
          "Dacă perioada este foarte lungă, costul total poate crește mult mai repede decât pare din rata lunară. Citește pagina ca instrument de comparație între scenarii, nu doar ca răspuns punctual la întrebarea cât îți iese pe luna.",
        tone: "sand",
      },
    ],
  },
  "refinance-savings": {
    shortDescription: "Compară rata veche cu rata noua și estimează economia netă după costul refinanțării.",
    intro: "Calculatorul de refinanțare este util când vrei să vezi dacă scăderea ratei lunare compensează cu adevărat costul mutării creditului într-un produs nou.",
    interpretationNotes: "O refinanțare pare atractivă la nivel de rata lunară, dar merită judecata și prin costul total rămas, comisioane și orizontul în care recuperezi costul inițial.",
    isFeatured: true,
    sortOrder: 40,
    audience: "both",
    releaseBatch: "batch-06",
    example: "Dacă noua rata scade cu 370 lei pe luna, dar refinanțarea costa 3.500 lei, recuperezi costul în cateva luni și apoi economia devine net pozitivă.",
    faq: [
      { question: "Rata mai mică înseamnă automat refinanțare bună?", answer: "Nu. Merită să verifici și costul total rămas, comisioanele și câte luni mai ai de plata." },
      { question: "Când e util pragul de recuperare?", answer: "Când vrei să vezi în câte luni acoperi costul refinanțării doar din diferența dintre cele două rate." },
    ],
    relatedCalculatorKeys: ["loan-total-cost", "credit-affordability", "debt-to-income"],
    relatedArticleSlugs: ["cand-merita-refinantarea-si-cand-doar-pare-o-idee-buna"],
  },
  "emergency-fund": {
    shortDescription: "Estimează suma-țintă pentru fondul de urgență pornind de la cheltuielile lunare și numărul de luni de acoperire dorit.",
    intro: "Calculatorul de fond de urgență este util când vrei să transformi o regulă generală într-o sumă clară și ușor de urmărit în timp.",
    interpretationNotes: "Fondul de urgență nu este același lucru cu economiile pentru obiective sau cu investițiile. El trebuie gândit în primul rând pentru lichiditate și stabilitate.",
    isFeatured: true,
    sortOrder: 50,
    audience: "both",
    releaseBatch: "batch-06",
    example: "La 4.200 lei cheltuieli esențiale și 6 luni de acoperire, țintă fondului de urgență ajunge la 25.200 lei.",
    faq: [
      { question: "De ce folosesc cheltuieli esențiale, nu toate cheltuielile?", answer: "Pentru ca fondul de urgență este gândit în primul rând să acopere funcționarea minimă a bugetului în perioade dificile." },
      { question: "Unde ar trebui ținut fondul?", answer: "De obicei într-o formă foarte lichidă și ușor accesibilă, nu într-un produs care blochează banii pe termen lung." },
    ],
    relatedCalculatorKeys: ["goal-timeline", "savings-interest", "debt-to-income"],
    relatedArticleSlugs: ["cum-iti-construiesti-fondul-de-urgenta-fara-sa-ramai-fara-lichiditati"],
  },
  "savings-interest": {
    shortDescription: "Estimează evoluția economiilor din suma inițială, contribuții lunare și dobânda.",
    intro: "Calculatorul de dobânda economii te ajută să vezi cum se schimbă o strategie simplă de economisire atunci când adaugi capitalizare și timp.",
    interpretationNotes: "Rezultatul este orientativ. În practică, randamentul poate varia, iar fiscalitatea sau comisioanele produsului folosit pot schimba valoarea finală.",
    isFeatured: false,
    sortOrder: 60,
    audience: "both",
    releaseBatch: "batch-06",
    example: "O suma inițială de 10.000 lei, plus 750 lei pe luna și 4,5% pe an, produce o diferență semnificativă față de simplă adunare liniară după câțiva ani.",
    faq: [
      { question: "De ce contează așa mult timpul?", answer: "Pentru ca dobânda acumulată începe să lucreze la rândul ei, iar efectul devine vizibil mai ales pe perioade mai lungi." },
      { question: "Este același lucru cu investițiile?", answer: "Nu neapărat. Formula poate fi folosită orientativ și pentru alte scenarii, dar randamentul real și riscul pot fi foarte diferite." },
    ],
    relatedCalculatorKeys: ["goal-timeline", "retirement-savings", "emergency-fund"],
    relatedArticleSlugs: ["cum-planifici-economii-pe-termen-lung-pentru-obiective-mari"],
  },
  "retirement-savings": {
    shortDescription: "Proiectează acumularea unei contribuții lunare pe termen lung pentru obiective de pensie și independența financiară.",
    intro: "Calculatorul de economii pentru pensie este util când vrei să vezi ce poate produce consistență pe termen lung, nu doar randamentul teoretic.",
    interpretationNotes: "Orice proiecție pe zeci de ani este sensibilă la randament, inflație și disciplină de contribuție. Rezultatul merită citit ca scenariu, nu ca promisiune.",
    isFeatured: false,
    sortOrder: 70,
    audience: "consumer",
    releaseBatch: "batch-06",
    example: "1.000 lei pe luna timp de 25 de ani, la un randament moderat, poate construi un capital surprinzător de mare față de intuiția inițială.",
    faq: [
      { question: "De ce este util să văd și totalul depus?", answer: "Pentru ca te ajută să separi clar ce vine din disciplină ta și ce vine din randamentul estimat." },
      { question: "Pot folosi calculatorul și pentru alte obiective lungi?", answer: "Da. Formula este utilă și pentru alte obiective pe termen lung, atâta timp cât înțelegi limitările scenariului." },
    ],
    relatedCalculatorKeys: ["savings-interest", "goal-timeline", "emergency-fund"],
    relatedArticleSlugs: ["cum-planifici-economii-pe-termen-lung-pentru-obiective-mari"],
  },
  "goal-timeline": {
    shortDescription: "Estimează în câte luni sau ani poți ajunge la un obiectiv financiar pornind de la ritmul actual de economisire.",
    intro: "Calculatorul de termen obiectiv economisire este util când ai o țintă clară și vrei să vezi cât de realist este calendarul pe care ti-l propui.",
    interpretationNotes: "Rezultatul depinde puternic de constantă contribuțiilor și de randamentul presupus. Dacă una dintre ele variază mult, termenul real se muta.",
    isFeatured: false,
    sortOrder: 80,
    audience: "both",
    releaseBatch: "batch-06",
    example: "La o țintă de 100.000 lei, 10.000 lei deja puși deoparte și 1.200 lei economisiți lunar, termenul scade vizibil când adaugi și o dobândă moderată.",
    faq: [
      { question: "Este mai bun decât calculatorul de economii?", answer: "Depinde de punctul de plecare. Aici pleci de la țintă finală și vrei să afli timpul, nu suma pe care o vei strange." },
      { question: "De ce folosește simulare iterativă?", answer: "Pentru ca termenul depinde de acumulare progresivă, nu doar de o operație simplă într-un singur pas." },
    ],
    relatedCalculatorKeys: ["savings-interest", "emergency-fund", "down-payment"],
    relatedArticleSlugs: ["cum-planifici-economii-pe-termen-lung-pentru-obiective-mari"],
  },
  "lease-vs-loan": {
    shortDescription: "Compară costul total dintre două scenarii de finanțare: leasing și credit.",
    intro: "Calculatorul de leasing vs credit este util când vrei să pui cele două scenarii pe aceeași masă și să vezi rapid care este mai ieftin în forma lui cea mai simplă.",
    interpretationNotes: "Comparația este orientativă. Fiscalitatea, asigurările, valoarea reziduală, comisioanele și deducerile pot schimba semnificativ rezultatul final.",
    isFeatured: false,
    sortOrder: 90,
    audience: "both",
    releaseBatch: "batch-06",
    example: "Două scenarii care par apropiate la rata lunară pot avea cost total foarte diferit după ce adaugi avansul și valoarea finală.",
    faq: [
      { question: "Este suficient costul total ca să aleg între ele?", answer: "Nu mereu. Flexibilitatea, tratamentul fiscal, proprietatea finală și nevoia operațională contează la fel de mult." },
      { question: "Pot folosi calculatorul și pentru mașini, și pentru echipamente?", answer: "Da, dacă lucrezi cu aceeași logica de avans, rate lunare și cost final comparabil." },
    ],
    relatedCalculatorKeys: ["loan-total-cost", "down-payment", "credit-affordability"],
    relatedArticleSlugs: ["leasing-vs-credit-cum-compari-corect-doua-scenarii-de-finantare"],
  },
  "down-payment": {
    shortDescription: "Transformă procentul de avans într-o sumă concretă și arată cât mai rămâne de finanțat.",
    intro: "Calculatorul de avans este util când vrei să vezi imediat ce înseamnă în bani un procent cerut pentru o locuință, mașină sau altă achiziție finanțată.",
    interpretationNotes: "Un procent mic de avans poate face finanțarea mai ușor accesibilă pe termen scurt, dar poate crește presiunea pe rata lunară și pe costul total.",
    isFeatured: true,
    sortOrder: 100,
    audience: "both",
    releaseBatch: "batch-06",
    example: "La 450.000 lei și 15% avans, suma inițială trece de 67.000 lei, iar restul rămâne pentru finanțare.",
    faq: [
      { question: "Avansul mai mare înseamnă automat alegere mai bună?", answer: "Nu automat, dar de multe ori reduce suma finanțată și poate îmbunătăți condițiile generale ale creditului." },
      { question: "Cum îl folosesc împreună cu alte calculatoare?", answer: "Cel mai util este să îl legi de rata maximă suportabilă și de costul total al creditului pentru același scenariu." },
    ],
    relatedCalculatorKeys: ["credit-affordability", "loan-total-cost", "goal-timeline"],
    relatedArticleSlugs: ["cum-afli-ce-rata-iti-permiti-fara-sa-iti-blochezi-bugetul"],
  },
  roas: {
    shortDescription: "Măsoară de câte ori recuperezi bugetul ads prin venitul atribuit campaniilor.",
    intro: "Calculatorul ROAS este un punct de plecare excelent când vrei să vezi repede dacă o campanie aduce suficient venit raportat la bugetul investit.",
    interpretationNotes: "ROAS-ul nu este același lucru cu profitul. Fără context de marja, taxe, retururi sau costuri operaționale, cifra poate arata mai bine decât realitatea.",
    isFeatured: true,
    sortOrder: 10,
    audience: "business",
    releaseBatch: "batch-07",
    example: "La 12.000 lei buget ads și 54.000 lei venit atribuit, ROAS-ul este 4,5, adica fiecare leu investit aduce 4,5 lei venit.",
    faq: [
      { question: "Un ROAS mare înseamnă automat campanie bună?", answer: "Nu. Trebuie comparat cu marja, cu costurile de fulfillment și cu obiectivul de profit." },
      { question: "Pot compară două campanii cu ROAS diferit?", answer: "Da, dar ideal pe aceeași perioada și cu aceeași logica de atribuire." },
    ],
    relatedCalculatorKeys: ["break-even-roas", "cac", "target-revenue"],
    relatedArticleSlugs: ["cum-citesti-roas-fara-sa-confunzi-venitul-cu-profitul"],
  },
  "break-even-roas": {
    shortDescription: "Arată ROAS-ul minim de la care campania nu mai pierde bani la marja curentă.",
    intro: "Calculatorul de break-even ROAS este util când vrei să transformi marja brută într-un prag concret pentru advertising, nu doar într-o intuiție vagă.",
    interpretationNotes: "Dacă marja folosită nu include toate costurile relevante, break-even ROAS-ul va părea mai confortabil decât este în realitate.",
    isFeatured: true,
    sortOrder: 20,
    audience: "business",
    releaseBatch: "batch-07",
    example: "La o marjă disponibilă de 35%, break-even ROAS-ul este aproximativ 2,86. Sub pragul asta, campania intră ușor pe pierdere.",
    faq: [
      { question: "Se aplică și la lead generation?", answer: "Da, dacă poți transforma lead-ul în venit sau valoare economică comparabilă." },
      { question: "Este suficient pentru decizii de scalare?", answer: "Nu singur. Merită legat de ROAS real, CAC și viteza de conversie." },
    ],
    relatedCalculatorKeys: ["roas", "gross-profit", "target-revenue"],
    relatedArticleSlugs: ["break-even-roas-explicat-pentru-campanii-platite"],
  },
  aov: {
    shortDescription: "Calculează valoarea medie a comenzii și te ajută să citești mai bine performanța comercială.",
    intro: "Calculatorul AOV este util când vrei să vezi dacă creșterea veniturilor vine din mai multe comenzi sau din comenzi mai valoroase.",
    interpretationNotes: "AOV-ul este mai valoros când este citit împreună cu rata de conversie și cu marja, nu separat.",
    isFeatured: false,
    sortOrder: 30,
    audience: "business",
    releaseBatch: "batch-07",
    example: "La 180.000 lei venit și 1.200 comenzi, valoarea medie a comenzii este 150 lei.",
    faq: [
      { question: "AOV mai mare înseamnă mereu progres?", answer: "Nu neapărat. Poate veni și din scumpiri, nu doar din mix mai bun sau upsell." },
      { question: "Cu ce îl leg prima data?", answer: "Cu rata de conversie și cu marja produselor vândute." },
    ],
    relatedCalculatorKeys: ["conversion-rate", "gross-profit", "roas"],
    relatedArticleSlugs: ["aov-si-rata-de-conversie-ce-spun-impreuna-despre-funnel"],
  },
  "conversion-rate": {
    shortDescription: "Arată ce procent din trafic se transformă în comenzi, lead-uri sau altă acțiune relevantă.",
    intro: "Calculatorul de rata de conversie este util când vrei să vezi dacă problema este în trafic, în oferta sau în pașii finali ai funnel-ului.",
    interpretationNotes: "O rata de conversie bună depinde de canal, de intenție și de tipul conversiei. De aceea merită comparată în contexte similare.",
    isFeatured: false,
    sortOrder: 40,
    audience: "business",
    releaseBatch: "batch-07",
    example: "La 25.000 vizitatori și 650 conversii, rata de conversie este 2,6%.",
    faq: [
      { question: "Pot folosi sesiuni în loc de utilizatori?", answer: "Da, dacă rămâi consecvent în aceeași metoda de raportare." },
      { question: "De ce contează AOV împreună cu conversia?", answer: "Pentru ca una îți spune cât de des vinzi, iar cealaltă cât valorează fiecare vânzare." },
    ],
    relatedCalculatorKeys: ["aov", "cpl", "cac"],
    relatedArticleSlugs: ["aov-si-rata-de-conversie-ce-spun-impreuna-despre-funnel"],
  },
  cpl: {
    shortDescription: "Calculează costul per lead și te ajută să compari canale sau campanii de generare lead-uri.",
    intro: "Calculatorul CPL este bun când vrei să vezi rapid cât te costa să alimentezi pipeline-ul, chiar înainte să transformi lead-urile în clienți.",
    interpretationNotes: "CPL-ul are sens doar dacă lead-ul are definiție stabilă. Dacă schimbi criteriile de calificare, comparația se strica.",
    isFeatured: false,
    sortOrder: 50,
    audience: "business",
    releaseBatch: "batch-07",
    example: "La 8.500 lei cost total și 210 lead-uri, CPL-ul este puțin peste 40 lei.",
    faq: [
      { question: "Un CPL mic este automat bun?", answer: "Nu. Lead-ul ieftin dar slab calificat poate costa mai mult în vânzări și follow-up." },
      { question: "Când îl leg de CAC?", answer: "Când vrei să vezi cât din costul de achiziție se pierde între lead și client nou." },
    ],
    relatedCalculatorKeys: ["cac", "conversion-rate", "roas"],
    relatedArticleSlugs: ["cum-calculezi-cac-si-cpl-fara-sa-amesteci-canalele"],
  },
  cac: {
    shortDescription: "Calculează costul real de achiziție al unui client nou într-o perioadă data.",
    intro: "Calculatorul CAC este util când vrei să vezi cât te costa creșterea și dacă modelul comercial are loc suficient pentru profit și scalare.",
    interpretationNotes: "CAC-ul trebuie comparat cu marja și cu valoarea clientului în timp. Fără acest context, cifra singură poate induce decizii greșite.",
    isFeatured: true,
    sortOrder: 60,
    audience: "business",
    releaseBatch: "batch-07",
    example: "La 42.000 lei cost total și 140 clienți noi, CAC-ul este 300 lei per client.",
    faq: [
      { question: "Includ și costurile echipei de vânzări?", answer: "Ideal da, dacă vrei un CAC mai aproape de realitate." },
      { question: "Cu ce îl compar prima data?", answer: "Cu AOV, marja și timpul în care clientul rămâne activ." },
    ],
    relatedCalculatorKeys: ["cpl", "roas", "target-revenue"],
    relatedArticleSlugs: ["cum-calculezi-cac-si-cpl-fara-sa-amesteci-canalele"],
  },
  "target-revenue": {
    shortDescription: "Transformă costurile și profitul țintă într-un venit minim clar pentru perioada următoare.",
    intro: "Calculatorul de venit țintă este util când vrei să treci de la obiectiv vag la cifra concretă de vânzări, folosind marja reală a businessului.",
    interpretationNotes: "Dacă marja folosită este prea optimistă, venitul țintă va ieși artificial mai mic și poate duce la planuri greu de susținut.",
    isFeatured: true,
    sortOrder: 70,
    audience: "business",
    releaseBatch: "batch-07",
    example: "Cu 60.000 lei costuri fixe, 30.000 lei profit țintă și 40% marja, venitul minim necesar ajunge la 225.000 lei.",
    faq: [
      { question: "Pot folosi marja netă în loc de marja brută?", answer: "Doar dacă ești consecvent și înțelegi exact ce costuri ai inclus deja în baza de calcul." },
      { question: "Cu ce îl leg în pagina?", answer: "Cu profit brut, profit net și ROAS, pentru că toate contribuie la realismul planului." },
    ],
    relatedCalculatorKeys: ["gross-profit", "net-profit", "roas"],
    relatedArticleSlugs: ["cum-estimezi-targetul-de-venit-si-profitul-real"],
  },
  "gross-profit": {
    shortDescription: "Arată ce rămâne după costurile directe și te ajută să vezi dacă modelul merită susținut.",
    intro: "Calculatorul de profit brut este util când vrei să verifici rapid dacă prețul, costul și volumul se întâlnesc într-o marjă care poate susține businessul.",
    interpretationNotes: "Profitul brut nu include toate costurile. El este primul filtru bun, dar nu verdictul final despre rentabilitate.",
    isFeatured: false,
    sortOrder: 80,
    audience: "business",
    releaseBatch: "batch-07",
    example: "La 150.000 lei venit și 90.000 lei costuri directe, profitul brut este 60.000 lei, iar marja brută ajunge la 40%.",
    faq: [
      { question: "De ce mai am nevoie și de profit net?", answer: "Pentru ca profitul brut nu include chirii, salarii, software sau alte costuri indirecte." },
      { question: "Cu ce îl leg pentru marketing?", answer: "Cu break-even ROAS și venit țintă." },
    ],
    relatedCalculatorKeys: ["net-profit", "break-even-roas", "target-revenue"],
    relatedArticleSlugs: ["cum-estimezi-targetul-de-venit-si-profitul-real"],
  },
  "net-profit": {
    shortDescription: "Calculează ce rămâne după toate costurile incluse în scenariu și oferă o marjă netă orientativă.",
    intro: "Calculatorul de profit net este util când vrei să treci de la performanța comercială brută la o imagine mai apropiată de realitatea businessului.",
    interpretationNotes: "Rezultatul depinde complet de ce costuri incluzi. El este orientativ, nu înlocuiește contabilitatea sau raportarea financiară completă.",
    isFeatured: false,
    sortOrder: 90,
    audience: "business",
    releaseBatch: "batch-07",
    example: "La 150.000 lei venit și 118.000 lei cost total, profitul net ajunge la 32.000 lei, cu o marjă netă de circa 21%.",
    faq: [
      { question: "E același lucru cu profitul contabil?", answer: "Nu neapărat. Calculatorul este orientativ și depinde de structura costurilor pe care o introduci." },
      { question: "Când devine util în decizie?", answer: "Când compari scenarii și vrei să vezi ce rămâne cu adevărat după toate costurile incluse." },
    ],
    relatedCalculatorKeys: ["gross-profit", "target-revenue", "roi"],
    relatedArticleSlugs: ["cum-estimezi-targetul-de-venit-si-profitul-real"],
  },
  "inventory-turnover": {
    shortDescription: "Arată de câte ori se rotește stocul și câte zile rămâne marfă blocată în medie.",
    intro: "Calculatorul de rotație stoc este util pentru ecommerce, retail sau distribuție când vrei să vezi dacă stocul lucrează sau doar consumă capital.",
    interpretationNotes: "Rotația trebuie interpretată pe categorie și pe sezon. Un prag bun pentru un produs poate fi prea lent sau prea agresiv pentru altul.",
    isFeatured: false,
    sortOrder: 100,
    audience: "business",
    releaseBatch: "batch-07",
    example: "La 420.000 lei cost marfă vândută și 70.000 lei stoc mediu, rotația este 6 ori în perioada analizată.",
    faq: [
      { question: "Rotație mare înseamnă automat situație bună?", answer: "Nu mereu. Poate însemna și stoc insuficient, rupturi de disponibilitate sau presiune pe supply." },
      { question: "Cu ce alt calculator îl combin?", answer: "Cu venit țintă și profit, mai ales dacă lucrezi cu capital blocat în marfă." },
    ],
    relatedCalculatorKeys: ["target-revenue", "gross-profit", "net-profit"],
    relatedArticleSlugs: ["rotatia-stocului-explicata-pentru-ecommerce-si-retail"],
  },
  "appliance-electricity-cost": {
    shortDescription: "Estimează rapid consumul și costul unui aparat electric pe luna și pe an.",
    intro: "Calculatorul de consum al unui aparat electric este cel mai bun punct de plecare când vrei să legi puterea unui dispozitiv de impactul lui real în factura.",
    interpretationNotes: "Rezultatul depinde de puterea reală în funcționare și de timpul efectiv de utilizare. Mulți consumatori confundă puterea maximă cu consumul constant.",
    isFeatured: true,
    sortOrder: 10,
    audience: "consumer",
    releaseBatch: "batch-08",
    example: "Un aparat de 1.800 W folosit 2 ore pe zi ajunge ușor la peste 100 kWh pe luna și îți arată imediat ce înseamnă asta în bani.",
    faq: [
      { question: "Pot folosi calculatorul pentru orice aparat?", answer: "Da, atât timp cât ai o putere estimată și un timp realist de funcționare." },
      { question: "De ce diferă uneori față de factura reală?", answer: "Pentru ca unele aparate nu consumă constant la puterea nominală, iar tariful poate include și alte componente." },
    ],
    relatedCalculatorKeys: ["monthly-electricity-bill", "solar-system-size", "solar-payback"],
    relatedArticleSlugs: ["cum-estimezi-consumul-real-al-electrocasnicelor-din-casa"],
  },
  "monthly-electricity-bill": {
    shortDescription: "Transformă consumul lunar total într-o factură estimată și într-un cost anual ușor de comparat, ca să vezi repede ce muta cu adevărat bugetul casei.",
    intro: "Calculatorul de factura de curent este unul dintre cele mai utile calculatoare din energia pentru casă, pentru că leagă direct consumul real de bani, de obiceiuri și de decizii despre eficiență sau fotovoltaice.",
    interpretationNotes: "Prețul final pe kWh și costurile fixe pot varia între furnizori, contracte și perioade. Folosește-l ca reper comparativ, nu ca factura exactă, iar pentru decizii importante testează și un scenariu prudent, și unul optimist.",
    isFeatured: true,
    sortOrder: 20,
    audience: "consumer",
    releaseBatch: "batch-08",
    example: "La 280 kWh pe luna și 0,95 lei/kWh, factura sare de 270 lei chiar înainte să discuți de economii sau panouri.",
    examples: [
      {
        title: "Garsonieră cu consum moderat",
        narrative:
          "La aproximativ 160 kWh pe luna și un tarif all-în realist, factura rămâne gestionabilă, dar devine un reper bun pentru orice comparație cu scenarii de economie.",
      },
      {
        title: "Apartament cu mai multe aparate",
        narrative:
          "Când consumul urcă spre 320-360 kWh pe luna, diferențele mici de preț pe kWh se transformă rapid în zeci de lei pe luna și sute pe an.",
      },
      {
        title: "Casa cu climatizare vara",
        narrative:
          "Într-un sezon cu aer condiționat, consumul sare ușor peste baza obișnuită. Exact aici merită să compari factura curentă cu amortizarea unor upgrade-uri energetice.",
      },
    ],
    faq: [
      { question: "Include și toate taxele de pe factura?", answer: "Depinde de prețul pe kWh introdus. Dacă el este all-în, estimarea devine mai apropiată de realitate." },
      { question: "Ce schimbă factura cel mai mult?", answer: "De obicei combinația dintre consumul lunar real, tariful complet pe kWh și aparatele care rulează multe ore pe luna." },
      { question: "Merită să compar mai multe scenarii?", answer: "Da. Diferența dintre 250 și 350 kWh pe luna spune mult mai mult despre presiunea pe buget decât o cifră singulară văzută o singură data." },
      { question: "Cu ce îl leg mai departe?", answer: "Cu calculatoarele de panouri, producție și amortizare, dacă vrei să vezi dacă merită investiția." },
    ],
    relatedCalculatorKeys: ["appliance-electricity-cost", "solar-system-size", "solar-payback"],
    relatedArticleSlugs: ["cum-citesti-factura-de-curent-fara-sa-te-pierzi-in-detalii-inutile"],
    seo: {
      metaTitle: "Calculator factura curent online",
      metaDescription:
        "Estimează factura de curent din consumul lunar, prețul pe kWh și costurile fixe. Compară scenarii și vezi costul anual.",
    },
    extraBlocks: [
      {
        blockType: "facts",
        eyebrow: "Ce muta factura",
        title: "Cele trei variabile care contează cel mai mult",
        intro:
          "Îți da răspunsul rapid, dar devine și mai util când separi clar consumul, tariful și costurile fixe.",
        tone: "mist",
        items: [
          {
            value: "Consum lunar",
            label: "kWh folosiți în casa",
            detail:
              "Aici se vede cel mai repede dacă problema este comportamentul sau echipamentul.",
          },
          {
            value: "Preț pe kWh",
            label: "tarif complet din contract",
            detail:
              "Un tarif all-în ajută mult la o estimare mai apropiată de realitate.",
          },
          {
            value: "Costuri fixe",
            label: "partea care rămâne chiar și când consumul scade",
            detail:
              "Util pentru comparații între furnizori și între luni.",
          },
        ],
      },
      {
        blockType: "story",
        eyebrow: "Ce să nu ratezi",
        title: "Factura bună de citit nu este doar cea mai mică, ci cea pe care o poți explica",
        body:
          "Dacă nu știi ce aparat sau obicei muta consumul, cifra finală rămâne greu de optimizat. Pagina te ajută să transformi factura din surpriza lunară într-un reper pe care îl poți compara și controla.",
        tone: "sand",
      },
    ],
  },
  "solar-system-size": {
    shortDescription: "Estimează puterea sistemului fotovoltaic necesar pornind de la consumul anual și nivelul de acoperire dorit.",
    intro: "Calculatorul de necesar pentru sistem fotovoltaic este util când vrei să transformi consumul anual într-o dimensiune de sistem, fără să pornești din oferte vagi.",
    interpretationNotes: "Dimensiunea rezultată depinde mult de producția specifică folosită. Pentru o estimare mai bună merită validată ulterior cu PVGIS sau cu date locale.",
    isFeatured: true,
    sortOrder: 30,
    audience: "consumer",
    releaseBatch: "batch-08",
    example: "La 4.200 kWh pe an și 90% acoperire, sistemul necesar poate intra în zona de aproximativ 2,8-3,2 kWp, în funcție de ipoteze.",
    faq: [
      { question: "Trebuie să acopar 100% din consum?", answer: "Nu neapărat. Uneori scenariile de 70-90% sunt mai realiste și mai eficiente economic." },
      { question: "Cu ce îl leg imediat?", answer: "Cu producția fotovoltaică, numărul de panouri și amortizarea." },
    ],
    relatedCalculatorKeys: ["solar-production", "solar-panel-count", "solar-payback"],
    relatedArticleSlugs: ["cate-panouri-fotovoltaice-iti-trebuie-de-fapt"],
  },
  "solar-production": {
    shortDescription: "Estimează producția anuală și lunară medie a unui sistem fotovoltaic după puterea instalată.",
    intro: "Calculatorul de producție fotovoltaică este util când vrei să legi puterea sistemului de energia pe care o poți produce într-un an obișnuit.",
    interpretationNotes: "Producția reală variază cu orientarea, înclinarea, umbrirea, temperatura și calitatea instalării. Estimarea este utilă mai ales pentru comparații.",
    isFeatured: true,
    sortOrder: 40,
    audience: "consumer",
    releaseBatch: "batch-08",
    example: "Un sistem de 5,5 kWp poate produce peste 6.000 kWh/an într-un scenariu bun, dar merită să verifici ipoteza pentru zona ta.",
    faq: [
      { question: "Este producție garantată?", answer: "Nu. Este o estimare orientativă care trebuie citită ca interval și validată local." },
      { question: "Merită să folosesc și PVGIS?", answer: "Da, mai ales când vrei o estimare mai apropiată de locație și configurație." },
    ],
    relatedCalculatorKeys: ["solar-system-size", "solar-payback", "solar-battery-size"],
    relatedArticleSlugs: ["cum-estimezi-productia-fotovoltaica-fara-promisiuni-umflate"],
  },
  "solar-panel-count": {
    shortDescription: "Transformă puterea dorită a sistemului într-un număr estimat de panouri și suprafață ocupată.",
    intro: "Calculatorul de număr panouri este util când ai deja o țintă de sistem și vrei să vezi dacă acoperișul sau spațiul disponibil o poate susține.",
    interpretationNotes: "Suprafață reală necesară depinde de geometria acoperișului, distanțe de siguranță, umbre și tipul panourilor alese.",
    isFeatured: false,
    sortOrder: 50,
    audience: "consumer",
    releaseBatch: "batch-08",
    example: "Pentru un sistem de 6 kWp cu panouri de 450 W, ajungi rapid la aproximativ 14 panouri și peste 29 mp ocupați.",
    faq: [
      { question: "Pot folosi orice suprafață disponibilă?", answer: "Nu întotdeauna. Forma acoperișului și zonele umbrite pot reduce spațiul util." },
      { question: "Cu ce îl leg în pagina?", answer: "Cu necesarul sistemului și producția fotovoltaică, ca să vezi dacă spațiul are sens pentru obiectivul tău." },
    ],
    relatedCalculatorKeys: ["solar-system-size", "solar-production", "solar-payback"],
    relatedArticleSlugs: ["cate-panouri-fotovoltaice-iti-trebuie-de-fapt"],
  },
  "solar-payback": {
    shortDescription: "Arată în câți ani se poate amortiza un sistem fotovoltaic după cost, economii și mentenanță, ca să nu confunzi entuziasmul investiției cu randamentul ei real.",
    intro: "Calculatorul de amortizare pentru panouri fotovoltaice este unul dintre cele mai importante instrumente de decizie în energia pentru casă, pentru că transformă discuția despre panouri din promisiune vagă în scenariu economic clar.",
    interpretationNotes: "Amortizarea este foarte sensibilă la prețul energiei, autoconsum, granturi și costuri reale de exploatare. Nu o citi ca promisiune fixă și nu te opri la un singur scenariu optimist.",
    isFeatured: true,
    sortOrder: 60,
    audience: "consumer",
    releaseBatch: "batch-08",
    example: "O investiție netă de 32.000 lei cu economii anuale de 5.200 lei poate coborî amortizarea spre 6-7 ani într-un scenariu rezonabil.",
    examples: [
      {
        title: "Sistem cu grant sau subvenție",
        narrative:
          "Când costul net scade substantial printr-un program de sprijin, anii de amortizare se comprimă repede și scenariul devine mult mai ușor de justificat.",
      },
      {
        title: "Sistem fără baterie, cu autoconsum bun",
        narrative:
          "Dacă folosești direct o parte mare din producție, economiile anuale cresc și amortizarea devine mai solidă chiar fără acumulatori.",
      },
      {
        title: "Scenariu prudent vs scenariu optimist",
        narrative:
          "Diferența dintre un tarif conservator și unul optimist poate muta amortizarea cu ani buni. Tocmai de aceea merită să compari cel puțin două ipoteze.",
      },
    ],
    faq: [
      { question: "Dacă energia se scumpește, amortizarea se schimbă?", answer: "Da. În multe cazuri se poate scurta, dar merită să testezi și scenarii prudente, nu doar varianta cea mai convenabilă." },
      { question: "Este suficient să mă uit doar la ani?", answer: "Nu. Contează și cash-flow-ul, autonomia parțială, durata de viață a echipamentelor și stabilitatea costurilor în timp." },
      { question: "Merită să compar și fără grant?", answer: "Da. Diferența dintre cele două scenarii îți arată cât de robusta este investiția și fără ajutor extern." },
      { question: "Cu ce alte pagini trebuie legat?", answer: "Cu necesarul sistemului, producția fotovoltaică și factura curentă, altfel amortizarea rămâne rupta de realitatea casei tale." },
    ],
    relatedCalculatorKeys: ["solar-system-size", "solar-production", "monthly-electricity-bill"],
    relatedArticleSlugs: ["cum-citesti-amortizarea-unui-sistem-fotovoltaic"],
    seo: {
      metaTitle: "Calculator amortizare panouri fotovoltaice",
      metaDescription:
        "Află în câți ani se amortizeaza un sistem fotovoltaic din cost, grant, economii și mentenanță. Compară scenarii prudente și optimiste.",
    },
    extraBlocks: [
      {
        blockType: "facts",
        eyebrow: "Ce influențează amortizarea",
        title: "Trei variabile care schimbă cel mai mult rezultatul",
        intro:
          "Pagina este bună pentru un răspuns rapid, dar decizia devine mai bună când separi investiția netă de economiile reale și de scenariul de consum.",
        tone: "mist",
        items: [
          {
            value: "Investiție netă",
            label: "cost total minus grant",
            detail:
              "Aici se vede cât capital trebuie să recuperezi în timp.",
          },
          {
            value: "Economii anuale",
            label: "beneficiul financiar real",
            detail:
              "Merită gândit prudent, nu doar cu estimarea cea mai optimistă.",
          },
          {
            value: "Autoconsum",
            label: "cât folosești direct din producție",
            detail:
              "Poate schimbă mult economia netă anuală.",
          },
        ],
      },
      {
        blockType: "story",
        eyebrow: "Cum citești rezultatul",
        title: "Amortizarea bună este cea care rezistă și după ce tai optimismul",
        body:
          "Dacă investiția arată bine doar într-un scenariu foarte optimist de producție sau preț al energiei, concluzia este fragilă. Pagina merită folosită pentru comparații prudente, nu pentru confirmarea unui entuziasm deja format.",
        tone: "sand",
      },
    ],
  },
  "ac-btu": {
    shortDescription: "Estimează capacitatea BTU potrivită pentru camera ta, ca să nu alegi un aparat prea mic sau prea mare.",
    intro: "Calculatorul BTU pentru aer condiționat este util când vrei să pornești din camera reală, nu din regulă aproximativa pe care o auzi cel mai des.",
    interpretationNotes: "Rezultatul este orientativ. Insorirea, izolația, orientarea camerei și numărul de persoane pot schimba alegerea finală.",
    isFeatured: true,
    sortOrder: 70,
    audience: "consumer",
    releaseBatch: "batch-08",
    example: "O camera de 26 mp cu insorire mai puternica poate ieși rapid din zona unitatilor mici și cere un aparat mai apropiat de 12.000 BTU.",
    faq: [
      { question: "Ce risc dacă aleg prea puțin BTU?", answer: "Aparatul va merge mai mult, va raci mai greu și poate consuma ineficient." },
      { question: "Dar dacă aleg prea mult?", answer: "Poate cicla prea des, cu confort și eficiență mai slabe decât te aștepți." },
    ],
    relatedCalculatorKeys: ["appliance-electricity-cost", "heating-load", "heat-pump-size"],
    relatedArticleSlugs: ["cum-alegi-btu-ul-potrivit-pentru-aer-conditionat"],
  },
  "heating-load": {
    shortDescription: "Estimează necesarul de căldură al locuinței din volum, pierderi și diferența de temperatura.",
    intro: "Calculatorul de necesar termic este util când vrei să înțelegi mai bine ce putere de încălzire are sens pentru casă ta.",
    interpretationNotes: "Coeficientul de pierderi este simplificat. Pentru proiecte serioase, rezultatul trebuie validat cu o analiză termică mai exactă.",
    isFeatured: true,
    sortOrder: 80,
    audience: "consumer",
    releaseBatch: "batch-08",
    example: "La 120 mp, 2,6 m înălțime și o cladire rezonabil izolată, necesarul poate intra într-o zonă care schimbă complet discuția despre centrala sau pompa.",
    faq: [
      { question: "Pot folosi calculatorul și pentru apartament?", answer: "Da, atât timp cât introduci un scenariu apropiat de volum și pierderi." },
      { question: "Cu ce îl leg după asta?", answer: "Cu dimensionarea pompei de căldură sau cu comparația între solutii de încălzire." },
    ],
    relatedCalculatorKeys: ["heat-pump-size", "ac-btu", "monthly-electricity-bill"],
    relatedArticleSlugs: ["centrala-vs-pompa-de-caldura-cum-compari-corect-costurile"],
  },
  "heat-pump-size": {
    shortDescription: "Pornește de la necesarul termic și estimează puterea recomandata a unei pompe de căldură.",
    intro: "Calculatorul pentru dimensionarea pompei de căldură este util când ai deja un necesar termic estimat și vrei să vezi zona de putere în care merită să cauți echipamente.",
    interpretationNotes: "Rezultatul nu înlocuiește dimensionarea facuta de proiectant sau instalator. El este un filtru bun pentru orientare și comparație.",
    isFeatured: false,
    sortOrder: 90,
    audience: "consumer",
    releaseBatch: "batch-08",
    example: "Un necesar de 8,5 kW cu marja prudentă poate impinge recomandarea spre o pompă de circa 9,5-10 kW.",
    faq: [
      { question: "Pot alege fix valoarea rezultată?", answer: "Mai bine o folosești ca interval orientativ și o validezi cu detaliile sistemului tău real." },
      { question: "Merită să o leg de cost?", answer: "Da, mai ales dacă vrei să compari investiția cu factura actuală și cu izolarea locuinței." },
    ],
    relatedCalculatorKeys: ["heating-load", "monthly-electricity-bill", "solar-system-size"],
    relatedArticleSlugs: ["centrala-vs-pompa-de-caldura-cum-compari-corect-costurile"],
  },
  "solar-battery-size": {
    shortDescription: "Estimează ce baterie fotovoltaică ai nevoie pentru nivelul de backup și consumul vizat.",
    intro: "Calculatorul de baterie fotovoltaică este util când vrei să vezi dacă backup-ul dorit justifică sau nu costul suplimentar al unei baterii.",
    interpretationNotes: "Rezultatul depinde puternic de cât consum vrei să acoperi, cât de des apare backup-ul și ce adancime de descărcare accepta sistemul.",
    isFeatured: false,
    sortOrder: 100,
    audience: "consumer",
    releaseBatch: "batch-08",
    example: "La 12 kWh consum zilnic și 70% acoperire în backup, bateria necesară sare repede într-o zonă care poate dubla discuția despre buget.",
    faq: [
      { question: "Merită mereu baterie?", answer: "Nu. Pentru multe case, fără scenarii clare de backup și autoconsum, costul suplimentar poate fi greu de recuperat." },
      { question: "Cu ce îl leg în decizie?", answer: "Cu producție fotovoltaică și amortizare, ca să vezi dacă sistemul complet rămâne sustenabil economic." },
    ],
    relatedCalculatorKeys: ["solar-production", "solar-payback", "monthly-electricity-bill"],
    relatedArticleSlugs: ["cand-merita-o-baterie-fotovoltaica-si-cand-doar-creste-costul"],
  },
  "fridge-electricity-cost": {
    shortDescription: "Estimează cât te costa frigiderul pe luna și pe an, pornind de la consumul sau zilnic mediu.",
    intro: "Calculatorul de consum pentru frigider este util când vrei să vezi dacă unul dintre puținele aparate pornite permanent contribuie semnificativ la factura.",
    interpretationNotes: "Consumul zilnic real depinde de clasa energetică, temperatura ambientala, deschiderea usii și vechimea aparatului.",
    isFeatured: false,
    sortOrder: 110,
    audience: "consumer",
    releaseBatch: "batch-09",
    example: "La 1,1 kWh pe zi, frigiderul depășește rapid 30 kWh pe luna și devine un cost de baza stabil în factura anuală.",
    faq: [
      { question: "Merge pentru orice frigider?", answer: "Da, atât timp cât ai o estimare zilnică rezonabilă a consumului." },
      { question: "De ce merită calculat separat?", answer: "Pentru ca este unul dintre consumatorii permanenti și influențează costul de baza al casei." },
    ],
    relatedCalculatorKeys: ["monthly-electricity-bill", "appliance-electricity-cost", "led-savings"],
    relatedArticleSlugs: ["cat-consuma-un-frigider-in-realitate-si-cum-citesti-corect-eticheta"],
  },
  "boiler-electricity-cost": {
    shortDescription: "Calculează cât consumă un boiler electric în funcție de apa incalzita, temperatura și numărul de cicluri.",
    intro: "Calculatorul de consum pentru boiler electric este util când vrei să vezi dacă apa caldă este unul dintre costurile mari ascunse din locuință.",
    interpretationNotes: "Rezultatul este sensibil la temperatura inițială a apei, frecvența folosirii și eficiență reală a sistemului.",
    isFeatured: false,
    sortOrder: 120,
    audience: "consumer",
    releaseBatch: "batch-09",
    example: "La 80 litri, 35°C diferența și peste un ciclu pe zi, costul lunar crește surprinzător de repede în zonele cu utilizare intensă.",
    faq: [
      { question: "Este mai bun decât un calculator generic de aparat?", answer: "Da, pentru că leagă consumul de volumul și temperatura apei, nu doar de putere." },
      { question: "Cum îl leg de factura?", answer: "Compară costul lunar estimat al boilerului cu factura totală și vezi ce pondere are." },
    ],
    relatedCalculatorKeys: ["monthly-electricity-bill", "appliance-electricity-cost", "solar-system-size"],
    relatedArticleSlugs: ["cat-consuma-un-boiler-electric-si-cand-devine-o-problema-in-factura"],
  },
  "ac-electricity-cost": {
    shortDescription: "Estimează cât te costa aerul condiționat pe luna și pe sezon, pornind de la puterea absorbită și orele de folosire.",
    intro: "Calculatorul de consum pentru aer condiționat este util când vrei să legi confortul din lunile calde de impactul real în factura.",
    interpretationNotes: "Puterea medie absorbită poate varia mult în funcție de setpoint, izolație, temperatura exterioară și eficiență aparatului.",
    isFeatured: false,
    sortOrder: 130,
    audience: "consumer",
    releaseBatch: "batch-09",
    example: "Un aparat cu 0,9 kW absorbiti mediu, folosit 8 ore pe zi, poate ajunge la un cost sezonier pe care merită să îl compari cu alte scenarii.",
    faq: [
      { question: "De ce nu folosesc doar BTU-ul?", answer: "Pentru cost, ai nevoie de puterea absorbită sau de un consum mediu realist, nu doar de capacitatea de racire." },
      { question: "Ce verific prima data?", answer: "Dacă aparatul este bine dimensionat și dacă scenariul de utilizare este aproape de realitate." },
    ],
    relatedCalculatorKeys: ["ac-btu", "monthly-electricity-bill", "appliance-electricity-cost"],
    relatedArticleSlugs: ["cat-consuma-aerul-conditionat-pe-zi-si-pe-luna"],
  },
  "led-savings": {
    shortDescription: "Compară becurile clasice cu LED și estimează economia anuală și timpul de recuperare.",
    intro: "Calculatorul de economie din LED-uri este util când vrei una dintre cele mai simple comparații de eficiență energetică din casă.",
    interpretationNotes: "Economia reală depinde de orele de utilizare și de cât de mare este diferența între sursa veche și cea noua.",
    isFeatured: false,
    sortOrder: 140,
    audience: "consumer",
    releaseBatch: "batch-09",
    example: "La 12 becuri și 5 ore pe zi, trecerea de la 60 W la 9 W poate schimba repede costul anual și recupera investiția într-un interval scurt.",
    faq: [
      { question: "Merită dacă folosesc lumina puțin?", answer: "Da, dar perioada de recuperare crește când orele de utilizare sunt mici." },
      { question: "Cu ce îl leg mai departe?", answer: "Cu factura de curent și cu consumul altor aparate, ca să vezi unde sunt cele mai mari economii posibile." },
    ],
    relatedCalculatorKeys: ["monthly-electricity-bill", "appliance-electricity-cost", "fridge-electricity-cost"],
    relatedArticleSlugs: ["cum-calculezi-economia-reala-din-becuri-led"],
  },
  "solar-roof-area": {
    shortDescription: "Arată câte panouri și ce putere maximă încap pe suprafață utilă reală a acoperișului.",
    intro: "Calculatorul de suprafață pentru panouri este util când vrei să pornești din spațiul disponibil și să vezi repede cât de mare poate fi sistemul.",
    interpretationNotes: "Rezultatul este sensibil la forma acoperișului, distanțele de montaj, umbrire și zonele care rămân neutilizabile.",
    isFeatured: false,
    sortOrder: 150,
    audience: "consumer",
    releaseBatch: "batch-09",
    example: "La 42 mp utili și panouri standard de 2,1 mp, puterea maximă posibilă poate ajunge rapid într-o zonă suficientă pentru consumul multor case.",
    faq: [
      { question: "Pot folosi suprafață totală a acoperișului?", answer: "Mai sigur este să folosești doar suprafață cu adevărat utilă pentru montaj." },
      { question: "Cu ce îl combin imediat?", answer: "Cu necesarul sistemului și cu numărul de panouri, ca să vezi dacă spațiul susține obiectivul." },
    ],
    relatedCalculatorKeys: ["solar-system-size", "solar-panel-count", "solar-production"],
    relatedArticleSlugs: ["cata-suprafata-de-acoperis-iti-trebuie-pentru-panouri"],
  },
  "solar-inverter-size": {
    shortDescription: "Estimează puterea invertorului pornind de la sistemul DC și raportul DC/AC dorit.",
    intro: "Calculatorul de putere pentru invertor fotovoltaic este util când vrei să treci de la panouri și kWp la una dintre piesele cheie ale sistemului.",
    interpretationNotes: "Raportul DC/AC nu este o regulă rigidă. El depinde de configurație, orientare, strategie și limitele practice ale proiectului.",
    isFeatured: false,
    sortOrder: 160,
    audience: "consumer",
    releaseBatch: "batch-09",
    example: "Pentru un sistem de 6,3 kWp cu raport 1,15, invertorul recomandat poate coborî spre zona de 5,5 kW.",
    faq: [
      { question: "Un invertor mai mare este automat mai bun?", answer: "Nu. Supradimensionarea sau subdimensionarea trebuie gândite în contextul sistemului complet." },
      { question: "Cu ce alt calculator îl combin?", answer: "Cu puterea sistemului, producția estimată și suprafață disponibilă." },
    ],
    relatedCalculatorKeys: ["solar-system-size", "solar-panel-count", "solar-production"],
    relatedArticleSlugs: ["cum-alegi-corect-puterea-invertorului-fotovoltaic"],
  },
  "solar-self-consumption": {
    shortDescription: "Împarte producția între autoconsum și injectare și arată cât din consumul casei acoperi direct.",
    intro: "Calculatorul de autoconsum este util când vrei să vezi nu doar cât produce sistemul, ci și cât folosești cu adevărat în casa.",
    interpretationNotes: "Autoconsumul este foarte dependent de profilul orar de utilizare, nu doar de producția anuală totală.",
    isFeatured: true,
    sortOrder: 170,
    audience: "consumer",
    releaseBatch: "batch-09",
    example: "La un autoconsum de 45%, diferența dintre energia folosită direct și cea injectată schimbă puternic economia reală a sistemului.",
    faq: [
      { question: "Autoconsum mare înseamnă mereu situație bună?", answer: "De multe ori da, dar merită citit împreună cu marimea sistemului și cu nevoia reală de consum." },
      { question: "Cu ce îl compar?", answer: "Cu producție, baterie și amortizare, pentru că toate influențează economia finală." },
    ],
    relatedCalculatorKeys: ["solar-production", "solar-battery-size", "solar-payback"],
    relatedArticleSlugs: ["autoconsum-vs-injectare-ce-conteaza-cu-adevarat-la-un-sistem-fv"],
  },
  "ups-runtime": {
    shortDescription: "Estimează autonomia unui UPS sau a unei baterii în funcție de sarcina și energia disponibilă.",
    intro: "Calculatorul de autonomie UPS este util când vrei să vezi dacă backup-ul la care te gândești are sens pentru consumatorii reali din casă.",
    interpretationNotes: "Autonomia reală depinde de starea bateriei, temperatura, eficiență invertorului și modul în care variază sarcina.",
    isFeatured: false,
    sortOrder: 180,
    audience: "consumer",
    releaseBatch: "batch-09",
    example: "O baterie de 24 V și 100 Ah, la o sarcină de 300 W, poate oferi cateva ore bune de backup, dar merită să vezi și marja reală de utilizare.",
    faq: [
      { question: "Este același lucru cu o baterie fotovoltaică?", answer: "Nu neapărat, dar logica energiei disponibile și a sarcinii este foarte apropiată." },
      { question: "De ce merită calculat?", answer: "Pentru ca mulți utilizatori supraestimeaza autonomia pe care o pot obține dintr-o baterie." },
    ],
    relatedCalculatorKeys: ["solar-battery-size", "monthly-electricity-bill", "solar-self-consumption"],
    relatedArticleSlugs: ["cum-estimezi-backup-ul-pentru-ups-sau-baterie"],
  },
  "heating-cost-comparison": {
    shortDescription: "Compară costul anual al încălzirii între gaz și pompa de căldură pentru același necesar termic.",
    intro: "Calculatorul de comparație pentru costul încălzirii este util când vrei să treci de la preferinte tehnologice la cifre comparabile.",
    interpretationNotes: "Rezultatul este orientativ și depinde de eficiență reală a centralei, COP-ul pompei, tarife și profilul termic al locuinței.",
    isFeatured: true,
    sortOrder: 190,
    audience: "consumer",
    releaseBatch: "batch-09",
    example: "Pentru același necesar de căldură, diferențele dintre gaz și pompa de căldură pot schimba radical discuția despre investiție și operare.",
    faq: [
      { question: "Este suficient costul anual pentru alegere?", answer: "Nu. Contează și investiția inițială, izolația, confortul și scenariul de folosire." },
      { question: "Cu ce îl leg după calcul?", answer: "Cu necesarul termic și dimensionarea pompei de căldură." },
    ],
    relatedCalculatorKeys: ["heating-load", "heat-pump-size", "monthly-electricity-bill"],
    relatedArticleSlugs: ["cum-compari-costul-de-incalzire-intre-gaz-si-pompa-de-caldura"],
  },
  "solar-co2-savings": {
    shortDescription: "Estimează emisiile de CO2 evitate prin producția fotovoltaică anuală.",
    intro: "Calculatorul de economie CO2 pentru panouri este util când vrei să adaugi și o perspectivă de impact, nu doar una financiară.",
    interpretationNotes: "Factorul de emisii folosit este orientativ și variază în funcție de mixul energetic și metodologia aleasă.",
    isFeatured: false,
    sortOrder: 200,
    audience: "consumer",
    releaseBatch: "batch-09",
    example: "La o producție anuală bună, emisiile evitate pot ajunge într-o zonă care face vizibil și beneficiul de mediu, nu doar pe cel economic.",
    faq: [
      { question: "Este CO2-ul evitat un beneficiu financiar direct?", answer: "Nu direct, dar poate conta în evaluarea generală a investiției și a impactului ei." },
      { question: "Cu ce alt calculator îl combin?", answer: "Cu producție și amortizare, ca să vezi investiția și prin lentila de mediu." },
    ],
    relatedCalculatorKeys: ["solar-production", "solar-payback", "solar-system-size"],
    relatedArticleSlugs: ["cat-co2-poti-evita-cu-un-sistem-fotovoltaic"],
  },
  "property-total-purchase-cost": {
    shortDescription:
      "Adună prețul locuinței cu costurile inițiale, renovarea, mobilarea și rezervă, ca să vezi bugetul real al achiziției, nu doar prețul din anunț.",
    intro:
      "Calculatorul de cost total de achiziție locuință este unul dintre cele mai importante calculatoare imobiliare, pentru că muta atenția de la prețul proprietății la proiectul complet pe care chiar trebuie să îl finantezi.",
    interpretationNotes:
      "Rezultatul devine util doar dacă tratezi separat costurile de închidere, renovarea, mobilarea și rezervă. Exact aici se rupe de obicei diferența dintre o achiziție suportabilă pe hartie și una care îți tensioneaza imediat lichiditatea.",
    isFeatured: true,
    sortOrder: 130,
    audience: "both",
    releaseBatch: "batch-10",
    example:
      "La 620.000 lei preț proprietate, 24.000 lei costuri de închidere, 45.000 lei renovare, 30.000 lei mobilare și 10% rezervă, bugetul total urcă rapid mult peste cifra inițială văzută în anunț.",
    examples: [
      {
        title: "Locuință gata de mutare",
        narrative:
          "Chiar și când renovarea este minimă, costurile de închidere, mobilierul și rezervă îți pot muta semnificativ necesarul total de lichiditate.",
      },
      {
        title: "Apartament care cere renovare serioasa",
        narrative:
          "Când adaugi renovare, mobilare și mici surprize de santier, diferența dintre prețul afișat și bugetul real crește mult mai repede decât intuiesc majoritatea cumparatorilor.",
      },
      {
        title: "Casa cu proiect complet de amenajare",
        narrative:
          "La case, mobilarea, echipamentele și rezervele tind să cântărească și mai greu, ceea ce face acest calculator esential pentru o decizie prudentă.",
      },
    ],
    faq: [
      {
        question: "De ce nu este suficient prețul proprietății?",
        answer:
          "Pentru ca achiziția reală mai include costuri de închidere, renovare, mobilare și o rezervă minimă pentru surprizele care apar imediat după tranzacție.",
      },
      {
        question: "Rezervă chiar este necesară?",
        answer:
          "Da. Fără ea, proiectul pare mai confortabil pe hartie decât este în realitate, mai ales când apar costuri mici, dar dese, după semnare.",
      },
      {
        question: "Cum îl leg de avans și de rata?",
        answer:
          "Folosește-l împreună cu calculatorul de avans și cu cel de buget lunar, ca să vezi atât presiunea inițială, cât și pe cea recurentă.",
      },
      {
        question: "Când devine acest calculator cel mai valoros?",
        answer:
          "Când compari două proprietăți care par apropiate ca preț, dar au niveluri diferite de renovare, mobilare și costuri inițiale.",
      },
    ],
    relatedCalculatorKeys: ["property-down-payment", "renovation-budget", "monthly-home-budget"],
    relatedArticleSlugs: [
      "ce-intră-de-fapt-în-bugetul-total-de-achiziție-al-unei-locuințe",
      "chirie-vs-cumpărare-cum-compari-corect-două-scenarii",
    ],
    seo: {
      metaTitle: "Calculator cost total achiziție locuință",
      metaDescription:
        "Calculează costul total de achiziție al unei locuințe: preț, costuri de închidere, renovare, mobilare și rezervă de buget.",
    },
    extraBlocks: [
      {
        blockType: "facts",
        eyebrow: "Ce intră în buget",
        title: "Cinci componente pe care merită să le separi",
        intro:
          "Pagina e utilă tocmai pentru că sparge costul mare în bucati clare și comparabile.",
        tone: "mist",
        items: [
          {
            value: "Preț locuință",
            label: "cifra din anunț",
            detail:
              "Este doar punctul de pornire, nu proiectul complet.",
          },
          {
            value: "Costuri inițiale",
            label: "notar, taxe, închidere",
            detail:
              "Consumă lichiditate imediată, chiar dacă sunt tratate des ca detalii.",
          },
          {
            value: "Renovare + mobilare",
            label: "zona unde se sparge bugetul",
            detail:
              "Aici merită cele mai prudente ipoteze.",
          },
        ],
      },
      {
        blockType: "story",
        eyebrow: "Ce uită mulți cumpărători",
        title: "Prețul bun nu înseamnă automat proiect confortabil",
        body:
          "O proprietate poate părea accesibilă în anunț, dar să devină incomoda imediat după semnare dacă nu ai inclus realist costurile de închidere, renovarea și rezervă minimă. Pagina te ajută exact să eviți acest salt prea optimist.",
        tone: "sand",
      },
    ],
  },
  "rent-vs-buy": {
    shortDescription:
      "Compară chiria cu scenariul de cumpărare pe aceeași perioada, incluzand costul inițial și presiunea lunară, ca să nu reduci decizia la rata versus chirie.",
    intro:
      "Calculatorul de chirie vs cumpărare este una dintre cele mai puternice pagini de intenție din imobiliare, pentru că răspunde unei întrebări foarte căutate, dar o face fără să simplifice prea devreme comparația.",
    interpretationNotes:
      "Comparația devine utilă doar dacă pui alături costul inițial, costul lunar total și perioada analizată. Dacă te uiți doar la rata sau doar la chirie, vei pierde tocmai partea care decide confortul real al scenariului.",
    isFeatured: true,
    sortOrder: 140,
    audience: "both",
    releaseBatch: "batch-10",
    example:
      "La o chirie de 2.800 lei și un scenariu de cumpărare care cere cost inițial mare, diferența nu sta doar în rata lunară, ci și în cât capital blochezi și ce buffer îți mai rămâne.",
    examples: [
      {
        title: "Oraș mare, cost inițial ridicat",
        narrative:
          "Într-o piață cu prețuri mari, cumpărarea poate avea sens doar dacă bugetul inițial rămâne sănătos după avans, costuri de închidere și primele cheltuieli de amenajare.",
      },
      {
        title: "Perioada scurtă de locuire",
        narrative:
          "Dacă știi că nu stai mulți ani în același loc, flexibilitatea chiriei poate câștiga chiar și atunci când rata lunară nu arată dramatic mai rău.",
      },
      {
        title: "Scenariu lung, stabil",
        narrative:
          "Când perioada de locuire este lungă și bugetul suportă confortabil costurile inițiale, cumpărarea poate deveni mai coerentă decât pare la o comparație superficiala.",
      },
    ],
    faq: [
      {
        question: "Compar doar rata cu chiria?",
        answer:
          "Nu. O comparație bună cere și costul inițial, cheltuielile recurente și bufferul care îți rămâne după fiecare scenariu.",
      },
      {
        question: "Dacă rata este apropiată de chirie, înseamnă ca merită cumpărarea?",
        answer:
          "Nu automat. Diferența poate veni din costul inițial foarte mare sau din presiunea pe lichiditate imediat după achiziție.",
      },
      {
        question: "Când câștigă chiria?",
        answer:
          "De obicei când ai nevoie de flexibilitate, când perioada de locuire este scurtă sau când cumpărarea îți comprimă prea mult rezervă financiară.",
      },
      {
        question: "Cu ce alte pagini trebuie legată?",
        answer:
          "Cu costul total de achiziție, bugetul lunar al locuinței și bufferul ipotecar, ca să citești scenariul complet.",
      },
    ],
    relatedCalculatorKeys: ["monthly-home-budget", "mortgage-buffer", "property-total-purchase-cost"],
    relatedArticleSlugs: [
      "chirie-vs-cumpărare-cum-compari-corect-două-scenarii",
      "cât-îți-mănâncă-locuință-din-bugetul-lunar",
    ],
    seo: {
      metaTitle: "Calculator chirie vs cumpărare",
      metaDescription:
        "Compară chiria cu scenariul de cumpărare pe aceeași perioada. Vezi costul inițial, costul lunar și presiunea reală pe buget.",
    },
    extraBlocks: [
      {
        blockType: "facts",
        eyebrow: "Cum citești comparația",
        title: "Trei lucruri pe care nu merită să le amesteci",
        intro:
          "Pagina funcționează bine doar dacă separi costul inițial de costul lunar și de perioada pe care o analizezi.",
        tone: "mist",
        items: [
          {
            value: "Cost inițial",
            label: "cât capital blochezi din start",
            detail:
              "Aici se vede repede cât de agresivă este varianta de cumpărare pentru lichiditate.",
          },
          {
            value: "Cost lunar",
            label: "presiunea recurentă pe buget",
            detail:
              "Util pentru comparație, dar insuficient singur.",
          },
          {
            value: "Orizont",
            label: "câte luni sau ani compari",
            detail:
              "Schimbă mult concluzia dintre flexibilitate și stabilitate.",
          },
        ],
      },
      {
        blockType: "story",
        eyebrow: "Ce întrebare rezolvă pagina",
        title: "Nu cauți doar răspunsul mai ieftin, ci scenariul mai coerent pentru viață ta",
        body:
          "Chiria versus cumpărarea nu este doar o comparație de cifre, ci una de flexibilitate, lichiditate și confort pe termen mediu. Pagina te ajută să nu forțezi concluzia doar pentru că una dintre linii arată mai frumos singură.",
        tone: "sand",
      },
    ],
  },
};

const articleSeeds: ArticleSeed[] = [
  {
    slug: "cum-interpretezi-bmi-corect",
    title: "Cum interpretezi BMI corect fără să cazi în concluzii prea rapide",
    excerpt: "BMI este util, dar nu este suficient singur. Iată cum să-l folosești corect și când trebuie completat cu alți indicatori.",
    content: "BMI este un indicator rapid, nu un verdict final despre starea ta de sănătate.\n\nPentru mulți utilizatori, este primul calcul căutat atunci când vor să înțeleagă dacă greutatea actuală este aproape de un interval considerat normal. Tocmai de aceea merită folosit corect și interpretat în context, nu separat de restul datelor personale.\n\nFormula BMI leagă greutatea de înălțime și oferă un reper simplu, ușor de comparat între persoane sau între etape diferite din același proces de slăbire ori menținere. Avantajul lui este viteza. Limita lui este că nu diferențiază între masă musculară și masă grasă.\n\nDin acest motiv, un rezultat mai mare nu înseamnă automat exces de grăsime, iar un rezultat aflat în intervalul standard nu înseamnă neapărat că toate celelalte repere sunt în regulă. Sportivii, persoanele cu multă masă musculară sau cei care trec prin schimbări metabolice pot obține valori care au nevoie de interpretare suplimentară.\n\nCel mai util mod de a privi BMI-ul este ca punct de plecare. Îl poți completa cu calculatorul BMR, cu TDEE-ul și cu alte estimări legate de obiectivul tău, astfel încât rezultatul să devină parte dintr-o imagine mai coerentă, nu doar o cifră izolată.",
    articleType: "explainer",
    relatedCategorySlug: "nutritie-si-antrenament",
    relatedCalculatorKeys: ["bmi", "bmr", "tdee"],
    relatedArticleSlugs: ["bmr-vs-tdee-diferente"],
    launchWave: "wave-1",
    releaseBatch: "batch-01",
    editorialStatus: "approved",
  },
  {
    slug: "bmr-vs-tdee-diferente",
    title: "BMR vs TDEE: diferențele care contează când îți calculezi caloriile",
    excerpt: "BMR și TDEE sunt confundate des, dar au roluri diferite în planificarea unei diete.",
    content: "BMR și TDEE par apropiate, dar răspund la două întrebări diferite.\n\nBMR, adica rata metabolica bazala, estimează câte calorii consumă corpul în repaus pentru funcțiile de baza: respirație, circulatie, reglare termică și menținerea organelor în functiune. Este o valoare de fundal, nu o țintă de alimentație zilnică pentru majoritatea oamenilor activi.\n\nTDEE pornește de la BMR și adaugă mișcarea zilnică, antrenamentele și nivelul general de activitate. Din acest motiv, TDEE este de obicei cifra mai utilă atunci când vrei să afli câte calorii poți consuma pentru menținere, slăbire sau creștere în greutate.\n\nConfuzia apare frecvent atunci când cineva folosește direct BMR-ul ca reper alimentar și ajunge la o țintă prea joasa. În practică, dacă vrei să-ti organizezi mesele sau să setezi un deficit caloric, TDEE este baza mai relevantă, iar BMR rămâne etapa intermediara care explică de unde pornește calculul.\n\nCel mai bun mod de a le folosi este împreună: calculezi BMR-ul, îl transformi în TDEE prin factorul de activitate, apoi ajustezi în funcție de obiectiv și de răspunsul real al corpului după cateva săptămâni.",
    articleType: "guide",
    relatedCategorySlug: "nutritie-si-antrenament",
    relatedCalculatorKeys: ["bmr", "tdee", "calorie-deficit"],
    relatedArticleSlugs: ["cum-setezi-un-deficit-caloric"],
    launchWave: "wave-1",
    releaseBatch: "batch-01",
    editorialStatus: "approved",
  },
  {
    slug: "cum-setezi-un-deficit-caloric",
    title: "Cum setezi un deficit caloric sustenabil pentru slăbire",
    excerpt: "Un deficit prea mare poate să-ti saboteze progresul. Iată cum alegi o țintă calorica mai realistă.",
    content: "Deficitul caloric este diferența dintre energia pe care o consumi și energia pe care o cheltui într-o zi.\n\nÎn teorie, ideea este simplă: mananci mai puțin decât consumi și greutatea începe să scada. În practică, lucrurile devin mai nuantate, pentru că un deficit prea agresiv poate duce la foame mare, oboseala, aderenta slabă și renuntare rapidă.\n\nPentru mulți oameni, un deficit moderat este un punct de pornire mai bun decât o taiere brusca a caloriilor. De aceea, un calculator de deficit caloric ar trebui folosit ca instrument de setare inițială, nu ca garantie ca rezultatul va arata identic la toată lumea.\n\nDupa ce obții o țintă, cel mai important pas este observatia. Dacă după două-trei săptămâni greutatea, energia și foamea merg într-o directie dezechilibrata, țintă trebuie ajustată. Aici intervine diferența dintre un calcul util și o strategie sustenabilă.\n\nUn deficit bine setat îți oferă spațiu să rămâi consecvent. De aceea merită să-l legi de TDEE, de aportul de proteine și de obiectivul real, nu doar de dorința de a obține un număr cât mai mic pe ecran.",
    articleType: "guide",
    relatedCategorySlug: "nutritie-si-antrenament",
    relatedCalculatorKeys: ["calorie-deficit", "tdee", "protein-intake"],
    relatedArticleSlugs: ["cate-proteine-ai-nevoie-zilnic"],
    launchWave: "wave-1",
    releaseBatch: "batch-01",
    editorialStatus: "approved",
  },
  {
    slug: "cate-proteine-ai-nevoie-zilnic",
    title: "Câte proteine ai nevoie zilnic în funcție de obiectiv",
    excerpt: "Necesarul de proteine diferă între menținere, slăbire și creștere musculară. Iată o regulă simplă de pornire.",
    content: "Necesarul de proteine nu este același pentru toată lumea.\n\nGreutatea corporală, nivelul de activitate, varsta și obiectivul fac diferența între o țintă minimă pentru menținere și una mai ridicata pentru slăbire sau dezvoltare musculară. De aceea, o cifră fixă identica pentru toti este rar utilă în practică.\n\nPentru multe persoane active, un interval raportat la kilogram corp oferă un punct de pornire mai bun decât o recomandare generica pe zi. Calculatorul de proteine tocmai asta face: transformă greutatea și obiectivul într-o estimare ușor de folosit în planificarea meselor.\n\nInterpretarea rămâne totuși importanța. Dacă ești în deficit caloric, un aport mai mare poate susține satietatea și menținerea masei musculare. Dacă ești la menținere și nu ai un volum mare de antrenament, o țintă mai moderată poate fi suficientă.\n\nCel mai util este să folosești rezultatul împreună cu TDEE-ul și cu structura meselor tale zilnice. Astfel nu rămâi doar cu un număr de grame, ci cu o țintă pe care o poți distribui realist în alimentatia de zi cu zi.",
    articleType: "explainer",
    relatedCategorySlug: "nutritie-si-antrenament",
    relatedCalculatorKeys: ["protein-intake", "calorie-deficit", "tdee"],
    relatedArticleSlugs: ["cum-setezi-un-deficit-caloric"],
    launchWave: "wave-1",
    releaseBatch: "batch-01",
    editorialStatus: "approved",
  },
  {
    slug: "cum-calculezi-consumul-real-la-masina",
    title: "Cum calculezi consumul real la mașină fără să te bazezi doar pe bord",
    excerpt: "Consumul afișat în bord este util, dar nu este întotdeauna suficient. Iată metoda simplă pentru o estimare mai bună.",
    content: "Consumul afișat în bord este util pentru orientare rapidă, dar nu este întotdeauna suficient dacă vrei o estimare cât mai apropiată de realitate.\n\nCea mai simplă metoda practică este să alimentezi până la plin, să notezi kilometrii parcursi și să compari distanța cu cantitatea reală de carburant consumată. Formula rămâne simplă, dar rezultatul devine mai valoros atunci când este repetat pe mai multe plinuri.\n\nPe distanțe foarte scurte, traficul, relantiul, temperatura exterioară sau stilul de condus pot distorsiona ușor concluzia. De aceea merită să te uiți la o medie, nu la un singur drum. În felul acesta, consumul calculat devine mai util pentru buget și pentru comparații între trasee sau perioade.\n\nOdată ce știi consumul real, poți continua cu estimarea costului pe kilometru sau a costului total pentru un drum mai lung. Exact aici se leagă bine calculatoarele din categoria auto: unul îți da consumul, altul îți arată costul, iar altul îți estimează timpul.\n\nPrivit corect, consumul real nu este doar o curiozitate tehnică. Este un reper practic pentru decizii zilnice legate de buget, trasee și modul în care folosești mașină.",
    articleType: "guide",
    relatedCategorySlug: "auto",
    relatedCalculatorKeys: ["fuel-consumption", "cost-per-km", "trip-fuel-cost"],
    relatedArticleSlugs: ["cum-estimezi-costul-unei-calatorii-cu-masina"],
    launchWave: "wave-2",
  },
  {
    slug: "cum-estimezi-costul-unei-calatorii-cu-masina",
    title: "Cum estimezi costul unei calatorii cu mașină mai aproape de realitate",
    excerpt: "Un drum nu înseamnă doar distanța. Consumul, prețul carburantului și viteza medie schimbă estimarea finală.",
    content: "Costul unui drum nu înseamnă doar distanța dintre punctul A și punctul B.\n\nPentru o estimare rezonabilă ai nevoie de cel puțin trei repere: distanța, consumul mediu real și prețul carburantului. Dacă unul dintre ele este nerealist, și rezultatul final va fi mai degraba optimist decât util.\n\nÎn practică, merită să iei în calcul și tipul de traseu. Un drum cu mult oraș, relanti sau diferențe de nivel poate arata foarte diferit față de o deplasare predominanta pe autostradă. De aceea, calculul devine mai bun atunci când compari două sau trei scenarii, nu doar unul singur.\n\nUn alt avantaj al estimarii corecte este ca o poți combina cu timpul de călătorie și cu costul pe kilometru. În momentul acela, drumul nu mai este doar o distanță, ci o decizie de buget și de planificare.\n\nUn calculator bun pentru costul calatoriei nu îți oferă doar un total. Îți da un punct de plecare pentru a compară rute, a pregati bugetul și a evită surprizele când prețul carburantului sau consumul real sunt diferite de cele anticipate.",
    articleType: "guide",
    relatedCategorySlug: "auto",
    relatedCalculatorKeys: ["trip-fuel-cost", "travel-time", "cost-per-km"],
    relatedArticleSlugs: ["cum-calculezi-consumul-real-la-masina"],
    launchWave: "wave-2",
  },
  {
    slug: "kw-vs-cp-explicat-simplu",
    title: "KW vs CP explicat simplu: ce înseamnă și când contează diferența",
    excerpt: "Kilowatii și caii putere descriu aceeași idee, dar apar în contexte diferite. Iată cum le citești corect.",
    content: "kW și CP sunt două moduri uzuale de a exprima aceeași idee: puterea dezvoltata de un motor sau de un echipament.\n\nConfuzia apare pentru că unele documentatii folosesc kilowatii, altele caii putere, iar utilizatorul ajunge să vrea conversia imediată fără să piardă contextul. În special în zona auto, diferențele de afisare dintre acte, configuratoare și anunturi duc des la întrebări aparent simple, dar recurente.\n\nConversia în sine este directa. Problema reală apare atunci când cifrele sunt rotunjite sau când sursele folosesc conventii ușor diferite. De aceea pot apărea mici variații între rezultatele afișate în locuri diferite, chiar dacă toate pleaca de la aceeași formula de baza.\n\nDin perspectiva utilizatorului, un convertor bun trebuie să ofere două lucruri: răspuns instant și o explicație suficient de clară încât să știi ce compari de fapt. Nu toate cautarile au nevoie de un articol lung, dar toate beneficiaza de o explicație simplă și corectă.\n\nTocmai aici pagina devine utilă: nu doar transformă kW în CP, ci îți arată și de ce vezi când o unitate, când cealaltă, și cum să citești corect specificațiile unui motor sau ale unui aparat.",
    articleType: "explainer",
    relatedCategorySlug: "energie",
    relatedCalculatorKeys: ["kw-cp", "amps-to-watts", "watts-to-kwh"],
    relatedArticleSlugs: ["cum-calculezi-consumul-electric-al-unui-aparat"],
    launchWave: "backlog",
  },
  {
    slug: "cum-calculezi-consumul-electric-al-unui-aparat",
    title: "Cum calculezi consumul electric al unui aparat fără formule complicate",
    excerpt: "Pornești de la putere și timp de funcționare, iar din aceste două valori poți estima rapid consumul și costul.",
    content: "Calculul consumului electric al unui aparat devine simplu atunci când separi clar două notiuni: puterea instantanee și energia consumată în timp.\n\nPuterea în wati îți spune cât consumă aparatul într-un anumit moment, în timp ce kWh-ul arată consumul acumulat pe durata functionarii. De aici pornește întreaga estimare: transformi puterea și timpul într-o valoare de consum, apoi aplici prețul pe kWh ca să obții costul.\n\nMulte confuzii apar pentru că utilizatorii compară direct wati cu bani, fără pasul intermediar. În realitate, costul nu vine din puterea afișată pe eticheta, ci din felul în care aparatul este folosit de-a lungul unei zile, săptămâni sau luni.\n\nUn astfel de calculator este util nu doar pentru curiozitate, ci și pentru prioritizare. Dacă vrei să înțelegi ce aparat contează mai mult în factura sau dacă merită să schimbi un obicei de consum, ai nevoie de o estimare rapidă și ușor de refacut.\n\nDe aceea merită legat de conversiile dintre wati și kWh, dar și de calculatorul de cost electric. Împreună, ele transformă un calcul simplu într-un răspuns practic pentru decizii de consum.",
    articleType: "guide",
    relatedCategorySlug: "energie",
    relatedCalculatorKeys: ["electricity-cost", "watts-to-kwh", "amps-to-watts"],
    relatedArticleSlugs: ["kw-vs-cp-explicat-simplu"],
    launchWave: "backlog",
  },
  {
    slug: "ghid-conversii-kg-lb-cm-inch",
    title: "Ghid rapid pentru conversii kg-lb și cm-inch în contexte de zi cu zi",
    excerpt: "Conversiile simple apar în fitness, shopping, rețete și specificații tehnice. Iată cum le folosești fără să greșești unitățile.",
    content: "Conversiile între kilograme și livre sau între centimetri și inch apar peste tot: în surse internaționale, în magazine, în fitness, în rețete sau în specificații tehnice.\n\nFormula este simplă, dar nevoia utilizatorului nu este doar matematica. De cele mai multe ori, persoana care caută o conversie vrea o confirmare rapidă, fără risc de eroare și fără să piardă timp cu formule memorate pe jumătate.\n\nExact de aceea paginile de conversie funcționează bine atunci când oferă un răspuns instant, dar și cateva exemple ușor de recunoscut. O valoare convertita capătă mai mult sens când este ancorata într-un context real: greutate corporală, marime de produs, dimensiunea unui obiect sau temperatura dintr-o rețetă.\n\nO conversie cerută rapid nu trebuie însă să fie o pagină goală - un minim de context și cateva legături către conversii apropiate ajută la exact același lucru pentru care ai deschis pagina.\n\nUn convertor bun reduce frictiunea. Îți da răspunsul imediat, te lasă să verifici rapid și te trimite mai departe doar atunci când are sens să continui cu o altă conversie sau cu o pagină mai explicativa.",
    articleType: "guide",
    relatedCategorySlug: "conversii",
    relatedCalculatorKeys: ["kg-lb", "cm-inch", "temperature-converter"],
    relatedArticleSlugs: ["cum-transformi-amperii-in-wati-si-wati-in-kwh"],
    launchWave: "backlog",
  },
  {
    slug: "cum-estimezi-procentul-de-grasime-corporala",
    title: "Cum estimezi procentul de grăsime corporală fără să supraevaluezi precizia",
    excerpt: "Formula US Navy este utilă pentru orientare, dar valoarea ei vine din măsurători coerente și interpretare prudentă.",
    content: "Procentul de grăsime corporală este căutat des pentru că promite un răspuns mai fin decât BMI-ul. În multe cazuri chiar oferă mai mult context, dar numai dacă este folosit cu așteptări corecte.\n\nFormula US Navy pornește de la circumferințe și înălțime, ceea ce o face accesibilă și ușor de repetat acasă. Tocmai repetabilitatea este unul dintre avantajele ei: dacă masori în același mod, poți urmari tendinte în timp mai ușor decât dacă schimbi metoda la fiecare cateva săptămâni.\n\nLimita principala este ca masuratorile trebuie facute atent. Un centimetru în plus sau în minus la talie ori la gât poate schimba rezultatul suficient cât să pară ca ai progresat sau regresat mai mult decât s-a intamplat în realitate. De aceea, consistență contează aproape la fel de mult ca formula.\n\nÎn practică, procentul estimat de grăsime corporală merită citit împreună cu BMI-ul, cu greutatea actuală și cu obiectivul personal. Pentru unii utilizatori, progresul util înseamnă schimbarea compoziției corporale, nu doar scăderea unui număr pe cantar.\n\nCel mai sănătos mod de a folosi acest calculator este ca instrument de observatie, nu ca verdict perfect. Dacă îl tratezi astfel, pagina devine un reper bun pentru comparații în timp și pentru setarea unor așteptări mai realiste.",
    articleType: "guide",
    relatedCategorySlug: "nutritie-si-antrenament",
    relatedCalculatorKeys: ["body-fat-us-navy", "bmi", "ideal-weight"],
    relatedArticleSlugs: ["cum-interpretezi-bmi-corect"],
    launchWave: "backlog",
  },
  {
    slug: "cata-apa-ai-nevoie-zilnic-cu-adevarat",
    title: "Câtă apa ai nevoie zilnic cu adevărat și cum folosești corect un calculator simplu",
    excerpt: "Regulă pe kilogram corp este un bun punct de plecare, dar hidratarea reală depinde de contextul de zi cu zi.",
    content: "Când cineva caută câtă apa trebuie să bea zilnic, de obicei caută claritate, nu o formulă complicată. Tocmai de aceea regulile simple, precum aportul estimat pe kilogram corp, rămân atât de populare.\n\nAvantajul unui calculator simplu de hidratare este ca îți da imediat un reper. Fără acest punct de plecare, mulți utilizatori fie subestimează constant cât beau, fie încearcă să urmeze recomandări generale care nu tin cont de greutate, vreme sau nivel de activitate.\n\nÎn același timp, hidratarea nu este un număr fix care trebuie respectat mecanic în fiecare zi. Temperatura, transpiratia, mesele, cafeaua, antrenamentele și chiar obiceiurile de somn pot muta nevoia reală în sus sau în jos.\n\nDe aceea merită să folosești calculatorul ca instrument de organizare. Îți setezi o țintă orientativă, o observi cateva zile și apoi o corectezi după cum te simți și după contextul concret. Exact aici devine utilă pagina: traduce o formulă simplă într-o regulă ușor de aplicat, nu într-o obligație rigidă.\n\nDacă o legi de alimentație, de nivelul de activitate și de sezon, hidratarea devine mai ușor de gestionat. Iar calculatorul rămâne ceea ce trebuie să fie: un reper practic, nu o sursă de presiune inutila.",
    articleType: "guide",
    relatedCategorySlug: "nutritie-si-antrenament",
    relatedCalculatorKeys: ["water-intake", "tdee", "protein-intake"],
    relatedArticleSlugs: ["cate-proteine-ai-nevoie-zilnic"],
    launchWave: "backlog",
  },
  {
    slug: "cum-folosesti-one-rep-max-in-antrenament",
    title: "Cum folosești one rep max în antrenament fără să transformi totul într-un test de ego",
    excerpt: "Estimarea 1RM este utilă pentru programare, nu doar pentru a află un număr mare pe hartie.",
    content: "One rep max este una dintre cele mai populare valori din antrenamentul de forța, dar și una dintre cele mai ușor de interpretat greșit. Mulți utilizatori îl caută ca pe un scor, când de fapt valoarea lui reală apare în programare.\n\nUn calculator 1RM pleaca de la o serie submaximală și estimează ce ai putea ridică o singură data în condiții bune. Pentru majoritatea utilizatorilor, asta este mai practic și mai sigur decât să testeze mereu un maxim real în sala.\n\nAvantajul apare imediat în planificare. Dacă știi 1RM-ul estimat, poți calcula mai ușor procente de lucru, poți organiza zilele grele și poți observa când forța crește fără să transformi fiecare saptamana într-o competitie.\n\nTotuși, rezultatul trebuie citit cu prudentă. Cu cât setul folosit la intrare are mai multe repetări sau tehnică mai slabă, cu atât estimarea devine mai puțin stabilă. De aceea calculatorul este mai util ca reper intern decât ca adevăr absolut.\n\nPrivit corect, 1RM-ul te ajută să aduci mai multă structura în antrenament. Nu îți spune totul despre progres, dar îți oferă un limbaj simplu prin care să legi efortul de planificare și de obiectivele tale reale.",
    articleType: "guide",
    relatedCategorySlug: "nutritie-si-antrenament",
    relatedCalculatorKeys: ["one-rep-max", "protein-intake", "tdee"],
    relatedArticleSlugs: ["cate-proteine-ai-nevoie-zilnic"],
    launchWave: "backlog",
  },
  {
    slug: "cost-pe-kilometru-vs-cost-total-drum",
    title: "Cost pe kilometru vs cost total de drum: ce îți spune fiecare și când merită să le compari",
    excerpt: "Cele două estimări răspund la întrebări diferite. Una te ajută la comparații rapide, cealaltă la bugetarea unui traseu.",
    content: "Costul pe kilometru și costul total al unui drum par calcule apropiate, dar servesc scopuri diferite. Exact de aceea merită să le privești împreună, nu izolat.\n\nCostul pe kilometru este util atunci când vrei un reper rapid și comparabil. Îți arată cum se schimbă bugetul atunci când variază consumul sau prețul carburantului și te ajută să compari două mașini ori două stiluri de condus fără să pornești mereu de la o distanță anume.\n\nCostul total de drum răspunde unei alte întrebări: cât te costa traseul pe care urmeaza să îl faci. Aici contează distanța, consumul, prețul carburantului și, uneori, chiar timpul estimat dacă vrei să pui planificarea în același tablou.\n\nÎn practică, cele două calcule funcționează mai bine împreună. Unul îți da unitatea de comparație, celălalt îți da suma concretă. Când le legi și de consumul real, estimările devin mult mai utile decât cifrele teoretice din acte sau din bord.\n\nAsta e diferența dintre o pagină care îți afișează un singur rezultat și una care chiar te ajută să decizi: cost, consum și timp merg împreună, nu izolat.",
    articleType: "comparison",
    relatedCategorySlug: "auto",
    relatedCalculatorKeys: ["cost-per-km", "trip-fuel-cost", "fuel-consumption"],
    relatedArticleSlugs: ["cum-estimezi-costul-unei-calatorii-cu-masina"],
    launchWave: "backlog",
  },
  {
    slug: "cum-transformi-amperii-in-wati-si-wati-in-kwh",
    title: "Cum transformi amperii în wati și wații în kWh fără să amesteci puterea cu energia",
    excerpt: "Amperi, wati și kWh apar des împreună, dar descriu lucruri diferite. Iată cum le legi corect într-un calcul util.",
    content: "Confuzia dintre amperi, wati și kWh este foarte comună pentru că termenii apar des unul lângă altul, dar nu descriu același lucru. Exact de aici pornesc multe cautari care par simple și ajung să aibă nevoie de explicație, nu doar de formula.\n\nAmperii descriu intensitatea curentului, iar wații descriu puterea rezultată într-un anumit moment. Dacă mai adaugi și timpul de funcționare, ajungi la kWh, adica energia consumată pe o perioadă. Fără această ordine, utilizatorul riscă să compare marimi diferite ca și cum ar fi același lucru.\n\nDe aceea primul pas util este conversia corectă dintre amperi și wati, folosind tensiunea. Al doilea pas este transformarea puterii în consum energetic atunci când aparatul funcționează un anumit număr de ore. Abia după aceea are sens să vorbești despre costuri și factura.\n\nAcest lant de calcule este foarte util în practică: pentru electrocasnice, încălzire, echipamente de atelier sau orice situație în care vrei să estimezi rapid cât consumă ceva și dacă merită să schimbi modul de utilizare.\n\nPus corect într-o pagină, acest subiect face legatura firească dintre conversii tehnice și calcule de cost. Așa utilizatorul pleaca nu doar cu un număr, ci cu o înțelegere mai clară a relației dintre putere, timp și consum.",
    articleType: "guide",
    relatedCategorySlug: "energie",
    relatedCalculatorKeys: ["amps-to-watts", "watts-to-kwh", "electricity-cost"],
    relatedArticleSlugs: ["cum-calculezi-consumul-electric-al-unui-aparat"],
    launchWave: "backlog",
  },
  {
    slug: "cum-calculezi-suprafata-unei-camere-corect",
    title: "Cum calculezi suprafață unei camere corect înainte de renovare sau amenajare",
    excerpt: "Suprafață unei camere este baza pentru vopsea, gresie, parchet și multe alte estimări de materiale.",
    content: "Suprafață unei camere pare un calcul simplu, dar în practică este una dintre cele mai importante valori pentru orice renovare. Dacă pleci de la o suprafață greșită, toate estimările următoare riscă să fie prea mici sau prea mari.\n\nPentru camerele dreptunghiulare, formula de baza este simplă: lungime înmulțită cu lățime. Problemele apar atunci când incaperea are nise, retrageri, colțuri atipice sau zone care nu trebuie incluse în același calcul. În aceste situații, cea mai bună metoda este să împărți spațiul în forme mai mici și să aduni apoi suprafetele.\n\nPerimetrul este și el util, chiar dacă mulți îl ignora. Te ajută la plinte, baghete sau estimări laterale, iar împreună cu suprafață oferă o imagine mult mai clară asupra camerei.\n\nOdată ce ai suprafață corectă, restul calculelor devin mai fiabile: vopsea, gresie, faianță, parchet sau chiar bugete orientative pentru materiale. Exact de aceea merită să verifici și celelalte calculatoare din amenajări, nu doar suprafață luata separat.\n\nPrivită corect, suprafață unei camere nu este doar o cifră. Este baza de lucru pentru aproape orice estimare practică din amenajări.",
    articleType: "guide",
    relatedCategorySlug: "constructii",
    relatedCalculatorKeys: ["room-area", "paint-coverage", "laminate-flooring"],
    relatedArticleSlugs: ["cum-estimezi-necesarul-de-vopsea"],
    launchWave: "backlog",
  },
  {
    slug: "cum-calculezi-volumul-de-beton-pentru-fundatie",
    title: "Cum calculezi volumul de beton pentru fundație fără să subestimezi comanda",
    excerpt: "Volumul de beton este simplu geometric, dar merită citit cu rezervă practică pentru pierderi și neregularitati.",
    content: "Volumul de beton este unul dintre calculele pe care mulți utilizatori vor să le rezolve rapid, mai ales înainte de o comandă sau de o discuție cu echipa de execuție. Formula de baza este geometrica: lungime ori lățime ori grosime.\n\nTotuși, santierul real nu arată mereu perfect ca în schița. Pot există diferențe mici de nivel, cofraje neregulate, zone de completat sau pierderi care fac ca volumul final comandat să fie ușor mai mare decât volumul matematic strict.\n\nDe aceea calculatorul trebuie folosit ca punct de plecare clar, nu ca estimare absolută. Mai întâi obții volumul geometric în metri cubi, apoi adaugi rezervă practică potrivită contextului tău.\n\nUn alt avantaj este ca același calcul poate fi folosit și pentru plăci, sape sau alte turnări simple, atât timp cât dimensiunile sunt introduse corect. Pagina devine astfel utilă nu doar pentru un singur caz, ci pentru mai multe scenarii de construcții ușoare.\n\nCând legi volumul de beton de calculatorul de suprafață sau de estimările de finisaje, începi să obții un mini-hub coerent pentru lucrări și bugete.",
    articleType: "guide",
    relatedCategorySlug: "constructii",
    relatedCalculatorKeys: ["concrete-volume", "room-area"],
    relatedArticleSlugs: ["cum-calculezi-suprafata-unei-camere-corect"],
    launchWave: "backlog",
  },
  {
    slug: "cum-estimezi-necesarul-de-vopsea",
    title: "Cum estimezi necesarul de vopsea fără să rămâi în mijlocul lucrării fără material",
    excerpt: "Suprafață, numărul de straturi și acoperirea produsului fac diferența dintre o estimare bună și una prea optimistă.",
    content: "Necesarul de vopsea pare un calcul simplu, dar în practică este afectat de mai mulți factori decât pare la prima vedere. Suprafață este punctul de plecare, dar nu este singură variabila care contează.\n\nNumărul de straturi influențează direct consumul, iar acoperirea de pe ambalaj este de obicei o valoare orientativă, nu o promisiune absolută pentru orice tip de perete. Tencuiala, absorbția, culoarea anterioara și modul de aplicare pot muta necesarul real destul de mult.\n\nDe aceea merită să folosești calculatorul ca estimare de lucru și să păstrezi o marjă rezonabilă, mai ales dacă suprafață este mare sau dacă suportul nu este uniform. Un calcul prea strans poate duce la intreruperi și la diferențe de lot.\n\nCând suprafață este deja calculată corect, restul procesului devine mult mai simplu. Iar dacă legi pagina de alte estimări precum parchetul sau gresia, ai un flux editorial natural pentru utilizatorul care tocmai planifică o renovare.\n\nUn calculator bun de vopsea nu trebuie doar să afișeze litri. Trebuie să te ajute să iei o decizie mai sigura înainte de comanda.",
    articleType: "guide",
    relatedCategorySlug: "constructii",
    relatedCalculatorKeys: ["paint-coverage", "room-area"],
    relatedArticleSlugs: ["cum-calculezi-suprafata-unei-camere-corect"],
    launchWave: "backlog",
  },
  {
    slug: "cum-calculezi-necesarul-de-gresie-si-faianta",
    title: "Cum calculezi necesarul de gresie și faianță fără să ignori pierderile reale",
    excerpt: "Suprafață utilă nu este suficientă. Pentru o comandă bună contează și pierderile, taieturile și tipul de montaj.",
    content: "Necesarul de gresie și faianță nu înseamnă doar să împărți suprafață la acoperirea unei cutii. În practică, pierderile fac o diferență reală, iar ele pot varia mult în funcție de montaj, model și forma spatiului.\n\nUn montaj drept pe o cameră simplă poate avea pierderi moderate, în timp ce un montaj diagonal sau o zonă cu multe colțuri și decupaje cere de obicei mai multă rezervă. Exact aici calculatorul devine util: pleaca de la suprafață, dar introduce și procentul de pierderi.\n\nAcest lucru este important mai ales pentru comenzi, unde lipsă unei singure cutii poate crea intarzieri, diferențe de lot sau costuri suplimentare. O estimare puțin mai prudentă este de multe ori mai utilă decât una perfect optimistă.\n\nPagina funcționează cel mai bine când este legată de calculatorul de suprafață și de alte tool-uri de finisaje. Așa utilizatorul poate trece natural de la o nevoie la altă fără să se intoarca la căutare de fiecare data.\n\nE genul de calculator la care revii de fiecare data când începi o comandă noua, tocmai pentru că răspunde unei întrebări foarte practice și repetabile.",
    articleType: "guide",
    relatedCategorySlug: "constructii",
    relatedCalculatorKeys: ["tile-coverage", "laminate-flooring", "room-area"],
    relatedArticleSlugs: ["cum-calculezi-suprafata-unei-camere-corect"],
    launchWave: "backlog",
  },
  {
    slug: "food-cost-explicat-pentru-horeca",
    title: "Food cost explicat simplu pentru horeca: ce îți spune și ce nu îți spune",
    excerpt: "Food cost-ul este un indicator foarte util, dar nu trebuie confundat cu profitul final al business-ului.",
    content: "Food cost-ul este unul dintre cele mai căutate calcule din horeca pentru că oferă rapid un reper ușor de înțeles. Practic, îți arată ce procent din prețul de vânzare este consumat de ingredientele directe.\n\nValoarea lui este mare mai ales în comparații: între produse, între perioade sau între două variante de rețeta. Tocmai de aceea calculatorul este util pentru decizii rapide de meniu și pricing.\n\nTotuși, food cost-ul nu spune singur întreaga poveste. Chiria, personalul, livrarea, pierderile, ambalajele și costurile operaționale pot schimba radical imaginea finală. De aceea un food cost bun nu înseamnă automat și un produs foarte profitabil.\n\nCea mai bună utilizare este să îl pui alături de marja, markup și, în anumite cazuri, break-even. Atunci începi să vezi nu doar costul ingredientelor, ci și sustenabilitatea comercială a produsului.\n\nDacă lucrezi în horeca, merită să îl verifici regulat, nu doar o dată la lansarea unui produs nou.",
    articleType: "guide",
    relatedCategorySlug: "afaceri",
    relatedCalculatorKeys: ["food-cost", "profit-margin", "markup"],
    relatedArticleSlugs: ["marja-vs-markup-explicate-simplu"],
    launchWave: "backlog",
  },
  {
    slug: "marja-vs-markup-explicate-simplu",
    title: "Marja vs markup explicate simplu: de ce par apropiate, dar nu sunt același lucru",
    excerpt: "Marja și markup-ul pleaca de la aceleași două valori, dar răspund la întrebări diferite.",
    content: "Marja și markup-ul sunt confundate frecvent pentru că folosesc aceleași componente: costul și prețul de vânzare. Diferența reală vine din baza la care raportezi profitul.\n\nMarja îți spune ce procent din prețul final rămâne după costul direct. Markup-ul îți spune cu cât ai crescut costul ca să ajungi la preț. Tocmai de aceea cele două procente nu vor avea aceeași valoare chiar dacă pleaca de la aceleași cifre.\n\nÎn practică, marja este adesea mai utilă pentru analiza performanței comerciale, în timp ce markup-ul este foarte folosit în pricing atunci când prețul se construieste pornind de la cost. Dacă le amesteci, poți lua decizii greșite sau poți compara incorect produse și oferte.\n\nDe aceea merită să le calculezi împreună, nu pe rând - cauți de multe ori exact această diferența și ai nevoie de o explicație simplă, nu doar de formula.\n\nCând adaugi și break-even sau ROI în aceeași analiza, imaginea comercială devine mult mai completă.",
    articleType: "comparison",
    relatedCategorySlug: "afaceri",
    relatedCalculatorKeys: ["profit-margin", "markup", "break-even"],
    relatedArticleSlugs: ["food-cost-explicat-pentru-horeca"],
    launchWave: "backlog",
  },
  {
    slug: "cum-calculezi-pragul-de-rentabilitate",
    title: "Cum calculezi pragul de rentabilitate și de ce merită să-l verifici înainte de orice forecast optimist",
    excerpt: "Break-even-ul îți arată când nu mai ești pe pierdere, iar asta îl face extrem de util în orice scenariu comercial simplu.",
    content: "Pragul de rentabilitate este unul dintre acele calcule care simplifică foarte bine o întrebare importanța: câte unități trebuie să vinzi până când îți acoperi costurile fixe. Din acest motiv este util în business, dar și în proiecte mici sau produse noi.\n\nFormula de baza pornește de la contribuția pe unitate, adica diferența dintre prețul de vânzare și costul variabil direct. Când această contribuție este mică, pragul urcă repede și modelul devine mai greu de susținut.\n\nBreak-even-ul nu spune totul despre business, dar este foarte bun ca filtru rapid. Îți arată dacă un scenariu are măcar o bază rezonabilă înainte să mergi mai departe în forecast-uri optimiste.\n\nÎn combinatie cu marja și ROI-ul, calculatorul devine și mai util. Un produs poate avea marja acceptabilă, dar să aibă nevoie de un volum greu de atins ca să iasă din pierdere.\n\nDe aceea, pentru orice decizie comercială, break-even-ul este unul dintre calculele centrale.",
    articleType: "guide",
    relatedCategorySlug: "afaceri",
    relatedCalculatorKeys: ["break-even", "profit-margin", "roi"],
    relatedArticleSlugs: ["marja-vs-markup-explicate-simplu"],
    launchWave: "backlog",
  },
  {
    slug: "cum-evaluezi-un-roi-fara-sa-fortezi-cifrele",
    title: "Cum evaluezi un ROI fără să forțezi cifrele doar ca să iasă bine pe hartie",
    excerpt: "ROI-ul este foarte util pentru comparații rapide, dar devine periculos dacă ignori timpul, riscul și costurile ascunse.",
    content: "ROI-ul este popular pentru că rezuma repede rentabilitatea unei investiții într-un singur procent. Tocmai de aceea este foarte util pentru comparații rapide între scenarii sau proiecte.\n\nProblema apare atunci când procentul este folosit fără context. Două investiții pot avea același ROI, dar una poate cere mult mai mult timp, risc sau capital blocat. În aceste cazuri, procentul singur devine prea simplificator.\n\nTotuși, ca prim filtru, ROI-ul este excelent. Îți arată profitul net raportat la suma investită și te ajută să respingi rapid scenarii slabe sau să compari opțiuni apropiate.\n\nPentru decizii mai bune, merită să îl folosești alături de marja, break-even și, uneori, cash flow. Așa obții nu doar un procent frumos, ci și o imagine mai stabilă asupra investiției.\n\nFolosește-l ca prim filtru rapid, apoi treci la marja și break-even pentru o imagine completă a deciziei.",
    articleType: "guide",
    relatedCategorySlug: "afaceri",
    relatedCalculatorKeys: ["roi", "break-even", "profit-margin"],
    relatedArticleSlugs: ["cum-calculezi-pragul-de-rentabilitate"],
    launchWave: "backlog",
  },
  {
    slug: "cum-calculezi-procentele-corect",
    title: "Cum calculezi procentele corect fără să incurci baza, diferența și rezultatul final",
    excerpt: "Procentele par simple, dar cele mai multe erori apar când aplici formula la valoarea greșită.",
    content: "Procentele apar peste tot: la discounturi, TVA, bonusuri, creșterea preturilor sau comparații între perioade. Tocmai pentru că par atât de familiare, mulți utilizatori sar direct la rezultat și aplică formula pe baza greșită.\n\nPrima întrebare importanța este întotdeauna: procent din ce? Uneori cauți procent dintr-o sumă, alteori vrei diferența procentuală între două valori, iar alteori vrei să afli valoarea inițială dintr-un rezultat final. Toate par apropiate, dar nu folosesc aceeași logica.\n\nUn calculator bun de procente nu înseamnă doar o operație matematica. Înseamnă și claritate: unde este baza, ce reprezintă procentul și ce vrei să obții efectiv din calcul. Când aceste trei lucruri sunt clare, restul devine ușor.\n\nPentru utilizatorii de pe toolnet, zona de procente este și o poartă foarte bună spre alte calcule financiare: TVA, discount, economii sau comparații de preț. De aceea merită tratată ca hub util, nu doar ca o pagină izolată.\n\nDacă vrei rezultate curate, regulă simplă este asta: verifică mai întâi baza și abia apoi procentul. Cele mai multe greșeli se rezolvă exact aici.",
    articleType: "guide",
    relatedCategorySlug: "finante",
    relatedCalculatorKeys: ["percentage-of-number", "percentage-change", "reverse-percentage"],
    relatedArticleSlugs: ["procent-din-numar-vs-diferenta-procentuala"],
    launchWave: "backlog",
  },
  {
    slug: "procent-din-numar-vs-diferenta-procentuala",
    title: "Procent din număr vs diferența procentuală: două calcule care par la fel, dar răspund la întrebări diferite",
    excerpt: "Unul îți spune cât înseamnă un procent aplicat unei valori, iar celălalt îți arată cu cât s-a schimbat o valoare față de baza inițială.",
    content: "Confuzia dintre procent din număr și diferența procentuală este una dintre cele mai frecvente în calculele de zi cu zi. La prima vedere, ambele implica procente și două valori, dar întrebarea la care răspund este diferită.\n\nCând calculezi procent din număr, aplici o pondere peste o valoare de baza. Exemplul clasic este TVA-ul sau un comision: 19% din 1.500 lei înseamnă 285 lei. Când calculezi diferența procentuală, compari o valoare noua cu una inițială și vrei să vezi ritmul de creștere sau scădere.\n\nAici apare eroarea tipica: oamenii amestecă între ele baza și rezultatul. În practică, asta poate duce la promoții interpretate greșit, comparații financiare slabe sau rapoarte care par mai bune ori mai rele decât sunt în realitate.\n\nPe un hub de calculatoare, aceste două pagini trebuie să stea una lângă altă tocmai pentru că utilizatorul se mișcă natural între ele. Dacă începe cu procente simple, ajunge repede la discount, TVA sau procent invers.\n\nÎn concluzie, întrebarea corectă este mai importanța decât formula. Dacă știi dacă vrei pondere, comparație sau valoare inițială, alegi imediat calculatorul potrivit.",
    articleType: "comparison",
    relatedCategorySlug: "finante",
    relatedCalculatorKeys: ["percentage-of-number", "percentage-change", "reverse-percentage"],
    relatedArticleSlugs: ["cum-calculezi-procentele-corect"],
    launchWave: "backlog",
  },
  {
    slug: "cum-calculezi-discountul-real",
    title: "Cum calculezi discountul real și de ce procentul afișat nu spune mereu toată povestea",
    excerpt: "Promotiile sună bine în procente, dar decizia bună vine din prețul final și din comparația cu baza reală.",
    content: "Discountul este unul dintre cele mai căutate calcule comerciale pentru că pare foarte simplu și foarte intuitiv. Totuși, în practică, utilizatorii se pot lasa pacaliti ușor de felul în care este prezentat procentul.\n\nUn discount de 20% este relevant doar dacă știi prețul inițial real și poți compara prețul final cu alternativele. Dacă baza inițială este umflata sau dacă apar costuri suplimentare, procentul în sine devine mai puțin important.\n\nCalculatorul de discount are rolul bun de a transformă procentul într-o sumă concretă. Asta ajută mult în achiziții, oferte, pricing intern și verificarea rapidă a unei promoții. Pentru firme mici, utilitatea este la fel de clară în negociere sau în scenarii de marja.\n\nLegatura cu procent invers și TVA este firească. Uneori nu vrei doar prețul final, ci și prețul de plecare sau comparația între net și brut. De aceea merită să îl folosești împreună cu celelalte calculatoare financiare, nu izolat.\n\nPe scurt, discountul real nu se judecă doar după procentul afișat. Se judecă după baza folosită, suma economisita și prețul final obtinut.",
    articleType: "guide",
    relatedCategorySlug: "finante",
    relatedCalculatorKeys: ["discount", "reverse-percentage", "percentage-of-number"],
    relatedArticleSlugs: ["cum-calculezi-procentele-corect"],
    launchWave: "backlog",
  },
  {
    slug: "tva-inclus-vs-tva-exclus",
    title: "TVA inclus vs TVA exclus: cum gândești corect când treci de la net la brut și înapoi",
    excerpt: "TVA-ul pare banal până când lucrezi cu suma greșită. Diferența dintre net și brut merită inteleasa clar.",
    content: "TVA-ul este un calcul simplu doar până în momentul în care nu mai știi dacă suma de la care pleci este netă sau brută. Exact aici apar multe erori practice, mai ales în oferte, facturi și comparații rapide de preț.\n\nDacă pleci de la suma fără TVA, ai nevoie de calculatorul clasic de TVA. Dacă pleci de la totalul cu TVA inclus, trebuie să lucrezi invers și să separi componenta fiscală de baza netă. Cele două scenarii folosesc formule diferite și nu se pot amesteca.\n\nPentru utilizatori individuali, asta înseamnă prețuri și comparații mai curate. Pentru firme mici, înseamnă verificări mai rapide și mai puține confuzii în lucru zilnic.\n\nTVA-ul e util tocmai pentru că răspunde repede, dar îți da și claritatea de care ai nevoie. Nu vrei doar o cifră, ci și certitudinea că lucrezi cu suma corectă.\n\nDe aceea merită să tratăm netul și brutul ca două pagini surori și să le legăm natural de procente, discount și calcule comerciale.",
    articleType: "comparison",
    relatedCategorySlug: "finante",
    relatedCalculatorKeys: ["vat", "reverse-vat", "percentage-of-number"],
    relatedArticleSlugs: ["cum-calculezi-procentele-corect"],
    launchWave: "backlog",
  },
  {
    slug: "cum-functioneaza-dobanda-compusa",
    title: "Cum funcționează dobânda compusă și de ce timpul este mai important decât pare la prima vedere",
    excerpt: "Dobânda compusă nu înseamnă doar randament. Înseamnă și timp, constantă și reinvestirea castigurilor.",
    content: "Dobânda compusă este unul dintre conceptele financiare care par simple în formulă, dar capătă cu adevărat sens abia când vezi efectul lor în timp. Ideea de bază este că nu câștigi doar dobândă la suma inițială, ci și la dobânda deja acumulată.\n\nDe aici vine puterea reală a capitalizării. O diferență mică de rată sau de perioadă poate schimba semnificativ valoarea finală, mai ales când vorbim despre mulți ani. Tocmai de aceea timpul contează uneori mai mult decât pare la început.\n\nCalculatorul de dobândă compusă este util pentru investiții, depozite sau planificări orientative. El nu promite un rezultat real, ci un model matematic curat pentru a înțelege mai bine scenariul.\n\nÎn practică, merită legat de economii lunare și obiective financiare. Mulți utilizatori nu investesc o sumă unică, ci construiesc treptat un plan. Iar acolo dobânda compusă devine și mai interesantă.\n\nPe scurt, randamentul contează, dar constanța și timpul fac diferența mare. Asta este ideea centrală pe care calculatorul trebuie să o lase clară.",
    articleType: "guide",
    relatedCategorySlug: "finante",
    relatedCalculatorKeys: ["compound-interest", "monthly-savings", "savings-goal"],
    relatedArticleSlugs: ["cum-planifici-economii-lunare"],
    launchWave: "backlog",
  },
  {
    slug: "cum-planifici-economii-lunare",
    title: "Cum planifici economii lunare fără să îți setezi o țintă frumoasă, dar imposibil de susținut",
    excerpt: "Economisirea bună nu înseamnă doar ambiție, ci și un ritm lunar realist pe care îl poți ține luni sau ani.",
    content: "Economiile lunare par ușor de planificat până când încerci să le ții constant în viața reală. De aceea, primul pas util nu este o cifră spectaculoasă, ci un ritm care poate fi susținut pe termen lung.\n\nCalculatorul de economii lunare ajută exact aici: transformă o contribuție recurentă și un orizont de timp într-un total concret. Asta îl face foarte bun pentru obiective intermediare, fond de urgență sau achiziții planificate.\n\nCând adaugi și dobândă, apare motivația suplimentară. Utilizatorul vede că timpul și consistența produc efect cumulativ, nu doar simplă adunare a sumelor depuse.\n\nÎn același timp, nu merită să supraestimezi randamentul sau să subestimezi cât de greu este să economisești aceeași sumă în fiecare lună. Un scenariu moderat este adesea mai util decât unul optimist, dar greu de menținut.\n\nDe aceea pagina de economii lunare trebuie legată firesc de dobândă compusă și de obiectiv economisire. Împreună formează un traseu bun de planificare personală.",
    articleType: "guide",
    relatedCategorySlug: "finante",
    relatedCalculatorKeys: ["monthly-savings", "savings-goal", "compound-interest"],
    relatedArticleSlugs: ["cum-functioneaza-dobanda-compusa"],
    launchWave: "backlog",
  },
  {
    slug: "cum-estimezi-un-obiectiv-de-economisire",
    title: "Cum estimezi un obiectiv de economisire pornind de la termen, nu doar de la suma dorită",
    excerpt: "Țintă finală este doar o parte din calcul. Ritmul lunar și termenul schimbă complet fezabilitatea planului.",
    content: "Mulți utilizatori pornesc de la suma pe care vor să o strângă și abia apoi descoperă că termenul ales face diferența dintre un plan realist și unul foarte tensionat. De aceea calculatorul de obiectiv economisire este util tocmai pentru această verificare rapidă.\n\nDacă știi suma finală și perioada, poți vedea imediat ritmul lunar necesar. Apoi poți ajusta termenul, dobânda sau valoarea țintei până când planul devine sustenabil.\n\nUtilitatea reală nu sta doar în contribuția lunară afișată, ci te ajută să gândești mai realist relația dintre dorință, timp și disciplină financiară. Pentru un avans, un fond de urgență sau o achiziție mare, asta contează mult.\n\nLegătura cu economiile lunare și dobânda compusă este naturală. Uneori pleci de la ritmul lunar și vezi unde ajungi; alteori pleci de la țintă și vezi cât trebuie să pui deoparte.\n\nDe aceea merită să îl folosești împreună cu economiile lunare și dobânda compusă, nu izolat.",
    articleType: "guide",
    relatedCategorySlug: "finante",
    relatedCalculatorKeys: ["savings-goal", "monthly-savings", "compound-interest"],
    relatedArticleSlugs: ["cum-planifici-economii-lunare"],
    launchWave: "backlog",
  },
  {
    slug: "cum-citesti-rata-lunară-la-un-credit",
    title: "Cum citești rata lunară la un credit fără să te uiți doar la suma de plata din fiecare luna",
    excerpt: "Rata lunară spune ceva important, dar costul total și dobânda acumulată spun de obicei și mai mult.",
    content: "Rata lunară este de obicei primul număr la care se uită cineva când compară un credit. Este firesc, pentru că afectează direct bugetul lunar. Dar dacă te oprești doar aici, riști să ratezi costul total al deciziei.\n\nCalculatorul de rată credit este util pentru că pune împreună trei lucruri: suma împrumutată, perioada și dobânda. Din ele rezultă nu doar rata lunară, ci și costul total și dobânda plătită în timp.\n\nAsta schimbă perspectiva. Uneori o rată lunară mai mică poate ascunde un cost total mult mai mare dacă perioada este foarte lungă. De aceea comparația bună nu se face pe un singur număr.\n\nÎn plus, utilizatorul câștigă context și pentru alte decizii: merită să scurteze perioada, să crească avansul sau să economisească mai mult înainte de credit? Aici apar legăturile naturale cu obiectivele de economisire și cu dobânda compusă.\n\nUn calculator bun de rată nu înlocuiește oferta concretă a băncii, dar este excelent ca filtru rapid și ca instrument de claritate înainte de pasul următor.",
    articleType: "guide",
    relatedCategorySlug: "finante",
    relatedCalculatorKeys: ["loan-payment", "monthly-savings", "compound-interest"],
    relatedArticleSlugs: ["cum-estimezi-un-obiectiv-de-economisire"],
    launchWave: "backlog",
  },
  {
    slug: "cum-calculezi-cresterea-salariala-corect",
    title: "Cum calculezi creșterea salarială corect fără să compari două sume scoase din context",
    excerpt: "O creștere salarială bună nu înseamnă doar un procent frumos. Contează și baza de comparație, bonusurile și programul de lucru.",
    content: "Creșterea salarială pare simplă până când începi să compari oferte diferite, beneficii neuniforme și structuri de plata care nu seamana între ele.\n\nDe aceea, primul pas util nu este doar să vezi cu cât crește suma finală în lei, ci să transformi diferența într-un procent clar și să o pui în context. O creștere de 1.000 lei poate însemna foarte mult într-un scenariu și relativ puțin în altul, în funcție de baza de la care pleci.\n\nCalculatorul de creștere salarială este valoros tocmai pentru că reduce zgomotul. Îți arată rapid diferența absolută și diferența procentuală, iar de acolo poți continua cu tariful orar, cu venitul anual sau cu analiza brut versus net.\n\nAsta contează mai ales când compari un job nou, o renegociere sau o schimbare de rol. Uneori două oferte apropiate ca suma lunară se simt foarte diferit după ce iei în calcul timpul lucrat, bonusurile sau taxarea efectivă.\n\nPrivită corect, creșterea salarială nu este doar un număr. Este un semnal care te ajută să decizi dacă merită să negociezi, să accepti oferta sau să compari mai multe scenarii înainte de următorul pas.",
    articleType: "guide",
    relatedCategorySlug: "salarii-si-taxe",
    relatedCalculatorKeys: ["salary-increase", "hourly-rate", "annual-income"],
    relatedArticleSlugs: ["cum-transformi-salariul-lunar-in-tarif-orar"],
    launchWave: "backlog",
    releaseBatch: "batch-05",
    audience: "both",
  },
  {
    slug: "cum-transformi-salariul-lunar-in-tarif-orar",
    title: "Cum transformi salariul lunar în tarif orar fără să ignori orele reale lucrate",
    excerpt: "Tariful orar devine util doar dacă pornești de la numărul real de ore, nu de la o lună idealizată.",
    content: "Tariful orar este unul dintre cele mai utile repere atunci când vrei să compari două oferte, să înțelegi valoarea unei zile de lucru sau să transformi un venit lunar într-o cifră mai ușor de discutat.\n\nProblema apare atunci când folosești un număr generic de ore, fără să te uiți la luna concretă sau la programul real. Diferența dintre 160 și 184 de ore poate schimba semnificativ concluzia, mai ales dacă folosești tariful orar pentru comparații comerciale sau de cariera.\n\nCalculatorul de tarif orar ar trebui folosit împreună cu cel de ore lucrate pe luna. Unul îți arată reperul pe ora, celălalt te ajută să validezi baza de calcul. Abia după aceea poți interpreta corect dacă diferența dintre două oferte este cu adevărat relevantă.\n\nAcest lucru este util și pentru firme, nu doar pentru persoane. Managerii compară uneori costuri interne, freelanceri sau proiecte pornind tocmai de la un tarif orar orientativ.\n\nTariful orar nu înlocuiește toate nuantele unui pachet de compensare, dar este un punct excelent de clarificare atunci când vrei să compari mere cu mere, nu sume lunare scoase din context.",
    articleType: "guide",
    relatedCategorySlug: "salarii-si-taxe",
    relatedCalculatorKeys: ["hourly-rate", "monthly-work-hours", "salary-increase"],
    relatedArticleSlugs: ["cate-ore-lucrezi-intr-o-luna-de-fapt"],
    launchWave: "backlog",
    releaseBatch: "batch-05",
    audience: "both",
  },
  {
    slug: "cate-ore-lucrezi-intr-o-luna-de-fapt",
    title: "Câte ore lucrezi într-o lună de fapt și de ce răspunsul contează mai mult decât pare",
    excerpt: "Numărul de ore lucrate schimbă comparația dintre oferte, tarife și așteptări de volum. Iată cum îl folosești corect.",
    content: "Mulți utilizatori pornesc de la ideea ca o lună înseamnă același număr de ore de fiecare data. În practică, zilele lucrătoare variază, iar asta schimbă imediat orice comparație care depinde de timpul efectiv lucrat.\n\nCalculatorul de ore lucrate pe luna este foarte simplu, dar tocmai de aceea util. El îți oferă baza de care ai nevoie pentru a transformă salariul într-un tarif orar, pentru a compară două programe sau pentru a înțelege mai bine volumul lunar de munca.\n\nÎn plus, este un calculator bun pentru decizii de planning. Dacă știi câte ore apar în luna curentă, poți construi mai realist scenarii despre venit, cost orar sau distributia timpului între activitati.\n\nMerită totuși să privești rezultatul cu un pic de prudentă. Turele, orele suplimentare, concediile sau zilele libere suplimentare pot schimba imaginea finală.\n\nAcest calculator funcționează și mai bine când îl combini cu tariful orar, venitul anual și creșterea salarială. Singur e simplu; împreună cu celelalte devine un reper foarte util pentru decizie.",
    articleType: "explainer",
    relatedCategorySlug: "salarii-si-taxe",
    relatedCalculatorKeys: ["monthly-work-hours", "hourly-rate", "annual-income"],
    relatedArticleSlugs: ["cum-transformi-salariul-lunar-in-tarif-orar"],
    launchWave: "backlog",
    releaseBatch: "batch-05",
    audience: "both",
  },
  {
    slug: "cum-citesti-diferenta-dintre-brut-net-si-taxare-efectiva",
    title: "Cum citești diferența dintre brut, net și taxare efectivă fără să tragi concluzii greșite",
    excerpt: "Brutul, netul și diferența dintre ele spun lucruri utile, dar nu înseamnă automat același lucru.",
    content: "Diferența dintre brut și net este una dintre cele mai frecvente surse de confuzie atunci când cineva compară oferte, vrea să înțeleagă cât rămâne efectiv disponibil sau încearcă să explice o rată aparent mare de taxare.\n\nCalculatorul de taxare efectivă este util pentru că face vizibila distanța dintre cele două valori. El îți arată suma absolută care se pierde pe traseu și procentul orientativ pe care această îl reprezintă din brut.\n\nTotuși, merită să nu supralicitezi interpretarea. Taxarea efectivă te ajută să vezi diferența dintre două numere, dar nu îți spune automat întreaga poveste fiscală din spate. De aceea este bun pentru orientare rapidă, nu pentru consultanta fiscală sau de payroll.\n\nCa instrument de decizie, valoarea lui este mare în două situații: când compari mai multe variante salariale și când vrei să înțelegi mai clar de ce două sume brute apropiate se simt diferit după taxare.\n\nPusa în context, diferența brut-net devine mai ușor de folosit împreună cu venitul anual, tariful orar și creșterea salarială. În felul acesta nu rămâi doar cu un procent, ci cu o imagine mai bună despre valoarea reală a unui pachet de compensare.",
    articleType: "guide",
    relatedCategorySlug: "salarii-si-taxe",
    relatedCalculatorKeys: ["effective-tax-rate", "salary-increase", "annual-income"],
    relatedArticleSlugs: ["cum-estimezi-venitul-anual-fara-sa-amesteci-bonusurile-cu-salariul"],
    launchWave: "backlog",
    releaseBatch: "batch-05",
    audience: "both",
  },
  {
    slug: "cum-estimezi-venitul-anual-fara-sa-amesteci-bonusurile-cu-salariul",
    title: "Cum estimezi venitul anual fără să amesteci bonusurile cu salariul lunar",
    excerpt: "Venitul anual clarifică mult mai bine comparatiile atunci când bonusurile și lunile suplimentare fac parte din pachet.",
    content: "Venitul lunar este util pentru ritmul zilnic al bugetului, dar nu este întotdeauna suficient atunci când vrei să compari două oferte sau să planifici realist anul următor.\n\nÎn multe cazuri apar bonusuri, prime, a 13-a luna sau alte componente care schimbă imaginea finală. Dacă le amesteci direct cu salariul lunar, comparația devine mai confuza, nu mai clară.\n\nCalculatorul de venit anual este folositor tocmai pentru că separă aceste elemente și le aduce la un numitor comun: totalul pe an. Din acel moment devine mai ușor să compari două scenarii salariale, două roluri sau două structuri diferite de compensare.\n\nMai mult, venitul anual este un punct de pornire bun și pentru planificare. Îl poți conecta de creșterea salarială, de taxare efectivă sau de obiective financiare mai mari.\n\nUtilitatea reală nu sta doar în totalul afișat. Te ajută să compari mai corect și să vezi dincolo de suma lunară afișată prima data într-o ofertă.",
    articleType: "guide",
    relatedCategorySlug: "salarii-si-taxe",
    relatedCalculatorKeys: ["annual-income", "salary-increase", "effective-tax-rate"],
    relatedArticleSlugs: ["cum-calculezi-cresterea-salariala-corect"],
    launchWave: "backlog",
    releaseBatch: "batch-05",
    audience: "both",
  },
  {
    slug: "cum-afli-ce-rata-iti-permiti-fara-sa-iti-blochezi-bugetul",
    title: "Cum afli ce rata îți permiti fără să îți blochezi bugetul încă din prima luna",
    excerpt: "Rata suportabilă nu înseamnă doar cât aprobă banca, ci și cât poți duce realist fără să-ti strangulezi restul bugetului.",
    content: "Când oamenii caută ce rata își permit, tentația firească este să se uite direct la suma maximă pe care o pot obține. În practică, ordinea bună este inversă: începi de la bugetul lunar și abia apoi vezi ce suma finanțabilă rezulta.\n\nCalculatorul de rata maximă suportabilă este util exact pentru acest pas. El îți arată rapid ce spațiu există între venit, ratele deja existente și pragul de îndatorare pe care îl consideri acceptabil.\n\nAsta contează mult pentru că o rată aprobata nu este întotdeauna și o rată confortabila. Diferența dintre cele două se vede de obicei după cateva luni, când apar cheltuieli neplanificate sau când bugetul începe să devină prea rigid.\n\nDe aceea, pagina trebuie citită împreună cu gradul de îndatorare, cu avansul și cu costul total al creditului. Doar așa treci de la o cifră frumoasă pe hartie la o decizie sustenabilă.\n\nPe scurt, întrebarea corectă nu este doar câte lei pot imprumuta, ci cât îmi permit să platesc lunar fără să stric restul echilibrului financiar.",
    articleType: "guide",
    relatedCategorySlug: "credite-si-economii",
    relatedCalculatorKeys: ["credit-affordability", "debt-to-income", "down-payment"],
    relatedArticleSlugs: ["cum-citesti-costul-total-al-unui-credit"],
    launchWave: "backlog",
    releaseBatch: "batch-06",
    audience: "both",
  },
  {
    slug: "cum-citesti-costul-total-al-unui-credit",
    title: "Cum citești costul total al unui credit fără să te uiți doar la rata lunară",
    excerpt: "Rata lunară contează, dar costul total este cel care îți arată cât plătești de fapt pentru finanțare.",
    content: "Rata lunară este primul număr care atrage atenția atunci când compari două credite. Este firesc, pentru că afecteaza direct bugetul din fiecare luna. Dar dacă te opresti doar aici, poți rata imaginea de ansamblu.\n\nCalculatorul de cost total credit are exact rolul de a muta atenția de la cifra lunară la prețul complet al deciziei. El te ajută să vezi cât plătești în total și cât reprezintă dobânda acumulată în timp.\n\nAsta este important pentru că o perioadă mai lungă poate coborî rata lunară, dar poate ridica puternic costul final. De aceea, comparația bună nu se face pe un singur număr, ci pe relatia dintre rata, perioada și suma totală plătită.\n\nPagina merită legată de refinanțare, avans și rata maximă suportabilă. Așa utilizatorul poate trece de la o simplă simulare la un traseu mai realist de decizie.\n\nConcluzia utilă este simplă: rata lunară îți spune dacă poți intra în scenariu, dar costul total îți spune dacă merită cu adevărat să rămâi în el.",
    articleType: "guide",
    relatedCategorySlug: "credite-si-economii",
    relatedCalculatorKeys: ["loan-total-cost", "credit-affordability", "refinance-savings"],
    relatedArticleSlugs: ["cand-merita-refinantarea-si-cand-doar-pare-o-idee-buna"],
    launchWave: "backlog",
    releaseBatch: "batch-06",
    audience: "both",
  },
  {
    slug: "cand-merita-refinantarea-si-cand-doar-pare-o-idee-buna",
    title: "Când merită refinanțarea și când doar pare o idee bună pentru că rata lunară scade",
    excerpt: "O rata noua mai mică nu înseamnă automat refinanțare bună. Merită să vezi și costul mutării și timpul de recuperare.",
    content: "Refinanțarea sună bine aproape de fiecare data când rata lunară scade. Problema este ca o parte din atractivitatea ei vine din faptul ca ne uitam la un singur număr și ignoram restul contextului.\n\nCalculatorul de economie refinanțare este util tocmai pentru că pune în aceeași imagine diferența de rata, lunile ramase și costul refinanțării. Asta te ajută să vezi nu doar dacă economisești în teorie, ci și în cât timp recuperezi costul mutării.\n\nUneori refinanțarea merită clar. Alteori scăderea lunară este prea mică, perioada ramasa este prea scurtă sau costul inițial este prea mare ca să mai faca sens.\n\nDe aceea pagina trebuie legată de cost total credit și de gradul de îndatorare. O refinanțare bună nu înseamnă doar o rată mai mică, ci un echilibru mai bun între bugetul lunar și costul total rămas.\n\nDacă vrei decizie bună, uită-te întotdeauna la trei lucruri: economia lunară, economia netă după costuri și lunile în care îți recuperezi mutarea.",
    articleType: "guide",
    relatedCategorySlug: "credite-si-economii",
    relatedCalculatorKeys: ["refinance-savings", "loan-total-cost", "debt-to-income"],
    relatedArticleSlugs: ["cum-citesti-costul-total-al-unui-credit"],
    launchWave: "backlog",
    releaseBatch: "batch-06",
    audience: "both",
  },
  {
    slug: "cum-iti-construiesti-fondul-de-urgenta-fara-sa-ramai-fara-lichiditati",
    title: "Cum îți construiești fondul de urgență fără să rămâi fără lichiditati pentru restul obiectivelor",
    excerpt: "Fondul de urgență trebuie să-ti dea stabilitate, nu să-ti blocheze complet restul planului financiar.",
    content: "Fondul de urgență este una dintre cele mai utile idei financiare simple, tocmai pentru că transformă nesiguranta într-o marjă de respirație. Problema apare atunci când utilizatorul aude o regulă generală, dar nu o traduce într-o sumă concretă și realistă.\n\nCalculatorul de fond de urgență face exact acest pas: pornește de la cheltuielile esențiale și îți arată ce suma are sens să urmărești în funcție de numărul de luni de acoperire dorit.\n\nAsta contează pentru că fondul de urgență nu este același lucru cu economiile pentru vacanță, avans sau investiții. Rolul lui este lichiditatea și stabilitatea, nu randamentul maxim.\n\nÎn același timp, nu merită să construiești fondul într-un mod care sufoca complet restul planului financiar. De aceea merită legat de obiectivele de economisire și de evoluția economiilor în timp.\n\nPe scurt, fondul de urgență bun este suficient de mare încât să te ajute în perioade grele, dar suficient de bine planificat încât să nu-ti blocheze complet celelalte decizii importante.",
    articleType: "guide",
    relatedCategorySlug: "credite-si-economii",
    relatedCalculatorKeys: ["emergency-fund", "goal-timeline", "savings-interest"],
    relatedArticleSlugs: ["cum-planifici-economii-pe-termen-lung-pentru-obiective-mari"],
    launchWave: "backlog",
    releaseBatch: "batch-06",
    audience: "both",
  },
  {
    slug: "cum-planifici-economii-pe-termen-lung-pentru-obiective-mari",
    title: "Cum planifici economii pe termen lung pentru obiective mari fără să te bazezi doar pe optimism",
    excerpt: "Când obiectivul este mare, ai nevoie de ritm, termen și un scenariu mai realist decât pare la prima vedere.",
    content: "Obiectivele financiare mari par descurajante tocmai pentru că distanța dintre situația actuală și suma finală este mare. Din acest motiv, mulți oameni ori nu incep deloc, ori pornesc cu un plan prea optimist ca să fie sustenabil.\n\nCalculatorul de termen pentru obiectiv de economisire și cel de dobânda economii ajută exact aici. Unul îți spune în cât timp ajungi la țintă, celălalt îți arată cum se schimbă rezultatul când adaugi constantă și randament.\n\nValoarea lor reală nu este doar în cifra finală, ci în faptul ca îți permit să schimbi ușor variabilele și să vezi ce este realist. Poate că nu trebuie să dublezi contribuția lunară; poate este suficient să extinzi termenul sau să separi mai clar obiectivele.\n\nMerită să le folosești împreună cu calculatorul de fond de urgență și cel de economii pentru pensie, ca să vezi intreg tabloul financiar, nu doar o bucată din el.\n\nUn plan bun de economisire pe termen lung nu este cel mai spectaculos din prima zi, ci cel pe care îl poți ține și ajustă fără să te rupi de realitate după primele luni.",
    articleType: "guide",
    relatedCategorySlug: "credite-si-economii",
    relatedCalculatorKeys: ["goal-timeline", "savings-interest", "retirement-savings"],
    relatedArticleSlugs: ["cum-iti-construiesti-fondul-de-urgenta-fara-sa-ramai-fara-lichiditati"],
    launchWave: "backlog",
    releaseBatch: "batch-06",
    audience: "both",
  },
  {
    slug: "leasing-vs-credit-cum-compari-corect-doua-scenarii-de-finantare",
    title: "Leasing vs credit: cum compari corect două scenarii de finanțare fără să te blochezi în rata lunară",
    excerpt: "Leasingul și creditul pot părea apropiate la nivel de rata, dar costul total și flexibilitatea contează la fel de mult.",
    content: "Comparația dintre leasing și credit este una dintre cele mai interesante pentru că ambele produse pot rezolva aceeași nevoie, dar o fac în moduri diferite. De aceea utilizatorul nu are nevoie doar de o formulă, ci de o comparație structurata bine.\n\nCalculatorul de leasing vs credit face un prim pas bun: pune în aceeași imagine avansul, rata lunară, perioada și costul final. Astfel vezi rapid care scenariu este mai ieftin în forma lui cea mai simplă.\n\nTotuși, o decizie bună nu se oprește aici. În practică intervin fiscalitatea, proprietatea finală, valoarea reziduală, flexibilitatea operațională și profilul utilizatorului. Exact de aceea pagina trebuie construita ca instrument de comparație inițială, nu ca verdict unic.\n\nDe aici merită să continui natural cu costul total al creditului, avansul și rata suportabilă, ca să vezi toată imaginea, nu doar comparația inițială.\n\nDacă vrei să compari corect două scenarii de finanțare, începe cu costul total, dar nu uită să citești și ce tip de obligație îți asumi pe toată perioada contractului.",
    articleType: "comparison",
    relatedCategorySlug: "credite-si-economii",
    relatedCalculatorKeys: ["lease-vs-loan", "loan-total-cost", "down-payment"],
    relatedArticleSlugs: ["cum-citesti-costul-total-al-unui-credit"],
    launchWave: "backlog",
    releaseBatch: "batch-06",
    audience: "both",
  },
  {
    slug: "cum-citesti-roas-fara-sa-confunzi-venitul-cu-profitul",
    title: "Cum citești ROAS fără să confunzi venitul cu profitul real",
    excerpt: "ROAS-ul este util, dar fără marja și costuri poate arata mai bine decât realitatea. Iată cum îl folosești corect.",
    content: "ROAS-ul este unul dintre cei mai atragatori indicatori din marketing pentru că promite un răspuns simplu: cât venit a generat fiecare leu investit în ads. Problema este ca simplu nu înseamnă întotdeauna suficient.\n\nCalculatorul ROAS te ajută să vezi repede raportul dintre venit și buget. Dar decizia bună apare abia atunci când legi rezultatul de marja, de costurile de fulfilment, de retururi și de diferența dintre venit și profit.\n\nUn ROAS de 4 poate părea excelent. Dacă marja disponibilă după costurile directe este mică, campania poate totuși să fie sub break-even. De aceea paginile de business trebuie să lege ROAS-ul de break-even ROAS, CAC și profit.\n\nCel mai bun mod de a folosi acest calculator este ca filtru de prima lectura. El îți spune dacă merită să cercetezi mai departe, nu dacă ai deja verdictul final.\n\nConcluzia practică este simplă: ROAS-ul este bun pentru orientare rapidă, dar profitul real apare doar când pui lângă el marja și costul complet al modelului tău comercial.",
    articleType: "guide",
    relatedCategorySlug: "afaceri",
    relatedCalculatorKeys: ["roas", "break-even-roas", "gross-profit"],
    relatedArticleSlugs: ["break-even-roas-explicat-pentru-campanii-platite"],
    launchWave: "backlog",
    releaseBatch: "batch-07",
    audience: "business",
  },
  {
    slug: "break-even-roas-explicat-pentru-campanii-platite",
    title: "Break-even ROAS explicat pentru campanii platite fără să forțezi concluziile",
    excerpt: "Află ce prag minim trebuie să atinga o campanie ca să nu piardă bani la marja ta reală.",
    content: "Break-even ROAS-ul este unul dintre cei mai practici indicatori pentru echipele care vor să scape de interpretările prea optimiste ale performanței. El traduce marja într-un prag minim de ROAS.\n\nCalculatorul de break-even ROAS te ajută să răspunzi la o întrebare simplă: de la ce punct în sus campania începe să aibă sens economic? Asta este mult mai valoros decât să spui vag ca ai un ROAS bun sau rău.\n\nDacă marja este subtire, pragul de break-even urcă. Dacă marja este generoasa, campaniile au mai mult spațiu de manevra. Din acest motiv, același ROAS poate fi excelent într-un business și insuficient în altul.\n\nPagina trebuie legată natural de profit brut, venit țintă și ROAS real. Așa utilizatorul poate merge de la un prag teoretic la o comparație practică între scenariul minim necesar și performanța curentă.\n\nConcluzia bună este ca break-even ROAS-ul nu este un KPI spectaculos, dar este unul dintre cele mai utile pentru disciplină decizionala.",
    articleType: "explainer",
    relatedCategorySlug: "afaceri",
    relatedCalculatorKeys: ["break-even-roas", "roas", "target-revenue"],
    relatedArticleSlugs: ["cum-citesti-roas-fara-sa-confunzi-venitul-cu-profitul"],
    launchWave: "backlog",
    releaseBatch: "batch-07",
    audience: "business",
  },
  {
    slug: "cum-calculezi-cac-si-cpl-fara-sa-amesteci-canalele",
    title: "Cum calculezi CAC și CPL fără să amesteci canalele, perioadele și definitiile",
    excerpt: "CAC și CPL sunt utile doar dacă definesti corect costurile, lead-urile și clientii noi. Altfel comparația te poate induce în eroare.",
    content: "CAC și CPL sunt doi indicatori aparent simpli, dar foarte ușor de distorsionat în practică. Cele mai multe probleme apar atunci când compari campanii diferite, perioade diferite sau lead-uri definite diferit.\n\nCalculatorul CPL îți arată costul unui lead. Calculatorul CAC îți spune cât te costa un client nou. Între cele două există mereu o zonă de conversie, iar acolo apar multe dintre interpretările greșite.\n\nDacă un canal genereaza lead-uri ieftine dar slab calificate, CPL-ul poate părea excelent, în timp ce CAC-ul rămâne slab. Invers, un canal mai scump la nivel de lead poate genera clienți mai repede și mai predictibil.\n\nCel mai bun mod de a folosi aceste calcule este în pereche, cu aceeași fereastra de timp și cu aceeași logica de atribuire. Doar așa poți vedea dacă problema este în volum, în calitate sau în procesul comercial.\n\nConcluzia practică este ca nici CAC, nici CPL nu merită citite separat. Abia împreună spun ceva util despre eficiență reală a cresterii.",
    articleType: "guide",
    relatedCategorySlug: "afaceri",
    relatedCalculatorKeys: ["cac", "cpl", "conversion-rate"],
    relatedArticleSlugs: ["aov-si-rata-de-conversie-ce-spun-impreuna-despre-funnel"],
    launchWave: "backlog",
    releaseBatch: "batch-07",
    audience: "business",
  },
  {
    slug: "aov-si-rata-de-conversie-ce-spun-impreuna-despre-funnel",
    title: "AOV și rata de conversie: ce spun împreună despre funnel, nu doar separat",
    excerpt: "Valoarea medie a comenzii și rata de conversie devin cu adevărat utile când sunt citite împreună.",
    content: "AOV-ul și rata de conversie sunt doi indicatori care par separati, dar în realitate descriu același traseu comercial din unghiuri diferite. Unul îți spune cât valorează o comandă, celălalt cât de des ajunge traficul la comanda.\n\nDacă AOV-ul crește, dar conversia cade, venitul poate rămâne pe loc. Dacă rata de conversie crește, dar AOV-ul scade puternic, rezultatul final poate fi la fel de dezamagitor. De aceea cele două merită citite în pereche.\n\nCalculatorul AOV este bun pentru a înțelege structura venitului pe comanda. Calculatorul de conversie este bun pentru a înțelege eficiență funnel-ului. Împreună, ele spun o poveste comercială mult mai bună decât oricare luat singur.\n\nPagina merită legată și de ROAS sau CAC atunci când traficul este plătit, pentru că acolo fiecare imbunatatire în AOV sau conversie se vede direct în economie și scalare.\n\nConcluzia practică este simplă: dacă vrei decizii bune, nu intreba doar cât vinzi sau cât de des vinzi, ci și cum lucrează cele două împreună.",
    articleType: "guide",
    relatedCategorySlug: "afaceri",
    relatedCalculatorKeys: ["aov", "conversion-rate", "roas"],
    relatedArticleSlugs: ["cum-calculezi-cac-si-cpl-fara-sa-amesteci-canalele"],
    launchWave: "backlog",
    releaseBatch: "batch-07",
    audience: "business",
  },
  {
    slug: "cum-estimezi-targetul-de-venit-si-profitul-real",
    title: "Cum estimezi targetul de venit și profitul real fără să construiești pe marje prea optimiste",
    excerpt: "Venitul țintă pare simplu, dar depinde de marja reală și de costurile pe care chiar le incluzi în calcul.",
    content: "Când spui ca vrei un anumit venit luna viitoare, de fapt spui ca vrei să acoperi costuri, să susții marketingul și să rămâi cu un anumit profit. De aceea venitul țintă trebuie construit pornind de la marja și costuri, nu ales arbitrar.\n\nCalculatorul de venit țintă este util pentru că transformă această logica într-o cifră clară. El pornește de la costurile fixe, profitul dorit și marja disponibilă, iar apoi îți arată ce nivel de venit trebuie să atingi.\n\nAici apare și capcana cea mai frecvența: folosirea unei marje prea generoase. Dacă marja este idealizată, tot planul comercial va părea mai ușor decât este în realitate. De aceea merită să pui alături și profitul brut, profitul net și break-even ROAS-ul.\n\nPagina este foarte bună pentru businessuri mici, ecommerce sau servicii care au nevoie de un reper rapid între obiectiv și execuție. Ea muta discuția de la intuiție la constrangere reală.\n\nConcluzia practică este ca targetul bun de venit nu pornește din ambiție, ci din structura economică a businessului.",
    articleType: "guide",
    relatedCategorySlug: "afaceri",
    relatedCalculatorKeys: ["target-revenue", "gross-profit", "net-profit"],
    relatedArticleSlugs: ["break-even-roas-explicat-pentru-campanii-platite"],
    launchWave: "backlog",
    releaseBatch: "batch-07",
    audience: "business",
  },
  {
    slug: "rotatia-stocului-explicata-pentru-ecommerce-si-retail",
    title: "Rotația stocului explicată pentru ecommerce și retail fără formule inutile",
    excerpt: "Rotația stocului arată cât de repede transformi marfă în vânzări și cât capital rămâne blocat în stoc.",
    content: "Rotația stocului este una dintre cele mai subestimate formule în businessurile care vand produse fizice. Mulți se uită doar la venit sau la volum, fără să observe cât capital rămâne blocat în marfă.\n\nCalculatorul de rotație stoc îți arată de câte ori se rotește stocul într-o perioadă și câte zile rămâne, în medie, marfă în depozit. Asta este extrem de util pentru ecommerce, retail sau distribuție.\n\nIndicatorul nu trebuie citit izolat. O rotație foarte mare poate însemna eficiență, dar și risc de rupturi de stoc. O rotație mică poate însemna selectie slabă, forecast prost sau capital imobilizat inutil.\n\nCel mai bun mod de a folosi pagina este împreună cu venitul țintă și profitul. Așa poți vedea dacă viteza stocului susține obiectivele comerciale sau le saboteaza discret prin capital blocat și lichiditate slabă.\n\nConcluzia practică este ca stocul nu este doar inventar. Este cash care se mișcă mai repede sau mai greu, iar rotația îți arată exact asta.",
    articleType: "explainer",
    relatedCategorySlug: "afaceri",
    relatedCalculatorKeys: ["inventory-turnover", "target-revenue", "gross-profit"],
    relatedArticleSlugs: ["cum-estimezi-targetul-de-venit-si-profitul-real"],
    launchWave: "backlog",
    releaseBatch: "batch-07",
    audience: "business",
  },
  {
    slug: "cum-citesti-factura-de-curent-fara-sa-te-pierzi-in-detalii-inutile",
    title: "Cum citești factura de curent fără să te pierzi în detalii inutile",
    excerpt: "Factura pare complicată, dar pentru decizie îți trebuie cateva repere clare: consum, preț efectiv și cost anual.",
    content: "Factura de curent sperie mulți utilizatori pentru că adună consum, tarife, componente fixe și tot felul de denumiri care par mai tehnice decât sunt în practică. Totuși, pentru o decizie bună, nu ai nevoie să memorezi tot documentul. Ai nevoie să vezi cateva repere clare.\n\nCalculatorul de factura de curent te ajută să legi consumul lunar de prețul efectiv pe kWh și de costul total aproximativ. Asta este mult mai util decât să rămâi doar cu impresia ca factura a crescut sau a scăzut.\n\nPagina trebuie legată și de consumul aparatelor, pentru că de acolo începe controlul real. Dacă nu știi cine consumă, factura rămâne doar o surpriză recurentă. Dacă înțelegi consumul de baza, poți construi scenarii mai bune: reducere, mutare de consum, panouri sau echipamente mai eficiente.\n\nConcluzia bună este simplă: factura nu trebuie interpretată ca un document opac, ci ca un rezumat al relației dintre consum, tarif și obiceiuri de utilizare.",
    articleType: "guide",
    relatedCategorySlug: "energie-pentru-casa",
    relatedCalculatorKeys: ["monthly-electricity-bill", "appliance-electricity-cost", "solar-payback"],
    relatedArticleSlugs: ["cum-estimezi-consumul-real-al-electrocasnicelor-din-casa"],
    launchWave: "backlog",
    releaseBatch: "batch-08",
    audience: "consumer",
  },
  {
    slug: "cum-estimezi-consumul-real-al-electrocasnicelor-din-casa",
    title: "Cum estimezi consumul real al electrocasnicelor din casă fără să te bazezi doar pe eticheta",
    excerpt: "Puterea din specificații nu spune singură totul. Contează și timpul de folosire, ciclurile și comportamentul real al aparatului.",
    content: "Când oamenii vor să înțeleagă de ce factura de curent pare mare, primul reflex este să caute aparatul vinovat. Asta este o intuiție bună, dar problema este ca eticheta tehnică nu spune singură povestea completă.\n\nCalculatorul de consum al aparatului electric transformă puterea în cost, dar doar după ce legi cifra de orele reale de utilizare. Aici apare adevarata diferența între puterea maximă scrisa pe produs și consumul efectiv din fiecare zi.\n\nFrigiderul nu funcționează la maxim tot timpul, iar un aparat de aer condiționat poate avea consum foarte diferit în funcție de izolație, temperatura cerută și durata de funcționare. De aceea merită să folosești calculatorul ca instrument de scenarii, nu ca verdict absolut.\n\nPagina trebuie legată de factura de curent și de zona de panouri fotovoltaice. Odată ce vezi unde se duce energia, devine mult mai ușor să alegi dacă merită reducere de consum, schimbare de aparat sau producție proprie.\n\nConcluzia practică este ca un aparat nu consumă doar cât scrie pe eticheta. Consumă cât îl lași să lucreze în casa ta reală.",
    articleType: "guide",
    relatedCategorySlug: "energie-pentru-casa",
    relatedCalculatorKeys: ["appliance-electricity-cost", "monthly-electricity-bill", "solar-system-size"],
    relatedArticleSlugs: ["cum-citesti-factura-de-curent-fara-sa-te-pierzi-in-detalii-inutile"],
    launchWave: "backlog",
    releaseBatch: "batch-08",
    audience: "consumer",
  },
  {
    slug: "cate-panouri-fotovoltaice-iti-trebuie-de-fapt",
    title: "Câte panouri fotovoltaice îți trebuie de fapt, pornind din consumul real al casei",
    excerpt: "Numărul de panouri nu se ghiceste. El se leagă de consum, producție specifică și nivelul de acoperire dorit.",
    content: "Întrebarea despre numărul de panouri este una dintre cele mai frecvente în zona fotovoltaică, dar răspunsul bun nu pornește din acoperiș, ci din consumul casei. Dacă nu știi ce vrei să acoperi, orice număr de panouri rămâne doar o presupunere.\n\nCalculatorul de necesar sistem și cel de număr panouri funcționează bine împreună. Primul traduce consumul anual în kWp, iar al doilea transformă kWp în panouri și suprafață ocupată.\n\nAici apare și prima capcana: dorința de a acoperi 100% din consum din prima. Uneori scenariile de 70-90% sunt mai realiste și mai bune economic. În plus, orientarea, umbrirea și spațiul util pot schimba repede concluzia inițială.\n\nPagina trebuie legată și de producția fotovoltaică și de amortizare. Numărul de panouri este doar o piesă dintr-un traseu mai mare care trebuie să ajunga la producție și economie reală.\n\nConcluzia practică este ca întrebarea bună nu este doar câte panouri încap, ci câte panouri au sens pentru consumul și obiectivul tău.",
    articleType: "guide",
    relatedCategorySlug: "energie-pentru-casa",
    relatedCalculatorKeys: ["solar-system-size", "solar-panel-count", "solar-production"],
    relatedArticleSlugs: ["cum-estimezi-productia-fotovoltaica-fara-promisiuni-umflate"],
    launchWave: "backlog",
    releaseBatch: "batch-08",
    audience: "consumer",
  },
  {
    slug: "cum-estimezi-productia-fotovoltaica-fara-promisiuni-umflate",
    title: "Cum estimezi producția fotovoltaică fără promisiuni umflate și cifre prea optimiste",
    excerpt: "Producția anuală poate fi estimată bine, dar merită citită ca scenariu, nu ca promisiune fixă.",
    content: "Producția fotovoltaică este unul dintre acele numere care poate arata foarte convingator în prezentari comerciale. Tocmai de aceea merită citită cu disciplină. Un calculator bun îți da un scenariu util, nu o promisiune rigidă.\n\nCalculatorul de producție fotovoltaică pornește din kWp instalati și din producția specifică estimată. Asta îl face foarte bun pentru comparații rapide. Totuși, orientarea, umbrirea, înclinarea și pierderile reale ale sistemului pot schimba rezultatul față de scenariul idealizat.\n\nDe aceea, pagina trebuie legată de necesarul sistemului, de numărul de panouri și de amortizare. Producția singură spune cât ai putea produce. Nu spune automat dacă investiția are sens sau dacă acoperișul este potrivit.\n\nPentru decizii mai atente, merită folosit ulterior și un instrument precum PVGIS. Dar pentru traseul editorial al site-ului nostru, calculatorul este foarte bun ca punct de start și comparație.\n\nConcluzia practică este ca producția fotovoltaică este o estimare foarte valoroasa, atâta timp cât nu o transformi din start în promisiune garantată.",
    articleType: "explainer",
    relatedCategorySlug: "energie-pentru-casa",
    relatedCalculatorKeys: ["solar-production", "solar-system-size", "solar-payback"],
    relatedArticleSlugs: ["cate-panouri-fotovoltaice-iti-trebuie-de-fapt"],
    launchWave: "backlog",
    releaseBatch: "batch-08",
    audience: "consumer",
  },
  {
    slug: "cum-citesti-amortizarea-unui-sistem-fotovoltaic",
    title: "Cum citești amortizarea unui sistem fotovoltaic fără să cazi în optimism ușor",
    excerpt: "Anii de amortizare sunt utili, dar doar dacă vezi și ce ipoteze stau în spatele lor.",
    content: "Amortizarea este cifra care atrage instant atenția atunci când discuți despre panouri fotovoltaice. Este firesc: ea pare să raspunda direct la întrebarea dacă merită sau nu investiția. Dar răspunsul bun depinde de ipoteze.\n\nCalculatorul de amortizare traduce costul net și economiile anuale într-un număr de ani. Asta este util pentru comparații rapide. Însă rezultatul devine credibil doar dacă economiile sunt estimate realist și dacă iei în calcul mentenanță, granturile și scenariile prudente de autoconsum.\n\nPagina trebuie legată de factura de curent, producție și necesarul sistemului. Doar așa utilizatorul poate vedea dacă amortizarea vine dintr-un sistem potrivit sau dintr-o presupunere prea optimistă.\n\nCea mai frecvența eroare este să folosești un preț al energiei mereu crescator și o producție mereu excelenta. În practică, merită să compari și un scenariu mediu și unul conservator.\n\nConcluzia practică este ca amortizarea este un indicator bun, dar numai dacă îl citești ca scenariu economic, nu ca promisiune simplificată.",
    articleType: "guide",
    relatedCategorySlug: "energie-pentru-casa",
    relatedCalculatorKeys: ["solar-payback", "monthly-electricity-bill", "solar-production"],
    relatedArticleSlugs: ["cum-estimezi-productia-fotovoltaica-fara-promisiuni-umflate"],
    launchWave: "backlog",
    releaseBatch: "batch-08",
    audience: "consumer",
  },
  {
    slug: "cum-alegi-btu-ul-potrivit-pentru-aer-conditionat",
    title: "Cum alegi BTU-ul potrivit pentru aer condiționat fără să supradimensionezi inutil",
    excerpt: "BTU-ul trebuie legat de camera reală, nu doar de o regulă rapidă memorata dintr-un forum.",
    content: "Când alegi un aparat de aer condiționat, tentația este să cauți o regulă rapidă și să o aplici direct. Problema este ca două camere cu aceeași suprafață pot avea nevoi foarte diferite dacă diferă inaltimea, insorirea sau izolația.\n\nCalculatorul BTU este util pentru că te forțează să pui în același loc dimensiunea camerei și contextul termic. Asta te ajută să nu alegi nici un aparat prea slab, nici unul exagerat de mare.\n\nPagina merită legată de consumul aparatului și de costul energiei. Mulți utilizatori aleg o putere prea mare din frica de subdimensionare, apoi descopera ca eficiență și confortul nu sunt neapărat mai bune.\n\nCel mai bun rezultat apare când folosești calculatorul ca punct de orientare, apoi validezi modelul în funcție de locuință și regimul real de folosire.\n\nConcluzia practică este ca BTU-ul bun nu vine dintr-o regulă universala, ci dintr-o cameră reală citită corect.",
    articleType: "guide",
    relatedCategorySlug: "energie-pentru-casa",
    relatedCalculatorKeys: ["ac-btu", "appliance-electricity-cost", "heating-load"],
    relatedArticleSlugs: ["centrala-vs-pompa-de-caldura-cum-compari-corect-costurile"],
    launchWave: "backlog",
    releaseBatch: "batch-08",
    audience: "consumer",
  },
  {
    slug: "centrala-vs-pompa-de-caldura-cum-compari-corect-costurile",
    title: "Centrala vs pompa de căldură: cum compari corect costurile și necesarul termic",
    excerpt: "Comparația bună pornește din necesarul termic și din costul real de operare, nu din impresii generale despre tehnologie.",
    content: "Comparația dintre centrala și pompa de căldură este adesea condusa de opinii puternice și prea puține cifre. Tocmai de aceea merită să pornești din necesarul termic și din scenariul real al casei tale.\n\nCalculatorul de necesar de căldură și cel de dimensionare a pompei de căldură te ajută să vezi ce putere are sens. Fără acest pas, orice comparație de echipament este fragilă.\n\nApoi intervine costul de operare. Aici merită legată pagina de factura de curent și, în anumite scenarii, de panouri fotovoltaice. Pentru unii utilizatori, comparația nu este doar între două surse de căldură, ci între două modele de cost și autonomie.\n\nNu există un răspuns universal. Există doar scenarii bine sau prost construite. Cu cât ipotezele sunt mai aproape de casa reală, cu atât decizia finală va fi mai bună.\n\nConcluzia practică este ca alegerea corectă începe din necesar și cost, nu din marketing sau preferinta pentru o tehnologie.",
    articleType: "comparison",
    relatedCategorySlug: "energie-pentru-casa",
    relatedCalculatorKeys: ["heating-load", "heat-pump-size", "monthly-electricity-bill"],
    relatedArticleSlugs: ["cum-alegi-btu-ul-potrivit-pentru-aer-conditionat"],
    launchWave: "backlog",
    releaseBatch: "batch-08",
    audience: "consumer",
  },
  {
    slug: "cand-merita-o-baterie-fotovoltaica-si-cand-doar-creste-costul",
    title: "Când merită o baterie fotovoltaică și când doar crește costul fără să aducă suficientă valoare",
    excerpt: "Bateria este utilă în anumite scenarii, dar nu trebuie tratată ca upgrade automat al oricarui sistem fotovoltaic.",
    content: "Bateria fotovoltaică este una dintre cele mai atractive piese din ecosistemul solar pentru că promite autonomie și backup. Problema este că nu orice casa și nu orice profil de consum o justifică economic.\n\nCalculatorul de baterie fotovoltaică este util pentru că transformă ideea generală de backup într-o capacitate concretă. Asta te ajută să vezi rapid dacă vorbești de un plus rezonabil sau de un buget care schimbă complet proiectul.\n\nPagina trebuie citită împreună cu producția fotovoltaică și cu amortizarea. Dacă sistemul produce bine, dar consumul nu este sincronizat sau backup-ul real necesar este mic, bateria poate adăuga cost fără să aducă suficientă valoare.\n\nPe de altă parte, pentru unii utilizatori backup-ul înseamnă continuitate și liniste, nu doar economie. De aceea merită separată decizia economică de decizia funcțională.\n\nConcluzia practică este ca bateria merită când răspunde unei nevoi reale de autoconsum sau backup. În rest, poate doar să prelungeasca amortizarea întregului sistem.",
    articleType: "comparison",
    relatedCategorySlug: "energie-pentru-casa",
    relatedCalculatorKeys: ["solar-battery-size", "solar-production", "solar-payback"],
    relatedArticleSlugs: ["cum-citesti-amortizarea-unui-sistem-fotovoltaic"],
    launchWave: "backlog",
    releaseBatch: "batch-08",
    audience: "consumer",
  },
  {
    slug: "cat-consuma-un-frigider-in-realitate-si-cum-citesti-corect-eticheta",
    title: "Cât consumă un frigider în realitate și cum citești corect eticheta",
    excerpt: "Frigiderul merge permanent, dar consumul real nu se citește doar dintr-un singur număr de pe eticheta.",
    content: "Frigiderul este unul dintre putinii consumatori care lucrează practic în fiecare zi a anului. Tocmai de aceea merită tratat separat atunci când vrei să înțelegi factura de curent. Problema este ca mulți utilizatori fie îl subestimează, fie trag concluzii prea rapide doar din eticheta energetică.\n\nCalculatorul de consum frigider te ajută să pornești de la un consum zilnic mediu și să-l transformi în cost lunar și anual. Asta este mult mai util pentru buget decât o valoare abstractă pe care nu o legi de prețul real al energiei.\n\nEticheta este utilă, dar nu suficientă. Temperatura din bucatarie, cât de des se deschide usa, încărcarea frigiderului și vechimea aparatului pot muta destul de mult consumul față de scenariul ideal.\n\nPagina trebuie legată de factura de curent și de calculatorul generic de aparat electric. Așa utilizatorul poate vedea dacă frigiderul este doar un cost de baza rezonabil sau unul dintre factorii care merită reevaluati.\n\nConcluzia practică este ca frigiderul nu este un cost spectaculos de moment, ci un consum permanent care merită citit corect în timp.",
    articleType: "guide",
    relatedCategorySlug: "energie-pentru-casa",
    relatedCalculatorKeys: ["fridge-electricity-cost", "monthly-electricity-bill", "appliance-electricity-cost"],
    relatedArticleSlugs: ["cum-estimezi-consumul-real-al-electrocasnicelor-din-casa"],
    launchWave: "backlog",
    releaseBatch: "batch-09",
    audience: "consumer",
  },
  {
    slug: "cat-consuma-un-boiler-electric-si-cand-devine-o-problema-in-factura",
    title: "Cât consumă un boiler electric și când devine o problemă reală în factura",
    excerpt: "Apa caldă pare un cost inevitabil, dar boilerul poate conta mult mai mult decât te aștepți în consumul lunar.",
    content: "Boilerul electric este unul dintre acei consumatori care trec ușor neobservati pentru că sunt asociati cu confortul de baza al casei. Totuși, când vrei să înțelegi factura, apa caldă merită tratată separat.\n\nCalculatorul de consum pentru boiler leagă energia de volumul de apa, diferența de temperatura și frecvența de utilizare. Asta este important pentru că aici formula spune mai mult decât simplă putere a aparatului.\n\nÎn multe case, problema nu este doar boilerul în sine, ci combinația dintre temperatura setata, izolarea vasului, numărul de cicluri și obiceiurile de consum. Tocmai de aceea un scenariu realist este mai util decât o presupunere rapidă.\n\nPagina trebuie legată de factura lunară și de calculatorul generic de aparat electric. Așa utilizatorul poate vedea rapid dacă boilerul este doar un cost firesc sau unul care merită optimizat.\n\nConcluzia practică este ca boilerul poate fi un consumator surprinzător de mare atunci când este folosit intens și setat prea sus față de nevoia reală.",
    articleType: "guide",
    relatedCategorySlug: "energie-pentru-casa",
    relatedCalculatorKeys: ["boiler-electricity-cost", "monthly-electricity-bill", "appliance-electricity-cost"],
    relatedArticleSlugs: ["cum-citesti-factura-de-curent-fara-sa-te-pierzi-in-detalii-inutile"],
    launchWave: "backlog",
    releaseBatch: "batch-09",
    audience: "consumer",
  },
  {
    slug: "cat-consuma-aerul-conditionat-pe-zi-si-pe-luna",
    title: "Cât consumă aerul condiționat pe zi și pe luna fără să confundam BTU-ul cu costul",
    excerpt: "BTU-ul explică racirea, dar factura apare din puterea absorbită și din timpul real de funcționare.",
    content: "Când oamenii caută informații despre aer condiționat, de multe ori amestecă două întrebări diferite: de cât BTU au nevoie și cât îi va costa să folosească aparatul. Ambele sunt importante, dar răspunsul vine din calcule diferite.\n\nCalculatorul de consum pentru aer condiționat pornește din puterea absorbită și din durata de folosire. Asta îl face foarte bun pentru buget. Calculatorul BTU, în schimb, te ajută să alegi capacitatea potrivită pentru camera.\n\nCele două pagini trebuie legate între ele pentru că o alegere bună de capacitate poate influenta și costul final. Un aparat prost dimensionat poate merge mai mult, mai ineficient sau mai inconfortabil decât unul ales corect.\n\nConcluzia practică este ca BTU-ul spune ce aparat îți trebuie, iar consumul îți spune cât te costa să-l folosești. Abia împreună duc la o decizie bună.",
    articleType: "guide",
    relatedCategorySlug: "energie-pentru-casa",
    relatedCalculatorKeys: ["ac-electricity-cost", "ac-btu", "monthly-electricity-bill"],
    relatedArticleSlugs: ["cum-alegi-btu-ul-potrivit-pentru-aer-conditionat"],
    launchWave: "backlog",
    releaseBatch: "batch-09",
    audience: "consumer",
  },
  {
    slug: "cum-calculezi-economia-reala-din-becuri-led",
    title: "Cum calculezi economia reală din becuri LED fără să supraestimezi beneficiul",
    excerpt: "LED-urile economisesc aproape mereu, dar ritmul real al economiei depinde de cât de mult folosești lumina.",
    content: "Schimbarea becurilor clasice cu LED este unul dintre cele mai simple upgrade-uri energetice dintr-o casă. Tocmai de aceea este și foarte ușor să devii prea optimist în calcule.\n\nCalculatorul de economie LED leagă puterea veche, puterea noua, numărul de becuri și timpul real de utilizare. Asta este exact ce trebuie ca să transformi promisiunea generală de economie într-o sumă reală.\n\nDacă folosești lumina puțin, recuperarea durează mai mult. Dacă ai multe becuri sau zone iluminate des, efectul se vede repede. De aceea pagina este mai utilă când este legată de factura de curent și de alte surse de consum din casă.\n\nConcluzia practică este ca LED-ul este de obicei o idee bună, dar meritul lui real se vede când îl pui într-un scenariu concret de utilizare, nu într-o estimare vagă.",
    articleType: "guide",
    relatedCategorySlug: "energie-pentru-casa",
    relatedCalculatorKeys: ["led-savings", "monthly-electricity-bill", "appliance-electricity-cost"],
    relatedArticleSlugs: ["cum-citesti-factura-de-curent-fara-sa-te-pierzi-in-detalii-inutile"],
    launchWave: "backlog",
    releaseBatch: "batch-09",
    audience: "consumer",
  },
  {
    slug: "cata-suprafata-de-acoperis-iti-trebuie-pentru-panouri",
    title: "Câtă suprafață de acoperiș îți trebuie pentru panouri fără să supraestimezi spațiul util",
    excerpt: "Suprafață totală a acoperișului nu înseamnă automat suprafață utilă pentru panouri.",
    content: "Mulți utilizatori pornesc de la ideea ca, dacă au un acoperiș mare, pot instala automat un sistem fotovoltaic mare. În practică, spațiul util este aproape mereu mai mic decât suprafață totală.\n\nCalculatorul de suprafață pentru panouri este util pentru că transformă metrul pătrat disponibil în număr de panouri și putere maximă instalabila. Asta te ajută să vezi rapid dacă obiectivul de producție este realist sau nu.\n\nUmbrele, forma acoperișului, distanțele de siguranță și zonele greu utilizabile pot reduce destul de mult spațiul efectiv. De aceea merită să folosești rezultatul ca reper, nu ca proiect final.\n\nConcluzia practică este ca întrebarea bună nu este doar cât acoperiș ai, ci cât acoperiș util ai pentru sistemul dorit.",
    articleType: "guide",
    relatedCategorySlug: "energie-pentru-casa",
    relatedCalculatorKeys: ["solar-roof-area", "solar-panel-count", "solar-system-size"],
    relatedArticleSlugs: ["cate-panouri-fotovoltaice-iti-trebuie-de-fapt"],
    launchWave: "backlog",
    releaseBatch: "batch-09",
    audience: "consumer",
  },
  {
    slug: "cum-alegi-corect-puterea-invertorului-fotovoltaic",
    title: "Cum alegi corect puterea invertorului fotovoltaic fără să o tratezi ca pe o simplă formalitate",
    excerpt: "Invertorul nu este doar o piesă din oferta. Dimensiunea lui influențează echilibrul întregului sistem.",
    content: "Când oamenii se gândesc la un sistem fotovoltaic, discuția merge repede spre panouri și producție. Invertorul pare uneori doar o bifă tehnică. În realitate, el este o piesă centrala în echilibrul sistemului.\n\nCalculatorul de putere pentru invertor fotovoltaic te ajută să pornești din puterea DC a sistemului și din raportul DC/AC. Asta nu îți da proiectul final, dar îți oferă un reper foarte bun pentru comparații și pentru discutii mai bine informate.\n\nUn invertor ales prost poate limita inutil sistemul sau poate crea un proiect ineficient economic. Tocmai de aceea pagina trebuie legată de necesarul sistemului și de producția estimată.\n\nConcluzia practică este ca invertorul nu se alege la final, doar din oferta cea mai convenabilă. Se alege ca parte din logica întregului sistem.",
    articleType: "guide",
    relatedCategorySlug: "energie-pentru-casa",
    relatedCalculatorKeys: ["solar-inverter-size", "solar-system-size", "solar-production"],
    relatedArticleSlugs: ["cum-estimezi-productia-fotovoltaica-fara-promisiuni-umflate"],
    launchWave: "backlog",
    releaseBatch: "batch-09",
    audience: "consumer",
  },
  {
    slug: "autoconsum-vs-injectare-ce-conteaza-cu-adevarat-la-un-sistem-fv",
    title: "Autoconsum vs injectare: ce contează cu adevărat la un sistem fotovoltaic",
    excerpt: "Producția mare nu spune singură povestea. Contează și cât folosești direct din ea, nu doar cât produci.",
    content: "Una dintre cele mai importante diferențe în zona fotovoltaică este cea dintre producție și autoconsum. Mulți utilizatori se concentreaza doar pe kWh produsi, dar economia reală vine puternic și din cât folosești direct în casa.\n\nCalculatorul de autoconsum fotovoltaic este util pentru că separă energia folosită direct de energia injectată. Asta muta discuția din zona de entuziasm generic în zona de comportament real de consum.\n\nPentru unii utilizatori, un sistem care produce bine, dar are autoconsum slab, nu este neapărat la fel de interesant economic precum pare la prima vedere. Tocmai de aceea merită legat și de baterie, și de amortizare.\n\nConcluzia practică este ca producția spune cât poți avea, dar autoconsumul spune cât folosești cu adevărat în avantajul tău direct.",
    articleType: "comparison",
    relatedCategorySlug: "energie-pentru-casa",
    relatedCalculatorKeys: ["solar-self-consumption", "solar-battery-size", "solar-payback"],
    relatedArticleSlugs: ["cand-merita-o-baterie-fotovoltaica-si-cand-doar-creste-costul"],
    launchWave: "backlog",
    releaseBatch: "batch-09",
    audience: "consumer",
  },
  {
    slug: "cum-estimezi-backup-ul-pentru-ups-sau-baterie",
    title: "Cum estimezi backup-ul pentru UPS sau baterie fără să te bazezi pe autonomie imaginara",
    excerpt: "Autonomia reală depinde de sarcina, eficiență și energia disponibilă, nu doar de numărul mare de Ah din specificații.",
    content: "Backup-ul energetic pare simplu pe hartie: ai o baterie și ai autonomie. În practică, autonomia reală poate fi mult diferită față de ce își imagineaza utilizatorul.\n\nCalculatorul de autonomie UPS te ajută să pornești din tensiune, capacitate, sarcina și eficiență. Asta este exact ce lipsește în cele mai multe estimări intuitive.\n\nMarea capcana este supraestimarea autonomiei. Când nu iei în calcul eficiență și adancimea de descărcare, rezultatul pare aproape mereu mai bun decât realitatea. Tocmai de aceea pagina merită legată de bateria fotovoltaică și de consumul aparatelor.\n\nConcluzia practică este ca backup-ul bun nu se măsoară doar în Ah, ci în energia care chiar ajunge la sarcina de care îți pasa.",
    articleType: "guide",
    relatedCategorySlug: "energie-pentru-casa",
    relatedCalculatorKeys: ["ups-runtime", "solar-battery-size", "appliance-electricity-cost"],
    relatedArticleSlugs: ["cand-merita-o-baterie-fotovoltaica-si-cand-doar-creste-costul"],
    launchWave: "backlog",
    releaseBatch: "batch-09",
    audience: "consumer",
  },
  {
    slug: "cum-compari-costul-de-incalzire-intre-gaz-si-pompa-de-caldura",
    title: "Cum compari costul de încălzire între gaz și pompa de căldură fără să sari peste ipoteze",
    excerpt: "Comparația bună cere același necesar termic, tarife coerente și ipoteze apropiate de casa reală.",
    content: "Când compari gazul cu pompa de căldură, tentația este să iei două cifre de cost și să alegi varianta mai mică. În practică, comparația bună începe mult mai devreme: la necesarul termic al casei.\n\nCalculatorul de comparație a costului de încălzire este util pentru că raportează aceeași nevoie de căldură la două tehnologii diferite. Asta oferă un teren mult mai corect pentru decizie.\n\nDacă nu știi ce nevoie de căldură ai, orice comparație de cost rămâne fragilă. De aceea pagina trebuie legată de necesarul termic și de dimensionarea pompei de căldură.\n\nConcluzia practică este ca alegerea între gaz și pompa de căldură nu se face din simpatie pentru tehnologie, ci din nevoia reală a casei și din costul corect comparat.",
    articleType: "comparison",
    relatedCategorySlug: "energie-pentru-casa",
    relatedCalculatorKeys: ["heating-cost-comparison", "heating-load", "heat-pump-size"],
    relatedArticleSlugs: ["centrala-vs-pompa-de-caldura-cum-compari-corect-costurile"],
    launchWave: "backlog",
    releaseBatch: "batch-09",
    audience: "consumer",
  },
  {
    slug: "cat-co2-poti-evita-cu-un-sistem-fotovoltaic",
    title: "Cât CO2 poți evita cu un sistem fotovoltaic și cum citești corect această estimare",
    excerpt: "Impactul de mediu contează, dar trebuie citit ca estimare bazata pe producție și factorul de emisii folosit.",
    content: "Pentru unii utilizatori, investiția într-un sistem fotovoltaic nu este doar despre economie, ci și despre impact. De aici apare natural întrebarea despre cât CO2 poate fi evitat.\n\nCalculatorul de economie CO2 pentru panouri fotovoltaice este util pentru că transformă producția anuală într-o estimare simplificată de impact. Asta adaugă o lentilă diferită față de amortizare și cost.\n\nTotuși, factorul de emisii folosit este o ipoteză. El poate varia în funcție de mixul energetic și metodologia de calcul. De aceea merită să citești rezultatul ca reper comparativ, nu ca adevăr absolut.\n\nConcluzia practică este ca impactul de mediu poate completa foarte bine discuția despre investiție, dar ar trebui să stea lângă producție și amortizare, nu în locul lor.",
    articleType: "explainer",
    relatedCategorySlug: "energie-pentru-casa",
    relatedCalculatorKeys: ["solar-co2-savings", "solar-production", "solar-payback"],
    relatedArticleSlugs: ["cum-estimezi-productia-fotovoltaica-fara-promisiuni-umflate"],
    launchWave: "backlog",
    releaseBatch: "batch-09",
    audience: "consumer",
  },
  {
    slug: "cum-citesti-pretul-pe-mp-fara-sa-cazi-in-comparatii-false",
    title: "Cum citești prețul pe mp fără să cazi în comparații false între proprietăți",
    excerpt:
      "Prețul pe mp este util, dar numai dacă îl citești pe aceeași baza: suprafață, stare și configurație comparabilă.",
    content:
      "Prețul pe metru pătrat este unul dintre cele mai folosite repere din imobiliare pentru că simplifică foarte repede comparația. Problema apare atunci când două proprietăți par comparabile doar pe hartie, dar folosesc suprafețe diferite sau au configurații care schimbă complet lectura cifrei.\n\nCalculatorul de preț pe mp este util pentru că te forțează să pui aceeași formula peste mai multe variante. Asta te ajută să vezi mai repede dacă un apartament pare ieftin sau scump raportat la suprafață utilă reală.\n\nTotuși, un preț pe mp nu spune singur toată povestea. Compartimentarea, starea proprietății, etajul, anul constructiei, pozitionarea și costurile ulterioare pot schimba radical concluzia. De aceea pagina merită folosită împreună cu negocierea de preț și cu costul total de achiziție.\n\nConcluzia bună este simplă: prețul pe mp funcționează ca filtru inițial foarte bun, dar decizia reală apare abia când îl legi de restul scenariului.",
    articleType: "explainer",
    relatedCategorySlug: "imobiliare",
    relatedCalculatorKeys: ["price-per-sqm", "price-negotiation", "property-total-purchase-cost"],
    relatedArticleSlugs: ["ce-intra-de-fapt-in-bugetul-total-de-achizitie-al-unei-locuinte"],
    launchWave: "backlog",
    releaseBatch: "batch-10",
    audience: "both",
  },
  {
    slug: "ce-intra-de-fapt-in-bugetul-total-de-achizitie-al-unei-locuinte",
    title: "Ce intră de fapt în bugetul total de achiziție al unei locuințe",
    excerpt:
      "Prețul afișat nu este tot proiectul. Avansul, costurile de închidere, renovarea și mobilarea schimbă rapid bugetul real.",
    content:
      "Mulți cumpărători pornesc de la prețul locuinței și cred ca acela este bugetul principal. În practică, achiziția reală înseamnă și avans, costuri de închidere, renovare, mobilare și o rezervă minimă pentru surprizele care apar inevitabil.\n\nCalculatorul de cost total de achiziție este util pentru că pune în aceeași imagine prețul proprietății și costurile pe care le simți imediat după tranzacție. Astfel vezi mult mai repede dacă proiectul este sustenabil sau dacă ai comprimat prea mult rezervă.\n\nAici se vede de ce avansul și costul total nu trebuie citite separat. Un avans suportabil nu înseamnă automat și un proiect confortabil dacă după semnare rămâi fără spațiu pentru renovare, mobilare sau buffer de lichiditate.\n\nConcluzia practică este ca o achiziție bună nu este doar una pe care o poți semna, ci una pe care o poți absorbi financiar fără să rămâi blocat imediat după mutare.",
    articleType: "guide",
    relatedCategorySlug: "imobiliare",
    relatedCalculatorKeys: [
      "property-total-purchase-cost",
      "property-down-payment",
      "furniture-budget",
    ],
    relatedArticleSlugs: ["chirie-vs-cumparare-cum-compari-corect-doua-scenarii"],
    launchWave: "backlog",
    releaseBatch: "batch-10",
    audience: "both",
  },
  {
    slug: "chirie-vs-cumparare-cum-compari-corect-doua-scenarii",
    title: "Chirie vs cumpărare: cum compari corect două scenarii care par simple doar la suprafață",
    excerpt:
      "Comparația bună nu opune doar chiria unei rate. Trebuie să adaugi costul inițial, costurile recurente și flexibilitatea.",
    content:
      "Comparația dintre chirie și cumpărare este una dintre cele mai căutate pentru că promite un răspuns simplu la o decizie grea. În realitate, rata lunară nu este singurul element care contează, iar chiria nu este singurul cost al flexibilitatii.\n\nCalculatorul de chirie vs cumpărare este bun pentru că aduce într-un singur cadru costul inițial al cumpararii și costul lunar al locuirii. Asta îți arată rapid dacă scenariul de proprietate pare mai greu sau mai ușor de susținut pe perioada analizată.\n\nTotuși, comparația devine utilă doar dacă pui alături costurile recurente, bufferul lunar și orizontul de timp. Pentru unii utilizatori, flexibilitatea chiriei valorează mai mult. Pentru altii, stabilitatea și capitalizarea prin proprietate contează mai tare.\n\nConcluzia practică este că nu există răspuns universal. Există doar un scenariu pe care îl citești corect sau unul pe care îl simplifici prea devreme.",
    articleType: "comparison",
    relatedCategorySlug: "imobiliare",
    relatedCalculatorKeys: ["rent-vs-buy", "monthly-home-budget", "mortgage-buffer"],
    relatedArticleSlugs: ["cat-iti-mananca-locuinta-din-bugetul-lunar"],
    launchWave: "backlog",
    releaseBatch: "batch-10",
    audience: "both",
  },
  {
    slug: "cum-estimezi-un-buget-de-renovare-fara-optimism-periculos",
    title: "Cum estimezi un buget de renovare fără optimism periculos",
    excerpt:
      "Bugetul de renovare bun pornește din suprafață și cost/mp, dar devine realist abia după ce adaugi rezervă și fazele lucrării.",
    content:
      "Bugetul de renovare pare simplu cât timp îl reduci la o sumă intuitivă pe care ai vrea să o cheltui. În practică, formula bună pornește din suprafață, costul pe mp și o rezervă care să absoarba diferențele dintre estimare și santier.\n\nCalculatorul de buget renovare este util tocmai pentru că scoate discuția din zona de impresie și o duce într-o estimare repetabila. Când schimbi costul pe mp sau rezervă, vezi imediat cât se mișcă bugetul total.\n\nPartea importanța este să nu tratezi costul pe mp ca pe o promisiune rigidă. Finisajele, instalatiile, demolarile și ritmul executiei schimbă foarte repede cifra. De aceea pagina merită legată de costul total de achiziție și de bugetul de mobilare.\n\nConcluzia practică este ca renovarea bună se planifică cu marja, nu cu speranta ca totul va ieși exact cum ai pus în prima schița.",
    articleType: "guide",
    relatedCategorySlug: "imobiliare",
    relatedCalculatorKeys: [
      "renovation-budget",
      "property-total-purchase-cost",
      "furniture-budget",
    ],
    relatedArticleSlugs: ["cum-planifici-bugetul-de-mobilare-si-electrocasnice"],
    launchWave: "backlog",
    releaseBatch: "batch-10",
    audience: "both",
  },
  {
    slug: "cum-planifici-bugetul-de-mobilare-si-electrocasnice",
    title: "Cum planifici bugetul de mobilare și electrocasnice fără să îți manance toată rezervă",
    excerpt:
      "Mobilarea pare ultimul pas, dar poate consuma rapid un buget serios dacă nu o separi clar de renovare și de costurile inițiale.",
    content:
      "Dupa achiziție și renovare, mulți utilizatori trateaza mobilarea ca pe un detaliu care se va rezolva cumva din mers. În realitate, exact aici se sparg multe bugete care pareau suportabile pe hartie.\n\nCalculatorul de buget mobilare este util pentru că transformă numărul de camere, electrocasnicele și o marjă de rezervă într-o sumă clară. Asta te ajută să înțelegi dacă proiectul tău este complet finanțat sau doar partial imaginat.\n\nPartea bună a unui astfel de calcul nu este doar cifra finală, ci faptul ca separă clar mobilarea de renovare. Fără această separare, costul total al locuinței pare artificial mai mic, iar bufferul rămas pare mai confortabil decât este în realitate.\n\nConcluzia practică este ca mobilarea merită tratată ca proiect separat în aceeași decizie financiară, nu ca un cost vag care se va regla ulterior.",
    articleType: "guide",
    relatedCategorySlug: "imobiliare",
    relatedCalculatorKeys: [
      "furniture-budget",
      "property-total-purchase-cost",
      "monthly-home-budget",
    ],
    relatedArticleSlugs: ["ce-intra-de-fapt-in-bugetul-total-de-achizitie-al-unei-locuinte"],
    launchWave: "backlog",
    releaseBatch: "batch-10",
    audience: "both",
  },
  {
    slug: "cat-iti-mananca-locuinta-din-bugetul-lunar",
    title: "Cât îți mănâncă locuință din bugetul lunar și de ce rata singură nu spune destul",
    excerpt:
      "Bugetul lunar al locuinței înseamnă mai mult decât rata sau chiria. Utilitatile, administrarea și mentenanță schimbă imaginea reală.",
    content:
      "Cea mai comună eroare în compararea unei locuințe este să folosești doar rata sau chiria lunară ca reper principal. În practică, presiunea reală pe buget vine din totalul costurilor recurente, nu dintr-o singură linie a calculului.\n\nCalculatorul de buget lunar al locuinței este util pentru că adună într-un singur loc costul principal, utilitatile, administrarea, mentenanță și asigurarea. Asta îți arată mai repede ce trebuie să susții luna de luna, nu doar ce sună suportabil în anunț sau în discuția cu banca.\n\nAici intervine și calculatorul de buffer. O locuință nu este doar despre ce poți plăți, ci despre ce îți rămâne după ce ai plătit-o. Dacă spațiul rămas este prea mic, scenariul devine fragil chiar dacă formula inițială părea acceptabilă.\n\nConcluzia practică este ca locuință trebuie citită în buget ca sistem complet, nu ca un cost singular care arată bine separat de restul cheltuielilor.",
    articleType: "explainer",
    relatedCategorySlug: "imobiliare",
    relatedCalculatorKeys: ["monthly-home-budget", "mortgage-buffer", "rent-vs-buy"],
    relatedArticleSlugs: ["chirie-vs-cumparare-cum-compari-corect-doua-scenarii"],
    launchWave: "backlog",
    releaseBatch: "batch-10",
    audience: "both",
  },
  {
    slug: "cand-negocierea-pretului-schimba-cu-adevarat-afacerea",
    title: "Când negocierea prețului schimbă cu adevărat afacerea și când doar pare importanța",
    excerpt:
      "Un discount mic poate conta enorm sau aproape deloc, în funcție de bugetul total și de costurile care vin imediat după achiziție.",
    content:
      "Negocierea de preț are un farmec aparte pentru că este una dintre puținele zone în care utilizatorul simte ca poate schimba imediat cifra mare din tranzacție. Totuși, impactul real al negocierii nu este întotdeauna evident.\n\nCalculatorul de negociere te ajută să vezi rapid cât înseamnă în lei un discount aparent mic. Asta este deja valoros, pentru că muta discuția din procente abstracte în economie concretă.\n\nMai departe, contează să pui economia lângă costul total de achiziție. Uneori o reducere bună acoperă costuri de închidere sau parte din renovare. Alteori, desi sună bine, nu schimbă cu adevărat presiunea bugetara a proiectului.\n\nConcluzia practică este ca negocierea bună nu este doar cea mai mare, ci cea care muta semnificativ structura reală a bugetului tău.",
    articleType: "guide",
    relatedCategorySlug: "imobiliare",
    relatedCalculatorKeys: ["price-negotiation", "price-per-sqm", "property-total-purchase-cost"],
    relatedArticleSlugs: ["cum-citesti-pretul-pe-mp-fara-sa-cazi-in-comparatii-false"],
    launchWave: "backlog",
    releaseBatch: "batch-10",
    audience: "both",
  },
  {
    slug: "cat-spatiu-iti-trebuie-de-fapt-in-functie-de-familie-si-folosinta",
    title: "Cât spațiu îți trebuie de fapt în funcție de familie și folosința locuinței",
    excerpt:
      "Suprafață bună nu se citește doar în mp. Contează și numărul de persoane, camerele și felul în care folosești casa zi de zi.",
    content:
      "Când compari două proprietăți, reflexul natural este să te uiți la numărul de metri patrati. Problema este ca mp-îi singuri nu spun cât de bine funcționează spațiul pentru familia sau folosința ta reală.\n\nCalculatorul de spațiu pe persoana este util pentru că transformă suprafață și camerele într-un reper mai practic. Asta te ajută să compari mai coerent două variante care au configurații diferite, dar par apropiate la prima vedere.\n\nPentru unele gospodarii, flexibilitatea unei camere în plus valorează mai mult decât câțiva mp în plus. Pentru altele, zona de zi sau spațiul de lucru de acasă schimbă mai mult utilitatea decât numărul formal de camere.\n\nConcluzia practică este ca spațiul bun nu este doar cel mai mare, ci cel care răspunde cel mai bine ritmului tău real de locuire.",
    articleType: "explainer",
    relatedCategorySlug: "imobiliare",
    relatedCalculatorKeys: ["space-per-person", "price-per-sqm", "monthly-home-budget"],
    relatedArticleSlugs: ["cum-citesti-pretul-pe-mp-fara-sa-cazi-in-comparatii-false"],
    launchWave: "backlog",
    releaseBatch: "batch-10",
    audience: "both",
  },
  {
    slug: "cum-citesti-randamentul-din-chirie-fara-sa-ignori-costurile-ascunse",
    title: "Cum citești randamentul din chirie fără să ignori costurile ascunse",
    excerpt:
      "Randamentul brut arată repede, dar randamentul net spune mult mai bine ce rămâne după costurile reale ale proprietății.",
    content:
      "Randamentul din chirie este unul dintre cele mai folosite repere în investițiile imobiliare pentru că îți promite o comparație simplă între prețul proprietății și venitul anual. Problema este ca randamentul brut spune doar prima jumătate a povestii.\n\nCalculatorul de randament chirie este util tocmai pentru că separă randamentul brut de cel net. Astfel vezi imediat ce rămâne după costurile recurente pe care multe analize rapide le trec prea ușor cu vederea.\n\nAdministrarea, mentenanță, perioadele de neocupare și alte costuri aparent mici pot muta semnificativ concluzia finală. De aceea randamentul bun se citește doar împreună cu costurile recurente și cu ipoteza de ocupare.\n\nConcluzia practică este ca o proprietate interesanta nu este cea cu randament brut spectaculos pe hartie, ci cea al carei randament net rămâne coerent după ce adaugi frictiunea reală a exploatării.",
    articleType: "guide",
    relatedCategorySlug: "imobiliare",
    relatedCalculatorKeys: ["rental-yield", "service-charge-budget", "property-management-fee"],
    relatedArticleSlugs: ["cash-on-cash-return-explicat-pentru-investitii-imobiliare"],
    launchWave: "backlog",
    releaseBatch: "batch-11",
    audience: "both",
  },
  {
    slug: "cash-on-cash-return-explicat-pentru-investitii-imobiliare",
    title: "Cash-on-cash return explicat pentru investiții imobiliare fără jargon inutil",
    excerpt:
      "Acest indicator arată ce randament obții pe banii proprii blocați în proiect, nu pe valoarea totală a proprietății.",
    content:
      "Cash-on-cash return este util tocmai pentru că muta atenția de la prețul total al proprietății la capitalul propriu pe care îl blochezi efectiv. Pentru investitorii care folosesc credit sau combină mai multe surse de bani, acesta poate fi un reper mult mai clar decât randamentul clasic din chirie.\n\nCalculatorul este valoros fiindca pune față în față fluxul net anual și capitalul propriu investit. Asta te ajută să vezi dacă proiectul este bun pentru lichiditatea ta, nu doar pentru o analiză abstractă de randament.\n\nTotuși, indicatorul devine periculos dacă nu separi corect fluxul net de costurile reale sau dacă subestimezi capitalul propriu investit în avans, renovare și costuri inițiale. De aceea merită citit împreună cu bugetul total de achiziție și cu randamentul din chirie.\n\nConcluzia practică este ca acest indicator nu înlocuiește randamentul net, ci îl completează foarte bine atunci când decizia depinde de câți bani proprii ai blocați în proiect.",
    articleType: "explainer",
    relatedCategorySlug: "imobiliare",
    relatedCalculatorKeys: [
      "cash-on-cash-return",
      "property-total-purchase-cost",
      "rental-yield",
    ],
    relatedArticleSlugs: ["cum-citesti-randamentul-din-chirie-fara-sa-ignori-costurile-ascunse"],
    launchWave: "backlog",
    releaseBatch: "batch-11",
    audience: "both",
  },
  {
    slug: "cum-estimezi-pierderile-din-vacanta-la-o-proprietate-de-inchiriat",
    title: "Cum estimezi pierderile din vacanță la o proprietate de închiriat fără să îți sabotezi singur analiza",
    excerpt:
      "O proprietate raraori este ocupată perfect. Rata de neocupare contează direct în venitul real și în pragul de break-even.",
    content:
      "Una dintre cele mai optimiste ipoteze din analizele imobiliare este ocuparea perfecta. În practică, orice proprietate de închiriat are perioade mai bune și mai slabe, iar aceste goluri mănâncă direct din venitul real.\n\nCalculatorul de pierdere din vacanță este util pentru că transformă procentul de neocupare într-o sumă anuală ușor de înțeles. Asta îți arată repede cât de sensibil devine randamentul atunci când lași mai mult spațiu între chiriasi sau când piața merge mai lent.\n\nAici merită legată imediat și rata de ocupare break-even. Dacă pragul minim de ocupare este deja ridicat, orice vacanță mai lungă poate transforma un proiect aparent bun într-unul fragil.\n\nConcluzia practică este ca analiza prudentă pornește dintr-o neocupare realistă, nu din scenariul ideal în care proprietatea produce venit maxim în fiecare luna.",
    articleType: "guide",
    relatedCategorySlug: "imobiliare",
    relatedCalculatorKeys: ["vacancy-loss", "rental-break-even-occupancy", "rental-yield"],
    relatedArticleSlugs: ["cum-citesti-randamentul-din-chirie-fara-sa-ignori-costurile-ascunse"],
    launchWave: "backlog",
    releaseBatch: "batch-11",
    audience: "both",
  },
  {
    slug: "cum-proiectezi-cresterea-chiriei-fara-sa-fortezi-ipotezele",
    title: "Cum proiectezi creșterea chiriei fără să forțezi ipotezele doar ca să iasă randamentul mai bine",
    excerpt:
      "Creșterea chiriei poate îmbunătăți scenariul, dar doar dacă ipoteza rămâne credibila pentru piața reală și pentru proprietate.",
    content:
      "Proiectarea unei cresteri de chirie este tentanta pentru că face aproape orice scenariu să arate mai bine. Problema este ca o creștere prea optimistă poate cosmetiza un proiect mediocru și îl poate face să pară mai bun decât este.\n\nCalculatorul de creștere chirie este util pentru că arată clar ce înseamnă o anumită rata anuală în termeni de chirie lunară viitoare. Asta te ajută să vezi cât din scenariu vine din ipoteza de creștere și cât vine din structura actuală a proprietății.\n\nDe aceea merită să folosești atât un scenariu prudent, cât și unul optimist. Dacă proiectul funcționează doar în varianta optimistă, semnalul nu este unul bun. Dacă rămâne coerent și în scenariul prudent, analiza devine mult mai sănătoasă.\n\nConcluzia practică este ca o proiecție bună nu este cea mai frumoasă, ci cea care rezistă și după ce scazi optimismul din ea.",
    articleType: "guide",
    relatedCategorySlug: "imobiliare",
    relatedCalculatorKeys: ["rent-increase", "vacancy-loss", "rental-yield"],
    relatedArticleSlugs: ["cum-estimezi-pierderile-din-vacanta-la-o-proprietate-de-inchiriat"],
    launchWave: "backlog",
    releaseBatch: "batch-11",
    audience: "both",
  },
  {
    slug: "ce-marja-ramane-intr-un-flip-imobiliar-dupa-costurile-reale",
    title: "Ce marja rămâne într-un flip imobiliar după costurile reale, nu după entuziasmul inițial",
    excerpt:
      "La flip, profitul nu este doar diferența dintre cumpărare și vânzare. Renovarea, detinerea și frictiunile din execuție pot muta rapid marja.",
    content:
      "Un flip imobiliar pare atragator atunci când iei doar diferența dintre prețul de cumpărare și prețul posibil de vânzare. În practică, tocmai costurile intermediare sunt cele care decid dacă proiectul mai rămâne interesant sau nu.\n\nCalculatorul de marja pentru flip este util pentru că adună prețul de achiziție, renovarea și costurile de detinere în același loc. Asta face mult mai greu să te amagesti cu o marjă artificial inflata.\n\nMai ales aici contează rezervă și disciplină de buget. O renovare subestimata sau o iesire mai lenta din proiect poate consuma repede profitul aparent confortabil de la început. De aceea pagina trebuie legată natural de bugetul de renovare și de costurile de închidere.\n\nConcluzia practică este ca flip-ul bun nu este cel cu cea mai mare promisiune pe hartie, ci cel care rezistă după ce adaugi costurile reale și o marjă prudentă de eroare.",
    articleType: "guide",
    relatedCategorySlug: "imobiliare",
    relatedCalculatorKeys: ["property-flip-margin", "renovation-budget", "closing-cost-share"],
    relatedArticleSlugs: ["cum-estimezi-un-buget-de-renovare-fara-optimism-periculos"],
    launchWave: "backlog",
    releaseBatch: "batch-11",
    audience: "both",
  },
  {
    slug: "cat-te-costa-administrarea-unei-proprietati-inchiriate",
    title: "Cât te costa administrarea unei proprietăți inchiriate și cum o legi de randamentul real",
    excerpt:
      "Administrarea pare un cost mic până când începi să o vezi anual și să o pui lângă randamentul net al proprietății.",
    content:
      "Administrarea proprietății este unul dintre acele costuri care par suportabile când le privești izolat pe luna. În analiza completă, tocmai costurile recurente mai mici sunt cele care subtiaza vizibil randamentul net.\n\nCalculatorul de cost administrare proprietate este util pentru că pune într-o singură cifra comisionul variabil și costurile fixe lunare. Asta îți arată rapid cât plătești ca să păstrezi proprietatea funcțională în exploatare.\n\nCând legi acest cost de randamentul din chirie și de costurile recurente totale, vezi mult mai clar cât de realist este proiectul. Uneori randamentul brut pare bun, dar după administrare, reparatii și perioade de neocupare, concluzia se schimbă mult.\n\nConcluzia practică este ca administrarea nu trebuie privită ca detaliu operațional, ci ca parte reală din randamentul și efortul proiectului.",
    articleType: "explainer",
    relatedCategorySlug: "imobiliare",
    relatedCalculatorKeys: [
      "property-management-fee",
      "service-charge-budget",
      "rental-yield",
    ],
    relatedArticleSlugs: ["cum-citesti-randamentul-din-chirie-fara-sa-ignori-costurile-ascunse"],
    launchWave: "backlog",
    releaseBatch: "batch-11",
    audience: "both",
  },
  {
    slug: "cum-citesti-ponderea-costurilor-de-inchidere-intr-o-achizitie",
    title: "Cum citești ponderea costurilor de închidere într-o achiziție și de ce contează mai mult decât pare",
    excerpt:
      "Costurile de închidere par secundare până când le pui în procente din proprietate și vezi ce parte din lichiditate consumă imediat.",
    content:
      "Costurile de închidere sunt deseori tratate ca o anexă inevitabila a achiziției, nu ca o parte reală a deciziei. Tocmai de aceea mulți cumpărători rămân surprinsi când văd cât capital inițial consumă imediat.\n\nCalculatorul de pondere a costurilor de închidere este util pentru că traduce aceste sume într-un procent din prețul proprietății. Asta îți permite să compari mai bine scenarii diferite și să vezi dacă presiunea inițială asupra lichiditatii este încă suportabilă.\n\nPunctul important este ca aceste costuri trebuie citite împreună cu avansul și cu bugetul total de achiziție. Separat, fiecare pare gestionabil. Împreună, pot muta semnificativ confortul financiar al proiectului.\n\nConcluzia practică este ca lichiditatea de la început trebuie protejata la fel de atent ca rata lunară de după semnare.",
    articleType: "explainer",
    relatedCategorySlug: "imobiliare",
    relatedCalculatorKeys: [
      "closing-cost-share",
      "property-total-purchase-cost",
      "property-down-payment",
    ],
    relatedArticleSlugs: ["ce-intra-de-fapt-in-bugetul-total-de-achizitie-al-unei-locuinte"],
    launchWave: "backlog",
    releaseBatch: "batch-11",
    audience: "both",
  },
  {
    slug: "inchiriere-integrala-vs-pe-camera-cum-compari-venitul",
    title: "Inchiriere integrală vs pe camera: cum compari venitul fără să confunzi scenariile",
    excerpt:
      "Comparația bună nu sta doar în chiria maximă posibilă, ci și în ocupare, administrare și stabilitatea exploatării.",
    content:
      "Inchirierea pe camera pare adesea mai profitabila pe hartie, pentru că insumeaza mai multă chirie potentiala decât inchirierea integrală. În practică, scenariul devine mai complex tocmai pentru că managementul, ocuparea și uzura pot schimba mult rezultatul.\n\nCalculatorul de venit din inchiriere pe camera este util pentru că pune într-o formulă simplă numărul de camere, chiria per camera și gradul de ocupare. Asta îți oferă un punct de pornire bun pentru comparație.\n\nTotuși, comparația bună cere să vezi și vacanță probabila, costul administrarii și efortul operațional. De aceea merită să legi imediat acest calcul de randamentul din chirie și de pierderea din neocupare.\n\nConcluzia practică este ca scenariul mai profitabil nu este neapărat cel cu venitul brut mai mare, ci cel care rămâne coerent după ce adaugi frictiunea reală a exploatării.",
    articleType: "comparison",
    relatedCategorySlug: "imobiliare",
    relatedCalculatorKeys: ["room-rental-income", "rental-yield", "vacancy-loss"],
    relatedArticleSlugs: ["cum-estimezi-pierderile-din-vacanta-la-o-proprietate-de-inchiriat"],
    launchWave: "backlog",
    releaseBatch: "batch-11",
    audience: "both",
  },
];

const shouldPublishArticle = (seed: ArticleSeed) =>
  seed.publishByDefault === true || BATCH_01_ARTICLES.includes(seed.slug);

const bootstrapRedirects = async (payload: Payload, force: boolean) => {
  const results: SeedItemResult[] = [];

  for (const seed of LEGACY_REDIRECT_SEEDS) {
    const existing = await payload.find({
      collection: "redirects",
      depth: 0,
      limit: 1,
      pagination: false,
      overrideAccess: true,
      where: {
        sourcePath: {
          equals: seed.sourcePath,
        },
      },
    });

    const data = {
      sourcePath: seed.sourcePath,
      destinationPath: seed.destinationPath,
      statusCode: seed.statusCode ?? "308",
      isEnabled: seed.publishByDefault ?? true,
      notes: seed.notes,
      _status: "published" as const,
    };

    if (existing.docs[0]) {
      if (!force) {
        results.push({ key: seed.key, status: "skipped" });
        continue;
      }

      await payload.update({
        collection: "redirects",
        id: existing.docs[0].id,
        overrideAccess: true,
        draft: false,
        data,
      });
      results.push({ key: seed.key, status: "updated" });
      continue;
    }

    await payload.create({
      collection: "redirects",
      overrideAccess: true,
      draft: false,
      data,
    });
    results.push({ key: seed.key, status: "created" });
  }

  return getCounterSummary(results);
};

const seoBodyIntroPool: ReadonlyArray<
  (title: string, formulaName: string, audience: string) => string
> = [
  (title, formulaName, audience) =>
    `${title} îți da un răspuns rapid, calculat cu ${formulaName.toLowerCase()}, însoțit de explicația de unde vine cifra și de context ca să știi când o poți folosi cu incredere. E util mai ales ${audience}.`,
  (title, formulaName, audience) =>
    `Cu ${title.toLowerCase()} obții direct rezultatul, dar pagina merge un pas mai departe și arată și logica din spate: formula (${formulaName.toLowerCase()}) și ${audience}.`,
  (title, formulaName, audience) =>
    `${title} folosește ${formulaName.toLowerCase()} ca să îți arate rapid rezultatul, fără să te lase doar cu o cifră goală pe ecran - explicam și de unde vine, și ${audience}.`,
  (title, formulaName, audience) =>
    `Când ai nevoie de un răspuns rapid, ${title.toLowerCase()} îl oferă direct, calculat prin ${formulaName.toLowerCase()}. Pagina explică însă și contextul practic: ${audience}.`,
];

const seoBodyVerifyPool: ReadonlyArray<
  (example: string, interpretationNotes: string) => string
> = [
  (example, interpretationNotes) =>
    `Pentru un rezultat relevant, verifică unitățile introduse și folosește valori realiste - un număr greșit la intrare da un rezultat greșit, oricât de corectă ar fi formula. ${example} La fel de important e ce faci cu rezultatul: ${interpretationNotes}`,
  (example, interpretationNotes) =>
    `Rezultatul e doar atât de bun pe cât sunt datele introduse, așa ca merită să verifici valorile înainte să tragi o concluzie. ${example} Iar după calcul: ${interpretationNotes}`,
  (example, interpretationNotes) =>
    `${example} Un calcul corect matematic nu înseamnă însă automat o concluzie corectă - contează și cum citești rezultatul. ${interpretationNotes}`,
  (example, interpretationNotes) =>
    `Înainte să te bazezi pe cifra afișată, verifică dacă valorile introduse reflecta situația ta reală, nu un scenariu aproximativ. ${example} ${interpretationNotes}`,
];

const seoBodyClosingPool: ReadonlyArray<string> = [
  "",
  " Dacă vrei să aprofundezi subiectul, paginile de mai jos completează bine acest calcul.",
  " Împreună cu instrumentele de mai sus, poți privi rezultatul dintr-un unghi mai complet.",
  " Restul paginilor din aceeași zona te ajută să completezi tabloul, nu doar cifra izolată.",
];

const buildCalculatorSeoBody = (
  key: CalculatorKey,
  definition: ReturnType<typeof getCalculatorDefinition>,
  meta: CalculatorMeta
) => {
  const categoryFrame = getCategoryFrame(definition.categorySlug);
  const relatedCalculatorTitles = (meta.relatedCalculatorKeys ?? [])
    .slice(0, 3)
    .map((relatedKey) => getCalculatorDefinition(relatedKey).title.toLowerCase());
  const relatedArticleTitles = (meta.relatedArticleSlugs ?? [])
    .slice(0, 2)
    .map(
      (slug) =>
        articleSeeds.find((article) => article.slug === slug)?.title.toLowerCase() ??
        slug.replace(/-/g, " ")
    );

  const relatedToolsSentence = relatedCalculatorTitles.length
    ? ` Dacă vrei să mergi mai departe, continuă și cu ${toSentenceList(relatedCalculatorTitles)}.`
    : "";
  const relatedArticlesSentence = relatedArticleTitles.length
    ? ` Pentru intentii mai documentate, merită citite și ${toSentenceList(relatedArticleTitles)}.`
    : "";

  return [
    pick(`${key}-seo-p1`, seoBodyIntroPool)(
      definition.title,
      definition.formulaName,
      categoryFrame.audience
    ),
    pick(`${key}-seo-p2`, seoBodyVerifyPool)(meta.example, meta.interpretationNotes),
    `${categoryFrame.caution} ${categoryFrame.linkingLead}${relatedToolsSentence}${relatedArticlesSentence}${pick(`${key}-seo-p3`, seoBodyClosingPool)}`,
  ].join("\n\n");
};

const storyTitlePool: ReadonlyArray<(title: string) => string> = [
  (title) => `Cum folosești ${title.toLowerCase()} fără să rămâi doar la cifra finală`,
  (title) => `Ce să faci după ce ${title.toLowerCase()} îți da rezultatul`,
  (title) => `${title}: de la formula la o decizie concretă`,
];

const storyBodyPool: ReadonlyArray<string> = [
  " Cifra afișată e doar începutul - următorul pas e să o compari, să o verifici sau să decizi ceva pe baza ei.",
  " Folosește rezultatul ca punct de plecare pentru o comparație sau o decizie, nu ca răspuns final în sine.",
  " Odată ce ai rezultatul, urmatoarea întrebare firească e ce faci cu el - de-aia pagina continuă cu exemple și context, nu se oprește la cifra.",
];

const factsIntroPool: ReadonlyArray<string> = [
  "Formula rezolvă calculul instant, dar exemplele și explicatiile de mai jos te ajută să citești corect rezultatul.",
  "Rezultatul apare imediat; partea utilă vine din cum îl interpretezi, nu doar din cifra în sine.",
  "Calculul e rapid, însă merită cateva secunde în plus pentru context înainte să te bazezi pe el.",
];

const inputFieldDetailPool: ReadonlyArray<string> = [
  "Campurile sunt gândite să fie ușor de completat pe mobil și desktop, fără pasi inutili.",
  "Le completezi în cateva secunde, fără informații de care nu ai nevoie.",
];

const outputFieldDetailPool: ReadonlyArray<string> = [
  "Rezultatul principal e însoțit de unități clare și de o explicație pentru interpretare.",
  "Fiecare rezultat vine cu unitatea de măsură și o scurtă explicație, nu doar o cifră goală.",
];

const categoryFactDetailPool: ReadonlyArray<(categoryName: string) => string> = [
  (categoryName) => `Îl găsești în categoria ${categoryName.toLowerCase()}, alături de alte calculatoare din aceeași zona.`,
  (categoryName) => `Face parte din categoria ${categoryName.toLowerCase()}, utilă dacă vrei să compari mai multe unghiuri ale aceleiași decizii.`,
];

const relatedCalculatorDescriptionPool: ReadonlyArray<(title: string) => string> = [
  (title) => `Completează analiza cu ${title.toLowerCase()}.`,
  (title) => `Merită comparat și cu ${title.toLowerCase()} pentru o imagine mai completă.`,
  (title) => `Un pas firesc următor: ${title.toLowerCase()}.`,
];

const categoryHubDescriptionPool: ReadonlyArray<(categoryName: string) => string> = [
  (categoryName) => `Aici găsești toate calculatoarele din ${categoryName.toLowerCase()}.`,
  (categoryName) => `Vezi restul calculatoarelor din categoria ${categoryName.toLowerCase()}.`,
];

const allCalculatorsDescriptionPool: ReadonlyArray<string> = [
  "Lista completă, dacă vrei să cauți alt tip de calcul.",
  "Util dacă vrei să navighezi direct spre alt calculator.",
];

const linksBlockIntroPool: ReadonlyArray<string> = [
  "Linkurile de mai jos sunt alese să completeze rezultatul de mai sus, nu doar recomandări la intamplare.",
  "Dacă vrei să mergi mai departe cu subiectul, astea sunt urmatoarele pagini utile.",
  "Continuă cu paginile de mai jos dacă ai nevoie de mai mult context sau de o comparație.",
];

const buildCalculatorBlocks = (
  key: CalculatorKey,
  definition: ReturnType<typeof getCalculatorDefinition>,
  meta: CalculatorMeta
) => {
  const categoryName =
    categorySeeds.find((seed) => seed.slug === definition.categorySlug)?.name ??
    definition.categorySlug.replace(/-/g, " ");
  const calculatorLinks = (meta.relatedCalculatorKeys ?? []).map((relatedKey, index) => {
    const relatedDefinition = getCalculatorDefinition(relatedKey);

    return {
      label: relatedDefinition.title,
      href: `/calculatoare/${relatedDefinition.categorySlug}/${relatedDefinition.slug}`,
      description: pick(
        `${key}-rel-${index}`,
        relatedCalculatorDescriptionPool
      )(relatedDefinition.title),
    };
  });

  const articleLinks = (meta.relatedArticleSlugs ?? []).map((slug) => {
    const article = articleSeeds.find((entry) => entry.slug === slug);

    return {
      label: article?.title ?? slug.replace(/-/g, " "),
      href: `/blog/${slug}`,
      description:
        article?.excerpt ??
        "Articol explicativ pentru cititorii care vor mai mult context decât formula de baza.",
    };
  });

  const linkItems = [
    ...calculatorLinks,
    ...articleLinks,
    {
      label: `Toate calculatoarele din ${categoryName}`,
      href: `/calculatoare/${definition.categorySlug}`,
      description: pick(`${key}-hub`, categoryHubDescriptionPool)(categoryName),
    },
    {
      label: "Vezi toate calculatoarele",
      href: "/calculatoare",
      description: pick(`${key}-all`, allCalculatorsDescriptionPool),
    },
  ].slice(0, 6);

  const blocks: Array<Record<string, unknown>> = [
    {
      blockType: "story",
      eyebrow: "Context util",
      title: pick(`${key}-story-title`, storyTitlePool)(definition.title),
      body: `${definition.formulaDescription}${pick(`${key}-story-body`, storyBodyPool)}`,
      tone: "mist",
    },
    {
      blockType: "facts",
      eyebrow: "Dintr-o privire",
      title: "Ce merită să urmărești pe această pagina",
      intro: pick(`${key}-facts-intro`, factsIntroPool),
      tone: "sand",
      items: [
        {
          value: String(definition.inputs.length),
          label: "campuri de intrare",
          detail: pick(`${key}-facts-inputs`, inputFieldDetailPool),
        },
        {
          value: String(definition.outputs.length),
          label: "rezultate afișate",
          detail: pick(`${key}-facts-outputs`, outputFieldDetailPool),
        },
        {
          value: categoryName,
          label: "categorie",
          detail: pick(`${key}-facts-category`, categoryFactDetailPool)(categoryName),
        },
      ],
    },
  ];

  if (Array.isArray(meta.extraBlocks) && meta.extraBlocks.length > 0) {
    blocks.push(...meta.extraBlocks);
  }

  if (linkItems.length >= 2) {
    blocks.push({
      blockType: "links",
      eyebrow: "Continuă lectura",
      title: "Pagini utile din același subiect",
      intro: pick(`${key}-links-intro`, linksBlockIntroPool),
      tone: "night",
      items: linkItems,
    });
  }

  return blocks;
};

const buildCategoryBlocks = (seed: CategorySeed) => [
  {
    blockType: "story",
    eyebrow: `Categorie: ${seed.name}`,
    title: `Hub-ul ${seed.name.toLowerCase()} trebuie să combine răspunsul rapid cu contextul util.`,
    body: `${seed.introContent} Calculatoarele și articolele de mai jos se completează între ele, nu funcționează izolat.`,
    tone: "night",
  },
];

const getCounterSummary = (items: SeedItemResult[]): CounterSummary => ({
  created: items.filter((item) => item.status === "created").length,
  updated: items.filter((item) => item.status === "updated").length,
  skipped: items.filter((item) => item.status === "skipped").length,
  items,
});

const bootstrapHomepage = async (payload: Payload, force: boolean) => {
  const existing = (await payload.findGlobal({ slug: "homepage", depth: 0, draft: true, overrideAccess: true })) as Record<string, unknown>;
  const existingBlocks = Array.isArray(existing.contentBlocks) ? existing.contentBlocks : [];
  if (!force && existingBlocks.length > 0) {
    return { status: "skipped" as const };
  }

  await payload.updateGlobal({ slug: "homepage", overrideAccess: true, draft: false, data: homepageSeed });
  return { status: "updated" as const };
};

const bootstrapCategories = async (payload: Payload, force: boolean) => {
  const results: SeedItemResult[] = [];
  for (const seed of categorySeeds) {
    const existing = await payload.find({
      collection: "calculator-categories",
      depth: 0,
      limit: 1,
      pagination: false,
      overrideAccess: true,
      where: { slug: { equals: seed.slug } },
    });

    const data = {
      ...seed,
      contentBlocks: buildCategoryBlocks(seed),
      seo: buildSeoPayload({
        metaTitle: `${seed.name} - calculatoare online utile`,
        metaDescription: seed.summary,
        canonicalPath: `/calculatoare/${seed.slug}`,
      }),
    };

    if (existing.docs[0]) {
      if (!force) {
        results.push({ key: seed.slug, status: "skipped" });
        continue;
      }
      await payload.update({ collection: "calculator-categories", id: existing.docs[0].id, overrideAccess: true, draft: false, data });
      results.push({ key: seed.slug, status: "updated" });
      continue;
    }

    await payload.create({ collection: "calculator-categories", overrideAccess: true, draft: false, data });
    results.push({ key: seed.slug, status: "created" });
  }

  return getCounterSummary(results);
};

const bootstrapFormulaLibrary = async (payload: Payload, force: boolean) => {
  const results: SeedItemResult[] = [];
  for (const key of CALCULATOR_KEYS) {
    const definition = getCalculatorDefinition(key);
    const existing = await payload.find({
      collection: "formula-library",
      depth: 0,
      limit: 1,
      pagination: false,
      overrideAccess: true,
      where: { formulaKey: { equals: key } },
    });

    const data = {
      title: definition.title,
      slug: definition.slug,
      formulaKey: key,
      expression: definition.formulaExpression,
      summary: definition.summary,
      explanation: definition.formulaDescription,
      variables: definition.inputs.map((input) => ({ name: input.name, label: input.label, unit: input.unit })),
    };

    if (existing.docs[0]) {
      if (!force) {
        results.push({ key, status: "skipped" });
        continue;
      }
      await payload.update({ collection: "formula-library", id: existing.docs[0].id, overrideAccess: true, draft: false, data });
      results.push({ key, status: "updated" });
      continue;
    }

    await payload.create({ collection: "formula-library", overrideAccess: true, draft: false, data });
    results.push({ key, status: "created" });
  }

  return getCounterSummary(results);
};

const bootstrapCalculators = async (payload: Payload, force: boolean) => {
  const results: SeedItemResult[] = [];
  const categories = await payload.find({ collection: "calculator-categories", depth: 0, pagination: false, limit: 100, overrideAccess: true });
  const categoryMap = new Map(
    categories.docs.map((doc) => [readStringField(doc as { [key: string]: unknown }, "slug"), doc.id])
  );
  const formulas = await payload.find({ collection: "formula-library", depth: 0, pagination: false, limit: 100, overrideAccess: true });
  const formulaMap = new Map(
    formulas.docs.map((doc) => [readStringField(doc as { [key: string]: unknown }, "formulaKey"), doc.id])
  );

  for (const key of CALCULATOR_KEYS) {
    const definition = getCalculatorDefinition(key);
    const meta: CalculatorMeta =
      calculatorMeta[key] ?? buildFallbackCalculatorMeta(key, definition);
    const publishCalculator = shouldPublishCalculator(key, meta);
    const existing = await payload.find({
      collection: "calculators",
      depth: 0,
      limit: 1,
      pagination: false,
      overrideAccess: true,
      where: { calculatorKey: { equals: key } },
    });

    const data = {
      title: definition.title,
      slug: definition.slug,
      calculatorKey: key,
      category: categoryMap.get(definition.categorySlug),
      formulaReference: formulaMap.get(key),
      shortDescription: meta.shortDescription,
      intro: meta.intro,
      seoBody: buildCalculatorSeoBody(key, definition, meta),
      interpretationNotes: meta.interpretationNotes,
      examples: (meta.examples ?? [{ title: "Exemplu de calcul", narrative: meta.example }]).map(
        (example) => ({
          title: example.title,
          narrative: example.narrative,
        })
      ),
      faq: ensureCalculatorFaq(key, meta.faq),
      howToSteps: definition.howToSteps.map((step) => ({ step })),
      isFeatured: meta.isFeatured,
      sortOrder: meta.sortOrder,
      audience: meta.audience ?? defaultAudienceForCalculator(key),
      releaseBatch: meta.releaseBatch ?? defaultReleaseBatchForCalculator(key),
      publishingSchedule:
        meta.publishingSchedule ?? defaultPublishingScheduleForCalculator(key, meta),
      editorialStatus: publishCalculator
        ? "published"
        : meta.editorialStatus ?? defaultEditorialStatusForCalculator(key),
      editorialChecklist: buildEditorialChecklistSeed(
        publishCalculator ? "published" : "ready_for_review",
      ),
      editorialCompletion: computeEditorialCompletion(
        buildEditorialChecklistSeed(publishCalculator ? "published" : "ready_for_review"),
      ),
      contentBlocks: buildCalculatorBlocks(key, definition, meta),
      seo: buildSeoPayload({
        metaTitle: meta.seo?.metaTitle ?? `${definition.title} online`,
        metaDescription: meta.seo?.metaDescription ?? meta.shortDescription,
        canonicalPath:
          meta.seo?.canonicalPath ??
          `/calculatoare/${definition.categorySlug}/${definition.slug}`,
      }),
      _status: publishCalculator ? "published" : "draft",
    };

    if (existing.docs[0]) {
      if (!force) {
        results.push({ key, status: "skipped" });
        continue;
      }
      await payload.update({ collection: "calculators", id: existing.docs[0].id, overrideAccess: true, draft: false, data });
      results.push({ key, status: "updated" });
      continue;
    }

    await payload.create({ collection: "calculators", overrideAccess: true, draft: false, data });
    results.push({ key, status: "created" });
  }

  const calculatorDocs = await payload.find({ collection: "calculators", depth: 0, pagination: false, limit: 100, overrideAccess: true });
  const calculatorMap = new Map(
    calculatorDocs.docs.map((doc) => [readStringField(doc as { [key: string]: unknown }, "calculatorKey"), doc.id])
  );

  for (const key of CALCULATOR_KEYS) {
    const meta: CalculatorMeta =
      calculatorMeta[key] ?? buildFallbackCalculatorMeta(key, getCalculatorDefinition(key));
    const doc = calculatorDocs.docs.find(
      (entry) => readStringField(entry as { [key: string]: unknown }, "calculatorKey") === key
    );
    if (!doc) {
      continue;
    }

    await payload.update({
      collection: "calculators",
      id: doc.id,
      overrideAccess: true,
      draft: false,
      data: {
        relatedCalculators: (meta.relatedCalculatorKeys ?? [])
          .map((item) => calculatorMap.get(item))
          .filter(Boolean),
      },
    });
  }

  return getCounterSummary(results);
};

const bootstrapArticles = async (payload: Payload, force: boolean) => {
  const results: SeedItemResult[] = [];
  const users = await payload.find({ collection: "users", depth: 0, pagination: false, limit: 1, overrideAccess: true });
  const authorID = users.docs[0]?.id;
  if (!authorID) {
    throw new Error("Bootstrap requires at least one CMS user to exist.");
  }

  const categories = await payload.find({ collection: "calculator-categories", depth: 0, pagination: false, limit: 100, overrideAccess: true });
  const categoryMap = new Map(
    categories.docs.map((doc) => [readStringField(doc as { [key: string]: unknown }, "slug"), doc.id])
  );
  const calculators = await payload.find({ collection: "calculators", depth: 0, pagination: false, limit: 100, overrideAccess: true });
  const calculatorMap = new Map(
    calculators.docs.map((doc) => [readStringField(doc as { [key: string]: unknown }, "calculatorKey"), doc.id])
  );

  for (const seed of articleSeeds) {
    const existing = await payload.find({ collection: "articles", depth: 0, limit: 1, pagination: false, overrideAccess: true, where: { slug: { equals: seed.slug } } });
    const publishArticle = shouldPublishArticle(seed);

    const data = {
      title: seed.title,
      slug: seed.slug,
      excerpt: seed.excerpt,
      content: seed.content,
      articleType: seed.articleType,
      audience: seed.audience ?? defaultAudienceForArticle(seed),
      relatedCategory: seed.relatedCategorySlug ? categoryMap.get(seed.relatedCategorySlug) : undefined,
      relatedCalculators: (seed.relatedCalculatorKeys ?? []).map((item) => calculatorMap.get(item)).filter(Boolean),
      launchWave: seed.launchWave ?? "backlog",
      releaseBatch: seed.releaseBatch ?? defaultReleaseBatchForArticle(seed),
      publishingSchedule:
        seed.publishingSchedule ?? defaultPublishingScheduleForArticle(seed),
      editorialStatus: publishArticle
        ? "published"
        : seed.editorialStatus ?? defaultEditorialStatusForArticle(seed),
      editorialChecklist: buildEditorialChecklistSeed(
        publishArticle ? "published" : "ready_for_review",
      ),
      editorialCompletion: computeEditorialCompletion(
        buildEditorialChecklistSeed(publishArticle ? "published" : "ready_for_review"),
      ),
      author: authorID,
      publishedAt: publishArticle ? new Date().toISOString() : undefined,
      aiDraft: { reviewStatus: publishArticle ? "reviewed" : "draft" },
      seo: buildSeoPayload({
        metaTitle: seed.title,
        metaDescription: seed.excerpt,
        canonicalPath: `/blog/${seed.slug}`,
      }),
      _status: publishArticle ? "published" : "draft",
    };

    if (existing.docs[0]) {
      if (!force) {
        results.push({ key: seed.slug, status: "skipped" });
        continue;
      }
      await payload.update({
        collection: "articles",
        id: existing.docs[0].id,
        overrideAccess: true,
        draft: !publishArticle,
        data,
      });
      results.push({ key: seed.slug, status: "updated" });
      continue;
    }

    await payload.create({
      collection: "articles",
      overrideAccess: true,
      draft: !publishArticle,
      data,
    });
    results.push({ key: seed.slug, status: "created" });
  }

  const articleDocs = await payload.find({ collection: "articles", depth: 0, pagination: false, limit: 100, overrideAccess: true });
  const articleMap = new Map(
    articleDocs.docs.map((doc) => [readStringField(doc as { [key: string]: unknown }, "slug"), doc.id])
  );

  for (const seed of articleSeeds) {
    const article = articleDocs.docs.find(
      (entry) => readStringField(entry as { [key: string]: unknown }, "slug") === seed.slug
    );
    if (!article) {
      continue;
    }

    await payload.update({
      collection: "articles",
      id: article.id,
      overrideAccess: true,
      draft: !shouldPublishArticle(seed),
      data: {
        relatedArticles: (seed.relatedArticleSlugs ?? [])
          .map((slug) => articleMap.get(slug))
          .filter(Boolean),
      },
    });
  }

  for (const key of CALCULATOR_KEYS) {
    const meta: CalculatorMeta =
      calculatorMeta[key] ?? buildFallbackCalculatorMeta(key, getCalculatorDefinition(key));
    const calculator = calculators.docs.find(
      (entry) => readStringField(entry as { [key: string]: unknown }, "calculatorKey") === key
    );
    if (!calculator) {
      continue;
    }

    await payload.update({
      collection: "calculators",
      id: calculator.id,
      overrideAccess: true,
      draft: false,
      data: {
        relatedArticles: (meta.relatedArticleSlugs ?? [])
          .map((slug) => articleMap.get(slug))
          .filter(Boolean),
      },
    });
  }

  return getCounterSummary(results);
};

// Targeted refresh for calculator content that's generated from templates
// (seoBody, contentBlocks, faq) - does NOT touch title, category, dates,
// editorial status, or any hand-written meta field. Safe to re-run any time
// the generator functions above change, without risk to unrelated content.
export const regenerateCalculatorContent = async (
  payload: Payload,
  onProgress?: (key: string, status: SeedStatus) => void
): Promise<CounterSummary> => {
  const results: SeedItemResult[] = [];
  const calculators = await payload.find({
    collection: "calculators",
    depth: 0,
    pagination: false,
    limit: 200,
    overrideAccess: true,
  });

  for (const key of CALCULATOR_KEYS) {
    const definition = getCalculatorDefinition(key);
    const meta: CalculatorMeta = calculatorMeta[key] ?? buildFallbackCalculatorMeta(key, definition);
    const doc = calculators.docs.find(
      (entry) => readStringField(entry as { [key: string]: unknown }, "calculatorKey") === key
    );

    if (!doc) {
      results.push({ key, status: "skipped" });
      onProgress?.(key, "skipped");
      continue;
    }

    await payload.update({
      collection: "calculators",
      id: doc.id,
      overrideAccess: true,
      draft: false,
      data: {
        seoBody: buildCalculatorSeoBody(key, definition, meta),
        contentBlocks: buildCalculatorBlocks(key, definition, meta),
        faq: ensureCalculatorFaq(key, meta.faq),
      },
    });
    results.push({ key, status: "updated" });
    onProgress?.(key, "updated");
  }

  return getCounterSummary(results);
};

// Targeted refresh for article body text only - re-syncs `content` from
// articleSeeds without touching publishedAt, author, editorial status or
// any other field (unlike bootstrapArticles, which resets publishedAt to
// "now" on every run and would clobber real publish dates).
export const regenerateArticleContent = async (
  payload: Payload,
  onProgress?: (key: string, status: SeedStatus) => void
): Promise<CounterSummary> => {
  const results: SeedItemResult[] = [];

  for (const seed of articleSeeds) {
    const existing = await payload.find({
      collection: "articles",
      depth: 0,
      limit: 1,
      pagination: false,
      overrideAccess: true,
      where: { slug: { equals: seed.slug } },
    });
    const doc = existing.docs[0];

    if (!doc) {
      results.push({ key: seed.slug, status: "skipped" });
      onProgress?.(seed.slug, "skipped");
      continue;
    }

    await payload.update({
      collection: "articles",
      id: doc.id,
      overrideAccess: true,
      draft: false,
      data: { content: seed.content },
    });
    results.push({ key: seed.slug, status: "updated" });
    onProgress?.(seed.slug, "updated");
  }

  return getCounterSummary(results);
};

// Targeted refresh for category display text only - re-syncs name/summary/
// introContent/contentBlocks from categorySeeds without touching slug,
// sortOrder, isFeatured, or seo (unlike bootstrapCategories, which would
// overwrite the whole doc including any hand-edited admin fields).
export const regenerateCategoryContent = async (
  payload: Payload,
  onProgress?: (key: string, status: SeedStatus) => void
): Promise<CounterSummary> => {
  const results: SeedItemResult[] = [];

  for (const seed of categorySeeds) {
    const existing = await payload.find({
      collection: "calculator-categories",
      depth: 0,
      limit: 1,
      pagination: false,
      overrideAccess: true,
      where: { slug: { equals: seed.slug } },
    });
    const doc = existing.docs[0];

    if (!doc) {
      results.push({ key: seed.slug, status: "skipped" });
      onProgress?.(seed.slug, "skipped");
      continue;
    }

    await payload.update({
      collection: "calculator-categories",
      id: doc.id,
      overrideAccess: true,
      draft: false,
      data: {
        name: seed.name,
        summary: seed.summary,
        introContent: seed.introContent,
        contentBlocks: buildCategoryBlocks(seed),
      },
    });
    results.push({ key: seed.slug, status: "updated" });
    onProgress?.(seed.slug, "updated");
  }

  return getCounterSummary(results);
};

export const bootstrapCms = async (payload: Payload, options: BootstrapOptions = {}): Promise<BootstrapCmsResult> => {
  const force = options.force === true;
  const homepage = await bootstrapHomepage(payload, force);
  const categories = await bootstrapCategories(payload, force);
  const formulas = await bootstrapFormulaLibrary(payload, force);
  const calculators = await bootstrapCalculators(payload, force);
  const articles = await bootstrapArticles(payload, force);
  const redirects = await bootstrapRedirects(payload, force);

  return { homepage, categories, formulas, calculators, articles, redirects };
};




