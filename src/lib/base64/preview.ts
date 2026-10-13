"use client";

import { useEffect, useState } from "react";

const WORKER_SRC = "/pdf.worker.min.mjs";
const PREVIEW_SCALE = 1.35;

export type PdfPreviewResult = {
  dataUrl: string;
  pages: number;
};

/** Render first PDF page to a PNG data URL (client-only; dynamic import avoids SSR crash). */
export async function renderPdfFirstPage(
  bytes: Uint8Array,
): Promise<PdfPreviewResult> {
  const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
  if (GlobalWorkerOptions.workerSrc !== WORKER_SRC) {
    GlobalWorkerOptions.workerSrc = WORKER_SRC;
  }

  const data = bytes.slice();
  const pdf = await getDocument({ data }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: PREVIEW_SCALE });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, canvas, viewport }).promise;
  const dataUrl = canvas.toDataURL("image/png");
  const pages = pdf.numPages;
  await pdf.destroy();
  return { dataUrl, pages };
}

export function useObjectUrl(bytes: Uint8Array | null, mime: string) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!bytes) {
      setUrl(null);
      return;
    }
    const copy = new Uint8Array(bytes);
    const next = URL.createObjectURL(new Blob([copy], { type: mime }));
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [bytes, mime]);

  return url;
}
