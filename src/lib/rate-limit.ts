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

const getClientKey = (request: Request): string => {
  const forwardedFor =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const ip = forwardedFor.split(",")[0]?.trim() ?? "unknown";
  return ip || "unknown";
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
