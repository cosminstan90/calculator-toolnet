import { searchSuggestions } from "@/lib/content";
import { checkRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const rate = checkRateLimit({
    request,
    scope: "search_suggest",
    limit: 90,
    windowMs: 60_000,
  });

  if (!rate.ok) {
    return NextResponse.json(
      {
        error: "Too many requests. Incearca din nou in cateva secunde.",
      },
      {
        status: 429,
        headers: {
          "x-ratelimit-limit": String(rate.limit),
          "x-ratelimit-remaining": String(rate.remaining),
          "x-ratelimit-reset": String(Math.ceil(rate.resetAt / 1000)),
        },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  const suggestions = await searchSuggestions(query);

  return NextResponse.json(
    {
      query,
      count: suggestions.length,
      suggestions,
    },
    {
      headers: {
        "cache-control": "public, s-maxage=60, stale-while-revalidate=600",
        "x-ratelimit-limit": String(rate.limit),
        "x-ratelimit-remaining": String(rate.remaining),
        "x-ratelimit-reset": String(Math.ceil(rate.resetAt / 1000)),
      },
    }
  );
}
