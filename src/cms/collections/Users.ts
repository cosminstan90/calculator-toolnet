import type { CollectionConfig } from "payload";

import { adminsAndSelf, isAdmin } from "../access.ts";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "roles"],
  },
  access: {
    create: isAdmin,
    read: isAdmin,
    update: adminsAndSelf,
    delete: isAdmin,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "roles",
      type: "select",
      hasMany: true,
      required: true,
      defaultValue: ["reviewer"],
      options: [
        {
          label: "Admin",
          value: "admin",
        },
        {
          label: "Editor",
          value: "editor",
        },
        {
          label: "Reviewer",
          value: "reviewer",
        },
      ],
    },
  ],
  timestamps: true,
};
