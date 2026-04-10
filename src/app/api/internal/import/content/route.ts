import { importContent, parseImportContent } from "@/lib/import-content";
import { tokenMatches } from "@/lib/internal-auth";
import { getPayloadClient } from "@/lib/payload";
import { checkRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const expectedToken = process.env.CONTENT_IMPORT_TOKEN ?? process.env.BOOTSTRAP_TOKEN;
  const providedToken = request.headers.get("x-content-import-token");

  if (!tokenMatches(expectedToken, providedToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rate = checkRateLimit({
    request,
    scope: "internal_content_import",
    limit: 10,
    windowMs: 60_000,
  });

  if (!rate.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (Number.isFinite(contentLength) && contentLength > 1_000_000) {
    return NextResponse.json({ error: "Request body too large." }, { status: 413 });
  }

  const rawBody = await request.text().catch(() => "");

  if (!rawBody || rawBody.length > 1_000_000) {
    return NextResponse.json({ error: "Request body too large." }, { status: 413 });
  }

  const body = (() => {
    try {
      return JSON.parse(rawBody) as { format?: string; raw?: string };
    } catch {
      return null;
    }
  })();

  if (!body?.raw) {
    return NextResponse.json({ error: "Missing raw import payload." }, { status: 400 });
  }

  const payload = await getPayloadClient();
  const parsed = parseImportContent(body.raw, body.format);
  const result = await importContent(payload, parsed);

  return NextResponse.json({ ok: true, ...result });
}
