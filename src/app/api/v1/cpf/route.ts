import { NextRequest, NextResponse } from "next/server";
import {
  type BrazilianUF,
  displayCPF,
  generateManyCPF,
} from "@/lib/cpf";
import { cpfGenerateQuerySchema } from "@/lib/cpf/api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = cpfGenerateQuerySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Parâmetros inválidos",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const uf = (parsed.data.state ?? parsed.data.uf) as BrazilianUF | "random";
  const items = generateManyCPF(parsed.data.quantity, {
    uf,
    mask: parsed.data.mask,
  });

  if (items.length === 1) {
    const item = items[0];
    return NextResponse.json({
      cpf: displayCPF(item, parsed.data.mask),
      digits: item.cpf,
      formatted: item.formatted,
      uf: item.uf,
      regionDigit: item.regionDigit,
      regionLabel: item.regionLabel,
      valid: true,
      firstDigit: item.firstDigit,
      secondDigit: item.secondDigit,
    });
  }

  return NextResponse.json({
    count: items.length,
    mask: parsed.data.mask,
    uf,
    data: items.map((item) => ({
      cpf: displayCPF(item, parsed.data.mask),
      digits: item.cpf,
      formatted: item.formatted,
      uf: item.uf,
      regionDigit: item.regionDigit,
      regionLabel: item.regionLabel,
      valid: true,
    })),
  });
}
