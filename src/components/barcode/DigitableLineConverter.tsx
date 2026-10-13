"use client";

import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { useTranslations } from "next-intl";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  Eraser,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ToolShell } from "@/components/tools/ToolShell";
import {
  convertDigitableLine,
  type DigitableLineConversion,
} from "@/lib/boleto";
import { copyToClipboard, downloadBlob } from "@/lib/utils";

const MAX_LINES = 10;

type SuccessfulConversion = Extract<
  DigitableLineConversion,
  { success: true }
>;

function inputLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function DigitableLineConverter() {
  const t = useTranslations("LinhaDigitavel");
  const [input, setInput] = useState("");
  const [results, setResults] = useState<DigitableLineConversion[]>([]);
  const lines = inputLines(input);

  function handleConvert() {
    if (!lines.length) {
      toast.error(t("errorEmpty"));
      return;
    }

    if (lines.length > MAX_LINES) {
      toast.error(t("errorMax", { max: MAX_LINES }));
      return;
    }

    const next = lines.map(convertDigitableLine);
    setResults(next);
    const validCount = next.filter((result) => result.success).length;

    if (validCount === next.length) {
      toast.success(
        validCount === 1
          ? t("toastOne")
          : t("toastMany", { count: validCount }),
      );
    } else {
      toast.warning(
        t("toastPartial", { valid: validCount, total: next.length }),
      );
    }
  }

  function clear() {
    setInput("");
    setResults([]);
  }

  return (
    <ToolShell
      title={t("title")}
      description={t("description")}
      notice={t("notice")}
    >
      <div className="mt-3 space-y-2">
        <div className="flex items-end justify-between gap-3">
          <label
            htmlFor="digitable-lines"
            className="text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            {t("inputLabel")}
          </label>
          <span
            className={`text-xs ${
              lines.length > MAX_LINES
                ? "font-semibold text-red-600 dark:text-red-400"
                : "text-slate-500"
            }`}
          >
            {lines.length}/{MAX_LINES}
          </span>
        </div>

        <textarea
          id="digitable-lines"
          rows={7}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t("placeholder")}
          className="w-full resize-y rounded-lg border border-stone-200 bg-white px-3 py-2.5 font-mono text-sm leading-relaxed text-slate-900 outline-none transition placeholder:font-sans placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-slate-950 dark:text-white"
        />

        <p className="text-xs text-slate-500">{t("hint")}</p>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={handleConvert}
            disabled={!lines.length || lines.length > MAX_LINES}
          >
            <Wand2 className="h-4 w-4" />
            {t("convert")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={clear}
            disabled={!input && !results.length}
          >
            <Eraser className="h-4 w-4" />
            {t("clear")}
          </Button>
        </div>
      </div>

      {results.length > 0 && (
        <section className="mt-4 space-y-3" aria-live="polite">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-slate-900 dark:text-white">
              {t("result")}
            </h2>
            <span className="text-xs text-slate-500">
              {t("validOf", {
                valid: results.filter((result) => result.success).length,
                total: results.length,
              })}
            </span>
          </div>

          {results.map((result, index) =>
            result.success ? (
              <BarcodeResult
                key={`${result.normalized}-${index}`}
                result={result}
                index={index}
              />
            ) : (
              <div
                key={`${result.input}-${index}`}
                className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/60 dark:bg-red-950/20"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                      {t("lineFailed", { index: index + 1 })}
                    </p>
                    <p className="mt-0.5 text-sm text-red-700 dark:text-red-400">
                      {result.error}
                    </p>
                    <p className="mt-1 truncate font-mono text-xs text-red-600/80 dark:text-red-400/80">
                      {result.input}
                    </p>
                  </div>
                </div>
              </div>
            ),
          )}
        </section>
      )}
    </ToolShell>
  );
}

function BarcodeResult({
  result,
  index,
}: {
  result: SuccessfulConversion;
  index: number;
}) {
  const t = useTranslations("LinhaDigitavel");
  const svgRef = useRef<SVGSVGElement>(null);
  const typeLabel =
    result.type === "arrecadacao" ? t("typeArrecadacao") : t("typeBoleto");

  useEffect(() => {
    if (!svgRef.current) return;
    JsBarcode(svgRef.current, result.barcode, {
      format: "ITF",
      width: 1.5,
      height: 72,
      displayValue: true,
      font: "monospace",
      fontSize: 14,
      textMargin: 6,
      margin: 12,
      background: "#ffffff",
      lineColor: "#0f172a",
    });
  }, [result.barcode]);

  async function copyBarcode() {
    await copyToClipboard(result.barcode);
    toast.success(t("copiedDigits"));
  }

  function downloadSvg() {
    if (!svgRef.current) return;
    const markup = new XMLSerializer().serializeToString(svgRef.current);
    downloadBlob(
      `codigo-barras-${index + 1}.svg`,
      markup,
      "image/svg+xml;charset=utf-8",
    );
    toast.success(t("svgDownloaded"));
  }

  return (
    <article className="overflow-hidden rounded-lg border border-emerald-200 bg-white dark:border-emerald-900/60 dark:bg-slate-950">
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 bg-emerald-50/60 px-3 py-2 dark:border-stone-800 dark:bg-emerald-950/20">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {t("lineOk", { index: index + 1 })}
        </p>
        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          {typeLabel}
        </span>
        <span className="ml-auto text-xs text-emerald-700 dark:text-emerald-400">
          {t("verified")}
        </span>
      </div>

      <div className="space-y-3 p-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {t("barcodeLabel")}
          </p>
          <p className="mt-1 break-all font-mono text-sm font-semibold text-slate-900 dark:text-white">
            {result.barcode}
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-dashed border-stone-200 bg-white p-2 dark:border-stone-700">
          <svg ref={svgRef} className="mx-auto block" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={copyBarcode}>
            <Copy className="h-4 w-4" />
            {t("copyDigits")}
          </Button>
          <Button size="sm" variant="outline" onClick={downloadSvg}>
            <Download className="h-4 w-4" />
            {t("downloadSvg")}
          </Button>
        </div>
      </div>
    </article>
  );
}
