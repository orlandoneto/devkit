"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Input, Label, Switch } from "@/components/ui/form";
import { ResultBox } from "@/components/tools/ResultBox";
import { ToolShell } from "@/components/tools/ToolShell";
import { MathNav } from "@/components/math/MathNav";
import { useCopyFeedback } from "@/hooks/useCopyFeedback";
import { ruleOfThree } from "@/lib/math";

function parseNum(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function formatResult(n: number) {
  if (Number.isInteger(n)) return String(n);
  return String(Math.round(n * 1e8) / 1e8);
}

export function RuleOfThreeTool() {
  const t = useTranslations("Regra3");
  const { copied, copy } = useCopyFeedback();
  const [a, setA] = useState("2");
  const [b, setB] = useState("10");
  const [c, setC] = useState("5");
  const [inverse, setInverse] = useState(false);

  const parsed = useMemo(() => {
    const na = parseNum(a);
    const nb = parseNum(b);
    const nc = parseNum(c);
    if (na === null || nb === null || nc === null) return { kind: "empty" as const };
    const x = ruleOfThree(na, nb, nc, inverse);
    if (x === null) return { kind: "invalid" as const };
    return { kind: "ok" as const, value: formatResult(x) };
  }, [a, b, c, inverse]);

  return (
    <ToolShell title={t("title")} description={t("description")} notice={t("notice")}>
      <MathNav currentHref="/regra-de-3" />

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 dark:border-stone-800 dark:bg-stone-900">
        <Label htmlFor="inverse" className="text-sm">
          {t("inverse")}
        </Label>
        <Switch id="inverse" checked={inverse} onCheckedChange={setInverse} />
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div>
          <Label htmlFor="a">{t("a")}</Label>
          <Input
            id="a"
            inputMode="decimal"
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="mt-1"
          />
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">{t("isTo")}</p>
        <div>
          <Label htmlFor="b">{t("b")}</Label>
          <Input
            id="b"
            inputMode="decimal"
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="c">{t("c")}</Label>
          <Input
            id="c"
            inputMode="decimal"
            value={c}
            onChange={(e) => setC(e.target.value)}
            className="mt-1"
          />
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">{t("isTo")}</p>
        <div>
          <Label>{t("x")}</Label>
          <div className="mt-1 flex h-10 items-center rounded-lg border border-amber-200 bg-amber-50 px-3 text-sm font-semibold text-slate-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-white">
            {parsed.kind === "ok" ? parsed.value : "—"}
          </div>
        </div>
      </div>

      {parsed.kind === "invalid" && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{t("error")}</p>
      )}

      {parsed.kind === "ok" && (
        <ResultBox
          className="mt-4"
          label={t("result")}
          value={parsed.value}
          copied={copied}
          onCopy={() => copy(parsed.value)}
        />
      )}
    </ToolShell>
  );
}
