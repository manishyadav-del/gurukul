import { createWorker } from "tesseract.js";

/**
 * Maps high-level language names to Tesseract language codes.
 */
export function resolveTesseractLanguages(lang) {
  if (!lang) return ["eng"];

  if (Array.isArray(lang)) return lang;

  const lower = String(lang).toLowerCase().trim();
  if (lower === "hindi" || lower === "hi") {
    return ["hin", "eng"];
  }
  if (lower === "sanskrit" || lower === "sa") {
    return ["san", "hin", "eng"];
  }
  if (lower === "english" || lower === "en") {
    return ["eng"];
  }
  if (lower.includes("+")) {
    return lower.split("+").map((s) => s.trim());
  }
  if (lower.includes(",")) {
    return lower.split(",").map((s) => s.trim());
  }

  return [lower];
}

/**
 * Recognize text from an image (buffer or file path) using Tesseract.js.
 * 
 * @param {string|Buffer} imageInput - Absolute file path or Buffer of the page image
 * @param {Object} options - Recognition options
 * @param {string|string[]} options.language - Target language (e.g. 'eng+hin+san')
 * @returns {Promise<Object>} Raw OCR result containing text, confidence, blocks
 */
export async function runTesseractOcr(imageInput, options = {}) {
  const languages = resolveTesseractLanguages(options.language || process.env.OCR_LANGUAGE || "eng");
  
  let worker = null;
  try {
    // Initialize worker with target languages pointing to local traineddata if present
    const workerOptions = {
      langPath: process.env.TESSDATA_PREFIX || process.cwd(),
      cachePath: process.cwd(),
    };

    worker = await createWorker(languages, 1, workerOptions);

    if (options.psm) {
      await worker.setParameters({
        tessedit_pageseg_mode: String(options.psm),
      });
    }

    // Request block and bounding box level outputs
    const result = await worker.recognize(imageInput, {}, {
      blocks: true,
      text: true,
      tsv: true,
      hocr: true,
    });

    return {
      text: result.data.text || "",
      confidence: result.data.confidence ?? 0,
      blocks: result.data.blocks || [],
      raw: result.data,
    };
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch (err) {
        console.warn("Failed to terminate Tesseract worker cleanly:", err.message);
      }
    }
  }
}
