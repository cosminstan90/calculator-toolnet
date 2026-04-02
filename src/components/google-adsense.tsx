"use client";

import { adsConfig, ADS_TOGGLE_STORAGE_KEY } from "@/lib/ads";
import Script from "next/script";
import { useEffect, useState } from "react";

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

export const GoogleAdSense = () => {
  const [enabled, setEnabled] = useState(readAdsEnabled);

  useEffect(() => {
    const syncState = () => setEnabled(readAdsEnabled());
    window.addEventListener("storage", syncState);
    window.addEventListener("toolnet-ads-toggle", syncState as EventListener);
    return () => {
      window.removeEventListener("storage", syncState);
      window.removeEventListener("toolnet-ads-toggle", syncState as EventListener);
    };
  }, []);

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
