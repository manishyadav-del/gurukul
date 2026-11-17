export { recognizeImage } from "./adapter.js";
export { runTesseractOcr, resolveTesseractLanguages } from "./recognize.js";
export { normalizeOcrResult } from "./normalize.js";
export { calculateConfidence, CONFIDENCE_LEVELS, DEFAULT_THRESHOLDS } from "./confidence.js";
export {
  preprocessImageBuffer,
  preprocessPixels,
  adaptiveThreshold,
  detectSkewAngle,
  detectTwoPageSpread,
  enhanceContrast,
  toGrayscale,
  binarize,
  reduceNoiseGentle,
  removeScanBorders,
  normalizeResolution,
} from "./preprocess.js";
export {
  analyzeTextLayer,
  detectKrutiDevEncoding,
  convertKrutiDevToUnicode,
  detectChanakyaEncoding,
  convertChanakyaToUnicode,
} from "./textLayerAnalyzer.js";
export {
  runOcrWithQualityRetries,
  evaluateOcrCandidate,
} from "./qualityPipeline.js";
export {
  runPaddleOcr,
  evaluatePaddleOcrRuntime,
  normalizePaddleOcrResult,
  PADDLE_OCR_CAPABILITIES,
} from "./paddleOcrAdapter.js";
export {
  correctDevanagariOcrText,
  normalizeDevanagariDandas,
  normalizeSanskritVisarga,
  normalizeSanskritAvagraha,
  normalizeDevanagariVowelsAndMatras,
} from "./devanagariCorrections.js";
export {
  validateDevanagariText,
  calculateSanskritTextQuality,
  DEVANAGARI_ISSUE_CODES,
} from "./sanskritValidator.js";
