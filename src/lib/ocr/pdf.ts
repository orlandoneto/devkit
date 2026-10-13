import {
  getDocument,
  GlobalWorkerOptions,
  OPS,
  type PDFPageProxy,
} from "pdfjs-dist";

const WORKER_SRC = "/pdf.worker.min.mjs";
const EMBEDDED_TEXT_MIN = 40;
const RENDER_SCALE = 3;
const PREVIEW_SCALE = 1.25;

const IMAGE_OPS = new Set([
  OPS.paintImageXObject,
  OPS.paintInlineImageXObject,
  OPS.paintImageMaskXObject,
]);

const BOILERPLATE_HINTS = [
  "assinador serpro",
  "certificado digital",
  "medida provisória",
  "documento assinado",
  "assinador-digital",
  "qr-code",
  "validade poderá ser confirmada",
];

export type PdfPrepareResult =
  | {
      mode: "text";
      text: string;
      previewUrl: string;
      pagesUsed: number;
      totalPages: number;
    }
  | {
      mode: "ocr";
      canvases: HTMLCanvasElement[];
      previewUrl: string;
      pagesUsed: number;
      totalPages: number;
    };

function ensureWorker() {
  if (GlobalWorkerOptions.workerSrc !== WORKER_SRC) {
    GlobalWorkerOptions.workerSrc = WORKER_SRC;
  }
}

function isBoilerplateText(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim().toLowerCase();
  if (!normalized) return true;
  const hits = BOILERPLATE_HINTS.filter((hint) =>
    normalized.includes(hint),
  ).length;
  // CNH-e / Serpro signed docs: lots of signature text, little real data
  if (hits >= 2) return true;
  // Header-only style text without dense personal fields
  const digitRatio =
    (normalized.replace(/\D/g, "").length || 0) /
    Math.max(normalized.replace(/\s/g, "").length, 1);
  if (hits >= 1 && digitRatio < 0.08) return true;
  return false;
}

async function pageHasImages(page: PDFPageProxy) {
  const ops = await page.getOperatorList();
  return ops.fnArray.some((fn) => IMAGE_OPS.has(fn));
}

function enhanceForOcr(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const contrasted = Math.max(
      0,
      Math.min(255, (gray - 128) * 1.35 + 128),
    );
    data[i] = contrasted;
    data[i + 1] = contrasted;
    data[i + 2] = contrasted;
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

async function renderPageToCanvas(page: PDFPageProxy, scale: number) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const canvasContext = canvas.getContext("2d");
  if (!canvasContext) throw new Error("PDF_RENDER_FAILED");
  // White background — some PDFs are transparent
  canvasContext.fillStyle = "#ffffff";
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext, canvas, viewport }).promise;
  return canvas;
}

export async function preparePdfForOcr(
  file: File,
  maxPages: number,
): Promise<PdfPrepareResult> {
  ensureWorker();

  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocument({ data }).promise;
  const pagesUsed = Math.min(pdf.numPages, maxPages);

  const textParts: string[] = [];
  let anyImages = false;
  for (let i = 1; i <= pagesUsed; i += 1) {
    const page = await pdf.getPage(i);
    if (await pageHasImages(page)) anyImages = true;
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? String(item.str) : ""))
      .join(" ")
      .trim();
    if (pageText) textParts.push(pageText);
  }

  const firstPage = await pdf.getPage(1);
  const previewCanvas = await renderPageToCanvas(firstPage, PREVIEW_SCALE);
  const previewUrl = previewCanvas.toDataURL("image/png");

  const embeddedText = textParts.join("\n\n").trim();
  const compact = embeddedText.replace(/\s+/g, " ").trim();
  const useEmbeddedText =
    compact.length >= EMBEDDED_TEXT_MIN &&
    !(anyImages && isBoilerplateText(compact));

  if (useEmbeddedText) {
    return {
      mode: "text",
      text: embeddedText,
      previewUrl,
      pagesUsed,
      totalPages: pdf.numPages,
    };
  }

  const canvases: HTMLCanvasElement[] = [];
  for (let i = 1; i <= pagesUsed; i += 1) {
    const page = await pdf.getPage(i);
    const canvas = await renderPageToCanvas(page, RENDER_SCALE);
    canvases.push(enhanceForOcr(canvas));
  }

  return {
    mode: "ocr",
    canvases,
    previewUrl,
    pagesUsed,
    totalPages: pdf.numPages,
  };
}
