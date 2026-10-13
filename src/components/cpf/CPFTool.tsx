"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  FileJson,
  FileText,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  InfoTip,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FEATURES } from "@/lib/features";
import { SITE } from "@/lib/site";
import {
  CPF_REGEX_SOURCE,
  REGION_BY_DIGIT,
  UF_LIST,
  displayCPF,
  explainDigits,
  exportCPF,
  formatCPF,
  fromDigits,
  validateCPF,
  type BrazilianUF,
  type CPFResult,
} from "@/lib/cpf";
import { LANGUAGE_EXAMPLES } from "@/lib/cpf/codeExamples";
import { copyToClipboard, downloadBlob } from "@/lib/utils";
import { type QuantityOption, useCPFStore } from "@/store/cpf-store";
import { mapCpfReason } from "@/components/cpf/mapCpfReasons";
import { CpfHistoryTab } from "@/components/cpf/CpfHistoryTab";

const QUANTITIES: QuantityOption[] = [1, 10, 50, 100];

export function CPFTool() {
  const t = useTranslations("Cpf");
  const tc = useTranslations("Common");
  const {
    mask,
    quantity,
    uf,
    latest,
    history,
    setMask,
    setQuantity,
    setUF,
    generate,
    markUsed,
  } = useCPFStore();

  const [hydrated, setHydrated] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validatorInput, setValidatorInput] = useState("");
  const [apiPath, setApiPath] = useState("/api/v1/cpf?uf=SP&mask=true");
  const [apiResponse, setApiResponse] = useState("");
  const [apiLoading, setApiLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setHydrated(true);
      if (useCPFStore.getState().latest.length === 0) {
        useCPFStore.getState().generate(1, { saveHistory: false });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const primary = latest[0];
  const validation = useMemo(
    () => (validatorInput ? validateCPF(validatorInput) : null),
    [validatorInput],
  );
  const explanation = primary ? explainDigits(primary.cpf) : null;

  async function handleCopy(text: string, key?: string, item?: CPFResult) {
    if (item) markUsed(item);
    try {
      await copyToClipboard(text);
      setCopied(key ?? text);
      toast.success(t("toastCopied"));
      setTimeout(() => setCopied(null), 1200);
    } catch {
      // Clipboard can fail in some browsers; the CPF is still recorded as used.
    }
  }

  async function handleGenerate(qty = 1) {
    const items = generate(qty);
    toast.success(
      items.length === 1
        ? t("toastGeneratedOne")
        : t("toastGeneratedMany", { count: items.length }),
    );
  }

  function handleExport(format: "csv" | "json" | "txt") {
    const source = latest.length ? latest : history;
    if (!source.length) {
      toast.error(t("toastExportEmpty"));
      return;
    }
    const file = exportCPF(source, format, mask);
    downloadBlob(file.filename, file.content, file.mime);
    toast.success(t("toastDownload", { format: format.toUpperCase() }));
  }

  async function runPlayground() {
    setApiLoading(true);
    try {
      const isValidate = apiPath.includes("/validate");
      const res = await fetch(apiPath, {
        method: isValidate ? "POST" : "GET",
        headers: isValidate
          ? { "Content-Type": "application/json" }
          : undefined,
        body: isValidate
          ? JSON.stringify({ cpf: primary?.cpf ?? "529.982.247-25" })
          : undefined,
      });
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setApiResponse(JSON.stringify({ error: String(error) }, null, 2));
    } finally {
      setApiLoading(false);
    }
  }

  const qtyLabel =
    quantity === 1 ? t("qtyOne") : t("qtyMany", { count: quantity });

  return (
    <div className="min-w-0 space-y-4">
      <section className="min-w-0 rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-slate-950">
        <div className="px-3 py-3 sm:px-4 sm:py-3.5">
          <p className="font-[family-name:var(--font-display)] text-[10px] font-semibold tracking-[0.18em] text-amber-700 uppercase dark:text-amber-400">
            {SITE.name}
          </p>
          <h1 className="mt-0.5 font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
            {t("title")}
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            {t("description")}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="uf" className="inline-flex items-center gap-1 text-sm text-slate-500">
                {t("state")}
                <InfoTip text={t("stateTip")} />
              </Label>
              <Select
                id="uf"
                className="h-9 w-[148px]"
                value={uf}
                onChange={(e) =>
                  setUF(e.target.value as BrazilianUF | "random")
                }
              >
                <option value="random">{t("anyState")}</option>
                {UF_LIST.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </Select>
            </div>

            <label className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={mask}
                onChange={(e) => setMask(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-slate-900 accent-slate-900"
              />
              {t("withPunctuation")}
              <InfoTip text={t("punctuationTip")} />
            </label>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" className="h-9 px-4" onClick={() => handleGenerate(1)}>
                  <Wand2 className="h-3.5 w-3.5" />
                  {t("generate")}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("generateTip")}</TooltipContent>
            </Tooltip>
          </div>

          <div className="mt-3">
            <p className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
              {t("generated")}
              <InfoTip text={t("generatedTip")} />
            </p>
            <AnimatePresence mode="wait">
              {hydrated && primary ? (
                <motion.div
                  key={primary.cpf + String(mask)}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-lg border border-amber-200/80 bg-amber-50/70 px-2.5 py-2.5 sm:px-3 dark:border-amber-900/40 dark:bg-amber-950/20"
                >
                  <div className="flex items-center gap-2">
                    <p className="min-w-0 flex-1 break-all font-mono text-lg font-bold tracking-tight text-slate-900 sm:text-xl dark:text-white">
                      {displayCPF(primary, mask)}
                    </p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          aria-label={t("copyAria")}
                          onClick={() =>
                            handleCopy(
                              displayCPF(primary, mask),
                              primary.cpf,
                              primary,
                            )
                          }
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-stone-200 bg-white text-slate-600 transition hover:bg-stone-50 hover:text-slate-900 dark:border-stone-700 dark:bg-slate-950 dark:hover:bg-stone-900"
                        >
                          {copied === primary.cpf || copied === "generate" ? (
                            <Check className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{t("copyTip")}</TooltipContent>
                    </Tooltip>
                  </div>
                </motion.div>
              ) : (
                <div className="rounded-lg border border-dashed border-stone-300 px-3 py-6 text-center text-sm text-slate-500 dark:border-stone-700">
                  {t("generating")}
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-3 border-t border-stone-200 pt-2 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
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
                <div className="max-w-xs space-y-1.5">
                  <Label htmlFor="quantity" className="inline-flex items-center gap-1">
                    {t("batchQuantity")}
                    <InfoTip text={t("batchQuantityTip")} />
                  </Label>
                  <Select
                    id="quantity"
                    className="h-9"
                    value={String(quantity)}
                    onChange={(e) =>
                      setQuantity(Number(e.target.value) as QuantityOption)
                    }
                  >
                    {QUANTITIES.map((q) => (
                      <option key={q} value={q}>
                        {q === 1 ? t("qtyOne") : t("qtyMany", { count: q })}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleGenerate(quantity)}
                  >
                    {t("generateQty", { label: qtyLabel })}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerate(100)}
                  >
                    {t("generate100")}
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

                {explanation && primary && (
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="rounded-lg bg-white px-3 py-2 text-sm dark:bg-slate-950">
                      <p className="text-xs text-slate-500">{t("firstDv")}</p>
                      <p className="font-semibold">
                        {explanation.first.expected}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white px-3 py-2 text-sm dark:bg-slate-950">
                      <p className="text-xs text-slate-500">{t("secondDv")}</p>
                      <p className="font-semibold">
                        {explanation.second.expected}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white px-3 py-2 text-sm dark:bg-slate-950">
                      <p className="text-xs text-slate-500">{t("region")}</p>
                      <p className="font-semibold">{primary.regionLabel}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {latest.length > 1 && (
            <div className="mt-3 overflow-hidden rounded-lg border border-stone-200 dark:border-stone-800">
              <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-3 py-2 dark:border-stone-800 dark:bg-stone-900">
                <p className="text-sm font-medium">
                  {t("batchLabel", { count: latest.length })}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    latest.forEach((item) => markUsed(item));
                    handleCopy(
                      latest.map((item) => displayCPF(item, mask)).join("\n"),
                      "all",
                    );
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
                      <th className="px-3 py-2 font-medium">CPF</th>
                      <th className="px-3 py-2 font-medium">UF</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {latest.map((item) => (
                      <tr
                        key={item.cpf}
                        className="border-t border-stone-100 dark:border-stone-900"
                      >
                        <td className="px-3 py-1.5 font-mono">
                          {displayCPF(item, mask)}
                        </td>
                        <td className="px-3 py-1.5">{item.uf}</td>
                        <td className="px-3 py-1.5 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleCopy(
                                displayCPF(item, mask),
                                item.cpf,
                                item,
                              )
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

          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            <strong className="text-slate-700 dark:text-slate-300">
              {tc("important")}:
            </strong>{" "}
            {t("notice")}
          </p>
        </div>
      </section>

      <Tabs defaultValue="validator" className="w-full">
        <TabsList>
          <TabsTrigger value="validator">{t("tabValidator")}</TabsTrigger>
          <TabsTrigger value="history">{t("tabHistory")}</TabsTrigger>
          <TabsTrigger value="algorithm">{t("tabAlgorithm")}</TabsTrigger>
          <TabsTrigger value="regex">{t("tabRegex")}</TabsTrigger>
          <TabsTrigger value="code">{t("tabCode")}</TabsTrigger>
          {FEATURES.publicApi && (
            <TabsTrigger value="api">{t("tabApi")}</TabsTrigger>
          )}
          <TabsTrigger value="regions">{t("tabRegions")}</TabsTrigger>
        </TabsList>

        <TabsContent value="validator">
          <Card>
            <CardHeader>
              <CardTitle>{t("validatorTitle")}</CardTitle>
              <CardDescription>{t("validatorDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  placeholder={t("validatorPlaceholder")}
                  value={validatorInput}
                  onChange={(e) => setValidatorInput(formatCPF(e.target.value))}
                  maxLength={14}
                />
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (!validatorInput) return toast.error(t("toastEnterCpf"));
                    const result = validateCPF(validatorInput);
                    if (result.valid) {
                      const item = fromDigits(validatorInput);
                      if (item) markUsed(item);
                    }
                    toast.message(
                      result.valid ? t("toastValid") : t("toastInvalid"),
                    );
                  }}
                >
                  {t("validate")}
                </Button>
              </div>
              {validation && (
                <div
                  className={`rounded-2xl border p-5 ${
                    validation.valid
                      ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                      : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
                  }`}
                >
                  <p className="text-lg font-semibold">
                    {validation.valid ? t("resultValid") : t("resultInvalid")}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {validation.reasons.map((reason) => (
                      <li key={reason}>{mapCpfReason(reason, t)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <CpfHistoryTab
            mask={mask}
            onCopy={(item) =>
              handleCopy(displayCPF(item, mask), item.cpf, item)
            }
          />
        </TabsContent>

        <TabsContent value="algorithm">
          <Card>
            <CardHeader>
              <CardTitle>{t("algorithmTitle")}</CardTitle>
              <CardDescription>{t("algorithmDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              <ol className="list-decimal space-y-2 pl-5">
                <li>{t("algorithmStep1")}</li>
                <li>{t("algorithmStep2")}</li>
                <li>{t("algorithmStep3")}</li>
                <li>{t("algorithmStep4")}</li>
              </ol>
              {explanation && primary && (
                <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-amber-300">
                  <p>
                    {t("algoDumpBase", { base: primary.cpf.slice(0, 9) })}
                  </p>
                  <p>
                    {t("algoDumpFirst", {
                      sum: explanation.first.sum,
                      remainder: explanation.first.remainder,
                      dv: explanation.first.expected,
                    })}
                  </p>
                  <p>
                    {t("algoDumpSecond", {
                      sum: explanation.second.sum,
                      remainder: explanation.second.remainder,
                      dv: explanation.second.expected,
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regex">
          <Card>
            <CardHeader>
              <CardTitle>{t("regexTitle")}</CardTitle>
              <CardDescription>{t("regexDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(
                [
                  [t("regexMasked"), CPF_REGEX_SOURCE.masked],
                  [t("regexUnmasked"), CPF_REGEX_SOURCE.unmasked],
                  [t("regexFlexible"), CPF_REGEX_SOURCE.flexible],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium">{label}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(value, value)}
                    >
                      <Copy className="h-4 w-4" />
                      {tc("copy")}
                    </Button>
                  </div>
                  <code className="block overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs text-amber-300">
                    {value}
                  </code>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code">
          <Card>
            <CardHeader>
              <CardTitle>{t("codeTitle")}</CardTitle>
              <CardDescription>{t("codeDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="javascript">
                <TabsList className="h-auto">
                  {LANGUAGE_EXAMPLES.map((lang) => (
                    <TabsTrigger key={lang.id} value={lang.id}>
                      {lang.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {LANGUAGE_EXAMPLES.map((lang) => (
                  <TabsContent key={lang.id} value={lang.id}>
                    <div className="relative">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute right-3 top-3 z-10"
                        onClick={() => handleCopy(lang.code, lang.id)}
                      >
                        <Copy className="h-4 w-4" />
                        {tc("copy")}
                      </Button>
                      <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-relaxed text-slate-100">
                        <code>{lang.code}</code>
                      </pre>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {FEATURES.publicApi && (
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>{t("apiTitle")}</CardTitle>
                <CardDescription>{t("apiDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    "/api/v1/cpf",
                    "/api/v1/cpf?quantity=10",
                    "/api/v1/cpf?uf=SP",
                    "/api/v1/cpf?mask=false",
                    "/api/v1/cpf/validate",
                  ].map((path) => (
                    <Button
                      key={path}
                      size="sm"
                      variant="outline"
                      onClick={() => setApiPath(path)}
                    >
                      {path}
                    </Button>
                  ))}
                </div>
                <Input
                  value={apiPath}
                  onChange={(e) => setApiPath(e.target.value)}
                />
                <Button onClick={runPlayground} disabled={apiLoading}>
                  {apiLoading ? t("apiRunning") : t("apiRun")}
                </Button>
                <pre className="min-h-40 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-amber-300">
                  {apiResponse || t("apiHint")}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="regions">
          <Card>
            <CardHeader>
              <CardTitle>{t("regionsTitle")}</CardTitle>
              <CardDescription>{t("regionsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.values(REGION_BY_DIGIT).map((region) => (
                  <div
                    key={region.digit}
                    className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                  >
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                      {region.digit}
                    </p>
                    <p className="mt-1 text-sm font-medium">{region.label}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {region.ufs.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>{tc("faqTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            <AccordionItem value="real">
              <AccordionTrigger>{t("faqInlineQ1")}</AccordionTrigger>
              <AccordionContent>{t("faqInlineA1")}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="diff">
              <AccordionTrigger>{t("faqInlineQ2")}</AccordionTrigger>
              <AccordionContent>{t("faqInlineA2")}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="prod">
              <AccordionTrigger>{t("faqInlineQ3")}</AccordionTrigger>
              <AccordionContent>{t("faqInlineA3")}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
