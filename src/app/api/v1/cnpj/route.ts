import { NextRequest, NextResponse } from "next/server";
import { generateCNPJ } from "@/lib/cnpj";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const mask = request.nextUrl.searchParams.get("mask") !== "false";
  const item = generateCNPJ(mask);
  return NextResponse.json({
    cnpj: item.display,
    digits: item.cnpj,
    formatted: item.formatted,
    valid: true,
  });
}
