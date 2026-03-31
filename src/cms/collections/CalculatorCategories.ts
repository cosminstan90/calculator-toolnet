import type { CollectionConfig } from "payload";

import { isAdmin, isAdminOrEditor } from "../access";
import { contentBlocksField } from "../fields/contentBlocks";
import { seoFieldGroup } from "../fields/seo";
import { slugField } from "../fields/slug";

export const CalculatorCategories: CollectionConfig = {
  slug: "calculator-categories",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "sortOrder", "updatedAt"],
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
    { name: "name", type: "text", required: true },
    slugField("name"),
    { name: "summary", type: "textarea", required: true },
    {
      name: "introContent",
      type: "textarea",
      admin: {
        description: "Text editorial pentru hub-ul de categorie.",
      },
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
