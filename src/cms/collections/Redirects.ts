import type { CollectionConfig } from "payload";
import { isSafeInternalPath } from "../../lib/routing.ts";

import { isAdmin, isAdminOrEditor } from "../access.ts";

export const Redirects: CollectionConfig = {
  slug: "redirects",
  admin: {
    useAsTitle: "sourcePath",
    defaultColumns: ["sourcePath", "destinationPath", "statusCode", "isEnabled"],
  },
  access: {
    read: isAdminOrEditor,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: "sourcePath",
      type: "text",
      required: true,
      unique: true,
      index: true,
      validate: (value: unknown) => {
        if (typeof value !== "string" || !isSafeInternalPath(value)) {
          return "Source path trebuie sa fie un path intern relativ care incepe cu /.";
        }

        return true;
      },
      admin: {
        description: "Path-ul vechi, ex: /vechi-slug",
      },
    },
    {
      name: "destinationPath",
      type: "text",
      required: true,
      validate: (value: unknown) => {
        if (typeof value !== "string" || !isSafeInternalPath(value)) {
          return "Destination path trebuie sa fie un path intern relativ care incepe cu /.";
        }

        return true;
      },
      admin: {
        description: "Path-ul nou, ex: /calculatoare/nutritie-si-antrenament/calculator-bmi-imc",
      },
    },
    {
      name: "statusCode",
      type: "select",
      required: true,
      defaultValue: "308",
      options: [
        { label: "301 Permanent", value: "301" },
        { label: "302 Temporary", value: "302" },
        { label: "307 Temporary", value: "307" },
        { label: "308 Permanent", value: "308" },
      ],
    },
    {
      name: "isEnabled",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "notes",
      type: "textarea",
    },
  ],
  timestamps: true,
};
