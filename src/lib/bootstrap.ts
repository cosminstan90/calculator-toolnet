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
  "cum-citesti-rata-lunara-la-un-credit",
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
    destinationPath: "/calculatoare/fitness/calculator-bmi-imc",
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
      "Legacy SEO recovery pentru pagina istorica de conversie KW in CP.",
    publishByDefault: true,
  },
  {
    key: "legacy-concrete-volume",
    sourcePath: "/calculator-beton-fundatie-volum",
    destinationPath: "/calculatoare/constructii/calculator-volum-beton",
    statusCode: "308",
    notes:
      "Legacy SEO recovery pentru calculatorul istoric de volum beton / fundatie.",
    publishByDefault: true,
  },
  {
    key: "legacy-bmr-slug",
    sourcePath: "/calculatoare/fitness/calculator-bmr",
    destinationPath: "/calculatoare/fitness/calculator-metabolism-bazal",
    statusCode: "308",
    notes:
      "Pastreaza equity-ul pentru vechiul slug englezesc al calculatorului BMR.",
    publishByDefault: true,
  },
  {
    key: "legacy-tdee-slug",
    sourcePath: "/calculatoare/fitness/calculator-tdee",
    destinationPath: "/calculatoare/fitness/calculator-necesar-caloric-zilnic",
    statusCode: "308",
    notes:
      "Pastreaza equity-ul pentru vechiul slug englezesc al calculatorului TDEE.",
    publishByDefault: true,
  },
  {
    key: "legacy-one-rep-max-slug",
    sourcePath: "/calculatoare/fitness/calculator-one-rep-max",
    destinationPath: "/calculatoare/fitness/calculator-repetare-maxima-1rm",
    statusCode: "308",
    notes:
      "Pastreaza equity-ul pentru vechiul slug englezesc al calculatorului 1RM.",
    publishByDefault: true,
  },
  {
    key: "legacy-cash-on-cash-return-slug",
    sourcePath: "/calculatoare/imobiliare/calculator-cash-on-cash-return",
    destinationPath: "/calculatoare/imobiliare/calculator-randament-capital-propriu",
    statusCode: "308",
    notes:
      "Pastreaza equity-ul pentru vechiul slug englezesc al calculatorului de randament capital propriu.",
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
  if (categorySlug === "business") {
    return "business";
  }

  if (
    categorySlug === "fitness" ||
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
      : seed.relatedCategorySlug === "business"
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
  fitness: {
    audience:
      "cand urmaresti compozitia corporala, aportul caloric, hidratarea sau performanta din antrenament",
    caution:
      "In fitness, rezultatul merita corelat cu obiectivul, istoricul personal si cu alte repere relevante, nu folosit izolat.",
    linkingLead:
      "Din acelasi cluster merita sa legi calculatorul de alte tool-uri care rafineaza interpretarea rezultatului.",
  },
  auto: {
    audience:
      "cand vrei sa estimezi mai corect costul unui drum, consumul real sau timpul necesar pentru un traseu",
    caution:
      "In zona auto, traficul, stilul de condus, incarcarea masinii si diferentele de pret pot schimba rezultatul final.",
    linkingLead:
      "Legaturile interne functioneaza bine aici pentru ca utilizatorul cauta de obicei si costul, si consumul, si timpul.",
  },
  energie: {
    audience:
      "cand compari specificatii tehnice, estimezi consum energetic sau convertesti rapid valori folosite in practica",
    caution:
      "In energie si electricitate, rezultatul matematic este clar, dar consumul real depinde si de randament, factor de putere sau mod de folosire.",
    linkingLead:
      "Un calculator de energie performeaza mai bine SEO cand este conectat natural cu alte conversii si cu ghiduri explicative.",
  },
  "energie-pentru-casa": {
    audience:
      "cand vrei sa intelegi factura, consumul din casa, productia panourilor sau rentabilitatea unei investitii energetice",
    caution:
      "In energia pentru casa, formula este utila ca reper, dar rezultatul final depinde de obiceiurile reale de consum, orientarea acoperisului, tariful folosit si calitatea echipamentelor.",
    linkingLead:
      "Paginile functioneaza cel mai bine cand legi consumul, costul, dimensionarea sistemului si amortizarea in acelasi traseu de decizie.",
  },
  conversii: {
    audience:
      "cand ai nevoie de un raspuns rapid intre doua unitati si vrei sa verifici imediat daca valoarea este corecta",
    caution:
      "La conversii simple, avantajul competitiv nu vine doar din formula, ci din claritatea explicatiei si din contextul util oferit pe pagina.",
    linkingLead:
      "Conversiile tind sa capteze cautari answer-first, asa ca merita sustinute prin linkuri spre alte conversii si spre pagini explicative.",
  },
  constructii: {
    audience:
      "cand estimezi materiale, suprafete sau volume pentru renovari, finisaje sau lucrari simple de santier",
    caution:
      "In constructii si amenajari, pierderile de material, neregularitatile si specificatiile reale ale produselor pot schimba necesarul final.",
    linkingLead:
      "Pagini de constructii functioneaza bine cand le legi intre ele: suprafata, volum, vopsea, gresie sau parchet fac parte din acelasi traseu de decizie.",
  },
  business: {
    audience:
      "cand vrei sa estimezi rapid costuri, marje, rentabilitate sau preturi de vanzare pentru decizii comerciale",
    caution:
      "In business, formula este utila ca reper rapid, dar rezultatul trebuie completat cu taxe, comisioane, discounturi si contextul real al pietei.",
    linkingLead:
      "Internal linking-ul este valoros aici pentru ca utilizatorul cauta de obicei mai multe unghiuri ale aceleiasi decizii: marja, markup, profit si ROI.",
  },
  finante: {
    audience:
      "cand vrei sa calculezi procente, TVA, rate, economii sau scenarii financiare simple pentru uz personal ori comercial",
    caution:
      "In finante, formula ofera un reper bun, dar rezultatul trebuie citit cu atentie atunci cand intervin comisioane, taxe suplimentare, conditii contractuale sau dobanzi variabile.",
    linkingLead:
      "Paginile financiare functioneaza cel mai bine cand legi intre ele procentele, TVA-ul, economiile si creditele, pentru ca utilizatorul cauta de multe ori mai multe unghiuri ale aceleiasi decizii.",
  },
  "salarii-si-taxe": {
    audience:
      "cand compari venituri, cresterea salariala, orele lucrate sau diferenta dintre brut si net intr-un scenariu usor de explicat",
    caution:
      "In zona salariilor si taxarii efective, calculatorul este foarte util pentru orientare, dar regulile fiscale concrete si clauzele contractuale pot schimba interpretarea finala.",
    linkingLead:
      "Leaga natural paginile de crestere salariala, tarif orar, venit anual si taxare efectiva pentru a sustine un traseu complet de decizie.",
  },
  "credite-si-economii": {
    audience:
      "cand compari credite, rate, economii, refinantare sau obiective financiare pe termen mediu si lung",
    caution:
      "In credite si economii, formula este foarte utila pentru orientare, dar costul real depinde si de comisioane, asigurari, structura produsului si comportamentul tau financiar.",
    linkingLead:
      "Leaga intre ele paginile de rata maxima, cost total credit, refinantare, fond de urgenta si obiective de economisire pentru a sustine un traseu complet de decizie.",
  },
  imobiliare: {
    audience:
      "cand compari o proprietate prin pret, buget total, cost lunar, chirie, randament sau costuri recurente",
    caution:
      "In imobiliare, formula ajuta la orientare, dar rezultatul final depinde si de starea proprietatii, structura finantarii, costurile de inchidere, neocupare si cheltuielile reale din exploatare.",
    linkingLead:
      "Categoria functioneaza bine cand legi intre ele pretul pe mp, costul total de achizitie, chiria versus cumpararea, randamentul si costurile recurente.",
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
    return `${items[0]} si ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")} si ${items[items.length - 1]}`;
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

  if (categorySlug === "business") {
    return categoryFrames.business;
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

  return categoryFrames.fitness;
};

const buildFallbackCalculatorMeta = (
  key: CalculatorKey,
  definition: ReturnType<typeof getCalculatorDefinition>
) => {
  const categoryFrame = getCategoryFrame(definition.categorySlug);

  return {
    shortDescription: `${definition.summary} Pagina ofera formula explicata, exemple de calcul si context util pentru interpretarea rezultatului.`,
    intro: `${definition.title} te ajuta sa obtii un raspuns rapid, dar si sa intelegi ce inseamna valoarea calculata in practica. Pagina foloseste ${definition.formulaName.toLowerCase()} si este gandita pentru cautari cu intentie clara, answer-first.`,
    interpretationNotes: `${categoryFrame.caution} Rezultatul trebuie verificat in functie de datele introduse si de scenariul real in care folosesti calculatorul.`,
    isFeatured: false,
    sortOrder: 200 + CALCULATOR_KEYS.indexOf(key),
    releaseBatch: defaultReleaseBatchForCalculator(key),
    editorialStatus: defaultEditorialStatusForCalculator(key),
    audience: defaultAudienceForCalculator(key),
    publishByDefault: BATCH_01_CALCULATORS.includes(key),
    example: `Exemplu orientativ pentru ${definition.title.toLowerCase()}, pornind de la valorile standard afisate in formular si ajustat apoi dupa scenariul tau real.`,
    faq: [
      {
        question: `Cum functioneaza ${definition.title.toLowerCase()}?`,
        answer: definition.formulaDescription,
      },
      {
        question: "Cand este util acest calculator?",
        answer: `Este util ${categoryFrame.audience}.`,
      },
      {
        question: "Rezultatul este exact?",
        answer:
          "Rezultatul este corect matematic pe baza formulei folosite, dar interpretarea practica depinde de contextul real.",
      },
    ],
  };
};

const homepageSeed = {
  heroBadge: "Calculatoare online clare si utile",
  heroTitle: "Calcule utile, explicate pe inteles si gata de folosit.",
  heroDescription:
    "Calculatoare Online reuneste tool-uri pentru fitness, auto, energie, energie pentru casa, conversii, constructii, business, finante, salarii, credite si imobiliare, fiecare completat cu formula folosita, exemple practice, intrebari frecvente si legaturi catre pagini relevante.",
  primaryCTA: { label: "Vezi toate calculatoarele", href: "/calculatoare" },
  secondaryCTA: { label: "Cum construim paginile", href: "/metodologie" },
  heroHighlights: [
    { value: "105", label: "calculatoare disponibile in primele unsprezece loturi" },
    { value: "11", label: "categorii principale de cautare" },
    { value: "FAQ", label: "explicatii si raspunsuri integrate in pagini" },
  ],
  contentBlocks: [
    {
      blockType: "story",
      eyebrow: "Ce face diferenta",
      title:
        "Fiecare pagina porneste de la un calculator real, dar merge mai departe cu explicatii, interpretare si urmatorul pas util.",
      body: "Scopul platformei nu este doar sa afiseze un rezultat rapid, ci sa ofere suficient context incat utilizatorul sa inteleaga ce inseamna cifra obtinuta si cum se leaga de alte calcule sau ghiduri relevante.",
      tone: "night",
    },
    {
      blockType: "facts",
      eyebrow: "Cum este structurat hub-ul",
      title: "Platforma este gandita pentru raspuns rapid, dar si pentru explorare coerenta.",
      intro:
        "Fiecare pagina are formula, exemple, FAQ, continut contextual si legaturi catre tool-uri sau articole apropiate.",
      tone: "mist",
      items: [
        { value: "Fitness", label: "BMI, BMR, TDEE, proteine si calorii" },
        { value: "Auto", label: "consum, cost de drum si timp de calatorie" },
        { value: "Energie", label: "kW in CP, cost electric si conversii utile" },
        { value: "Casa", label: "factura, consum, panouri si climatizare" },
        { value: "Conversii", label: "temperatura, greutate, lungime si unitati uzuale" },
        { value: "Constructii", label: "suprafata, beton, vopsea, gresie si parchet" },
        { value: "Business", label: "food cost, marja, markup, break-even si ROI" },
        { value: "Finante", label: "procente, TVA, economii, dobanzi si rate" },
        { value: "Salarii", label: "crestere salariala, tarif orar, venit anual si taxare" },
        { value: "Credite", label: "rata maxima, refinantare, fond de urgenta si avans" },
        { value: "Imobiliare", label: "pret pe mp, chirie vs cumparare si randament" },
      ],
    },
  ],
  seo: buildSeoPayload({
    metaTitle: "Calculatoare Online - credite, energie, imobiliare si business",
    metaDescription:
      "Hub de calculatoare online pentru credite, economii, imobiliare, energie pentru casa, fotovoltaice, fitness, auto, constructii si business, cu formule explicate, exemple practice, FAQ si pagini construite pentru utilitate reala.",
    canonicalPath: "/",
  }),
};

const categorySeeds: CategorySeed[] = [
  {
    name: "Fitness",
    slug: "fitness",
    summary: "Calculatoare pentru IMC, metabolism, calorii, proteine si obiective de nutritie.",
    introContent:
      "Categoria Fitness aduna tool-uri pentru compozitie corporala, necesar caloric, proteine si alte calcule frecvente in nutritie si antrenament. Fiecare pagina combina formularul cu explicatia formulei, exemple de calcul si context editorial care te ajuta sa folosesti corect rezultatul.",
    sortOrder: 10,
    isFeatured: true,
  },
  {
    name: "Auto",
    slug: "auto",
    summary: "Tool-uri pentru consum, cost pe kilometru, costuri de drum si estimari utile pentru soferi.",
    introContent:
      "Categoria Auto raspunde intrebarilor practice care apar inaintea unui drum sau dupa alimentare: cat consuma masina, cat te costa traseul, cat dureaza si cum compari mai bine mai multe scenarii de consum.",
    sortOrder: 20,
    isFeatured: true,
  },
  {
    name: "Energie",
    slug: "energie",
    summary: "Conversii tehnice si estimari pentru consum, putere si cost electric.",
    introContent:
      "Categoria Energie grupeaza conversii tehnice si estimari de cost energetic pentru utilizare practica. Este utila atat pentru specificatii de aparate sau motoare, cat si pentru intrebari simple despre consum si cost.",
    sortOrder: 30,
    isFeatured: true,
  },
  {
    name: "Energie pentru casa",
    slug: "energie-pentru-casa",
    summary: "Calculatoare pentru factura, consumul locuintei, panouri fotovoltaice, climatizare si amortizare.",
    introContent:
      "Categoria Energie pentru casa aduna calculatoare orientate spre consumul real al locuintei: costul aparatelor, factura lunara, dimensionarea unui sistem fotovoltaic, amortizarea investitiei, BTU pentru aer conditionat si necesarul de incalzire. Scopul nu este doar sa afli un numar, ci sa legi consumul de bani, echipamente si decizii practice.",
    sortOrder: 35,
    isFeatured: true,
  },
  {
    name: "Conversii",
    slug: "conversii",
    summary: "Convertori rapizi pentru unitati uzuale si formule folosite frecvent.",
    introContent:
      "Categoria Conversii este construita pentru cautari recurente si answer-first, dar fiecare pagina merge dincolo de formula simpla si adauga exemple, explicatii si legaturi catre alte conversii utile.",
    sortOrder: 40,
    isFeatured: false,
  },
  {
    name: "Constructii",
    slug: "constructii",
    summary: "Tool-uri pentru suprafete, volume si estimari de materiale in amenajari si lucrari simple.",
    introContent:
      "Categoria Constructii reuneste calculatoare pentru suprafete, volum de beton, vopsea, gresie, faianta si parchet. Scopul lor este sa transforme formulele simple in estimari utile pentru buget, achizitii si organizarea lucrarii.",
    sortOrder: 50,
    isFeatured: true,
  },
  {
    name: "Business",
    slug: "business",
    summary: "Calculatoare pentru food cost, marja, markup, break-even si ROI.",
    introContent:
      "Categoria Business aduna calcule simple, dar foarte cautate in vanzari, horeca si management: marja, markup, rentabilitate, ROI si alte repere care ajuta la decizii rapide. Fiecare pagina explica formula si limitele interpretarii ei in practica.",
    sortOrder: 60,
    isFeatured: true,
  },
  {
    name: "Finante",
    slug: "finante",
    summary: "Calculatoare pentru procente, TVA, discount, economii, dobanzi si rate de credit.",
    introContent:
      "Categoria Finante reuneste calcule rapide pentru procente, discounturi, TVA, economii, dobanda compusa si rate de credit. Este gandita atat pentru persoane care compara costuri si obiective de economisire, cat si pentru firme mici care vor calcule comerciale simple, clare si reutilizabile.",
    sortOrder: 70,
    isFeatured: true,
  },
  {
    name: "Salarii si taxe",
    slug: "salarii-si-taxe",
    summary: "Calculatoare pentru crestere salariala, tarif orar, ore lucrate, venit anual si taxare efectiva.",
    introContent:
      "Categoria Salarii si taxe aduna calcule utile pentru compararea ofertelor salariale, transformarea venitului lunar in tarif orar, estimarea orelor lucrate, intelegerea diferentei dintre brut si net si planificarea venitului anual. Paginile sunt gandite ca instrumente de orientare rapida, completate de articole care clarifica decizia si limitele interpretarii.",
    sortOrder: 80,
    isFeatured: true,
  },
  {
    name: "Credite si economii",
    slug: "credite-si-economii",
    summary: "Calculatoare pentru rate, cost total credit, refinantare, fond de urgenta, economii si obiective financiare.",
    introContent:
      "Categoria Credite si economii aduna calculatoare pentru rata maxima suportabila, grad de indatorare, cost total credit, refinantare, fond de urgenta si planificarea obiectivelor financiare. Paginile sunt gandite ca instrumente de decizie, nu doar de calcul, astfel incat utilizatorul sa poata compara scenarii si sa inteleaga mai usor ce face mai departe.",
    sortOrder: 90,
    isFeatured: true,
  },
  {
    name: "Imobiliare",
    slug: "imobiliare",
    summary:
      "Calculatoare pentru pret pe mp, buget total de achizitie, chirie vs cumparare, randament si costuri recurente.",
    introContent:
      "Categoria Imobiliare aduna calculatoare pentru compararea unei proprietati din mai multe unghiuri: pret pe metru patrat, cost total de achizitie, buget lunar, chirie versus cumparare, randament din chirie si costuri recurente. Scopul este sa transformi o decizie imobiliara intr-un scenariu mai clar, nu doar intr-o cifra separata de context.",
    sortOrder: 100,
    isFeatured: true,
  },
];

const calculatorMeta: Partial<Record<CalculatorKey, CalculatorMeta>> = {
  bmi: {
    shortDescription: "Calculeaza rapid indicele de masa corporala pe baza greutatii si inaltimii.",
    intro: "Acest calculator BMI estimeaza indicele de masa corporala si te ajuta sa intelegi rapid in ce interval te incadrezi.",
    interpretationNotes: "BMI este orientativ. La sportivi sau persoane cu masa musculara mare, rezultatul poate fi inselator.",
    isFeatured: true,
    sortOrder: 10,
    example: "La 70 kg si 170 cm, BMI este 24.2.",
    faq: [
      { question: "Ce inseamna BMI?", answer: "BMI sau IMC este indicele de masa corporala calculat din greutate si inaltime." },
      { question: "Este suficient pentru evaluare?", answer: "Nu. Este un indicator de pornire si trebuie completat cu alti factori." },
    ],
    relatedCalculatorKeys: ["bmr", "tdee", "protein-intake"],
    relatedArticleSlugs: ["cum-interpretezi-bmi-corect"],
  },
  bmr: {
    shortDescription: "Estimeaza rata metabolica bazala folosind formula Mifflin-St Jeor.",
    intro: "Calculatorul de metabolism bazal arata de cate calorii are nevoie corpul tau in repaus pentru functiile vitale, fara sa amestece miscarea zilnica cu nevoia minima a organismului.",
    interpretationNotes: "BMR nu include activitatea zilnica. Pentru mentinere, slabire sau crestere in greutate, leaga-l imediat de calculatorul de necesar caloric zilnic.",
    isFeatured: true,
    sortOrder: 20,
    example: "Pentru 80 kg, 180 cm si 30 ani, BMR este aproximativ 1780 kcal/zi.",
    faq: [
      { question: "Ce diferenta este intre BMR si TDEE?", answer: "BMR este consumul in repaus, iar TDEE adauga activitatea zilnica." },
      { question: "Formula este exacta?", answer: "Este o estimare buna, dar nu un rezultat clinic." },
    ],
    relatedCalculatorKeys: ["tdee", "calorie-deficit", "bmi"],
    relatedArticleSlugs: ["bmr-vs-tdee-diferente"],
  },
  tdee: {
    shortDescription: "Estimeaza necesarul zilnic de calorii in functie de metabolism si activitate.",
    intro: "Calculatorul de necesar caloric zilnic combina metabolismul bazal cu nivelul real de activitate, ca sa iti dea un reper mult mai bun pentru mentinere, deficit sau surplus.",
    interpretationNotes: "Rezultatul este un punct de plecare. Ajusteaza dupa 2-3 saptamani in functie de evolutia reala.",
    isFeatured: true,
    sortOrder: 30,
    example: "Un BMR de 1650 kcal si activitate moderata duc la aproximativ 2550 kcal/zi.",
    faq: [
      { question: "Cum aleg nivelul de activitate?", answer: "Alege media saptamanii, nu cea mai intensa zi de antrenament." },
      { question: "TDEE se schimba in timp?", answer: "Da, in functie de greutate, masa musculara si rutina." },
    ],
    relatedCalculatorKeys: ["bmr", "calorie-deficit", "protein-intake"],
    relatedArticleSlugs: ["bmr-vs-tdee-diferente"],
  },
  "calorie-deficit": {
    shortDescription: "Porneste de la TDEE si estimeaza tinta zilnica de calorii pentru slabire.",
    intro: "Calculatorul transforma TDEE-ul intr-o tinta practica de calorii pentru un deficit lent, moderat sau agresiv.",
    interpretationNotes: "Pentru multi utilizatori, deficitul moderat este un punct de plecare mai sustenabil decat varianta agresiva.",
    isFeatured: true,
    sortOrder: 40,
    example: "La un TDEE de 2400 kcal, un deficit moderat duce la circa 1920 kcal/zi.",
    faq: [
      { question: "Ce deficit este recomandat?", answer: "De multe ori 15% pana la 20% este un compromis bun intre progres si sustenabilitate." },
      { question: "Calculatorul garanteaza slabirea?", answer: "Nu. Este un punct de pornire care necesita ajustare in functie de raspunsul real." },
    ],
    relatedCalculatorKeys: ["tdee", "bmr", "protein-intake"],
    relatedArticleSlugs: ["cum-setezi-un-deficit-caloric"],
  },
  "protein-intake": {
    shortDescription: "Estimeaza cate grame de proteine ai nevoie zilnic in functie de greutate si obiectiv.",
    intro: "Calculatorul de proteine este util pentru mentinere, slabire sau crestere musculara cand vrei o tinta simpla si usor de aplicat.",
    interpretationNotes: "Rezultatul este orientativ. Pentru conditii medicale speciale, consulta un specialist.",
    isFeatured: false,
    sortOrder: 50,
    example: "La 75 kg si mentinere, 1.8 g/kg inseamna aproximativ 135 g/zi.",
    faq: [
      { question: "De ce creste necesarul de proteine in deficit?", answer: "Un aport mai mare poate ajuta la mentinerea masei musculare si la satietate." },
      { question: "Trebuie impartite pe mese?", answer: "De obicei este mai usor sa distribui proteinele in 3-5 mese pe zi." },
    ],
    relatedCalculatorKeys: ["tdee", "calorie-deficit", "bmi"],
    relatedArticleSlugs: ["cate-proteine-ai-nevoie-zilnic"],
  },
  "fuel-consumption": {
    shortDescription: "Afla consumul mediu in litri la 100 km pe baza distantei si a carburantului consumat.",
    intro: "Calculatorul de consum combustibil este unul dintre cele mai utile tool-uri auto pentru costuri si comparatii reale.",
    interpretationNotes: "Rezultatul este mai relevant daca masuratoarea acopera o distanta suficient de lunga.",
    isFeatured: true,
    sortOrder: 60,
    example: "36 litri consumati pe 500 km inseamna 7.2 l/100 km.",
    faq: [
      { question: "Cum calculez corect consumul real?", answer: "Alimenteaza pana la plin, noteaza distanta si litrii consumati, apoi aplica formula." },
      { question: "Consumul din bord este suficient?", answer: "Este orientativ, dar calculul manual este de obicei mai apropiat de realitate." },
    ],
    relatedCalculatorKeys: ["trip-fuel-cost", "electricity-cost"],
    relatedArticleSlugs: ["cum-calculezi-consumul-real-la-masina"],
  },
  "trip-fuel-cost": {
    shortDescription: "Estimeaza cati litri consumi si cat te costa un drum pe baza distantei, consumului si pretului carburantului.",
    intro: "Calculatorul de cost auto transforma consumul mediu si pretul combustibilului intr-o estimare financiara usor de folosit.",
    interpretationNotes: "Rezultatul nu include taxe de drum, parcari sau variatii de consum cauzate de trafic ori viteza.",
    isFeatured: true,
    sortOrder: 70,
    example: "La 320 km, 7 l/100 km si 7.45 lei/l, costul este aproximativ 166.88 lei.",
    faq: [
      { question: "Pot folosi consumul mixt din fabrica?", answer: "Da, dar pentru estimari mai bune e preferabil consumul tau mediu real." },
      { question: "Include oras si autostrada separat?", answer: "Nu in varianta initiala; poti calcula separat doua scenarii." },
    ],
    relatedCalculatorKeys: ["fuel-consumption", "kw-cp", "electricity-cost"],
    relatedArticleSlugs: ["cum-estimezi-costul-unei-calatorii-cu-masina"],
  },
  "kw-cp": {
    shortDescription: "Converteste rapid kilowati in cai putere si invers din acelasi calculator.",
    intro: "Convertorul KW in CP este util pentru comparatii auto, moto si specificatii tehnice unde apar ambele unitati.",
    interpretationNotes: "In specificatii tehnice pot aparea valori rotunjite, deci sunt posibile diferente mici fata de alte surse.",
    isFeatured: true,
    sortOrder: 80,
    example: "110 kW inseamna aproximativ 149.56 CP.",
    faq: [
      { question: "Cat inseamna 1 kW in CP?", answer: "1 kW este aproximativ 1.35962 CP." },
      { question: "Pot converti si invers?", answer: "Da, calculatorul functioneaza in ambele sensuri." },
    ],
    relatedCalculatorKeys: ["fuel-consumption", "trip-fuel-cost", "temperature-converter"],
    relatedArticleSlugs: ["kw-vs-cp-explicat-simplu"],
  },
  "electricity-cost": {
    shortDescription: "Estimeaza consumul lunar si costul energiei electrice pe baza puterii, timpului de utilizare si pretului pe kWh.",
    intro: "Calculatorul este util pentru electrocasnice, aparate de aer conditionat sau orice echipament pentru care vrei o estimare de cost.",
    interpretationNotes: "Consumul real poate varia in functie de cicluri de functionare, eficienta aparatului si tariful exact din contract.",
    isFeatured: true,
    sortOrder: 90,
    example: "Un aparat de 1500 W folosit 2 ore/zi consuma circa 90 kWh/luna, adica aproximativ 72 lei la 0.8 lei/kWh.",
    faq: [
      { question: "Cum transform watt in kWh?", answer: "Imparti puterea in W la 1000 pentru a obtine kW, apoi inmultesti cu orele de functionare." },
      { question: "Trebuie sa includ toate taxele in pretul pe kWh?", answer: "Ideal da, pentru o estimare mai apropiata de factura finala." },
    ],
    relatedCalculatorKeys: ["watts-to-kwh", "amps-to-watts", "kw-cp"],
    relatedArticleSlugs: ["cum-calculezi-consumul-electric-al-unui-aparat"],
  },
  "body-fat-us-navy": {
    shortDescription: "Estimeaza procentul de grasime corporala din circumferinte si inaltime folosind formula US Navy.",
    intro: "Calculatorul de grasime corporala este util cand vrei un reper mai fin decat BMI-ul si ai nevoie de o estimare orientativa a compozitiei corporale.",
    interpretationNotes: "Formula este orientativa si depinde mult de masuratori corecte. Diferente mici de centimetri pot schimba rezultatul mai mult decat te astepti.",
    isFeatured: false,
    sortOrder: 55,
    example: "Pentru 175 cm, 84 cm talie si 38 cm gat, rezultatul poate fi in jur de 17-18% la barbati.",
    faq: [
      { question: "Este mai util decat BMI?", answer: "De multe ori ofera mai mult context despre compozitia corporala, dar tot ramane o estimare, nu o masuratoare clinica." },
      { question: "Cum masor corect circumferintele?", answer: "Foloseste un centimetru flexibil, stai relaxat si masoara in acelasi punct de fiecare data pentru comparatii coerente." },
    ],
    relatedCalculatorKeys: ["bmi", "ideal-weight", "protein-intake"],
    relatedArticleSlugs: ["cum-estimezi-procentul-de-grasime-corporala"],
  },
  "ideal-weight": {
    shortDescription: "Calculeaza o greutate ideala orientativa in functie de inaltime si sex cu formula Devine.",
    intro: "Calculatorul de greutate ideala este util cand vrei un reper simplu pentru intervalul de greutate, fara sa-l tratezi ca obiectiv rigid.",
    interpretationNotes: "Greutatea ideala este un reper general. Nu surprinde masa musculara, structura corporala sau contextul individual al utilizatorului.",
    isFeatured: false,
    sortOrder: 57,
    example: "La 175 cm, formula Devine estimeaza aproximativ 70.5 kg pentru femei si 75 kg pentru barbati.",
    faq: [
      { question: "Greutatea ideala este acelasi lucru cu greutatea sanatoasa?", answer: "Nu neaparat. Este un reper statistic orientativ, nu un verdict medical sau estetic." },
      { question: "De ce merita combinata cu alte calcule?", answer: "Pentru ca BMI-ul, procentul de grasime si obiectivul personal ofera context mai bun decat o singura valoare." },
    ],
    relatedCalculatorKeys: ["bmi", "body-fat-us-navy", "water-intake"],
    relatedArticleSlugs: ["cum-estimezi-procentul-de-grasime-corporala"],
  },
  "water-intake": {
    shortDescription: "Estimeaza aportul zilnic de apa pornind de la greutate si ofera un reper usor de aplicat in rutina.",
    intro: "Calculatorul de apa este gandit pentru utilizatorii care vor un punct de plecare simplu, apoi isi ajusteaza hidratarea in functie de activitate, sezon si obiceiuri.",
    interpretationNotes: "Rezultatul nu inlocuieste semnalele reale ale corpului sau recomandarile medicale. Este mai util ca reper de organizare zilnica.",
    isFeatured: false,
    sortOrder: 58,
    example: "La 70 kg, regula de 35 ml/kg duce la aproximativ 2450 ml, adica 2.45 litri pe zi.",
    faq: [
      { question: "Trebuie sa beau exact atat in fiecare zi?", answer: "Nu. Necesarul variaza dupa temperatura, activitate, alimentatie si toleranta personala." },
      { question: "Apa din cafea, ceai sau alimente conteaza?", answer: "Da, aportul total de lichide conteaza, dar multi utilizatori prefera sa foloseasca apa ca reper principal." },
    ],
    relatedCalculatorKeys: ["tdee", "protein-intake", "ideal-weight"],
    relatedArticleSlugs: ["cata-apa-ai-nevoie-zilnic-cu-adevarat"],
  },
  "one-rep-max": {
    shortDescription: "Estimeaza repetarea maxima si o greutate utila de antrenament pornind de la o serie submaximala.",
    intro: "Calculatorul de repetare maxima este util cand vrei sa planifici mai clar intensitatea la exercitii de forta fara sa testezi mereu un maxim real in sala.",
    interpretationNotes: "Formula functioneaza mai bine pe seturi scurte si executii curate. La repetari multe sau tehnica instabila, estimarea devine mai slaba.",
    isFeatured: false,
    sortOrder: 59,
    example: "80 kg pentru 5 repetari duc la un 1RM estimat de aproximativ 93.3 kg si la circa 79.3 kg pentru 85% din 1RM.",
    faq: [
      { question: "Este nevoie sa testez un maxim real?", answer: "Nu intotdeauna. Pentru multi utilizatori, estimarea este suficienta ca reper de programare a antrenamentului." },
      { question: "Pentru cate repetari mai este util calculatorul?", answer: "De obicei functioneaza mai bine pana in jur de 8-10 repetari, dupa care precizia scade progresiv." },
    ],
    relatedCalculatorKeys: ["protein-intake", "tdee", "water-intake"],
    relatedArticleSlugs: ["cum-folosesti-one-rep-max-in-antrenament"],
  },
  "temperature-converter": {
    shortDescription: "Converteste instant temperaturile din grade Celsius in Fahrenheit si invers.",
    intro: "Convertorul de temperatura este util in retete, specificatii tehnice, prognoze si contexte internationale.",
    interpretationNotes: "Pentru uz obisnuit, rotunjirea la una sau doua zecimale este suficienta.",
    isFeatured: false,
    sortOrder: 97,
    example: "25C inseamna 77F.",
    faq: [
      { question: "Care este formula din Celsius in Fahrenheit?", answer: "F = C x 9/5 + 32." },
      { question: "Pot converti si invers?", answer: "Da, calculatorul functioneaza in ambele sensuri." },
    ],
    relatedCalculatorKeys: ["kg-lb", "cm-inch"],
    relatedArticleSlugs: ["ghid-conversii-kg-lb-cm-inch"],
  },
  "cost-per-km": {
    shortDescription: "Calculeaza cat te costa combustibilul pe kilometru si pe 100 km folosind consumul mediu si pretul carburantului.",
    intro: "Calculatorul de cost pe kilometru este util cand vrei un reper foarte rapid pentru buget, comparatii intre masini sau intre doua trasee.",
    interpretationNotes: "Rezultatul include doar componenta de carburant. Nu ia in calcul revizii, anvelope, taxe sau deprecierea masinii.",
    isFeatured: false,
    sortOrder: 75,
    example: "La 7 l/100 km si 7.45 lei/l, costul de carburant este de aproximativ 0.522 lei/km si 52.15 lei/100 km.",
    faq: [
      { question: "Este acelasi lucru cu costul total al masinii?", answer: "Nu. Aici calculezi doar costul de carburant, nu costul complet de utilizare." },
      { question: "Cand este mai util acest calculator?", answer: "Cand vrei sa compari rapid doua masini, doua rute sau impactul unei schimbari de pret la carburant." },
    ],
    relatedCalculatorKeys: ["fuel-consumption", "trip-fuel-cost", "travel-time"],
    relatedArticleSlugs: ["cost-pe-kilometru-vs-cost-total-drum"],
  },
  "travel-time": {
    shortDescription: "Estimeaza durata unui drum din distanta si viteza medie, in ore si minute usor de interpretat.",
    intro: "Calculatorul de timp de calatorie este util pentru planificare rapida, mai ales cand vrei sa compari doua scenarii de traseu sau de viteza medie.",
    interpretationNotes: "Viteza medie reala este de obicei mai mica decat cea imaginata. Traficul, opririle si diferentele de drum pot schimba rapid estimarea.",
    isFeatured: false,
    sortOrder: 76,
    example: "Pentru 320 km si 78 km/h viteza medie, timpul estimat este de aproximativ 4.1 ore, adica 246 minute.",
    faq: [
      { question: "Pot folosi limita legala de viteza?", answer: "Mai bine folosesti viteza medie realista, altfel rezultatul va fi prea optimist." },
      { question: "Calculatorul include opriri sau trafic?", answer: "Nu automat. Le poti integra alegand o viteza medie mai apropiata de scenariul real." },
    ],
    relatedCalculatorKeys: ["trip-fuel-cost", "cost-per-km", "fuel-consumption"],
    relatedArticleSlugs: ["cum-estimezi-costul-unei-calatorii-cu-masina"],
  },
  "amps-to-watts": {
    shortDescription: "Transforma amperii in wati pornind de la tensiune si afiseaza rezultatul si in kilowati.",
    intro: "Convertorul amperi in wati este util pentru intrebari tehnice simple despre putere electrica, mai ales cand eticheta sau discutia porneste de la intensitate.",
    interpretationNotes: "Formula simpla W = A x V este utila in scenarii de baza. Pentru sisteme mai complexe, factorul de putere sau tipul curentului pot conta.",
    isFeatured: false,
    sortOrder: 85,
    example: "La 10 A si 230 V, rezultatul este 2300 W, adica 2.3 kW.",
    faq: [
      { question: "Formula este mereu suficienta?", answer: "Pentru conversii simple, da. Pentru instalatii complexe sau curent alternativ cu factori suplimentari, poate fi doar orientativa." },
      { question: "De ce e util sa vad si kW?", answer: "Pentru ca multe specificatii si estimari de consum sunt exprimate in kilowati sau kWh, nu doar in wati." },
    ],
    relatedCalculatorKeys: ["watts-to-kwh", "electricity-cost", "kw-cp"],
    relatedArticleSlugs: ["cum-transformi-amperii-in-wati-si-wati-in-kwh"],
  },
  "watts-to-kwh": {
    shortDescription: "Calculeaza consumul energetic in kWh din puterea aparatului si timpul de functionare.",
    intro: "Calculatorul W in kWh este puntea practica dintre puterea afisata pe un aparat si consumul pe care il vezi apoi in estimari de factura.",
    interpretationNotes: "Rezultatul este foarte util pentru estimare, dar consumul real poate varia in functie de cicluri, randament si functionarea efectiva a aparatului.",
    isFeatured: false,
    sortOrder: 86,
    example: "1500 W folositi timp de 2 ore inseamna 3 kWh consumati.",
    faq: [
      { question: "Care este diferenta dintre W si kWh?", answer: "W descrie puterea intr-un moment dat, iar kWh descrie energia consumata pe o perioada de timp." },
      { question: "Cum folosesc rezultatul in costuri?", answer: "Dupa ce obtii kWh-ul, il inmultesti cu pretul energiei pentru a estima costul." },
    ],
    relatedCalculatorKeys: ["electricity-cost", "amps-to-watts", "kw-cp"],
    relatedArticleSlugs: ["cum-transformi-amperii-in-wati-si-wati-in-kwh", "cum-calculezi-consumul-electric-al-unui-aparat"],
  },
  "kg-lb": {
    shortDescription: "Converteste kilogramele in livre si invers pentru situatii uzuale din fitness, shopping sau documentatie internationala.",
    intro: "Convertorul kg in lb este util cand compari rapid greutati afisate in sisteme diferite si vrei un raspuns instant fara riscul unei conversii gresite.",
    interpretationNotes: "In multe contexte, doua zecimale sunt suficiente. Pentru uz cotidian, nu merita sa complici afisarea cu mai multa precizie decat ai nevoie.",
    isFeatured: false,
    sortOrder: 95,
    example: "70 kg inseamna aproximativ 154.32 lb, iar 180 lb inseamna aproximativ 81.65 kg.",
    faq: [
      { question: "De ce apar frecvent livrele in fitness?", answer: "Pentru ca multe surse internationale, echipamente si programe de antrenament folosesc sistemul imperial." },
      { question: "Cat de precisa este conversia?", answer: "Formula foloseste factorul standard si este suficient de precisa pentru uz obisnuit si comparatii practice." },
    ],
    relatedCalculatorKeys: ["cm-inch", "bmi", "temperature-converter"],
    relatedArticleSlugs: ["ghid-conversii-kg-lb-cm-inch"],
  },
  "cm-inch": {
    shortDescription: "Converteste centimetri in inch si invers pentru dimensiuni personale, produse sau specificatii internationale.",
    intro: "Convertorul cm in inch este util in shopping, fitness, design si documentatie tehnica, mai ales cand alternezi des intre sistemul metric si cel imperial.",
    interpretationNotes: "La dimensiuni uzuale, doua zecimale sunt suficiente pentru majoritatea scenariilor. Important este mai ales sa nu inversezi sensul conversiei.",
    isFeatured: false,
    sortOrder: 96,
    example: "180 cm inseamna aproximativ 70.87 inch, iar 72 inch inseamna 182.88 cm.",
    faq: [
      { question: "In ce situatii apare cel mai des conversia?", answer: "Apare frecvent la haine, ecrane, inaltime corporala, mobilier si specificatii internationale." },
      { question: "Pot folosi rezultatul direct in alte calcule?", answer: "Da, de exemplu in formule care cer inch sau in conversii succesive pentru inaltime si greutate." },
    ],
    relatedCalculatorKeys: ["kg-lb", "ideal-weight", "temperature-converter"],
    relatedArticleSlugs: ["ghid-conversii-kg-lb-cm-inch"],
  },
  "percentage-of-number": {
    shortDescription: "Calculeaza rapid cat inseamna un procent dintr-o suma, valoare sau baza de comparatie.",
    intro: "Calculatorul procent din numar este util cand vrei sa afli repede cat inseamna 19% dintr-un pret, 25% dintr-un buget sau orice alta pondere aplicata unei valori de baza.",
    interpretationNotes: "Rezultatul este direct si exact matematic, dar merita verificat daca folosesti procentul pe baza corecta: net, brut, pret initial sau total final.",
    isFeatured: true,
    sortOrder: 310,
    example: "La o baza de 1.500 lei si un procent de 19%, rezultatul este 285 lei.",
    faq: [
      { question: "Cand este util acest calculator?", answer: "Este util pentru TVA, comisioane, discounturi, bonusuri, targete si orice calcul in care procentul se aplica peste o valoare de baza." },
      { question: "Care este cea mai frecventa greseala?", answer: "Sa aplici procentul la suma gresita: de exemplu la total cu TVA in loc de baza neta sau la suma deja redusa." },
    ],
    relatedCalculatorKeys: ["percentage-change", "discount", "vat"],
    relatedArticleSlugs: ["cum-calculezi-procentele-corect"],
  },
  "percentage-change": {
    shortDescription: "Arata cu cat a crescut sau a scazut o valoare in procente intre doua momente sau doua scenarii.",
    intro: "Calculatorul de diferenta procentuala este util pentru preturi, salarii, trafic, vanzari sau orice comparatie intre o valoare initiala si una noua.",
    interpretationNotes: "Rezultatul depinde intotdeauna de valoarea initiala, nu de cea noua, asa ca merita verificat ce cifra folosesti ca punct de plecare.",
    isFeatured: true,
    sortOrder: 320,
    example: "Daca o valoare creste de la 100 la 125, diferenta absoluta este 25, iar cresterea procentuala este 25%.",
    faq: [
      { question: "De ce conteaza valoarea initiala?", answer: "Pentru ca diferenta procentuala se raporteaza la baza initiala, iar asta schimba rezultatul fata de o comparatie intuitiva." },
      { question: "Calculatorul merge si pentru scaderi?", answer: "Da. Daca valoarea noua este mai mica, rezultatul procentual va fi negativ." },
    ],
    relatedCalculatorKeys: ["percentage-of-number", "reverse-percentage", "discount"],
    relatedArticleSlugs: ["procent-din-numar-vs-diferenta-procentuala"],
  },
  "reverse-percentage": {
    shortDescription: "Recupereaza valoarea initiala atunci cand stii rezultatul final si procentul de reducere sau majorare.",
    intro: "Calculatorul procent invers este foarte util atunci cand vrei sa afli pretul initial dintr-un pret redus sau baza de la care s-a plecat dupa o crestere procentuala.",
    interpretationNotes: "Este important sa alegi corect sensul procentului: reducere sau majorare. Acelasi procent aplicat invers duce la rezultate diferite.",
    isFeatured: false,
    sortOrder: 330,
    example: "Daca pretul final este 81 lei dupa o reducere de 10%, pretul initial a fost 90 lei.",
    faq: [
      { question: "De ce nu pot adauga pur si simplu procentul inapoi?", answer: "Pentru ca procentul a fost aplicat la baza initiala, nu la valoarea finala redusa." },
      { question: "Cand apare cel mai des acest calcul?", answer: "Apare frecvent la promotii, TVA, comisioane si comparatii de crestere/scadere." },
    ],
    relatedCalculatorKeys: ["discount", "percentage-of-number", "percentage-change"],
    relatedArticleSlugs: ["procent-din-numar-vs-diferenta-procentuala"],
  },
  discount: {
    shortDescription: "Calculeaza reducerea in lei si pretul final dupa aplicarea unui discount procentual.",
    intro: "Calculatorul de discount este util pentru oferte comerciale, comparatii de pret si verificarea rapida a unei promotii inainte de achizitie sau publicare.",
    interpretationNotes: "Un discount mare nu inseamna automat cel mai bun pret daca baza initiala este diferita sau daca apar comisioane si costuri suplimentare.",
    isFeatured: true,
    sortOrder: 340,
    example: "La un pret initial de 299,99 lei si un discount de 15%, reducerea este de 45 lei, iar pretul final aproximativ 254,99 lei.",
    faq: [
      { question: "Calculatorul merge si pentru reduceri comerciale B2B?", answer: "Da, formula este aceeasi, doar contextul difera: retail, distributie sau negociere comerciala." },
      { question: "Cum verific daca promotia este reala?", answer: "Compara pretul final, nu doar procentul afisat, si verifica daca baza initiala este una realista." },
    ],
    relatedCalculatorKeys: ["reverse-percentage", "vat", "percentage-of-number"],
    relatedArticleSlugs: ["cum-calculezi-discountul-real"],
  },
  vat: {
    shortDescription: "Adauga TVA peste o baza neta si afiseaza separat taxa si totalul de plata.",
    intro: "Calculatorul TVA este util pentru facturi, oferte, pricing si orice situatie in care ai o suma neta si vrei sa afli totalul cu TVA inclus.",
    interpretationNotes: "Rezultatul este exact matematic, dar in practica merita verificat daca lucrezi cu baza neta, cu o cota corecta si cu eventuale exceptii fiscale.",
    isFeatured: true,
    sortOrder: 350,
    example: "Pentru o baza neta de 1.000 lei si o cota TVA de 19%, TVA-ul este 190 lei, iar totalul 1.190 lei.",
    faq: [
      { question: "Cand folosesc calculatorul TVA simplu?", answer: "Il folosesti cand ai suma fara TVA si vrei sa afli valoarea taxei si totalul de plata." },
      { question: "Este suficient pentru orice situatie fiscala?", answer: "Nu. Pentru cazuri speciale sau regimuri fiscale particulare, formula standard trebuie verificata separat." },
    ],
    relatedCalculatorKeys: ["reverse-vat", "percentage-of-number", "discount"],
    relatedArticleSlugs: ["tva-inclus-vs-tva-exclus"],
  },
  "reverse-vat": {
    shortDescription: "Scoate TVA-ul dintr-o suma bruta si separa baza neta de componenta fiscala.",
    intro: "Calculatorul TVA invers este util cand primesti sau compari sume cu TVA inclus si vrei sa afli rapid baza neta si taxa inclusa in total.",
    interpretationNotes: "Rezultatul este corect doar daca suma introdusa include deja TVA-ul si cota aleasa este cea aplicata efectiv in acel caz.",
    isFeatured: false,
    sortOrder: 360,
    example: "Dintr-o suma de 1.190 lei cu TVA 19%, baza neta este 1.000 lei, iar TVA-ul inclus este 190 lei.",
    faq: [
      { question: "Care este diferenta fata de calculatorul TVA normal?", answer: "Aici pleci de la suma bruta si afli baza neta, in timp ce calculatorul TVA normal porneste de la baza neta." },
      { question: "Cand apare in practica?", answer: "Apare des la verificarea facturilor, comparatii de pret si reconcilieri rapide intre net si brut." },
    ],
    relatedCalculatorKeys: ["vat", "reverse-percentage", "percentage-of-number"],
    relatedArticleSlugs: ["tva-inclus-vs-tva-exclus"],
  },
  "compound-interest": {
    shortDescription: "Estimeaza cat ajunge o suma investita in timp atunci cand dobanda se capitalizeaza periodic.",
    intro: "Calculatorul de dobanda compusa este unul dintre cele mai utile tool-uri financiare atunci cand vrei sa vezi efectul timpului si al capitalizarii asupra unei sume initiale.",
    interpretationNotes: "Rezultatul este un scenariu matematic. In viata reala pot interveni taxe, randamente variabile, comisioane si perioade cu performanta diferita.",
    isFeatured: true,
    sortOrder: 370,
    example: "La 10.000 lei investiti, 7% dobanda anuala, 10 ani si capitalizare lunara, valoarea viitoare trece de 20.000 lei.",
    faq: [
      { question: "De ce este atat de important timpul in dobanda compusa?", answer: "Pentru ca dobanda se reinvesteste si produce la randul ei dobanda, iar efectul creste pe perioade mai lungi." },
      { question: "Este util si pentru depozite, si pentru investitii?", answer: "Da, ca model simplificat de crestere, chiar daca produsele reale pot avea reguli si randamente diferite." },
    ],
    relatedCalculatorKeys: ["monthly-savings", "savings-goal", "loan-payment"],
    relatedArticleSlugs: ["cum-functioneaza-dobanda-compusa"],
  },
  "monthly-savings": {
    shortDescription: "Arata cat se poate aduna din contributii lunare recurente pe o perioada data, cu sau fara dobanda.",
    intro: "Calculatorul de economii lunare este util cand vrei sa transformi un obicei de economisire intr-o suma finala concreta si usor de urmarit.",
    interpretationNotes: "Rezultatul depinde mult de disciplina lunara si de randamentul ales. Daca randamentul este variabil, foloseste-l ca reper, nu ca promisiune.",
    isFeatured: true,
    sortOrder: 380,
    example: "La 500 lei economisiti lunar, 5% pe an si 5 ani, suma finala depaseste simpla adunare a contributiilor lunare.",
    faq: [
      { question: "Ce se intampla daca dobanda este zero?", answer: "Calculatorul reduce scenariul la suma simpla a contributiilor lunare pe toata perioada." },
      { question: "Pot folosi acest calculator pentru un fond de urgenta?", answer: "Da, este foarte util pentru a vedea in cat timp poti construi un fond tinta." },
    ],
    relatedCalculatorKeys: ["savings-goal", "compound-interest", "loan-payment"],
    relatedArticleSlugs: ["cum-planifici-economii-lunare"],
  },
  "savings-goal": {
    shortDescription: "Calculeaza ce suma trebuie sa economisesti lunar ca sa ajungi la o tinta financiara intr-un termen fix.",
    intro: "Calculatorul de obiectiv economisire este util cand pornesti de la o tinta clara, cum ar fi avans, vacanta, fond de urgenta sau achizitie mare, si vrei sa vezi ce ritm lunar iti trebuie.",
    interpretationNotes: "Rezultatul este realist doar daca perioada si randamentul sunt credibile pentru contextul tau. O tinta prea agresiva poate cere o contributie lunara greu de sustinut.",
    isFeatured: false,
    sortOrder: 390,
    example: "Pentru un obiectiv de 30.000 lei in 4 ani, cu 5% pe an, contributia lunara este semnificativ mai mica decat intr-un scenariu fara dobanda.",
    faq: [
      { question: "Este mai util decat calculatorul de economii lunare?", answer: "Da, atunci cand pleci de la tinta finala si vrei sa vezi ritmul lunar necesar, nu totalul pe care il obtii." },
      { question: "Pot seta dobanda zero?", answer: "Da. In acel caz calculatorul imparte obiectivul la numarul total de luni." },
    ],
    relatedCalculatorKeys: ["monthly-savings", "compound-interest", "reverse-percentage"],
    relatedArticleSlugs: ["cum-estimezi-un-obiectiv-de-economisire"],
  },
  "loan-payment": {
    shortDescription: "Estimeaza rata lunara, costul total si dobanda totala pentru un credit cu rambursare in rate egale.",
    intro: "Calculatorul de rata credit este util pentru simulari rapide atunci cand vrei sa compari sume, perioade si dobanzi inainte de o discutie cu banca sau IFN-ul.",
    interpretationNotes: "Rezultatul este orientativ si nu include automat toate comisioanele, asigurarile sau particularitatile contractuale care pot modifica costul total real.",
    isFeatured: true,
    sortOrder: 400,
    example: "La 250.000 lei, 8.5% pe an si 30 de ani, rata lunara poate fi estimata rapid, impreuna cu costul total si dobanda platita.",
    faq: [
      { question: "Calculatorul arata costul total real al creditului?", answer: "Arata scenariul pe baza dobanzii si perioadei, dar costul real poate include si comisioane sau asigurari." },
      { question: "Este util si pentru comparatii intre oferte?", answer: "Da. Te ajuta sa vezi rapid cum se schimba rata si costul total cand modifici dobanda sau durata." },
    ],
    relatedCalculatorKeys: ["compound-interest", "monthly-savings", "savings-goal"],
    relatedArticleSlugs: ["cum-citesti-rata-lunara-la-un-credit"],
  },
  "room-area": {
    shortDescription: "Calculeaza rapid suprafata si perimetrul unei camere pentru renovari, finisaje si estimari de materiale.",
    intro: "Calculatorul de suprafata camera este punctul de plecare pentru multe alte estimari din amenajari: vopsea, parchet, gresie sau buget de materiale.",
    interpretationNotes: "Rezultatul este corect pentru camere dreptunghiulare. Pentru forme neregulate, imparte spatiul in mai multe zone si calculeaza separat.",
    isFeatured: true,
    sortOrder: 110,
    example: "La 5 m lungime si 4 m latime, suprafata este 20 mp, iar perimetrul este 18 m.",
    faq: [
      { question: "Cand este util perimetrul?", answer: "Perimetrul este util pentru plinte, baghete, brauri sau pentru verificari rapide inainte de comanda." },
      { question: "Cum calculez o camera neregulata?", answer: "Imparte camera in dreptunghiuri mai mici, calculeaza fiecare suprafata separat si apoi aduna rezultatele." },
    ],
    relatedCalculatorKeys: ["paint-coverage", "tile-coverage", "laminate-flooring"],
    relatedArticleSlugs: ["cum-calculezi-suprafata-unei-camere-corect"],
  },
  "concrete-volume": {
    shortDescription: "Estimeaza volumul de beton necesar pentru fundatii, placi si alte turnari simple pornind de la dimensiuni.",
    intro: "Calculatorul de volum beton este util cand vrei un reper rapid in metri cubi inainte sa comanzi material sau sa compari mai multe variante de lucrare.",
    interpretationNotes: "In practica merita sa iei si o rezerva rezonabila pentru pierderi, cofraje neregulate si diferente fata de dimensiunile teoretice.",
    isFeatured: true,
    sortOrder: 120,
    example: "Pentru 10 m lungime, 0.4 m latime si 80 cm grosime, volumul este 3.2 m3, adica aproximativ 3200 l.",
    faq: [
      { question: "Rezultatul include pierderi?", answer: "Nu. Calculatorul afiseaza volumul geometric, iar pierderile se adauga separat in functie de santier." },
      { question: "Pot folosi calculatorul si pentru placa?", answer: "Da, daca introduci dimensiunile corecte ale suprafetei si grosimea turnarii." },
    ],
    relatedCalculatorKeys: ["room-area", "paint-coverage", "tile-coverage"],
    relatedArticleSlugs: ["cum-calculezi-volumul-de-beton-pentru-fundatie"],
  },
  "paint-coverage": {
    shortDescription: "Estimeaza cata vopsea iti trebuie in functie de suprafata, numarul de straturi si acoperirea declarata.",
    intro: "Calculatorul de necesar vopsea este util cand vrei sa transformi rapid suprafata de lucru intr-o cantitate orientativa de material.",
    interpretationNotes: "Absorbtia suportului, trafaletul folosit si calitatea stratului de baza pot schimba necesarul real fata de eticheta produsului.",
    isFeatured: false,
    sortOrder: 130,
    example: "Pentru 48 mp, 2 straturi si o acoperire de 10 mp/l, necesarul este de aproximativ 9.6 l.",
    faq: [
      { question: "De ce conteaza numarul de straturi?", answer: "Pentru ca fiecare strat consuma material separat, iar suprafata trebuie inmultita cu numarul de aplicari." },
      { question: "Acoperirea de pe cutie este exacta?", answer: "Este orientativa. In practica, suportul si modul de aplicare pot schimba consumul." },
    ],
    relatedCalculatorKeys: ["room-area", "tile-coverage", "laminate-flooring"],
    relatedArticleSlugs: ["cum-estimezi-necesarul-de-vopsea"],
  },
  "tile-coverage": {
    shortDescription: "Calculeaza suprafata ajustata cu pierderi si numarul de cutii pentru gresie sau faianta.",
    intro: "Calculatorul de gresie si faianta este util cand vrei sa stii nu doar suprafata utila, ci si rezerva realista pentru taieturi si pierderi.",
    interpretationNotes: "Modelele cu montaj diagonal, camerele cu multe colturi sau placile cu dimensiuni speciale pot cere un procent mai mare de pierderi.",
    isFeatured: false,
    sortOrder: 140,
    example: "Pentru 24 mp, 10% pierderi si 1.44 mp/cutie, ajungi la circa 26.4 mp si 19 cutii.",
    faq: [
      { question: "Ce procent de pierderi aleg?", answer: "Pentru montaj drept procentul poate fi mai mic, iar pentru diagonal sau multe decupaje merita mai mult." },
      { question: "Se aplica la gresie si faianta in acelasi fel?", answer: "Formula de baza este aceeasi; difera doar contextul si procentul de rezerva ales." },
    ],
    relatedCalculatorKeys: ["room-area", "laminate-flooring", "paint-coverage"],
    relatedArticleSlugs: ["cum-calculezi-necesarul-de-gresie-si-faianta"],
  },
  "laminate-flooring": {
    shortDescription: "Estimeaza cate pachete de parchet iti trebuie dupa ce adaugi rezerva pentru taieturi.",
    intro: "Calculatorul de necesar parchet iti ofera un reper rapid pentru comanda de materiale si te ajuta sa eviti atat surplusul mare, cat si lipsa de material.",
    interpretationNotes: "Rezerva depinde de modelul de montaj, de forma camerei si de cat de mult material se pierde la taieturi.",
    isFeatured: false,
    sortOrder: 150,
    example: "Pentru 18 mp, 8% rezerva si 2.22 mp/pachet, ajungi la aproximativ 19.44 mp si 9 pachete.",
    faq: [
      { question: "De ce am nevoie de rezerva?", answer: "Pentru ca montajul produce inevitabil taieturi, iar o parte din material nu mai poate fi refolosit eficient." },
      { question: "Calculatorul merge si pentru SPC sau vinyl?", answer: "Da, daca stii acoperirea pe pachet si vrei doar o estimare de suprafata si pachete." },
    ],
    relatedCalculatorKeys: ["room-area", "tile-coverage", "paint-coverage"],
    relatedArticleSlugs: ["cum-calculezi-necesarul-de-gresie-si-faianta"],
  },
  "food-cost": {
    shortDescription: "Calculeaza food cost-ul si profitul brut pe portie pentru meniuri, cafenele si alte operatiuni horeca.",
    intro: "Calculatorul de food cost este util cand vrei sa vezi rapid daca pretul de vanzare lasa suficient spatiu pentru profit si pentru restul costurilor operationale.",
    interpretationNotes: "Food cost-ul este doar un reper. Pentru decizii bune trebuie completat cu personal, chirie, livrare, ambalaje si alte costuri indirecte.",
    isFeatured: true,
    sortOrder: 210,
    example: "La ingrediente de 12.5 lei si pret de vanzare 35 lei, food cost-ul este de aproximativ 35.71%, iar profitul brut 22.5 lei.",
    faq: [
      { question: "Un food cost mic inseamna automat produs bun?", answer: "Nu. Trebuie echilibrat cu volum, perceptia clientului si costurile totale ale operatiei." },
      { question: "Pot folosi calculatorul si pentru bauturi?", answer: "Da, formula este aceeasi daca introduci costul direct si pretul de vanzare." },
    ],
    relatedCalculatorKeys: ["profit-margin", "markup", "break-even"],
    relatedArticleSlugs: ["food-cost-explicat-pentru-horeca"],
  },
  "profit-margin": {
    shortDescription: "Calculeaza marja de profit si profitul brut pornind de la cost si pretul de vanzare.",
    intro: "Calculatorul de marja profit te ajuta sa vezi ce procent din pretul final ramane dupa costul direct si este util pentru pricing si comparatii rapide.",
    interpretationNotes: "Marja este utila ca indicator de decizie, dar nu trebuie confundata cu markup-ul, care raporteaza profitul la cost, nu la pretul final.",
    isFeatured: true,
    sortOrder: 220,
    example: "La cost 70 lei si pret de vanzare 100 lei, profitul brut este 30 lei, iar marja 30%.",
    faq: [
      { question: "Care este diferenta dintre marja si markup?", answer: "Marja raporteaza profitul la pretul de vanzare, iar markup-ul il raporteaza la cost." },
      { question: "De ce conteaza marja in business?", answer: "Pentru ca ajuta la pricing, comparatii intre produse si la evaluarea sustenabilitatii comerciale." },
    ],
    relatedCalculatorKeys: ["markup", "break-even", "roi"],
    relatedArticleSlugs: ["marja-vs-markup-explicate-simplu"],
  },
  markup: {
    shortDescription: "Calculeaza markup-ul comercial pentru a vedea cu cat ai crescut costul de baza pana la pretul de vanzare.",
    intro: "Calculatorul de markup este util cand lucrezi direct cu procente aplicate peste cost si vrei sa compari rapid politica de pret intre produse sau scenarii.",
    interpretationNotes: "Markup-ul nu spune direct cat la suta din pret reprezinta profit. Pentru asta trebuie sa te uiti si la marja.",
    isFeatured: false,
    sortOrder: 230,
    example: "La cost 70 lei si pret 100 lei, profitul brut este 30 lei, iar markup-ul este aproximativ 42.86%.",
    faq: [
      { question: "Pot avea markup mare si marja mica?", answer: "Da, pentru ca cele doua procente se raporteaza la baze diferite." },
      { question: "Cand este util markup-ul?", answer: "Cand construiesti pretul pornind de la cost si vrei o regula simpla de pricing." },
    ],
    relatedCalculatorKeys: ["profit-margin", "food-cost", "break-even"],
    relatedArticleSlugs: ["marja-vs-markup-explicate-simplu"],
  },
  "break-even": {
    shortDescription: "Estimeaza cate unitati trebuie sa vinzi ca sa acoperi costurile fixe si sa atingi pragul de rentabilitate.",
    intro: "Calculatorul break-even este util pentru scenarii de pricing, planificare si evaluarea rapida a volumului minim necesar pentru a nu ramane pe pierdere.",
    interpretationNotes: "Pragul de rentabilitate depinde mult de costurile reale si de variatia lor. Daca pretul sau costul variabil se schimba, recalcularea este obligatorie.",
    isFeatured: true,
    sortOrder: 240,
    example: "La 10.000 lei costuri fixe, 75 lei pret si 40 lei cost variabil, contributia este 35 lei/unitate, iar pragul este de aproximativ 286 unitati.",
    faq: [
      { question: "Ce se intampla daca contributia pe unitate este prea mica?", answer: "Pragul de rentabilitate urca mult si modelul poate deveni dificil de sustinut." },
      { question: "Calculatorul include taxe si reduceri?", answer: "Nu automat. Pentru scenarii reale, acestea trebuie integrate in costuri sau in pretul net folosit." },
    ],
    relatedCalculatorKeys: ["profit-margin", "markup", "roi"],
    relatedArticleSlugs: ["cum-calculezi-pragul-de-rentabilitate"],
  },
  roi: {
    shortDescription: "Calculeaza ROI-ul unei investitii pornind de la costul investitiei si valoarea obtinuta.",
    intro: "Calculatorul ROI este util pentru a evalua rapid daca o investitie merita comparativ cu alte optiuni sau scenarii de alocare a bugetului.",
    interpretationNotes: "ROI-ul simplifica realitatea si nu surprinde intotdeauna timpul, riscul sau costul capitalului. Este bun ca reper comparativ, nu ca verdict unic.",
    isFeatured: true,
    sortOrder: 250,
    example: "La o investitie de 10.000 lei si o valoare obtinuta de 13.500 lei, profitul net este 3.500 lei, iar ROI-ul 35%.",
    faq: [
      { question: "ROI mare inseamna automat investitie buna?", answer: "Nu. Conteaza si timpul in care obtii rezultatul, riscul si alternativele disponibile." },
      { question: "Pot compara doua proiecte doar prin ROI?", answer: "Este un punct de plecare bun, dar merita sa compari si durata, cash flow-ul si incertitudinea." },
    ],
    relatedCalculatorKeys: ["break-even", "profit-margin", "markup"],
    relatedArticleSlugs: ["cum-evaluezi-un-roi-fara-sa-fortezi-cifrele"],
  },
  "salary-increase": {
    shortDescription: "Compara salariul actual cu cel tinta si vezi diferenta in lei si in procente.",
    intro: "Calculatorul de crestere salariala te ajuta sa compari rapid oferta actuala cu salariul tinta si sa vezi clar diferentele importante.",
    interpretationNotes: "Rezultatul este util pentru orientare, dar o oferta salariala merita citita impreuna cu beneficiile, bonusurile si programul de lucru.",
    isFeatured: true,
    sortOrder: 10,
    audience: "both",
    releaseBatch: "batch-05",
    example: "De la 5.000 lei la 6.200 lei inseamna o crestere de 1.200 lei, adica aproximativ 24%.",
    faq: [
      { question: "Este mai util sa compar lei sau procente?", answer: "Ideal este sa le privesti impreuna. Suma absoluta arata impactul direct, iar procentul te ajuta sa compari mai corect doua scenarii." },
      { question: "Include bonusuri si beneficii?", answer: "Nu automat. Daca vrei o comparatie completa, adauga separat bonusurile si beneficiile recurente." },
    ],
    relatedCalculatorKeys: ["hourly-rate", "annual-income", "effective-tax-rate"],
    relatedArticleSlugs: ["cum-calculezi-cresterea-salariala-corect"],
  },
  "hourly-rate": {
    shortDescription: "Transforma salariul lunar intr-un tarif orar orientativ, util pentru comparatii si planificare.",
    intro: "Calculatorul de tarif orar te ajuta sa vezi mai clar cat valoreaza o ora de lucru atunci cand compari oferte, proiecte sau programe diferite.",
    interpretationNotes: "Tariful orar este orientativ. Daca ai ture, bonusuri variabile sau ore suplimentare, merita sa testezi mai multe scenarii.",
    isFeatured: true,
    sortOrder: 20,
    audience: "both",
    releaseBatch: "batch-05",
    example: "Un venit de 6.000 lei si 168 de ore lucrate inseamna aproximativ 35,71 lei pe ora.",
    faq: [
      { question: "De ce conteaza tariful orar?", answer: "Te ajuta sa compari oferte, proiecte sau venituri lunare diferite prin acelasi reper comun." },
      { question: "Ce ore folosesc in calcul?", answer: "Ideal folosesti numarul real de ore lucrate in luna analizata, nu doar programul teoretic." },
    ],
    relatedCalculatorKeys: ["monthly-work-hours", "annual-income", "salary-increase"],
    relatedArticleSlugs: ["cum-transformi-salariul-lunar-in-tarif-orar"],
  },
  "monthly-work-hours": {
    shortDescription: "Estimeaza cate ore lucrezi intr-o luna pe baza zilelor lucratoare si a programului zilnic.",
    intro: "Calculatorul de ore lucrate pe luna este un reper bun cand vrei sa transformi venitul lunar in tarif orar sau sa compari doua programe diferite.",
    interpretationNotes: "Rezultatul este orientativ daca apar ture, zile libere suplimentare sau ore suplimentare neincluse in scenariul standard.",
    isFeatured: false,
    sortOrder: 30,
    audience: "both",
    releaseBatch: "batch-05",
    example: "21 de zile lucratoare si 8 ore pe zi inseamna 168 de ore intr-o luna obisnuita.",
    faq: [
      { question: "Pot folosi acelasi numar de zile in fiecare luna?", answer: "Nu neaparat. Zilele lucratoare variaza si merita sa refaci calculul pentru luna reala analizata." },
      { question: "Include ore suplimentare?", answer: "Doar daca le adaugi explicit printr-un numar mai mare de ore sau zile." },
    ],
    relatedCalculatorKeys: ["hourly-rate", "annual-income"],
    relatedArticleSlugs: ["cate-ore-lucrezi-intr-o-luna-de-fapt"],
  },
  "annual-income": {
    shortDescription: "Porneste de la venitul lunar si estimeaza venitul anual, inclusiv bonusurile sau lunile suplimentare.",
    intro: "Calculatorul de venit anual te ajuta sa vezi imaginea mare atunci cand planifici bugetul, compari oferte sau separi salariul de bonusuri.",
    interpretationNotes: "Este o estimare buna pentru planificare, dar rezultatul merita ajustat daca veniturile variaza semnificativ de la o luna la alta.",
    isFeatured: false,
    sortOrder: 40,
    audience: "both",
    releaseBatch: "batch-05",
    example: "La 6.000 lei pe luna, 12 luni si 5.000 lei bonusuri, venitul anual este 77.000 lei.",
    faq: [
      { question: "Include bonusuri si prime?", answer: "Da, daca le introduci separat in campul dedicat bonusurilor anuale." },
      { question: "Este util si pentru compararea ofertelor?", answer: "Da. Venitul anual te ajuta sa compari oferte cu bonusuri, prime sau luni suplimentare de plata." },
    ],
    relatedCalculatorKeys: ["salary-increase", "hourly-rate", "effective-tax-rate"],
    relatedArticleSlugs: ["cum-estimezi-venitul-anual-fara-sa-amesteci-bonusurile-cu-salariul"],
  },
  "effective-tax-rate": {
    shortDescription: "Compara brutul cu netul si arata diferenta absoluta si rata efectiva de taxare.",
    intro: "Calculatorul de taxare efectiva te ajuta sa transformi diferenta dintre brut si net intr-un reper usor de citit atunci cand compari venituri sau oferte.",
    interpretationNotes: "Rata efectiva este un indicator orientativ. Ea nu explica automat structura exacta a contributiilor sau exceptiile fiscale aplicabile in fiecare caz.",
    isFeatured: true,
    sortOrder: 50,
    audience: "both",
    releaseBatch: "batch-05",
    example: "La 10.000 lei brut si 5.850 lei net, diferenta este 4.150 lei, adica aproximativ 41,5%.",
    faq: [
      { question: "Pot deduce din asta structura exacta a taxelor?", answer: "Nu complet. Calculatorul arata diferenta efectiva dintre brut si net, nu inlocuieste verificarea regulilor fiscale aplicabile." },
      { question: "De ce este utila rata efectiva?", answer: "Pentru ca te ajuta sa compari rapid scenarii salariale sau sa intelegi mai clar cat din brut ramane efectiv disponibil." },
    ],
    relatedCalculatorKeys: ["salary-increase", "annual-income", "hourly-rate"],
    relatedArticleSlugs: ["cum-citesti-diferenta-dintre-brut-net-si-taxare-efectiva"],
  },
  "credit-affordability": {
    shortDescription: "Estimeaza rata maxima suportabila si suma finantabila pornind de la venit, grad de indatorare, dobanda si perioada.",
    intro: "Calculatorul de rata maxima suportabila este util cand vrei sa vezi rapid ce imprumut poti sustine fara sa fortezi bugetul lunar.",
    interpretationNotes: "Rezultatul este orientativ. Eligibilitatea reala depinde si de politica institutiei, comisioane, scoring si alte angajamente financiare.",
    isFeatured: true,
    sortOrder: 10,
    audience: "both",
    releaseBatch: "batch-06",
    example: "La 8.500 lei venit, 40% grad de indatorare, fara alte rate, 7,5% dobanda si 240 luni, rata maxima trece de 3.000 lei si suma finantabila intra bine in zona locuintelor medii.",
    faq: [
      { question: "Este aceeasi cifra cu ce aproba banca?", answer: "Nu. Calculatorul ofera un reper rapid, dar aprobarea reala depinde si de scoring, comisioane, venituri eligibile si reguli interne." },
      { question: "De ce conteaza gradul de indatorare?", answer: "Pentru ca te ajuta sa pastrezi rata lunara intr-o zona suportabila si comparabila intre scenarii." },
    ],
    relatedCalculatorKeys: ["debt-to-income", "loan-total-cost", "down-payment"],
    relatedArticleSlugs: ["cum-afli-ce-rata-iti-permiti-fara-sa-iti-blochezi-bugetul"],
  },
  "debt-to-income": {
    shortDescription: "Arata ce procent din venitul lunar este deja consumat de rate si plati recurente.",
    intro: "Calculatorul de grad de indatorare este unul dintre cele mai utile repere cand vrei sa vezi daca bugetul tau suporta inca o rata sau are deja prea multe obligatii recurente.",
    interpretationNotes: "Indicatorul este util doar daca venitul si platile lunare sunt comparabile intre ele. Bonusurile neregulate sau cheltuielile ocazionale trebuie tratate separat.",
    isFeatured: false,
    sortOrder: 20,
    audience: "both",
    releaseBatch: "batch-06",
    example: "La 8.500 lei venit si 2.200 lei rate recurente, gradul de indatorare trece putin de 25%, iar bugetul ramas este inca relativ flexibil.",
    faq: [
      { question: "Include si cheltuielile uzuale ale casei?", answer: "Nu. Calculatorul compara in primul rand venitul cu platile recurente de datorii, nu cu toate cheltuielile lunare." },
      { question: "Cand devine util acest procent?", answer: "Cand compari doua scenarii de creditare, refinantare sau buget si vrei un reper simplu si coerent." },
    ],
    relatedCalculatorKeys: ["credit-affordability", "loan-total-cost", "emergency-fund"],
    relatedArticleSlugs: ["cum-afli-ce-rata-iti-permiti-fara-sa-iti-blochezi-bugetul"],
  },
  "loan-total-cost": {
    shortDescription: "Calculeaza rata lunara, dobanda totala si costul total al unui credit, ca sa compari corect perioada, dobanda si presiunea reala pe buget.",
    intro: "Calculatorul de cost total credit este una dintre cele mai importante pagini de decizie cand vrei sa vezi nu doar cat platesti lunar, ci cat te costa cu adevarat un imprumut pe toata perioada lui.",
    interpretationNotes: "Cifra devine utila doar daca pui alaturi macar doua scenarii: perioada scurta vs lunga, dobanda actuala vs refinantare, avans mai mic vs avans mai mare. Costul real poate creste suplimentar prin comisioane, asigurari si alte conditii contractuale.",
    isFeatured: true,
    sortOrder: 30,
    audience: "both",
    releaseBatch: "batch-06",
    example: "La 150.000 lei, 7,5% si 240 luni, rata lunara pare suportabila, dar costul total ajunge mult peste principalul imprumutat.",
    examples: [
      {
        title: "Credit ipotecar pe termen lung",
        narrative:
          "La 250.000 lei, 7,2% si 360 luni, rata lunara poate parea rezonabila la prima vedere, dar dobanda totala ajunge sa cantareasca aproape la fel de greu ca suma finantata.",
      },
      {
        title: "Perioada mai scurta, presiune lunara mai mare",
        narrative:
          "Acelasi credit pe 180 luni ridica rata lunara, dar reduce agresiv costul total. Exact aici pagina te ajuta sa vezi daca sacrificiul lunar merita pe termen lung.",
      },
      {
        title: "Credit de consum mai scurt, dar mai scump",
        narrative:
          "La o perioada mica si o dobanda mare, costul total poate ramane surprinzator de ridicat chiar daca imprumutul pare usor de absorbit ca suma.",
      },
    ],
    faq: [
      { question: "De ce nu este suficienta doar rata lunara?", answer: "Pentru ca o rata mai mica poate ascunde un cost total mult mai mare atunci cand perioada este foarte lunga si dobanda lucreaza multi ani." },
      { question: "Calculatorul include toate costurile bancii?", answer: "Nu automat. El porneste de la dobanda si perioada, iar costurile suplimentare precum comisioane sau asigurari trebuie adaugate separat in analiza finala." },
      { question: "Cand este util sa compar doua perioade diferite?", answer: "Exact atunci cand vrei sa vezi daca economia din rata lunara compenseaza cresterea costului total pe termen lung." },
      { question: "Cu ce alte pagini merita legat?", answer: "Cu rata maxima suportabila, refinantarea si avansul, ca sa nu citesti creditul izolat de restul bugetului." },
    ],
    relatedCalculatorKeys: ["credit-affordability", "refinance-savings", "down-payment"],
    relatedArticleSlugs: ["cum-citesti-costul-total-al-unui-credit"],
    seo: {
      metaTitle: "Calculator cost total credit si rata lunara",
      metaDescription:
        "Calculeaza rata lunara, dobanda totala si costul total al unui credit. Compara perioada, dobanda si impactul real asupra bugetului.",
    },
    extraBlocks: [
      {
        blockType: "facts",
        eyebrow: "Raspuns rapid",
        title: "Ce vrei de fapt sa afli aici",
        intro:
          "Pagina este utila cand vrei sa vezi repede daca un credit este doar suportabil lunar sau si sanatos ca pret total.",
        tone: "mist",
        items: [
          {
            value: "Rata lunara",
            label: "presiunea imediata pe buget",
            detail:
              "Buna pentru orientare rapida, dar insuficienta singura.",
          },
          {
            value: "Dobanda totala",
            label: "pretul banilor imprumutati",
            detail:
              "Te ajuta sa vezi cat platesti in plus peste principal.",
          },
          {
            value: "Cost total",
            label: "cifra care inchide comparatia",
            detail:
              "Aici se vede cu adevarat diferenta dintre scenarii.",
          },
        ],
      },
      {
        blockType: "story",
        eyebrow: "Cum citesti bine rezultatul",
        title: "O rata suportabila nu inseamna automat un credit bun",
        body:
          "Daca perioada este foarte lunga, costul total poate creste mult mai repede decat pare din rata lunara. Citeste pagina ca instrument de comparatie intre scenarii, nu doar ca raspuns punctual la intrebarea cat iti iese pe luna.",
        tone: "sand",
      },
    ],
  },
  "refinance-savings": {
    shortDescription: "Compara rata veche cu rata noua si estimeaza economia neta dupa costul refinantarii.",
    intro: "Calculatorul de refinantare este util cand vrei sa vezi daca scaderea ratei lunare compenseaza cu adevarat costul mutarii creditului intr-un produs nou.",
    interpretationNotes: "O refinantare pare atractiva la nivel de rata lunara, dar merita judecata si prin costul total ramas, comisioane si orizontul in care recuperezi costul initial.",
    isFeatured: true,
    sortOrder: 40,
    audience: "both",
    releaseBatch: "batch-06",
    example: "Daca noua rata scade cu 370 lei pe luna, dar refinantarea costa 3.500 lei, recuperezi costul in cateva luni si apoi economia devine net pozitiva.",
    faq: [
      { question: "Rata mai mica inseamna automat refinantare buna?", answer: "Nu. Merita sa verifici si costul total ramas, comisioanele si cate luni mai ai de plata." },
      { question: "Cand e util pragul de recuperare?", answer: "Cand vrei sa vezi in cate luni acoperi costul refinantarii doar din diferenta dintre cele doua rate." },
    ],
    relatedCalculatorKeys: ["loan-total-cost", "credit-affordability", "debt-to-income"],
    relatedArticleSlugs: ["cand-merita-refinantarea-si-cand-doar-pare-o-idee-buna"],
  },
  "emergency-fund": {
    shortDescription: "Estimeaza suma-tinta pentru fondul de urgenta pornind de la cheltuielile lunare si numarul de luni de acoperire dorit.",
    intro: "Calculatorul de fond de urgenta este util cand vrei sa transformi o regula generala intr-o suma clara si usor de urmarit in timp.",
    interpretationNotes: "Fondul de urgenta nu este acelasi lucru cu economiile pentru obiective sau cu investitiile. El trebuie gandit in primul rand pentru lichiditate si stabilitate.",
    isFeatured: true,
    sortOrder: 50,
    audience: "both",
    releaseBatch: "batch-06",
    example: "La 4.200 lei cheltuieli esentiale si 6 luni de acoperire, tinta fondului de urgenta ajunge la 25.200 lei.",
    faq: [
      { question: "De ce folosesc cheltuieli esentiale, nu toate cheltuielile?", answer: "Pentru ca fondul de urgenta este gandit in primul rand sa acopere functionarea minima a bugetului in perioade dificile." },
      { question: "Unde ar trebui tinut fondul?", answer: "De obicei intr-o forma foarte lichida si usor accesibila, nu intr-un produs care blocheaza banii pe termen lung." },
    ],
    relatedCalculatorKeys: ["goal-timeline", "savings-interest", "debt-to-income"],
    relatedArticleSlugs: ["cum-iti-construiesti-fondul-de-urgenta-fara-sa-ramai-fara-lichiditati"],
  },
  "savings-interest": {
    shortDescription: "Estimeaza evolutia economiilor din suma initiala, contributii lunare si dobanda.",
    intro: "Calculatorul de dobanda economii te ajuta sa vezi cum se schimba o strategie simpla de economisire atunci cand adaugi capitalizare si timp.",
    interpretationNotes: "Rezultatul este orientativ. In practica, randamentul poate varia, iar fiscalitatea sau comisioanele produsului folosit pot schimba valoarea finala.",
    isFeatured: false,
    sortOrder: 60,
    audience: "both",
    releaseBatch: "batch-06",
    example: "O suma initiala de 10.000 lei, plus 750 lei pe luna si 4,5% pe an, produce o diferenta semnificativa fata de simpla adunare liniara dupa cativa ani.",
    faq: [
      { question: "De ce conteaza asa mult timpul?", answer: "Pentru ca dobanda acumulata incepe sa lucreze la randul ei, iar efectul devine vizibil mai ales pe perioade mai lungi." },
      { question: "Este acelasi lucru cu investitiile?", answer: "Nu neaparat. Formula poate fi folosita orientativ si pentru alte scenarii, dar randamentul real si riscul pot fi foarte diferite." },
    ],
    relatedCalculatorKeys: ["goal-timeline", "retirement-savings", "emergency-fund"],
    relatedArticleSlugs: ["cum-planifici-economii-pe-termen-lung-pentru-obiective-mari"],
  },
  "retirement-savings": {
    shortDescription: "Proiecteaza acumularea unei contributii lunare pe termen lung pentru obiective de pensie si independenta financiara.",
    intro: "Calculatorul de economii pentru pensie este util cand vrei sa vezi ce poate produce consistenta pe termen lung, nu doar randamentul teoretic.",
    interpretationNotes: "Orice proiectie pe zeci de ani este sensibilă la randament, inflatie si disciplina de contributie. Rezultatul merita citit ca scenariu, nu ca promisiune.",
    isFeatured: false,
    sortOrder: 70,
    audience: "consumer",
    releaseBatch: "batch-06",
    example: "1.000 lei pe luna timp de 25 de ani, la un randament moderat, poate construi un capital surprinzator de mare fata de intuitia initiala.",
    faq: [
      { question: "De ce este util sa vad si totalul depus?", answer: "Pentru ca te ajuta sa separi clar ce vine din disciplina ta si ce vine din randamentul estimat." },
      { question: "Pot folosi calculatorul si pentru alte obiective lungi?", answer: "Da. Formula este utila si pentru alte obiective pe termen lung, atata timp cat intelegi limitarile scenariului." },
    ],
    relatedCalculatorKeys: ["savings-interest", "goal-timeline", "emergency-fund"],
    relatedArticleSlugs: ["cum-planifici-economii-pe-termen-lung-pentru-obiective-mari"],
  },
  "goal-timeline": {
    shortDescription: "Estimeaza in cate luni sau ani poti ajunge la un obiectiv financiar pornind de la ritmul actual de economisire.",
    intro: "Calculatorul de termen obiectiv economisire este util cand ai o tinta clara si vrei sa vezi cat de realist este calendarul pe care ti-l propui.",
    interpretationNotes: "Rezultatul depinde puternic de constanta contributiilor si de randamentul presupus. Daca una dintre ele variaza mult, termenul real se muta.",
    isFeatured: false,
    sortOrder: 80,
    audience: "both",
    releaseBatch: "batch-06",
    example: "La o tinta de 100.000 lei, 10.000 lei deja pusi deoparte si 1.200 lei economisiti lunar, termenul scade vizibil cand adaugi si o dobanda moderata.",
    faq: [
      { question: "Este mai bun decat calculatorul de economii?", answer: "Depinde de punctul de plecare. Aici pleci de la tinta finala si vrei sa afli timpul, nu suma pe care o vei strange." },
      { question: "De ce foloseste simulare iterativa?", answer: "Pentru ca termenul depinde de acumulare progresiva, nu doar de o operatie simpla intr-un singur pas." },
    ],
    relatedCalculatorKeys: ["savings-interest", "emergency-fund", "down-payment"],
    relatedArticleSlugs: ["cum-planifici-economii-pe-termen-lung-pentru-obiective-mari"],
  },
  "lease-vs-loan": {
    shortDescription: "Compara costul total dintre doua scenarii de finantare: leasing si credit.",
    intro: "Calculatorul de leasing vs credit este util cand vrei sa pui cele doua scenarii pe aceeasi masa si sa vezi rapid care este mai ieftin in forma lui cea mai simpla.",
    interpretationNotes: "Comparatia este orientativa. Fiscalitatea, asigurarile, valoarea reziduala, comisioanele si deducerile pot schimba semnificativ rezultatul final.",
    isFeatured: false,
    sortOrder: 90,
    audience: "both",
    releaseBatch: "batch-06",
    example: "Doua scenarii care par apropiate la rata lunara pot avea cost total foarte diferit dupa ce adaugi avansul si valoarea finala.",
    faq: [
      { question: "Este suficient costul total ca sa aleg intre ele?", answer: "Nu mereu. Flexibilitatea, tratamentul fiscal, proprietatea finala si nevoia operationala conteaza la fel de mult." },
      { question: "Pot folosi calculatorul si pentru masini, si pentru echipamente?", answer: "Da, daca lucrezi cu aceeasi logica de avans, rate lunare si cost final comparabil." },
    ],
    relatedCalculatorKeys: ["loan-total-cost", "down-payment", "credit-affordability"],
    relatedArticleSlugs: ["leasing-vs-credit-cum-compari-corect-doua-scenarii-de-finantare"],
  },
  "down-payment": {
    shortDescription: "Transforma procentul de avans intr-o suma concreta si arata cat mai ramane de finantat.",
    intro: "Calculatorul de avans este util cand vrei sa vezi imediat ce inseamna in bani un procent cerut pentru o locuinta, masina sau alta achizitie finantata.",
    interpretationNotes: "Un procent mic de avans poate face finantarea mai usor accesibila pe termen scurt, dar poate creste presiunea pe rata lunara si pe costul total.",
    isFeatured: true,
    sortOrder: 100,
    audience: "both",
    releaseBatch: "batch-06",
    example: "La 450.000 lei si 15% avans, suma initiala trece de 67.000 lei, iar restul ramane pentru finantare.",
    faq: [
      { question: "Avansul mai mare inseamna automat alegere mai buna?", answer: "Nu automat, dar de multe ori reduce suma finantata si poate imbunatati conditiile generale ale creditului." },
      { question: "Cum il folosesc impreuna cu alte calculatoare?", answer: "Cel mai util este sa il legi de rata maxima suportabila si de costul total al creditului pentru acelasi scenariu." },
    ],
    relatedCalculatorKeys: ["credit-affordability", "loan-total-cost", "goal-timeline"],
    relatedArticleSlugs: ["cum-afli-ce-rata-iti-permiti-fara-sa-iti-blochezi-bugetul"],
  },
  roas: {
    shortDescription: "Masoara de cate ori recuperezi bugetul ads prin venitul atribuit campaniilor.",
    intro: "Calculatorul ROAS este un punct de plecare excelent cand vrei sa vezi repede daca o campanie aduce suficient venit raportat la bugetul investit.",
    interpretationNotes: "ROAS-ul nu este acelasi lucru cu profitul. Fara context de marja, taxe, retururi sau costuri operationale, cifra poate arata mai bine decat realitatea.",
    isFeatured: true,
    sortOrder: 10,
    audience: "business",
    releaseBatch: "batch-07",
    example: "La 12.000 lei buget ads si 54.000 lei venit atribuit, ROAS-ul este 4,5, adica fiecare leu investit aduce 4,5 lei venit.",
    faq: [
      { question: "Un ROAS mare inseamna automat campanie buna?", answer: "Nu. Trebuie comparat cu marja, cu costurile de fulfillment si cu obiectivul de profit." },
      { question: "Pot compara doua campanii cu ROAS diferit?", answer: "Da, dar ideal pe aceeasi perioada si cu aceeasi logica de atribuire." },
    ],
    relatedCalculatorKeys: ["break-even-roas", "cac", "target-revenue"],
    relatedArticleSlugs: ["cum-citesti-roas-fara-sa-confunzi-venitul-cu-profitul"],
  },
  "break-even-roas": {
    shortDescription: "Arata ROAS-ul minim de la care campania nu mai pierde bani la marja curenta.",
    intro: "Calculatorul de break-even ROAS este util cand vrei sa transformi marja bruta intr-un prag concret pentru advertising, nu doar intr-o intuitie vagă.",
    interpretationNotes: "Daca marja folosita nu include toate costurile relevante, break-even ROAS-ul va parea mai confortabil decat este in realitate.",
    isFeatured: true,
    sortOrder: 20,
    audience: "business",
    releaseBatch: "batch-07",
    example: "La o marja disponibila de 35%, break-even ROAS-ul este aproximativ 2,86. Sub pragul asta, campania intra usor pe pierdere.",
    faq: [
      { question: "Se aplica si la lead generation?", answer: "Da, daca poti transforma lead-ul in venit sau valoare economica comparabila." },
      { question: "Este suficient pentru decizii de scalare?", answer: "Nu singur. Merita legat de ROAS real, CAC si viteza de conversie." },
    ],
    relatedCalculatorKeys: ["roas", "gross-profit", "target-revenue"],
    relatedArticleSlugs: ["break-even-roas-explicat-pentru-campanii-platite"],
  },
  aov: {
    shortDescription: "Calculeaza valoarea medie a comenzii si te ajuta sa citesti mai bine performanta comerciala.",
    intro: "Calculatorul AOV este util cand vrei sa vezi daca cresterea veniturilor vine din mai multe comenzi sau din comenzi mai valoroase.",
    interpretationNotes: "AOV-ul este mai valoros cand este citit impreuna cu rata de conversie si cu marja, nu separat.",
    isFeatured: false,
    sortOrder: 30,
    audience: "business",
    releaseBatch: "batch-07",
    example: "La 180.000 lei venit si 1.200 comenzi, valoarea medie a comenzii este 150 lei.",
    faq: [
      { question: "AOV mai mare inseamna mereu progres?", answer: "Nu neaparat. Poate veni si din scumpiri, nu doar din mix mai bun sau upsell." },
      { question: "Cu ce il leg prima data?", answer: "Cu rata de conversie si cu marja produselor vandute." },
    ],
    relatedCalculatorKeys: ["conversion-rate", "gross-profit", "roas"],
    relatedArticleSlugs: ["aov-si-rata-de-conversie-ce-spun-impreuna-despre-funnel"],
  },
  "conversion-rate": {
    shortDescription: "Arata ce procent din trafic se transforma in comenzi, lead-uri sau alta actiune relevanta.",
    intro: "Calculatorul de rata de conversie este util cand vrei sa vezi daca problema este in trafic, in oferta sau in pasii finali ai funnel-ului.",
    interpretationNotes: "O rata de conversie buna depinde de canal, de intentie si de tipul conversiei. De aceea merita comparata in contexte similare.",
    isFeatured: false,
    sortOrder: 40,
    audience: "business",
    releaseBatch: "batch-07",
    example: "La 25.000 vizitatori si 650 conversii, rata de conversie este 2,6%.",
    faq: [
      { question: "Pot folosi sesiuni in loc de utilizatori?", answer: "Da, daca ramai consecvent in aceeasi metoda de raportare." },
      { question: "De ce conteaza AOV impreuna cu conversia?", answer: "Pentru ca una iti spune cat de des vinzi, iar cealalta cat valoreaza fiecare vanzare." },
    ],
    relatedCalculatorKeys: ["aov", "cpl", "cac"],
    relatedArticleSlugs: ["aov-si-rata-de-conversie-ce-spun-impreuna-despre-funnel"],
  },
  cpl: {
    shortDescription: "Calculeaza costul per lead si te ajuta sa compari canale sau campanii de generare lead-uri.",
    intro: "Calculatorul CPL este bun cand vrei sa vezi rapid cat te costa sa alimentezi pipeline-ul, chiar inainte sa transformi lead-urile in clienti.",
    interpretationNotes: "CPL-ul are sens doar daca lead-ul are definitie stabila. Daca schimbi criteriile de calificare, comparatia se strica.",
    isFeatured: false,
    sortOrder: 50,
    audience: "business",
    releaseBatch: "batch-07",
    example: "La 8.500 lei cost total si 210 lead-uri, CPL-ul este putin peste 40 lei.",
    faq: [
      { question: "Un CPL mic este automat bun?", answer: "Nu. Lead-ul ieftin dar slab calificat poate costa mai mult in vanzari si follow-up." },
      { question: "Cand il leg de CAC?", answer: "Cand vrei sa vezi cat din costul de achizitie se pierde intre lead si client nou." },
    ],
    relatedCalculatorKeys: ["cac", "conversion-rate", "roas"],
    relatedArticleSlugs: ["cum-calculezi-cac-si-cpl-fara-sa-amesteci-canalele"],
  },
  cac: {
    shortDescription: "Calculeaza costul real de achizitie al unui client nou intr-o perioada data.",
    intro: "Calculatorul CAC este util cand vrei sa vezi cat te costa cresterea si daca modelul comercial are loc suficient pentru profit si scalare.",
    interpretationNotes: "CAC-ul trebuie comparat cu marja si cu valoarea clientului in timp. Fara acest context, cifra singura poate induce decizii gresite.",
    isFeatured: true,
    sortOrder: 60,
    audience: "business",
    releaseBatch: "batch-07",
    example: "La 42.000 lei cost total si 140 clienti noi, CAC-ul este 300 lei per client.",
    faq: [
      { question: "Includ si costurile echipei de vanzari?", answer: "Ideal da, daca vrei un CAC mai aproape de realitate." },
      { question: "Cu ce il compar prima data?", answer: "Cu AOV, marja si timpul in care clientul ramane activ." },
    ],
    relatedCalculatorKeys: ["cpl", "roas", "target-revenue"],
    relatedArticleSlugs: ["cum-calculezi-cac-si-cpl-fara-sa-amesteci-canalele"],
  },
  "target-revenue": {
    shortDescription: "Transforma costurile si profitul tinta intr-un venit minim clar pentru perioada urmatoare.",
    intro: "Calculatorul de venit tinta este util cand vrei sa treci de la obiectiv vag la cifra concreta de vanzari, folosind marja reala a businessului.",
    interpretationNotes: "Daca marja folosita este prea optimista, venitul tinta va iesi artificial mai mic si poate duce la planuri greu de sustinut.",
    isFeatured: true,
    sortOrder: 70,
    audience: "business",
    releaseBatch: "batch-07",
    example: "Cu 60.000 lei costuri fixe, 30.000 lei profit tinta si 40% marja, venitul minim necesar ajunge la 225.000 lei.",
    faq: [
      { question: "Pot folosi marja neta in loc de marja bruta?", answer: "Doar daca esti consecvent si intelegi exact ce costuri ai inclus deja in baza de calcul." },
      { question: "Cu ce il leg in pagina?", answer: "Cu profit brut, profit net si ROAS, pentru ca toate contribuie la realismul planului." },
    ],
    relatedCalculatorKeys: ["gross-profit", "net-profit", "roas"],
    relatedArticleSlugs: ["cum-estimezi-targetul-de-venit-si-profitul-real"],
  },
  "gross-profit": {
    shortDescription: "Arata ce ramane dupa costurile directe si te ajuta sa vezi daca modelul merita sustinut.",
    intro: "Calculatorul de profit brut este util cand vrei sa verifici rapid daca pretul, costul si volumul se intalnesc intr-o marja care poate sustine businessul.",
    interpretationNotes: "Profitul brut nu include toate costurile. El este primul filtru bun, dar nu verdictul final despre rentabilitate.",
    isFeatured: false,
    sortOrder: 80,
    audience: "business",
    releaseBatch: "batch-07",
    example: "La 150.000 lei venit si 90.000 lei costuri directe, profitul brut este 60.000 lei, iar marja bruta ajunge la 40%.",
    faq: [
      { question: "De ce mai am nevoie si de profit net?", answer: "Pentru ca profitul brut nu include chirii, salarii, software sau alte costuri indirecte." },
      { question: "Cu ce il leg pentru marketing?", answer: "Cu break-even ROAS si venit tinta." },
    ],
    relatedCalculatorKeys: ["net-profit", "break-even-roas", "target-revenue"],
    relatedArticleSlugs: ["cum-estimezi-targetul-de-venit-si-profitul-real"],
  },
  "net-profit": {
    shortDescription: "Calculeaza ce ramane dupa toate costurile incluse in scenariu si ofera o marja neta orientativa.",
    intro: "Calculatorul de profit net este util cand vrei sa treci de la performanta comerciala bruta la o imagine mai apropiata de realitatea businessului.",
    interpretationNotes: "Rezultatul depinde complet de ce costuri incluzi. El este orientativ, nu inlocuieste contabilitatea sau raportarea financiara completa.",
    isFeatured: false,
    sortOrder: 90,
    audience: "business",
    releaseBatch: "batch-07",
    example: "La 150.000 lei venit si 118.000 lei cost total, profitul net ajunge la 32.000 lei, cu o marja neta de circa 21%.",
    faq: [
      { question: "E acelasi lucru cu profitul contabil?", answer: "Nu neaparat. Calculatorul este orientativ si depinde de structura costurilor pe care o introduci." },
      { question: "Cand devine util in decizie?", answer: "Cand compari scenarii si vrei sa vezi ce ramane cu adevarat dupa toate costurile incluse." },
    ],
    relatedCalculatorKeys: ["gross-profit", "target-revenue", "roi"],
    relatedArticleSlugs: ["cum-estimezi-targetul-de-venit-si-profitul-real"],
  },
  "inventory-turnover": {
    shortDescription: "Arata de cate ori se roteste stocul si cate zile ramane marfa blocata in medie.",
    intro: "Calculatorul de rotatie stoc este util pentru ecommerce, retail sau distributie cand vrei sa vezi daca stocul lucreaza sau doar consuma capital.",
    interpretationNotes: "Rotatia trebuie interpretata pe categorie si pe sezon. Un prag bun pentru un produs poate fi prea lent sau prea agresiv pentru altul.",
    isFeatured: false,
    sortOrder: 100,
    audience: "business",
    releaseBatch: "batch-07",
    example: "La 420.000 lei cost marfa vanduta si 70.000 lei stoc mediu, rotatia este 6 ori in perioada analizata.",
    faq: [
      { question: "Rotatie mare inseamna automat situatie buna?", answer: "Nu mereu. Poate insemna si stoc insuficient, rupturi de disponibilitate sau presiune pe supply." },
      { question: "Cu ce o leg in acelasi cluster?", answer: "Cu venit tinta si profit, mai ales daca lucrezi cu capital blocat in marfa." },
    ],
    relatedCalculatorKeys: ["target-revenue", "gross-profit", "net-profit"],
    relatedArticleSlugs: ["rotatia-stocului-explicata-pentru-ecommerce-si-retail"],
  },
  "appliance-electricity-cost": {
    shortDescription: "Estimeaza rapid consumul si costul unui aparat electric pe luna si pe an.",
    intro: "Calculatorul de consum al unui aparat electric este cel mai bun punct de plecare cand vrei sa legi puterea unui dispozitiv de impactul lui real in factura.",
    interpretationNotes: "Rezultatul depinde de puterea reala in functionare si de timpul efectiv de utilizare. Multi consumatori confunda puterea maxima cu consumul constant.",
    isFeatured: true,
    sortOrder: 10,
    audience: "consumer",
    releaseBatch: "batch-08",
    example: "Un aparat de 1.800 W folosit 2 ore pe zi ajunge usor la peste 100 kWh pe luna si iti arata imediat ce inseamna asta in bani.",
    faq: [
      { question: "Pot folosi calculatorul pentru orice aparat?", answer: "Da, atat timp cat ai o putere estimata si un timp realist de functionare." },
      { question: "De ce difera uneori fata de factura reala?", answer: "Pentru ca unele aparate nu consuma constant la puterea nominala, iar tariful poate include si alte componente." },
    ],
    relatedCalculatorKeys: ["monthly-electricity-bill", "solar-system-size", "solar-payback"],
    relatedArticleSlugs: ["cum-estimezi-consumul-real-al-electrocasnicelor-din-casa"],
  },
  "monthly-electricity-bill": {
    shortDescription: "Transforma consumul lunar total intr-o factura estimata si intr-un cost anual usor de comparat, ca sa vezi repede ce muta cu adevarat bugetul casei.",
    intro: "Calculatorul de factura de curent este una dintre cele mai bune pagini din clusterul de energie pentru casa, pentru ca leaga direct consumul real de bani, de obiceiuri si de decizii despre eficienta sau fotovoltaice.",
    interpretationNotes: "Pretul final pe kWh si costurile fixe pot varia intre furnizori, contracte si perioade. Foloseste-l ca reper comparativ, nu ca factura exacta, iar pentru decizii importante testeaza si un scenariu prudent, si unul optimist.",
    isFeatured: true,
    sortOrder: 20,
    audience: "consumer",
    releaseBatch: "batch-08",
    example: "La 280 kWh pe luna si 0,95 lei/kWh, factura sare de 270 lei chiar inainte sa discuti de economii sau panouri.",
    examples: [
      {
        title: "Garsoniera cu consum moderat",
        narrative:
          "La aproximativ 160 kWh pe luna si un tarif all-in realist, factura ramane gestionabila, dar devine un reper bun pentru orice comparatie cu scenarii de economie.",
      },
      {
        title: "Apartament cu mai multe aparate",
        narrative:
          "Cand consumul urca spre 320-360 kWh pe luna, diferentele mici de pret pe kWh se transforma rapid in zeci de lei pe luna si sute pe an.",
      },
      {
        title: "Casa cu climatizare vara",
        narrative:
          "Intr-un sezon cu aer conditionat, consumul sare usor peste baza obisnuita. Exact aici merita sa compari factura curenta cu amortizarea unor upgrade-uri energetice.",
      },
    ],
    faq: [
      { question: "Include si toate taxele de pe factura?", answer: "Depinde de pretul pe kWh introdus. Daca el este all-in, estimarea devine mai apropiata de realitate." },
      { question: "Ce schimba factura cel mai mult?", answer: "De obicei combinatia dintre consumul lunar real, tariful complet pe kWh si aparatele care ruleaza multe ore pe luna." },
      { question: "Merita sa compar mai multe scenarii?", answer: "Da. Diferenta dintre 250 si 350 kWh pe luna spune mult mai mult despre presiunea pe buget decat o cifra singulara vazuta o singura data." },
      { question: "Cu ce il leg mai departe?", answer: "Cu calculatoarele de panouri, productie si amortizare, daca vrei sa vezi daca merita investitia." },
    ],
    relatedCalculatorKeys: ["appliance-electricity-cost", "solar-system-size", "solar-payback"],
    relatedArticleSlugs: ["cum-citesti-factura-de-curent-fara-sa-te-pierzi-in-detalii-inutile"],
    seo: {
      metaTitle: "Calculator factura curent online",
      metaDescription:
        "Estimeaza factura de curent din consumul lunar, pretul pe kWh si costurile fixe. Compara scenarii si vezi costul anual.",
    },
    extraBlocks: [
      {
        blockType: "facts",
        eyebrow: "Ce muta factura",
        title: "Cele trei variabile care conteaza cel mai mult",
        intro:
          "Pagina este buna pentru answer-first, dar devine si mai utila cand separi clar consumul, tariful si costurile fixe.",
        tone: "mist",
        items: [
          {
            value: "Consum lunar",
            label: "kWh folositi in casa",
            detail:
              "Aici se vede cel mai repede daca problema este comportamentul sau echipamentul.",
          },
          {
            value: "Pret pe kWh",
            label: "tarif complet din contract",
            detail:
              "Un tarif all-in ajuta mult la o estimare mai apropiata de realitate.",
          },
          {
            value: "Costuri fixe",
            label: "partea care ramane chiar si cand consumul scade",
            detail:
              "Util pentru comparatii intre furnizori si intre luni.",
          },
        ],
      },
      {
        blockType: "story",
        eyebrow: "Ce sa nu ratezi",
        title: "Factura buna de citit nu este doar cea mai mica, ci cea pe care o poti explica",
        body:
          "Daca nu stii ce aparat sau obicei muta consumul, cifra finala ramane greu de optimizat. Pagina te ajuta sa transformi factura din surpriza lunara intr-un reper pe care il poti compara si controla.",
        tone: "sand",
      },
    ],
  },
  "solar-system-size": {
    shortDescription: "Estimeaza puterea sistemului fotovoltaic necesar pornind de la consumul anual si nivelul de acoperire dorit.",
    intro: "Calculatorul de necesar pentru sistem fotovoltaic este util cand vrei sa transformi consumul anual intr-o dimensiune de sistem, fara sa pornesti din oferte vagi.",
    interpretationNotes: "Dimensiunea rezultata depinde mult de productia specifica folosita. Pentru o estimare mai buna merita validata ulterior cu PVGIS sau cu date locale.",
    isFeatured: true,
    sortOrder: 30,
    audience: "consumer",
    releaseBatch: "batch-08",
    example: "La 4.200 kWh pe an si 90% acoperire, sistemul necesar poate intra in zona de aproximativ 2,8-3,2 kWp, in functie de ipoteze.",
    faq: [
      { question: "Trebuie sa acopar 100% din consum?", answer: "Nu neaparat. Uneori scenariile de 70-90% sunt mai realiste si mai eficiente economic." },
      { question: "Cu ce il leg imediat?", answer: "Cu productia fotovoltaica, numarul de panouri si amortizarea." },
    ],
    relatedCalculatorKeys: ["solar-production", "solar-panel-count", "solar-payback"],
    relatedArticleSlugs: ["cate-panouri-fotovoltaice-iti-trebuie-de-fapt"],
  },
  "solar-production": {
    shortDescription: "Estimeaza productia anuala si lunara medie a unui sistem fotovoltaic dupa puterea instalata.",
    intro: "Calculatorul de productie fotovoltaica este util cand vrei sa legi puterea sistemului de energia pe care o poti produce intr-un an obisnuit.",
    interpretationNotes: "Productia reala variaza cu orientarea, inclinarea, umbrirea, temperatura si calitatea instalarii. Estimarea este utila mai ales pentru comparatii.",
    isFeatured: true,
    sortOrder: 40,
    audience: "consumer",
    releaseBatch: "batch-08",
    example: "Un sistem de 5,5 kWp poate produce peste 6.000 kWh/an intr-un scenariu bun, dar merita sa verifici ipoteza pentru zona ta.",
    faq: [
      { question: "Este productie garantata?", answer: "Nu. Este o estimare orientativa care trebuie citita ca interval si validata local." },
      { question: "Merita sa folosesc si PVGIS?", answer: "Da, mai ales cand vrei o estimare mai apropiata de locatie si configuratie." },
    ],
    relatedCalculatorKeys: ["solar-system-size", "solar-payback", "solar-battery-size"],
    relatedArticleSlugs: ["cum-estimezi-productia-fotovoltaica-fara-promisiuni-umflate"],
  },
  "solar-panel-count": {
    shortDescription: "Transforma puterea dorita a sistemului intr-un numar estimat de panouri si suprafata ocupata.",
    intro: "Calculatorul de numar panouri este util cand ai deja o tinta de sistem si vrei sa vezi daca acoperisul sau spatiul disponibil o poate sustine.",
    interpretationNotes: "Suprafata reala necesara depinde de geometria acoperisului, distante de siguranta, umbre si tipul panourilor alese.",
    isFeatured: false,
    sortOrder: 50,
    audience: "consumer",
    releaseBatch: "batch-08",
    example: "Pentru un sistem de 6 kWp cu panouri de 450 W, ajungi rapid la aproximativ 14 panouri si peste 29 mp ocupati.",
    faq: [
      { question: "Pot folosi orice suprafata disponibila?", answer: "Nu intotdeauna. Forma acoperisului si zonele umbrite pot reduce spatiul util." },
      { question: "Cu ce il leg in pagina?", answer: "Cu necesarul sistemului si productia fotovoltaica, ca sa vezi daca spatiul are sens pentru obiectivul tau." },
    ],
    relatedCalculatorKeys: ["solar-system-size", "solar-production", "solar-payback"],
    relatedArticleSlugs: ["cate-panouri-fotovoltaice-iti-trebuie-de-fapt"],
  },
  "solar-payback": {
    shortDescription: "Arata in cati ani se poate amortiza un sistem fotovoltaic dupa cost, economii si mentenanta, ca sa nu confunzi entuziasmul investitiei cu randamentul ei real.",
    intro: "Calculatorul de amortizare pentru panouri fotovoltaice este una dintre cele mai importante pagini de decizie din clusterul de energie pentru casa, pentru ca transforma discutia despre panouri din promisiune vaga in scenariu economic clar.",
    interpretationNotes: "Amortizarea este foarte sensibila la pretul energiei, autoconsum, granturi si costuri reale de exploatare. Nu o citi ca promisiune fixa si nu te opri la un singur scenariu optimist.",
    isFeatured: true,
    sortOrder: 60,
    audience: "consumer",
    releaseBatch: "batch-08",
    example: "O investitie neta de 32.000 lei cu economii anuale de 5.200 lei poate cobori amortizarea spre 6-7 ani intr-un scenariu rezonabil.",
    examples: [
      {
        title: "Sistem cu grant sau subventie",
        narrative:
          "Cand costul net scade substantial printr-un program de sprijin, anii de amortizare se comprima repede si scenariul devine mult mai usor de justificat.",
      },
      {
        title: "Sistem fara baterie, cu autoconsum bun",
        narrative:
          "Daca folosesti direct o parte mare din productie, economiile anuale cresc si amortizarea devine mai solida chiar fara acumulatori.",
      },
      {
        title: "Scenariu prudent vs scenariu optimist",
        narrative:
          "Diferenta dintre un tarif conservator si unul optimist poate muta amortizarea cu ani buni. Tocmai de aceea merita sa compari cel putin doua ipoteze.",
      },
    ],
    faq: [
      { question: "Daca energia se scumpeste, amortizarea se schimba?", answer: "Da. In multe cazuri se poate scurta, dar merita sa testezi si scenarii prudente, nu doar varianta cea mai convenabila." },
      { question: "Este suficient sa ma uit doar la ani?", answer: "Nu. Conteaza si cash-flow-ul, autonomia partiala, durata de viata a echipamentelor si stabilitatea costurilor in timp." },
      { question: "Merita sa compar si fara grant?", answer: "Da. Diferenta dintre cele doua scenarii iti arata cat de robusta este investitia si fara ajutor extern." },
      { question: "Cu ce alte pagini trebuie legat?", answer: "Cu necesarul sistemului, productia fotovoltaica si factura curenta, altfel amortizarea ramane rupta de realitatea casei tale." },
    ],
    relatedCalculatorKeys: ["solar-system-size", "solar-production", "monthly-electricity-bill"],
    relatedArticleSlugs: ["cum-citesti-amortizarea-unui-sistem-fotovoltaic"],
    seo: {
      metaTitle: "Calculator amortizare panouri fotovoltaice",
      metaDescription:
        "Afla in cati ani se amortizeaza un sistem fotovoltaic din cost, grant, economii si mentenanta. Compara scenarii prudente si optimiste.",
    },
    extraBlocks: [
      {
        blockType: "facts",
        eyebrow: "Ce influenteaza amortizarea",
        title: "Trei variabile care schimba cel mai mult rezultatul",
        intro:
          "Pagina este buna pentru un raspuns rapid, dar decizia devine mai buna cand separi investitia neta de economiile reale si de scenariul de consum.",
        tone: "mist",
        items: [
          {
            value: "Investitie neta",
            label: "cost total minus grant",
            detail:
              "Aici se vede cat capital trebuie sa recuperezi in timp.",
          },
          {
            value: "Economii anuale",
            label: "beneficiul financiar real",
            detail:
              "Merita gandit prudent, nu doar cu estimarea cea mai optimista.",
          },
          {
            value: "Autoconsum",
            label: "cat folosesti direct din productie",
            detail:
              "Poate schimba mult economia neta anuala.",
          },
        ],
      },
      {
        blockType: "story",
        eyebrow: "Cum citesti rezultatul",
        title: "Amortizarea buna este cea care rezista si dupa ce tai optimismul",
        body:
          "Daca investitia arata bine doar intr-un scenariu foarte optimist de productie sau pret al energiei, concluzia este fragila. Pagina merita folosita pentru comparatii prudente, nu pentru confirmarea unui entuziasm deja format.",
        tone: "sand",
      },
    ],
  },
  "ac-btu": {
    shortDescription: "Estimeaza capacitatea BTU potrivita pentru camera ta, ca sa nu alegi un aparat prea mic sau prea mare.",
    intro: "Calculatorul BTU pentru aer conditionat este util cand vrei sa pornesti din camera reala, nu din regula aproximativa pe care o auzi cel mai des.",
    interpretationNotes: "Rezultatul este orientativ. Insorirea, izolatia, orientarea camerei si numarul de persoane pot schimba alegerea finala.",
    isFeatured: true,
    sortOrder: 70,
    audience: "consumer",
    releaseBatch: "batch-08",
    example: "O camera de 26 mp cu insorire mai puternica poate iesi rapid din zona unitatilor mici si cere un aparat mai apropiat de 12.000 BTU.",
    faq: [
      { question: "Ce risc daca aleg prea putin BTU?", answer: "Aparatul va merge mai mult, va raci mai greu si poate consuma ineficient." },
      { question: "Dar daca aleg prea mult?", answer: "Poate cicla prea des, cu confort si eficienta mai slabe decat te astepti." },
    ],
    relatedCalculatorKeys: ["appliance-electricity-cost", "heating-load", "heat-pump-size"],
    relatedArticleSlugs: ["cum-alegi-btu-ul-potrivit-pentru-aer-conditionat"],
  },
  "heating-load": {
    shortDescription: "Estimeaza necesarul de caldura al locuintei din volum, pierderi si diferenta de temperatura.",
    intro: "Calculatorul de necesar termic este util cand vrei sa intelegi mai bine ce putere de incalzire are sens pentru casa ta.",
    interpretationNotes: "Coeficientul de pierderi este simplificat. Pentru proiecte serioase, rezultatul trebuie validat cu o analiza termica mai exacta.",
    isFeatured: true,
    sortOrder: 80,
    audience: "consumer",
    releaseBatch: "batch-08",
    example: "La 120 mp, 2,6 m inaltime si o cladire rezonabil izolata, necesarul poate intra intr-o zona care schimba complet discutia despre centrala sau pompa.",
    faq: [
      { question: "Pot folosi calculatorul si pentru apartament?", answer: "Da, atat timp cat introduci un scenariu apropiat de volum si pierderi." },
      { question: "Cu ce il leg dupa asta?", answer: "Cu dimensionarea pompei de caldura sau cu comparatia intre solutii de incalzire." },
    ],
    relatedCalculatorKeys: ["heat-pump-size", "ac-btu", "monthly-electricity-bill"],
    relatedArticleSlugs: ["centrala-vs-pompa-de-caldura-cum-compari-corect-costurile"],
  },
  "heat-pump-size": {
    shortDescription: "Porneste de la necesarul termic si estimeaza puterea recomandata a unei pompe de caldura.",
    intro: "Calculatorul pentru dimensionarea pompei de caldura este util cand ai deja un necesar termic estimat si vrei sa vezi zona de putere in care merita sa cauti echipamente.",
    interpretationNotes: "Rezultatul nu inlocuieste dimensionarea facuta de proiectant sau instalator. El este un filtru bun pentru orientare si comparatie.",
    isFeatured: false,
    sortOrder: 90,
    audience: "consumer",
    releaseBatch: "batch-08",
    example: "Un necesar de 8,5 kW cu marja prudenta poate impinge recomandarea spre o pompa de circa 9,5-10 kW.",
    faq: [
      { question: "Pot alege fix valoarea rezultata?", answer: "Mai bine o folosesti ca interval orientativ si o validezi cu detaliile sistemului tau real." },
      { question: "Merita sa o leg de cost?", answer: "Da, mai ales daca vrei sa compari investitia cu factura actuala si cu izolarea locuintei." },
    ],
    relatedCalculatorKeys: ["heating-load", "monthly-electricity-bill", "solar-system-size"],
    relatedArticleSlugs: ["centrala-vs-pompa-de-caldura-cum-compari-corect-costurile"],
  },
  "solar-battery-size": {
    shortDescription: "Estimeaza ce baterie fotovoltaica ai nevoie pentru nivelul de backup si consumul vizat.",
    intro: "Calculatorul de baterie fotovoltaica este util cand vrei sa vezi daca backup-ul dorit justifica sau nu costul suplimentar al unei baterii.",
    interpretationNotes: "Rezultatul depinde puternic de cat consum vrei sa acoperi, cat de des apare backup-ul si ce adancime de descarcare accepta sistemul.",
    isFeatured: false,
    sortOrder: 100,
    audience: "consumer",
    releaseBatch: "batch-08",
    example: "La 12 kWh consum zilnic si 70% acoperire in backup, bateria necesara sare repede intr-o zona care poate dubla discutia despre buget.",
    faq: [
      { question: "Merita mereu baterie?", answer: "Nu. Pentru multe case, fara scenarii clare de backup si autoconsum, costul suplimentar poate fi greu de recuperat." },
      { question: "Cu ce il leg in decizie?", answer: "Cu productie fotovoltaica si amortizare, ca sa vezi daca sistemul complet ramane sustenabil economic." },
    ],
    relatedCalculatorKeys: ["solar-production", "solar-payback", "monthly-electricity-bill"],
    relatedArticleSlugs: ["cand-merita-o-baterie-fotovoltaica-si-cand-doar-creste-costul"],
  },
  "fridge-electricity-cost": {
    shortDescription: "Estimeaza cat te costa frigiderul pe luna si pe an, pornind de la consumul sau zilnic mediu.",
    intro: "Calculatorul de consum pentru frigider este util cand vrei sa vezi daca unul dintre putinele aparate pornite permanent contribuie semnificativ la factura.",
    interpretationNotes: "Consumul zilnic real depinde de clasa energetica, temperatura ambientala, deschiderea usii si vechimea aparatului.",
    isFeatured: false,
    sortOrder: 110,
    audience: "consumer",
    releaseBatch: "batch-09",
    example: "La 1,1 kWh pe zi, frigiderul depaseste rapid 30 kWh pe luna si devine un cost de baza stabil in factura anuala.",
    faq: [
      { question: "Merge pentru orice frigider?", answer: "Da, atat timp cat ai o estimare zilnica rezonabila a consumului." },
      { question: "De ce merita calculat separat?", answer: "Pentru ca este unul dintre consumatorii permanenti si influenteaza costul de baza al casei." },
    ],
    relatedCalculatorKeys: ["monthly-electricity-bill", "appliance-electricity-cost", "led-savings"],
    relatedArticleSlugs: ["cat-consuma-un-frigider-in-realitate-si-cum-citesti-corect-eticheta"],
  },
  "boiler-electricity-cost": {
    shortDescription: "Calculeaza cat consuma un boiler electric in functie de apa incalzita, temperatura si numarul de cicluri.",
    intro: "Calculatorul de consum pentru boiler electric este util cand vrei sa vezi daca apa calda este unul dintre costurile mari ascunse din locuinta.",
    interpretationNotes: "Rezultatul este sensibil la temperatura initiala a apei, frecventa folosirii si eficienta reala a sistemului.",
    isFeatured: false,
    sortOrder: 120,
    audience: "consumer",
    releaseBatch: "batch-09",
    example: "La 80 litri, 35°C diferenta si peste un ciclu pe zi, costul lunar creste surprinzator de repede in zonele cu utilizare intensa.",
    faq: [
      { question: "Este mai bun decat un calculator generic de aparat?", answer: "Da, pentru ca leaga consumul de volumul si temperatura apei, nu doar de putere." },
      { question: "Cum il leg de factura?", answer: "Compara costul lunar estimat al boilerului cu factura totala si vezi ce pondere are." },
    ],
    relatedCalculatorKeys: ["monthly-electricity-bill", "appliance-electricity-cost", "solar-system-size"],
    relatedArticleSlugs: ["cat-consuma-un-boiler-electric-si-cand-devine-o-problema-in-factura"],
  },
  "ac-electricity-cost": {
    shortDescription: "Estimeaza cat te costa aerul conditionat pe luna si pe sezon, pornind de la puterea absorbita si orele de folosire.",
    intro: "Calculatorul de consum pentru aer conditionat este util cand vrei sa legi confortul din lunile calde de impactul real in factura.",
    interpretationNotes: "Puterea medie absorbita poate varia mult in functie de setpoint, izolatie, temperatura exterioara si eficienta aparatului.",
    isFeatured: false,
    sortOrder: 130,
    audience: "consumer",
    releaseBatch: "batch-09",
    example: "Un aparat cu 0,9 kW absorbiti mediu, folosit 8 ore pe zi, poate ajunge la un cost sezonier pe care merita sa il compari cu alte scenarii.",
    faq: [
      { question: "De ce nu folosesc doar BTU-ul?", answer: "Pentru cost, ai nevoie de puterea absorbita sau de un consum mediu realist, nu doar de capacitatea de racire." },
      { question: "Ce verific prima data?", answer: "Daca aparatul este bine dimensionat si daca scenariul de utilizare este aproape de realitate." },
    ],
    relatedCalculatorKeys: ["ac-btu", "monthly-electricity-bill", "appliance-electricity-cost"],
    relatedArticleSlugs: ["cat-consuma-aerul-conditionat-pe-zi-si-pe-luna"],
  },
  "led-savings": {
    shortDescription: "Compara becurile clasice cu LED si estimeaza economia anuala si timpul de recuperare.",
    intro: "Calculatorul de economie din LED-uri este util cand vrei una dintre cele mai simple comparatii de eficienta energetica din casa.",
    interpretationNotes: "Economia reala depinde de orele de utilizare si de cat de mare este diferenta intre sursa veche si cea noua.",
    isFeatured: false,
    sortOrder: 140,
    audience: "consumer",
    releaseBatch: "batch-09",
    example: "La 12 becuri si 5 ore pe zi, trecerea de la 60 W la 9 W poate schimba repede costul anual si recupera investitia intr-un interval scurt.",
    faq: [
      { question: "Merita daca folosesc lumina putin?", answer: "Da, dar perioada de recuperare creste cand orele de utilizare sunt mici." },
      { question: "Cu ce il leg mai departe?", answer: "Cu factura de curent si cu consumul altor aparate, ca sa vezi unde sunt cele mai mari economii posibile." },
    ],
    relatedCalculatorKeys: ["monthly-electricity-bill", "appliance-electricity-cost", "fridge-electricity-cost"],
    relatedArticleSlugs: ["cum-calculezi-economia-reala-din-becuri-led"],
  },
  "solar-roof-area": {
    shortDescription: "Arata cate panouri si ce putere maxima incap pe suprafata utila reala a acoperisului.",
    intro: "Calculatorul de suprafata pentru panouri este util cand vrei sa pornesti din spatiul disponibil si sa vezi repede cat de mare poate fi sistemul.",
    interpretationNotes: "Rezultatul este sensibil la forma acoperisului, distantele de montaj, umbrire si zonele care raman neutilizabile.",
    isFeatured: false,
    sortOrder: 150,
    audience: "consumer",
    releaseBatch: "batch-09",
    example: "La 42 mp utili si panouri standard de 2,1 mp, puterea maxima posibila poate ajunge rapid intr-o zona suficienta pentru consumul multor case.",
    faq: [
      { question: "Pot folosi suprafata totala a acoperisului?", answer: "Mai sigur este sa folosesti doar suprafata cu adevarat utila pentru montaj." },
      { question: "Cu ce il combin imediat?", answer: "Cu necesarul sistemului si cu numarul de panouri, ca sa vezi daca spatiul sustine obiectivul." },
    ],
    relatedCalculatorKeys: ["solar-system-size", "solar-panel-count", "solar-production"],
    relatedArticleSlugs: ["cata-suprafata-de-acoperis-iti-trebuie-pentru-panouri"],
  },
  "solar-inverter-size": {
    shortDescription: "Estimeaza puterea invertorului pornind de la sistemul DC si raportul DC/AC dorit.",
    intro: "Calculatorul de putere pentru invertor fotovoltaic este util cand vrei sa treci de la panouri si kWp la una dintre piesele cheie ale sistemului.",
    interpretationNotes: "Raportul DC/AC nu este o regulă rigidă. El depinde de configuratie, orientare, strategie si limitele practice ale proiectului.",
    isFeatured: false,
    sortOrder: 160,
    audience: "consumer",
    releaseBatch: "batch-09",
    example: "Pentru un sistem de 6,3 kWp cu raport 1,15, invertorul recomandat poate cobori spre zona de 5,5 kW.",
    faq: [
      { question: "Un invertor mai mare este automat mai bun?", answer: "Nu. Supradimensionarea sau subdimensionarea trebuie gandite in contextul sistemului complet." },
      { question: "Cu ce il leg in cluster?", answer: "Cu puterea sistemului, productia estimata si suprafata disponibila." },
    ],
    relatedCalculatorKeys: ["solar-system-size", "solar-panel-count", "solar-production"],
    relatedArticleSlugs: ["cum-alegi-corect-puterea-invertorului-fotovoltaic"],
  },
  "solar-self-consumption": {
    shortDescription: "Imparte productia intre autoconsum si injectare si arata cat din consumul casei acoperi direct.",
    intro: "Calculatorul de autoconsum este util cand vrei sa vezi nu doar cat produce sistemul, ci si cat folosesti cu adevarat in casa.",
    interpretationNotes: "Autoconsumul este foarte dependent de profilul orar de utilizare, nu doar de productia anuala totala.",
    isFeatured: true,
    sortOrder: 170,
    audience: "consumer",
    releaseBatch: "batch-09",
    example: "La un autoconsum de 45%, diferenta dintre energia folosita direct si cea injectata schimba puternic economia reala a sistemului.",
    faq: [
      { question: "Autoconsum mare inseamna mereu situatie buna?", answer: "De multe ori da, dar merita citit impreuna cu marimea sistemului si cu nevoia reala de consum." },
      { question: "Cu ce il compar?", answer: "Cu productie, baterie si amortizare, pentru ca toate influenteaza economia finala." },
    ],
    relatedCalculatorKeys: ["solar-production", "solar-battery-size", "solar-payback"],
    relatedArticleSlugs: ["autoconsum-vs-injectare-ce-conteaza-cu-adevarat-la-un-sistem-fv"],
  },
  "ups-runtime": {
    shortDescription: "Estimeaza autonomia unui UPS sau a unei baterii in functie de sarcina si energia disponibila.",
    intro: "Calculatorul de autonomie UPS este util cand vrei sa vezi daca backup-ul la care te gandesti are sens pentru consumatorii reali din casa.",
    interpretationNotes: "Autonomia reala depinde de starea bateriei, temperatura, eficienta invertorului si modul in care variaza sarcina.",
    isFeatured: false,
    sortOrder: 180,
    audience: "consumer",
    releaseBatch: "batch-09",
    example: "O baterie de 24 V si 100 Ah, la o sarcina de 300 W, poate oferi cateva ore bune de backup, dar merita sa vezi si marja reala de utilizare.",
    faq: [
      { question: "Este acelasi lucru cu o baterie fotovoltaica?", answer: "Nu neaparat, dar logica energiei disponibile si a sarcinii este foarte apropiata." },
      { question: "De ce merita calculat?", answer: "Pentru ca multi utilizatori supraestimeaza autonomia pe care o pot obtine dintr-o baterie." },
    ],
    relatedCalculatorKeys: ["solar-battery-size", "monthly-electricity-bill", "solar-self-consumption"],
    relatedArticleSlugs: ["cum-estimezi-backup-ul-pentru-ups-sau-baterie"],
  },
  "heating-cost-comparison": {
    shortDescription: "Compara costul anual al incalzirii intre gaz si pompa de caldura pentru acelasi necesar termic.",
    intro: "Calculatorul de comparatie pentru costul incalzirii este util cand vrei sa treci de la preferinte tehnologice la cifre comparabile.",
    interpretationNotes: "Rezultatul este orientativ si depinde de eficienta reala a centralei, COP-ul pompei, tarife si profilul termic al locuintei.",
    isFeatured: true,
    sortOrder: 190,
    audience: "consumer",
    releaseBatch: "batch-09",
    example: "Pentru acelasi necesar de caldura, diferentele dintre gaz si pompa de caldura pot schimba radical discutia despre investitie si operare.",
    faq: [
      { question: "Este suficient costul anual pentru alegere?", answer: "Nu. Conteaza si investitia initiala, izolatia, confortul si scenariul de folosire." },
      { question: "Cu ce il leg dupa calcul?", answer: "Cu necesarul termic si dimensionarea pompei de caldura." },
    ],
    relatedCalculatorKeys: ["heating-load", "heat-pump-size", "monthly-electricity-bill"],
    relatedArticleSlugs: ["cum-compari-costul-de-incalzire-intre-gaz-si-pompa-de-caldura"],
  },
  "solar-co2-savings": {
    shortDescription: "Estimeaza emisiile de CO2 evitate prin productia fotovoltaica anuala.",
    intro: "Calculatorul de economie CO2 pentru panouri este util cand vrei sa adaugi si o perspectiva de impact, nu doar una financiara.",
    interpretationNotes: "Factorul de emisii folosit este orientativ si variaza in functie de mixul energetic si metodologia aleasa.",
    isFeatured: false,
    sortOrder: 200,
    audience: "consumer",
    releaseBatch: "batch-09",
    example: "La o productie anuala buna, emisiile evitate pot ajunge intr-o zona care face vizibil si beneficiul de mediu, nu doar pe cel economic.",
    faq: [
      { question: "Este CO2-ul evitat un beneficiu financiar direct?", answer: "Nu direct, dar poate conta in evaluarea generala a investitiei si a impactului ei." },
      { question: "Cu ce il leg in cluster?", answer: "Cu productie si amortizare, ca sa vezi investitia si prin lentila de mediu." },
    ],
    relatedCalculatorKeys: ["solar-production", "solar-payback", "solar-system-size"],
    relatedArticleSlugs: ["cat-co2-poti-evita-cu-un-sistem-fotovoltaic"],
  },
  "property-total-purchase-cost": {
    shortDescription:
      "Aduna pretul locuintei cu costurile initiale, renovarea, mobilarea si rezerva, ca sa vezi bugetul real al achizitiei, nu doar pretul din anunt.",
    intro:
      "Calculatorul de cost total de achizitie locuinta este una dintre cele mai importante pagini din clusterul imobiliar, pentru ca muta atentia de la pretul proprietatii la proiectul complet pe care chiar trebuie sa il finantezi.",
    interpretationNotes:
      "Rezultatul devine util doar daca tratezi separat costurile de inchidere, renovarea, mobilarea si rezerva. Exact aici se rupe de obicei diferenta dintre o achizitie suportabila pe hartie si una care iti tensioneaza imediat lichiditatea.",
    isFeatured: true,
    sortOrder: 130,
    audience: "both",
    releaseBatch: "batch-10",
    example:
      "La 620.000 lei pret proprietate, 24.000 lei costuri de inchidere, 45.000 lei renovare, 30.000 lei mobilare si 10% rezerva, bugetul total urca rapid mult peste cifra initiala vazuta in anunt.",
    examples: [
      {
        title: "Locuinta gata de mutare",
        narrative:
          "Chiar si cand renovarea este minima, costurile de inchidere, mobilierul si rezerva iti pot muta semnificativ necesarul total de lichiditate.",
      },
      {
        title: "Apartament care cere renovare serioasa",
        narrative:
          "Cand adaugi renovare, mobilare si mici surprize de santier, diferenta dintre pretul afisat si bugetul real creste mult mai repede decat intuiesc majoritatea cumparatorilor.",
      },
      {
        title: "Casa cu proiect complet de amenajare",
        narrative:
          "La case, mobilarea, echipamentele si rezervele tind sa cantareasca si mai greu, ceea ce face acest calculator esential pentru o decizie prudenta.",
      },
    ],
    faq: [
      {
        question: "De ce nu este suficient pretul proprietatii?",
        answer:
          "Pentru ca achizitia reala mai include costuri de inchidere, renovare, mobilare si o rezerva minima pentru surprizele care apar imediat dupa tranzactie.",
      },
      {
        question: "Rezerva chiar este necesara?",
        answer:
          "Da. Fara ea, proiectul pare mai confortabil pe hartie decat este in realitate, mai ales cand apar costuri mici, dar dese, dupa semnare.",
      },
      {
        question: "Cum il leg de avans si de rata?",
        answer:
          "Foloseste-l impreuna cu calculatorul de avans si cu cel de buget lunar, ca sa vezi atat presiunea initiala, cat si pe cea recurenta.",
      },
      {
        question: "Cand devine acest calculator cel mai valoros?",
        answer:
          "Cand compari doua proprietati care par apropiate ca pret, dar au niveluri diferite de renovare, mobilare si costuri initiale.",
      },
    ],
    relatedCalculatorKeys: ["property-down-payment", "renovation-budget", "monthly-home-budget"],
    relatedArticleSlugs: [
      "ce-intra-de-fapt-in-bugetul-total-de-achizitie-al-unei-locuinte",
      "chirie-vs-cumparare-cum-compari-corect-doua-scenarii",
    ],
    seo: {
      metaTitle: "Calculator cost total achizitie locuinta",
      metaDescription:
        "Calculeaza costul total de achizitie al unei locuinte: pret, costuri de inchidere, renovare, mobilare si rezerva de buget.",
    },
    extraBlocks: [
      {
        blockType: "facts",
        eyebrow: "Ce intra in buget",
        title: "Cinci componente pe care merita sa le separi",
        intro:
          "Pagina e utila tocmai pentru ca sparge costul mare in bucati clare si comparabile.",
        tone: "mist",
        items: [
          {
            value: "Pret locuinta",
            label: "cifra din anunt",
            detail:
              "Este doar punctul de pornire, nu proiectul complet.",
          },
          {
            value: "Costuri initiale",
            label: "notar, taxe, inchidere",
            detail:
              "Consuma lichiditate imediata, chiar daca sunt tratate des ca detalii.",
          },
          {
            value: "Renovare + mobilare",
            label: "zona unde se sparge bugetul",
            detail:
              "Aici merita cele mai prudente ipoteze.",
          },
        ],
      },
      {
        blockType: "story",
        eyebrow: "Ce uita multi cumparatori",
        title: "Pretul bun nu inseamna automat proiect confortabil",
        body:
          "O proprietate poate parea accesibila in anunt, dar sa devina incomoda imediat dupa semnare daca nu ai inclus realist costurile de inchidere, renovarea si rezerva minima. Pagina te ajuta exact sa eviti acest salt prea optimist.",
        tone: "sand",
      },
    ],
  },
  "rent-vs-buy": {
    shortDescription:
      "Compara chiria cu scenariul de cumparare pe aceeasi perioada, incluzand costul initial si presiunea lunara, ca sa nu reduci decizia la rata versus chirie.",
    intro:
      "Calculatorul de chirie vs cumparare este una dintre cele mai puternice pagini de intentie din imobiliare, pentru ca raspunde unei intrebari foarte cautate, dar o face fara sa simplifice prea devreme comparatia.",
    interpretationNotes:
      "Comparatia devine utila doar daca pui alaturi costul initial, costul lunar total si perioada analizata. Daca te uiti doar la rata sau doar la chirie, vei pierde tocmai partea care decide confortul real al scenariului.",
    isFeatured: true,
    sortOrder: 140,
    audience: "both",
    releaseBatch: "batch-10",
    example:
      "La o chirie de 2.800 lei si un scenariu de cumparare care cere cost initial mare, diferenta nu sta doar in rata lunara, ci si in cat capital blochezi si ce buffer iti mai ramane.",
    examples: [
      {
        title: "Oras mare, cost initial ridicat",
        narrative:
          "Intr-o piata cu preturi mari, cumpararea poate avea sens doar daca bugetul initial ramane sanatos dupa avans, costuri de inchidere si primele cheltuieli de amenajare.",
      },
      {
        title: "Perioada scurta de locuire",
        narrative:
          "Daca stii ca nu stai multi ani in acelasi loc, flexibilitatea chiriei poate castiga chiar si atunci cand rata lunara nu arata dramatic mai rau.",
      },
      {
        title: "Scenariu lung, stabil",
        narrative:
          "Cand perioada de locuire este lunga si bugetul suporta confortabil costurile initiale, cumpararea poate deveni mai coerenta decat pare la o comparatie superficiala.",
      },
    ],
    faq: [
      {
        question: "Compar doar rata cu chiria?",
        answer:
          "Nu. O comparatie buna cere si costul initial, cheltuielile recurente si bufferul care iti ramane dupa fiecare scenariu.",
      },
      {
        question: "Daca rata este apropiata de chirie, inseamna ca merita cumpararea?",
        answer:
          "Nu automat. Diferenta poate veni din costul initial foarte mare sau din presiunea pe lichiditate imediat dupa achizitie.",
      },
      {
        question: "Cand castiga chiria?",
        answer:
          "De obicei cand ai nevoie de flexibilitate, cand perioada de locuire este scurta sau cand cumpararea iti comprima prea mult rezerva financiara.",
      },
      {
        question: "Cu ce alte pagini trebuie legata?",
        answer:
          "Cu costul total de achizitie, bugetul lunar al locuintei si bufferul ipotecar, ca sa citesti scenariul complet.",
      },
    ],
    relatedCalculatorKeys: ["monthly-home-budget", "mortgage-buffer", "property-total-purchase-cost"],
    relatedArticleSlugs: [
      "chirie-vs-cumparare-cum-compari-corect-doua-scenarii",
      "cat-iti-mananca-locuinta-din-bugetul-lunar",
    ],
    seo: {
      metaTitle: "Calculator chirie vs cumparare",
      metaDescription:
        "Compara chiria cu scenariul de cumparare pe aceeasi perioada. Vezi costul initial, costul lunar si presiunea reala pe buget.",
    },
    extraBlocks: [
      {
        blockType: "facts",
        eyebrow: "Cum citesti comparatia",
        title: "Trei lucruri pe care nu merita sa le amesteci",
        intro:
          "Pagina functioneaza bine doar daca separi costul initial de costul lunar si de perioada pe care o analizezi.",
        tone: "mist",
        items: [
          {
            value: "Cost initial",
            label: "cat capital blochezi din start",
            detail:
              "Aici se vede repede cat de agresiva este varianta de cumparare pentru lichiditate.",
          },
          {
            value: "Cost lunar",
            label: "presiunea recurenta pe buget",
            detail:
              "Util pentru comparatie, dar insuficient singur.",
          },
          {
            value: "Orizont",
            label: "cate luni sau ani compari",
            detail:
              "Schimba mult concluzia dintre flexibilitate si stabilitate.",
          },
        ],
      },
      {
        blockType: "story",
        eyebrow: "Ce intrebare rezolva pagina",
        title: "Nu cauti doar raspunsul mai ieftin, ci scenariul mai coerent pentru viata ta",
        body:
          "Chiria versus cumpararea nu este doar o comparatie de cifre, ci una de flexibilitate, lichiditate si confort pe termen mediu. Pagina te ajuta sa nu fortezi concluzia doar pentru ca una dintre linii arata mai frumos singura.",
        tone: "sand",
      },
    ],
  },
};

const articleSeeds: ArticleSeed[] = [
  {
    slug: "cum-interpretezi-bmi-corect",
    title: "Cum interpretezi BMI corect fara sa cazi in concluzii prea rapide",
    excerpt: "BMI este util, dar nu este suficient singur. Iata cum sa-l folosesti corect si cand trebuie completat cu alti indicatori.",
    content: "BMI este un indicator rapid, nu un verdict final despre starea ta de sanatate.\n\nPentru multi utilizatori, este primul calcul cautat atunci cand vor sa inteleaga daca greutatea actuala este aproape de un interval considerat normal. Tocmai de aceea merita folosit corect si interpretat in context, nu separat de restul datelor personale.\n\nFormula BMI leaga greutatea de inaltime si ofera un reper simplu, usor de comparat intre persoane sau intre etape diferite din acelasi proces de slabire ori mentinere. Avantajul lui este viteza. Limita lui este ca nu diferentiaza intre masa musculara si masa grasa.\n\nDin acest motiv, un rezultat mai mare nu inseamna automat exces de grasime, iar un rezultat aflat in intervalul standard nu inseamna neaparat ca toate celelalte repere sunt in regula. Sportivii, persoanele cu multa masa musculara sau cei care trec prin schimbari metabolice pot obtine valori care au nevoie de interpretare suplimentara.\n\nCel mai util mod de a privi BMI-ul este ca punct de plecare. Il poti completa cu calculatorul BMR, cu TDEE-ul si cu alte estimari legate de obiectivul tau, astfel incat rezultatul sa devina parte dintr-o imagine mai coerenta, nu doar o cifra izolata.",
    articleType: "explainer",
    relatedCategorySlug: "fitness",
    relatedCalculatorKeys: ["bmi", "bmr", "tdee"],
    relatedArticleSlugs: ["bmr-vs-tdee-diferente"],
    launchWave: "wave-1",
    releaseBatch: "batch-01",
    editorialStatus: "approved",
  },
  {
    slug: "bmr-vs-tdee-diferente",
    title: "BMR vs TDEE: diferentele care conteaza cand iti calculezi caloriile",
    excerpt: "BMR si TDEE sunt confundate des, dar au roluri diferite in planificarea unei diete.",
    content: "BMR si TDEE par apropiate, dar raspund la doua intrebari diferite.\n\nBMR, adica rata metabolica bazala, estimeaza cate calorii consuma corpul in repaus pentru functiile de baza: respiratie, circulatie, reglare termica si mentinerea organelor in functiune. Este o valoare de fundal, nu o tinta de alimentatie zilnica pentru majoritatea oamenilor activi.\n\nTDEE porneste de la BMR si adauga miscarea zilnica, antrenamentele si nivelul general de activitate. Din acest motiv, TDEE este de obicei cifra mai utila atunci cand vrei sa afli cate calorii poti consuma pentru mentinere, slabire sau crestere in greutate.\n\nConfuzia apare frecvent atunci cand cineva foloseste direct BMR-ul ca reper alimentar si ajunge la o tinta prea joasa. In practica, daca vrei sa-ti organizezi mesele sau sa setezi un deficit caloric, TDEE este baza mai relevanta, iar BMR ramane etapa intermediara care explica de unde porneste calculul.\n\nCel mai bun mod de a le folosi este impreuna: calculezi BMR-ul, il transformi in TDEE prin factorul de activitate, apoi ajustezi in functie de obiectiv si de raspunsul real al corpului dupa cateva saptamani.",
    articleType: "guide",
    relatedCategorySlug: "fitness",
    relatedCalculatorKeys: ["bmr", "tdee", "calorie-deficit"],
    relatedArticleSlugs: ["cum-setezi-un-deficit-caloric"],
    launchWave: "wave-1",
    releaseBatch: "batch-01",
    editorialStatus: "approved",
  },
  {
    slug: "cum-setezi-un-deficit-caloric",
    title: "Cum setezi un deficit caloric sustenabil pentru slabire",
    excerpt: "Un deficit prea mare poate sa-ti saboteze progresul. Iata cum alegi o tinta calorica mai realista.",
    content: "Deficitul caloric este diferenta dintre energia pe care o consumi si energia pe care o cheltui intr-o zi.\n\nIn teorie, ideea este simpla: mananci mai putin decat consumi si greutatea incepe sa scada. In practica, lucrurile devin mai nuantate, pentru ca un deficit prea agresiv poate duce la foame mare, oboseala, aderenta slaba si renuntare rapida.\n\nPentru multi oameni, un deficit moderat este un punct de pornire mai bun decat o taiere brusca a caloriilor. De aceea, un calculator de deficit caloric ar trebui folosit ca instrument de setare initiala, nu ca garantie ca rezultatul va arata identic la toata lumea.\n\nDupa ce obtii o tinta, cel mai important pas este observatia. Daca dupa doua-trei saptamani greutatea, energia si foamea merg intr-o directie dezechilibrata, tinta trebuie ajustata. Aici intervine diferenta dintre un calcul util si o strategie sustenabila.\n\nUn deficit bine setat iti ofera spatiu sa ramai consecvent. De aceea merita sa-l legi de TDEE, de aportul de proteine si de obiectivul real, nu doar de dorinta de a obtine un numar cat mai mic pe ecran.",
    articleType: "guide",
    relatedCategorySlug: "fitness",
    relatedCalculatorKeys: ["calorie-deficit", "tdee", "protein-intake"],
    relatedArticleSlugs: ["cate-proteine-ai-nevoie-zilnic"],
    launchWave: "wave-1",
    releaseBatch: "batch-01",
    editorialStatus: "approved",
  },
  {
    slug: "cate-proteine-ai-nevoie-zilnic",
    title: "Cate proteine ai nevoie zilnic in functie de obiectiv",
    excerpt: "Necesarul de proteine difera intre mentinere, slabire si crestere musculara. Iata o regula simpla de pornire.",
    content: "Necesarul de proteine nu este acelasi pentru toata lumea.\n\nGreutatea corporala, nivelul de activitate, varsta si obiectivul fac diferenta intre o tinta minima pentru mentinere si una mai ridicata pentru slabire sau dezvoltare musculara. De aceea, o cifra fixa identica pentru toti este rar utila in practica.\n\nPentru multe persoane active, un interval raportat la kilogram corp ofera un punct de pornire mai bun decat o recomandare generica pe zi. Calculatorul de proteine tocmai asta face: transforma greutatea si obiectivul intr-o estimare usor de folosit in planificarea meselor.\n\nInterpretarea ramane totusi importanta. Daca esti in deficit caloric, un aport mai mare poate sustine satietatea si mentinerea masei musculare. Daca esti la mentinere si nu ai un volum mare de antrenament, o tinta mai moderata poate fi suficienta.\n\nCel mai util este sa folosesti rezultatul impreuna cu TDEE-ul si cu structura meselor tale zilnice. Astfel nu ramai doar cu un numar de grame, ci cu o tinta pe care o poti distribui realist in alimentatia de zi cu zi.",
    articleType: "explainer",
    relatedCategorySlug: "fitness",
    relatedCalculatorKeys: ["protein-intake", "calorie-deficit", "tdee"],
    relatedArticleSlugs: ["cum-setezi-un-deficit-caloric"],
    launchWave: "wave-1",
    releaseBatch: "batch-01",
    editorialStatus: "approved",
  },
  {
    slug: "cum-calculezi-consumul-real-la-masina",
    title: "Cum calculezi consumul real la masina fara sa te bazezi doar pe bord",
    excerpt: "Consumul afisat in bord este util, dar nu este intotdeauna suficient. Iata metoda simpla pentru o estimare mai buna.",
    content: "Consumul afisat in bord este util pentru orientare rapida, dar nu este intotdeauna suficient daca vrei o estimare cat mai apropiata de realitate.\n\nCea mai simpla metoda practica este sa alimentezi pana la plin, sa notezi kilometrii parcursi si sa compari distanta cu cantitatea reala de carburant consumata. Formula ramane simpla, dar rezultatul devine mai valoros atunci cand este repetat pe mai multe plinuri.\n\nPe distante foarte scurte, traficul, relantiul, temperatura exterioara sau stilul de condus pot distorsiona usor concluzia. De aceea merita sa te uiti la o medie, nu la un singur drum. In felul acesta, consumul calculat devine mai util pentru buget si pentru comparatii intre trasee sau perioade.\n\nOdata ce stii consumul real, poti continua cu estimarea costului pe kilometru sau a costului total pentru un drum mai lung. Exact aici se leaga bine calculatoarele din categoria auto: unul iti da consumul, altul iti arata costul, iar altul iti estimeaza timpul.\n\nPrivit corect, consumul real nu este doar o curiozitate tehnica. Este un reper practic pentru decizii zilnice legate de buget, trasee si modul in care folosesti masina.",
    articleType: "guide",
    relatedCategorySlug: "auto",
    relatedCalculatorKeys: ["fuel-consumption", "cost-per-km", "trip-fuel-cost"],
    relatedArticleSlugs: ["cum-estimezi-costul-unei-calatorii-cu-masina"],
    launchWave: "wave-2",
  },
  {
    slug: "cum-estimezi-costul-unei-calatorii-cu-masina",
    title: "Cum estimezi costul unei calatorii cu masina mai aproape de realitate",
    excerpt: "Un drum nu inseamna doar distanta. Consumul, pretul carburantului si viteza medie schimba estimarea finala.",
    content: "Costul unui drum nu inseamna doar distanta dintre punctul A si punctul B.\n\nPentru o estimare rezonabila ai nevoie de cel putin trei repere: distanta, consumul mediu real si pretul carburantului. Daca unul dintre ele este nerealist, si rezultatul final va fi mai degraba optimist decat util.\n\nIn practica, merita sa iei in calcul si tipul de traseu. Un drum cu mult oras, relanti sau diferente de nivel poate arata foarte diferit fata de o deplasare predominanta pe autostrada. De aceea, calculul devine mai bun atunci cand compari doua sau trei scenarii, nu doar unul singur.\n\nUn alt avantaj al estimarii corecte este ca o poti combina cu timpul de calatorie si cu costul pe kilometru. In momentul acela, drumul nu mai este doar o distanta, ci o decizie de buget si de planificare.\n\nUn calculator bun pentru costul calatoriei nu iti ofera doar un total. Iti da un punct de plecare pentru a compara rute, a pregati bugetul si a evita surprizele cand pretul carburantului sau consumul real sunt diferite de cele anticipate.",
    articleType: "guide",
    relatedCategorySlug: "auto",
    relatedCalculatorKeys: ["trip-fuel-cost", "travel-time", "cost-per-km"],
    relatedArticleSlugs: ["cum-calculezi-consumul-real-la-masina"],
    launchWave: "wave-2",
  },
  {
    slug: "kw-vs-cp-explicat-simplu",
    title: "KW vs CP explicat simplu: ce inseamna si cand conteaza diferenta",
    excerpt: "Kilowatii si caii putere descriu aceeasi idee, dar apar in contexte diferite. Iata cum le citesti corect.",
    content: "kW si CP sunt doua moduri uzuale de a exprima aceeasi idee: puterea dezvoltata de un motor sau de un echipament.\n\nConfuzia apare pentru ca unele documentatii folosesc kilowatii, altele caii putere, iar utilizatorul ajunge sa vrea conversia imediata fara sa piarda contextul. In special in zona auto, diferentele de afisare dintre acte, configuratoare si anunturi duc des la intrebari aparent simple, dar recurente.\n\nConversia in sine este directa. Problema reala apare atunci cand cifrele sunt rotunjite sau cand sursele folosesc conventii usor diferite. De aceea pot aparea mici variatii intre rezultatele afisate in locuri diferite, chiar daca toate pleaca de la aceeasi formula de baza.\n\nDin perspectiva utilizatorului, un convertor bun trebuie sa ofere doua lucruri: raspuns instant si o explicatie suficient de clara incat sa stii ce compari de fapt. Nu toate cautarile au nevoie de un articol lung, dar toate beneficiaza de o explicatie simpla si corecta.\n\nTocmai aici pagina devine utila: nu doar transforma kW in CP, ci iti arata si de ce vezi cand o unitate, cand cealalta, si cum sa citesti corect specificatiile unui motor sau ale unui aparat.",
    articleType: "explainer",
    relatedCategorySlug: "energie",
    relatedCalculatorKeys: ["kw-cp", "amps-to-watts", "watts-to-kwh"],
    relatedArticleSlugs: ["cum-calculezi-consumul-electric-al-unui-aparat"],
    launchWave: "backlog",
  },
  {
    slug: "cum-calculezi-consumul-electric-al-unui-aparat",
    title: "Cum calculezi consumul electric al unui aparat fara formule complicate",
    excerpt: "Pornesti de la putere si timp de functionare, iar din aceste doua valori poti estima rapid consumul si costul.",
    content: "Calculul consumului electric al unui aparat devine simplu atunci cand separi clar doua notiuni: puterea instantanee si energia consumata in timp.\n\nPuterea in wati iti spune cat consuma aparatul intr-un anumit moment, in timp ce kWh-ul arata consumul acumulat pe durata functionarii. De aici porneste intreaga estimare: transformi puterea si timpul intr-o valoare de consum, apoi aplici pretul pe kWh ca sa obtii costul.\n\nMulte confuzii apar pentru ca utilizatorii compara direct wati cu bani, fara pasul intermediar. In realitate, costul nu vine din puterea afisata pe eticheta, ci din felul in care aparatul este folosit de-a lungul unei zile, saptamani sau luni.\n\nUn astfel de calculator este util nu doar pentru curiozitate, ci si pentru prioritizare. Daca vrei sa intelegi ce aparat conteaza mai mult in factura sau daca merita sa schimbi un obicei de consum, ai nevoie de o estimare rapida si usor de refacut.\n\nDe aceea merita legat de conversiile dintre wati si kWh, dar si de calculatorul de cost electric. Impreuna, ele transforma un calcul simplu intr-un raspuns practic pentru decizii de consum.",
    articleType: "guide",
    relatedCategorySlug: "energie",
    relatedCalculatorKeys: ["electricity-cost", "watts-to-kwh", "amps-to-watts"],
    relatedArticleSlugs: ["kw-vs-cp-explicat-simplu"],
    launchWave: "backlog",
  },
  {
    slug: "ghid-conversii-kg-lb-cm-inch",
    title: "Ghid rapid pentru conversii kg-lb si cm-inch in contexte de zi cu zi",
    excerpt: "Conversiile simple apar in fitness, shopping, retete si specificatii tehnice. Iata cum le folosesti fara sa gresesti unitatile.",
    content: "Conversiile intre kilograme si livre sau intre centimetri si inch apar peste tot: in surse internationale, in magazine, in fitness, in retete sau in specificatii tehnice.\n\nFormula este simpla, dar nevoia utilizatorului nu este doar matematica. De cele mai multe ori, persoana care cauta o conversie vrea o confirmare rapida, fara risc de eroare si fara sa piarda timp cu formule memorate pe jumatate.\n\nExact de aceea paginile de conversie functioneaza bine atunci cand ofera un raspuns instant, dar si cateva exemple usor de recunoscut. O valoare convertita capata mai mult sens cand este ancorata intr-un context real: greutate corporala, marime de produs, dimensiunea unui obiect sau temperatura dintr-o reteta.\n\nDin punct de vedere SEO, aceste cautari sunt answer-first, dar nu trebuie tratate ca pagini goale. Un minim de context si cateva legaturi catre conversii apropiate ajuta atat utilizatorul, cat si arhitectura interna a site-ului.\n\nUn convertor bun reduce frictiunea. Iti da raspunsul imediat, te lasa sa verifici rapid si te trimite mai departe doar atunci cand are sens sa continui cu o alta conversie sau cu o pagina mai explicativa.",
    articleType: "guide",
    relatedCategorySlug: "conversii",
    relatedCalculatorKeys: ["kg-lb", "cm-inch", "temperature-converter"],
    relatedArticleSlugs: ["cum-transformi-amperii-in-wati-si-wati-in-kwh"],
    launchWave: "backlog",
  },
  {
    slug: "cum-estimezi-procentul-de-grasime-corporala",
    title: "Cum estimezi procentul de grasime corporala fara sa supraevaluezi precizia",
    excerpt: "Formula US Navy este utila pentru orientare, dar valoarea ei vine din masuratori coerente si interpretare prudenta.",
    content: "Procentul de grasime corporala este cautat des pentru ca promite un raspuns mai fin decat BMI-ul. In multe cazuri chiar ofera mai mult context, dar numai daca este folosit cu asteptari corecte.\n\nFormula US Navy porneste de la circumferinte si inaltime, ceea ce o face accesibila si usor de repetat acasa. Tocmai repetabilitatea este unul dintre avantajele ei: daca masori in acelasi mod, poti urmari tendinte in timp mai usor decat daca schimbi metoda la fiecare cateva saptamani.\n\nLimita principala este ca masuratorile trebuie facute atent. Un centimetru in plus sau in minus la talie ori la gat poate schimba rezultatul suficient cat sa para ca ai progresat sau regresat mai mult decat s-a intamplat in realitate. De aceea, consistenta conteaza aproape la fel de mult ca formula.\n\nIn practica, procentul estimat de grasime corporala merita citit impreuna cu BMI-ul, cu greutatea actuala si cu obiectivul personal. Pentru unii utilizatori, progresul util inseamna schimbarea compozitiei corporale, nu doar scaderea unui numar pe cantar.\n\nCel mai sanatos mod de a folosi acest calculator este ca instrument de observatie, nu ca verdict perfect. Daca il tratezi astfel, pagina devine un reper bun pentru comparatii in timp si pentru setarea unor asteptari mai realiste.",
    articleType: "guide",
    relatedCategorySlug: "fitness",
    relatedCalculatorKeys: ["body-fat-us-navy", "bmi", "ideal-weight"],
    relatedArticleSlugs: ["cum-interpretezi-bmi-corect"],
    launchWave: "backlog",
  },
  {
    slug: "cata-apa-ai-nevoie-zilnic-cu-adevarat",
    title: "Cata apa ai nevoie zilnic cu adevarat si cum folosesti corect un calculator simplu",
    excerpt: "Regula pe kilogram corp este un bun punct de plecare, dar hidratarea reala depinde de contextul de zi cu zi.",
    content: "Cand cineva cauta cata apa trebuie sa bea zilnic, de obicei cauta claritate, nu o formula complicata. Tocmai de aceea regulile simple, precum aportul estimat pe kilogram corp, raman atat de populare.\n\nAvantajul unui calculator simplu de hidratare este ca iti da imediat un reper. Fara acest punct de plecare, multi utilizatori fie subestimeaza constant cat beau, fie incearca sa urmeze recomandari generale care nu tin cont de greutate, vreme sau nivel de activitate.\n\nIn acelasi timp, hidratarea nu este un numar fix care trebuie respectat mecanic in fiecare zi. Temperatura, transpiratia, mesele, cafeaua, antrenamentele si chiar obiceiurile de somn pot muta nevoia reala in sus sau in jos.\n\nDe aceea merita sa folosesti calculatorul ca instrument de organizare. Iti setezi o tinta orientativa, o observi cateva zile si apoi o corectezi dupa cum te simti si dupa contextul concret. Exact aici devine utila pagina: traduce o formula simpla intr-o regula usor de aplicat, nu intr-o obligatie rigida.\n\nDaca o legi de alimentatie, de nivelul de activitate si de sezon, hidratarea devine mai usor de gestionat. Iar calculatorul ramane ceea ce trebuie sa fie: un reper practic, nu o sursa de presiune inutila.",
    articleType: "guide",
    relatedCategorySlug: "fitness",
    relatedCalculatorKeys: ["water-intake", "tdee", "protein-intake"],
    relatedArticleSlugs: ["cate-proteine-ai-nevoie-zilnic"],
    launchWave: "backlog",
  },
  {
    slug: "cum-folosesti-one-rep-max-in-antrenament",
    title: "Cum folosesti one rep max in antrenament fara sa transformi totul intr-un test de ego",
    excerpt: "Estimarea 1RM este utila pentru programare, nu doar pentru a afla un numar mare pe hartie.",
    content: "One rep max este una dintre cele mai populare valori din antrenamentul de forta, dar si una dintre cele mai usor de interpretat gresit. Multi utilizatori il cauta ca pe un scor, cand de fapt valoarea lui reala apare in programare.\n\nUn calculator 1RM pleaca de la o serie submaximala si estimeaza ce ai putea ridica o singura data in conditii bune. Pentru majoritatea utilizatorilor, asta este mai practic si mai sigur decat sa testeze mereu un maxim real in sala.\n\nAvantajul apare imediat in planificare. Daca stii 1RM-ul estimat, poti calcula mai usor procente de lucru, poti organiza zilele grele si poti observa cand forta creste fara sa transformi fiecare saptamana intr-o competitie.\n\nTotusi, rezultatul trebuie citit cu prudenta. Cu cat setul folosit la intrare are mai multe repetari sau tehnica mai slaba, cu atat estimarea devine mai putin stabila. De aceea calculatorul este mai util ca reper intern decat ca adevar absolut.\n\nPrivit corect, 1RM-ul te ajuta sa aduci mai multa structura in antrenament. Nu iti spune totul despre progres, dar iti ofera un limbaj simplu prin care sa legi efortul de planificare si de obiectivele tale reale.",
    articleType: "guide",
    relatedCategorySlug: "fitness",
    relatedCalculatorKeys: ["one-rep-max", "protein-intake", "tdee"],
    relatedArticleSlugs: ["cate-proteine-ai-nevoie-zilnic"],
    launchWave: "backlog",
  },
  {
    slug: "cost-pe-kilometru-vs-cost-total-drum",
    title: "Cost pe kilometru vs cost total de drum: ce iti spune fiecare si cand merita sa le compari",
    excerpt: "Cele doua estimari raspund la intrebari diferite. Una te ajuta la comparatii rapide, cealalta la bugetarea unui traseu.",
    content: "Costul pe kilometru si costul total al unui drum par calcule apropiate, dar servesc scopuri diferite. Exact de aceea merita sa le pui impreuna in acelasi cluster de continut.\n\nCostul pe kilometru este util atunci cand vrei un reper rapid si comparabil. Iti arata cum se schimba bugetul atunci cand variaza consumul sau pretul carburantului si te ajuta sa compari doua masini ori doua stiluri de condus fara sa pornesti mereu de la o distanta anume.\n\nCostul total de drum raspunde unei alte intrebari: cat te costa traseul pe care urmeaza sa il faci. Aici conteaza distanta, consumul, pretul carburantului si, uneori, chiar timpul estimat daca vrei sa pui planificarea in acelasi tablou.\n\nIn practica, cele doua calcule functioneaza mai bine impreuna. Unul iti da unitatea de comparatie, celalalt iti da suma concreta. Cand le legi si de consumul real, estimarile devin mult mai utile decat cifrele teoretice din acte sau din bord.\n\nDin perspectiva utilizatorului, aceasta este diferenta dintre o pagina care afiseaza un singur rezultat si un hub care chiar ajuta la decizie. Iar din perspectiva SEO, exact aici internal linking-ul devine natural: cost, consum si timp fac parte din aceeasi intentie de cautare.",
    articleType: "comparison",
    relatedCategorySlug: "auto",
    relatedCalculatorKeys: ["cost-per-km", "trip-fuel-cost", "fuel-consumption"],
    relatedArticleSlugs: ["cum-estimezi-costul-unei-calatorii-cu-masina"],
    launchWave: "backlog",
  },
  {
    slug: "cum-transformi-amperii-in-wati-si-wati-in-kwh",
    title: "Cum transformi amperii in wati si watii in kWh fara sa amesteci puterea cu energia",
    excerpt: "Amperi, wati si kWh apar des impreuna, dar descriu lucruri diferite. Iata cum le legi corect intr-un calcul util.",
    content: "Confuzia dintre amperi, wati si kWh este foarte comuna pentru ca termenii apar des unul langa altul, dar nu descriu acelasi lucru. Exact de aici pornesc multe cautari care par simple si ajung sa aiba nevoie de explicatie, nu doar de formula.\n\nAmperii descriu intensitatea curentului, iar watii descriu puterea rezultata intr-un anumit moment. Daca mai adaugi si timpul de functionare, ajungi la kWh, adica energia consumata pe o perioada. Fara aceasta ordine, utilizatorul risca sa compare marimi diferite ca si cum ar fi acelasi lucru.\n\nDe aceea primul pas util este conversia corecta dintre amperi si wati, folosind tensiunea. Al doilea pas este transformarea puterii in consum energetic atunci cand aparatul functioneaza un anumit numar de ore. Abia dupa aceea are sens sa vorbesti despre costuri si factura.\n\nAcest lant de calcule este foarte util in practica: pentru electrocasnice, incalzire, echipamente de atelier sau orice situatie in care vrei sa estimezi rapid cat consuma ceva si daca merita sa schimbi modul de utilizare.\n\nPus corect intr-o pagina, acest subiect face legatura fireasca dintre conversii tehnice si calcule de cost. Asa utilizatorul pleaca nu doar cu un numar, ci cu o intelegere mai clara a relatiei dintre putere, timp si consum.",
    articleType: "guide",
    relatedCategorySlug: "energie",
    relatedCalculatorKeys: ["amps-to-watts", "watts-to-kwh", "electricity-cost"],
    relatedArticleSlugs: ["cum-calculezi-consumul-electric-al-unui-aparat"],
    launchWave: "backlog",
  },
  {
    slug: "cum-calculezi-suprafata-unei-camere-corect",
    title: "Cum calculezi suprafata unei camere corect inainte de renovare sau amenajare",
    excerpt: "Suprafata unei camere este baza pentru vopsea, gresie, parchet si multe alte estimari de materiale.",
    content: "Suprafata unei camere pare un calcul simplu, dar in practica este una dintre cele mai importante valori pentru orice renovare. Daca pleci de la o suprafata gresita, toate estimarile urmatoare risca sa fie prea mici sau prea mari.\n\nPentru camerele dreptunghiulare, formula de baza este simpla: lungime inmultita cu latime. Problemele apar atunci cand incaperea are nise, retrageri, colturi atipice sau zone care nu trebuie incluse in acelasi calcul. In aceste situatii, cea mai buna metoda este sa imparti spatiul in forme mai mici si sa aduni apoi suprafetele.\n\nPerimetrul este si el util, chiar daca multi il ignora. Te ajuta la plinte, baghete sau estimari laterale, iar impreuna cu suprafata ofera o imagine mult mai clara asupra camerei.\n\nOdata ce ai suprafata corecta, restul calculelor devin mai fiabile: vopsea, gresie, faianta, parchet sau chiar bugete orientative pentru materiale. Exact de aceea pagina merita legata de alte calculatoare din acelasi cluster si nu tratata ca un tool izolat.\n\nPrivita corect, suprafata unei camere nu este doar o cifra. Este baza de lucru pentru aproape orice estimare practica din amenajari.",
    articleType: "guide",
    relatedCategorySlug: "constructii",
    relatedCalculatorKeys: ["room-area", "paint-coverage", "laminate-flooring"],
    relatedArticleSlugs: ["cum-estimezi-necesarul-de-vopsea"],
    launchWave: "backlog",
  },
  {
    slug: "cum-calculezi-volumul-de-beton-pentru-fundatie",
    title: "Cum calculezi volumul de beton pentru fundatie fara sa subestimezi comanda",
    excerpt: "Volumul de beton este simplu geometric, dar merita citit cu rezerva practica pentru pierderi si neregularitati.",
    content: "Volumul de beton este unul dintre calculele pe care multi utilizatori vor sa le rezolve rapid, mai ales inainte de o comanda sau de o discutie cu echipa de executie. Formula de baza este geometrica: lungime ori latime ori grosime.\n\nTotusi, santierul real nu arata mereu perfect ca in schita. Pot exista diferente mici de nivel, cofraje neregulate, zone de completat sau pierderi care fac ca volumul final comandat sa fie usor mai mare decat volumul matematic strict.\n\nDe aceea calculatorul trebuie folosit ca punct de plecare clar, nu ca estimare absoluta. Mai intai obtii volumul geometric in metri cubi, apoi adaugi rezerva practica potrivita contextului tau.\n\nUn alt avantaj este ca acelasi calcul poate fi folosit si pentru placi, sape sau alte turnari simple, atat timp cat dimensiunile sunt introduse corect. Pagina devine astfel utila nu doar pentru un singur caz, ci pentru mai multe scenarii de constructii usoare.\n\nCand legi volumul de beton de calculatorul de suprafata sau de estimarile de finisaje, incepi sa obtii un mini-hub coerent pentru lucrari si bugete.",
    articleType: "guide",
    relatedCategorySlug: "constructii",
    relatedCalculatorKeys: ["concrete-volume", "room-area"],
    relatedArticleSlugs: ["cum-calculezi-suprafata-unei-camere-corect"],
    launchWave: "backlog",
  },
  {
    slug: "cum-estimezi-necesarul-de-vopsea",
    title: "Cum estimezi necesarul de vopsea fara sa ramai in mijlocul lucrarii fara material",
    excerpt: "Suprafata, numarul de straturi si acoperirea produsului fac diferenta dintre o estimare buna si una prea optimista.",
    content: "Necesarul de vopsea pare un calcul simplu, dar in practica este afectat de mai multi factori decat pare la prima vedere. Suprafata este punctul de plecare, dar nu este singura variabila care conteaza.\n\nNumarul de straturi influenteaza direct consumul, iar acoperirea de pe ambalaj este de obicei o valoare orientativa, nu o promisiune absoluta pentru orice tip de perete. Tencuiala, absorbtia, culoarea anterioara si modul de aplicare pot muta necesarul real destul de mult.\n\nDe aceea merita sa folosesti calculatorul ca estimare de lucru si sa pastrezi o marja rezonabila, mai ales daca suprafata este mare sau daca suportul nu este uniform. Un calcul prea strans poate duce la intreruperi si la diferente de lot.\n\nCand suprafata este deja calculata corect, restul procesului devine mult mai simplu. Iar daca legi pagina de alte estimari precum parchetul sau gresia, ai un flux editorial natural pentru utilizatorul care tocmai planifica o renovare.\n\nUn calculator bun de vopsea nu trebuie doar sa afiseze litri. Trebuie sa te ajute sa iei o decizie mai sigura inainte de comanda.",
    articleType: "guide",
    relatedCategorySlug: "constructii",
    relatedCalculatorKeys: ["paint-coverage", "room-area"],
    relatedArticleSlugs: ["cum-calculezi-suprafata-unei-camere-corect"],
    launchWave: "backlog",
  },
  {
    slug: "cum-calculezi-necesarul-de-gresie-si-faianta",
    title: "Cum calculezi necesarul de gresie si faianta fara sa ignori pierderile reale",
    excerpt: "Suprafata utila nu este suficienta. Pentru o comanda buna conteaza si pierderile, taieturile si tipul de montaj.",
    content: "Necesarul de gresie si faianta nu inseamna doar sa imparti suprafata la acoperirea unei cutii. In practica, pierderile fac o diferenta reala, iar ele pot varia mult in functie de montaj, model si forma spatiului.\n\nUn montaj drept pe o camera simpla poate avea pierderi moderate, in timp ce un montaj diagonal sau o zona cu multe colturi si decupaje cere de obicei mai multa rezerva. Exact aici calculatorul devine util: pleaca de la suprafata, dar introduce si procentul de pierderi.\n\nAcest lucru este important mai ales pentru comenzi, unde lipsa unei singure cutii poate crea intarzieri, diferente de lot sau costuri suplimentare. O estimare putin mai prudenta este de multe ori mai utila decat una perfect optimista.\n\nPagina functioneaza cel mai bine cand este legata de calculatorul de suprafata si de alte tool-uri de finisaje. Asa utilizatorul poate trece natural de la o nevoie la alta fara sa se intoarca la cautare de fiecare data.\n\nCa produs editorial, acest tip de calculator performeaza bine tocmai pentru ca raspunde unei intrebari foarte practice si repetabile.",
    articleType: "guide",
    relatedCategorySlug: "constructii",
    relatedCalculatorKeys: ["tile-coverage", "laminate-flooring", "room-area"],
    relatedArticleSlugs: ["cum-calculezi-suprafata-unei-camere-corect"],
    launchWave: "backlog",
  },
  {
    slug: "food-cost-explicat-pentru-horeca",
    title: "Food cost explicat simplu pentru horeca: ce iti spune si ce nu iti spune",
    excerpt: "Food cost-ul este un indicator foarte util, dar nu trebuie confundat cu profitul final al business-ului.",
    content: "Food cost-ul este unul dintre cele mai cautate calcule din horeca pentru ca ofera rapid un reper usor de inteles. Practic, iti arata ce procent din pretul de vanzare este consumat de ingredientele directe.\n\nValoarea lui este mare mai ales in comparatii: intre produse, intre perioade sau intre doua variante de reteta. Tocmai de aceea calculatorul este util pentru decizii rapide de meniu si pricing.\n\nTotusi, food cost-ul nu spune singur intreaga poveste. Chiria, personalul, livrarea, pierderile, ambalajele si costurile operationale pot schimba radical imaginea finala. De aceea un food cost bun nu inseamna automat si un produs foarte profitabil.\n\nCea mai buna utilizare este sa il pui alaturi de marja, markup si, in anumite cazuri, break-even. Atunci incepi sa vezi nu doar costul ingredientelor, ci si sustenabilitatea comerciala a produsului.\n\nPentru `toolnet.ro`, pagina asta este un punct foarte bun de intrare in clusterul business si horeca.",
    articleType: "guide",
    relatedCategorySlug: "business",
    relatedCalculatorKeys: ["food-cost", "profit-margin", "markup"],
    relatedArticleSlugs: ["marja-vs-markup-explicate-simplu"],
    launchWave: "backlog",
  },
  {
    slug: "marja-vs-markup-explicate-simplu",
    title: "Marja vs markup explicate simplu: de ce par apropiate, dar nu sunt acelasi lucru",
    excerpt: "Marja si markup-ul pleaca de la aceleasi doua valori, dar raspund la intrebari diferite.",
    content: "Marja si markup-ul sunt confundate frecvent pentru ca folosesc aceleasi componente: costul si pretul de vanzare. Diferenta reala vine din baza la care raportezi profitul.\n\nMarja iti spune ce procent din pretul final ramane dupa costul direct. Markup-ul iti spune cu cat ai crescut costul ca sa ajungi la pret. Tocmai de aceea cele doua procente nu vor avea aceeasi valoare chiar daca pleaca de la aceleasi cifre.\n\nIn practica, marja este adesea mai utila pentru analiza performantei comerciale, in timp ce markup-ul este foarte folosit in pricing atunci cand pretul se construieste pornind de la cost. Daca le amesteci, poti lua decizii gresite sau poti compara incorect produse si oferte.\n\nDe aceea cele doua calculatoare merita sa stea impreuna in acelasi cluster. Utilizatorul cauta de multe ori exact aceasta diferenta si are nevoie de o explicatie simpla, nu doar de formula.\n\nCand adaugi si break-even sau ROI in acelasi traseu, hub-ul business incepe sa capete consistenta reala.",
    articleType: "comparison",
    relatedCategorySlug: "business",
    relatedCalculatorKeys: ["profit-margin", "markup", "break-even"],
    relatedArticleSlugs: ["food-cost-explicat-pentru-horeca"],
    launchWave: "backlog",
  },
  {
    slug: "cum-calculezi-pragul-de-rentabilitate",
    title: "Cum calculezi pragul de rentabilitate si de ce merita sa-l verifici inainte de orice forecast optimist",
    excerpt: "Break-even-ul iti arata cand nu mai esti pe pierdere, iar asta il face extrem de util in orice scenariu comercial simplu.",
    content: "Pragul de rentabilitate este unul dintre acele calcule care simplifica foarte bine o intrebare importanta: cate unitati trebuie sa vinzi pana cand iti acoperi costurile fixe. Din acest motiv este util in business, dar si in proiecte mici sau produse noi.\n\nFormula de baza porneste de la contributia pe unitate, adica diferenta dintre pretul de vanzare si costul variabil direct. Cand aceasta contributie este mica, pragul urca repede si modelul devine mai greu de sustinut.\n\nBreak-even-ul nu spune totul despre business, dar este foarte bun ca filtru rapid. Iti arata daca un scenariu are macar o baza rezonabila inainte sa mergi mai departe in forecast-uri optimiste.\n\nIn combinatie cu marja si ROI-ul, calculatorul devine si mai util. Un produs poate avea marja acceptabila, dar sa aiba nevoie de un volum greu de atins ca sa iasa din pierdere.\n\nDe aceea, pentru clusterul business, break-even-ul este una dintre piesele centrale.",
    articleType: "guide",
    relatedCategorySlug: "business",
    relatedCalculatorKeys: ["break-even", "profit-margin", "roi"],
    relatedArticleSlugs: ["marja-vs-markup-explicate-simplu"],
    launchWave: "backlog",
  },
  {
    slug: "cum-evaluezi-un-roi-fara-sa-fortezi-cifrele",
    title: "Cum evaluezi un ROI fara sa fortezi cifrele doar ca sa iasa bine pe hartie",
    excerpt: "ROI-ul este foarte util pentru comparatii rapide, dar devine periculos daca ignori timpul, riscul si costurile ascunse.",
    content: "ROI-ul este popular pentru ca rezuma repede rentabilitatea unei investitii intr-un singur procent. Tocmai de aceea este foarte util pentru comparatii rapide intre scenarii sau proiecte.\n\nProblema apare atunci cand procentul este folosit fara context. Doua investitii pot avea acelasi ROI, dar una poate cere mult mai mult timp, risc sau capital blocat. In aceste cazuri, procentul singur devine prea simplificator.\n\nTotusi, ca prim filtru, ROI-ul este excelent. Iti arata profitul net raportat la suma investita si te ajuta sa respingi rapid scenarii slabe sau sa compari optiuni apropiate.\n\nPentru decizii mai bune, merita sa il folosesti alaturi de marja, break-even si, uneori, cash flow. Asa obtii nu doar un procent frumos, ci si o imagine mai stabila asupra investitiei.\n\nIn produsul nostru, ROI-ul este un calculator foarte bun pentru a ancora clusterul business spre cautari mai strategice si mai comerciale.",
    articleType: "guide",
    relatedCategorySlug: "business",
    relatedCalculatorKeys: ["roi", "break-even", "profit-margin"],
    relatedArticleSlugs: ["cum-calculezi-pragul-de-rentabilitate"],
    launchWave: "backlog",
  },
  {
    slug: "cum-calculezi-procentele-corect",
    title: "Cum calculezi procentele corect fara sa incurci baza, diferenta si rezultatul final",
    excerpt: "Procentele par simple, dar cele mai multe erori apar cand aplici formula la valoarea gresita.",
    content: "Procentele apar peste tot: la discounturi, TVA, bonusuri, cresterea preturilor sau comparatii intre perioade. Tocmai pentru ca par atat de familiare, multi utilizatori sar direct la rezultat si aplica formula pe baza gresita.\n\nPrima intrebare importanta este intotdeauna: procent din ce? Uneori cauti procent dintr-o suma, alteori vrei diferenta procentuala intre doua valori, iar alteori vrei sa afli valoarea initiala dintr-un rezultat final. Toate par apropiate, dar nu folosesc aceeasi logica.\n\nUn calculator bun de procente nu inseamna doar o operatie matematica. Inseamna si claritate: unde este baza, ce reprezinta procentul si ce vrei sa obtii efectiv din calcul. Cand aceste trei lucruri sunt clare, restul devine usor.\n\nPentru utilizatorii de pe toolnet, zona de procente este si o poarta foarte buna spre alte calcule financiare: TVA, discount, economii sau comparatii de pret. De aceea merita tratata ca hub util, nu doar ca o pagina izolata.\n\nDaca vrei rezultate curate, regula simpla este asta: verifica mai intai baza si abia apoi procentul. Cele mai multe greseli se rezolva exact aici.",
    articleType: "guide",
    relatedCategorySlug: "finante",
    relatedCalculatorKeys: ["percentage-of-number", "percentage-change", "reverse-percentage"],
    relatedArticleSlugs: ["procent-din-numar-vs-diferenta-procentuala"],
    launchWave: "backlog",
  },
  {
    slug: "procent-din-numar-vs-diferenta-procentuala",
    title: "Procent din numar vs diferenta procentuala: doua calcule care par la fel, dar raspund la intrebari diferite",
    excerpt: "Unul iti spune cat inseamna un procent aplicat unei valori, iar celalalt iti arata cu cat s-a schimbat o valoare fata de baza initiala.",
    content: "Confuzia dintre procent din numar si diferenta procentuala este una dintre cele mai frecvente in calculele de zi cu zi. La prima vedere, ambele implica procente si doua valori, dar intrebarea la care raspund este diferita.\n\nCand calculezi procent din numar, aplici o pondere peste o valoare de baza. Exemplul clasic este TVA-ul sau un comision: 19% din 1.500 lei inseamna 285 lei. Cand calculezi diferenta procentuala, compari o valoare noua cu una initiala si vrei sa vezi ritmul de crestere sau scadere.\n\nAici apare eroarea tipica: oamenii amesteca intre ele baza si rezultatul. In practica, asta poate duce la promotii interpretate gresit, comparatii financiare slabe sau rapoarte care par mai bune ori mai rele decat sunt in realitate.\n\nPe un hub de calculatoare, aceste doua pagini trebuie sa stea una langa alta tocmai pentru ca utilizatorul se misca natural intre ele. Daca incepe cu procente simple, ajunge repede la discount, TVA sau procent invers.\n\nIn concluzie, intrebarea corecta este mai importanta decat formula. Daca stii daca vrei pondere, comparatie sau valoare initiala, alegi imediat calculatorul potrivit.",
    articleType: "comparison",
    relatedCategorySlug: "finante",
    relatedCalculatorKeys: ["percentage-of-number", "percentage-change", "reverse-percentage"],
    relatedArticleSlugs: ["cum-calculezi-procentele-corect"],
    launchWave: "backlog",
  },
  {
    slug: "cum-calculezi-discountul-real",
    title: "Cum calculezi discountul real si de ce procentul afisat nu spune mereu toata povestea",
    excerpt: "Promotiile suna bine in procente, dar decizia buna vine din pretul final si din comparatia cu baza reala.",
    content: "Discountul este unul dintre cele mai cautate calcule comerciale pentru ca pare foarte simplu si foarte intuitiv. Totusi, in practica, utilizatorii se pot lasa pacaliti usor de felul in care este prezentat procentul.\n\nUn discount de 20% este relevant doar daca stii pretul initial real si poti compara pretul final cu alternativele. Daca baza initiala este umflata sau daca apar costuri suplimentare, procentul in sine devine mai putin important.\n\nCalculatorul de discount are rolul bun de a transforma procentul intr-o suma concreta. Asta ajuta mult in achizitii, oferte, pricing intern si verificarea rapida a unei promotii. Pentru firme mici, utilitatea este la fel de clara in negociere sau in scenarii de marja.\n\nLegatura cu procent invers si TVA este fireasca. Uneori nu vrei doar pretul final, ci si pretul de plecare sau comparatia intre net si brut. De aceea acest calculator sta bine intr-un cluster financiar mai larg.\n\nPe scurt, discountul real nu se judeca doar dupa procentul afisat. Se judeca dupa baza folosita, suma economisita si pretul final obtinut.",
    articleType: "guide",
    relatedCategorySlug: "finante",
    relatedCalculatorKeys: ["discount", "reverse-percentage", "percentage-of-number"],
    relatedArticleSlugs: ["cum-calculezi-procentele-corect"],
    launchWave: "backlog",
  },
  {
    slug: "tva-inclus-vs-tva-exclus",
    title: "TVA inclus vs TVA exclus: cum gandesti corect cand treci de la net la brut si inapoi",
    excerpt: "TVA-ul pare banal pana cand lucrezi cu suma gresita. Diferenta dintre net si brut merita inteleasa clar.",
    content: "TVA-ul este un calcul simplu doar pana in momentul in care nu mai stii daca suma de la care pleci este neta sau bruta. Exact aici apar multe erori practice, mai ales in oferte, facturi si comparatii rapide de pret.\n\nDaca pleci de la suma fara TVA, ai nevoie de calculatorul clasic de TVA. Daca pleci de la totalul cu TVA inclus, trebuie sa lucrezi invers si sa separi componenta fiscala de baza neta. Cele doua scenarii folosesc formule diferite si nu se pot amesteca.\n\nPentru utilizatori individuali, asta inseamna preturi si comparatii mai curate. Pentru firme mici, inseamna verificari mai rapide si mai putine confuzii in lucru zilnic.\n\nCa produs editorial, TVA-ul este o pagina foarte bună pentru ca uneste intentia answer-first cu nevoia de clarificare. Utilizatorul nu vrea doar o cifră, ci și certitudinea că lucrează cu suma corectă.\n\nDe aceea merită să tratăm netul și brutul ca două pagini surori și să le legăm natural de procente, discount și calcule comerciale.",
    articleType: "comparison",
    relatedCategorySlug: "finante",
    relatedCalculatorKeys: ["vat", "reverse-vat", "percentage-of-number"],
    relatedArticleSlugs: ["cum-calculezi-procentele-corect"],
    launchWave: "backlog",
  },
  {
    slug: "cum-functioneaza-dobanda-compusa",
    title: "Cum functioneaza dobanda compusa si de ce timpul este mai important decat pare la prima vedere",
    excerpt: "Dobanda compusa nu inseamna doar randament. Inseamna si timp, constanta si reinvestirea castigurilor.",
    content: "Dobanda compusa este unul dintre conceptele financiare care par simple in formulă, dar capătă cu adevărat sens abia când vezi efectul lor în timp. Ideea de bază este că nu câștigi doar dobândă la suma inițială, ci și la dobânda deja acumulată.\n\nDe aici vine puterea reală a capitalizării. O diferență mică de rată sau de perioadă poate schimba semnificativ valoarea finală, mai ales când vorbim despre mulți ani. Tocmai de aceea timpul contează uneori mai mult decât pare la început.\n\nCalculatorul de dobândă compusă este util pentru investiții, depozite sau planificări orientative. El nu promite un rezultat real, ci un model matematic curat pentru a înțelege mai bine scenariul.\n\nÎn practică, merită legat de economii lunare și obiective financiare. Mulți utilizatori nu investesc o sumă unică, ci construiesc treptat un plan. Iar acolo dobânda compusă devine și mai interesantă.\n\nPe scurt, randamentul contează, dar constanța și timpul fac diferența mare. Asta este ideea centrală pe care calculatorul trebuie să o lase clară.",
    articleType: "guide",
    relatedCategorySlug: "finante",
    relatedCalculatorKeys: ["compound-interest", "monthly-savings", "savings-goal"],
    relatedArticleSlugs: ["cum-planifici-economii-lunare"],
    launchWave: "backlog",
  },
  {
    slug: "cum-planifici-economii-lunare",
    title: "Cum planifici economii lunare fara sa iti setezi o tinta frumoasa, dar imposibil de sustinut",
    excerpt: "Economisirea buna nu inseamna doar ambitie, ci si un ritm lunar realist pe care il poti tine luni sau ani.",
    content: "Economiile lunare par ușor de planificat până când încerci să le ții constant în viața reală. De aceea, primul pas util nu este o cifră spectaculoasă, ci un ritm care poate fi susținut pe termen lung.\n\nCalculatorul de economii lunare ajută exact aici: transformă o contribuție recurentă și un orizont de timp într-un total concret. Asta îl face foarte bun pentru obiective intermediare, fond de urgență sau achiziții planificate.\n\nCând adaugi și dobândă, apare motivația suplimentară. Utilizatorul vede că timpul și consistența produc efect cumulativ, nu doar simpla adunare a sumelor depuse.\n\nÎn același timp, nu merită să supraestimezi randamentul sau să subestimezi cât de greu este să economisești aceeași sumă în fiecare lună. Un scenariu moderat este adesea mai util decât unul optimist, dar greu de menținut.\n\nDe aceea pagina de economii lunare trebuie legată firesc de dobândă compusă și de obiectiv economisire. Împreună formează un traseu bun de planificare personală.",
    articleType: "guide",
    relatedCategorySlug: "finante",
    relatedCalculatorKeys: ["monthly-savings", "savings-goal", "compound-interest"],
    relatedArticleSlugs: ["cum-functioneaza-dobanda-compusa"],
    launchWave: "backlog",
  },
  {
    slug: "cum-estimezi-un-obiectiv-de-economisire",
    title: "Cum estimezi un obiectiv de economisire pornind de la termen, nu doar de la suma dorita",
    excerpt: "Tinta finala este doar o parte din calcul. Ritmul lunar si termenul schimba complet fezabilitatea planului.",
    content: "Mulți utilizatori pornesc de la suma pe care vor să o strângă și abia apoi descoperă că termenul ales face diferența dintre un plan realist și unul foarte tensionat. De aceea calculatorul de obiectiv economisire este util tocmai pentru această verificare rapidă.\n\nDacă știi suma finală și perioada, poți vedea imediat ritmul lunar necesar. Apoi poți ajusta termenul, dobânda sau valoarea țintei până când planul devine sustenabil.\n\nAici apare și valoarea editorială a paginii: nu afișează doar o contribuție lunară, ci te ajută să gândești mai realist relația dintre dorință, timp și disciplină financiară. Pentru un avans, un fond de urgență sau o achiziție mare, asta contează mult.\n\nLegătura cu economiile lunare și dobânda compusă este naturală. Uneori pleci de la ritmul lunar și vezi unde ajungi; alteori pleci de la țintă și vezi cât trebuie să pui deoparte.\n\nAcesta este motivul pentru care pagina merită construită ca parte dintr-un mini-cluster financiar, nu ca un calculator izolat.",
    articleType: "guide",
    relatedCategorySlug: "finante",
    relatedCalculatorKeys: ["savings-goal", "monthly-savings", "compound-interest"],
    relatedArticleSlugs: ["cum-planifici-economii-lunare"],
    launchWave: "backlog",
  },
  {
    slug: "cum-citesti-rata-lunara-la-un-credit",
    title: "Cum citesti rata lunara la un credit fara sa te uiti doar la suma de plata din fiecare luna",
    excerpt: "Rata lunara spune ceva important, dar costul total si dobanda acumulata spun de obicei si mai mult.",
    content: "Rata lunară este de obicei primul număr la care se uită cineva când compară un credit. Este firesc, pentru că afectează direct bugetul lunar. Dar dacă te oprești doar aici, riști să ratezi costul total al deciziei.\n\nCalculatorul de rată credit este util pentru că pune împreună trei lucruri: suma împrumutată, perioada și dobânda. Din ele rezultă nu doar rata lunară, ci și costul total și dobânda plătită în timp.\n\nAsta schimbă perspectiva. Uneori o rată lunară mai mică poate ascunde un cost total mult mai mare dacă perioada este foarte lungă. De aceea comparația bună nu se face pe un singur număr.\n\nÎn plus, utilizatorul câștigă context și pentru alte decizii: merită să scurteze perioada, să crească avansul sau să economisească mai mult înainte de credit? Aici apar legăturile naturale cu obiectivele de economisire și cu dobânda compusă.\n\nUn calculator bun de rată nu înlocuiește oferta concretă a băncii, dar este excelent ca filtru rapid și ca instrument de claritate înainte de pasul următor.",
    articleType: "guide",
    relatedCategorySlug: "finante",
    relatedCalculatorKeys: ["loan-payment", "monthly-savings", "compound-interest"],
    relatedArticleSlugs: ["cum-estimezi-un-obiectiv-de-economisire"],
    launchWave: "backlog",
  },
  {
    slug: "cum-calculezi-cresterea-salariala-corect",
    title: "Cum calculezi cresterea salariala corect fara sa compari doua sume scoase din context",
    excerpt: "O crestere salariala buna nu inseamna doar un procent frumos. Conteaza si baza de comparatie, bonusurile si programul de lucru.",
    content: "Cresterea salariala pare simpla pana cand incepi sa compari oferte diferite, beneficii neuniforme si structuri de plata care nu seamana intre ele.\n\nDe aceea, primul pas util nu este doar sa vezi cu cat creste suma finala in lei, ci sa transformi diferenta intr-un procent clar si sa o pui in context. O crestere de 1.000 lei poate insemna foarte mult intr-un scenariu si relativ putin in altul, in functie de baza de la care pleci.\n\nCalculatorul de crestere salariala este valoros tocmai pentru ca reduce zgomotul. Iti arata rapid diferenta absoluta si diferenta procentuala, iar de acolo poti continua cu tariful orar, cu venitul anual sau cu analiza brut versus net.\n\nAsta conteaza mai ales cand compari un job nou, o renegociere sau o schimbare de rol. Uneori doua oferte apropiate ca suma lunara se simt foarte diferit dupa ce iei in calcul timpul lucrat, bonusurile sau taxarea efectiva.\n\nPrivita corect, cresterea salariala nu este doar un numar. Este un semnal care te ajuta sa decizi daca merita sa negociezi, sa accepti oferta sau sa compari mai multe scenarii inainte de urmatorul pas.",
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
    title: "Cum transformi salariul lunar in tarif orar fara sa ignori orele reale lucrate",
    excerpt: "Tariful orar devine util doar daca pornesti de la numarul real de ore, nu de la o luna idealizata.",
    content: "Tariful orar este unul dintre cele mai utile repere atunci cand vrei sa compari doua oferte, sa intelegi valoarea unei zile de lucru sau sa transformi un venit lunar intr-o cifra mai usor de discutat.\n\nProblema apare atunci cand folosesti un numar generic de ore, fara sa te uiti la luna concreta sau la programul real. Diferenta dintre 160 si 184 de ore poate schimba semnificativ concluzia, mai ales daca folosesti tariful orar pentru comparatii comerciale sau de cariera.\n\nCalculatorul de tarif orar ar trebui folosit impreuna cu cel de ore lucrate pe luna. Unul iti arata reperul pe ora, celalalt te ajuta sa validezi baza de calcul. Abia dupa aceea poti interpreta corect daca diferenta dintre doua oferte este cu adevarat relevanta.\n\nAcest lucru este util si pentru firme, nu doar pentru persoane. Managerii compara uneori costuri interne, freelanceri sau proiecte pornind tocmai de la un tarif orar orientativ.\n\nTariful orar nu inlocuieste toate nuantele unui pachet de compensare, dar este un punct excelent de clarificare atunci cand vrei sa compari mere cu mere, nu sume lunare scoase din context.",
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
    title: "Cate ore lucrezi intr-o luna de fapt si de ce raspunsul conteaza mai mult decat pare",
    excerpt: "Numarul de ore lucrate schimba comparatia dintre oferte, tarife si asteptari de volum. Iata cum il folosesti corect.",
    content: "Multi utilizatori pornesc de la ideea ca o luna inseamna acelasi numar de ore de fiecare data. In practica, zilele lucratoare variaza, iar asta schimba imediat orice comparatie care depinde de timpul efectiv lucrat.\n\nCalculatorul de ore lucrate pe luna este foarte simplu, dar tocmai de aceea util. El iti ofera baza de care ai nevoie pentru a transforma salariul intr-un tarif orar, pentru a compara doua programe sau pentru a intelege mai bine volumul lunar de munca.\n\nIn plus, este un calculator bun pentru decizii de planning. Daca stii cate ore apar in luna curenta, poti construi mai realist scenarii despre venit, cost orar sau distributia timpului intre activitati.\n\nMerita totusi sa privesti rezultatul cu un pic de prudenta. Turele, orele suplimentare, concediile sau zilele libere suplimentare pot schimba imaginea finala.\n\nCa pagina de produs, acest calculator functioneaza bine cand este conectat de tarif orar, venit anual si crestere salariala. Singur este simplu; in cluster devine un reper foarte util pentru decizie.",
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
    title: "Cum citesti diferenta dintre brut, net si taxare efectiva fara sa tragi concluzii gresite",
    excerpt: "Brutul, netul si diferenta dintre ele spun lucruri utile, dar nu inseamna automat acelasi lucru.",
    content: "Diferenta dintre brut si net este una dintre cele mai frecvente surse de confuzie atunci cand cineva compara oferte, vrea sa inteleaga cat ramane efectiv disponibil sau incearca sa explice o rata aparent mare de taxare.\n\nCalculatorul de taxare efectiva este util pentru ca face vizibila distanta dintre cele doua valori. El iti arata suma absoluta care se pierde pe traseu si procentul orientativ pe care aceasta il reprezinta din brut.\n\nTotusi, merita sa nu supralicitezi interpretarea. Taxarea efectiva te ajuta sa vezi diferenta dintre doua numere, dar nu iti spune automat intreaga poveste fiscala din spate. De aceea este bun pentru orientare rapida, nu pentru consultanta fiscala sau de payroll.\n\nCa instrument de decizie, valoarea lui este mare in doua situatii: cand compari mai multe variante salariale si cand vrei sa intelegi mai clar de ce doua sume brute apropiate se simt diferit dupa taxare.\n\nPusa in context, diferenta brut-net devine mai usor de folosit impreuna cu venitul anual, tariful orar si cresterea salariala. In felul acesta nu ramai doar cu un procent, ci cu o imagine mai buna despre valoarea reala a unui pachet de compensare.",
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
    title: "Cum estimezi venitul anual fara sa amesteci bonusurile cu salariul lunar",
    excerpt: "Venitul anual clarifica mult mai bine comparatiile atunci cand bonusurile si lunile suplimentare fac parte din pachet.",
    content: "Venitul lunar este util pentru ritmul zilnic al bugetului, dar nu este intotdeauna suficient atunci cand vrei sa compari doua oferte sau sa planifici realist anul urmator.\n\nIn multe cazuri apar bonusuri, prime, a 13-a luna sau alte componente care schimba imaginea finala. Daca le amesteci direct cu salariul lunar, comparatia devine mai confuza, nu mai clara.\n\nCalculatorul de venit anual este folositor tocmai pentru ca separa aceste elemente si le aduce la un numitor comun: totalul pe an. Din acel moment devine mai usor sa compari doua scenarii salariale, doua roluri sau doua structuri diferite de compensare.\n\nMai mult, venitul anual este un punct de pornire bun si pentru planificare. Il poti conecta de cresterea salariala, de taxare efectiva sau de obiective financiare mai mari.\n\nCa produs editorial, aceasta pagina este valoroasa pentru ca nu ofera doar un total. Te invata sa compari mai corect si sa vezi dincolo de suma lunara afisata prima data intr-o oferta.",
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
    title: "Cum afli ce rata iti permiti fara sa iti blochezi bugetul inca din prima luna",
    excerpt: "Rata suportabila nu inseamna doar cat aproba banca, ci si cat poti duce realist fara sa-ti strangulezi restul bugetului.",
    content: "Cand oamenii cauta ce rata isi permit, tentația fireasca este sa se uite direct la suma maxima pe care o pot obtine. In practica, ordinea buna este inversa: incepi de la bugetul lunar si abia apoi vezi ce suma finantabila rezulta.\n\nCalculatorul de rata maxima suportabila este util exact pentru acest pas. El iti arata rapid ce spatiu exista intre venit, ratele deja existente si pragul de indatorare pe care il consideri acceptabil.\n\nAsta conteaza mult pentru ca o rata aprobata nu este intotdeauna si o rata confortabila. Diferenta dintre cele doua se vede de obicei dupa cateva luni, cand apar cheltuieli neplanificate sau cand bugetul incepe sa devina prea rigid.\n\nDe aceea, pagina trebuie citita impreuna cu gradul de indatorare, cu avansul si cu costul total al creditului. Doar asa treci de la o cifra frumoasa pe hartie la o decizie sustenabila.\n\nPe scurt, intrebarea corecta nu este doar cate lei pot imprumuta, ci cat imi permit sa platesc lunar fara sa stric restul echilibrului financiar.",
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
    title: "Cum citesti costul total al unui credit fara sa te uiti doar la rata lunara",
    excerpt: "Rata lunara conteaza, dar costul total este cel care iti arata cat platesti de fapt pentru finantare.",
    content: "Rata lunara este primul numar care atrage atentia atunci cand compari doua credite. Este firesc, pentru ca afecteaza direct bugetul din fiecare luna. Dar daca te opresti doar aici, poti rata imaginea de ansamblu.\n\nCalculatorul de cost total credit are exact rolul de a muta atentia de la cifra lunara la pretul complet al deciziei. El te ajuta sa vezi cat platesti in total si cat reprezinta dobanda acumulata in timp.\n\nAsta este important pentru ca o perioada mai lunga poate cobori rata lunara, dar poate ridica puternic costul final. De aceea, comparatia buna nu se face pe un singur numar, ci pe relatia dintre rata, perioada si suma totala platita.\n\nPagina merita legata de refinantare, avans si rata maxima suportabila. Asa utilizatorul poate trece de la o simpla simulare la un traseu mai realist de decizie.\n\nConcluzia utila este simpla: rata lunara iti spune daca poti intra in scenariu, dar costul total iti spune daca merita cu adevarat sa ramai in el.",
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
    title: "Cand merita refinantarea si cand doar pare o idee buna pentru ca rata lunara scade",
    excerpt: "O rata noua mai mica nu inseamna automat refinantare buna. Merita sa vezi si costul mutarii si timpul de recuperare.",
    content: "Refinantarea suna bine aproape de fiecare data cand rata lunara scade. Problema este ca o parte din atractivitatea ei vine din faptul ca ne uitam la un singur numar si ignoram restul contextului.\n\nCalculatorul de economie refinantare este util tocmai pentru ca pune in aceeasi imagine diferenta de rata, lunile ramase si costul refinantarii. Asta te ajuta sa vezi nu doar daca economisesti in teorie, ci si in cat timp recuperezi costul mutarii.\n\nUneori refinantarea merita clar. Alteori scaderea lunara este prea mica, perioada ramasa este prea scurta sau costul initial este prea mare ca sa mai faca sens.\n\nDe aceea pagina trebuie legata de cost total credit si de gradul de indatorare. O refinantare buna nu inseamna doar o rata mai mica, ci un echilibru mai bun intre bugetul lunar si costul total ramas.\n\nDaca vrei decizie buna, uita-te intotdeauna la trei lucruri: economia lunara, economia neta dupa costuri si lunile in care iti recuperezi mutarea.",
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
    title: "Cum iti construiesti fondul de urgenta fara sa ramai fara lichiditati pentru restul obiectivelor",
    excerpt: "Fondul de urgenta trebuie sa-ti dea stabilitate, nu sa-ti blocheze complet restul planului financiar.",
    content: "Fondul de urgenta este una dintre cele mai utile idei financiare simple, tocmai pentru ca transforma nesiguranta intr-o marja de respiratie. Problema apare atunci cand utilizatorul aude o regula generala, dar nu o traduce intr-o suma concreta si realista.\n\nCalculatorul de fond de urgenta face exact acest pas: porneste de la cheltuielile esentiale si iti arata ce suma are sens sa urmaresti in functie de numarul de luni de acoperire dorit.\n\nAsta conteaza pentru ca fondul de urgenta nu este acelasi lucru cu economiile pentru vacanta, avans sau investitii. Rolul lui este lichiditatea si stabilitatea, nu randamentul maxim.\n\nIn acelasi timp, nu merita sa construiesti fondul intr-un mod care sufoca complet restul planului financiar. De aceea merita legat de obiectivele de economisire si de evolutia economiilor in timp.\n\nPe scurt, fondul de urgenta bun este suficient de mare incat sa te ajute in perioade grele, dar suficient de bine planificat incat sa nu-ti blocheze complet celelalte decizii importante.",
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
    title: "Cum planifici economii pe termen lung pentru obiective mari fara sa te bazezi doar pe optimism",
    excerpt: "Cand obiectivul este mare, ai nevoie de ritm, termen si un scenariu mai realist decat pare la prima vedere.",
    content: "Obiectivele financiare mari par descurajante tocmai pentru ca distanta dintre situatia actuala si suma finala este mare. Din acest motiv, multi oameni ori nu incep deloc, ori pornesc cu un plan prea optimist ca sa fie sustenabil.\n\nCalculatorul de termen pentru obiectiv de economisire si cel de dobanda economii ajuta exact aici. Unul iti spune in cat timp ajungi la tinta, celalalt iti arata cum se schimba rezultatul cand adaugi constanta si randament.\n\nValoarea lor reala nu este doar in cifra finala, ci in faptul ca iti permit sa schimbi usor variabilele si sa vezi ce este realist. Poate ca nu trebuie sa dublezi contributia lunara; poate este suficient sa extinzi termenul sau sa separi mai clar obiectivele.\n\nPentru produsul nostru, aceste pagini merita sa formeze un mini-cluster coerent alaturi de fondul de urgenta si economiile pentru pensie. Acolo incepe cu adevarat zona de decision support financiar.\n\nUn plan bun de economisire pe termen lung nu este cel mai spectaculos din prima zi, ci cel pe care il poti tine si ajusta fara sa te rupi de realitate dupa primele luni.",
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
    title: "Leasing vs credit: cum compari corect doua scenarii de finantare fara sa te blochezi in rata lunara",
    excerpt: "Leasingul si creditul pot parea apropiate la nivel de rata, dar costul total si flexibilitatea conteaza la fel de mult.",
    content: "Comparatia dintre leasing si credit este una dintre cele mai interesante pentru ca ambele produse pot rezolva aceeasi nevoie, dar o fac in moduri diferite. De aceea utilizatorul nu are nevoie doar de o formula, ci de o comparatie structurata bine.\n\nCalculatorul de leasing vs credit face un prim pas bun: pune in aceeasi imagine avansul, rata lunara, perioada si costul final. Astfel vezi rapid care scenariu este mai ieftin in forma lui cea mai simpla.\n\nTotusi, o decizie buna nu se opreste aici. In practica intervin fiscalitatea, proprietatea finala, valoarea reziduala, flexibilitatea operationala si profilul utilizatorului. Exact de aceea pagina trebuie construita ca instrument de comparatie initiala, nu ca verdict unic.\n\nValoarea editoriala mare vine din faptul ca utilizatorul ajunge natural apoi la cost total credit, la avans si la rata suportabila. Acolo se leaga frumos si clusterul credite-si-economii.\n\nDaca vrei sa compari corect doua scenarii de finantare, incepe cu costul total, dar nu uita sa citesti si ce tip de obligatie iti asumi pe toata perioada contractului.",
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
    title: "Cum citesti ROAS fara sa confunzi venitul cu profitul real",
    excerpt: "ROAS-ul este util, dar fara marja si costuri poate arata mai bine decat realitatea. Iata cum il folosesti corect.",
    content: "ROAS-ul este unul dintre cei mai atragatori indicatori din marketing pentru ca promite un raspuns simplu: cat venit a generat fiecare leu investit in ads. Problema este ca simplu nu inseamna intotdeauna suficient.\n\nCalculatorul ROAS te ajuta sa vezi repede raportul dintre venit si buget. Dar decizia buna apare abia atunci cand legi rezultatul de marja, de costurile de fulfilment, de retururi si de diferenta dintre venit si profit.\n\nUn ROAS de 4 poate parea excelent. Daca marja disponibila dupa costurile directe este mica, campania poate totusi sa fie sub break-even. De aceea paginile de business trebuie sa lege ROAS-ul de break-even ROAS, CAC si profit.\n\nCel mai bun mod de a folosi acest calculator este ca filtru de prima lectura. El iti spune daca merita sa cercetezi mai departe, nu daca ai deja verdictul final.\n\nConcluzia practica este simpla: ROAS-ul este bun pentru orientare rapida, dar profitul real apare doar cand pui langa el marja si costul complet al modelului tau comercial.",
    articleType: "guide",
    relatedCategorySlug: "business",
    relatedCalculatorKeys: ["roas", "break-even-roas", "gross-profit"],
    relatedArticleSlugs: ["break-even-roas-explicat-pentru-campanii-platite"],
    launchWave: "backlog",
    releaseBatch: "batch-07",
    audience: "business",
  },
  {
    slug: "break-even-roas-explicat-pentru-campanii-platite",
    title: "Break-even ROAS explicat pentru campanii platite fara sa fortezi concluziile",
    excerpt: "Afla ce prag minim trebuie sa atinga o campanie ca sa nu piarda bani la marja ta reala.",
    content: "Break-even ROAS-ul este unul dintre cei mai practici indicatori pentru echipele care vor sa scape de interpretarile prea optimiste ale performantei. El traduce marja intr-un prag minim de ROAS.\n\nCalculatorul de break-even ROAS te ajuta sa raspunzi la o intrebare simpla: de la ce punct in sus campania incepe sa aiba sens economic? Asta este mult mai valoros decat sa spui vag ca ai un ROAS bun sau rau.\n\nDaca marja este subtire, pragul de break-even urca. Daca marja este generoasa, campaniile au mai mult spatiu de manevra. Din acest motiv, acelasi ROAS poate fi excelent intr-un business si insuficient in altul.\n\nPagina trebuie legata natural de profit brut, venit tinta si ROAS real. Asa utilizatorul poate merge de la un prag teoretic la o comparatie practica intre scenariul minim necesar si performanta curenta.\n\nConcluzia buna este ca break-even ROAS-ul nu este un KPI spectaculos, dar este unul dintre cele mai utile pentru disciplina decizionala.",
    articleType: "explainer",
    relatedCategorySlug: "business",
    relatedCalculatorKeys: ["break-even-roas", "roas", "target-revenue"],
    relatedArticleSlugs: ["cum-citesti-roas-fara-sa-confunzi-venitul-cu-profitul"],
    launchWave: "backlog",
    releaseBatch: "batch-07",
    audience: "business",
  },
  {
    slug: "cum-calculezi-cac-si-cpl-fara-sa-amesteci-canalele",
    title: "Cum calculezi CAC si CPL fara sa amesteci canalele, perioadele si definitiile",
    excerpt: "CAC si CPL sunt utile doar daca definesti corect costurile, lead-urile si clientii noi. Altfel comparatia te poate induce in eroare.",
    content: "CAC si CPL sunt doi indicatori aparent simpli, dar foarte usor de distorsionat in practica. Cele mai multe probleme apar atunci cand compari campanii diferite, perioade diferite sau lead-uri definite diferit.\n\nCalculatorul CPL iti arata costul unui lead. Calculatorul CAC iti spune cat te costa un client nou. Intre cele doua exista mereu o zona de conversie, iar acolo apar multe dintre interpretarile gresite.\n\nDaca un canal genereaza lead-uri ieftine dar slab calificate, CPL-ul poate parea excelent, in timp ce CAC-ul ramane slab. Invers, un canal mai scump la nivel de lead poate genera clienti mai repede si mai predictibil.\n\nCel mai bun mod de a folosi aceste calcule este in pereche, cu aceeasi fereastra de timp si cu aceeasi logica de atribuire. Doar asa poti vedea daca problema este in volum, in calitate sau in procesul comercial.\n\nConcluzia practica este ca nici CAC, nici CPL nu merita citite separat. Abia impreuna spun ceva util despre eficienta reala a cresterii.",
    articleType: "guide",
    relatedCategorySlug: "business",
    relatedCalculatorKeys: ["cac", "cpl", "conversion-rate"],
    relatedArticleSlugs: ["aov-si-rata-de-conversie-ce-spun-impreuna-despre-funnel"],
    launchWave: "backlog",
    releaseBatch: "batch-07",
    audience: "business",
  },
  {
    slug: "aov-si-rata-de-conversie-ce-spun-impreuna-despre-funnel",
    title: "AOV si rata de conversie: ce spun impreuna despre funnel, nu doar separat",
    excerpt: "Valoarea medie a comenzii si rata de conversie devin cu adevarat utile cand sunt citite impreuna.",
    content: "AOV-ul si rata de conversie sunt doi indicatori care par separati, dar in realitate descriu acelasi traseu comercial din unghiuri diferite. Unul iti spune cat valoreaza o comanda, celalalt cat de des ajunge traficul la comanda.\n\nDaca AOV-ul creste, dar conversia cade, venitul poate ramane pe loc. Daca rata de conversie creste, dar AOV-ul scade puternic, rezultatul final poate fi la fel de dezamagitor. De aceea cele doua merita citite in pereche.\n\nCalculatorul AOV este bun pentru a intelege structura venitului pe comanda. Calculatorul de conversie este bun pentru a intelege eficienta funnel-ului. Impreuna, ele spun o poveste comerciala mult mai buna decat oricare luat singur.\n\nPagina merita legata si de ROAS sau CAC atunci cand traficul este platit, pentru ca acolo fiecare imbunatatire in AOV sau conversie se vede direct in economie si scalare.\n\nConcluzia practica este simpla: daca vrei decizii bune, nu intreba doar cat vinzi sau cat de des vinzi, ci si cum lucreaza cele doua impreuna.",
    articleType: "guide",
    relatedCategorySlug: "business",
    relatedCalculatorKeys: ["aov", "conversion-rate", "roas"],
    relatedArticleSlugs: ["cum-calculezi-cac-si-cpl-fara-sa-amesteci-canalele"],
    launchWave: "backlog",
    releaseBatch: "batch-07",
    audience: "business",
  },
  {
    slug: "cum-estimezi-targetul-de-venit-si-profitul-real",
    title: "Cum estimezi targetul de venit si profitul real fara sa construiesti pe marje prea optimiste",
    excerpt: "Venitul tinta pare simplu, dar depinde de marja reala si de costurile pe care chiar le incluzi in calcul.",
    content: "Cand spui ca vrei un anumit venit luna viitoare, de fapt spui ca vrei sa acoperi costuri, sa sustii marketingul si sa ramai cu un anumit profit. De aceea venitul tinta trebuie construit pornind de la marja si costuri, nu ales arbitrar.\n\nCalculatorul de venit tinta este util pentru ca transforma aceasta logica intr-o cifra clara. El porneste de la costurile fixe, profitul dorit si marja disponibila, iar apoi iti arata ce nivel de venit trebuie sa atingi.\n\nAici apare si capcana cea mai frecventa: folosirea unei marje prea generoase. Daca marja este idealizata, tot planul comercial va parea mai usor decat este in realitate. De aceea merita sa pui alaturi si profitul brut, profitul net si break-even ROAS-ul.\n\nPagina este foarte buna pentru businessuri mici, ecommerce sau servicii care au nevoie de un reper rapid intre obiectiv si executie. Ea muta discutia de la intuitie la constrangere reala.\n\nConcluzia practica este ca targetul bun de venit nu porneste din ambitie, ci din structura economica a businessului.",
    articleType: "guide",
    relatedCategorySlug: "business",
    relatedCalculatorKeys: ["target-revenue", "gross-profit", "net-profit"],
    relatedArticleSlugs: ["break-even-roas-explicat-pentru-campanii-platite"],
    launchWave: "backlog",
    releaseBatch: "batch-07",
    audience: "business",
  },
  {
    slug: "rotatia-stocului-explicata-pentru-ecommerce-si-retail",
    title: "Rotatia stocului explicata pentru ecommerce si retail fara formule inutile",
    excerpt: "Rotatia stocului arata cat de repede transformi marfa in vanzari si cat capital ramane blocat in stoc.",
    content: "Rotatia stocului este una dintre cele mai subestimate formule in businessurile care vand produse fizice. Multi se uita doar la venit sau la volum, fara sa observe cat capital ramane blocat in marfa.\n\nCalculatorul de rotatie stoc iti arata de cate ori se roteste stocul intr-o perioada si cate zile ramane, in medie, marfa in depozit. Asta este extrem de util pentru ecommerce, retail sau distributie.\n\nIndicatorul nu trebuie citit izolat. O rotatie foarte mare poate insemna eficienta, dar si risc de rupturi de stoc. O rotatie mica poate insemna selectie slaba, forecast prost sau capital imobilizat inutil.\n\nCel mai bun mod de a folosi pagina este impreuna cu venitul tinta si profitul. Asa poti vedea daca viteza stocului sustine obiectivele comerciale sau le saboteaza discret prin capital blocat si lichiditate slaba.\n\nConcluzia practica este ca stocul nu este doar inventar. Este cash care se misca mai repede sau mai greu, iar rotatia iti arata exact asta.",
    articleType: "explainer",
    relatedCategorySlug: "business",
    relatedCalculatorKeys: ["inventory-turnover", "target-revenue", "gross-profit"],
    relatedArticleSlugs: ["cum-estimezi-targetul-de-venit-si-profitul-real"],
    launchWave: "backlog",
    releaseBatch: "batch-07",
    audience: "business",
  },
  {
    slug: "cum-citesti-factura-de-curent-fara-sa-te-pierzi-in-detalii-inutile",
    title: "Cum citesti factura de curent fara sa te pierzi in detalii inutile",
    excerpt: "Factura pare complicata, dar pentru decizie iti trebuie cateva repere clare: consum, pret efectiv si cost anual.",
    content: "Factura de curent sperie multi utilizatori pentru ca aduna consum, tarife, componente fixe si tot felul de denumiri care par mai tehnice decat sunt in practica. Totusi, pentru o decizie buna, nu ai nevoie sa memorezi tot documentul. Ai nevoie sa vezi cateva repere clare.\n\nCalculatorul de factura de curent te ajuta sa legi consumul lunar de pretul efectiv pe kWh si de costul total aproximativ. Asta este mult mai util decat sa ramai doar cu impresia ca factura a crescut sau a scazut.\n\nPagina trebuie legata si de consumul aparatelor, pentru ca de acolo incepe controlul real. Daca nu stii cine consuma, factura ramane doar o surpriza recurenta. Daca intelegi consumul de baza, poti construi scenarii mai bune: reducere, mutare de consum, panouri sau echipamente mai eficiente.\n\nConcluzia buna este simpla: factura nu trebuie interpretata ca un document opac, ci ca un rezumat al relatiei dintre consum, tarif si obiceiuri de utilizare.",
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
    title: "Cum estimezi consumul real al electrocasnicelor din casa fara sa te bazezi doar pe eticheta",
    excerpt: "Puterea din specificatii nu spune singura totul. Conteaza si timpul de folosire, ciclurile si comportamentul real al aparatului.",
    content: "Cand oamenii vor sa inteleaga de ce factura de curent pare mare, primul reflex este sa caute aparatul vinovat. Asta este o intuitie buna, dar problema este ca eticheta tehnica nu spune singura povestea completa.\n\nCalculatorul de consum al aparatului electric transforma puterea in cost, dar doar dupa ce legi cifra de orele reale de utilizare. Aici apare adevarata diferenta intre puterea maxima scrisa pe produs si consumul efectiv din fiecare zi.\n\nFrigiderul nu functioneaza la maxim tot timpul, iar un aparat de aer conditionat poate avea consum foarte diferit in functie de izolatie, temperatura ceruta si durata de functionare. De aceea merita sa folosesti calculatorul ca instrument de scenarii, nu ca verdict absolut.\n\nPagina trebuie legata de factura de curent si de zona de panouri fotovoltaice. Odata ce vezi unde se duce energia, devine mult mai usor sa alegi daca merita reducere de consum, schimbare de aparat sau productie proprie.\n\nConcluzia practica este ca un aparat nu consuma doar cat scrie pe eticheta. Consuma cat il lasi sa lucreze in casa ta reala.",
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
    title: "Cate panouri fotovoltaice iti trebuie de fapt, pornind din consumul real al casei",
    excerpt: "Numarul de panouri nu se ghiceste. El se leaga de consum, productie specifica si nivelul de acoperire dorit.",
    content: "Intrebarea despre numarul de panouri este una dintre cele mai frecvente in zona fotovoltaica, dar raspunsul bun nu porneste din acoperis, ci din consumul casei. Daca nu stii ce vrei sa acoperi, orice numar de panouri ramane doar o presupunere.\n\nCalculatorul de necesar sistem si cel de numar panouri functioneaza bine impreuna. Primul traduce consumul anual in kWp, iar al doilea transforma kWp in panouri si suprafata ocupata.\n\nAici apare si prima capcana: dorinta de a acoperi 100% din consum din prima. Uneori scenariile de 70-90% sunt mai realiste si mai bune economic. In plus, orientarea, umbrirea si spatiul util pot schimba repede concluzia initiala.\n\nPagina trebuie legata si de productia fotovoltaica si de amortizare. Numarul de panouri este doar o piesa dintr-un traseu mai mare care trebuie sa ajunga la productie si economie reala.\n\nConcluzia practica este ca intrebarea buna nu este doar cate panouri incap, ci cate panouri au sens pentru consumul si obiectivul tau.",
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
    title: "Cum estimezi productia fotovoltaica fara promisiuni umflate si cifre prea optimiste",
    excerpt: "Productia anuala poate fi estimata bine, dar merita citita ca scenariu, nu ca promisiune fixa.",
    content: "Productia fotovoltaica este unul dintre acele numere care poate arata foarte convingator in prezentari comerciale. Tocmai de aceea merita citita cu disciplina. Un calculator bun iti da un scenariu util, nu o promisiune rigida.\n\nCalculatorul de productie fotovoltaica porneste din kWp instalati si din productia specifica estimata. Asta il face foarte bun pentru comparatii rapide. Totusi, orientarea, umbrirea, inclinarea si pierderile reale ale sistemului pot schimba rezultatul fata de scenariul idealizat.\n\nDe aceea, pagina trebuie legata de necesarul sistemului, de numarul de panouri si de amortizare. Productia singura spune cat ai putea produce. Nu spune automat daca investitia are sens sau daca acoperisul este potrivit.\n\nPentru decizii mai atente, merita folosit ulterior si un instrument precum PVGIS. Dar pentru traseul editorial al site-ului nostru, calculatorul este foarte bun ca punct de start si comparatie.\n\nConcluzia practica este ca productia fotovoltaica este o estimare foarte valoroasa, atata timp cat nu o transformi din start in promisiune garantata.",
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
    title: "Cum citesti amortizarea unui sistem fotovoltaic fara sa cazi in optimism usor",
    excerpt: "Anii de amortizare sunt utili, dar doar daca vezi si ce ipoteze stau in spatele lor.",
    content: "Amortizarea este cifra care atrage instant atentia atunci cand discuti despre panouri fotovoltaice. Este firesc: ea pare sa raspunda direct la intrebarea daca merita sau nu investitia. Dar raspunsul bun depinde de ipoteze.\n\nCalculatorul de amortizare traduce costul net si economiile anuale intr-un numar de ani. Asta este util pentru comparatii rapide. Insa rezultatul devine credibil doar daca economiile sunt estimate realist si daca iei in calcul mentenanta, granturile si scenariile prudente de autoconsum.\n\nPagina trebuie legata de factura de curent, productie si necesarul sistemului. Doar asa utilizatorul poate vedea daca amortizarea vine dintr-un sistem potrivit sau dintr-o presupunere prea optimista.\n\nCea mai frecventa eroare este sa folosesti un pret al energiei mereu crescator si o productie mereu excelenta. In practica, merita sa compari si un scenariu mediu si unul conservator.\n\nConcluzia practica este ca amortizarea este un indicator bun, dar numai daca il citesti ca scenariu economic, nu ca promisiune simplificata.",
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
    title: "Cum alegi BTU-ul potrivit pentru aer conditionat fara sa supradimensionezi inutil",
    excerpt: "BTU-ul trebuie legat de camera reala, nu doar de o regula rapida memorata dintr-un forum.",
    content: "Cand alegi un aparat de aer conditionat, tentatia este sa cauti o regula rapida si sa o aplici direct. Problema este ca doua camere cu aceeasi suprafata pot avea nevoi foarte diferite daca difera inaltimea, insorirea sau izolatia.\n\nCalculatorul BTU este util pentru ca te forteaza sa pui in acelasi loc dimensiunea camerei si contextul termic. Asta te ajuta sa nu alegi nici un aparat prea slab, nici unul exagerat de mare.\n\nPagina merita legata de consumul aparatului si de costul energiei. Multi utilizatori aleg o putere prea mare din frica de subdimensionare, apoi descopera ca eficienta si confortul nu sunt neaparat mai bune.\n\nCel mai bun rezultat apare cand folosesti calculatorul ca punct de orientare, apoi validezi modelul in functie de locuinta si regimul real de folosire.\n\nConcluzia practica este ca BTU-ul bun nu vine dintr-o regula universala, ci dintr-o camera reala citita corect.",
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
    title: "Centrala vs pompa de caldura: cum compari corect costurile si necesarul termic",
    excerpt: "Comparatia buna porneste din necesarul termic si din costul real de operare, nu din impresii generale despre tehnologie.",
    content: "Comparatia dintre centrala si pompa de caldura este adesea condusa de opinii puternice si prea putine cifre. Tocmai de aceea merita sa pornesti din necesarul termic si din scenariul real al casei tale.\n\nCalculatorul de necesar de caldura si cel de dimensionare a pompei de caldura te ajuta sa vezi ce putere are sens. Fara acest pas, orice comparatie de echipament este fragila.\n\nApoi intervine costul de operare. Aici merita legata pagina de factura de curent si, in anumite scenarii, de panouri fotovoltaice. Pentru unii utilizatori, comparatia nu este doar intre doua surse de caldura, ci intre doua modele de cost si autonomie.\n\nNu exista un raspuns universal. Exista doar scenarii bine sau prost construite. Cu cat ipotezele sunt mai aproape de casa reala, cu atat decizia finala va fi mai buna.\n\nConcluzia practica este ca alegerea corecta incepe din necesar si cost, nu din marketing sau preferinta pentru o tehnologie.",
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
    title: "Cand merita o baterie fotovoltaica si cand doar creste costul fara sa aduca suficienta valoare",
    excerpt: "Bateria este utila in anumite scenarii, dar nu trebuie tratata ca upgrade automat al oricarui sistem fotovoltaic.",
    content: "Bateria fotovoltaica este una dintre cele mai atractive piese din ecosistemul solar pentru ca promite autonomie si backup. Problema este ca nu orice casa si nu orice profil de consum o justifica economic.\n\nCalculatorul de baterie fotovoltaica este util pentru ca transforma ideea generala de backup intr-o capacitate concreta. Asta te ajuta sa vezi rapid daca vorbesti de un plus rezonabil sau de un buget care schimba complet proiectul.\n\nPagina trebuie citita impreuna cu productia fotovoltaica si cu amortizarea. Daca sistemul produce bine, dar consumul nu este sincronizat sau backup-ul real necesar este mic, bateria poate adauga cost fara sa aduca suficienta valoare.\n\nPe de alta parte, pentru unii utilizatori backup-ul inseamna continuitate si liniste, nu doar economie. De aceea merita separata decizia economica de decizia functionala.\n\nConcluzia practica este ca bateria merita cand raspunde unei nevoi reale de autoconsum sau backup. In rest, poate doar sa prelungeasca amortizarea intregului sistem.",
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
    title: "Cat consuma un frigider in realitate si cum citesti corect eticheta",
    excerpt: "Frigiderul merge permanent, dar consumul real nu se citește doar dintr-un singur numar de pe eticheta.",
    content: "Frigiderul este unul dintre putinii consumatori care lucreaza practic in fiecare zi a anului. Tocmai de aceea merita tratat separat atunci cand vrei sa intelegi factura de curent. Problema este ca multi utilizatori fie il subestimeaza, fie trag concluzii prea rapide doar din eticheta energetica.\n\nCalculatorul de consum frigider te ajuta sa pornesti de la un consum zilnic mediu si sa-l transformi in cost lunar si anual. Asta este mult mai util pentru buget decat o valoare abstracta pe care nu o legi de pretul real al energiei.\n\nEticheta este utila, dar nu suficienta. Temperatura din bucatarie, cat de des se deschide usa, incarcarea frigiderului si vechimea aparatului pot muta destul de mult consumul fata de scenariul ideal.\n\nPagina trebuie legata de factura de curent si de calculatorul generic de aparat electric. Asa utilizatorul poate vedea daca frigiderul este doar un cost de baza rezonabil sau unul dintre factorii care merita reevaluati.\n\nConcluzia practica este ca frigiderul nu este un cost spectaculos de moment, ci un consum permanent care merita citit corect in timp.",
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
    title: "Cat consuma un boiler electric si cand devine o problema reala in factura",
    excerpt: "Apa calda pare un cost inevitabil, dar boilerul poate conta mult mai mult decat te astepti in consumul lunar.",
    content: "Boilerul electric este unul dintre acei consumatori care trec usor neobservati pentru ca sunt asociati cu confortul de baza al casei. Totusi, cand vrei sa intelegi factura, apa calda merita tratata separat.\n\nCalculatorul de consum pentru boiler leaga energia de volumul de apa, diferenta de temperatura si frecventa de utilizare. Asta este important pentru ca aici formula spune mai mult decat simpla putere a aparatului.\n\nIn multe case, problema nu este doar boilerul in sine, ci combinatia dintre temperatura setata, izolarea vasului, numarul de cicluri si obiceiurile de consum. Tocmai de aceea un scenariu realist este mai util decat o presupunere rapida.\n\nPagina trebuie legata de factura lunara si de calculatorul generic de aparat electric. Asa utilizatorul poate vedea rapid daca boilerul este doar un cost firesc sau unul care merita optimizat.\n\nConcluzia practica este ca boilerul poate fi un consumator surprinzator de mare atunci cand este folosit intens si setat prea sus fata de nevoia reala.",
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
    title: "Cat consuma aerul conditionat pe zi si pe luna fara sa confundam BTU-ul cu costul",
    excerpt: "BTU-ul explica racirea, dar factura apare din puterea absorbita si din timpul real de functionare.",
    content: "Cand oamenii cauta informatii despre aer conditionat, de multe ori amesteca doua intrebari diferite: de cat BTU au nevoie si cat ii va costa sa foloseasca aparatul. Ambele sunt importante, dar raspunsul vine din calcule diferite.\n\nCalculatorul de consum pentru aer conditionat porneste din puterea absorbita si din durata de folosire. Asta il face foarte bun pentru buget. Calculatorul BTU, in schimb, te ajuta sa alegi capacitatea potrivita pentru camera.\n\nCele doua pagini trebuie legate intre ele pentru ca o alegere buna de capacitate poate influenta si costul final. Un aparat prost dimensionat poate merge mai mult, mai ineficient sau mai inconfortabil decat unul ales corect.\n\nConcluzia practica este ca BTU-ul spune ce aparat iti trebuie, iar consumul iti spune cat te costa sa-l folosesti. Abia impreuna duc la o decizie buna.",
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
    title: "Cum calculezi economia reala din becuri LED fara sa supraestimezi beneficiul",
    excerpt: "LED-urile economisesc aproape mereu, dar ritmul real al economiei depinde de cat de mult folosesti lumina.",
    content: "Schimbarea becurilor clasice cu LED este unul dintre cele mai simple upgrade-uri energetice dintr-o casa. Tocmai de aceea este si foarte usor sa devii prea optimist in calcule.\n\nCalculatorul de economie LED leaga puterea veche, puterea noua, numarul de becuri si timpul real de utilizare. Asta este exact ce trebuie ca sa transformi promisiunea generala de economie intr-o suma reala.\n\nDaca folosesti lumina putin, recuperarea dureaza mai mult. Daca ai multe becuri sau zone iluminate des, efectul se vede repede. De aceea pagina este mai utila cand este legata de factura de curent si de alte surse de consum din casa.\n\nConcluzia practica este ca LED-ul este de obicei o idee buna, dar meritul lui real se vede cand il pui intr-un scenariu concret de utilizare, nu intr-o estimare vagă.",
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
    title: "Cata suprafata de acoperis iti trebuie pentru panouri fara sa supraestimezi spatiul util",
    excerpt: "Suprafata totala a acoperisului nu inseamna automat suprafata utila pentru panouri.",
    content: "Multi utilizatori pornesc de la ideea ca, daca au un acoperis mare, pot instala automat un sistem fotovoltaic mare. In practica, spatiul util este aproape mereu mai mic decat suprafata totala.\n\nCalculatorul de suprafata pentru panouri este util pentru ca transforma metrul patrat disponibil in numar de panouri si putere maxima instalabila. Asta te ajuta sa vezi rapid daca obiectivul de productie este realist sau nu.\n\nUmbrele, forma acoperisului, distantele de siguranta si zonele greu utilizabile pot reduce destul de mult spatiul efectiv. De aceea merita sa folosesti rezultatul ca reper, nu ca proiect final.\n\nConcluzia practica este ca intrebarea buna nu este doar cat acoperis ai, ci cat acoperis util ai pentru sistemul dorit.",
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
    title: "Cum alegi corect puterea invertorului fotovoltaic fara sa o tratezi ca pe o simpla formalitate",
    excerpt: "Invertorul nu este doar o piesa din oferta. Dimensiunea lui influenteaza echilibrul intregului sistem.",
    content: "Cand oamenii se gandesc la un sistem fotovoltaic, discutia merge repede spre panouri si productie. Invertorul pare uneori doar o bifă tehnica. In realitate, el este o piesa centrala in echilibrul sistemului.\n\nCalculatorul de putere pentru invertor fotovoltaic te ajuta sa pornesti din puterea DC a sistemului si din raportul DC/AC. Asta nu iti da proiectul final, dar iti ofera un reper foarte bun pentru comparatii si pentru discutii mai bine informate.\n\nUn invertor ales prost poate limita inutil sistemul sau poate crea un proiect ineficient economic. Tocmai de aceea pagina trebuie legata de necesarul sistemului si de productia estimata.\n\nConcluzia practica este ca invertorul nu se alege la final, doar din oferta cea mai convenabila. Se alege ca parte din logica intregului sistem.",
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
    title: "Autoconsum vs injectare: ce conteaza cu adevarat la un sistem fotovoltaic",
    excerpt: "Productia mare nu spune singura povestea. Conteaza si cat folosesti direct din ea, nu doar cat produci.",
    content: "Una dintre cele mai importante diferente in zona fotovoltaica este cea dintre productie si autoconsum. Multi utilizatori se concentreaza doar pe kWh produsi, dar economia reala vine puternic si din cat folosesti direct in casa.\n\nCalculatorul de autoconsum fotovoltaic este util pentru ca separa energia folosita direct de energia injectata. Asta muta discutia din zona de entuziasm generic in zona de comportament real de consum.\n\nPentru unii utilizatori, un sistem care produce bine, dar are autoconsum slab, nu este neaparat la fel de interesant economic precum pare la prima vedere. Tocmai de aceea merita legat si de baterie, si de amortizare.\n\nConcluzia practica este ca productia spune cat poti avea, dar autoconsumul spune cat folosesti cu adevarat in avantajul tau direct.",
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
    title: "Cum estimezi backup-ul pentru UPS sau baterie fara sa te bazezi pe autonomie imaginara",
    excerpt: "Autonomia reala depinde de sarcina, eficienta si energia disponibila, nu doar de numarul mare de Ah din specificatii.",
    content: "Backup-ul energetic pare simplu pe hartie: ai o baterie si ai autonomie. In practica, autonomia reala poate fi mult diferita fata de ce isi imagineaza utilizatorul.\n\nCalculatorul de autonomie UPS te ajuta sa pornesti din tensiune, capacitate, sarcina si eficienta. Asta este exact ce lipsește in cele mai multe estimari intuitive.\n\nMarea capcana este supraestimarea autonomiei. Cand nu iei in calcul eficienta si adancimea de descarcare, rezultatul pare aproape mereu mai bun decat realitatea. Tocmai de aceea pagina merita legata de bateria fotovoltaica si de consumul aparatelor.\n\nConcluzia practica este ca backup-ul bun nu se masoara doar in Ah, ci in energia care chiar ajunge la sarcina de care iti pasa.",
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
    title: "Cum compari costul de incalzire intre gaz si pompa de caldura fara sa sari peste ipoteze",
    excerpt: "Comparatia buna cere acelasi necesar termic, tarife coerente si ipoteze apropiate de casa reala.",
    content: "Cand compari gazul cu pompa de caldura, tentatia este sa iei doua cifre de cost si sa alegi varianta mai mica. In practica, comparatia buna incepe mult mai devreme: la necesarul termic al casei.\n\nCalculatorul de comparatie a costului de incalzire este util pentru ca raporteaza aceeasi nevoie de caldura la doua tehnologii diferite. Asta ofera un teren mult mai corect pentru decizie.\n\nDaca nu stii ce nevoie de caldura ai, orice comparatie de cost ramane fragila. De aceea pagina trebuie legata de necesarul termic si de dimensionarea pompei de caldura.\n\nConcluzia practica este ca alegerea intre gaz si pompa de caldura nu se face din simpatie pentru tehnologie, ci din nevoia reala a casei si din costul corect comparat.",
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
    title: "Cat CO2 poti evita cu un sistem fotovoltaic si cum citesti corect aceasta estimare",
    excerpt: "Impactul de mediu conteaza, dar trebuie citit ca estimare bazata pe productie si factorul de emisii folosit.",
    content: "Pentru unii utilizatori, investitia intr-un sistem fotovoltaic nu este doar despre economie, ci si despre impact. De aici apare natural intrebarea despre cat CO2 poate fi evitat.\n\nCalculatorul de economie CO2 pentru panouri fotovoltaice este util pentru ca transforma productia anuala intr-o estimare simplificata de impact. Asta adauga o lentila diferita fata de amortizare si cost.\n\nTotusi, factorul de emisii folosit este o ipoteza. El poate varia in functie de mixul energetic si metodologia de calcul. De aceea merita sa citesti rezultatul ca reper comparativ, nu ca adevar absolut.\n\nConcluzia practica este ca impactul de mediu poate completa foarte bine discutia despre investitie, dar ar trebui sa stea langa productie si amortizare, nu in locul lor.",
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
    title: "Cum citesti pretul pe mp fara sa cazi in comparatii false intre proprietati",
    excerpt:
      "Pretul pe mp este util, dar numai daca il citesti pe aceeasi baza: suprafata, stare si configuratie comparabila.",
    content:
      "Pretul pe metru patrat este unul dintre cele mai folosite repere din imobiliare pentru ca simplifica foarte repede comparatia. Problema apare atunci cand doua proprietati par comparabile doar pe hartie, dar folosesc suprafete diferite sau au configuratii care schimba complet lectura cifrei.\n\nCalculatorul de pret pe mp este util pentru ca te forteaza sa pui aceeasi formula peste mai multe variante. Asta te ajuta sa vezi mai repede daca un apartament pare ieftin sau scump raportat la suprafata utila reala.\n\nTotusi, un pret pe mp nu spune singur toata povestea. Compartimentarea, starea proprietatii, etajul, anul constructiei, pozitionarea si costurile ulterioare pot schimba radical concluzia. De aceea pagina merita folosita impreuna cu negocierea de pret si cu costul total de achizitie.\n\nConcluzia buna este simpla: pretul pe mp functioneaza ca filtru initial foarte bun, dar decizia reala apare abia cand il legi de restul scenariului.",
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
    title: "Ce intra de fapt in bugetul total de achizitie al unei locuinte",
    excerpt:
      "Pretul afisat nu este tot proiectul. Avansul, costurile de inchidere, renovarea si mobilarea schimba rapid bugetul real.",
    content:
      "Multi cumparatori pornesc de la pretul locuintei si cred ca acela este bugetul principal. In practica, achizitia reala inseamna si avans, costuri de inchidere, renovare, mobilare si o rezerva minima pentru surprizele care apar inevitabil.\n\nCalculatorul de cost total de achizitie este util pentru ca pune in aceeasi imagine pretul proprietatii si costurile pe care le simti imediat dupa tranzactie. Astfel vezi mult mai repede daca proiectul este sustenabil sau daca ai comprimat prea mult rezerva.\n\nAici se vede de ce avansul si costul total nu trebuie citite separat. Un avans suportabil nu inseamna automat si un proiect confortabil daca dupa semnare ramai fara spatiu pentru renovare, mobilare sau buffer de lichiditate.\n\nConcluzia practica este ca o achizitie buna nu este doar una pe care o poti semna, ci una pe care o poti absorbi financiar fara sa ramai blocat imediat dupa mutare.",
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
    title: "Chirie vs cumparare: cum compari corect doua scenarii care par simple doar la suprafata",
    excerpt:
      "Comparatia buna nu opune doar chiria unei rate. Trebuie sa adaugi costul initial, costurile recurente si flexibilitatea.",
    content:
      "Comparatia dintre chirie si cumparare este una dintre cele mai cautate pentru ca promite un raspuns simplu la o decizie grea. In realitate, rata lunara nu este singurul element care conteaza, iar chiria nu este singurul cost al flexibilitatii.\n\nCalculatorul de chirie vs cumparare este bun pentru ca aduce intr-un singur cadru costul initial al cumpararii si costul lunar al locuirii. Asta iti arata rapid daca scenariul de proprietate pare mai greu sau mai usor de sustinut pe perioada analizata.\n\nTotusi, comparatia devine utila doar daca pui alaturi costurile recurente, bufferul lunar si orizontul de timp. Pentru unii utilizatori, flexibilitatea chiriei valoreaza mai mult. Pentru altii, stabilitatea si capitalizarea prin proprietate conteaza mai tare.\n\nConcluzia practica este ca nu exista raspuns universal. Exista doar un scenariu pe care il citesti corect sau unul pe care il simplifici prea devreme.",
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
    title: "Cum estimezi un buget de renovare fara optimism periculos",
    excerpt:
      "Bugetul de renovare bun porneste din suprafata si cost/mp, dar devine realist abia dupa ce adaugi rezerva si fazele lucrarii.",
    content:
      "Bugetul de renovare pare simplu cat timp il reduci la o suma intuitiva pe care ai vrea sa o cheltui. In practica, formula buna porneste din suprafata, costul pe mp si o rezerva care sa absoarba diferentele dintre estimare si santier.\n\nCalculatorul de buget renovare este util tocmai pentru ca scoate discutia din zona de impresie si o duce intr-o estimare repetabila. Cand schimbi costul pe mp sau rezerva, vezi imediat cat se misca bugetul total.\n\nPartea importanta este sa nu tratezi costul pe mp ca pe o promisiune rigida. Finisajele, instalatiile, demolarile si ritmul executiei schimba foarte repede cifra. De aceea pagina merita legata de costul total de achizitie si de bugetul de mobilare.\n\nConcluzia practica este ca renovarea buna se planifica cu marja, nu cu speranta ca totul va iesi exact cum ai pus in prima schita.",
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
    title: "Cum planifici bugetul de mobilare si electrocasnice fara sa iti manance toata rezerva",
    excerpt:
      "Mobilarea pare ultimul pas, dar poate consuma rapid un buget serios daca nu o separi clar de renovare si de costurile initiale.",
    content:
      "Dupa achizitie si renovare, multi utilizatori trateaza mobilarea ca pe un detaliu care se va rezolva cumva din mers. In realitate, exact aici se sparg multe bugete care pareau suportabile pe hartie.\n\nCalculatorul de buget mobilare este util pentru ca transforma numarul de camere, electrocasnicele si o marja de rezerva intr-o suma clara. Asta te ajuta sa intelegi daca proiectul tau este complet finantat sau doar partial imaginat.\n\nPartea bună a unui astfel de calcul nu este doar cifra finala, ci faptul ca separa clar mobilarea de renovare. Fara aceasta separare, costul total al locuintei pare artificial mai mic, iar bufferul ramas pare mai confortabil decat este in realitate.\n\nConcluzia practica este ca mobilarea merita tratata ca proiect separat in aceeasi decizie financiara, nu ca un cost vag care se va regla ulterior.",
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
    title: "Cat iti mananca locuinta din bugetul lunar si de ce rata singura nu spune destul",
    excerpt:
      "Bugetul lunar al locuintei inseamna mai mult decat rata sau chiria. Utilitatile, administrarea si mentenanta schimba imaginea reala.",
    content:
      "Cea mai comuna eroare in compararea unei locuinte este sa folosesti doar rata sau chiria lunara ca reper principal. In practica, presiunea reala pe buget vine din totalul costurilor recurente, nu dintr-o singura linie a calculului.\n\nCalculatorul de buget lunar al locuintei este util pentru ca aduna intr-un singur loc costul principal, utilitatile, administrarea, mentenanta si asigurarea. Asta iti arata mai repede ce trebuie sa sustii luna de luna, nu doar ce suna suportabil in anunt sau in discutia cu banca.\n\nAici intervine si calculatorul de buffer. O locuinta nu este doar despre ce poti plati, ci despre ce iti ramane dupa ce ai platit-o. Daca spatiul ramas este prea mic, scenariul devine fragil chiar daca formula initiala parea acceptabila.\n\nConcluzia practica este ca locuinta trebuie citita in buget ca sistem complet, nu ca un cost singular care arata bine separat de restul cheltuielilor.",
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
    title: "Cand negocierea pretului schimba cu adevarat afacerea si cand doar pare importanta",
    excerpt:
      "Un discount mic poate conta enorm sau aproape deloc, in functie de bugetul total si de costurile care vin imediat dupa achizitie.",
    content:
      "Negocierea de pret are un farmec aparte pentru ca este una dintre putinele zone in care utilizatorul simte ca poate schimba imediat cifra mare din tranzactie. Totusi, impactul real al negocierii nu este intotdeauna evident.\n\nCalculatorul de negociere te ajuta sa vezi rapid cat inseamna in lei un discount aparent mic. Asta este deja valoros, pentru ca muta discutia din procente abstracte in economie concreta.\n\nMai departe, conteaza sa pui economia langa costul total de achizitie. Uneori o reducere buna acopera costuri de inchidere sau parte din renovare. Alteori, desi suna bine, nu schimba cu adevarat presiunea bugetara a proiectului.\n\nConcluzia practica este ca negocierea buna nu este doar cea mai mare, ci cea care muta semnificativ structura reala a bugetului tau.",
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
    title: "Cat spatiu iti trebuie de fapt in functie de familie si folosinta locuintei",
    excerpt:
      "Suprafata buna nu se citește doar in mp. Conteaza si numarul de persoane, camerele si felul in care folosesti casa zi de zi.",
    content:
      "Cand compari doua proprietati, reflexul natural este sa te uiti la numarul de metri patrati. Problema este ca mp-ii singuri nu spun cat de bine functioneaza spatiul pentru familia sau folosinta ta reala.\n\nCalculatorul de spatiu pe persoana este util pentru ca transforma suprafata si camerele intr-un reper mai practic. Asta te ajuta sa compari mai coerent doua variante care au configuratii diferite, dar par apropiate la prima vedere.\n\nPentru unele gospodarii, flexibilitatea unei camere in plus valoreaza mai mult decat cativa mp in plus. Pentru altele, zona de zi sau spatiul de lucru de acasa schimba mai mult utilitatea decat numarul formal de camere.\n\nConcluzia practica este ca spatiul bun nu este doar cel mai mare, ci cel care raspunde cel mai bine ritmului tau real de locuire.",
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
    title: "Cum citesti randamentul din chirie fara sa ignori costurile ascunse",
    excerpt:
      "Randamentul brut arata repede, dar randamentul net spune mult mai bine ce ramane dupa costurile reale ale proprietatii.",
    content:
      "Randamentul din chirie este unul dintre cele mai folosite repere in investitiile imobiliare pentru ca iti promite o comparatie simpla intre pretul proprietatii si venitul anual. Problema este ca randamentul brut spune doar prima jumatate a povestii.\n\nCalculatorul de randament chirie este util tocmai pentru ca separa randamentul brut de cel net. Astfel vezi imediat ce ramane dupa costurile recurente pe care multe analize rapide le trec prea usor cu vederea.\n\nAdministrarea, mentenanta, perioadele de neocupare si alte costuri aparent mici pot muta semnificativ concluzia finala. De aceea randamentul bun se citeste doar impreuna cu costurile recurente si cu ipoteza de ocupare.\n\nConcluzia practica este ca o proprietate interesanta nu este cea cu randament brut spectaculos pe hartie, ci cea al carei randament net ramane coerent dupa ce adaugi frictiunea reala a exploatarii.",
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
    title: "Cash-on-cash return explicat pentru investitii imobiliare fara jargon inutil",
    excerpt:
      "Acest indicator arata ce randament obtii pe banii proprii blocati in proiect, nu pe valoarea totala a proprietatii.",
    content:
      "Cash-on-cash return este util tocmai pentru ca muta atentia de la pretul total al proprietatii la capitalul propriu pe care il blochezi efectiv. Pentru investitorii care folosesc credit sau combina mai multe surse de bani, acesta poate fi un reper mult mai clar decat randamentul clasic din chirie.\n\nCalculatorul este valoros fiindca pune fata in fata fluxul net anual si capitalul propriu investit. Asta te ajuta sa vezi daca proiectul este bun pentru lichiditatea ta, nu doar pentru o analiza abstracta de randament.\n\nTotusi, indicatorul devine periculos daca nu separi corect fluxul net de costurile reale sau daca subestimezi capitalul propriu investit in avans, renovare si costuri initiale. De aceea merita citit impreuna cu bugetul total de achizitie si cu randamentul din chirie.\n\nConcluzia practica este ca acest indicator nu inlocuieste randamentul net, ci il completeaza foarte bine atunci cand decizia depinde de cati bani proprii ai blocati in proiect.",
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
    title: "Cum estimezi pierderile din vacanta la o proprietate de inchiriat fara sa iti sabotezi singur analiza",
    excerpt:
      "O proprietate raraori este ocupata perfect. Rata de neocupare conteaza direct in venitul real si in pragul de break-even.",
    content:
      "Una dintre cele mai optimiste ipoteze din analizele imobiliare este ocuparea perfecta. In practica, orice proprietate de inchiriat are perioade mai bune si mai slabe, iar aceste goluri mananca direct din venitul real.\n\nCalculatorul de pierdere din vacanta este util pentru ca transforma procentul de neocupare intr-o suma anuala usor de inteles. Asta iti arata repede cat de sensibil devine randamentul atunci cand lasi mai mult spatiu intre chiriasi sau cand piata merge mai lent.\n\nAici merita legata imediat si rata de ocupare break-even. Daca pragul minim de ocupare este deja ridicat, orice vacanta mai lunga poate transforma un proiect aparent bun intr-unul fragil.\n\nConcluzia practica este ca analiza prudenta porneste dintr-o neocupare realista, nu din scenariul ideal in care proprietatea produce venit maxim in fiecare luna.",
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
    title: "Cum proiectezi cresterea chiriei fara sa fortezi ipotezele doar ca sa iasa randamentul mai bine",
    excerpt:
      "Cresterea chiriei poate imbunatati scenariul, dar doar daca ipoteza ramane credibila pentru piata reala si pentru proprietate.",
    content:
      "Proiectarea unei cresteri de chirie este tentanta pentru ca face aproape orice scenariu sa arate mai bine. Problema este ca o crestere prea optimista poate cosmetiza un proiect mediocru si il poate face sa para mai bun decat este.\n\nCalculatorul de crestere chirie este util pentru ca arata clar ce inseamna o anumita rata anuala in termeni de chirie lunara viitoare. Asta te ajuta sa vezi cat din scenariu vine din ipoteza de crestere si cat vine din structura actuala a proprietatii.\n\nDe aceea merita sa folosesti atat un scenariu prudent, cat si unul optimist. Daca proiectul functioneaza doar in varianta optimista, semnalul nu este unul bun. Daca ramane coerent si in scenariul prudent, analiza devine mult mai sanatoasa.\n\nConcluzia practica este ca o proiectie buna nu este cea mai frumoasa, ci cea care rezista si dupa ce scazi optimismul din ea.",
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
    title: "Ce marja ramane intr-un flip imobiliar dupa costurile reale, nu dupa entuziasmul initial",
    excerpt:
      "La flip, profitul nu este doar diferenta dintre cumparare si vanzare. Renovarea, detinerea si frictiunile din executie pot muta rapid marja.",
    content:
      "Un flip imobiliar pare atragator atunci cand iei doar diferenta dintre pretul de cumparare si pretul posibil de vanzare. In practica, tocmai costurile intermediare sunt cele care decid daca proiectul mai ramane interesant sau nu.\n\nCalculatorul de marja pentru flip este util pentru ca aduna pretul de achizitie, renovarea si costurile de detinere in acelasi loc. Asta face mult mai greu sa te amagesti cu o marja artificial inflata.\n\nMai ales aici conteaza rezerva si disciplina de buget. O renovare subestimata sau o iesire mai lenta din proiect poate consuma repede profitul aparent confortabil de la inceput. De aceea pagina trebuie legata natural de bugetul de renovare si de costurile de inchidere.\n\nConcluzia practica este ca flip-ul bun nu este cel cu cea mai mare promisiune pe hartie, ci cel care rezista dupa ce adaugi costurile reale si o marja prudenta de eroare.",
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
    title: "Cat te costa administrarea unei proprietati inchiriate si cum o legi de randamentul real",
    excerpt:
      "Administrarea pare un cost mic pana cand incepi sa o vezi anual si sa o pui langa randamentul net al proprietatii.",
    content:
      "Administrarea proprietatii este unul dintre acele costuri care par suportabile cand le privesti izolat pe luna. In analiza completa, tocmai costurile recurente mai mici sunt cele care subtiaza vizibil randamentul net.\n\nCalculatorul de cost administrare proprietate este util pentru ca pune intr-o singura cifra comisionul variabil si costurile fixe lunare. Asta iti arata rapid cat platesti ca sa pastrezi proprietatea functionala in exploatare.\n\nCand legi acest cost de randamentul din chirie si de costurile recurente totale, vezi mult mai clar cat de realist este proiectul. Uneori randamentul brut pare bun, dar dupa administrare, reparatii si perioade de neocupare, concluzia se schimba mult.\n\nConcluzia practica este ca administrarea nu trebuie privita ca detaliu operational, ci ca parte reala din randamentul si efortul proiectului.",
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
    title: "Cum citesti ponderea costurilor de inchidere intr-o achizitie si de ce conteaza mai mult decat pare",
    excerpt:
      "Costurile de inchidere par secundare pana cand le pui in procente din proprietate si vezi ce parte din lichiditate consuma imediat.",
    content:
      "Costurile de inchidere sunt deseori tratate ca o anexa inevitabila a achizitiei, nu ca o parte reala a deciziei. Tocmai de aceea multi cumparatori raman surprinsi cand vad cat capital initial consuma imediat.\n\nCalculatorul de pondere a costurilor de inchidere este util pentru ca traduce aceste sume intr-un procent din pretul proprietatii. Asta iti permite sa compari mai bine scenarii diferite si sa vezi daca presiunea initiala asupra lichiditatii este inca suportabila.\n\nPunctul important este ca aceste costuri trebuie citite impreuna cu avansul si cu bugetul total de achizitie. Separat, fiecare pare gestionabil. Impreuna, pot muta semnificativ confortul financiar al proiectului.\n\nConcluzia practica este ca lichiditatea de la inceput trebuie protejata la fel de atent ca rata lunara de dupa semnare.",
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
    title: "Inchiriere integrala vs pe camera: cum compari venitul fara sa confunzi scenariile",
    excerpt:
      "Comparatia buna nu sta doar in chiria maxima posibila, ci si in ocupare, administrare si stabilitatea exploatarii.",
    content:
      "Inchirierea pe camera pare adesea mai profitabila pe hartie, pentru ca insumeaza mai multa chirie potentiala decat inchirierea integrala. In practica, scenariul devine mai complex tocmai pentru ca managementul, ocuparea si uzura pot schimba mult rezultatul.\n\nCalculatorul de venit din inchiriere pe camera este util pentru ca pune intr-o formula simpla numarul de camere, chiria per camera si gradul de ocupare. Asta iti ofera un punct de pornire bun pentru comparatie.\n\nTotusi, comparatia buna cere sa vezi si vacanta probabila, costul administrarii si efortul operational. De aceea merita sa legi imediat acest calcul de randamentul din chirie si de pierderea din neocupare.\n\nConcluzia practica este ca scenariul mai profitabil nu este neaparat cel cu venitul brut mai mare, ci cel care ramane coerent dupa ce adaugi frictiunea reala a exploatarii.",
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

const buildCalculatorSeoBody = (
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
    ? ` Daca vrei sa mergi mai departe, continua si cu ${toSentenceList(relatedCalculatorTitles)}.`
    : "";
  const relatedArticlesSentence = relatedArticleTitles.length
    ? ` Pentru intentii mai documentate, merita citite si ${toSentenceList(relatedArticleTitles)}.`
    : "";

  return [
    `${definition.title} este construit pentru situatiile in care vrei un raspuns rapid, dar si suficient context ca sa nu ramai doar cu o cifra afisata pe ecran. Formula folosita aici este ${definition.formulaName}, iar pagina explica pe scurt de unde vine rezultatul si in ce scenarii este util. In practica, acest tip de calcul apare ${categoryFrame.audience}, motiv pentru care am pastrat pagina simpla la nivel de UX, dar mai bogata in continut editorial.`,
    `Ca sa obtii un rezultat relevant, merita sa verifici unitatile introduse, sa completezi campurile cu valori realiste si sa refaci scenariul ori de cate ori datele se schimba. ${meta.example} Dupa calcul, interpretarea rezultatului conteaza la fel de mult ca formula in sine: ${meta.interpretationNotes} Tocmai de aceea pagina include exemple, intrebari frecvente si explicatii care reduc riscul de interpretare prea rapida sau prea simplista.`,
    `${categoryFrame.caution} ${categoryFrame.linkingLead}${relatedToolsSentence}${relatedArticlesSentence} In felul acesta, pagina nu functioneaza doar ca un tool izolat, ci ca o parte dintr-un hub SEO in care utilizatorul poate aprofunda usor subiectul si poate ajunge la alte raspunsuri complementare.`,
  ].join("\n\n");
};

const buildCalculatorBlocks = (
  definition: ReturnType<typeof getCalculatorDefinition>,
  meta: CalculatorMeta
) => {
  const categoryName =
    categorySeeds.find((seed) => seed.slug === definition.categorySlug)?.name ??
    definition.categorySlug.replace(/-/g, " ");
  const calculatorLinks = (meta.relatedCalculatorKeys ?? []).map((relatedKey) => {
    const relatedDefinition = getCalculatorDefinition(relatedKey);

    return {
      label: relatedDefinition.title,
      href: `/calculatoare/${relatedDefinition.categorySlug}/${relatedDefinition.slug}`,
      description: `Completeaza analiza cu ${relatedDefinition.title.toLowerCase()} si mergi mai departe pe aceeasi intentie de cautare.`,
    };
  });

  const articleLinks = (meta.relatedArticleSlugs ?? []).map((slug) => {
    const article = articleSeeds.find((entry) => entry.slug === slug);

    return {
      label: article?.title ?? slug.replace(/-/g, " "),
      href: `/blog/${slug}`,
      description:
        article?.excerpt ??
        "Articol explicativ pentru utilizatorii care vor mai mult context decat formula de baza.",
    };
  });

  const linkItems = [
    ...calculatorLinks,
    ...articleLinks,
    {
      label: `Toate calculatoarele din ${categoryName}`,
      href: `/calculatoare/${definition.categorySlug}`,
      description:
        "Hub-ul de categorie grupeaza tool-uri apropiate semantic si intareste linking-ul intern din acelasi cluster.",
    },
    {
      label: "Vezi toate calculatoarele",
      href: "/calculatoare",
      description:
        "Indexul general este util pentru navigare, descoperire si distribuirea autoritatii interne spre paginile importante.",
    },
  ].slice(0, 6);

  const blocks: Array<Record<string, unknown>> = [
    {
      blockType: "story",
      eyebrow: "Context util",
      title: `Cum folosesti ${definition.title.toLowerCase()} fara sa ramai doar la cifra finala`,
      body: `${definition.formulaDescription} Scopul paginii este sa ofere un raspuns rapid, dar si context practic pentru urmatorul pas: comparatie, estimare, decizie sau verificare.`,
      tone: "mist",
    },
    {
      blockType: "facts",
      eyebrow: "Dintr-o privire",
      title: "Ce merita sa urmaresti pe aceasta pagina",
      intro:
        "Formula rezolva calculul instant, dar valoarea SEO vine din claritate, exemple si din legaturile spre alte pagini relevante.",
      tone: "sand",
      items: [
        {
          value: String(definition.inputs.length),
          label: "campuri de intrare",
          detail:
            "Campurile sunt gandite sa fie usor de completat pe mobil si desktop, fara pasi inutili.",
        },
        {
          value: String(definition.outputs.length),
          label: "rezultate afisate",
          detail:
            "Rezultatul principal este insotit de unitati clare si de explicatii pentru interpretare.",
        },
        {
          value: definition.categorySlug,
          label: "cluster tematic",
          detail:
            "Pagina este ancorata intr-o categorie care ajuta la linking intern si la dezvoltarea content hub-ului.",
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
      eyebrow: "Internal linking",
      title: "Continua natural spre pagini utile din acelasi hub",
      intro:
        "Linkurile de mai jos sunt alese ca extensii firesti ale intentiei de cautare, nu doar ca recomandari generice.",
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
    title: `Hub-ul ${seed.name.toLowerCase()} trebuie sa combine raspunsul rapid cu contextul util.`,
    body: `${seed.introContent} Internal linking-ul dintre calculatoare si articole este parte din produs, nu un artificiu de final.`,
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
      seoBody: buildCalculatorSeoBody(definition, meta),
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
      contentBlocks: buildCalculatorBlocks(definition, meta),
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




