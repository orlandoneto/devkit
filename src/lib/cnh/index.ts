/** CNH (registro) com 11 dígitos e DV matemáticos — só para testes. */

function isAllSame(digits: number[]) {
  return digits.every((d) => d === digits[0]);
}

export function calculateCNHDigits(base9: number[]) {
  let sum1 = 0;
  for (let i = 0, w = 9; i < 9; i++, w--) sum1 += base9[i] * w;
  let dsc = 0;
  let dv1 = sum1 % 11;
  if (dv1 >= 10) {
    dv1 = 0;
    dsc = 2;
  }

  let sum2 = 0;
  for (let i = 0, w = 1; i < 9; i++, w++) sum2 += base9[i] * w;
  let dv2 = (sum2 % 11) - dsc;
  if (dv2 < 0) dv2 += 11;
  if (dv2 >= 10) dv2 = 0;

  return { dv1, dv2 };
}

export function formatCNH(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
}

export function validateCNH(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) {
    return { valid: false as const, reasons: ["CNH deve ter 11 dígitos"] };
  }
  const nums = digits.split("").map(Number);
  if (isAllSame(nums)) {
    return { valid: false as const, reasons: ["Sequência inválida"] };
  }
  const { dv1, dv2 } = calculateCNHDigits(nums.slice(0, 9));
  if (dv1 !== nums[9] || dv2 !== nums[10]) {
    return { valid: false as const, reasons: ["Dígitos verificadores inválidos"] };
  }
  return {
    valid: true as const,
    cnh: digits,
    formatted: formatCNH(digits),
    reasons: ["CNH matematicamente válida"],
  };
}

export function generateCNH(mask = true) {
  let base9: number[];
  do {
    base9 = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  } while (isAllSame(base9));

  const { dv1, dv2 } = calculateCNHDigits(base9);
  const raw = `${base9.join("")}${dv1}${dv2}`;
  return {
    cnh: raw,
    formatted: formatCNH(raw),
    display: mask ? formatCNH(raw) : raw,
    valid: true as const,
  };
}
