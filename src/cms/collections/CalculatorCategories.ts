import type { CollectionAfterChangeHook, CollectionConfig } from "payload";

import { isAdmin, isAdminOrEditor } from "../access.ts";
import { contentBlocksField } from "../fields/contentBlocks.ts";
import { seoFieldGroup } from "../fields/seo.ts";
import { slugField } from "../fields/slug.ts";
import { notifyIndexNow } from "../../lib/indexnow.ts";

const pingIndexNowOnPublish: CollectionAfterChangeHook = ({ doc }) => {
  if (doc?._status === "published" && doc.slug) {
    void notifyIndexNow([`/calculatoare/${doc.slug}`]);
  }
  return doc;
};

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
  hooks: {
    afterChange: [pingIndexNowOnPublish],
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
