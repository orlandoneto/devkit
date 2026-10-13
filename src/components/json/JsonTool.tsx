"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Braces, Copy, Minimize2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/form";
import { ToolShell } from "@/components/tools/ToolShell";
import { formatJson, validateJson } from "@/lib/json";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE = `{
  "name": "devkit",
  "tools": ["cpf", "cnpj", "json"],
  "ok": true
}`;

export function JsonTool() {
  const t = useTranslations("Json");
  const [input, setInput] = useState(SAMPLE);
  const [indent, setIndent] = useState(2);
  const [status, setStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [error, setError] = useState<string | null>(null);

  function run(mode: "pretty" | "minify") {
    const result = formatJson(input, mode, indent);
    if (!result.ok) {
      setStatus("invalid");
      setError(
        result.error === "EMPTY" ? t("errorEmpty") : t("errorInvalid", { detail: result.error }),
      );
      return;
    }
    setInput(result.output);
    setStatus("valid");
    setError(null);
    toast.success(mode === "pretty" ? t("formatted") : t("minified"));
  }

  function check() {
    const result = validateJson(input);
    if (!result.ok) {
      setStatus("invalid");
      setError(
        result.error === "EMPTY" ? t("errorEmpty") : t("errorInvalid", { detail: result.error }),
      );
      return;
    }
    setStatus("valid");
    setError(null);
    toast.success(t("valid"));
  }

  async function copyOutput() {
    await copyToClipboard(input);
    toast.success(t("copied"));
  }

  return (
    <ToolShell title={t("title")} description={t("description")} notice={t("notice")}>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <Label htmlFor="json-indent">{t("indent")}</Label>
          <Select
            id="json-indent"
            className="h-9 w-[100px]"
            value={String(indent)}
            onChange={(e) => setIndent(Number(e.target.value))}
          >
            {[2, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </div>
        <Button size="sm" className="h-9" onClick={() => run("pretty")}>
          <Braces className="h-3.5 w-3.5" />
          {t("format")}
        </Button>
        <Button size="sm" variant="secondary" className="h-9" onClick={() => run("minify")}>
          <Minimize2 className="h-3.5 w-3.5" />
          {t("minify")}
        </Button>
        <Button size="sm" variant="outline" className="h-9" onClick={check}>
          {t("validate")}
        </Button>
        <Button size="sm" variant="outline" className="h-9" onClick={() => void copyOutput()}>
          <Copy className="h-3.5 w-3.5" />
          {t("copy")}
        </Button>
      </div>

      <div className="mt-3 space-y-1">
        <Label htmlFor="json-input">{t("input")}</Label>
        <textarea
          id="json-input"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setStatus("idle");
            setError(null);
          }}
          rows={14}
          spellCheck={false}
          className="w-full resize-y rounded-lg border border-stone-200 bg-white px-3 py-2 font-mono text-sm leading-relaxed outline-none focus:border-blue-500 dark:border-stone-700 dark:bg-slate-950"
        />
      </div>

      {status === "valid" && (
        <p className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
          {t("valid")}
        </p>
      )}
      {error && (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </p>
      )}
    </ToolShell>
  );
}
