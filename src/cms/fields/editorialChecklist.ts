import type { Field } from "payload";

import { getEditorialChecklistCopy, type EditorialChecklistMode } from "../../lib/editorial-checklist.ts";

export const editorialCompletionField: Field = {
  name: "editorialCompletion",
  type: "number",
  defaultValue: 0,
  admin: {
    readOnly: true,
    description: "Procent estimativ de completare a checklist-ului editorial.",
    step: 1,
  },
};

export const buildEditorialChecklistField = (mode: EditorialChecklistMode): Field => {
  const copy = getEditorialChecklistCopy(mode);

  return {
    name: "editorialChecklist",
    type: "group",
    admin: {
      description: copy.groupDescription,
    },
    fields: [
      {
        name: "strategyValidated",
        type: "checkbox",
        label: copy.strategyValidatedLabel,
        defaultValue: false,
        admin: {
          description: copy.strategyValidatedDescription,
        },
      },
      {
        name: "coreContentReady",
        type: "checkbox",
        label: copy.coreContentReadyLabel,
        defaultValue: false,
        admin: {
          description: copy.coreContentReadyDescription,
        },
      },
      {
        name: "examplesReady",
        type: "checkbox",
        label: copy.examplesReadyLabel,
        defaultValue: false,
        admin: {
          description: copy.examplesReadyDescription,
        },
      },
      {
        name: "faqReady",
        type: "checkbox",
        label: "FAQ complet",
        defaultValue: false,
        admin: {
          description:
            "Intrebarile frecvente sunt suficient de bune pentru intentia SEO si clarificarea subiectului.",
        },
      },
      {
        name: "seoReady",
        type: "checkbox",
        label: "SEO ready",
        defaultValue: false,
        admin: {
          description:
            "Meta title, meta description, canonical si copy-ul principal sunt pregatite pentru publicare.",
        },
      },
      {
        name: "internalLinksReady",
        type: "checkbox",
        label: "Internal linking pregatit",
        defaultValue: false,
        admin: {
          description:
            "Pagina are legaturi coerente spre alte calculatoare, articole sau hub-uri relevante.",
        },
      },
      {
        name: "schemaValidated",
        type: "checkbox",
        label: "Schema validata",
        defaultValue: false,
        admin: {
          description:
            "JSON-LD-ul este valid si se potriveste cu continutul real al paginii.",
        },
      },
      {
        name: "finalReviewDone",
        type: "checkbox",
        label: "Review final facut",
        defaultValue: false,
        admin: {
          description:
            "Pagina a trecut printr-un review final editorial sau QA inainte de publicare.",
        },
      },
      {
        name: "publishReady",
        type: "checkbox",
        label: "Ready de publicare",
        defaultValue: false,
        admin: {
          description:
            "Ultima confirmare ca pagina poate fi mutata din draft in live fara blocaje cunoscute.",
        },
      },
    ],
  };
};
