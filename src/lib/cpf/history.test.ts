import assert from "node:assert/strict";
import test from "node:test";
import type { CPFResult } from "./generateCPF";
import {
  formatHistoryDateTime,
  groupByLocalDate,
  headingForDateKey,
  markCpfUsed,
  mergeGenerated,
  toLocalDateKeyFromDate,
  usedFromHistory,
} from "./history";

function fakeCpf(digits: string, createdAt: string): CPFResult {
  return {
    cpf: digits,
    formatted: digits,
    uf: "SP",
    regionDigit: 8,
    regionLabel: "SP",
    valid: true,
    firstDigit: 0,
    secondDigit: 0,
    createdAt,
  };
}

test("mergeGenerated prepends and keeps usedAt of existing CPF", () => {
  const older = {
    ...fakeCpf("11111111111", "2026-09-01T10:00:00.000Z"),
    usedAt: "2026-09-01T12:00:00.000Z",
  };
  const newer = fakeCpf("11111111111", "2026-09-03T10:00:00.000Z");
  const extra = fakeCpf("22222222222", "2026-09-03T11:00:00.000Z");

  const merged = mergeGenerated([older], [newer, extra]);

  assert.equal(merged[0].cpf, "11111111111");
  assert.equal(merged[0].usedAt, "2026-09-01T12:00:00.000Z");
  assert.equal(merged[1].cpf, "22222222222");
  assert.equal(merged.length, 2);
});

test("markCpfUsed stamps usedAt and inserts if missing", () => {
  const generated = fakeCpf("33333333333", "2026-09-03T10:00:00.000Z");
  const usedAt = "2026-09-03T15:00:00.000Z";

  const inserted = markCpfUsed([], generated, usedAt);
  assert.equal(inserted[0].usedAt, usedAt);

  const updated = markCpfUsed(inserted, generated, "2026-09-03T16:00:00.000Z");
  assert.equal(updated.length, 1);
  assert.equal(updated[0].usedAt, "2026-09-03T16:00:00.000Z");
});

test("groupByLocalDate and usedFromHistory order by date", () => {
  const a = fakeCpf("44444444444", "2026-09-03T08:00:00.000Z");
  const b = {
    ...fakeCpf("55555555555", "2026-09-02T08:00:00.000Z"),
    usedAt: "2026-09-03T09:00:00.000Z",
  };

  const groups = groupByLocalDate([a, b], (item) => item.createdAt);
  assert.ok(groups[0].dateKey >= groups[1].dateKey);

  const used = usedFromHistory([a, b]);
  assert.equal(used.length, 1);
  assert.equal(used[0].cpf, "55555555555");
});

test("headingForDateKey uses today and yesterday labels", () => {
  const today = toLocalDateKeyFromDate(new Date());
  const heading = headingForDateKey(today, "pt-BR", {
    today: "Hoje",
    yesterday: "Ontem",
  });
  assert.equal(heading, "Hoje");
});

test("formatHistoryDateTime includes day and time", () => {
  const formatted = formatHistoryDateTime("2026-09-09T20:28:00.000Z", "pt-BR");
  assert.match(formatted, /09/);
  assert.match(formatted, /09/);
  assert.match(formatted, /2026/);
  assert.ok(formatted.length > 8);
});
