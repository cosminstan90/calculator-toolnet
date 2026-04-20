export const SPRINT_1_CLUSTERS = [
  "credite-si-economii",
  "energie-pentru-casa",
  "imobiliare",
] as const;

export type Sprint1ClusterSlug = (typeof SPRINT_1_CLUSTERS)[number];

export type LinkingExpectation = {
  slug: string;
  kind: "calculator" | "article";
  cluster: Sprint1ClusterSlug;
  expectedCategorySlug?: string;
  expectedCalculatorLinks?: string[];
  expectedArticleLinks?: string[];
};

export const SPRINT_1_LINKING_EXPECTATIONS: LinkingExpectation[] = [
  {
    slug: "calculator-cost-total-credit",
    kind: "calculator",
    cluster: "credite-si-economii",
    expectedCategorySlug: "credite-si-economii",
    expectedCalculatorLinks: ["calculator-rata-maxima-suportabila"],
    expectedArticleLinks: ["cum-citesti-costul-total-al-unui-credit"],
  },
  {
    slug: "calculator-rata-maxima-suportabila",
    kind: "calculator",
    cluster: "credite-si-economii",
    expectedCategorySlug: "credite-si-economii",
    expectedCalculatorLinks: ["calculator-grad-de-indatorare"],
  },
  {
    slug: "calculator-economie-refinantare",
    kind: "calculator",
    cluster: "credite-si-economii",
    expectedCategorySlug: "credite-si-economii",
    expectedArticleLinks: ["cand-merita-refinantarea-si-cand-doar-pare-o-idee-buna"],
  },
  {
    slug: "cum-citesti-costul-total-al-unui-credit",
    kind: "article",
    cluster: "credite-si-economii",
    expectedCategorySlug: "credite-si-economii",
    expectedCalculatorLinks: [
      "calculator-cost-total-credit",
      "calculator-rata-maxima-suportabila",
    ],
  },
  {
    slug: "cand-merita-refinantarea-si-cand-doar-pare-o-idee-buna",
    kind: "article",
    cluster: "credite-si-economii",
    expectedCategorySlug: "credite-si-economii",
    expectedCalculatorLinks: ["calculator-economie-refinantare"],
  },
  {
    slug: "calculator-factura-curent",
    kind: "calculator",
    cluster: "energie-pentru-casa",
    expectedCategorySlug: "energie-pentru-casa",
    expectedArticleLinks: ["cum-citesti-factura-de-curent-fara-sa-te-pierzi-in-detalii-inutile"],
  },
  {
    slug: "calculator-consum-aparat-electric",
    kind: "calculator",
    cluster: "energie-pentru-casa",
    expectedCategorySlug: "energie-pentru-casa",
    expectedCalculatorLinks: ["calculator-factura-curent"],
  },
  {
    slug: "calculator-necesar-sistem-fotovoltaic",
    kind: "calculator",
    cluster: "energie-pentru-casa",
    expectedCategorySlug: "energie-pentru-casa",
    expectedCalculatorLinks: ["calculator-productie-fotovoltaica"],
  },
  {
    slug: "calculator-amortizare-panouri-fotovoltaice",
    kind: "calculator",
    cluster: "energie-pentru-casa",
    expectedCategorySlug: "energie-pentru-casa",
    expectedArticleLinks: ["cum-citesti-amortizarea-unui-sistem-fotovoltaic"],
    expectedCalculatorLinks: ["calculator-productie-fotovoltaica"],
  },
  {
    slug: "cum-citesti-factura-de-curent-fara-sa-te-pierzi-in-detalii-inutile",
    kind: "article",
    cluster: "energie-pentru-casa",
    expectedCategorySlug: "energie-pentru-casa",
    expectedCalculatorLinks: [
      "calculator-factura-curent",
      "calculator-consum-aparat-electric",
    ],
  },
  {
    slug: "cum-citesti-amortizarea-unui-sistem-fotovoltaic",
    kind: "article",
    cluster: "energie-pentru-casa",
    expectedCategorySlug: "energie-pentru-casa",
    expectedCalculatorLinks: [
      "calculator-amortizare-panouri-fotovoltaice",
      "calculator-necesar-sistem-fotovoltaic",
    ],
  },
  {
    slug: "calculator-cost-total-achizitie-locuinta",
    kind: "calculator",
    cluster: "imobiliare",
    expectedCategorySlug: "imobiliare",
    expectedCalculatorLinks: ["calculator-buget-lunar-locuinta"],
    expectedArticleLinks: ["ce-intra-de-fapt-in-bugetul-total-de-achizitie-al-unei-locuinte"],
  },
  {
    slug: "calculator-pret-pe-mp",
    kind: "calculator",
    cluster: "imobiliare",
    expectedCategorySlug: "imobiliare",
  },
  {
    slug: "calculator-chirie-vs-cumparare",
    kind: "calculator",
    cluster: "imobiliare",
    expectedCategorySlug: "imobiliare",
    expectedArticleLinks: ["chirie-vs-cumparare-cum-compari-corect-doua-scenarii"],
  },
  {
    slug: "calculator-randament-chirie",
    kind: "calculator",
    cluster: "imobiliare",
    expectedCategorySlug: "imobiliare",
    expectedCalculatorLinks: ["calculator-costuri-recurente-proprietate"],
    expectedArticleLinks: ["cum-citesti-randamentul-din-chirie-fara-sa-ignori-costurile-ascunse"],
  },
  {
    slug: "ce-intra-de-fapt-in-bugetul-total-de-achizitie-al-unei-locuinte",
    kind: "article",
    cluster: "imobiliare",
    expectedCategorySlug: "imobiliare",
    expectedCalculatorLinks: [
      "calculator-cost-total-achizitie-locuinta",
      "calculator-pret-pe-mp",
    ],
  },
  {
    slug: "chirie-vs-cumparare-cum-compari-corect-doua-scenarii",
    kind: "article",
    cluster: "imobiliare",
    expectedCategorySlug: "imobiliare",
    expectedCalculatorLinks: ["calculator-chirie-vs-cumparare"],
  },
  {
    slug: "cum-citesti-randamentul-din-chirie-fara-sa-ignori-costurile-ascunse",
    kind: "article",
    cluster: "imobiliare",
    expectedCategorySlug: "imobiliare",
    expectedCalculatorLinks: [
      "calculator-randament-chirie",
      "calculator-costuri-recurente-proprietate",
    ],
  },
];
