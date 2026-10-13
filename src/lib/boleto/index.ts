export type DigitableLineType = "boleto-bancario" | "arrecadacao";

export type DigitableLineConversion =
  | {
      success: true;
      input: string;
      normalized: string;
      barcode: string;
      type: DigitableLineType;
      typeLabel: string;
    }
  | {
      success: false;
      input: string;
      normalized: string;
      error: string;
    };

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function modulo10(value: string) {
  let sum = 0;
  let multiplier = 2;

  for (let index = value.length - 1; index >= 0; index -= 1) {
    const product = Number(value[index]) * multiplier;
    sum += product > 9 ? product - 9 : product;
    multiplier = multiplier === 2 ? 1 : 2;
  }

  return (10 - (sum % 10)) % 10;
}

function weightedModulo11(value: string) {
  let sum = 0;
  let weight = 2;

  for (let index = value.length - 1; index >= 0; index -= 1) {
    sum += Number(value[index]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }

  return sum % 11;
}

function bankBarcodeDigit(valueWithoutDigit: string) {
  const digit = 11 - weightedModulo11(valueWithoutDigit);
  return digit === 0 || digit === 10 || digit === 11 ? 1 : digit;
}

function collectionDigit(value: string) {
  const remainder = weightedModulo11(value);
  if (remainder === 0 || remainder === 1) return 0;
  if (remainder === 10) return 1;
  return 11 - remainder;
}

function invalid(
  input: string,
  normalized: string,
  error: string,
): DigitableLineConversion {
  return { success: false, input, normalized, error };
}

function convertBankLine(
  input: string,
  digits: string,
): DigitableLineConversion {
  const fields = [
    { value: digits.slice(0, 9), digit: Number(digits[9]), label: "1" },
    { value: digits.slice(10, 20), digit: Number(digits[20]), label: "2" },
    { value: digits.slice(21, 31), digit: Number(digits[31]), label: "3" },
  ];

  for (const field of fields) {
    if (modulo10(field.value) !== field.digit) {
      return invalid(
        input,
        digits,
        `Dígito verificador do campo ${field.label} é inválido.`,
      );
    }
  }

  const barcode =
    digits.slice(0, 4) +
    digits[32] +
    digits.slice(33, 47) +
    digits.slice(4, 9) +
    digits.slice(10, 20) +
    digits.slice(21, 31);

  const generalDigit = Number(barcode[4]);
  const withoutGeneralDigit = barcode.slice(0, 4) + barcode.slice(5);
  if (bankBarcodeDigit(withoutGeneralDigit) !== generalDigit) {
    return invalid(
      input,
      digits,
      "Dígito verificador geral do boleto é inválido.",
    );
  }

  return {
    success: true,
    input,
    normalized: digits,
    barcode,
    type: "boleto-bancario",
    typeLabel: "Boleto bancário",
  };
}

function convertCollectionLine(
  input: string,
  digits: string,
): DigitableLineConversion {
  if (digits[0] !== "8") {
    return invalid(
      input,
      digits,
      "Linha de 48 dígitos deve começar com 8.",
    );
  }

  const reference = Number(digits[2]);
  if (![6, 7, 8, 9].includes(reference)) {
    return invalid(
      input,
      digits,
      "Identificador de valor efetivo/referência inválido.",
    );
  }

  const useModulo10 = reference === 6 || reference === 7;
  const barcodeParts: string[] = [];

  for (let block = 0; block < 4; block += 1) {
    const start = block * 12;
    const value = digits.slice(start, start + 11);
    const informedDigit = Number(digits[start + 11]);
    const expectedDigit = useModulo10
      ? modulo10(value)
      : collectionDigit(value);

    if (expectedDigit !== informedDigit) {
      return invalid(
        input,
        digits,
        `Dígito verificador do bloco ${block + 1} é inválido.`,
      );
    }

    barcodeParts.push(value);
  }

  const barcode = barcodeParts.join("");
  const generalDigit = Number(barcode[3]);
  const withoutGeneralDigit = barcode.slice(0, 3) + barcode.slice(4);
  const expectedGeneralDigit = useModulo10
    ? modulo10(withoutGeneralDigit)
    : collectionDigit(withoutGeneralDigit);

  if (expectedGeneralDigit !== generalDigit) {
    return invalid(
      input,
      digits,
      "Dígito verificador geral da linha de arrecadação é inválido.",
    );
  }

  return {
    success: true,
    input,
    normalized: digits,
    barcode,
    type: "arrecadacao",
    typeLabel: "Arrecadação / concessionária",
  };
}

export function convertDigitableLine(input: string): DigitableLineConversion {
  const trimmed = input.trim();
  const digits = onlyDigits(trimmed);

  if (!trimmed) {
    return invalid(input, digits, "Informe uma linha digitável.");
  }

  if (/[^\d.\s\-/]/.test(trimmed)) {
    return invalid(
      input,
      digits,
      "Use somente números e separadores comuns (espaço, ponto, hífen ou barra).",
    );
  }

  if (digits.length === 47) {
    return convertBankLine(input, digits);
  }

  if (digits.length === 48) {
    return convertCollectionLine(input, digits);
  }

  return invalid(
    input,
    digits,
    `A linha deve ter 47 ou 48 dígitos (recebido: ${digits.length}).`,
  );
}
