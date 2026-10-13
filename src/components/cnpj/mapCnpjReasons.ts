type Translate = {
  (key: string, values?: Record<string, string | number>): string;
};

/** Map Portuguese reason strings from validateCNPJ() to locale messages. */
export function mapCnpjReason(reason: string, t: Translate): string {
  if (reason === "Sequências com todos os dígitos iguais são inválidas.") {
    return t("reasons.repeated");
  }
  if (reason === "Dígitos verificadores inválidos.") {
    return t("reasons.checkDigits");
  }
  if (reason === "CNPJ matematicamente válido.") return t("reasons.valid");

  const length = reason.match(
    /^CNPJ deve ter 14 dígitos \(recebido: (\d+)\)\.$/,
  );
  if (length) return t("reasons.length", { count: length[1] });

  return reason;
}
