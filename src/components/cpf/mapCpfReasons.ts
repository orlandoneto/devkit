type Translate = {
  (key: string, values?: Record<string, string | number>): string;
};

/** Map Portuguese reason strings from validateCPF() to locale messages. */
export function mapCpfReason(reason: string, t: Translate): string {
  if (reason === "Informe um CPF.") return t("reasons.empty");
  if (reason === "Sequências com todos os dígitos iguais são inválidas.") {
    return t("reasons.repeated");
  }
  if (reason === "CPF matematicamente válido.") return t("reasons.valid");

  const length = reason.match(
    /^CPF deve ter 11 dígitos \(recebido: (\d+)\)\.$/,
  );
  if (length) return t("reasons.length", { count: length[1] });

  const first = reason.match(
    /^Primeiro dígito verificador inválido \(esperado (\d+), recebido (\d+)\)\.$/,
  );
  if (first) {
    return t("reasons.firstDigit", {
      expected: first[1],
      actual: first[2],
    });
  }

  const second = reason.match(
    /^Segundo dígito verificador inválido \(esperado (\d+), recebido (\d+)\)\.$/,
  );
  if (second) {
    return t("reasons.secondDigit", {
      expected: second[1],
      actual: second[2],
    });
  }

  return reason;
}
