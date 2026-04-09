"use client";

import { adsConfig } from "@/lib/ads";
import { useAdsEnabled } from "@/components/ads-preference";
import Script from "next/script";

export const GoogleAdSense = () => {
  const enabled = useAdsEnabled();

  if (!enabled || !adsConfig.adsenseClient) {
    return null;
  }

  return (
    <Script
      id="google-adsense"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsConfig.adsenseClient}`}
    />
  );
};
