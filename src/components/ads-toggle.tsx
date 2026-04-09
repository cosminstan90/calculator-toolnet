"use client";

import { adsConfig } from "@/lib/ads";
import { setAdsEnabledPreference, useAdsEnabled } from "@/components/ads-preference";

export const AdsToggle = () => {
  const enabled = useAdsEnabled();

  if (!adsConfig.showToggle || !adsConfig.adsenseClient) {
    return null;
  }

  const toggleAds = () => {
    setAdsEnabledPreference(!enabled);
  };

  return (
    <button
      type="button"
      onClick={toggleAds}
      className="fixed bottom-4 right-4 z-[80] rounded-full border border-slate-300/80 bg-white/92 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.45)] backdrop-blur transition hover:border-emerald-300 hover:text-emerald-700"
      aria-pressed={enabled}
      aria-label={enabled ? "Opreste reclamele" : "Porneste reclamele"}
    >
      Ads: {enabled ? "ON" : "OFF"}
    </button>
  );
};
