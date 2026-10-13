import { explainDigits } from "./calculateDigit";
import { formatCPF, onlyDigits } from "./formatter";
import { getRegionFromCPF } from "./region";

export type ValidateCPFResult = {
  input: string;
  digits: string;
  formatted: string;
  valid: boolean;
  reasons: string[];
  firstDigit?: number;
  secondDigit?: number;
  expectedFirstDigit?: number;
  expectedSecondDigit?: number;
  regionDigit?: number;
  regionLabel?: string;
  ufCandidates?: string[];
};

const INVALID_KNOWN = new Set(
  Array.from({ length: 10 }, (_, i) => String(i).repeat(11)),
);

export function validateCPF(input: string): ValidateCPFResult {
  const digits = onlyDigits(input);
  const reasons: string[] = [];

  if (!digits) {
    return {
      input,
      digits: "",
      formatted: "",
      valid: false,
      reasons: ["Informe um CPF."],
    };
  }

  if (digits.length !== 11) {
    reasons.push(`CPF deve ter 11 dígitos (recebido: ${digits.length}).`);
  }

  if (INVALID_KNOWN.has(digits)) {
    reasons.push("Sequências com todos os dígitos iguais são inválidas.");
  }

  if (digits.length !== 11 || INVALID_KNOWN.has(digits)) {
    return {
      input,
      digits,
      formatted: formatCPF(digits),
      valid: false,
      reasons,
    };
  }

  const explanation = explainDigits(digits)!;
  if (!explanation.first.valid) {
    reasons.push(
      `Primeiro dígito verificador inválido (esperado ${explanation.first.expected}, recebido ${explanation.first.actual}).`,
    );
  }
  if (!explanation.second.valid) {
    reasons.push(
      `Segundo dígito verificador inválido (esperado ${explanation.second.expected}, recebido ${explanation.second.actual}).`,
    );
  }

  const region = getRegionFromCPF(digits);
  const valid = reasons.length === 0;

  return {
    input,
    digits,
    formatted: formatCPF(digits),
    valid,
    reasons: valid ? ["CPF matematicamente válido."] : reasons,
    firstDigit: explanation.first.actual,
    secondDigit: explanation.second.actual,
    expectedFirstDigit: explanation.first.expected,
    expectedSecondDigit: explanation.second.expected,
    regionDigit: region?.digit,
    regionLabel: region?.label,
    ufCandidates: region?.ufs,
  };
}

export function isValidCPF(input: string): boolean {
  return validateCPF(input).valid;
}
