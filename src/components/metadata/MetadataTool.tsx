"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, Eraser, ImageUp, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ToolShell } from "@/components/tools/ToolShell";
import {
  METADATA_LIMITS,
  readImageMetadata,
  type ImageMetadataResult,
  type MetadataRow,
} from "@/lib/metadata";
import { copyToClipboard } from "@/lib/utils";

export function MetadataTool() {
  const t = useTranslations("Metadados");
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageMetadataResult | null>(null);

  async function onFile(file: File) {
    setError(null);
    setResult(null);
    setBusy(true);
    let url: string | null = null;
    try {
      url = URL.createObjectURL(file);
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      const data = await readImageMetadata(file);
      setResult(data);
      if (!data.hasExif) toast.message(t("noExif"));
      else toast.success(t("done"));
    } catch (err) {
      const code = err instanceof Error ? err.message : "UNKNOWN";
      if (code === "UNSUPPORTED_TYPE") setError(t("errorType"));
      else if (code === "FILE_TOO_LARGE") setError(t("errorSize"));
      else setError(t("errorGeneric"));
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function copyAll() {
    if (!result) return;
    await copyToClipboard(JSON.stringify(result.raw, null, 2));
    toast.success(t("copied"));
  }

  const labelMap: Record<string, string> = {
    name: t("fields.name"),
    type: t("fields.type"),
    size: t("fields.size"),
    lastModified: t("fields.lastModified"),
    dimensions: t("fields.dimensions"),
    megapixels: t("fields.megapixels"),
    aspectRatio: t("fields.aspectRatio"),
    orientation: t("fields.orientation"),
    colorSpace: t("fields.colorSpace"),
    bitDepth: t("fields.bitDepth"),
    make: t("fields.make"),
    model: t("fields.model"),
    lens: t("fields.lens"),
    software: t("fields.software"),
    dateTime: t("fields.dateTime"),
    iso: t("fields.iso"),
    fNumber: t("fields.fNumber"),
    exposureTime: t("fields.exposureTime"),
    focalLength: t("fields.focalLength"),
    flash: t("fields.flash"),
    latitude: t("fields.latitude"),
    longitude: t("fields.longitude"),
    altitude: t("fields.altitude"),
    gpsRef: t("fields.gpsRef"),
    artist: t("fields.artist"),
    copyright: t("fields.copyright"),
    description: t("fields.description"),
    keywords: t("fields.keywords"),
  };

  function rowLabel(key: string) {
    return labelMap[key] ?? key;
  }

  return (
    <ToolShell title={t("title")} description={t("description")} notice={t("notice")}>
      <input
        ref={inputRef}
        type="file"
        accept={METADATA_LIMITS.acceptedTypes.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onFile(file);
        }}
      />

      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const file = e.dataTransfer.files?.[0];
          if (file) void onFile(file);
        }}
        className="mt-3 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 px-4 py-8 text-center transition hover:border-amber-500 hover:bg-amber-50 disabled:opacity-60 dark:border-amber-800/60 dark:bg-amber-950/20"
      >
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-amber-600 dark:text-slate-950">
          {busy ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <ImageUp className="h-6 w-6" />
          )}
        </span>
        <span className="text-sm font-semibold text-slate-900 dark:text-white">
          {t("chooseImage")}
        </span>
        <span className="text-xs text-slate-500">{t("dropHint")}</span>
        <span className="text-[11px] text-slate-400">
          {t("hint", { mb: METADATA_LIMITS.maxMb })}
        </span>
      </button>

      {(preview || result) && (
        <div className="mt-2 flex justify-end gap-2">
          {result && (
            <Button size="sm" variant="outline" onClick={() => void copyAll()}>
              <Copy className="h-4 w-4" />
              {t("copyJson")}
            </Button>
          )}
          <Button size="sm" variant="ghost" disabled={busy} onClick={clear}>
            <Eraser className="h-4 w-4" />
            {t("clear")}
          </Button>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </p>
      )}

      {preview && (
        <div className="mt-3 overflow-hidden rounded-lg border border-dashed border-stone-300 bg-stone-50 p-2 dark:border-stone-700 dark:bg-stone-900/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt={t("previewAlt")}
            className="mx-auto max-h-48 rounded object-contain"
          />
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-3">
          {!result.hasExif && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100">
              {t("noExif")}
            </p>
          )}
          <MetaSection title={t("sections.file")} rows={result.file} labelOf={rowLabel} />
          <MetaSection title={t("sections.image")} rows={result.image} labelOf={rowLabel} />
          <MetaSection title={t("sections.camera")} rows={result.camera} labelOf={rowLabel} />
          {result.gps.length > 0 && (
            <section className="rounded-lg border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-slate-950">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t("sections.gps")}
                </p>
                {result.mapUrl && (
                  <a
                    href={result.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-400"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    {t("openMap")}
                  </a>
                )}
              </div>
              <MetaRows rows={result.gps} labelOf={rowLabel} />
            </section>
          )}
          <MetaSection title={t("sections.other")} rows={result.other} labelOf={rowLabel} />
        </div>
      )}
    </ToolShell>
  );
}

function MetaSection({
  title,
  rows,
  labelOf,
}: {
  title: string;
  rows: MetadataRow[];
  labelOf: (key: string) => string;
}) {
  if (rows.length === 0) return null;
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-slate-950">
      <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
        {title}
      </p>
      <MetaRows rows={rows} labelOf={labelOf} />
    </section>
  );
}

function MetaRows({
  rows,
  labelOf,
}: {
  rows: MetadataRow[];
  labelOf: (key: string) => string;
}) {
  return (
    <dl className="space-y-1.5 text-sm">
      {rows.map((row) => (
        <div
          key={`${row.label}-${row.value}`}
          className="grid gap-0.5 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-3"
        >
          <dt className="text-xs font-medium text-slate-500">{labelOf(row.label)}</dt>
          <dd className="break-all font-mono text-xs text-slate-800 dark:text-slate-200">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
