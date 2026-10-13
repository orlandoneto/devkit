"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Input, Label } from "@/components/ui/form";
import { ResultBox } from "@/components/tools/ResultBox";
import { ToolShell } from "@/components/tools/ToolShell";
import { MathNav } from "@/components/math/MathNav";
import { useCopyFeedback } from "@/hooks/useCopyFeedback";
import { gcdMany, lcmMany, parsePositiveInts } from "@/lib/math";

export function GcdLcmTool({ kind }: { kind: "gcd" | "lcm" }) {
  const t = useTranslations(kind === "gcd" ? "Mdc" : "Mmc");
  const { copied, copy } = useCopyFeedback();
  const [raw, setRaw] = useState("12, 18, 24");

  const parsed = useMemo(() => {
    const nums = parsePositiveInts(raw);
    if (raw.trim() && nums.length === 0) return { kind: "invalid" as const };
    if (nums.length < 2) return { kind: "needTwo" as const, nums };
    const value = kind === "gcd" ? gcdMany(nums) : lcmMany(nums);
    if (value === null) return { kind: "invalid" as const };
    return { kind: "ok" as const, nums, value };
  }, [kind, raw]);

  const result = parsed.kind === "ok" ? String(parsed.value) : "";

  return (
    <ToolShell title={t("title")} description={t("description")} notice={t("notice")}>
      <MathNav currentHref={kind === "gcd" ? "/mdc" : "/mmc"} />

      <div className="mt-4">
        <Label htmlFor="nums">{t("numbers")}</Label>
        <Input
          id="nums"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="12, 18, 24"
          className="mt-1"
        />
        <p className="mt-1 text-xs text-slate-500">{t("hint")}</p>
      </div>

      {parsed.kind === "invalid" && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{t("error")}</p>
      )}
      {parsed.kind === "needTwo" && raw.trim() !== "" && parsed.nums.length < 2 && (
        <p className="mt-3 text-sm text-slate-500">{t("needTwo")}</p>
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
