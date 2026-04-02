import type { Field } from "payload";

export const publishingSlotOptions = [
  { label: "Fara autopublicare", value: "none" },
  { label: "Dimineata - 08:00", value: "morning" },
  { label: "Seara - 17:00", value: "evening" },
] as const;

export const publishingSchedulerSlotOptions = [
  { label: "Never", value: "none" },
  { label: "Morning - 08:00", value: "morning" },
  { label: "Evening - 17:00", value: "evening" },
] as const;

export const buildPublishingScheduleField = (label: string): Field => ({
  name: "publishingSchedule",
  type: "group",
  admin: {
    position: "sidebar",
    description:
      "Controleaza slotul de autopublicare pentru acest document si ordinea lui in coada.",
  },
  fields: [
    {
      name: "slot",
      type: "select",
      required: true,
      defaultValue: "none",
      index: true,
      options: publishingSlotOptions.map((option) => ({
        label: option.label,
        value: option.value,
      })),
      admin: {
        description: `Alege slotul in care vrei sa poata iesi live acest ${label}.`,
      },
    },
    {
      name: "priority",
      type: "number",
      required: true,
      defaultValue: 100,
      index: true,
      admin: {
        description:
          "Numar mai mic = prioritate mai mare. Scheduler-ul ia primul document eligibil.",
      },
    },
    {
      name: "earliestAt",
      type: "date",
      admin: {
        description:
          "Optional. Daca este setat, documentul nu poate fi publicat automat inainte de aceasta data.",
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "lastAutoAt",
      type: "date",
      admin: {
        readOnly: true,
        description:
          "Ultima data cand documentul a fost publicat automat de scheduler.",
      },
    },
    {
      name: "lastAutoSlot",
      type: "select",
      admin: {
        readOnly: true,
      },
      defaultValue: "none",
      options: publishingSchedulerSlotOptions.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    },
  ],
});
