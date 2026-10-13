import assert from "node:assert/strict";
import test from "node:test";
import {
  groupByLocalDate,
  headingForDateKey,
  makeHistoryItem,
  markLocalHistoryUsed,
  mergeLocalHistory,
  toLocalDateKeyFromDate,
  usedFromLocalHistory,
} from "./local-history";

test("mergeLocalHistory prepends and keeps usedAt", () => {
  const older = {
    ...makeHistoryItem("a", "A", "2026-09-01T10:00:00.000Z"),
    usedAt: "2026-09-01T12:00:00.000Z",
  };
  const newer = makeHistoryItem("a", "A2", "2026-09-03T10:00:00.000Z");
  const extra = makeHistoryItem("b", "B", "2026-09-03T11:00:00.000Z");

  const merged = mergeLocalHistory([older], [newer, extra]);
  assert.equal(merged[0].id, "a");
  assert.equal(merged[0].usedAt, "2026-09-01T12:00:00.000Z");
  assert.equal(merged[1].id, "b");
});

test("markLocalHistoryUsed and usedFromLocalHistory", () => {
  const item = makeHistoryItem("x", "X", "2026-09-03T10:00:00.000Z");
  const used = markLocalHistoryUsed([], item, "2026-09-03T15:00:00.000Z");
  assert.equal(used[0].usedAt, "2026-09-03T15:00:00.000Z");
  assert.equal(usedFromLocalHistory(used).length, 1);
});

test("groupByLocalDate and headingForDateKey", () => {
  const a = makeHistoryItem("1", "1", "2026-09-03T08:00:00.000Z");
  const b = makeHistoryItem("2", "2", "2026-09-02T08:00:00.000Z");
  const groups = groupByLocalDate([a, b], (item) => item.createdAt);
  assert.ok(groups[0].dateKey >= groups[1].dateKey);

  const today = toLocalDateKeyFromDate(new Date());
  assert.equal(
    headingForDateKey(today, "pt-BR", { today: "Hoje", yesterday: "Ontem" }),
    "Hoje",
  );
});
