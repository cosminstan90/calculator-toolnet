"use client";

import dynamic from "next/dynamic";

const AdSlot = dynamic(() => import("@/components/ad-slot").then((mod) => mod.AdSlot), {
  ssr: false,
});

type AdSlotLazyProps = {
  slot: string;
  label?: string;
  className?: string;
  minHeightClassName?: string;
};

export const AdSlotLazy = (props: AdSlotLazyProps) => {
  return <AdSlot {...props} />;
};
