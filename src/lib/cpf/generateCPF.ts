import {
  calculateFirstDigit,
  calculateSecondDigit,
} from "./calculateDigit";
import { formatCPF, onlyDigits } from "./formatter";
import {
  type BrazilianUF,
  getRegionDigitForUF,
  getRegionFromCPF,
  pickUFForDigit,
  type RegionDigit,
} from "./region";

export type GenerateCPFOptions = {
  uf?: BrazilianUF | "random";
  mask?: boolean;
};

export type CPFResult = {
  cpf: string;
  formatted: string;
  uf: BrazilianUF;
  regionDigit: RegionDigit;
  regionLabel: string;
  valid: true;
  firstDigit: number;
  secondDigit: number;
  createdAt: string;
};

function randomDigit(): number {
  return Math.floor(Math.random() * 10);
}

function isAllSameDigits(digits: number[]): boolean {
  return digits.every((d) => d === digits[0]);
}

export function generateCPF(options: GenerateCPFOptions = {}): CPFResult {
  const ufOption = options.uf ?? "random";

  let uf: BrazilianUF;
  let regionDigit: RegionDigit;

  if (ufOption === "random") {
    regionDigit = Math.floor(Math.random() * 10) as RegionDigit;
    uf = pickUFForDigit(regionDigit);
  } else {
    uf = ufOption;
    regionDigit = getRegionDigitForUF(uf);
  }

  let base9: number[];

  do {
    base9 = Array.from({ length: 8 }, () => randomDigit());
    base9.push(regionDigit);
  } while (isAllSameDigits(base9));

  const firstDigit = calculateFirstDigit(base9);
  const secondDigit = calculateSecondDigit([...base9, firstDigit]);
  const digits = [...base9, firstDigit, secondDigit].join("");
  const region = getRegionFromCPF(digits)!;

  return {
    cpf: digits,
    formatted: formatCPF(digits),
    uf,
    regionDigit,
    regionLabel: region.label,
    valid: true,
    firstDigit,
    secondDigit,
    createdAt: new Date().toISOString(),
  };
}

export function generateManyCPF(
  quantity: number,
  options: GenerateCPFOptions = {},
): CPFResult[] {
  const safeQuantity = Math.min(Math.max(1, quantity), 1000);
  const results: CPFResult[] = [];
  const seen = new Set<string>();

  while (results.length < safeQuantity) {
    const item = generateCPF(options);
    if (seen.has(item.cpf)) continue;
    seen.add(item.cpf);
    results.push(item);
  }

  return results;
}

export function displayCPF(result: CPFResult, mask: boolean): string {
  return mask ? result.formatted : result.cpf;
}

export function fromDigits(digits: string): CPFResult | null {
  const clean = onlyDigits(digits);
  if (clean.length !== 11) return null;

  const nums = clean.split("").map(Number);
  const firstDigit = calculateFirstDigit(nums.slice(0, 9));
  const secondDigit = calculateSecondDigit(nums.slice(0, 10));
  if (firstDigit !== nums[9] || secondDigit !== nums[10]) return null;

  const region = getRegionFromCPF(clean);
  if (!region) return null;

  return {
    cpf: clean,
    formatted: formatCPF(clean),
    uf: region.ufs[0],
    regionDigit: region.digit,
    regionLabel: region.label,
    valid: true,
    firstDigit,
    secondDigit,
    createdAt: new Date().toISOString(),
  };
}
