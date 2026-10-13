import { NextRequest, NextResponse } from "next/server";
import { generateManyUUID, generateUUID } from "@/lib/uuid";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const quantity = Math.min(
    Math.max(Number(request.nextUrl.searchParams.get("quantity") ?? 1), 1),
    100,
  );

  if (quantity === 1) {
    return NextResponse.json({ uuid: generateUUID(), version: 4 });
  }

  return NextResponse.json({
    count: quantity,
    data: generateManyUUID(quantity),
  });
}
