function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatSSN(value: string) {
  const d = onlyDigits(value).slice(0, 9);
  if (d.length <= 3) return d;
  if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
}

function isInvalidArea(area: number) {
  return area === 0 || area === 666 || area >= 900;
}

export function validateSSN(input: string) {
  const digits = onlyDigits(input);
  const reasons: string[] = [];

  if (digits.length !== 9) {
    reasons.push(`SSN must have 9 digits (got ${digits.length}).`);
  }

  if (/^(\d)\1+$/.test(digits)) {
    reasons.push("Repeated digit sequences are invalid.");
  }

  if (digits.length === 9) {
    const area = Number(digits.slice(0, 3));
    const group = Number(digits.slice(3, 5));
    const serial = Number(digits.slice(5, 9));

    if (isInvalidArea(area)) {
      reasons.push("Area number cannot be 000, 666, or 900–999.");
    }
    if (group === 0) reasons.push("Group number cannot be 00.");
    if (serial === 0) reasons.push("Serial number cannot be 0000.");
  }

  return {
    valid: reasons.length === 0 && digits.length === 9,
    digits,
    formatted: formatSSN(digits),
    reasons:
      reasons.length === 0
        ? ["SSN format is valid for testing (not a real identity check)."]
        : reasons,
  };
}

export function generateSSN(mask = true) {
  let area = 0;
  while (isInvalidArea(area)) {
    area = Math.floor(Math.random() * 899) + 1;
  }
  const group = Math.floor(Math.random() * 99) + 1;
  const serial = Math.floor(Math.random() * 9999) + 1;
  const digits = `${String(area).padStart(3, "0")}${String(group).padStart(2, "0")}${String(serial).padStart(4, "0")}`;

  return {
    ssn: digits,
    formatted: formatSSN(digits),
    display: mask ? formatSSN(digits) : digits,
    valid: true as const,
  };
}
