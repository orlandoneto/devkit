const IBAN_LENGTHS: Record<string, number> = {
  AD: 24,
  AE: 23,
  AL: 28,
  AT: 20,
  AZ: 28,
  BA: 20,
  BE: 16,
  BG: 22,
  BH: 22,
  BR: 29,
  BY: 28,
  CH: 21,
  CR: 22,
  CY: 28,
  CZ: 24,
  DE: 22,
  DK: 18,
  DO: 28,
  EE: 20,
  EG: 29,
  ES: 24,
  FI: 18,
  FO: 18,
  FR: 27,
  GB: 22,
  GE: 22,
  GI: 23,
  GL: 18,
  GR: 27,
  GT: 28,
  HR: 21,
  HU: 28,
  IE: 22,
  IL: 23,
  IQ: 23,
  IS: 26,
  IT: 27,
  JO: 30,
  KW: 30,
  KZ: 20,
  LB: 28,
  LC: 32,
  LI: 21,
  LT: 20,
  LU: 20,
  LV: 21,
  MC: 27,
  MD: 24,
  ME: 22,
  MK: 19,
  MR: 27,
  MT: 31,
  MU: 30,
  NL: 18,
  NO: 15,
  PK: 24,
  PL: 28,
  PS: 29,
  PT: 25,
  QA: 29,
  RO: 24,
  RS: 22,
  SA: 24,
  SC: 31,
  SE: 24,
  SI: 19,
  SK: 24,
  SM: 27,
  TN: 24,
  TR: 26,
  UA: 29,
  VA: 22,
  VG: 24,
  XK: 20,
};

export const IBAN_COUNTRIES = Object.keys(IBAN_LENGTHS).sort();

function onlyAlnum(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function mod97(value: string) {
  let remainder = 0;
  for (const char of value) {
    const code = char.charCodeAt(0);
    const piece =
      code >= 48 && code <= 57
        ? char
        : String(code - 55);
    remainder = Number(String(remainder) + piece) % 97;
  }
  return remainder;
}

export function formatIBAN(value: string) {
  const cleaned = onlyAlnum(value);
  return cleaned.replace(/(.{4})/g, "$1 ").trim();
}

export function validateIBAN(input: string) {
  const iban = onlyAlnum(input);
  const reasons: string[] = [];

  if (iban.length < 15) {
    reasons.push("IBAN is too short.");
    return { valid: false, iban, formatted: formatIBAN(iban), reasons };
  }

  const country = iban.slice(0, 2);
  const expected = IBAN_LENGTHS[country];
  if (!expected) {
    reasons.push(`Unknown country code: ${country}.`);
  } else if (iban.length !== expected) {
    reasons.push(
      `Expected ${expected} characters for ${country} (got ${iban.length}).`,
    );
  }

  const rearranged = iban.slice(4) + iban.slice(0, 4);
  if (!/^[A-Z0-9]+$/.test(iban) || mod97(rearranged) !== 1) {
    reasons.push("Checksum failed (mod 97).");
  }

  return {
    valid: reasons.length === 0,
    iban,
    formatted: formatIBAN(iban),
    country,
    reasons:
      reasons.length === 0 ? ["IBAN checksum and length are valid."] : reasons,
  };
}

function randomDigits(count: number) {
  return Array.from({ length: count }, () =>
    Math.floor(Math.random() * 10),
  ).join("");
}

function randomAlpha(count: number) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from({ length: count }, () =>
    alphabet[Math.floor(Math.random() * alphabet.length)],
  ).join("");
}

function buildBban(country: string, length: number) {
  // Simplified BBAN patterns sufficient for synthetic test data
  switch (country) {
    case "DE":
      return randomDigits(length);
    case "GB":
      return `${randomAlpha(4)}${randomDigits(length - 4)}`;
    case "FR":
    case "ES":
    case "IT":
    case "PT":
    case "NL":
    case "BE":
    case "CH":
      return randomDigits(length);
    default:
      return randomDigits(length);
  }
}

export function generateIBAN(country = "DE") {
  const code = country.toUpperCase();
  const total = IBAN_LENGTHS[code];
  if (!total) {
    throw new Error(`Unsupported IBAN country: ${code}`);
  }

  const bban = buildBban(code, total - 4);
  const checkInput = `${bban}${code}00`;
  const check = String(98 - mod97(checkInput)).padStart(2, "0");
  const iban = `${code}${check}${bban}`;

  return {
    iban,
    formatted: formatIBAN(iban),
    country: code,
    valid: true as const,
  };
}
