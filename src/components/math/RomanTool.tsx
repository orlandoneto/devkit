"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeftRight } from "lucide-react";
import { Input, Label } from "@/components/ui/form";
import { ResultBox } from "@/components/tools/ResultBox";
import { ToolShell } from "@/components/tools/ToolShell";
import { MathNav } from "@/components/math/MathNav";
import { useCopyFeedback } from "@/hooks/useCopyFeedback";
import {
  decimalToRoman,
  romanToDecimal,
  ROMAN_MAX,
  ROMAN_MIN,
} from "@/lib/math";

export function RomanTool() {
  const t = useTranslations("Romanos");
  const { copied, copy } = useCopyFeedback();
  const [decimal, setDecimal] = useState("2026");
  const [roman, setRoman] = useState(() => decimalToRoman(2026) ?? "");
  const [error, setError] = useState<string | null>(null);

  function fromDecimal(value: string) {
    setDecimal(value);
    const trimmed = value.trim();
    if (!trimmed) {
      setRoman("");
      setError(null);
      return;
    }
    const n = Number(trimmed);
    const out = decimalToRoman(n);
    if (!out) {
      setError(t("errorDecimal", { min: ROMAN_MIN, max: ROMAN_MAX }));
      return;
    }
    setError(null);
    setRoman(out);
  }

  function fromRoman(value: string) {
    setRoman(value.toUpperCase());
    const trimmed = value.trim();
    if (!trimmed) {
      setDecimal("");
      setError(null);
      return;
    }
    const n = romanToDecimal(trimmed);
    if (n === null) {
      setError(t("errorRoman"));
      return;
    }
    setError(null);
    setDecimal(String(n));
  }

  const result = error ? "" : roman && decimal ? `${decimal} = ${roman}` : "";

  return (
    <ToolShell title={t("title")} description={t("description")} notice={t("notice")}>
      <MathNav currentHref="/romanos" />

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <div>
          <Label htmlFor="decimal">{t("decimal")}</Label>
          <Input
            id="decimal"
            inputMode="numeric"
            value={decimal}
            onChange={(e) => fromDecimal(e.target.value)}
            placeholder="2026"
            className="mt-1"
          />
        </div>
        <div className="hidden h-10 items-center justify-center text-slate-400 sm:flex">
          <ArrowLeftRight className="h-4 w-4" />
        </div>
        <div>
          <Label htmlFor="roman">{t("roman")}</Label>
          <Input
            id="roman"
            value={roman}
            onChange={(e) => fromRoman(e.target.value)}
            placeholder="MMXXVI"
            className="mt-1 uppercase"
            autoCapitalize="characters"
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {result && (
        <ResultBox
          className="mt-4"
          label={t("result")}
          value={result}
          copied={copied}
          onCopy={() => copy(result)}
        />
      )}
    </ToolShell>
  );
}
