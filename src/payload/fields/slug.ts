import type { Field, FieldHook } from "payload";
import slugify from "slugify";

const formatSlug = (value: string): string => {
  return slugify(value, {
    lower: true,
    strict: true,
    trim: true,
  });
};

const createSlugHook =
  (fallbackField = "title"): FieldHook =>
  ({ value, data }) => {
    if (typeof value === "string" && value.trim().length > 0) {
      return formatSlug(value);
    }

    const rawFallback = data?.[fallbackField];

    if (typeof rawFallback === "string" && rawFallback.trim().length > 0) {
      return formatSlug(rawFallback);
    }

    return value;
  };

export const slugField = (fallbackField = "title"): Field => {
  return {
    name: "slug",
    type: "text",
    index: true,
    required: true,
    unique: true,
    admin: {
      position: "sidebar",
      description:
        "Slug-ul este folosit in URL. Se genereaza automat daca este lasat gol.",
    },
    hooks: {
      beforeValidate: [createSlugHook(fallbackField)],
    },
  };
};
