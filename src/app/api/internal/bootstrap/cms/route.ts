import { bootstrapCms } from "@/lib/bootstrap";
import { tokenMatches } from "@/lib/internal-auth";
import { getPayloadClient } from "@/lib/payload";
import { checkRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

type BootstrapBody = {
  force?: boolean;
};

export async function POST(request: Request) {
  const expectedToken = process.env.BOOTSTRAP_TOKEN;
  const providedToken = request.headers.get("x-bootstrap-token");

  if (!tokenMatches(expectedToken, providedToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rate = checkRateLimit({
    request,
    scope: "internal_bootstrap",
    limit: 6,
    windowMs: 60_000,
  });

  if (!rate.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (Number.isFinite(contentLength) && contentLength > 10_000) {
    return NextResponse.json({ error: "Request body too large." }, { status: 413 });
  }

  const body = (await request.json().catch(() => ({}))) as BootstrapBody;
  const payload = await getPayloadClient();
  const result = await bootstrapCms(payload, { force: body.force === true });

  return NextResponse.json({ ok: true, force: body.force === true, ...result });
}
