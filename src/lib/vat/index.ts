export const VAT_COUNTRIES = [
  "AT",
  "BE",
  "BG",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "EL",
  "ES",
  "FI",
  "FR",
  "HR",
  "HU",
  "IE",
  "IT",
  "LT",
  "LU",
  "LV",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SE",
  "SI",
  "SK",
  "XI",
] as const;

export type VatCountry = (typeof VAT_COUNTRIES)[number];

const VAT_PATTERNS: Record<VatCountry, RegExp> = {
  AT: /^ATU\d{8}$/,
  BE: /^BE[01]\d{9}$/,
  BG: /^BG\d{9,10}$/,
  CY: /^CY\d{8}[A-Z]$/,
  CZ: /^CZ\d{8,10}$/,
  DE: /^DE\d{9}$/,
  DK: /^DK\d{8}$/,
  EE: /^EE\d{9}$/,
  EL: /^EL\d{9}$/,
  ES: /^ES[A-Z0-9]\d{7}[A-Z0-9]$/,
  FI: /^FI\d{8}$/,
  FR: /^FR[A-HJ-NP-Z0-9]{2}\d{9}$/,
  HR: /^HR\d{11}$/,
  HU: /^HU\d{8}$/,
  IE: /^IE\d[A-Z0-9+*]\d{5}[A-Z]{1,2}$/,
  IT: /^IT\d{11}$/,
  LT: /^LT(\d{9}|\d{12})$/,
  LU: /^LU\d{8}$/,
  LV: /^LV\d{11}$/,
  MT: /^MT\d{8}$/,
  NL: /^NL\d{9}B\d{2}$/,
  PL: /^PL\d{10}$/,
  PT: /^PT\d{9}$/,
  RO: /^RO\d{2,10}$/,
  SE: /^SE\d{12}$/,
  SI: /^SI\d{8}$/,
  SK: /^SK\d{10}$/,
  XI: /^XI\d{9}|\d{12}$/,
};

function normalizeVat(value: string) {
  return value.replace(/[\s.-]/g, "").toUpperCase();
}

function randomDigits(count: number) {
  return Array.from({ length: count }, () =>
    Math.floor(Math.random() * 10),
  ).join("");
}

export function validateVAT(input: string) {
  const vat = normalizeVat(input);
  const country = vat.slice(0, 2) as VatCountry;
  const reasons: string[] = [];

  if (!VAT_COUNTRIES.includes(country)) {
    reasons.push(`Unsupported or missing country prefix: ${country || "—"}.`);
    return { valid: false, vat, country: country || "", reasons };
  }

  if (!VAT_PATTERNS[country].test(vat)) {
    reasons.push(`Format does not match the ${country} VAT pattern.`);
  }

  return {
    valid: reasons.length === 0,
    vat,
    country,
    reasons:
      reasons.length === 0
        ? ["VAT format matches the country pattern (no official registry check)."]
        : reasons,
  };
}

export function generateVAT(country: VatCountry = "DE") {
  let vat = "";
  switch (country) {
    case "AT":
      vat = `ATU${randomDigits(8)}`;
      break;
    case "BE":
      vat = `BE0${randomDigits(9)}`;
      break;
    case "DE":
      vat = `DE${randomDigits(9)}`;
      break;
    case "ES":
      vat = `ES${randomDigits(8)}A`;
      break;
    case "FR":
      vat = `FR${randomDigits(2)}${randomDigits(9)}`;
      break;
    case "IT":
      vat = `IT${randomDigits(11)}`;
      break;
    case "NL":
      vat = `NL${randomDigits(9)}B${randomDigits(2)}`;
      break;
    case "PT":
      vat = `PT${randomDigits(9)}`;
      break;
    case "XI":
      vat = `XI${randomDigits(9)}`;
      break;
    default:
      vat = `${country}${randomDigits(8)}`;
      // Adjust until pattern matches when possible
      if (!VAT_PATTERNS[country].test(vat)) {
        vat = `${country}${randomDigits(9)}`;
      }
  }

  // Ensure generated value matches pattern; fallback loop
  let attempts = 0;
  while (!VAT_PATTERNS[country].test(vat) && attempts < 20) {
    if (country === "IE") vat = `IE${randomDigits(7)}A`;
    else if (country === "CY") vat = `CY${randomDigits(8)}A`;
    else vat = `${country}${randomDigits(9)}`;
    attempts += 1;
  }

  return {
    vat,
    country,
    valid: VAT_PATTERNS[country].test(vat),
  };
}
