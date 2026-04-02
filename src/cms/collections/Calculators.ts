import {
  CALCULATOR_KEYS,
  getCalculatorDefinition,
  type CalculatorKey,
} from "../../lib/calculator-registry.ts";
import { buildDefaultCalculatorFaq } from "../../lib/calculator-content.ts";
import { computeEditorialCompletion as computeChecklistCompletion } from "../../lib/editorial-checklist.ts";
import type { CollectionBeforeChangeHook, CollectionConfig } from "payload";

import {
  buildEditorialChecklistField,
  editorialCompletionField,
} from "../fields/editorialChecklist.ts";
import { buildPublishingScheduleField } from "../fields/publishingSchedule.ts";

import {
  isAdmin,
  isAdminEditorOrReviewer,
  isAdminOrEditor,
  publishedOnlyForGuests,
} from "../access.ts";
import { contentBlocksField } from "../fields/contentBlocks.ts";
import { seoFieldGroup } from "../fields/seo.ts";
import { slugField } from "../fields/slug.ts";

const asString = (value: unknown): string | undefined => {
  return typeof value === "string" ? value : undefined;
};

const syncCalculatorRegistry: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
}) => {
  if (!data) {
    return data;
  }

  const calculatorKey =
    (asString(data.calculatorKey) ?? asString(originalDoc?.calculatorKey)) as
      | CalculatorKey
      | undefined;

  if (!calculatorKey || !CALCULATOR_KEYS.includes(calculatorKey)) {
    return data;
  }

  const definition = getCalculatorDefinition(calculatorKey);

  data.formulaName = definition.formulaName;
  data.formulaExpression = definition.formulaExpression;
  data.formulaDescription = definition.formulaDescription;
  data.inputSchema = definition.inputs.map((input) => ({
    name: input.name,
    label: input.label,
    inputType: input.type,
    unit: input.unit,
    description: input.description,
    min: input.min,
    max: input.max,
    step: input.step,
    required: input.required ?? false,
    defaultValue:
      typeof input.defaultValue === "undefined" ? undefined : String(input.defaultValue),
    optionsText:
      input.options?.map((option) => `${option.label}:${option.value}`).join("\n") ?? "",
  }));
  data.outputSchema = definition.outputs.map((output) => ({
    name: output.name,
    label: output.label,
    unit: output.unit,
    description: output.description,
    decimals: output.decimals ?? 2,
  }));

  if (!data.howToSteps || !Array.isArray(data.howToSteps) || data.howToSteps.length === 0) {
    data.howToSteps = definition.howToSteps.map((step) => ({ step }));
  }

  if (!data.faq || !Array.isArray(data.faq) || data.faq.length === 0) {
    data.faq = buildDefaultCalculatorFaq(calculatorKey);
  }

  const nextStatus = asString(data._status) ?? asString(originalDoc?._status);
  if (nextStatus === "published" && !data.publishedAt) {
    data.publishedAt = new Date().toISOString();
  }

  if (nextStatus === "published") {
    data.editorialStatus = "published";
  }

  const nextChecklist =
    (data.editorialChecklist as Record<string, unknown> | undefined) ??
    (originalDoc?.editorialChecklist as Record<string, unknown> | undefined);
  data.editorialCompletion = computeChecklistCompletion(nextChecklist);

  return data;
};

