"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Input, Label } from "@/components/ui/form";
import { ResultBox } from "@/components/tools/ResultBox";
import { ToolShell } from "@/components/tools/ToolShell";
import { MathNav } from "@/components/math/MathNav";
import { useCopyFeedback } from "@/hooks/useCopyFeedback";
import { FACTOR_MAX, factorize, formatFactorization } from "@/lib/math";

export function FactorsTool() {
  const t = useTranslations("Fatorar");
  const { copied, copy } = useCopyFeedback();
  const [raw, setRaw] = useState("360");

  const parsed = useMemo(() => {
    const trimmed = raw.trim();
    if (!trimmed) return { kind: "empty" as const };
    if (!/^\d+$/.test(trimmed)) return { kind: "invalid" as const };
    const n = Number(trimmed);
    if (!Number.isInteger(n) || n < 1) return { kind: "invalid" as const };
    if (n > FACTOR_MAX) return { kind: "tooBig" as const };
    const fact = factorize(n);
    if (!fact) return { kind: "invalid" as const };
    return { kind: "ok" as const, fact };
  }, [raw]);

  const expression =
    parsed.kind === "ok"
      ? `${parsed.fact.n} = ${formatFactorization(parsed.fact.primes)}`
      : "";

  return (
    <ToolShell title={t("title")} description={t("description")} notice={t("notice")}>
      <MathNav currentHref="/fatorar" />

      <div className="mt-4">
        <Label htmlFor="n">{t("number")}</Label>
        <Input
          id="n"
          inputMode="numeric"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="360"
          className="mt-1"
        />
      </div>

      {parsed.kind === "invalid" && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{t("error")}</p>
      )}
      {parsed.kind === "tooBig" && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{t("tooBig")}</p>
      )}

      {parsed.kind === "ok" && (
        <>
          <ResultBox
            className="mt-4"
            label={t("primes")}
            value={expression}
            copied={copied}
            onCopy={() => copy(expression)}
          />
          <p className="mt-3 text-xs font-medium tracking-wide text-slate-400 uppercase">
            {t("divisors", { count: parsed.fact.divisors.length })}
          </p>
          <p className="mt-1 break-words font-mono text-sm text-slate-700 dark:text-slate-200">
            {parsed.fact.divisors.map(String).join(", ")}
          </p>
        </>
      )}
    </ToolShell>
  );
}
