export const LAUNCH_PLAN_TIMEZONE = "Europe/Bucharest";
export const LAUNCH_PLAN_OFFSET = "+03:00";

export const LAUNCH_PLAN_DAYS = [
  {
    date: "2026-04-06",
    morning: {
      articleSlug: "cum-citesti-costul-total-al-unui-credit",
      calculatorKey: "loan-total-cost",
    },
    evening: {
      calculatorKey: "credit-affordability",
    },
  },
  {
    date: "2026-04-07",
    morning: {
      articleSlug: "cum-citesti-factura-de-curent-fara-sa-te-pierzi-in-detalii-inutile",
      calculatorKey: "monthly-electricity-bill",
    },
    evening: {
      calculatorKey: "appliance-electricity-cost",
    },
  },
  {
    date: "2026-04-08",
    morning: {
      articleSlug: "ce-intra-de-fapt-in-bugetul-total-de-achizitie-al-unei-locuinte",
      calculatorKey: "property-total-purchase-cost",
    },
    evening: {
      calculatorKey: "price-per-sqm",
    },
  },
  {
    date: "2026-04-09",
    morning: {
      articleSlug: "cand-merita-refinantarea-si-cand-doar-pare-o-idee-buna",
      calculatorKey: "refinance-savings",
    },
    evening: {
      calculatorKey: "debt-to-income",
    },
  },
  {
    date: "2026-04-10",
    morning: {
      articleSlug: "cum-citesti-amortizarea-unui-sistem-fotovoltaic",
      calculatorKey: "solar-payback",
    },
    evening: {
      calculatorKey: "solar-system-size",
    },
  },
  {
    date: "2026-04-11",
    morning: {
      articleSlug: "chirie-vs-cumparare-cum-compari-corect-doua-scenarii",
      calculatorKey: "rent-vs-buy",
    },
    evening: {
      calculatorKey: "monthly-home-budget",
    },
  },
  {
    date: "2026-04-12",
    morning: {
      articleSlug: "cum-iti-construiesti-fondul-de-urgenta-fara-sa-ramai-fara-lichiditati",
      calculatorKey: "emergency-fund",
    },
    evening: {
      calculatorKey: "goal-timeline",
    },
  },
  {
    date: "2026-04-13",
    morning: {
      articleSlug: "cate-panouri-fotovoltaice-iti-trebuie-de-fapt",
      calculatorKey: "solar-panel-count",
    },
    evening: {
      calculatorKey: "solar-production",
    },
  },
  {
    date: "2026-04-14",
    morning: {
      articleSlug: "cum-citesti-randamentul-din-chirie-fara-sa-ignori-costurile-ascunse",
      calculatorKey: "rental-yield",
    },
    evening: {
      calculatorKey: "vacancy-loss",
    },
  },
  {
    date: "2026-04-15",
    morning: {
      articleSlug: "cum-afli-ce-rata-iti-permiti-fara-sa-iti-blochezi-bugetul",
      calculatorKey: "down-payment",
    },
    evening: {
      calculatorKey: "lease-vs-loan",
    },
  },
  {
    date: "2026-04-16",
    morning: {
      articleSlug: "cum-estimezi-productia-fotovoltaica-fara-promisiuni-umflate",
      calculatorKey: "solar-battery-size",
    },
    evening: {
      calculatorKey: "heating-load",
    },
  },
  {
    date: "2026-04-17",
    morning: {
      articleSlug: "cum-estimezi-un-buget-de-renovare-fara-optimism-periculos",
      calculatorKey: "renovation-budget",
    },
    evening: {
      calculatorKey: "property-down-payment",
    },
  },
  {
    date: "2026-04-18",
    morning: {
      articleSlug: "cum-planifici-economii-pe-termen-lung-pentru-obiective-mari",
      calculatorKey: "savings-interest",
    },
    evening: {
      calculatorKey: "retirement-savings",
    },
  },
  {
    date: "2026-04-19",
    morning: {
      articleSlug: "centrala-vs-pompa-de-caldura-cum-compari-corect-costurile",
      calculatorKey: "heat-pump-size",
    },
    evening: {
      calculatorKey: "ac-btu",
    },
  },
];

export const getLaunchPlanEarliestAt = (date, slot) =>
  `${date}T${slot === "morning" ? "08:00:00" : "17:00:00"}${LAUNCH_PLAN_OFFSET}`;
