"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
  Copy,
  Download,
  FileJson,
  FileText,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ResultBox } from "@/components/tools/ResultBox";
import { ToolShell } from "@/components/tools/ToolShell";
import { LocalHistoryPanel } from "@/components/tools/LocalHistoryPanel";
import { InfoTip, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Label, Select } from "@/components/ui/form";
import { formatCNPJ, generateCNPJ } from "@/lib/cnpj";
import { useCopyFeedback } from "@/hooks/useCopyFeedback";
import { downloadBlob } from "@/lib/utils";
import { useCnpjHistoryStore } from "@/store/tool-history-stores";

const QUANTITIES = [1, 10, 50, 100] as const;
type Quantity = (typeof QUANTITIES)[number];

export function CNPJGenerator() {
  const t = useTranslations("Cnpj");
  const [mask, setMask] = useState(true);
  const [results, setResults] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<Quantity>(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { copied, copy } = useCopyFeedback();
  const history = useCnpjHistoryStore((s) => s.history);
  const used = useCnpjHistoryStore((s) => s.used);
  const pushGenerated = useCnpjHistoryStore((s) => s.pushGenerated);
  const markUsed = useCnpjHistoryStore((s) => s.markUsed);
  const clearHistory = useCnpjHistoryStore((s) => s.clearHistory);

  function displayCNPJ(digits: string) {
    return mask ? formatCNPJ(digits) : digits;
  }

  function generate(count = 1, save = true) {
    const unique = new Set<string>();
    while (unique.size < Math.min(Math.max(count, 1), 100)) {
      unique.add(generateCNPJ(false).cnpj);
    }
    const next = Array.from(unique);
    setResults(next);
    if (save) {
      pushGenerated(next.map((id) => ({ id, display: displayCNPJ(id) })));
    }
    return next;
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => generate(1, false));
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function copyValue(text: string, id?: string) {
    await copy(text);
    if (id) markUsed({ id, display: displayCNPJ(id) });
  }

  function handleExport(format: "txt" | "csv" | "json") {
    if (!results.length) return;
    const values = results.map(displayCNPJ);
    const content =
      format === "json"
        ? JSON.stringify(values, null, 2)
        : format === "csv"
          ? `cnpj\n${values.map((value) => `"${value}"`).join("\n")}`
          : values.join("\n");
    const mime =
      format === "json"
        ? "application/json"
        : format === "csv"
          ? "text/csv"
          : "text/plain";
    downloadBlob(`cnpjs.${format}`, content, mime);
    toast.success(t("toastDownload", { format: format.toUpperCase() }));
  }

  const display = results[0] ? displayCNPJ(results[0]) : "";
  const qtyLabel =
    quantity === 1 ? t("qtyOne") : t("qtyMany", { count: quantity });

  return (
    <div>
      <ToolShell title={t("title")} description={t("description")}>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={mask}
              onChange={(e) => setMask(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 accent-slate-900"
            />
            {t("withPunctuation")}
            <InfoTip text={t("punctuationTip")} />
          </label>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className="h-9 px-4"
                onClick={async () => {
                  const next = generate();
                  await copy(next.map(displayCNPJ).join("\n"));
                  next.forEach((id) =>
                    markUsed({ id, display: displayCNPJ(id) }),
                  );
                }}
              >
                <Wand2 className="h-3.5 w-3.5" />
                {t("generate")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("generateTip")}</TooltipContent>
          </Tooltip>
        </div>

        {display && (
          <ResultBox
            label={t("generated")}
            value={display}
            badges={[t("badgeValid")]}
            copied={copied}
            onCopy={() => copyValue(display, results[0])}
          />
        )}

        <div className="mt-3 border-t border-stone-200 pt-2 dark:border-stone-800">
          <button
            type="button"
            onClick={() => setShowAdvanced((value) => !value)}
            className="flex w-full items-center gap-3 py-1 text-left text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
              <span className="shrink-0 leading-5">{t("moreOptions")}</span>
              <span className="text-xs leading-5 font-medium text-amber-700 dark:text-amber-400">
                {t("moreOptionsHint")}
              </span>
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition ${showAdvanced ? "rotate-180" : ""}`}
            />
          </button>

          {showAdvanced && (
            <div className="mt-2 space-y-3 rounded-lg border border-stone-200 bg-stone-50/80 p-3 dark:border-stone-800 dark:bg-stone-900/40">
              <div className="space-y-1.5">
                <Label htmlFor="cnpj-quantity" className="inline-flex items-center gap-1">
                  {t("batchQuantity")}
                  <InfoTip text={t("batchQuantityTip")} />
                </Label>
                <Select
                  id="cnpj-quantity"
                  className="h-9"
                  value={String(quantity)}
                  onChange={(event) =>
                    setQuantity(Number(event.target.value) as Quantity)
                  }
                >
                  {QUANTITIES.map((value) => (
                    <option key={value} value={value}>
                      {value === 1
                        ? t("qtyOne")
                        : t("qtyMany", { count: value })}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    const next = generate(quantity);
                    await copy(next.map(displayCNPJ).join("\n"));
                    next.forEach((id) =>
                      markUsed({ id, display: displayCNPJ(id) }),
                    );
                  }}
                >
                  {t("generateQty", { label: qtyLabel })}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExport("txt")}
                >
                  <FileText className="h-4 w-4" />
                  TXT
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExport("csv")}
                >
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExport("json")}
                >
                  <FileJson className="h-4 w-4" />
                  JSON
                </Button>
              </div>
            </div>
          )}
        </div>

        {results.length > 1 && (
          <div className="mt-3 overflow-hidden rounded-lg border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-3 py-2 dark:border-stone-800 dark:bg-stone-900">
              <p className="text-sm font-medium">
                {t("batchLabel", { count: results.length })}
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  results.forEach((id) =>
                    markUsed({ id, display: displayCNPJ(id) }),
                  );
                  void copy(results.map(displayCNPJ).join("\n"));
                }}
              >
                <Copy className="h-4 w-4" />
                {t("copyAll")}
              </Button>
            </div>
            <div className="max-h-48 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white dark:bg-slate-950">
                  <tr>
                    <th className="px-3 py-2 font-medium">CNPJ</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {results.map((digits) => (
                    <tr
                      key={digits}
                      className="border-t border-stone-100 dark:border-stone-900"
                    >
                      <td className="px-3 py-1.5 font-mono">
                        {displayCNPJ(digits)}
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            copyValue(displayCNPJ(digits), digits)
                          }
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </ToolShell>

      <LocalHistoryPanel
        history={history}
        used={used}
        onClear={clearHistory}
        onCopy={(item) => {
          void copyValue(mask ? formatCNPJ(item.id) : item.id, item.id);
        }}
      />
    </div>
  );
}
