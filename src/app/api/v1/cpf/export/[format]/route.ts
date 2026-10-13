import { NextRequest, NextResponse } from "next/server";
import {
  type BrazilianUF,
  exportCPF,
  generateManyCPF,
  type ExportFormat,
} from "@/lib/cpf";
import { cpfGenerateQuerySchema } from "@/lib/cpf/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ format: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { format: rawFormat } = await params;
  const format = rawFormat.replace(/^\./, "").toLowerCase() as ExportFormat;

  if (!["csv", "txt", "json"].includes(format)) {
    return NextResponse.json(
      { error: "Formato inválido. Use csv, txt ou json." },
      { status: 400 },
    );
  }

  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = cpfGenerateQuerySchema.safeParse(query);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Parâmetros inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const uf = (parsed.data.state ?? parsed.data.uf) as BrazilianUF | "random";
  const items = generateManyCPF(parsed.data.quantity, { uf });
  const file = exportCPF(items, format, parsed.data.mask);

  return new NextResponse(file.content, {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `attachment; filename="${file.filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
