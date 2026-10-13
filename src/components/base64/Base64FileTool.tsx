"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Copy,
  Download,
  ExternalLink,
  FileDown,
  FileUp,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  decodeBase64Smart,
  encodeBytesToBase64,
  formatByteSize,
  resolveFileMeta,
  validateBase64Upload,
  BASE64_FILE_MAX_BYTES,
  DECODE_FILE_ACCEPT,
  type Base64DecodeKind,
} from "@/lib/base64";
import { renderPdfFirstPage, useObjectUrl } from "@/lib/base64/preview";
import { cn, copyToClipboard, downloadBlob, downloadBytes } from "@/lib/utils";

type Mode = "decode" | "encode";
type DecodedOk = Extract<Base64DecodeKind, { ok: true }>;

type EncodeState = {
  name: string;
  base64: string;
  size: number;
  mime: string;
  label: string;
  extension: string;
  bytes: Uint8Array;
};

/** Primeiros chips sempre visíveis. */
const FORMAT_PREVIEW = [
  "PDF",
  "DOCX",
  "XLSX",
  "PPTX",
  "PNG",
  "JPEG",
  "WEBP",
  "GIF",
  "SVG",
  "ZIP",
  "MP3",
  "MP4",
] as const;

/** Resto aparece ao clicar em “+ outros”. */
const FORMAT_MORE = [
  "JSON",
  "CSV",
  "XML",
  "HTML",
  "CSS",
  "JS",
  "TS",
  "MD",
  "YAML",
  "SQL",
  "LOG",
  "ENV",
  "TOML",
  "INI",
  "TXT",
  "RTF",
  "ODT",
  "ODS",
  "RAR",
  "7Z",
  "TAR",
  "GZ",
  "TAR.GZ",
  "BMP",
  "TIFF",
  "ICO",
  "HEIC",
  "AVIF",
  "APK",
  "AAB",
  "EXE",
  "MSI",
  "DLL",
  "JAR",
  "EPUB",
  "MOBI",
  "PSD",
  "AI",
  "FIG",
] as const;

