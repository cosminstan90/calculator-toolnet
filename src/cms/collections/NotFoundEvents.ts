import type { CollectionConfig } from "payload";

import { isAdmin, isAdminOrEditor } from "../access.ts";

export const NotFoundEvents: CollectionConfig = {
  slug: "not-found-events",
  admin: {
    useAsTitle: "path",
    defaultColumns: ["path", "hits", "lastSeenAt", "resolvedByRedirect"],
  },
  access: {
    read: isAdminOrEditor,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "path",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "hits",
      type: "number",
      required: true,
      defaultValue: 1,
    },
    {
      name: "firstSeenAt",
      type: "date",
      required: true,
    },
    {
      name: "lastSeenAt",
      type: "date",
      required: true,
    },
    {
      name: "lastReferer",
      type: "text",
    },
    {
      name: "lastUserAgent",
      type: "textarea",
    },
    {
      name: "lastMethod",
      type: "text",
    },
    {
      name: "source",
      type: "text",
      admin: {
        description: "Locul unde a fost detectat 404-ul: catch-all, article-route, calculator-route etc.",
      },
    },
    {
      name: "resolvedByRedirect",
      type: "relationship",
      relationTo: "redirects",
    },
  ],
  timestamps: true,
};
