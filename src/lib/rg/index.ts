/** RG fictício no formato comum SP (8 dígitos + DV 0-9 ou X). */

function calcRgDigit(base: number[]) {
  const sum = base.reduce((acc, digit, i) => acc + digit * (9 - i), 0);
  const rem = sum % 11;
  if (rem === 10) return "X";
  return String(rem);
}

export function formatRG(value: string) {
  const clean = value.replace(/[^\dXx]/g, "").toUpperCase().slice(0, 9);
  if (clean.length <= 2) return clean;
  if (clean.length <= 5) return `${clean.slice(0, 2)}.${clean.slice(2)}`;
  if (clean.length <= 8) {
    return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`;
  }
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}-${clean.slice(8)}`;
}

export function generateRG(mask = true) {
  const base = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10));
  const dv = calcRgDigit(base);
  const raw = `${base.join("")}${dv}`;
  return {
    rg: raw,
    formatted: formatRG(raw),
    display: mask ? formatRG(raw) : raw,
    valid: true as const,
    note: "Fictício para testes — não representa documento real",
  };
}
