import { NextRequest, NextResponse } from "next/server";
import {
  allowContactRequest,
  contactBodySchema,
  isContactConfigured,
  sendContactMessage,
} from "@/lib/contact";

export const dynamic = "force-dynamic";

function clientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  if (!isContactConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const ip = clientIp(request);
  if (!allowContactRequest(ip)) {
    return NextResponse.json({ error: "rate_limit" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const parsed = contactBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  if (parsed.data.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  try {
    await sendContactMessage({
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
      locale: parsed.data.locale,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "not_configured") {
      return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }
    console.error("[contact]", message);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }
}
