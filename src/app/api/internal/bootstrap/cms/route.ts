import { bootstrapCms } from "@/lib/bootstrap";
import { getPayloadClient } from "@/lib/payload";
import { NextResponse } from "next/server";

type BootstrapBody = {
  force?: boolean;
};

export async function POST(request: Request) {
  const expectedToken = process.env.BOOTSTRAP_TOKEN;
  const providedToken = request.headers.get("x-bootstrap-token");

  if (!expectedToken || providedToken !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as BootstrapBody;
  const payload = await getPayloadClient();
  const result = await bootstrapCms(payload, { force: body.force === true });

  return NextResponse.json({ ok: true, force: body.force === true, ...result });
}
