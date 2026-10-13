"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";
import { ResultBox } from "@/components/tools/ResultBox";
import { ToolShell } from "@/components/tools/ToolShell";
import { useCopyFeedback } from "@/hooks/useCopyFeedback";
import { formatSSN, generateSSN, validateSSN } from "@/lib/ssn";

export function SSNTool() {
  const t = useTranslations("Ssn");
  const [mask, setMask] = useState(true);
  const [value, setValue] = useState("");
  const [input, setInput] = useState("");
  const [validation, setValidation] = useState<ReturnType<
    typeof validateSSN
  > | null>(null);
  const { copied, copy } = useCopyFeedback();

  function generate() {
    const result = generateSSN(mask);
    setValue(result.display);
    return result.display;
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setValue(generateSSN(mask).display);
    });
    return () => cancelAnimationFrame(frame);
  }, [mask]);

  return (
    <ToolShell title={t("title")} description={t("description")} notice={t("notice")}>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={mask}
            onChange={(e) => setMask(e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 accent-slate-900"
          />
          {t("withMask")}
        </label>
        <Button
          size="sm"
          className="h-9"
          onClick={async () => {
            const next = generate();
            await copy(next);
          }}
        >
          <Wand2 className="h-3.5 w-3.5" />
          {t("generate")}
        </Button>
      </div>

      {value && (
        <ResultBox
          label={t("generated")}
          value={value}
          badges={[t("valid")]}
          copied={copied}
          onCopy={() => copy(value)}
        />
      )}

      <div className="mt-4 space-y-2 border-t border-stone-200 pt-3 dark:border-stone-800">
        <Label htmlFor="ssn-input">{t("input")}</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="ssn-input"
            className="font-mono"
            value={input}
            onChange={(e) => setInput(formatSSN(e.target.value))}
            placeholder="123-45-6789"
            maxLength={11}
          />
          <Button
            size="sm"
            variant="secondary"
            className="h-10 shrink-0"
            onClick={() => setValidation(validateSSN(input))}
          >
            {t("validate")}
          </Button>
        </div>
        {validation && (
          <div
            className={`rounded-lg border p-3 text-sm ${
              validation.valid
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
                : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
            }`}
          >
            <p className="font-semibold">
              {validation.valid ? t("valid") : t("invalid")}
            </p>
            <ul className="mt-1 space-y-0.5">
              {validation.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