export const Calculators: CollectionConfig = {
  slug: "calculators",
  admin: {
    useAsTitle: "title",
    defaultColumns: [
      "title",
      "calculatorKey",
      "category",
      "releaseBatch",
      "publishingSchedule.slot",
      "editorialCompletion",
      "editorialStatus",
      "_status",
      "updatedAt",
    ],
  },
  access: {
    read: publishedOnlyForGuests,
    create: isAdminOrEditor,
    update: isAdminEditorOrReviewer,
    delete: isAdmin,
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [syncCalculatorRegistry],
  },
  fields: [
    { name: "title", type: "text", required: true },
    slugField("title"),
    {
      name: "calculatorKey",
      type: "select",
      required: true,
      unique: true,
      options: CALCULATOR_KEYS.map((key) => ({
        label: getCalculatorDefinition(key).title,
        value: key,
      })),
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "calculator-categories",
      required: true,
    },
    {
      name: "releaseBatch",
      type: "text",
      index: true,
      admin: {
        description: "Lotul editorial din care face parte calculatorul, ex. batch-01.",
      },
    },
    {
      name: "editorialStatus",
      type: "select",
      required: true,
      defaultValue: "draft",
      index: true,
      options: [
        { label: "Draft", value: "draft" },
        { label: "Formula validated", value: "formula_validated" },
        { label: "Content in progress", value: "content_in_progress" },
        { label: "Ready for review", value: "ready_for_review" },
        { label: "Approved", value: "approved" },
        { label: "Scheduled", value: "scheduled" },
        { label: "Published", value: "published" },
      ],
    },
    buildPublishingScheduleField("calculator"),
    editorialCompletionField,
    buildEditorialChecklistField("calculator"),
    {
      name: "formulaReference",
      type: "relationship",
      relationTo: "formula-library",
    },
    {
      name: "shortDescription",
      type: "textarea",
      required: true,
    },
    {
      name: "intro",
      type: "textarea",
      required: true,
    },
    {
      name: "seoBody",
      type: "textarea",
      required: true,
      admin: {
        description:
          "Text explicativ de 300-700 de cuvinte pentru intentia SEO. Ideal include context util, interpretare si mentiuni catre alte pagini relevante.",
      },
    },
    {
      name: "interpretationNotes",
      type: "textarea",
      required: true,
      admin: {
        description:
          "Note despre interpretarea rezultatului, limitele formulei si scenariile in care merita refacut calculul.",
      },
    },
    {
      name: "formulaName",
      type: "text",
      admin: { readOnly: true },
    },
    {
      name: "formulaExpression",
      type: "text",
      admin: { readOnly: true },
    },
    {
      name: "formulaDescription",
      type: "textarea",
      admin: { readOnly: true },
    },
    {
      name: "inputSchema",
      type: "array",
      admin: { readOnly: true },
      fields: [
        { name: "name", type: "text", required: true },
        { name: "label", type: "text", required: true },
        { name: "inputType", type: "text", required: true },
        { name: "unit", type: "text" },
        { name: "description", type: "textarea" },
        { name: "min", type: "number" },
        { name: "max", type: "number" },
        { name: "step", type: "number" },
        { name: "required", type: "checkbox" },
        { name: "defaultValue", type: "text" },
        { name: "optionsText", type: "textarea" },
      ],
    },
    {
      name: "outputSchema",
      type: "array",
      admin: { readOnly: true },
      fields: [
        { name: "name", type: "text", required: true },
        { name: "label", type: "text", required: true },
        { name: "unit", type: "text" },
        { name: "description", type: "textarea" },
        { name: "decimals", type: "number" },
      ],
    },
    {
      name: "howToSteps",
      type: "array",
      fields: [{ name: "step", type: "text", required: true }],
    },
    {
      name: "examples",
      type: "array",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "narrative", type: "textarea", required: true },
      ],
    },
    {
      name: "faq",
      type: "array",
      admin: {
        description:
          "Adauga intrebari frecvente utile pentru intentia SEO si pentru clarificarea rezultatului.",
      },
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true },
      ],
    },
    {
      name: "relatedCalculators",
      type: "relationship",
      relationTo: "calculators",
      hasMany: true,
    },
    {
      name: "relatedArticles",
      type: "relationship",
      relationTo: "articles",
      hasMany: true,
    },
    {
      name: "publishedAt",
      type: "date",
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      index: true,
    },
    {
      name: "isFeatured",
      type: "checkbox",
      defaultValue: false,
    },
    contentBlocksField,
    seoFieldGroup,
  ],
  timestamps: true,
};


