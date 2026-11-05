import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { analyzeTextLayer } from "../ocr/textLayerAnalyzer.js";

export function toUint8Array(buf) {
  if (buf instanceof Uint8Array && !(buf instanceof Buffer)) {
    return buf;
  }
  return new Uint8Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

/**
 * Analyzes a PDF buffer to determine page-by-page characteristics:
 * - Embedded text layer usability vs scanned images
 * - Corrupted, garbled, replacement characters (\uFFFD), or legacy font detection (Kruti Dev)
 * - Text density and image density
 * - Classification: DIGITAL, SCANNED, CORRUPTED, or MIXED
 * - Explicit reason why OCR is triggered
 * 
 * @param {Buffer|Uint8Array} pdfBuffer - PDF file data
 * @param {Object} [options] - Options (language, script, forceOcr)
 * @returns {Promise<{
 *   pageCount: number,
 *   pages: Array<{
 *     pageNumber: number,
 *     pdfPageIndex: number,
 *     hasSelectableText: boolean,
 *     textLength: number,
 *     textDensity: number,
 *     imageCount: number,
 *     imageDensity: number,
 *     isDigital: boolean,
 *     isScanned: boolean,
 *     isMixed: boolean,
 *     classification: 'DIGITAL' | 'SCANNED' | 'MIXED' | 'CORRUPTED',
 *     processingMethod: 'TEXT_EXTRACTION' | 'OCR' | 'MIXED',
 *     ocrTriggerReason: string | null,
 *     isLegacyFont: boolean,
 *     detectedFont: string | null,
 *     convertedText: string | null,
 *     width: number,
 *     height: number
 *   }>,
 *   summary: {
 *     digitalCount: number,
 *     scannedCount: number,
 *     mixedCount: number,
 *     corruptedCount: number,
 *     overallClassification: 'DIGITAL' | 'SCANNED' | 'MIXED'
 *   }
 * }>}
 */
export async function analyzePdf(pdfBuffer, options = {}) {
  const data = toUint8Array(pdfBuffer);
  const loadingTask = pdfjsLib.getDocument({
    data,
    useSystemFonts: true,
    disableFontFace: true,
  });

  const doc = await loadingTask.promise;
  const pageCount = doc.numPages;
  const analyzedPages = [];

  let digitalCount = 0;
  let scannedCount = 0;
  let mixedCount = 0;
  let corruptedCount = 0;

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const pageArea = Math.max(1, viewport.width * viewport.height);

    // 1. Inspect selectable text
    const textContent = await page.getTextContent();
    const rawText = textContent.items
      .map((item) => (typeof item.str === "string" ? item.str : ""))
      .join(" ")
      .trim();
    const textLength = rawText.length;
    const textDensity = Math.round((textLength / (pageArea / 1000)) * 100) / 100;

    // 2. Inspect embedded images
    let imageCount = 0;
    try {
      const ops = await page.getOperatorList();
      const imageOps = [
        pdfjsLib.OPS.paintImageXObject,
        pdfjsLib.OPS.paintInlineImage,
        pdfjsLib.OPS.paintImageMaskXObject,
      ];
      for (const fn of ops.fnArray) {
        if (imageOps.includes(fn)) {
          imageCount++;
        }
      }
    } catch (err) {
      console.warn(`Could not extract operators for page ${pageNum}:`, err.message);
    }
    const imageDensity = Math.round((imageCount / (pageArea / 100000)) * 100) / 100;

    // 3. In-depth text layer health analysis
    const layerAnalysis = analyzeTextLayer(rawText, {
      language: options.language,
      script: options.script,
      imageCount,
    });

    const forceOcr = Boolean(options.forceOcr);
    const hasImages = imageCount > 0;

    let isDigital = false;
    let isScanned = false;
    let isMixed = false;
    let classification = "SCANNED";
    let processingMethod = "OCR";
    let ocrTriggerReason = null;

    if (forceOcr) {
      isScanned = true;
      classification = "SCANNED";
      processingMethod = "OCR";
      ocrTriggerReason = "FORCED_OCR_ADMIN_REQUEST";
      scannedCount++;
    } else if (layerAnalysis.hasUsableText && !hasImages) {
      isDigital = true;
      classification = "DIGITAL";
      processingMethod = "TEXT_EXTRACTION";
      digitalCount++;
    } else if (layerAnalysis.hasUsableText && hasImages) {
      isMixed = true;
      classification = "MIXED";
      processingMethod = "MIXED";
      mixedCount++;
    } else {
      // Scanned, corrupted, legacy font or unreadable
      if (layerAnalysis.classification === "CORRUPTED") {
        corruptedCount++;
        classification = "CORRUPTED";
        ocrTriggerReason = layerAnalysis.ocrTriggerReason || "CORRUPTED_TEXT_LAYER";
      } else {
        scannedCount++;
        classification = "SCANNED";
        ocrTriggerReason = layerAnalysis.ocrTriggerReason || (hasImages ? "SCANNED_PAGE_IMAGE_ONLY" : "EMPTY_TEXT_LAYER");
      }
      isScanned = true;
      processingMethod = "OCR";
    }

    analyzedPages.push({
      pageNumber: pageNum,
      pdfPageIndex: pageNum - 1,
      hasSelectableText: layerAnalysis.hasUsableText && !forceOcr,
      textLength,
      textDensity,
      imageCount,
      imageDensity,
      isDigital,
      isScanned,
      isMixed,
      classification,
      processingMethod,
      ocrTriggerReason,
      isLegacyFont: layerAnalysis.isLegacyFont,
      detectedFont: layerAnalysis.detectedFont,
      convertedText: layerAnalysis.convertedText,
      width: Math.round(viewport.width),
      height: Math.round(viewport.height),
    });
  }

  let overallClassification = "DIGITAL";
  if (mixedCount > 0 || (scannedCount > 0 && digitalCount > 0) || corruptedCount > 0) {
    overallClassification = "MIXED";
  } else if (scannedCount > digitalCount) {
    overallClassification = "SCANNED";
  }

  return {
    pageCount,
    pages: analyzedPages,
    summary: {
      digitalCount,
      scannedCount,
      mixedCount,
      corruptedCount,
      overallClassification,
    },
  };
}
