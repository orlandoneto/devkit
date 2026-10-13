"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Eraser,
  ImageUp,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ToolShell } from "@/components/tools/ToolShell";
import { Link } from "@/i18n/navigation";
import { formatCNPJ } from "@/lib/cnpj";
import { formatCPF } from "@/lib/cpf";
import {
  assertOcrFile,
  extractCandidates,
  isPdfFile,
  OCR_LIMITS,
} from "@/lib/ocr";
import { recognizeImageBest } from "@/lib/ocr/recognize";
import { copyToClipboard } from "@/lib/utils";

type OcrResult = ReturnType<typeof extractCandidates>;

export function OCRTool() {
  const t = useTranslations("Ocr");
  const locale = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const previewObjectUrlRef = useRef(false);
  const busyRef = useRef(false);
  const runOcrRef = useRef<(file: File) => Promise<void>>(async () => {});
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pasteReady, setPasteReady] = useState(false);

  busyRef.current = busy;

  function setPreviewSource(url: string, isObjectUrl: boolean) {
    setPreview((prev) => {
      if (prev && previewObjectUrlRef.current) URL.revokeObjectURL(prev);
      return url;
    });
    previewObjectUrlRef.current = isObjectUrl;
  }

  async function runOcr(file: File) {
    setError(null);
    setResult(null);
    setBusy(true);
    setProgress(0);
    setStatus(t("statusLoading"));

    try {
      assertOcrFile(file);

      let text = "";

      if (isPdfFile(file)) {
        setStatus(t("statusPdf"));
        const { preparePdfForOcr } = await import("@/lib/ocr/pdf");
        const prepared = await preparePdfForOcr(file, OCR_LIMITS.maxPdfPages);
        setPreviewSource(prepared.previewUrl, false);

        if (prepared.totalPages > prepared.pagesUsed) {
          toast.message(
            t("pdfPagesTruncated", {
              used: prepared.pagesUsed,
              total: prepared.totalPages,
            }),
          );
        }

        if (prepared.mode === "text") {
          text = prepared.text;
          setProgress(100);
        } else {
          const lang = locale === "en" ? "eng" : "por";
          const parts: string[] = [];
          for (let i = 0; i < prepared.canvases.length; i += 1) {
            setStatus(
              t("statusPage", {
                current: i + 1,
                total: prepared.canvases.length,
              }),
            );
            const pass = await recognizeImageBest(prepared.canvases[i], {
              lang,
              onProgress: setProgress,
              onStatus: (s) => {
                if (s === "loading") setStatus(t("statusLoading"));
                else if (s === "reading") setStatus(t("statusReading"));
              },
            });
            if (pass.text.trim()) parts.push(pass.text.trim());
          }
          text = parts.join("\n\n");
        }
      } else {
        const objectUrl = URL.createObjectURL(file);
        setPreviewSource(objectUrl, true);

        setStatus(t("statusPreparing"));
        // Português puro evita confusão com inglês (H1 ≠ MY etc.)
        const lang = locale === "en" ? "eng" : "por";
        const pass = await recognizeImageBest(file, {
          lang,
          onProgress: setProgress,
          onStatus: (s) => {
            if (s === "loading") setStatus(t("statusLoading"));
            else if (s === "reading") setStatus(t("statusReading"));
            else setStatus(t("statusPreparing"));
          },
        });
        text = pass.text;
      }

      const extracted = extractCandidates(text);
      setResult(extracted);
      if (!extracted.text.trim()) {
        setError(t("emptyResult"));
      } else {
        toast.success(t("done"));
      }
    } catch (err) {
      const code = err instanceof Error ? err.message : "UNKNOWN";
      if (code === "UNSUPPORTED_TYPE") setError(t("errorType"));
      else if (code === "FILE_TOO_LARGE") setError(t("errorSize"));
      else if (
        code === "PDF_RENDER_FAILED" ||
        code.toLowerCase().includes("pdf")
      ) {
        setError(t("errorPdf"));
      } else setError(t("errorGeneric"));
    } finally {
      setBusy(false);
      setStatus(null);
      setProgress(0);
    }
  }

  runOcrRef.current = runOcr;

  function handlePasteEvent(event: React.ClipboardEvent | ClipboardEvent) {
    if (busyRef.current) return false;

    const clipboard =
      "clipboardData" in event ? event.clipboardData : null;
    if (!clipboard) return false;

    let image: File | null = null;
    for (const item of clipboard.items) {
      if (item.type.startsWith("image/")) {
        image = item.getAsFile();
        if (image) break;
      }
    }
    if (!image) {
      for (const file of clipboard.files) {
        if (file.type.startsWith("image/")) {
          image = file;
          break;
        }
      }
    }
    if (!image) return false;

    event.preventDefault();
    void runOcrRef.current(image);
    return true;
  }

  useEffect(() => {
    dropZoneRef.current?.focus({ preventScroll: true });

    function onWindowPaste(event: ClipboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          "input:not([type='file']), textarea, [contenteditable='true']",
        )
      ) {
        return;
      }
      handlePasteEvent(event);
    }

    window.addEventListener("paste", onWindowPaste);
    return () => window.removeEventListener("paste", onWindowPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clear() {
    if (preview && previewObjectUrlRef.current) URL.revokeObjectURL(preview);
    previewObjectUrlRef.current = false;
    setPreview(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setStatus(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function copyText(value: string) {
    await copyToClipboard(value);
    toast.success(t("copied"));
  }

  return (
    <ToolShell
      title={t("title")}
      description={t("description")}
      notice={t("notice")}
    >
      <input
        ref={inputRef}
        type="file"
        accept={OCR_LIMITS.acceptedTypes.join(",")}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void runOcr(file);
        }}
      />

      <div
        ref={dropZoneRef}
        data-ocr-dropzone
        role="region"
        tabIndex={0}
        aria-label={t("chooseImage")}
        aria-disabled={busy}
        onFocus={() => setPasteReady(true)}
        onBlur={() => setPasteReady(false)}
        onPaste={(event) => {
          handlePasteEvent(event);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (busy) return;
          const file = event.dataTransfer.files?.[0];
          if (file) void runOcr(file);
        }}
        className={`mt-3 flex w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-3 py-4 text-center outline-none transition ${
          busy
            ? "pointer-events-none opacity-60 border-amber-300 bg-amber-50/50 dark:border-amber-800/60 dark:bg-amber-950/20"
            : pasteReady
              ? "border-amber-500 bg-amber-50 ring-2 ring-amber-400/50 dark:border-amber-500 dark:bg-amber-950/30 dark:ring-amber-500/40"
              : "border-amber-300 bg-amber-50/50 hover:border-amber-500 hover:bg-amber-50 dark:border-amber-800/60 dark:bg-amber-950/20 dark:hover:border-amber-600 dark:hover:bg-amber-950/30"
        }`}
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-amber-600 dark:text-slate-950">
          <ImageUp className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold text-slate-900 dark:text-white">
          {t("chooseImage")}
        </span>
        <span className="max-w-sm text-[11px] leading-snug text-slate-500 dark:text-slate-400">
          {pasteReady ? t("pasteReady") : t("dropHint")}
        </span>
        <Button
          type="button"
          size="sm"
          className="mt-0.5 h-8"
          disabled={busy}
          onClick={(event) => {
            event.stopPropagation();
            inputRef.current?.click();
          }}
        >
          {t("browseFiles")}
        </Button>
        <span className="text-[10px] text-slate-400">
          {t("hint", { mb: OCR_LIMITS.maxMb, pages: OCR_LIMITS.maxPdfPages })}
        </span>
      </div>
      <p className="mt-1.5 text-xs text-slate-500">
        {t("metadataHint")}{" "}
        <Link
          href="/metadados"
          className="font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-300"
        >
          {t("openMetadata")}
        </Link>
      </p>

      {(preview || result) && (
        <div className="mt-2 flex justify-end">
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={clear}
          >
            <Eraser className="h-4 w-4" />
            {t("clear")}
          </Button>
        </div>
      )}

      <details className="mt-2 group">
        <summary className="cursor-pointer list-none text-xs text-slate-500 marker:content-none hover:text-slate-700 dark:hover:text-slate-300 [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            {t("limitsSummary")}
            <span className="text-slate-400 group-open:hidden">▾</span>
            <span className="hidden text-slate-400 group-open:inline">▴</span>
          </span>
        </summary>
        <ul className="mt-2 space-y-1 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs leading-relaxed text-slate-600 dark:border-stone-800 dark:bg-stone-900/40 dark:text-slate-300">
          <li>{t("limitGood")}</li>
          <li>{t("limitBad")}</li>
          <li>{t("limitPdf", { pages: OCR_LIMITS.maxPdfPages })}</li>
          <li>{t("limitReview")}</li>
        </ul>
      </details>

      {preview && (
        <div className="mt-3 overflow-hidden rounded-lg border border-dashed border-stone-300 bg-stone-50 p-2 dark:border-stone-700 dark:bg-stone-900/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt={t("previewAlt")}
            className="mx-auto max-h-56 rounded object-contain"
          />
        </div>
      )}

      {busy && (
        <div className="mt-3 space-y-2 rounded-lg border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-slate-950">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            {status ?? t("statusReading")}
            {progress > 0 ? ` · ${progress}%` : ""}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
            <div
              className="h-full rounded-full bg-amber-500 transition-all"
              style={{ width: `${Math.max(progress, 8)}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </p>
      )}

      {result && (
        <section className="mt-4 space-y-3">
          <div className="rounded-lg border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-slate-950">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {t("extractedText")}
              </p>
              <Button
                size="sm"
                variant="outline"
                disabled={!result.text}
                onClick={() => copyText(result.text)}
              >
                <Copy className="h-3.5 w-3.5" />
                {t("copy")}
              </Button>
            </div>
            <textarea
              readOnly
              value={result.text}
              rows={8}
              className="w-full resize-y rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 font-mono text-sm text-slate-800 outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            />
            <p className="mt-2 text-xs text-slate-500">{t("reviewHint")}</p>
          </div>

          {(result.cpfs.length > 0 ||
            result.cnpjs.length > 0 ||
            result.digitableLines.length > 0) && (
            <div className="space-y-2">
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                {t("detectedTitle")}
              </p>

              {result.cpfs.map((cpf) => (
                <DetectedRow
                  key={`cpf-${cpf}`}
                  label="CPF"
                  value={formatCPF(cpf)}
                  href={`/cpf/validar`}
                  actionLabel={t("openCpf")}
                  onCopy={() => copyText(formatCPF(cpf))}
                  copyLabel={t("copy")}
                />
              ))}
              {result.cnpjs.map((cnpj) => (
                <DetectedRow
                  key={`cnpj-${cnpj}`}
                  label="CNPJ"
                  value={formatCNPJ(cnpj)}
                  href={`/cnpj/validar`}
                  actionLabel={t("openCnpj")}
                  onCopy={() => copyText(formatCNPJ(cnpj))}
                  copyLabel={t("copy")}
                />
              ))}
              {result.digitableLines.map((line) => (
                <DetectedRow
                  key={`line-${line}`}
                  label={t("digitableLabel")}
                  value={line}
                  href={`/linha-digitavel`}
                  actionLabel={t("openBoleto")}
                  onCopy={() => copyText(line)}
                  copyLabel={t("copy")}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </ToolShell>
  );
}

function DetectedRow({
  label,
  value,
  href,
  actionLabel,
  onCopy,
  copyLabel,
}: {
  label: string;
  value: string;
  href: string;
  actionLabel: string;
  onCopy: () => void;
  copyLabel: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-emerald-200 bg-emerald-50/50 px-3 py-2 sm:flex-row sm:items-center dark:border-emerald-900/50 dark:bg-emerald-950/20">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
          {label}
        </p>
        <p className="break-all font-mono text-sm text-slate-900 dark:text-white">
          {value}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={onCopy}>
          <Copy className="h-3.5 w-3.5" />
          {copyLabel}
        </Button>
        <Button size="sm" variant="secondary" asChild>
          <Link href={href}>{actionLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
