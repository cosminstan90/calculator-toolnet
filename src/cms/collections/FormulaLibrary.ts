import type { CollectionConfig } from "payload";

import { isAdmin, isAdminOrEditor } from "../access";
import { slugField } from "../fields/slug";

export const FormulaLibrary: CollectionConfig = {
  slug: "formula-library",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "formulaKey", "updatedAt"],
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  versions: {
    drafts: true,
  },
  fields: [
    { name: "title", type: "text", required: true },
    slugField("title"),
    {
      name: "formulaKey",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "expression",
      type: "text",
      required: true,
    },
    {
      name: "summary",
      type: "textarea",
      required: true,
    },
    {
      name: "explanation",
      type: "textarea",
      required: true,
    },
    {
      name: "variables",
      type: "array",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "label", type: "text", required: true },
        { name: "unit", type: "text" },
      ],
    },
  ],
  timestamps: true,
};
