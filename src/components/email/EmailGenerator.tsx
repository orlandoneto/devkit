"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/form";
import { ResultBox } from "@/components/tools/ResultBox";
import { ToolShell } from "@/components/tools/ToolShell";
import { LocalHistoryPanel } from "@/components/tools/LocalHistoryPanel";
import {
  InfoTip,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  EMAIL_FORMATS,
  InvalidEmailDomainError,
  PRESET_DOMAINS,
  generateEmails,
  isReservedTestDomain,
  normalizeDomain,
  type EmailFormat,
} from "@/lib/email";
import { useCopyFeedback } from "@/hooks/useCopyFeedback";
import { useEmailHistoryStore } from "@/store/tool-history-stores";

const CUSTOM_DOMAIN = "custom";

const FORMAT_LABEL_KEYS = {
  "nome.sobrenome": "formats.nomeSobrenome",
  nome_sobrenome: "formats.nomeUnderline",
  "inicial.sobrenome": "formats.inicialSobrenome",
  "nome.numero": "formats.nomeNumero",
  aleatorio: "formats.aleatorio",
} as const;

export function EmailGenerator() {
  const t = useTranslations("Email");
  const [quantity, setQuantity] = useState(1);
  const [format, setFormat] = useState<EmailFormat>("nome.sobrenome");
  const [domainPreset, setDomainPreset] = useState<string>(PRESET_DOMAINS[0]);
  const [customDomain, setCustomDomain] = useState("");
  const [domainError, setDomainError] = useState<string | null>(null);
  const [emails, setEmails] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { copied, copy } = useCopyFeedback();
  const history = useEmailHistoryStore((s) => s.history);
  const used = useEmailHistoryStore((s) => s.used);
  const pushGenerated = useEmailHistoryStore((s) => s.pushGenerated);
  const markUsed = useEmailHistoryStore((s) => s.markUsed);
  const clearHistory = useEmailHistoryStore((s) => s.clearHistory);

  const resolvedCustomDomain = useMemo(
    () => normalizeDomain(customDomain),
    [customDomain],
  );
  const showDomainWarning =
    domainPreset === CUSTOM_DOMAIN &&
    resolvedCustomDomain !== null &&
    !isReservedTestDomain(resolvedCustomDomain);

  function resolveDomain(): string | null {
    if (domainPreset !== CUSTOM_DOMAIN) return domainPreset;
    return normalizeDomain(customDomain);
  }

  function generate(save = true) {
    const domain = resolveDomain();
    if (!domain) {
      setDomainError(t("domainInvalid"));
      return [];
    }

    setDomainError(null);
    let next: string[] = [];
    try {
      next = generateEmails({ quantity, domain, format });
    } catch (error) {
      if (error instanceof InvalidEmailDomainError) {
        setDomainError(t("domainInvalid"));
        return [];
      }
      throw error;
    }

    setEmails(next);
    setCopiedId(null);
    if (save) {
      pushGenerated(next.map((email) => ({ id: email, display: email })));
    }
    return next;
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => generate(false));
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function copyValue(text: string, ids: string[], source: string) {
    await copy(text);
    setCopiedId(source);
    ids.forEach((id) => markUsed({ id, display: id }));
  }

  return (
    <div>
      <ToolShell
        title={t("title")}
        description={t("description")}
        notice={t("notice")}
      >
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label
              htmlFor="email-qty"
              className="inline-flex items-center gap-1 text-sm text-slate-500"
            >
              {t("quantity")}
              <InfoTip text={t("quantityTip")} />
            </Label>
            <Input
              id="email-qty"
              type="number"
              min={1}
              max={100}
              inputMode="numeric"
              value={quantity}
              onChange={(event) => {
                const next = Number(event.target.value);
                if (!Number.isFinite(next)) return;
                setQuantity(Math.min(100, Math.max(1, Math.trunc(next))));
              }}
              className="h-9"
            />
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="email-format"
              className="inline-flex items-center gap-1 text-sm text-slate-500"
            >
              {t("format")}
              <InfoTip text={t("formatTip")} />
            </Label>
            <Select
              id="email-format"
              className="h-9"
              value={format}
              onChange={(event) => setFormat(event.target.value as EmailFormat)}
            >
              {EMAIL_FORMATS.map((option) => (
                <option key={option} value={option}>
                  {t(FORMAT_LABEL_KEYS[option])}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="email-domain"
              className="inline-flex items-center gap-1 text-sm text-slate-500"
            >
              {t("domain")}
              <InfoTip text={t("domainTip")} />
            </Label>
            <Select
              id="email-domain"
              className="h-9"
              value={domainPreset}
              onChange={(event) => {
                setDomainPreset(event.target.value);
                setDomainError(null);
              }}
            >
              {PRESET_DOMAINS.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
              <option value={CUSTOM_DOMAIN}>{t("domainCustom")}</option>
            </Select>
          </div>
        </div>

        {domainPreset === CUSTOM_DOMAIN && (
          <div className="mt-3 space-y-1">
            <Label
              htmlFor="email-custom-domain"
              className="inline-flex items-center gap-1 text-sm text-slate-500"
            >
              {t("customDomain")}
              <InfoTip text={t("customDomainTip")} />
            </Label>
            <Input
              id="email-custom-domain"
              value={customDomain}
              placeholder={t("customDomainPlaceholder")}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-invalid={domainError ? true : undefined}
              onChange={(event) => {
                setCustomDomain(event.target.value);
                setDomainError(null);
              }}
              className="h-9"
            />
          </div>
        )}

        {domainError && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">
            {domainError}
          </p>
        )}

        {showDomainWarning && (
          <p className="mt-2 rounded-lg border border-amber-200/80 bg-amber-50/70 px-3 py-2 text-xs leading-relaxed text-slate-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-slate-200">
            {t("domainWarning")}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" className="h-9 px-4" onClick={() => generate()}>
                <Wand2 className="h-3.5 w-3.5" />
                {t("generate")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("generateTip")}</TooltipContent>
          </Tooltip>

          <Button
            size="sm"
            variant="outline"
            className="h-9 px-4"
            disabled={emails.length === 0}
            onClick={() => copyValue(emails.join("\n"), emails, "all")}
          >
            {copied && copiedId === "all" ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {t("copyAll")}
          </Button>
        </div>

        {emails.length === 1 && (
          <ResultBox
            label={t("generated")}
            value={emails[0]}
            badges={[t("badgeTest")]}
            copied={copied && copiedId === emails[0]}
            onCopy={() => copyValue(emails[0], [emails[0]], emails[0])}
            copyTip={t("copyOne")}
          />
        )}

        {emails.length > 1 && (
          <div className="mt-3 min-w-0 overflow-hidden rounded-lg border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between gap-2 border-b border-stone-200 bg-stone-50 px-3 py-2 dark:border-stone-800 dark:bg-stone-900">
              <p className="inline-flex items-center gap-1 text-sm font-medium">
                {t("listLabel", { count: emails.length })}
                <InfoTip text={t("listTip")} />
              </p>
            </div>
            <ul className="max-h-64 overflow-auto">
              {emails.map((email) => (
                <li
                  key={email}
                  className="flex items-center gap-2 border-t border-stone-100 px-3 py-1.5 first:border-t-0 dark:border-stone-900"
                >
                  <span className="min-w-0 flex-1 break-all font-mono text-sm text-slate-900 dark:text-white">
                    {email}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={t("copyOne")}
                    onClick={() => copyValue(email, [email], email)}
                  >
                    {copied && copiedId === email ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
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
          void copyValue(item.display, [item.id], item.id);
        }}
      />
    </div>
  );
}
