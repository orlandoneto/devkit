export const ROMAN_MIN = 1;
export const ROMAN_MAX = 3999;
export const FACTOR_MAX = 1e12;

const ROMAN_TABLE: Array<[number, string]> = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

export function decimalToRoman(n: number): string | null {
  if (!Number.isInteger(n) || n < ROMAN_MIN || n > ROMAN_MAX) return null;
  let rest = n;
  let out = "";
  for (const [value, glyph] of ROMAN_TABLE) {
    while (rest >= value) {
      out += glyph;
      rest -= value;
    }
  }
  return out;
}

export function romanToDecimal(input: string): number | null {
  const raw = input.trim().toUpperCase().replace(/\s+/g, "");
  if (!raw || !/^[MDCLXVI]+$/.test(raw)) return null;

  const map: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  let total = 0;
  for (let i = 0; i < raw.length; i += 1) {
    const current = map[raw[i]!] ?? 0;
    const next = map[raw[i + 1]!] ?? 0;
    total += current < next ? -current : current;
  }

  if (total < ROMAN_MIN || total > ROMAN_MAX) return null;
  if (decimalToRoman(total) !== raw) return null;
  return total;
}

export function gcd2(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

export function gcdMany(values: number[]): number | null {
  const nums = values.filter((n) => n !== 0);
  if (nums.length === 0) return null;
  return nums.reduce((acc, n) => gcd2(acc, n));
}

export function lcm2(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a / gcd2(a, b)) * Math.abs(b);
}

export function lcmMany(values: number[]): number | null {
  const nums = values.filter((n) => n !== 0);
  if (nums.length === 0) return null;
  return nums.reduce((acc, n) => lcm2(acc, n));
}

/** Aceita "12, 18 24; 30". */
export function parsePositiveInts(input: string): number[] {
  return input
    .split(/[,;\s]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      if (!/^\d+$/.test(part)) return null;
      const n = Number(part);
      if (!Number.isInteger(n) || n <= 0 || !Number.isSafeInteger(n)) return null;
      return n;
    })
    .filter((n): n is number => n !== null);
}

export type Factorization = {
  n: number;
  primes: Array<{ prime: number; exp: number }>;
  divisors: number[];
};

export function factorize(n: number): Factorization | null {
  if (!Number.isInteger(n) || n < 1) return null;
  if (n === 1) {
    return { n, primes: [], divisors: [1] };
  }

  const primes: Array<{ prime: number; exp: number }> = [];
  let rest = n;

  const consume = (p: number) => {
    let exp = 0;
    while (rest % p === 0) {
      rest /= p;
      exp += 1;
    }
    if (exp > 0) primes.push({ prime: p, exp });
  };

  consume(2);
  for (let p = 3; p * p <= rest; p += 2) {
    consume(p);
  }
  if (rest > 1) primes.push({ prime: rest, exp: 1 });

  const divisors = [1];
  for (const { prime, exp } of primes) {
    const current = [...divisors];
    let pow = 1;
    for (let i = 1; i <= exp; i += 1) {
      pow *= prime;
      for (const d of current) divisors.push(d * pow);
    }
  }
  divisors.sort((a, b) => a - b);

  return { n, primes, divisors };
}

export function formatFactorization(parts: Array<{ prime: number; exp: number }>) {
  if (parts.length === 0) return "1";
  return parts
    .map(({ prime, exp }) => (exp === 1 ? `${prime}` : `${prime}^${exp}`))
    .join(" × ");
}

export function ruleOfThree(
  a: number,
  b: number,
  c: number,
  inverse = false,
): number | null {
  if (![a, b, c].every((n) => Number.isFinite(n))) return null;
  if (inverse) {
    if (c === 0) return null;
    return (a * b) / c;
  }
  if (a === 0) return null;
  return (b * c) / a;
}

export function remainder(dividend: number, divisor: number) {
  if (!Number.isFinite(dividend) || !Number.isFinite(divisor) || divisor === 0) {
    return null;
  }
  const q =
    dividend / divisor >= 0
      ? Math.floor(dividend / divisor)
      : Math.ceil(dividend / divisor);
  const r = dividend - q * divisor;
  return { quotient: q, remainder: r };
}
