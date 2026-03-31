import { getPayloadClient } from "@/lib/payload";

const normalizePath = (path: string): string => {
  if (!path || path === "/") {
    return "/";
  }

  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  return withLeadingSlash.replace(/\/+$/, "") || "/";
};

const hasProtocol = (value: string) => /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value);

export const isSafeInternalPath = (value: string): boolean => {
  const trimmed = value.trim();

  if (!trimmed.startsWith("/")) {
    return false;
  }

  if (trimmed.startsWith("//")) {
    return false;
  }

  if (trimmed.includes("\r") || trimmed.includes("\n")) {
    return false;
  }

  return !hasProtocol(trimmed);
};

type RedirectMatch = {
  id: string;
  destinationPath: string;
  statusCode: string;
};

export const resolveRedirect = async (path: string): Promise<RedirectMatch | null> => {
  const normalizedPath = normalizePath(path);

  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "redirects",
      depth: 0,
      draft: false,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [
          {
            sourcePath: {
              equals: normalizedPath,
            },
          },
          {
            isEnabled: {
              equals: true,
            },
          },
        ],
      },
    });

    const doc = result.docs[0] as
      | {
          id: string | number;
          destinationPath?: string;
          statusCode?: string;
        }
      | undefined;

    if (!doc?.destinationPath || !isSafeInternalPath(doc.destinationPath)) {
      if (doc?.destinationPath) {
        console.error("[routing] ignoring unsafe redirect destination", {
          sourcePath: normalizedPath,
          destinationPath: doc.destinationPath,
        });
      }
      return null;
    }

    return {
      id: String(doc.id),
      destinationPath: doc.destinationPath,
      statusCode: doc.statusCode ?? "308",
    };
  } catch (error) {
    console.error("[routing] resolveRedirect failed", error);
    return null;
  }
};

export const recordNotFoundEvent = async (args: {
  path: string;
  referer?: string | null;
  userAgent?: string | null;
  method?: string | null;
  source: string;
  resolvedByRedirect?: string | null;
}) => {
  const normalizedPath = normalizePath(args.path);

  try {
    const payload = await getPayloadClient();
    const existing = await payload.find({
      collection: "not-found-events",
      depth: 0,
      limit: 1,
      pagination: false,
      overrideAccess: true,
      where: {
        path: {
          equals: normalizedPath,
        },
      },
    });

    const now = new Date().toISOString();
    const doc = existing.docs[0] as { id: string | number; hits?: number } | undefined;

    if (doc) {
      await payload.update({
        collection: "not-found-events",
        id: doc.id,
        overrideAccess: true,
        data: {
          hits: (typeof doc.hits === "number" ? doc.hits : 0) + 1,
          lastSeenAt: now,
          lastReferer: args.referer ?? undefined,
          lastUserAgent: args.userAgent ?? undefined,
          lastMethod: args.method ?? undefined,
          source: args.source,
          resolvedByRedirect: args.resolvedByRedirect ?? undefined,
        },
      });
      return;
    }

    await payload.create({
      collection: "not-found-events",
      overrideAccess: true,
      data: {
        path: normalizedPath,
        hits: 1,
        firstSeenAt: now,
        lastSeenAt: now,
        lastReferer: args.referer ?? undefined,
        lastUserAgent: args.userAgent ?? undefined,
        lastMethod: args.method ?? undefined,
        source: args.source,
        resolvedByRedirect: args.resolvedByRedirect ?? undefined,
      },
    });
  } catch (error) {
    console.error("[routing] recordNotFoundEvent failed", error);
  }
};

export const getRedirectNavigationMode = (statusCode?: string) => {
  const status = statusCode ?? "308";
  return status === "301" || status === "308" ? "permanent" : "temporary";
};

export const toNormalizedPath = normalizePath;
