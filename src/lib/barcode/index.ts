export type BarcodeFormat =
  | "CODE128"
  | "CODE39"
  | "EAN13"
  | "EAN8"
  | "EAN5"
  | "EAN2"
  | "UPC"
  | "UPCE"
  | "ITF14"
  | "ITF"
  | "MSI"
  | "pharmacode"
  | "codabar";

export type BarcodeRotation = 0 | 90 | 180 | 270;

export type BarcodeOptions = {
  format: BarcodeFormat;
  value: string;
  width: number;
  height: number;
  displayValue: boolean;
  font: string;
  rotation: BarcodeRotation;
};

export const BARCODE_FORMATS: {
  value: BarcodeFormat;
  label: string;
  hint: string;
  example: string;
}[] = [
  {
    value: "CODE128",
    label: "Code 128",
    hint: "Alfanumérico universal — ideal para uso geral",
    example: "DEVKIT-128",
  },
  {
    value: "CODE39",
    label: "Code 39",
    hint: "Letras, números e alguns símbolos (-.$/+%)",
    example: "CODE39",
  },
  {
    value: "EAN13",
    label: "EAN-13",
    hint: "13 dígitos (produto varejo). Digite 12 e o DV é calculado",
    example: "789123456789",
  },
  {
    value: "EAN8",
    label: "EAN-8",
    hint: "8 dígitos. Digite 7 e o DV é calculado",
    example: "9638507",
  },
  {
    value: "EAN5",
    label: "UPC Extension 5 Digits",
    hint: "Extensão de 5 dígitos (preço / livros)",
    example: "54495",
  },
  {
    value: "EAN2",
    label: "UPC Extension 2 Digits",
    hint: "Extensão de 2 dígitos (edições de revistas)",
    example: "53",
  },
  {
    value: "UPC",
    label: "UPC-A",
    hint: "12 dígitos. Digite 11 e o DV é calculado",
    example: "04210000526",
  },
  {
    value: "UPCE",
    label: "UPC-E",
    hint: "Versão compacta do UPC (6–8 dígitos)",
    example: "0123456",
  },
  {
    value: "ITF14",
    label: "ITF-14",
    hint: "14 dígitos para caixas / logística",
    example: "15400141288763",
  },
  {
    value: "ITF",
    label: "Interleaved 2 of 5",
    hint: "Apenas dígitos (quantidade par)",
    example: "123456",
  },
  {
    value: "MSI",
    label: "MSI Plessey",
    hint: "Apenas dígitos — inventário / varejo",
    example: "1234567",
  },
  {
    value: "pharmacode",
    label: "Pharmacode",
    hint: "Código farmacêutico (números 3–131070)",
    example: "1234",
  },
  {
    value: "codabar",
    label: "Codabar",
    hint: "Inicia/termina com A–D; usado em bibliotecas e laboratórios",
    example: "A123456A",
  },
];

export const BARCODE_FONTS = [
  { value: "monospace", label: "Monospace" },
  { value: "Arial", label: "Arial" },
  { value: "sans-serif", label: "Sans-serif" },
] as const;

export const BARCODE_ROTATIONS: { value: BarcodeRotation; label: string }[] = [
  { value: 0, label: "0°" },
  { value: 90, label: "90°" },
  { value: 180, label: "180°" },
  { value: 270, label: "270°" },
];

export function getBarcodeFormatMeta(format: BarcodeFormat) {
  return BARCODE_FORMATS.find((item) => item.value === format)!;
}

export function sanitizeBarcodeFilename(value: string) {
  const cleaned = value.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/-+/g, "-");
  return (cleaned || "codigo-barras").slice(0, 40).toLowerCase();
}
