import type { CollectionConfig } from "payload";

import { isAdmin, isAdminOrEditor } from "../access.ts";

export const AffiliateClickEvents: CollectionConfig = {
  slug: "affiliate-click-events",
  admin: {
    useAsTitle: "offerKey",
    defaultColumns: [
      "offerKey",
      "sourceType",
      "categorySlug",
      "audience",
      "sourcePath",
      "createdAt",
    ],
  },
  access: {
    read: isAdminOrEditor,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "offerKey",
      type: "text",
      required: true,
      index: true,
    },
    {
      name: "destinationURL",
      type: "text",
      required: true,
    },
    {
      name: "sourcePath",
      type: "text",
      required: true,
      index: true,
    },
    {
      name: "sourceType",
      type: "select",
      required: true,
      index: true,
      options: [
        { label: "Calculator", value: "calculator" },
        { label: "Article", value: "article" },
        { label: "Categorie", value: "category" },
      ],
    },
    {
      name: "audience",
      type: "select",
      required: true,
      index: true,
      options: [
        { label: "Pentru persoane", value: "consumer" },
        { label: "Pentru firme", value: "business" },
        { label: "Pentru ambele", value: "both" },
      ],
    },
    {
      name: "categorySlug",
      type: "text",
      index: true,
    },
    {
      name: "referer",
      type: "text",
    },
    {
      name: "userAgent",
      type: "textarea",
    },
  ],
  timestamps: true,
};
