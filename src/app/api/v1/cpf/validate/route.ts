import { NextRequest, NextResponse } from "next/server";
import { validateCPF } from "@/lib/cpf";
import { cpfValidateBodySchema } from "@/lib/cpf/api";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = cpfValidateBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Body inválido", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = validateCPF(parsed.data.cpf);

  return NextResponse.json({
    valid: result.valid,
    cpf: result.digits,
    formatted: result.formatted,
    reasons: result.reasons,
    firstDigit: result.firstDigit,
    secondDigit: result.secondDigit,
    expectedFirstDigit: result.expectedFirstDigit,
    expectedSecondDigit: result.expectedSecondDigit,
    regionDigit: result.regionDigit,
    regionLabel: result.regionLabel,
    ufCandidates: result.ufCandidates,
  });
}
