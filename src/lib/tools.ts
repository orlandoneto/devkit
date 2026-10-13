export type ToolLink = {
  id: string;
  href: string;
  titleKey: string;
  descriptionKey: string;
};

export type ToolGroup = {
  id: string;
  labelKey: string;
  /** Emoji curto exibido no menu / home */
  icon: string;
  tools: ToolLink[];
};

export const TOOL_GROUPS: ToolGroup[] = [
  {
    id: "documentos",
    labelKey: "Groups.documentos",
    icon: "📄",
    tools: [
      {
        id: "pessoa",
        href: "/pessoa",
        titleKey: "Tools.pessoa.title",
        descriptionKey: "Tools.pessoa.description",
      },
      {
        id: "cpf",
        href: "/cpf",
        titleKey: "Tools.cpf.title",
        descriptionKey: "Tools.cpf.description",
      },
      {
        id: "cnpj",
        href: "/cnpj",
        titleKey: "Tools.cnpj.title",
        descriptionKey: "Tools.cnpj.description",
      },
      {
        id: "rg",
        href: "/rg",
        titleKey: "Tools.rg.title",
        descriptionKey: "Tools.rg.description",
      },
      {
        id: "uuid",
        href: "/uuid",
        titleKey: "Tools.uuid.title",
        descriptionKey: "Tools.uuid.description",
      },
      {
        id: "senha",
        href: "/senha",
        titleKey: "Tools.senha.title",
        descriptionKey: "Tools.senha.description",
      },
      {
        id: "email",
        href: "/email",
        titleKey: "Tools.email.title",
        descriptionKey: "Tools.email.description",
      },
      {
        id: "cpfValidar",
        href: "/cpf/validar",
        titleKey: "Tools.cpfValidar.title",
        descriptionKey: "Tools.cpfValidar.description",
      },
      {
        id: "cnpjValidar",
        href: "/cnpj/validar",
        titleKey: "Tools.cnpjValidar.title",
        descriptionKey: "Tools.cnpjValidar.description",
      },
    ],
  },
  {
    id: "codigos",
    labelKey: "Groups.codigos",
    icon: "▦",
    tools: [
      {
        id: "codigoBarras",
        href: "/codigo-barras",
        titleKey: "Tools.codigoBarras.title",
        descriptionKey: "Tools.codigoBarras.description",
      },
      {
        id: "linhaDigitavel",
        href: "/linha-digitavel",
        titleKey: "Tools.linhaDigitavel.title",
        descriptionKey: "Tools.linhaDigitavel.description",
      },
      {
        id: "ocr",
        href: "/ocr",
        titleKey: "Tools.ocr.title",
        descriptionKey: "Tools.ocr.description",
      },
      {
        id: "qrCode",
        href: "/qr-code",
        titleKey: "Tools.qrCode.title",
        descriptionKey: "Tools.qrCode.description",
      },
      {
        id: "qrDinamico",
        href: "/qr-code/dinamico",
        titleKey: "Tools.qrDinamico.title",
        descriptionKey: "Tools.qrDinamico.description",
      },
    ],
  },
  {
    id: "internacional",
    labelKey: "Groups.internacional",
    icon: "🌐",
    tools: [
      {
        id: "iban",
        href: "/iban",
        titleKey: "Tools.iban.title",
        descriptionKey: "Tools.iban.description",
      },
      {
        id: "ssn",
        href: "/ssn",
        titleKey: "Tools.ssn.title",
        descriptionKey: "Tools.ssn.description",
      },
      {
        id: "vat",
        href: "/vat",
        titleKey: "Tools.vat.title",
        descriptionKey: "Tools.vat.description",
      },
    ],
  },
  {
    id: "seguranca",
    labelKey: "Groups.seguranca",
    icon: "🔒",
    tools: [
      {
        id: "metadados",
        href: "/metadados",
        titleKey: "Tools.metadados.title",
        descriptionKey: "Tools.metadados.description",
      },
      {
        id: "curl",
        href: "/curl",
        titleKey: "Tools.curl.title",
        descriptionKey: "Tools.curl.description",
      },
      {
        id: "json",
        href: "/json",
        titleKey: "Tools.json.title",
        descriptionKey: "Tools.json.description",
      },
      {
        id: "base64",
        href: "/base64",
        titleKey: "Tools.base64.title",
        descriptionKey: "Tools.base64.description",
      },
      {
        id: "jwt",
        href: "/jwt",
        titleKey: "Tools.jwt.title",
        descriptionKey: "Tools.jwt.description",
      },
      {
        id: "httpStatus",
        href: "/http-status",
        titleKey: "Tools.httpStatus.title",
        descriptionKey: "Tools.httpStatus.description",
      },
    ],
  },
  {
    id: "produtividade",
    labelKey: "Groups.produtividade",
    icon: "⏱",
    tools: [
      {
        id: "pomodoro",
        href: "/pomodoro",
        titleKey: "Tools.pomodoro.title",
        descriptionKey: "Tools.pomodoro.description",
      },
    ],
  },
  {
    id: "matematica",
    labelKey: "Groups.matematica",
    icon: "∑",
    tools: [
      {
        id: "romanos",
        href: "/romanos",
        titleKey: "Tools.romanos.title",
        descriptionKey: "Tools.romanos.description",
      },
      {
        id: "fatorar",
        href: "/fatorar",
        titleKey: "Tools.fatorar.title",
        descriptionKey: "Tools.fatorar.description",
      },
      {
        id: "mdc",
        href: "/mdc",
        titleKey: "Tools.mdc.title",
        descriptionKey: "Tools.mdc.description",
      },
      {
        id: "mmc",
        href: "/mmc",
        titleKey: "Tools.mmc.title",
        descriptionKey: "Tools.mmc.description",
      },
      {
        id: "regra3",
        href: "/regra-de-3",
        titleKey: "Tools.regra3.title",
        descriptionKey: "Tools.regra3.description",
      },
      {
        id: "resto",
        href: "/resto",
        titleKey: "Tools.resto.title",
        descriptionKey: "Tools.resto.description",
      },
    ],
  },
];

export const ALL_TOOLS = TOOL_GROUPS.flatMap((group) => group.tools);
