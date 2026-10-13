/** Calcula um dígito verificador do CPF a partir dos pesos. */
export function calculateCheckDigit(digits: number[], weightStart: number): number {
  const sum = digits.reduce((acc, digit, index) => {
    return acc + digit * (weightStart - index);
  }, 0);

  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function calculateFirstDigit(base9: number[]): number {
  return calculateCheckDigit(base9, 10);
}

export function calculateSecondDigit(base10: number[]): number {
  return calculateCheckDigit(base10, 11);
}

export function explainDigits(cpfDigits: string) {
  const digits = cpfDigits.replace(/\D/g, "").split("").map(Number);
  if (digits.length !== 11) {
    return null;
  }

  const base9 = digits.slice(0, 9);
  const firstWeights = base9.map((d, i) => ({ digit: d, weight: 10 - i }));
  const firstSum = firstWeights.reduce((a, x) => a + x.digit * x.weight, 0);
  const firstRemainder = firstSum % 11;
  const firstExpected = firstRemainder < 2 ? 0 : 11 - firstRemainder;

  const base10 = [...base9, firstExpected];
  const secondWeights = base10.map((d, i) => ({ digit: d, weight: 11 - i }));
  const secondSum = secondWeights.reduce((a, x) => a + x.digit * x.weight, 0);
  const secondRemainder = secondSum % 11;
  const secondExpected = secondRemainder < 2 ? 0 : 11 - secondRemainder;

  return {
    first: {
      weights: firstWeights,
      sum: firstSum,
      remainder: firstRemainder,
      expected: firstExpected,
      actual: digits[9],
      valid: digits[9] === firstExpected,
    },
    second: {
      weights: secondWeights,
      sum: secondSum,
      remainder: secondRemainder,
      expected: secondExpected,
      actual: digits[10],
      valid: digits[10] === secondExpected,
    },
  };
}
