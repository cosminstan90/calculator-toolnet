type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

const memoryBuckets = new Map<string, Bucket>();

const normalizeHeaderValue = (value: string | null): string | null => {
  if (!value) {
    return null;
  }

  const normalized = value.split(",")[0]?.trim();

  if (
    !normalized ||
    normalized.length > 200 ||
    normalized.includes("\n") ||
    normalized.includes("\r")
  ) {
    return null;
  }

  return normalized;
};

const getClientKey = (request: Request): string => {
  const directIp =
    normalizeHeaderValue(request.headers.get("x-real-ip")) ??
    normalizeHeaderValue(request.headers.get("cf-connecting-ip"));

  if (directIp) {
    return `ip:${directIp}`;
  }

  if (process.env.TRUST_PROXY_FORWARD_HEADERS === "true") {
    const forwardedIp = normalizeHeaderValue(request.headers.get("x-forwarded-for"));

    if (forwardedIp) {
      return `ip:${forwardedIp}`;
    }
  }

  const userAgent = normalizeHeaderValue(request.headers.get("user-agent")) ?? "unknown";
  const acceptLanguage =
    normalizeHeaderValue(request.headers.get("accept-language")) ?? "unknown";

  return `fallback:${userAgent}:${acceptLanguage}`;
};

const cleanupExpired = (now: number) => {
  if (memoryBuckets.size < 2000) {
    return;
  }

  for (const [key, bucket] of memoryBuckets.entries()) {
    if (bucket.resetAt <= now) {
      memoryBuckets.delete(key);
    }
  }
};

export const checkRateLimit = (args: {
  request: Request;
  scope: string;
  limit: number;
  windowMs: number;
}): RateLimitResult => {
  const now = Date.now();
  cleanupExpired(now);

  const clientKey = getClientKey(args.request);
  const key = `${args.scope}:${clientKey}`;
  const bucket = memoryBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + args.windowMs;
    memoryBuckets.set(key, { count: 1, resetAt });
    return {
      ok: true,
      limit: args.limit,
      remaining: Math.max(args.limit - 1, 0),
      resetAt,
    };
  }

  if (bucket.count >= args.limit) {
    return {
      ok: false,
      limit: args.limit,
      remaining: 0,
      resetAt: bucket.resetAt,
    };
  }

  bucket.count += 1;
  memoryBuckets.set(key, bucket);

  return {
    ok: true,
    limit: args.limit,
    remaining: Math.max(args.limit - bucket.count, 0),
    resetAt: bucket.resetAt,
  };
};
