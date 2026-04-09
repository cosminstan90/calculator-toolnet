"use client";

import { ADS_TOGGLE_STORAGE_KEY, adsConfig } from "@/lib/ads";
import { useSyncExternalStore } from "react";

const CUSTOM_EVENT_NAME = "toolnet-ads-toggle";

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

const listeners = new Set<() => void>();
let unsubscribeWindow: (() => void) | null = null;

const notify = () => {
  for (const listener of listeners) {
    listener();
  }
};

const ensureWindowSubscription = () => {
  if (typeof window === "undefined" || unsubscribeWindow) {
    return;
  }

  const onStorage = () => notify();
  const onToggle = () => notify();

  window.addEventListener("storage", onStorage);
  window.addEventListener(CUSTOM_EVENT_NAME, onToggle as EventListener);

  unsubscribeWindow = () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CUSTOM_EVENT_NAME, onToggle as EventListener);
    unsubscribeWindow = null;
  };
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  ensureWindowSubscription();

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && unsubscribeWindow) {
      unsubscribeWindow();
    }
  };
};

export const useAdsEnabled = () => {
  return useSyncExternalStore(subscribe, readAdsEnabled, () => adsConfig.enabledByDefault);
};

export const setAdsEnabledPreference = (enabled: boolean) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ADS_TOGGLE_STORAGE_KEY, String(enabled));
  window.dispatchEvent(new Event(CUSTOM_EVENT_NAME));
  notify();
};
