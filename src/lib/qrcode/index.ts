export type QRContentType =
  | "text"
  | "url"
  | "wifi"
  | "email"
  | "phone"
  | "whatsapp";

export type QRErrorCorrection = "L" | "M" | "Q" | "H";

export const QR_CONTENT_TYPES: {
  value: QRContentType;
  label: string;
  description: string;
}[] = [
  {
    value: "text",
    label: "Texto",
    description: "Mensagem, código ou qualquer conteúdo livre",
  },
  {
    value: "url",
    label: "URL",
    description: "Link para site, página ou arquivo",
  },
  {
    value: "wifi",
    label: "Wi-Fi",
    description: "Conecta à rede ao escanear",
  },
  {
    value: "email",
    label: "E-mail",
    description: "Abre uma mensagem já preenchida",
  },
  {
    value: "phone",
    label: "Telefone",
    description: "Abre o discador com o número",
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
    description: "Abre conversa com mensagem opcional",
  },
];

export const QR_ERROR_LEVELS: {
  value: QRErrorCorrection;
  label: string;
  description: string;
}[] = [
  { value: "L", label: "Baixa (7%)", description: "Menor e mais simples" },
  { value: "M", label: "Média (15%)", description: "Boa opção padrão" },
  { value: "Q", label: "Alta (25%)", description: "Tolera mais danos" },
  { value: "H", label: "Máxima (30%)", description: "Ideal para impressão" },
];

export type QRPayloadInput = {
  type: QRContentType;
  text: string;
  url: string;
  ssid: string;
  wifiPassword: string;
  wifiEncryption: "WPA" | "WEP" | "nopass";
  wifiHidden: boolean;
  email: string;
  emailSubject: string;
  emailBody: string;
  phone: string;
  whatsappNumber: string;
  whatsappMessage: string;
};

function escapeWifi(value: string) {
  return value.replace(/([\\;,:"'])/g, "\\$1");
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed || /^[a-z][a-z\d+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function onlyPhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function buildQRPayload(input: QRPayloadInput): string {
  switch (input.type) {
    case "url":
      return normalizeUrl(input.url);

    case "wifi": {
      const security =
        input.wifiEncryption === "nopass" ? "nopass" : input.wifiEncryption;
      return [
        "WIFI:",
        `T:${security};`,
        `S:${escapeWifi(input.ssid)};`,
        security === "nopass"
          ? ""
          : `P:${escapeWifi(input.wifiPassword)};`,
        input.wifiHidden ? "H:true;" : "",
        ";",
      ].join("");
    }

    case "email": {
      const params = new URLSearchParams();
      if (input.emailSubject.trim()) {
        params.set("subject", input.emailSubject.trim());
      }
      if (input.emailBody.trim()) params.set("body", input.emailBody.trim());
      const query = params.toString();
      return `mailto:${input.email.trim()}${query ? `?${query}` : ""}`;
    }

    case "phone":
      return `tel:${input.phone.trim()}`;

    case "whatsapp": {
      const number = onlyPhoneDigits(input.whatsappNumber);
      const message = input.whatsappMessage.trim();
      return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
    }

    case "text":
    default:
      return input.text;
  }
}

export function sanitizeQRFilename(type: QRContentType) {
  return `qr-code-${type}`;
}
