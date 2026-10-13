"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";
import { ResultBox } from "@/components/tools/ResultBox";
import { ToolShell } from "@/components/tools/ToolShell";
import { LocalHistoryPanel } from "@/components/tools/LocalHistoryPanel";
import { InfoTip, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { generatePassword } from "@/lib/password";
import { useCopyFeedback } from "@/hooks/useCopyFeedback";
import { useSenhaHistoryStore } from "@/store/tool-history-stores";

export function PasswordGenerator() {
  const t = useTranslations("Senha");
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const { copied, copy } = useCopyFeedback();
  const history = useSenhaHistoryStore((s) => s.history);
  const used = useSenhaHistoryStore((s) => s.used);
  const pushGenerated = useSenhaHistoryStore((s) => s.pushGenerated);
  const markUsed = useSenhaHistoryStore((s) => s.markUsed);
  const clearHistory = useSenhaHistoryStore((s) => s.clearHistory);

  function generate(save = true) {
    const next = generatePassword({
      length,
      uppercase,
      lowercase,
      numbers,
      symbols,
    });
    setPassword(next);
    if (save) pushGenerated([{ id: next, display: next }]);
    return next;
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => generate(false));
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function copyValue(value: string) {
    await copy(value);
    markUsed({ id: value, display: value });
  }

  return (
    <div>
      <ToolShell title={t("title")} description={t("description")} notice={t("notice")}>
        <div className="mt-3 space-y-2.5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="len" className="inline-flex items-center gap-1 text-sm text-slate-500">
                {t("length")}
                <InfoTip text={t("lengthTip")} />
              </Label>
              <Input
                id="len"
                type="number"
                min={4}
                max={128}
                value={length}
                onChange={(e) => setLength(Number(e.target.value) || 16)}
                className="h-9 w-20"
              />
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="h-9 px-4"
                  onClick={async () => {
                    const next = generate();
                    await copyValue(next);
                  }}
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  {t("generate")}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("generateTip")}</TooltipContent>
            </Tooltip>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(
              [
                ["uppercase", uppercase, setUppercase, "tipUppercase"],
                ["lowercase", lowercase, setLowercase, "tipLowercase"],
                ["numbers", numbers, setNumbers, "tipNumbers"],
                ["symbols", symbols, setSymbols, "tipSymbols"],
              ] as const
            ).map(([labelKey, checked, setter, tipKey]) => (
              <label
                key={labelKey}
                className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-slate-700 dark:text-slate-200"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setter(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 accent-slate-900"
                />
                {t(labelKey)}
                <InfoTip text={t(tipKey)} />
              </label>
            ))}
          </div>
        </div>

        {password && (
          <ResultBox
            label={t("generated")}
            value={password}
            badges={[t("charsBadge", { count: password.length })]}
            copied={copied}
            onCopy={() => copyValue(password)}
            copyTip={t("copyTip")}
          />
        )}
      </ToolShell>

      <LocalHistoryPanel
        history={history}
        used={used}
        onClear={clearHistory}
        onCopy={(item) => {
          void copyValue(item.display);
        }}
      />
    </div>
  );
}
