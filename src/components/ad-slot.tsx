"use client";

import { adsConfig, ADS_TOGGLE_STORAGE_KEY } from "@/lib/ads";
import { useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

type AdSlotProps = {
  slot: string;
  label?: string;
  className?: string;
  minHeightClassName?: string;
};

const readAdsEnabled = () => {
  if (typeof window === "undefined") {
    return adsConfig.enabledByDefault;
  }

  const stored = window.localStorage.getItem(ADS_TOGGLE_STORAGE_KEY);
  if (stored === "true") {
    return true;
  }
  if (stored === "false") {
    return false;
  }
  return adsConfig.enabledByDefault;
};

export const AdSlot = ({
  slot,
  label = "Publicitate",
  className = "",
  minHeightClassName = "min-h-[180px]",
}: AdSlotProps) => {
  const [enabled, setEnabled] = useState(adsConfig.enabledByDefault);
  const slotKey = useMemo(() => `${slot}-${enabled}`, [slot, enabled]);

  useEffect(() => {
    setEnabled(readAdsEnabled());

    const syncState = () => setEnabled(readAdsEnabled());
    window.addEventListener("storage", syncState);
    window.addEventListener("toolnet-ads-toggle", syncState as EventListener);
    return () => {
      window.removeEventListener("storage", syncState);
      window.removeEventListener("toolnet-ads-toggle", syncState as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !slot || !adsConfig.adsenseClient) {
      return;
    }

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // AdSense script may not be ready on the first frame; a later rerender will retry.
    }
  }, [enabled, slotKey, slot]);

  if (!enabled || !slot || !adsConfig.adsenseClient) {
    return null;
  }

  return (
    <aside
      className={`rounded-[1.8rem] border border-slate-300/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(247,244,238,0.85)_100%)] p-4 shadow-[0_18px_60px_-45px_rgba(15,23,42,0.38)] ${className}`}
      aria-label={label}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
        {label}
      </p>
      <div className={`mt-3 overflow-hidden rounded-[1.2rem] bg-white/70 px-2 py-3 ${minHeightClassName}`}>
        <ins
          key={slotKey}
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={adsConfig.adsenseClient}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
};
