import { importContent, parseImportContent } from "@/lib/import-content";
import { getPayloadClient } from "@/lib/payload";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const expectedToken = process.env.CONTENT_IMPORT_TOKEN ?? process.env.BOOTSTRAP_TOKEN;
  const providedToken = request.headers.get("x-content-import-token");

  if (!expectedToken || providedToken !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { format?: string; raw?: string }
    | null;

  if (!body?.raw) {
    return NextResponse.json({ error: "Missing raw import payload." }, { status: 400 });
  }

  const payload = await getPayloadClient();
  const parsed = parseImportContent(body.raw, body.format);
  const result = await importContent(payload, parsed);

  return NextResponse.json({ ok: true, ...result });
}
