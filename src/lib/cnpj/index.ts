function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function calcDigit(digits: number[], weights: number[]) {
  const sum = digits.reduce((acc, digit, i) => acc + digit * weights[i], 0);
  const rem = sum % 11;
  return rem < 2 ? 0 : 11 - rem;
}

const WEIGHTS1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const WEIGHTS2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

export function formatCNPJ(value: string) {
  const d = onlyDigits(value).slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  }
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function generateCNPJ(mask = true) {
  const base = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10));
  // filial 0001 — padrão comum em geradores de teste
  const branch = [0, 0, 0, 1];
  const twelve = [...base, ...branch];
  const d1 = calcDigit(twelve, WEIGHTS1);
  const d2 = calcDigit([...twelve, d1], WEIGHTS2);
  const digits = [...twelve, d1, d2].join("");
  return {
    cnpj: digits,
    formatted: formatCNPJ(digits),
    display: mask ? formatCNPJ(digits) : digits,
    valid: true as const,
  };
}

export function validateCNPJ(input: string) {
  const digits = onlyDigits(input);
  const reasons: string[] = [];

  if (digits.length !== 14) {
    reasons.push(`CNPJ deve ter 14 dígitos (recebido: ${digits.length}).`);
  }

  if (/^(\d)\1+$/.test(digits)) {
    reasons.push("Sequências com todos os dígitos iguais são inválidas.");
  }

  if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) {
    return {
      valid: false,
      digits,
      formatted: formatCNPJ(digits),
      reasons,
    };
  }

  const nums = digits.split("").map(Number);
  const d1 = calcDigit(nums.slice(0, 12), WEIGHTS1);
  const d2 = calcDigit(nums.slice(0, 13), WEIGHTS2);

  if (d1 !== nums[12] || d2 !== nums[13]) {
    reasons.push("Dígitos verificadores inválidos.");
  }

  return {
    valid: reasons.length === 0,
    digits,
    formatted: formatCNPJ(digits),
    reasons:
      reasons.length === 0
        ? ["CNPJ matematicamente válido."]
        : reasons,
    firstDigit: nums[12],
    secondDigit: nums[13],
    expectedFirstDigit: d1,
    expectedSecondDigit: d2,
  };
}
