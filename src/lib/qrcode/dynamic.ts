import { absoluteUrl } from "@/lib/site";

export type DynamicQRStatus = "ativo" | "pausado" | "expirado";

export type DynamicQRItem = {
  id: string;
  name: string;
  destination: string;
  status: Exclude<DynamicQRStatus, "expirado">;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  scans: number;
};

export const DYNAMIC_QR_STATUS_LABELS: Record<DynamicQRStatus, string> = {
  ativo: "Ativo",
  pausado: "Pausado",
  expirado: "Expirado",
};

function toBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function createDynamicQRId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}

export function resolveDynamicQRStatus(
  item: Pick<DynamicQRItem, "status" | "expiresAt">,
  now = Date.now(),
): DynamicQRStatus {
  if (item.status === "pausado") return "pausado";
  if (item.expiresAt) {
    const exp = Date.parse(item.expiresAt);
    if (!Number.isNaN(exp) && exp <= now) return "expirado";
  }
  return "ativo";
}

export function buildDynamicQRTarget(item: DynamicQRItem) {
  const status = resolveDynamicQRStatus(item);
  const params = new URLSearchParams({
    t: toBase64Url(item.destination.trim()),
    s: status === "expirado" ? "expirado" : item.status,
  });
  if (item.expiresAt) params.set("e", item.expiresAt);
  return absoluteUrl(`/q/${item.id}?${params.toString()}`);
}

export function parseDynamicQRParams(searchParams: URLSearchParams) {
  const encoded = searchParams.get("t") || "";
  const statusParam = searchParams.get("s") || "ativo";
  const expiresAt = searchParams.get("e");

  let destination = "";
  try {
    destination = encoded ? fromBase64Url(encoded) : "";
  } catch {
    destination = "";
  }

  const status: DynamicQRStatus =
    statusParam === "pausado" || statusParam === "expirado"
      ? statusParam
      : "ativo";

  const effective = resolveDynamicQRStatus(
    {
      status: status === "pausado" ? "pausado" : "ativo",
      expiresAt,
    },
  );

  return {
    destination,
    status: effective,
    expiresAt,
  };
}

export function normalizeDestination(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^[a-z][a-z\d+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
