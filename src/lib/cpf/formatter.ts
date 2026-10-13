export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatCPF(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function maskCPF(value: string, masked: boolean): string {
  const digits = onlyDigits(value);
  return masked ? formatCPF(digits) : digits;
}

export const CPF_REGEX = {
  unmasked: /^\d{11}$/,
  masked: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  flexible: /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/,
} as const;

export const CPF_REGEX_SOURCE = {
  unmasked: String.raw`^\d{11}$`,
  masked: String.raw`^\d{3}\.\d{3}\.\d{3}-\d{2}$`,
  flexible: String.raw`^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$`,
} as const;
