/**
 * Ingest-level preprocessing bridge.
 * Re-exports from the OCR preprocessing module.
 */
export {
  preprocessPixels,
  toGrayscale,
  enhanceContrast,
  binarize,
  reduceNoise,
  rgbToGray,
} from "../ocr/preprocess.js";
