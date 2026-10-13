import type { LucideIcon } from "lucide-react";
import {
  Barcode,
  Binary,
  BookOpen,
  Braces,
  Building2,
  Calculator,
  Clock,
  Divide,
  FileImage,
  FileKey2,
  FileText,
  Fingerprint,
  Globe2,
  Hash,
  IdCard,
  Landmark,
  Image,
  KeyRound,
  Link2,
  Mail,
  QrCode,
  Sigma,
  ScanText,
  ShieldCheck,
  Terminal,
  UserRound,
} from "lucide-react";
import { ALL_TOOLS, TOOL_GROUPS, type ToolLink } from "@/lib/tools";

const TOOL_ICONS: Record<string, LucideIcon> = {
  pessoa: UserRound,
  cpf: IdCard,
  cnpj: Building2,
  rg: Fingerprint,
  uuid: Hash,
  senha: KeyRound,
  email: Mail,
  cpfValidar: ShieldCheck,
  cnpjValidar: ShieldCheck,
  codigoBarras: Barcode,
  linhaDigitavel: Barcode,
  ocr: ScanText,
  qrCode: QrCode,
  qrDinamico: Link2,
  iban: Globe2,
  ssn: FileText,
  vat: FileText,
  metadados: FileImage,
  curl: Terminal,
  json: Braces,
  base64: Binary,
  jwt: FileKey2,
  pomodoro: Clock,
  httpStatus: BookOpen,
  romanos: Landmark,
  fatorar: Sigma,
  mdc: Calculator,
  mmc: Calculator,
  regra3: Divide,
  resto: Divide,
};

const GROUP_ICONS: Record<string, LucideIcon> = {
  documentos: FileText,
  codigos: QrCode,
  internacional: Globe2,
  seguranca: ShieldCheck,
  produtividade: Clock,
  matematica: Calculator,
};

/** Atalhos em destaque na home (launcher). */
export const HOME_SHORTCUT_HREFS = [
  "/cpf",
  "/cnpj",
  "/ocr",
  "/http-status",
  "/base64",
  "/pomodoro",
] as const;

export function getToolIcon(toolId: string): LucideIcon {
  return TOOL_ICONS[toolId] ?? Image;
}

export function getGroupIcon(groupId: string): LucideIcon {
  return GROUP_ICONS[groupId] ?? Image;
}

export function findToolByHref(href: string): ToolLink | undefined {
  return ALL_TOOLS.find((tool) => tool.href === href);
}

export function findGroupIdForTool(href: string): string | undefined {
  return TOOL_GROUPS.find((group) =>
    group.tools.some((tool) => tool.href === href),
  )?.id;
}

export function getHomeShortcuts(): ToolLink[] {
  return HOME_SHORTCUT_HREFS.map((href) => findToolByHref(href)).filter(
    (tool): tool is ToolLink => Boolean(tool),
  );
}
