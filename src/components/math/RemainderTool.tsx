"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Input, Label } from "@/components/ui/form";
import { ResultBox } from "@/components/tools/ResultBox";
import { ToolShell } from "@/components/tools/ToolShell";
import { MathNav } from "@/components/math/MathNav";
import { useCopyFeedback } from "@/hooks/useCopyFeedback";
import { remainder } from "@/lib/math";

function parseNum(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export function RemainderTool() {
  const t = useTranslations("Resto");
  const { copied, copy } = useCopyFeedback();
  const [dividend, setDividend] = useState("17");
  const [divisor, setDivisor] = useState("5");

  const parsed = useMemo(() => {
    const a = parseNum(dividend);
    const b = parseNum(divisor);
    if (a === null || b === null) return { kind: "empty" as const };
    const out = remainder(a, b);
    if (!out) return { kind: "invalid" as const };
    return { kind: "ok" as const, ...out };
  }, [dividend, divisor]);

  const summary =
    parsed.kind === "ok"
      ? t("summary", {
          a: dividend.trim(),
          b: divisor.trim(),
          q: parsed.quotient,
          r: parsed.remainder,
        })
      : "";

  return (
    <ToolShell title={t("title")} description={t("description")} notice={t("notice")}>
      <MathNav currentHref="/resto" />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="dividend">{t("dividend")}</Label>
          <Input
            id="dividend"
            inputMode="decimal"
            value={dividend}
            onChange={(e) => setDividend(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="divisor">{t("divisor")}</Label>
          <Input
            id="divisor"
            inputMode="decimal"
            value={divisor}
            onChange={(e) => setDivisor(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      {parsed.kind === "invalid" && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{t("error")}</p>
      )}

      {parsed.kind === "ok" && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 dark:border-stone-800 dark:bg-stone-900">
            <p className="text-[11px] text-slate-400">{t("quotient")}</p>
            <p className="font-mono text-lg font-semibold text-slate-900 dark:text-white">
              {parsed.quotient}
            </p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900 dark:bg-amber-950/40">
            <p className="text-[11px] text-slate-400">{t("remainder")}</p>
            <p className="font-mono text-lg font-semibold text-slate-900 dark:text-white">
              {parsed.remainder}
            </p>
          </div>
        </div>
      )}

      {summary && (
        <ResultBox
          className="mt-4"
          label={t("result")}
          value={summary}
          copied={copied}
          onCopy={() => copy(summary)}
        />
      )}
    </ToolShell>
  );
}
