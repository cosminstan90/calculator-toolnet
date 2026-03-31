import { recordNotFoundEvent, resolveRedirect, toNormalizedPath, getRedirectNavigationMode } from "@/lib/routing";
import { headers } from "next/headers";
import { notFound, permanentRedirect, redirect } from "next/navigation";

type Params = Promise<{ segments: string[] }>;

export const dynamic = "force-dynamic";

export default async function CatchAllPage({ params }: { params: Params }) {
  const { segments } = await params;
  const path = toNormalizedPath(`/${(segments ?? []).join("/")}`);
  const headerStore = await headers();
  const redirectMatch = await resolveRedirect(path);

  if (redirectMatch) {
    await recordNotFoundEvent({
      path,
      referer: headerStore.get("referer"),
      userAgent: headerStore.get("user-agent"),
      method: "GET",
      source: "catch-all-redirect",
      resolvedByRedirect: redirectMatch.id,
    });

    if (getRedirectNavigationMode(redirectMatch.statusCode) === "permanent") {
      permanentRedirect(redirectMatch.destinationPath);
    }

    redirect(redirectMatch.destinationPath);
  }

  await recordNotFoundEvent({
    path,
    referer: headerStore.get("referer"),
    userAgent: headerStore.get("user-agent"),
    method: "GET",
    source: "catch-all-not-found",
  });

  notFound();
}
