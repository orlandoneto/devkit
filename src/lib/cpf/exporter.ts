import type { CPFResult } from "./generateCPF";
import { displayCPF } from "./generateCPF";

export function toTXT(items: CPFResult[], mask = true): string {
  return items.map((item) => displayCPF(item, mask)).join("\n");
}

export function toCSV(items: CPFResult[], mask = true): string {
  const header = "cpf,formatted,uf,region_digit,region_label,valid,created_at";
  const rows = items.map((item) =>
    [
      displayCPF(item, mask),
      item.formatted,
      item.uf,
      item.regionDigit,
      `"${item.regionLabel}"`,
      item.valid,
      item.createdAt,
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

export function toJSON(items: CPFResult[], mask = true, pretty = true): string {
  const payload = items.map((item) => ({
    cpf: displayCPF(item, mask),
    digits: item.cpf,
    formatted: item.formatted,
    uf: item.uf,
    regionDigit: item.regionDigit,
    regionLabel: item.regionLabel,
    valid: item.valid,
    createdAt: item.createdAt,
  }));

  return pretty ? JSON.stringify(payload, null, 2) : JSON.stringify(payload);
}

export type ExportFormat = "txt" | "csv" | "json";

export function exportCPF(
  items: CPFResult[],
  format: ExportFormat,
  mask = true,
): { content: string; mime: string; filename: string } {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

  switch (format) {
    case "csv":
      return {
        content: toCSV(items, mask),
        mime: "text/csv;charset=utf-8",
        filename: `cpfs-${stamp}.csv`,
      };
    case "json":
      return {
        content: toJSON(items, mask),
        mime: "application/json;charset=utf-8",
        filename: `cpfs-${stamp}.json`,
      };
    case "txt":
    default:
      return {
        content: toTXT(items, mask),
        mime: "text/plain;charset=utf-8",
        filename: `cpfs-${stamp}.txt`,
      };
  }
}
