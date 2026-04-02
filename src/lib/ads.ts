export const adsConfig = {
  enabledByDefault: process.env.NEXT_PUBLIC_ADS_ENABLED === "true",
  showToggle: process.env.NEXT_PUBLIC_SHOW_ADS_TOGGLE !== "false",
  adsenseClient: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT ?? "",
  slots: {
    homeInline: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_INLINE ?? "",
    calculatorsHubInline: process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATORS_HUB_INLINE ?? "",
    categoryInline: process.env.NEXT_PUBLIC_ADSENSE_SLOT_CATEGORY_INLINE ?? "",
    calculatorInline: process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR_INLINE ?? "",
    articleInline: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_INLINE ?? "",
  },
} as const;

export const ADS_TOGGLE_STORAGE_KEY = "toolnet-ads-enabled";
