import type { GlobalConfig } from "payload";

import { isAdminOrEditor } from "../access";
import { contentBlocksField } from "../fields/contentBlocks";
import { seoFieldGroup } from "../fields/seo";

export const Homepage: GlobalConfig = {
  slug: "homepage",
  label: "Homepage",
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: "heroBadge",
      type: "text",
      defaultValue: "SEO-first calculator hub",
    },
    {
      name: "heroTitle",
      type: "text",
      required: true,
      defaultValue:
        "Calculatoare online construite sa raspunda repede si sa explice corect.",
    },
    {
      name: "heroDescription",
      type: "textarea",
      required: true,
      defaultValue:
        "Pastram fundatia editoriala si refacem verticala in jurul calculatoarelor online cu intentie reala de cautare.",
    },
    {
      name: "primaryCTA",
      type: "group",
      fields: [
        { name: "label", type: "text", required: true, defaultValue: "Vezi toate calculatoarele" },
        { name: "href", type: "text", required: true, defaultValue: "/calculatoare" },
      ],
    },
    {
      name: "secondaryCTA",
      type: "group",
      fields: [
        { name: "label", type: "text", defaultValue: "Citeste metodologia" },
        { name: "href", type: "text", defaultValue: "/metodologie" },
      ],
    },
    {
      name: "heroHighlights",
      type: "array",
      minRows: 3,
      fields: [
        { name: "value", type: "text", required: true },
        { name: "label", type: "text", required: true },
      ],
      defaultValue: [
        { value: "10", label: "calculatoare in seed-ul initial" },
        { value: "4", label: "categorii pentru hub-uri SEO" },
        { value: "SSR/ISR", label: "fundatie rapida pentru crawl si UX" },
      ],
    },
    contentBlocksField,
    seoFieldGroup,
  ],
};
