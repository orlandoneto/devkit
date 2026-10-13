"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { ToolShell } from "@/components/tools/ToolShell";
import { InfoTip, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCPF, fromDigits, validateCPF } from "@/lib/cpf";
import { mapCpfReason } from "@/components/cpf/mapCpfReasons";
import { useCPFStore } from "@/store/cpf-store";

export function CPFValidatorTool() {
  const t = useTranslations("CpfValidar");
  const markUsed = useCPFStore((state) => state.markUsed);
  const [input, setInput] = useState("");
  const [touched, setTouched] = useState(false);
  const result = touched ? validateCPF(input) : null;

  return (
    <ToolShell title={t("title")} description={t("description")}>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
            {t("input")}
            <InfoTip text={t("inputTip")} />
          </p>
          <Input
            placeholder="000.000.000-00"
            value={input}
            onChange={(e) => {
              setInput(formatCPF(e.target.value));
              setTouched(false);
            }}
            maxLength={14}
          />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              className="h-10 shrink-0 px-4 sm:mt-5"
              onClick={() => {
                setTouched(true);
                const next = validateCPF(input);
                if (next.valid) {
                  const item = fromDigits(input);
                  if (item) markUsed(item);
                }
              }}
            >
              {t("validate")}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("validateTip")}</TooltipContent>
        </Tooltip>
      </div>

      {result && (
        <div
          className={`mt-3 rounded-lg border p-3 ${
            result.valid
              ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
              : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
          }`}
        >
          <p className="font-semibold">
            {result.valid ? t("resultValid") : t("resultInvalid")}
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {result.reasons.map((reason) => (
              <li key={reason}>{mapCpfReason(reason, t)}</li>
            ))}
          </ul>
          {result.valid && (
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <p>
                {t("formatted")}{" "}
                <span className="font-mono">{result.formatted}</span>
              </p>
              <p>
                {t("region")} {result.regionLabel}
              </p>
            </div>
          )}
        </div>
      )}
    </ToolShell>
  );
}
