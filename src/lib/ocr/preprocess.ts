/** Pré-processamento leve para OCR de prints digitais. */

const TARGET_WIDTH = 1800;
const MAX_WIDTH = 2800;

export async function loadImageToCanvas(
  source: File | Blob | HTMLCanvasElement,
): Promise<HTMLCanvasElement> {
  if (source instanceof HTMLCanvasElement) {
    const copy = document.createElement("canvas");
    copy.width = source.width;
    copy.height = source.height;
    copy.getContext("2d")?.drawImage(source, 0, 0);
    return copy;
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(source);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("CANVAS_UNSUPPORTED"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("IMAGE_LOAD_FAILED"));
    };
    img.src = url;
  });
}

/**
 * Amplia com fator inteiro (2x/3x) sem blur — texto fica mais nítido para o Tesseract.
 * Smoothing em texto fino costuma fundir traços (ex.: H1 → MY).
 */
function upscaleInteger(source: HTMLCanvasElement): HTMLCanvasElement {
  let factor = 1;
  if (source.width < 700) factor = 3;
  else if (source.width < TARGET_WIDTH) factor = 2;

  const nextW = source.width * factor;
  if (nextW > MAX_WIDTH) {
    factor = Math.max(1, Math.floor(MAX_WIDTH / source.width));
  }
  if (factor <= 1) return source;

  const canvas = document.createElement("canvas");
  canvas.width = source.width * factor;
  canvas.height = source.height * factor;
  const ctx = canvas.getContext("2d");
  if (!ctx) return source;

  // Sem anti-alias: cada pixel vira bloco nítido
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Cinza simples (sem esticar histograma — preserva formas das letras). */
function toGrayscale(source: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return source;
  ctx.drawImage(source, 0, 0);
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = image;
  for (let i = 0; i < data.length; i += 4) {
    const g = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    data[i] = g;
    data[i + 1] = g;
    data[i + 2] = g;
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

/** Variantes para o Tesseract escolher a de maior confiança. */
export async function prepareImageVariants(
  source: File | Blob | HTMLCanvasElement,
): Promise<HTMLCanvasElement[]> {
  const base = await loadImageToCanvas(source);
  const crisp = upscaleInteger(base);
  const gray = toGrayscale(crisp);
  // Duas opções: colorida nítida e cinza nítida
  return crisp === gray ? [crisp] : [crisp, gray];
}

/** @deprecated use prepareImageVariants */
export async function prepareImageForOcr(
  source: File | Blob | HTMLCanvasElement,
): Promise<HTMLCanvasElement> {
  const variants = await prepareImageVariants(source);
  return variants[0]!;
}
