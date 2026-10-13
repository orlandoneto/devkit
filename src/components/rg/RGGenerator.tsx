"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultBox } from "@/components/tools/ResultBox";
import { ToolShell } from "@/components/tools/ToolShell";
import { LocalHistoryPanel } from "@/components/tools/LocalHistoryPanel";
import { InfoTip, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatRG, generateRG } from "@/lib/rg";
import { useCopyFeedback } from "@/hooks/useCopyFeedback";
import { useRgHistoryStore } from "@/store/tool-history-stores";

export function RGGenerator() {
  const t = useTranslations("Rg");
  const [mask, setMask] = useState(true);
  const [raw, setRaw] = useState("");
  const { copied, copy } = useCopyFeedback();
  const history = useRgHistoryStore((s) => s.history);
  const used = useRgHistoryStore((s) => s.used);
  const pushGenerated = useRgHistoryStore((s) => s.pushGenerated);
  const markUsed = useRgHistoryStore((s) => s.markUsed);
  const clearHistory = useRgHistoryStore((s) => s.clearHistory);

  function displayOf(value: string) {
    return mask ? formatRG(value) : value;
  }

  function generate(save = true) {
    const result = generateRG(true);
    setRaw(result.rg);
    const display = displayOf(result.rg);
    if (save) pushGenerated([{ id: result.rg, display }]);
    return { id: result.rg, display };
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => generate(false));
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function copyValue(display: string, id: string) {
    await copy(display);
    markUsed({ id, display });
  }

  const display = raw ? displayOf(raw) : "";

  return (
    <div>
      <ToolShell title={t("title")} description={t("description")} notice={t("notice")}>
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
                  await copyValue(next.display, next.id);
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
            badges={[t("badgeFake"), t("badgeTests")]}
            copied={copied}
            onCopy={() => copyValue(display, raw)}
          />
        )}
      </ToolShell>

      <LocalHistoryPanel
        history={history}
        used={used}
        onClear={clearHistory}
        onCopy={(item) => {
          void copyValue(mask ? formatRG(item.id) : item.id, item.id);
        }}
      />
    </div>
  );
}
