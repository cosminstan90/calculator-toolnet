import type { CollectionBeforeChangeHook, CollectionConfig } from "payload";

import { computeEditorialCompletion } from "../../lib/editorial-checklist.ts";
import {
  cmsStaffFieldAccess,
  isAdmin,
  isAdminEditorOrReviewer,
  isAdminOrEditor,
  publishedOnlyForGuests,
} from "../access.ts";
import {
  buildEditorialChecklistField,
  editorialCompletionField,
} from "../fields/editorialChecklist.ts";
import { buildPublishingScheduleField } from "../fields/publishingSchedule.ts";
import { seoFieldGroup } from "../fields/seo.ts";
import { slugField } from "../fields/slug.ts";

const reviewedStatuses = new Set(["reviewed", "published"]);

const asObject = (value: unknown): Record<string, unknown> | null => {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
};

const asString = (value: unknown): string | undefined => {
  return typeof value === "string" ? value : undefined;
};

const setPublishedAt: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!data) {
    return data;
  }

  const incomingAiDraft = asObject(data.aiDraft);
  const previousAiDraft = asObject(originalDoc?.aiDraft);
  const nextReviewStatus =
    asString(incomingAiDraft?.reviewStatus) ??
    asString(previousAiDraft?.reviewStatus) ??
    "draft";
  const previousReviewStatus = asString(previousAiDraft?.reviewStatus) ?? "draft";
  const nextDocumentStatus = asString(data._status) ?? asString(originalDoc?._status) ?? "draft";

  if (nextDocumentStatus === "published" && !reviewedStatuses.has(nextReviewStatus)) {
    throw new Error(
      "Articolul nu poate fi publicat inainte ca review-ul editorial sa fie finalizat.",
    );
  }

  if (nextDocumentStatus === "published" && !data.publishedAt) {
    data.publishedAt = new Date().toISOString();
  }

  if (nextDocumentStatus === "published") {
    data.editorialStatus = "published";
  }

  if (
    reviewedStatuses.has(nextReviewStatus) &&
    nextReviewStatus !== previousReviewStatus &&
    req.user?.id
  ) {
    data.aiDraft = {
      ...(previousAiDraft ?? {}),
      ...(incomingAiDraft ?? {}),
      reviewer: incomingAiDraft?.reviewer ?? req.user.id,
    };
  }

  const nextChecklist =
    (data.editorialChecklist as Record<string, unknown> | undefined) ??
    (originalDoc?.editorialChecklist as Record<string, unknown> | undefined);
  data.editorialCompletion = computeEditorialCompletion(nextChecklist);

  return data;
};

export const Articles: CollectionConfig = {
  slug: "articles",
  admin: {
    useAsTitle: "title",
    defaultColumns: [
      "title",
      "releaseBatch",
      "publishingSchedule.slot",
      "editorialCompletion",
      "launchWave",
      "editorialStatus",
      "articleType",
      "_status",
      "publishedAt",
    ],
  },
  access: {
    read: publishedOnlyForGuests,
    create: isAdminOrEditor,
    update: isAdminEditorOrReviewer,
    delete: isAdmin,
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [setPublishedAt],
  },
  fields: [
    { name: "title", type: "text", required: true },
    slugField("title"),
    { name: "excerpt", type: "textarea", required: true },
    { name: "content", type: "textarea", required: true },
    {
      name: "articleType",
      type: "select",
      required: true,
      defaultValue: "guide",
      options: [
        { label: "Guide", value: "guide" },
        { label: "Explainer", value: "explainer" },
        { label: "Comparison", value: "comparison" },
      ],
    },
    {
      name: "relatedCategory",
      type: "relationship",
      relationTo: "calculator-categories",
    },
    {
      name: "relatedCalculators",
      type: "relationship",
      relationTo: "calculators",
      hasMany: true,
    },
    {
      name: "relatedArticles",
      type: "relationship",
      relationTo: "articles",
      hasMany: true,
    },
    {
      name: "launchWave",
      type: "select",
      required: true,
      defaultValue: "backlog",
      admin: {
        description:
          "Foloseste acest camp pentru a controla ce lot de articole poate iesi live la lansare.",
      },
      options: [
        { label: "Wave 1", value: "wave-1" },
        { label: "Wave 2", value: "wave-2" },
        { label: "Backlog", value: "backlog" },
      ],
    },
    {
      name: "releaseBatch",
      type: "text",
      index: true,
      admin: {
        description: "Lotul editorial din care face parte articolul, ex. batch-01.",
      },
    },
    {
      name: "editorialStatus",
      type: "select",
      required: true,
      defaultValue: "draft",
      index: true,
      options: [
        { label: "Draft", value: "draft" },
        { label: "Formula validated", value: "formula_validated" },
        { label: "Content in progress", value: "content_in_progress" },
        { label: "Ready for review", value: "ready_for_review" },
        { label: "Approved", value: "approved" },
        { label: "Scheduled", value: "scheduled" },
        { label: "Published", value: "published" },
      ],
    },
    buildPublishingScheduleField("articol"),
    editorialCompletionField,
    buildEditorialChecklistField("article"),
    { name: "coverImageURL", type: "text" },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
      required: true,
    },
    { name: "publishedAt", type: "date" },
    {
      name: "aiDraft",
      type: "group",
      access: {
        read: cmsStaffFieldAccess,
        update: cmsStaffFieldAccess,
      },
      fields: [
        { name: "draftGeneratedAt", type: "date" },
        { name: "draftModel", type: "text" },
        {
          name: "reviewStatus",
          type: "select",
          required: true,
          defaultValue: "draft",
          options: [
            { label: "Draft", value: "draft" },
            { label: "In review", value: "in_review" },
            { label: "Reviewed", value: "reviewed" },
            { label: "Published", value: "published" },
          ],
        },
        {
          name: "reviewer",
          type: "relationship",
          relationTo: "users",
        },
      ],
    },
    seoFieldGroup,
  ],
  timestamps: true,
};
