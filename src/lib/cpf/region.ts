export type BrazilianUF =
  | "AC"
  | "AL"
  | "AM"
  | "AP"
  | "BA"
  | "CE"
  | "DF"
  | "ES"
  | "GO"
  | "MA"
  | "MG"
  | "MS"
  | "MT"
  | "PA"
  | "PB"
  | "PE"
  | "PI"
  | "PR"
  | "RJ"
  | "RN"
  | "RO"
  | "RR"
  | "RS"
  | "SC"
  | "SE"
  | "SP"
  | "TO";

export type RegionDigit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const UF_LIST: BrazilianUF[] = [
  "AC",
  "AL",
  "AM",
  "AP",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MG",
  "MS",
  "MT",
  "PA",
  "PB",
  "PE",
  "PI",
  "PR",
  "RJ",
  "RN",
  "RO",
  "RR",
  "RS",
  "SC",
  "SE",
  "SP",
  "TO",
];

export const UF_LABELS: Record<BrazilianUF, string> = {
  AC: "Acre",
  AL: "Alagoas",
  AM: "Amazonas",
  AP: "Amapá",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MG: "Minas Gerais",
  MS: "Mato Grosso do Sul",
  MT: "Mato Grosso",
  PA: "Pará",
  PB: "Paraíba",
  PE: "Pernambuco",
  PI: "Piauí",
  PR: "Paraná",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RO: "Rondônia",
  RR: "Roraima",
  RS: "Rio Grande do Sul",
  SC: "Santa Catarina",
  SE: "Sergipe",
  SP: "São Paulo",
  TO: "Tocantins",
};

/** Mapeamento histórico do 9º dígito (região fiscal de origem). */
export const REGION_BY_DIGIT: Record<
  RegionDigit,
  { digit: RegionDigit; ufs: BrazilianUF[]; label: string }
> = {
  0: { digit: 0, ufs: ["RS"], label: "Rio Grande do Sul" },
  1: {
    digit: 1,
    ufs: ["DF", "GO", "MS", "MT", "TO"],
    label: "DF, GO, MS, MT, TO",
  },
  2: {
    digit: 2,
    ufs: ["AC", "AM", "AP", "PA", "RO", "RR"],
    label: "AC, AM, AP, PA, RO, RR",
  },
  3: { digit: 3, ufs: ["CE", "MA", "PI"], label: "CE, MA, PI" },
  4: { digit: 4, ufs: ["AL", "PB", "PE", "RN"], label: "AL, PB, PE, RN" },
  5: { digit: 5, ufs: ["BA", "SE"], label: "BA, SE" },
  6: { digit: 6, ufs: ["MG"], label: "Minas Gerais" },
  7: { digit: 7, ufs: ["ES", "RJ"], label: "ES, RJ" },
  8: { digit: 8, ufs: ["SP"], label: "São Paulo" },
  9: { digit: 9, ufs: ["PR", "SC"], label: "PR, SC" },
};

export function getRegionDigitForUF(uf: BrazilianUF): RegionDigit {
  for (const [digit, info] of Object.entries(REGION_BY_DIGIT)) {
    if (info.ufs.includes(uf)) return Number(digit) as RegionDigit;
  }
  throw new Error(`UF inválida: ${uf}`);
}

export function getRegionFromDigit(digit: number) {
  if (digit < 0 || digit > 9) return null;
  return REGION_BY_DIGIT[digit as RegionDigit];
}

export function getRegionFromCPF(cpfDigits: string) {
  const digits = cpfDigits.replace(/\D/g, "");
  if (digits.length < 9) return null;
  return getRegionFromDigit(Number(digits[8]));
}

export function pickUFForDigit(digit: RegionDigit): BrazilianUF {
  const ufs = REGION_BY_DIGIT[digit].ufs;
  return ufs[Math.floor(Math.random() * ufs.length)];
}
