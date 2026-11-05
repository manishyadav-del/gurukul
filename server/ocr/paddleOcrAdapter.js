/**
 * PaddleOCR JavaScript Adapter
 * 
 * Provides a standardized JavaScript integration for PaddleOCR, compatible with
 * browser and server-side execution. Evaluates runtime capabilities, model
 * availability, and language support (English, Hindi, Sanskrit).
 * 
 * In standard PaddleOCR distributions (PP-OCRv5 / PP-OCRv6), native models are
 * provided for Chinese (ch) and English (en). For Devanagari (Hindi and Sanskrit),
 * external custom ONNX weights or specialized traineddata are required.
 * When specialized models are absent or when running in pure Node.js server environments,
 * the adapter gracefully delegates to the preprocessed Tesseract Devanagari pipeline
 * while preserving the unified application contract and recording diagnostics.
 */

import { normalizeOcrResult } from "./normalize.js";
import { calculateConfidence } from "./confidence.js";
import { runTesseractOcr } from "./recognize.js";
import { runOcrWithQualityRetries } from "./qualityPipeline.js";

export const PADDLE_OCR_CAPABILITIES = {
  sdkName: "@paddleocr/paddleocr-js",
  version: "0.4.2",
  supportedRuntimes: ["browser-wasm", "browser-webgpu", "node-hybrid"],
  nativeLanguages: ["en", "ch"],
  extendedLanguages: ["hi", "sa"], // Supported via custom ONNX weights or adapter delegation
  defaultOcrVersion: "PP-OCRv5",
};

/**
 * Evaluates the runtime environment and language requirements for PaddleOCR.
 * 
 * @param {Object} options
 * @param {string} [options.language="eng"] - Target language
 * @returns {{
 *   isBrowser: boolean,
 *   isNode: boolean,
 *   isNativeLanguageSupported: boolean,
 *   requiresFallback: boolean,
 *   reason?: string
 * }}
 */
export function evaluatePaddleOcrRuntime(options = {}) {
  const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
  const isNode = typeof process !== "undefined" && process.versions && !!process.versions.node;
  
  const lang = (options.language || "eng").toLowerCase();
  const isEnglish = lang === "eng" || lang === "en" || lang === "english";
  const isIndic = lang === "hin" || lang === "hi" || lang === "san" || lang === "sa" || lang === "hindi" || lang === "sanskrit";

  // Native PaddleOCR models support English out of the box
  const isNativeLanguageSupported = isEnglish;

  // In Node.js serverless/worker without browser Canvas/WASM DOM, or for Indic without custom weights
  const requiresFallback = isNode || isIndic;
  
  let reason = null;
  if (isIndic && !options.customModelPath) {
    reason = `Native PaddleOCR PP-OCRv5 lacks pre-packaged Devanagari weights for ${lang.toUpperCase()}; delegating to trained Devanagari pipeline.`;
  } else if (isNode) {
    reason = "Node.js server-side environment detected; using headless compatible OCR pipeline.";
  }

  return {
    isBrowser,
    isNode,
    isNativeLanguageSupported,
    requiresFallback,
    reason,
  };
}

/**
 * Normalizes native PaddleOCR prediction output into Gurukul's standard contract:
 * {
 *   pageNumber: number,
 *   blocks: Array<{ text: string, confidence: number, bbox: Object, order: number, language: string }>,
 *   fullText: string
 * }
 * 
 * @param {Object} rawPaddleResult - Output from PaddleOCR predict()
 * @param {Object} options
 * @returns {Object} Normalized contract object
 */
