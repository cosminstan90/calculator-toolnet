import { getPayloadClient } from "@/lib/payload";
import { getAffiliateDestination } from "@/lib/commercial-cta";
import { NextResponse } from "next/server";

type Context = {
  params: Promise<{ offer: string }>;
};

const sanitizeValue = (value: string | null, maxLength: number) => {
  if (!value) {
    return "";
  }

  return value.slice(0, maxLength);
};

export async function GET(request: Request, context: Context) {
  const { offer } = await context.params;
  const destinationURL = getAffiliateDestination(offer);

  if (!destinationURL) {
    return new NextResponse("Offer not found.", {
      status: 404,
      headers: {
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  const url = new URL(request.url);
  const sourcePath = sanitizeValue(url.searchParams.get("source"), 512) || "/";
  const sourceTypeParam = url.searchParams.get("kind");
  const sourceType =
    sourceTypeParam === "article" || sourceTypeParam === "category"
      ? sourceTypeParam
      : "calculator";
  const audienceParam = url.searchParams.get("audience");
  const audience =
    audienceParam === "consumer" || audienceParam === "business"
      ? audienceParam
      : "both";
  const categorySlug = sanitizeValue(url.searchParams.get("category"), 80) || undefined;

  try {
    const payload = await getPayloadClient();
    await payload.create({
      collection: "affiliate-click-events",
      overrideAccess: true,
      data: {
        offerKey: offer,
        destinationURL,
        sourcePath,
        sourceType,
        audience,
        categorySlug,
        referer: sanitizeValue(request.headers.get("referer"), 512) || undefined,
        userAgent: sanitizeValue(request.headers.get("user-agent"), 2000) || undefined,
      },
    });
  } catch (error) {
    console.error("[affiliate] click logging failed", error);
  }

  return NextResponse.redirect(destinationURL, {
    status: 307,
    headers: {
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
