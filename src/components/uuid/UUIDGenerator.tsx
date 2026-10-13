"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/form";
import { ResultBox } from "@/components/tools/ResultBox";
import { ToolShell } from "@/components/tools/ToolShell";
import { LocalHistoryPanel } from "@/components/tools/LocalHistoryPanel";
import { InfoTip, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { generateManyUUID, generateUUID } from "@/lib/uuid";
import { useCopyFeedback } from "@/hooks/useCopyFeedback";
import { useUuidHistoryStore } from "@/store/tool-history-stores";

export function UUIDGenerator() {
  const t = useTranslations("Uuid");
  const tCommon = useTranslations("Common");
  const [quantity, setQuantity] = useState(1);
  const [values, setValues] = useState<string[]>([]);
  const { copied, copy } = useCopyFeedback();
  const history = useUuidHistoryStore((s) => s.history);
  const used = useUuidHistoryStore((s) => s.used);
  const pushGenerated = useUuidHistoryStore((s) => s.pushGenerated);
  const markUsed = useUuidHistoryStore((s) => s.markUsed);
  const clearHistory = useUuidHistoryStore((s) => s.clearHistory);

  function generate(save = true) {
    const next =
      quantity === 1 ? [generateUUID()] : generateManyUUID(quantity);
    setValues(next);
    if (save) {
      pushGenerated(next.map((id) => ({ id, display: id })));
    }
    return next;
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => generate(false));
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function copyValue(text: string, ids: string[]) {
    await copy(text);
    ids.forEach((id) => markUsed({ id, display: id }));
  }

  return (
    <div>
      <ToolShell title={t("title")} description={t("description")} notice={t("notice")}>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="qty" className="inline-flex items-center gap-1 text-sm text-slate-500">
              {t("quantity")}
              <InfoTip text={t("quantityTip")} />
            </Label>
            <Select
              id="qty"
              className="h-9 w-[100px]"
              value={String(quantity)}
              onChange={(e) => setQuantity(Number(e.target.value))}
            >
              {[1, 5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className="h-9 px-4"
                onClick={async () => {
                  const next = generate();
                  await copyValue(next.join("\n"), next);
                }}
              >
                <Wand2 className="h-3.5 w-3.5" />
                {t("generate")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("generateTip")}</TooltipContent>
          </Tooltip>
        </div>

        {values.length === 1 && (
          <ResultBox
            label={t("generated")}
            value={values[0]}
            badges={["v4"]}
            copied={copied}
            onCopy={() => copyValue(values[0], [values[0]])}
          />
        )}

        {values.length > 1 && (
          <div className="mt-3 min-w-0 overflow-hidden rounded-lg border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-3 py-2 dark:border-stone-800 dark:bg-stone-900">
              <p className="inline-flex items-center gap-1 text-sm font-medium">
                {t("listLabel", { count: values.length })}
                <InfoTip text={t("listTip")} />
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyValue(values.join("\n"), values)}
              >
                {tCommon("copyAll")}
              </Button>
            </div>
            <ul className="max-h-48 overflow-auto p-2 font-mono text-xs">
              {values.map((id) => (
                <li
                  key={id}
                  className="overflow-x-auto rounded px-2 py-1 hover:bg-stone-50 dark:hover:bg-stone-900"
                >
                  {id}
                </li>
              ))}
            </ul>
          </div>
        )}
      </ToolShell>

      <LocalHistoryPanel
        history={history}
        used={used}
        onClear={clearHistory}
        onCopy={(item) => {
          void copyValue(item.display, [item.id]);
        }}
      />
    </div>
  );
}
