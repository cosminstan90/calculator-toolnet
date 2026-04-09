export type NotFoundEntry = {
  path: string;
  hits: number;
  source?: string;
  lastSeenAt?: string;
};

export type NotFoundBucket = "bot-noise" | "legacy-static" | "suspicious-config" | "content-gap";

const BOT_PATH_PATTERNS = [
  /^\/wp-/i,
  /^\/wp-json/i,
  /^\/xmlrpc\.php$/i,
  /^\/admin\.php$/i,
  /^\/about\.php$/i,
  /^\/adminfuns\.php$/i,
];

const SENSITIVE_FILE_PATTERNS = [
  /^\/\.env/i,
  /^\/\.git/i,
  /^\/backend\/\.env/i,
];

const LEGACY_STATIC_PATTERN = /^\/_next\/static\//i;

export const classifyNotFound = (path: string): NotFoundBucket => {
  if (BOT_PATH_PATTERNS.some((pattern) => pattern.test(path))) {
    return "bot-noise";
  }

  if (SENSITIVE_FILE_PATTERNS.some((pattern) => pattern.test(path))) {
    return "suspicious-config";
  }

  if (LEGACY_STATIC_PATTERN.test(path)) {
    return "legacy-static";
  }

  return "content-gap";
};

export const summarizeNotFounds = (entries: NotFoundEntry[]) => {
  const buckets = {
    "bot-noise": [] as NotFoundEntry[],
    "legacy-static": [] as NotFoundEntry[],
    "suspicious-config": [] as NotFoundEntry[],
    "content-gap": [] as NotFoundEntry[],
  };

  for (const entry of entries) {
    buckets[classifyNotFound(entry.path)].push(entry);
  }

  return {
    totals: {
      botNoise: buckets["bot-noise"].reduce((total, item) => total + item.hits, 0),
      suspiciousConfig: buckets["suspicious-config"].reduce((total, item) => total + item.hits, 0),
      legacyStatic: buckets["legacy-static"].reduce((total, item) => total + item.hits, 0),
      contentGaps: buckets["content-gap"].reduce((total, item) => total + item.hits, 0),
    },
    topContentGaps: buckets["content-gap"].slice(0, 10),
    topLegacyStatic: buckets["legacy-static"].slice(0, 10),
    topBotNoise: buckets["bot-noise"].slice(0, 10),
    topSuspiciousConfig: buckets["suspicious-config"].slice(0, 10),
  };
};
