"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/form";
import { ResultBox } from "@/components/tools/ResultBox";
import { ToolShell } from "@/components/tools/ToolShell";
import { useCopyFeedback } from "@/hooks/useCopyFeedback";
import {
  IBAN_COUNTRIES,
  formatIBAN,
  generateIBAN,
  validateIBAN,
} from "@/lib/iban";

export function IBANTool() {
  const t = useTranslations("Iban");
  const [country, setCountry] = useState("DE");
  const [value, setValue] = useState("");
  const [input, setInput] = useState("");
  const [validation, setValidation] = useState<ReturnType<
    typeof validateIBAN
  > | null>(null);
  const { copied, copy } = useCopyFeedback();

  function generate() {
    const result = generateIBAN(country);
    setValue(result.formatted);
    return result.formatted;
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setValue(generateIBAN(country).formatted);
    });
    return () => cancelAnimationFrame(frame);
  }, [country]);

  return (
    <ToolShell title={t("title")} description={t("description")} notice={t("notice")}>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <Label htmlFor="iban-country">{t("country")}</Label>
          <Select
            id="iban-country"
            className="h-9 w-[100px]"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            {IBAN_COUNTRIES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </Select>
        </div>
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
        <Label htmlFor="iban-input">{t("input")}</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="iban-input"
            className="font-mono"
            value={input}
            onChange={(e) => setInput(formatIBAN(e.target.value))}
            placeholder="DE89 3704 0044 0532 0130 00"
          />
          <Button
            size="sm"
            variant="secondary"
            className="h-10 shrink-0"
            onClick={() => setValidation(validateIBAN(input))}
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
