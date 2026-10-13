import { NextRequest, NextResponse } from "next/server";
import { validateCNPJ } from "@/lib/cnpj";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = validateCNPJ(String(body?.cnpj ?? ""));
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
}
