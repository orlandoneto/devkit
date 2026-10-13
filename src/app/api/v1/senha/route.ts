import { NextRequest, NextResponse } from "next/server";
import { generatePassword } from "@/lib/password";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const password = generatePassword({
    length: Number(params.get("length") ?? 16),
    uppercase: params.get("uppercase") !== "false",
    lowercase: params.get("lowercase") !== "false",
    numbers: params.get("numbers") !== "false",
    symbols: params.get("symbols") !== "false",
  });

  return NextResponse.json({ password, length: password.length });
}
