"use client";

import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { useTranslations } from "next-intl";
import { CheckCircle2, Download, ImageDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/form";
import { ToolShell } from "@/components/tools/ToolShell";
import { InfoTip } from "@/components/ui/tooltip";
import {
  BARCODE_FONTS,
  BARCODE_FORMATS,
  BARCODE_ROTATIONS,
  getBarcodeFormatMeta,
  sanitizeBarcodeFilename,
  type BarcodeFormat,
  type BarcodeRotation,
} from "@/lib/barcode";
import { convertDigitableLine } from "@/lib/boleto";
import { downloadBlob } from "@/lib/utils";

export function BarcodeGenerator() {
  const t = useTranslations("CodigoBarras");
  const svgRef = useRef<SVGSVGElement>(null);
  const [format, setFormat] = useState<BarcodeFormat>("CODE128");
  const [value, setValue] = useState(getBarcodeFormatMeta("CODE128").example);
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(80);
  const [rotation, setRotation] = useState<BarcodeRotation>(0);
  const [displayValue, setDisplayValue] = useState(true);
  const [font, setFont] = useState<string>("monospace");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [detectionNotice, setDetectionNotice] = useState<string | null>(null);

  const formatMeta = getBarcodeFormatMeta(format);
  const formatHint = t(`hint${format}` as "hintCODE128");

  function typeLabel(type: string) {
    return type === "arrecadacao" ? t("typeArrecadacao") : t("typeBoleto");
  }

  function renderBarcode(nextValue = value) {
    const svg = svgRef.current;
    if (!svg) return;

    const trimmed = nextValue.trim();
    if (!trimmed) {
      setError(null);
      setReady(false);
      svg.replaceChildren();
      return;
    }

    const digitCount = trimmed.replace(/\D/g, "").length;
    if (digitCount === 47 || digitCount === 48) {
      const conversion = convertDigitableLine(trimmed);
      if (!conversion.success) {
        setError(t("digitableDetectedError", { error: conversion.error }));
        setReady(false);
        svg.replaceChildren();
        return;
      }
    }

    try {
      JsBarcode(svg, trimmed, {
        format,
        width,
        height,
        displayValue,
        font,
        fontSize: 16,
        textMargin: 6,
        margin: 12,
        background: "#ffffff",
        lineColor: "#0f172a",
        valid: (valid) => {
          if (!valid) {
            setError(t("errorInvalidValue"));
            setReady(false);
          }
        },
      });
      setError(null);
      setReady(true);
    } catch {
      setError(t("errorGenerate", { format: formatMeta.label }));
      setReady(false);
      svg.replaceChildren();
    }
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => renderBarcode());
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format, width, height, displayValue, font, value]);

  useEffect(() => {
    if (!detectionNotice) return;
    const timeout = window.setTimeout(() => setDetectionNotice(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [detectionNotice]);

  function handleFormatChange(next: BarcodeFormat) {
    setError(null);
    setReady(false);
    setFormat(next);
    setValue(getBarcodeFormatMeta(next).example);
    setDetectionNotice(null);
  }

  function handleValueChange(nextValue: string) {
    setError(null);
    setReady(false);
    const digitCount = nextValue.replace(/\D/g, "").length;

    if (digitCount === 47 || digitCount === 48) {
      const conversion = convertDigitableLine(nextValue);
      if (conversion.success) {
        setFormat("ITF");
        setWidth(1);
        setValue(conversion.barcode);
        setDetectionNotice(
          t("digitableDetectedNotice", { type: typeLabel(conversion.type) }),
        );
        toast.success(t("digitableDetectedToast"));
        return;
      }
    }

    setDetectionNotice(null);
    setValue(nextValue);
  }

  function downloadSvg() {
    const svg = svgRef.current;
    if (!svg || !ready) {
      toast.error(t("errorDownload"));
      return;
    }
    const markup = new XMLSerializer().serializeToString(svg);
    downloadBlob(
      `${sanitizeBarcodeFilename(value)}.svg`,
      markup,
      "image/svg+xml;charset=utf-8",
    );
    toast.success(t("svgDownloaded"));
  }

  function downloadPng() {
    const svg = svgRef.current;
    if (!svg || !ready) {
      toast.error(t("errorDownload"));
      return;
    }

    const markup = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([markup], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const img = new window.Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const bbox = svg.getBBox();
      const scale = 2;
      const w = Math.max(bbox.width + 24, svg.width.baseVal.value || 300);
      const h = Math.max(bbox.height + 24, svg.height.baseVal.value || 120);
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        toast.error(t("errorPng"));
        return;
      }
      ctx.scale(scale, scale);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob((png) => {
        URL.revokeObjectURL(url);
        if (!png) {
          toast.error(t("errorPng"));
          return;
        }
        const link = document.createElement("a");
        link.href = URL.createObjectURL(png);
        link.download = `${sanitizeBarcodeFilename(value)}.png`;
        link.click();
        URL.revokeObjectURL(link.href);
        toast.success(t("pngDownloaded"));
      }, "image/png");
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error(t("errorSvgToPng"));
    };

    img.src = url;
  }

  return (
    <ToolShell
      title={t("title")}
      description={t("description")}
      notice={t("notice")}
    >
      <div className="mt-3 grid grid-cols-2 gap-x-2.5 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
        <div className="col-span-2 min-w-0 space-y-1 sm:col-span-1 lg:col-span-1">
          <Label htmlFor="barcode-format" className="inline-flex items-center gap-1">
            {t("type")}
            <InfoTip text={formatHint} />
          </Label>
          <Select
            id="barcode-format"
            value={format}
            onChange={(e) => handleFormatChange(e.target.value as BarcodeFormat)}
          >
            {BARCODE_FORMATS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="min-w-0 space-y-1">
          <Label htmlFor="barcode-width" className="inline-flex items-center gap-1">
            {t("size")}
            <InfoTip text={t("sizeTip")} />
          </Label>
          <Select
            id="barcode-width"
            value={String(width)}
            onChange={(e) => setWidth(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </div>

        <div className="min-w-0 space-y-1">
          <Label htmlFor="barcode-height" className="inline-flex items-center gap-1">
            {t("height")}
            <InfoTip text={t("heightTip")} />
          </Label>
          <Input
            id="barcode-height"
            type="number"
            min={40}
            max={200}
            value={height}
            onChange={(e) =>
              setHeight(Math.min(200, Math.max(40, Number(e.target.value) || 80)))
            }
            className="h-10"
          />
        </div>

        <div className="min-w-0 space-y-1">
          <Label htmlFor="barcode-rotation" className="inline-flex items-center gap-1">
            {t("rotation")}
            <InfoTip text={t("rotationTip")} />
          </Label>
          <Select
            id="barcode-rotation"
            value={String(rotation)}
            onChange={(e) =>
              setRotation(Number(e.target.value) as BarcodeRotation)
            }
          >
            {BARCODE_ROTATIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="col-span-2 min-w-0 space-y-1 sm:col-span-1">
          <Label htmlFor="barcode-font" className="inline-flex items-center gap-1">
            {t("font")}
            <InfoTip text={t("fontTip")} />
          </Label>
          <Select
            id="barcode-font"
            value={font}
            onChange={(e) => setFont(e.target.value)}
            disabled={!displayValue}
          >
            {BARCODE_FONTS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="col-span-2 flex items-end sm:col-span-1">
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={displayValue}
              onChange={(e) => setDisplayValue(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 accent-slate-900"
            />
            {t("withText")}
            <InfoTip text={t("withTextTip")} />
          </label>
        </div>
      </div>

      <div className="mt-2.5 space-y-1">
        <Label htmlFor="barcode-value" className="inline-flex items-center gap-1">
          {t("code")}
          <InfoTip text={formatHint} />
        </Label>
        <Input
          id="barcode-value"
          value={value}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder={formatMeta.example}
          className="h-10 font-mono"
        />
        {detectionNotice && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-300"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{detectionNotice}</span>
          </div>
        )}
      </div>

      <div className="mt-3 overflow-auto rounded-lg border border-dashed border-stone-300 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-900/40">
        <div
          className={`flex items-center justify-center ${
            rotation === 90 || rotation === 270
              ? "min-h-[180px] py-6 sm:min-h-[220px]"
              : "min-h-[108px] sm:min-h-[120px]"
          }`}
        >
          {error ? (
            <p className="max-w-md text-center text-sm text-rose-600 dark:text-rose-400">
              {error}
            </p>
          ) : (
            <div
              style={{
                transform: `rotate(${rotation}deg)`,
                transformOrigin: "center center",
              }}
              className="inline-flex max-w-full rounded-md bg-white p-1.5 shadow-sm [&>svg]:h-auto [&>svg]:max-w-full"
            >
              <svg
                ref={svgRef}
                aria-label={t("ariaLabel", { format: formatMeta.label })}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!ready}
          onClick={downloadSvg}
        >
          <Download className="h-3.5 w-3.5" />
          {t("downloadSvg")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!ready}
          onClick={downloadPng}
        >
          <ImageDown className="h-3.5 w-3.5" />
          {t("downloadPng")}
        </Button>
      </div>
    </ToolShell>
  );
}
