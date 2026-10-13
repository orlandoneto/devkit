import { onlyDigits } from "./formatter";
import type { CPFResult } from "./generateCPF";

export const CPF_HISTORY_LIMIT = 100;

export type CPFHistoryItem = CPFResult & {
  usedAt?: string;
};

export function toLocalDateKeyFromDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function toLocalDateKey(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "invalid";
  return toLocalDateKeyFromDate(date);
}

function dedupeByCpfKeepFirst(items: CPFHistoryItem[]): CPFHistoryItem[] {
  return items.filter(
    (item, index, arr) => arr.findIndex((x) => x.cpf === item.cpf) === index,
  );
}

export function mergeGenerated(
  history: CPFHistoryItem[],
  items: CPFResult[],
  limit = CPF_HISTORY_LIMIT,
): CPFHistoryItem[] {
  const incoming: CPFHistoryItem[] = items.map((item) => {
    const previous = history.find((x) => x.cpf === item.cpf);
    return previous?.usedAt ? { ...item, usedAt: previous.usedAt } : { ...item };
  });

  return dedupeByCpfKeepFirst([...incoming, ...history]).slice(0, limit);
}

export function markCpfUsed(
  history: CPFHistoryItem[],
  item: CPFResult,
  usedAt = new Date().toISOString(),
  limit = CPF_HISTORY_LIMIT,
): CPFHistoryItem[] {
  const digits = onlyDigits(item.cpf);
  const idx = history.findIndex((x) => x.cpf === digits);

  if (idx >= 0) {
    const next = [...history];
    next[idx] = { ...next[idx], usedAt };
    return next;
  }

  return [{ ...item, cpf: digits, usedAt }, ...history].slice(0, limit);
}

export function usedFromHistory(history: CPFHistoryItem[]): CPFHistoryItem[] {
  return history
    .filter((item): item is CPFHistoryItem & { usedAt: string } =>
      Boolean(item.usedAt),
    )
    .sort((a, b) => b.usedAt.localeCompare(a.usedAt));
}

export function groupByLocalDate<T>(
  items: T[],
  getIso: (item: T) => string,
): { dateKey: string; items: T[] }[] {
  const map = new Map<string, T[]>();

  for (const item of items) {
    const key = toLocalDateKey(getIso(item));
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }

  return [...map.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([dateKey, grouped]) => ({ dateKey, items: grouped }));
}

export function headingForDateKey(
  dateKey: string,
  locale: string,
  labels: { today: string; yesterday: string },
): string {
  const today = toLocalDateKeyFromDate(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = toLocalDateKeyFromDate(yesterdayDate);

  if (dateKey === today) return labels.today;
  if (dateKey === yesterday) return labels.yesterday;

  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return dateKey;

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export function formatHistoryTime(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Data + hora ao lado do CPF no histórico (ex.: 09/09/2026, 17:28). */
export function formatHistoryDateTime(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
