import type { Field } from "payload";

export const seoFieldGroup: Field = {
  name: "seo",
  type: "group",
  fields: [
    {
      name: "metaTitle",
      type: "text",
      maxLength: 70,
      admin: {
        description: "Titlu SEO recomandat (50-60 caractere).",
      },
    },
    {
      name: "metaDescription",
      type: "textarea",
      maxLength: 170,
      admin: {
        description: "Descriere SEO recomandata (120-160 caractere).",
      },
    },
    {
      name: "canonicalPath",
      type: "text",
      admin: {
        description:
          "Optional. Path-ul canonic fara domeniu, ex: /munte/brasov/poiana-brasov",
      },
    },
    {
      name: "ogImageURL",
      type: "text",
      admin: {
        description: "URL absolut pentru imagine OpenGraph.",
      },
    },
    {
      name: "twitterImageURL",
      type: "text",
      admin: {
        description: "URL absolut pentru imagine Twitter.",
      },
    },
    {
      name: "noIndex",
      type: "checkbox",
      defaultValue: false,
    },
  ],
};