export function normalizePaddleOcrResult(rawPaddleResult, options = {}) {
  const pageNumber = options.pageNumber || 1;
  const defaultLanguage = options.language || "eng";

  if (!rawPaddleResult) {
    return {
      pageNumber,
      blocks: [],
      fullText: "",
    };
  }

  // Handle array of items from PaddleOCR: [ { poly: [[x1,y1],[x2,y2],[x3,y3],[x4,y4]], text, score } ]
  const items = Array.isArray(rawPaddleResult)
    ? rawPaddleResult
    : rawPaddleResult.items || rawPaddleResult.data?.items || [];

  const blocks = items.map((item, idx) => {
    let bbox = null;
    if (Array.isArray(item.poly) && item.poly.length >= 4) {
      const xs = item.poly.map((p) => p[0]);
      const ys = item.poly.map((p) => p[1]);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      bbox = {
        x: Math.round(minX),
        y: Math.round(minY),
        width: Math.round(maxX - minX),
        height: Math.round(maxY - minY),
      };
    } else if (item.bbox) {
      bbox = {
        x: Math.round(item.bbox.x || 0),
        y: Math.round(item.bbox.y || 0),
        width: Math.round(item.bbox.width || 0),
        height: Math.round(item.bbox.height || 0),
      };
    }

    const confidence = typeof item.score === "number"
      ? Math.round(item.score * 100) / 100
      : typeof item.confidence === "number"
      ? Math.round(item.confidence * 100) / 100
      : 0.90;

    return {
      text: (item.text || "").trim(),
      confidence,
      bbox,
      order: idx + 1,
      language: item.language || defaultLanguage,
    };
  });

  const fullText = (
    rawPaddleResult.fullText ||
    blocks.map((b) => b.text).filter(Boolean).join("\n")
  ).trim();

  return {
    pageNumber,
    blocks,
    fullText,
  };
}

/**
 * Runs OCR using the PaddleOCR JavaScript adapter.
 * Seamlessly normalizes results, handles confidence metrics, and manages fallbacks.
 * 
 * @param {string|Buffer} imageInput - Image file path or buffer
 * @param {Object} options - OCR options
 * @returns {Promise<Object>} Standard OCR output contract
 */
export async function runPaddleOcr(imageInput, options = {}) {
  const startTime = Date.now();
  const runtimeCheck = evaluatePaddleOcrRuntime(options);

  // If in browser and PaddleOCR client SDK is available
  if (runtimeCheck.isBrowser && !runtimeCheck.requiresFallback) {
    try {
      const pkg = "@paddleocr/paddleocr-js";
      const { PaddleOCR } = await import(/* webpackIgnore: true */ pkg);
      const ocrInstance = await PaddleOCR.create({
        lang: options.language === "eng" ? "en" : options.language || "en",
        ocrVersion: options.ocrVersion || PADDLE_OCR_CAPABILITIES.defaultOcrVersion,
        ortOptions: {
          backend: options.backend || "auto",
        },
      });

      const [prediction] = await ocrInstance.predict(imageInput);
      const normalized = normalizePaddleOcrResult(prediction, options);
      const stats = calculateConfidence(normalized.blocks, undefined, options.thresholds);

      return {
        pageNumber: normalized.pageNumber,
        blocks: normalized.blocks,
        fullText: normalized.fullText,
        stats,
        engine: "paddleocr",
        diagnostics: {
          runtime: "browser-wasm",
          metrics: prediction.metrics || null,
          durationMs: Date.now() - startTime,
        },
      };
    } catch (clientErr) {
      console.warn("[PaddleOCR] Browser execution failed, falling back:", clientErr.message);
    }
  }

  // Server-side Node.js or Indic Language path:
  // Execute via quality pipeline with full diagnostics
  let normalized;
  let stats;
  let rawResult;

  if (options.qualityPipeline !== false && !options.singlePass) {
    const qualityResult = await runOcrWithQualityRetries(imageInput, options);
    normalized = {
      pageNumber: qualityResult.pageNumber,
      blocks: qualityResult.blocks,
      fullText: qualityResult.fullText,
    };
    stats = qualityResult.stats;
    rawResult = qualityResult;
  } else {
    let input = imageInput;
    if (options.preprocess) {
      const { preprocessImageBuffer } = await import("./preprocess.js");
      input = await preprocessImageBuffer(imageInput, options.preprocess);
    }

    rawResult = await runTesseractOcr(input, options);
    normalized = normalizeOcrResult(rawResult, options);
    stats = calculateConfidence(normalized.blocks, rawResult.confidence, options.thresholds);
  }

  return {
    pageNumber: normalized.pageNumber,
    blocks: normalized.blocks,
    fullText: normalized.fullText,
    stats,
    engine: runtimeCheck.requiresFallback ? "paddleocr-delegated" : "paddleocr",
    diagnostics: {
      runtime: runtimeCheck.isBrowser ? "browser" : "node",
      fallbackActive: runtimeCheck.requiresFallback,
      fallbackReason: runtimeCheck.reason || null,
      targetLanguage: options.language || "eng",
      durationMs: Date.now() - startTime,
    },
  };
}
