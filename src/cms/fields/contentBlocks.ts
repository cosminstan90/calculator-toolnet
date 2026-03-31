import type { Field } from "payload";

const sectionToneField: Field = {
  name: "tone",
  type: "select",
  defaultValue: "mist",
  options: [
    { label: "Mist", value: "mist" },
    { label: "Night", value: "night" },
    { label: "Sand", value: "sand" },
  ],
};

export const contentBlocksField: Field = {
  name: "contentBlocks",
  type: "blocks",
  admin: {
    description:
      "Blocuri editoriale pentru homepage, hub-uri de categorie si pagini explicative.",
  },
  blocks: [
    {
      slug: "story",
      labels: {
        singular: "Story Section",
        plural: "Story Sections",
      },
      fields: [
        { name: "eyebrow", type: "text" },
        { name: "title", type: "text", required: true },
        { name: "body", type: "textarea", required: true },
        sectionToneField,
      ],
    },
    {
      slug: "facts",
      labels: {
        singular: "Facts Section",
        plural: "Facts Sections",
      },
      fields: [
        { name: "eyebrow", type: "text" },
        { name: "title", type: "text", required: true },
        { name: "intro", type: "textarea" },
        sectionToneField,
        {
          name: "items",
          type: "array",
          required: true,
          minRows: 2,
          fields: [
            { name: "value", type: "text", required: true },
            { name: "label", type: "text", required: true },
            { name: "detail", type: "textarea" },
          ],
        },
      ],
    },
    {
      slug: "links",
      labels: {
        singular: "Links Section",
        plural: "Links Sections",
      },
      fields: [
        { name: "eyebrow", type: "text" },
        { name: "title", type: "text", required: true },
        { name: "intro", type: "textarea" },
        sectionToneField,
        {
          name: "items",
          type: "array",
          required: true,
          minRows: 2,
          fields: [
            { name: "label", type: "text", required: true },
            { name: "href", type: "text", required: true },
            { name: "description", type: "textarea" },
          ],
        },
      ],
    },
    {
      slug: "cta",
      labels: {
        singular: "CTA Section",
        plural: "CTA Sections",
      },
      fields: [
        { name: "eyebrow", type: "text" },
        { name: "title", type: "text", required: true },
        { name: "body", type: "textarea", required: true },
        sectionToneField,
        { name: "primaryLabel", type: "text", required: true },
        { name: "primaryHref", type: "text", required: true },
        { name: "secondaryLabel", type: "text" },
        { name: "secondaryHref", type: "text" },
      ],
    },
  ],
};
