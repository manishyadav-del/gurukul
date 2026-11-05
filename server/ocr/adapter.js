import { runTesseractOcr } from "./recognize.js";
import { normalizeOcrResult } from "./normalize.js";
import { calculateConfidence } from "./confidence.js";
import { runOcrWithQualityRetries } from "./qualityPipeline.js";
import { runPaddleOcr } from "./paddleOcrAdapter.js";

/**
 * Main application interface to OCR services.
 * Decouples the entire application from underlying OCR libraries.
 * Includes confidence-based multi-attempt retry pipeline for degraded/scanned pages.
 * Supports both Tesseract and PaddleOCR engines via JavaScript adapter pattern.
 * 
 * @param {string|Buffer} imagePathOrBuffer - Image file path or Buffer
 * @param {Object} options - Options including pageNumber, language, thresholds, qualityPipeline, engine
 * @returns {Promise<{
 *   pageNumber: number,
 *   blocks: Array<{ text: string, confidence: number, bbox: Object, order: number, language: string }>,
 *   fullText: string,
 *   stats: { pageConfidence: number, averageBlockConfidence: number, minBlockConfidence: number, level: string, requiresProofreading: boolean },
 *   diagnostics?: Object
 * }>}
 */
export async function recognizeImage(imagePathOrBuffer, options = {}) {
  const engine = (options.engine || process.env.OCR_ENGINE || "tesseract").toLowerCase();

  if (engine === "paddleocr") {
    return await runPaddleOcr(imagePathOrBuffer, options);
  }

  if (engine !== "tesseract" && engine !== "auto") {
    throw new Error(`Unsupported OCR engine: '${engine}'. Only JavaScript-compatible engines like 'tesseract' and 'paddleocr' are supported.`);
  }

  // If quality pipeline is enabled (default: true) and no explicit single pass requested
  if (options.qualityPipeline !== false && !options.singlePass) {
    return await runOcrWithQualityRetries(imagePathOrBuffer, options);
  }

  let input = imagePathOrBuffer;

  // Optional manual preprocessing without mutating the original image
  if (options.preprocess) {
    const { preprocessImageBuffer } = await import("./preprocess.js");
    input = await preprocessImageBuffer(imagePathOrBuffer, options.preprocess);
  }

  const rawResult = await runTesseractOcr(input, options);

  // Normalize into standard contract
  const normalized = normalizeOcrResult(rawResult, options);

  // Compute confidence analytics
  const stats = calculateConfidence(normalized.blocks, rawResult.confidence, options.thresholds);

  return {
    pageNumber: normalized.pageNumber,
    blocks: normalized.blocks,
    fullText: normalized.fullText,
    stats,
    engine: "tesseract",
  };
}
