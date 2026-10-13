import { NextRequest, NextResponse } from "next/server";
import { generateRG } from "@/lib/rg";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const mask = request.nextUrl.searchParams.get("mask") !== "false";
  const item = generateRG(mask);
  return NextResponse.json({
    rg: item.display,
    raw: item.rg,
    formatted: item.formatted,
    note: item.note,
  });
}
