import { createWorker, OEM, PSM, type Worker } from "tesseract.js";
import { prepareImageVariants } from "@/lib/ocr/preprocess";

export type OcrPassResult = {
  text: string;
  confidence: number;
};

function meanConfidence(data: {
  confidence?: number;
  words?: Array<{ confidence?: number }>;
}): number {
  if (typeof data.confidence === "number" && data.confidence > 0) {
    return data.confidence;
  }
  const words = data.words ?? [];
  if (words.length === 0) return 0;
  const sum = words.reduce((acc, w) => acc + (w.confidence ?? 0), 0);
  return sum / words.length;
}

function scoreText(text: string, confidence: number) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const letters = (cleaned.match(/[A-Za-zÀ-ÿ]/g) ?? []).length;
  const weird = (cleaned.match(/[^\w\sÀ-ÿ.,;:!?()"'%\-–—/]/g) ?? []).length;
  // Penaliza lixo; favorece texto longo com boa confiança
  return confidence * 2 + letters - weird * 3 + Math.min(cleaned.length, 400) * 0.05;
}

/**
 * Roda várias passagens (imagem × layout) e devolve o texto com melhor score.
 */
export async function recognizeImageBest(
  source: File | Blob | HTMLCanvasElement,
  options: {
    lang: string;
    onStatus?: (status: string) => void;
    onProgress?: (progress: number) => void;
  },
): Promise<OcrPassResult> {
  const variants = await prepareImageVariants(source);
  const modes: PSM[] = [PSM.AUTO, PSM.SINGLE_BLOCK];

  let worker: Worker | null = null;
  const passes: OcrPassResult[] = [];

  try {
    options.onStatus?.("loading");
    worker = await createWorker(options.lang, OEM.LSTM_ONLY, {
      logger: (message) => {
        if (
          message.status === "recognizing text" &&
          message.progress != null
        ) {
          options.onProgress?.(Math.round(message.progress * 100));
        }
      },
    });

    await worker.setParameters({
      preserve_interword_spaces: "1",
      user_defined_dpi: "300",
    });

    let step = 0;
    const total = variants.length * modes.length;

    for (const canvas of variants) {
      for (const mode of modes) {
        step += 1;
        options.onStatus?.("reading");
        options.onProgress?.(Math.round(((step - 1) / total) * 100));

        await worker.setParameters({
          tessedit_pageseg_mode: mode,
          preserve_interword_spaces: "1",
          user_defined_dpi: "300",
        });

        const { data } = await worker.recognize(canvas);
        const text = (data.text ?? "").replace(/\r\n/g, "\n").trim();
        const confidence = meanConfidence(data);
        if (text) {
          passes.push({ text, confidence });
        }
      }
    }
  } finally {
    if (worker) await worker.terminate();
  }

  if (passes.length === 0) {
    return { text: "", confidence: 0 };
  }

  passes.sort(
    (a, b) => scoreText(b.text, b.confidence) - scoreText(a.text, a.confidence),
  );
  return passes[0]!;
}
