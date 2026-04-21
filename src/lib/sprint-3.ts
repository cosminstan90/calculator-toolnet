export const SPRINT_3_PRIORITY_CLUSTERS = [
  "credite-si-economii",
  "energie-pentru-casa",
  "imobiliare",
] as const;

export const SPRINT_3_TIER_2_TARGETS = {
  "credite-si-economii": [
    "calculator-grad-de-indatorare",
    "calculator-fond-de-urgenta",
    "cum-iti-construiesti-fondul-de-urgenta-fara-sa-ramai-fara-lichiditati",
  ],
  "energie-pentru-casa": [
    "cate-panouri-fotovoltaice-iti-trebuie-de-fapt",
    "calculator-productie-fotovoltaica",
    "centrala-vs-pompa-de-caldura-cum-compari-corect-costurile",
  ],
  imobiliare: [
    "calculator-randament-chirie",
    "cum-citesti-randamentul-din-chirie-fara-sa-ignori-costurile-ascunse",
    "calculator-buget-renovare",
  ],
} as const;

export const SPRINT_3_CONTENT_RULES = [
  "answer-first cu exemplu concret in primele paragrafe",
  "minim un calculator principal si unul complementar in related links",
  "FAQ util doar unde aduce claritate reala",
  "bloc de interpretare si next step pe fiecare pagina noua",
] as const;
