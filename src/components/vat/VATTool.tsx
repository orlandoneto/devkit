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
  VAT_COUNTRIES,
  generateVAT,
  validateVAT,
  type VatCountry,
} from "@/lib/vat";

export function VATTool() {
  const t = useTranslations("Vat");
  const [country, setCountry] = useState<VatCountry>("DE");
  const [value, setValue] = useState("");
  const [input, setInput] = useState("");
  const [validation, setValidation] = useState<ReturnType<
    typeof validateVAT
  > | null>(null);
  const { copied, copy } = useCopyFeedback();

  function generate() {
    const result = generateVAT(country);
    setValue(result.vat);
    return result.vat;
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setValue(generateVAT(country).vat);
    });
    return () => cancelAnimationFrame(frame);
  }, [country]);

  return (
    <ToolShell title={t("title")} description={t("description")} notice={t("notice")}>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <Label htmlFor="vat-country">{t("country")}</Label>
          <Select
            id="vat-country"
            className="h-9 w-[100px]"
            value={country}
            onChange={(e) => setCountry(e.target.value as VatCountry)}
          >
            {VAT_COUNTRIES.map((code) => (
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
        <Label htmlFor="vat-input">{t("input")}</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="vat-input"
            className="font-mono"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            placeholder="DE123456789"
          />
          <Button
            size="sm"
            variant="secondary"
            className="h-10 shrink-0"
            onClick={() => setValidation(validateVAT(input))}
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
