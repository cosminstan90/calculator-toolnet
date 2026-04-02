export type EditorialChecklistMode = "calculator" | "article";

export type EditorialChecklist = {
  strategyValidated?: boolean;
  coreContentReady?: boolean;
  examplesReady?: boolean;
  faqReady?: boolean;
  seoReady?: boolean;
  internalLinksReady?: boolean;
  schemaValidated?: boolean;
  finalReviewDone?: boolean;
  publishReady?: boolean;
};

export const EDITORIAL_CHECKLIST_KEYS = [
  "strategyValidated",
  "coreContentReady",
  "examplesReady",
  "faqReady",
  "seoReady",
  "internalLinksReady",
  "schemaValidated",
  "finalReviewDone",
  "publishReady",
] as const;

export type EditorialChecklistKey = (typeof EDITORIAL_CHECKLIST_KEYS)[number];

export const computeEditorialCompletion = (
  checklist: EditorialChecklist | null | undefined,
) => {
  const completed = EDITORIAL_CHECKLIST_KEYS.filter((key) => checklist?.[key] === true).length;
  return Math.round((completed / EDITORIAL_CHECKLIST_KEYS.length) * 100);
};

export const buildEditorialChecklistSeed = (
  state: "published" | "ready_for_review" | "draft",
): EditorialChecklist => {
  if (state === "published") {
    return {
      strategyValidated: true,
      coreContentReady: true,
      examplesReady: true,
      faqReady: true,
      seoReady: true,
      internalLinksReady: true,
      schemaValidated: true,
      finalReviewDone: true,
      publishReady: true,
    };
  }

  if (state === "ready_for_review") {
    return {
      strategyValidated: true,
      coreContentReady: true,
      examplesReady: true,
      faqReady: true,
      seoReady: true,
      internalLinksReady: true,
      schemaValidated: false,
      finalReviewDone: false,
      publishReady: false,
    };
  }

  return {
    strategyValidated: false,
    coreContentReady: false,
    examplesReady: false,
    faqReady: false,
    seoReady: false,
    internalLinksReady: false,
    schemaValidated: false,
    finalReviewDone: false,
    publishReady: false,
  };
};

export const getEditorialChecklistCopy = (mode: EditorialChecklistMode) => {
  if (mode === "calculator") {
    return {
      groupLabel: "Checklist editorial calculator",
      groupDescription:
        "Bifeaza pasii reali de productie pentru acest calculator inainte de publicare.",
      strategyValidatedLabel: "Formula + tool verificate",
      strategyValidatedDescription:
        "Formula a fost verificata, inputurile sunt corecte, iar calculatorul produce rezultate valide.",
      coreContentReadyLabel: "Intro + interpretare complete",
      coreContentReadyDescription:
        "Introducerea, contextul SEO si notele de interpretare sunt complete si usor de inteles.",
      examplesReadyLabel: "Exemple complete",
      examplesReadyDescription:
        "Exemplul sau exemplele explicative sunt suficient de clare pentru un utilizator real.",
    };
  }

  return {
    groupLabel: "Checklist editorial articol",
    groupDescription:
      "Bifeaza pasii reali de productie pentru acest articol inainte de publicare.",
    strategyValidatedLabel: "Angle + outline validate",
    strategyValidatedDescription:
      "Tema, unghiul editorial si structura articolului sunt validate pentru intentia de cautare.",
    coreContentReadyLabel: "Continut principal complet",
    coreContentReadyDescription:
      "Articolul este complet, coerent si acopera subiectul suficient de bine pentru publicare.",
    examplesReadyLabel: "Exemple sau dovezi complete",
    examplesReadyDescription:
      "Exemplele, explicatiile practice sau comparatiile sunt prezente si utile.",
  };
};