function suggestedName(sourceName: string, extension: string) {
  const base = sourceName
    .replace(/\.(base64\.)?(txt|b64|base64)$/i, "")
    .replace(/\.[^.]+$/i, "")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "arquivo"}.${extension}`;
}

function hexPreview(bytes: Uint8Array, max = 12) {
  return Array.from(bytes.slice(0, max))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ");
}

function FilePreview({
  bytes,
  mime,
  label,
}: {
  bytes: Uint8Array;
  mime: string;
  label: string;
}) {
  const t = useTranslations("Base64File");
  const objectUrl = useObjectUrl(bytes, mime);
  const isImage = mime.startsWith("image/");
  const isPdf = mime === "application/pdf";
  const [pdfPreview, setPdfPreview] = useState<{
    dataUrl: string;
    pages: number;
  } | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    if (!isPdf) return;
    let cancelled = false;
    setPdfLoading(true);
    setPdfError(false);
    setPdfPreview(null);
    void renderPdfFirstPage(bytes)
      .then((result) => {
        if (!cancelled) {
          setPdfPreview(result);
          setPdfLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPdfError(true);
          setPdfLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [bytes, isPdf]);

  if (isImage && objectUrl) {
    return (
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-900">
        <div className="flex items-center justify-between border-b border-stone-200 px-3 py-2 dark:border-stone-700">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {t("previewLabel", { type: label })}
          </span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={objectUrl}
          alt={label}
          className="mx-auto max-h-[520px] w-auto max-w-full object-contain p-4"
        />
      </div>
    );
  }

  if (isPdf) {
    return (
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-950">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 bg-stone-50 px-3 py-2 dark:border-stone-700 dark:bg-stone-900">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            {t("previewLabel", { type: label })}
            {pdfPreview ? ` · ${t("pages", { count: pdfPreview.pages })}` : ""}
          </span>
          {objectUrl && (
            <a
              href={objectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white dark:bg-amber-600 dark:text-slate-950"
            >
              <ExternalLink className="h-3 w-3" />
              {t("openTab")}
            </a>
          )}
        </div>

        {pdfLoading && (
          <div className="flex items-center justify-center gap-2 px-3 py-16 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("previewLoading")}
          </div>
        )}

        {pdfPreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pdfPreview.dataUrl}
            alt={t("previewLabel", { type: label })}
            className="mx-auto max-h-[640px] w-full max-w-full object-contain bg-stone-200/60 p-3 dark:bg-stone-900"
          />
        )}

        {pdfError && !pdfLoading && (
          <div className="space-y-3 px-4 py-10 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t("previewFailed")}
            </p>
            {objectUrl && (
              <a
                href={objectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-400"
              >
                <ExternalLink className="h-4 w-4" />
                {t("openTab")}
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center text-sm text-slate-500 dark:border-stone-700 dark:bg-stone-900">
      {t("noPreview", { type: label })}
    </div>
  );
}

export function Base64FilePanel() {
  const t = useTranslations("Base64File");
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("decode");
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [decoded, setDecoded] = useState<(DecodedOk & { sourceName: string }) | null>(
    null,
  );
  const [encoded, setEncoded] = useState<EncodeState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllFormats, setShowAllFormats] = useState(false);

  const hasResult =
    (mode === "decode" && decoded !== null) ||
    (mode === "encode" && encoded !== null);

  function clearAll() {
    setDecoded(null);
    setEncoded(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function switchMode(next: Mode) {
    setMode(next);
    clearAll();
  }

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    setDecoded(null);
    setEncoded(null);
    try {
      const gate = validateBase64Upload(file, mode);
      if (!gate.ok) {
        const msg =
          gate.error === "TOO_LARGE"
            ? t("errorTooLarge", {
                max: formatByteSize(BASE64_FILE_MAX_BYTES),
              })
            : t("errorFormatDecode");
        setError(msg);
        toast.error(msg);
        return;
      }

      if (mode === "decode") {
        // Arquivo binário (DOCX/PDF/…) não é Base64 — orientar o usuário.
        const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
        const looksBinary =
          (head[0] === 0x50 && head[1] === 0x4b) || // ZIP/DOCX
          (head[0] === 0x25 && head[1] === 0x50) || // %P PDF
          (head[0] === 0xff && head[1] === 0xd8) || // JPEG
          (head[0] === 0x89 && head[1] === 0x50); // PNG
        if (looksBinary) {
          setError(t("errorNeedBase64Text"));
          toast.error(t("errorNeedBase64Text"));
          return;
        }

        const text = await file.text();
        const result = decodeBase64Smart(text);
        if (!result.ok) {
          setError(t("errorDecode"));
          toast.error(t("errorDecode"));
          return;
        }
        setDecoded({ ...result, sourceName: file.name });
        toast.success(
          result.kind === "binary"
            ? t("decodedBinary", { type: result.label })
            : t("decodedText"),
        );
        return;
      }

      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const result = encodeBytesToBase64(bytes);
      if (!result.ok) {
        toast.error(t("errorEncode"));
        return;
      }
      const meta = resolveFileMeta(bytes, file.name, file.type);
      setEncoded({
        name: file.name,
        base64: result.output,
        size: bytes.length,
        mime: meta.mime,
        label: meta.label,
        extension: meta.extension,
        bytes,
      });
      toast.success(t("encodedOk", { name: file.name }));
    } catch {
      toast.error(mode === "decode" ? t("errorDecode") : t("errorEncode"));
      if (mode === "decode") setError(t("errorDecode"));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function downloadDecoded() {
    if (!decoded || decoded.kind !== "binary") return;
    downloadBytes(
      suggestedName(decoded.sourceName, decoded.extension),
      decoded.bytes,
      decoded.mime,
    );
    toast.success(t("downloaded"));
  }

  async function copyEncoded() {
    if (!encoded) return;
    await copyToClipboard(encoded.base64);
    toast.success(t("copied"));
  }

  function downloadEncodedTxt() {
    if (!encoded) return;
    const base = encoded.name.replace(/\.[^.]+$/, "") || "arquivo";
    downloadBlob(
      `${base}.base64.txt`,
      encoded.base64,
      "text/plain;charset=utf-8",
    );
    toast.success(t("downloaded"));
  }

  return (
    <div className="mt-1">
      <input
        ref={fileRef}
        type="file"
        accept={mode === "decode" ? DECODE_FILE_ACCEPT : undefined}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {/* Mode switch */}
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl border border-stone-200 bg-stone-50 p-1 dark:border-stone-700 dark:bg-stone-900">
        <button
          type="button"
          onClick={() => switchMode("decode")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
            mode === "decode"
              ? "bg-slate-900 text-white shadow-sm dark:bg-amber-600 dark:text-slate-950"
              : "text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-stone-800",
          )}
        >
          <FileDown className="h-4 w-4" />
          {t("tabDecode")}
        </button>
        <button
          type="button"
          onClick={() => switchMode("encode")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
            mode === "encode"
              ? "bg-slate-900 text-white shadow-sm dark:bg-amber-600 dark:text-slate-950"
              : "text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-stone-800",
          )}
        >
          <FileUp className="h-4 w-4" />
          {t("tabEncode")}
        </button>
      </div>

      {/* Sugestões de formato — “+ outros” revela a lista completa */}
      <div className="mt-3 rounded-xl border border-stone-200/80 bg-stone-50/80 px-3 py-2.5 dark:border-stone-800 dark:bg-stone-900/50">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-100">
            {mode === "encode" ? t("formatsAny") : t("formatsDecodeTitle")}
          </p>
          <p className="text-[11px] text-slate-400">
            {t("maxSize", { max: formatByteSize(BASE64_FILE_MAX_BYTES) })}
          </p>
        </div>
        <ul
          className="mt-2 flex list-none flex-wrap gap-1 p-0"
          aria-label={t("formatsSuggestLabel")}
        >
          {(showAllFormats
            ? [...FORMAT_PREVIEW, ...FORMAT_MORE]
            : FORMAT_PREVIEW
          ).map((fmt) => (
            <li
              key={fmt}
              className="rounded-md border border-stone-200/90 bg-white px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-slate-500 dark:border-stone-700 dark:bg-slate-950 dark:text-slate-400"
            >
              {fmt}
            </li>
          ))}
          <li className="list-none">
            <button
              type="button"
              onClick={() => setShowAllFormats((v) => !v)}
              aria-expanded={showAllFormats}
              className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 underline-offset-2 hover:underline dark:text-amber-300"
            >
              {showAllFormats
                ? t("formatsLess")
                : t("formatsMore", { count: FORMAT_MORE.length })}
            </button>
          </li>
        </ul>
      </div>

      {/* Dropzone — hidden when we have a result to keep focus on preview */}
      {!hasResult && (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileRef.current?.click();
          }}
          onClick={() => !busy && fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (busy) return;
            const file = e.dataTransfer.files?.[0];
            if (file) void handleFile(file);
          }}
          className={cn(
            "mt-4 flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-10 text-center transition",
            dragOver
              ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40"
              : "border-stone-300 bg-gradient-to-b from-stone-50 to-white hover:border-amber-400 dark:border-stone-700 dark:from-stone-900 dark:to-slate-950",
            busy && "pointer-events-none opacity-60",
          )}
        >
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md dark:bg-amber-600 dark:text-slate-950">
            {busy ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : mode === "decode" ? (
              <FileDown className="h-6 w-6" />
            ) : (
              <FileUp className="h-6 w-6" />
            )}
          </span>
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              {busy
                ? t("processing")
                : mode === "decode"
                  ? t("decodeDrop")
                  : t("encodeDrop")}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {mode === "decode" ? t("decodeDropSub") : t("encodeDropSub")}
            </p>
          </div>
          {!busy && (
            <Button type="button" size="sm" className="mt-1 pointer-events-none">
              {t("chooseFile")}
            </Button>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100">
          {error}
        </p>
      )}

      {/* DECODE RESULT */}
      {mode === "decode" && decoded && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                {decoded.kind === "binary"
                  ? t("binaryDetected", { type: decoded.label })
                  : t("textDetected")}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {t("fromFile", { name: decoded.sourceName })}
              </p>
            </div>
            <Button type="button" size="sm" variant="ghost" onClick={clearAll}>
              <Trash2 className="h-3.5 w-3.5" />
              {t("clear")}
            </Button>
          </div>

          {decoded.kind === "binary" && (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { k: t("detailType"), v: decoded.label },
                  { k: t("detailMime"), v: decoded.mime },
                  { k: t("detailSize"), v: formatByteSize(decoded.size) },
                  {
                    k: t("detailName"),
                    v: suggestedName(decoded.sourceName, decoded.extension),
                  },
                ].map((item) => (
                  <div
                    key={item.k}
                    className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 dark:border-stone-700 dark:bg-stone-900"
                  >
                    <p className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
                      {item.k}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {item.v}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-400">
                {t("detailMagic")}:{" "}
                <span className="font-mono">{hexPreview(decoded.bytes)}</span>
              </p>

              <FilePreview
                bytes={decoded.bytes}
                mime={decoded.mime}
                label={decoded.label}
              />

              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={downloadDecoded}>
                  <Download className="h-4 w-4" />
                  {t("downloadFile", { ext: decoded.extension.toUpperCase() })}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                >
                  {t("chooseAnother")}
                </Button>
              </div>
            </>
          )}

          {decoded.kind === "text" && (
            <>
              <textarea
                readOnly
                rows={10}
                value={decoded.output}
                className="w-full resize-y rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-mono text-sm dark:border-stone-700 dark:bg-stone-900"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    void copyToClipboard(decoded.output).then(() =>
                      toast.success(t("copied")),
                    );
                  }}
                >
                  <Copy className="h-4 w-4" />
                  {t("copy")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                >
                  {t("chooseAnother")}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ENCODE RESULT */}
      {mode === "encode" && encoded && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                {t("encodedTitle", { name: encoded.name })}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {t("encodedMeta", {
                  size: formatByteSize(encoded.size),
                  chars: encoded.base64.length.toLocaleString(),
                })}
              </p>
            </div>
            <Button type="button" size="sm" variant="ghost" onClick={clearAll}>
              <Trash2 className="h-3.5 w-3.5" />
              {t("clear")}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { k: t("detailType"), v: encoded.label },
              { k: t("detailMime"), v: encoded.mime },
              { k: t("detailSize"), v: formatByteSize(encoded.size) },
              {
                k: t("detailBase64Len"),
                v: `${encoded.base64.length.toLocaleString()}`,
              },
            ].map((item) => (
              <div
                key={item.k}
                className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 dark:border-stone-700 dark:bg-stone-900"
              >
                <p className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
                  {item.k}
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {item.v}
                </p>
              </div>
            ))}
          </div>

          {(encoded.mime.startsWith("image/") ||
            encoded.mime === "application/pdf") && (
            <FilePreview
              bytes={encoded.bytes}
              mime={encoded.mime}
              label={encoded.label}
            />
          )}

          <textarea
            readOnly
            rows={6}
            value={encoded.base64}
            className="w-full resize-y rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-mono text-xs dark:border-stone-700 dark:bg-stone-900"
          />

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void copyEncoded()}>
              <Copy className="h-4 w-4" />
              {t("copy")}
            </Button>
            <Button type="button" variant="outline" onClick={downloadEncodedTxt}>
              <Download className="h-4 w-4" />
              {t("downloadTxt")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => fileRef.current?.click()}
            >
              {t("chooseAnother")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/** @deprecated Use Base64Tool on /base64 — kept for redirect page. */
export function Base64FileTool() {
  return <Base64FilePanel />;
}

