import { convertDigitableLine } from "@/lib/boleto";
import { validateCNPJ } from "@/lib/cnpj";
import { validateCPF } from "@/lib/cpf";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const MAX_PDF_PAGES = 5;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const PDF_TYPE = "application/pdf";

export function isPdfFile(file: File) {
  return (
    file.type === PDF_TYPE ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

export function assertOcrFile(file: File) {
  const typeOk =
    IMAGE_TYPES.includes(file.type as (typeof IMAGE_TYPES)[number]) ||
    isPdfFile(file);
  if (!typeOk) {
    throw new Error("UNSUPPORTED_TYPE");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }
}

export function extractCandidates(text: string) {
  const digitsOnlyRuns = text.match(/\d[\d.\s\-/]{10,}\d/g) ?? [];

  const cpfs = new Set<string>();
  const cnpjs = new Set<string>();
  const digitableLines = new Set<string>();

  for (const run of digitsOnlyRuns) {
    const digits = run.replace(/\D/g, "");

    if (digits.length === 11 && validateCPF(digits).valid) {
      cpfs.add(digits);
    }
    if (digits.length === 14 && validateCNPJ(digits).valid) {
      cnpjs.add(digits);
    }
    if (digits.length === 47 || digits.length === 48) {
      const conversion = convertDigitableLine(digits);
      if (conversion.success) {
        digitableLines.add(digits);
      }
    }
  }

  // Also scan sliding windows on full digit stream for boletos without separators
  const allDigits = text.replace(/\D/g, "");
  for (const len of [47, 48] as const) {
    for (let i = 0; i <= allDigits.length - len; i += 1) {
      const slice = allDigits.slice(i, i + len);
      const conversion = convertDigitableLine(slice);
      if (conversion.success) digitableLines.add(slice);
    }
  }

  for (let i = 0; i <= allDigits.length - 11; i += 1) {
    const slice = allDigits.slice(i, i + 11);
    if (validateCPF(slice).valid) cpfs.add(slice);
  }
  for (let i = 0; i <= allDigits.length - 14; i += 1) {
    const slice = allDigits.slice(i, i + 14);
    if (validateCNPJ(slice).valid) cnpjs.add(slice);
  }

  return {
    text: text.replace(/\r\n/g, "\n").trim(),
    cpfs: Array.from(cpfs).slice(0, 5),
    cnpjs: Array.from(cnpjs).slice(0, 5),
    digitableLines: Array.from(digitableLines).slice(0, 5),
  };
}

export const OCR_LIMITS = {
  maxBytes: MAX_BYTES,
  maxMb: 8,
  maxPdfPages: MAX_PDF_PAGES,
  acceptedTypes: [...IMAGE_TYPES, PDF_TYPE, ".pdf"],
} as const;
