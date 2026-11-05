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
} from "./preprocess.js";
export {
  analyzeTextLayer,
  detectKrutiDevEncoding,
  convertKrutiDevToUnicode,
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
