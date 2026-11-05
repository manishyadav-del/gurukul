/**
 * OCR Result Normalizer
 * Enforces the standardized OCR contract across all OCR engines.
 * 
 * Contract:
 * {
 *   pageNumber: number,
 *   blocks: [
 *     {
 *       text: string,
 *       confidence: number (0.00 - 1.00),
 *       bbox: { x: number, y: number, width: number, height: number } | null,
 *       order: number,
 *       language: string
 *     }
 *   ],
 *   fullText: string
 * }
 */

export function normalizeOcrResult(rawResult, options = {}) {
  const pageNumber = options.pageNumber ?? 1;
  const defaultLanguage = options.language ?? (process.env.OCR_LANGUAGE || "eng");

  if (!rawResult) {
    return {
      pageNumber,
      blocks: [],
      fullText: "",
    };
  }

  // If already adhering to contract
  if (Array.isArray(rawResult.blocks) && typeof rawResult.fullText === "string") {
    return {
      pageNumber,
      blocks: rawResult.blocks.map((b, idx) => ({
        text: (b.text || "").trim(),
        confidence: typeof b.confidence === "number"
          ? (b.confidence > 1 ? Math.round((b.confidence / 100) * 100) / 100 : Math.round(b.confidence * 100) / 100)
          : null,
        bbox: b.bbox
          ? {
              x: Math.round(b.bbox.x ?? 0),
              y: Math.round(b.bbox.y ?? 0),
              width: Math.round(b.bbox.width ?? 0),
              height: Math.round(b.bbox.height ?? 0),
            }
          : null,
        order: b.order ?? idx + 1,
        language: b.language || defaultLanguage,
      })),
      fullText: rawResult.fullText.trim(),
    };
  }

  // Normalize from Tesseract.js data structure
  const rawBlocks = rawResult.data?.blocks || rawResult.blocks || [];
  const fullText = (rawResult.data?.text || rawResult.text || "").trim();

  let order = 1;
  const normalizedBlocks = [];

  for (const block of rawBlocks) {
    const text = (block.text || "").trim();
    if (!text) continue;

    let bbox = null;
    if (block.bbox) {
      const x0 = block.bbox.x0 ?? block.bbox.x ?? 0;
      const y0 = block.bbox.y0 ?? block.bbox.y ?? 0;
      const x1 = block.bbox.x1 ?? (x0 + (block.bbox.width ?? 0));
      const y1 = block.bbox.y1 ?? (y0 + (block.bbox.height ?? 0));
      bbox = {
        x: Math.round(x0),
        y: Math.round(y0),
        width: Math.round(x1 - x0),
        height: Math.round(y1 - y0),
      };
    }

    const confRaw = typeof block.confidence === "number" ? block.confidence : rawResult.data?.confidence;
    const confidence = typeof confRaw === "number"
      ? (confRaw > 1 ? Math.round((confRaw / 100) * 100) / 100 : Math.round(confRaw * 100) / 100)
      : 0.85;

    normalizedBlocks.push({
      text,
      confidence,
      bbox,
      order: order++,
      language: block.language || defaultLanguage,
    });
  }

  // Fallback: If no sub-blocks were parsed but fullText exists
  if (normalizedBlocks.length === 0 && fullText) {
    const confRaw = rawResult.data?.confidence ?? rawResult.confidence ?? 85;
    const confidence = confRaw > 1 ? Math.round((confRaw / 100) * 100) / 100 : Math.round(confRaw * 100) / 100;

    // Split into paragraphs as blocks
    const paragraphs = fullText.split(/\n\s*\n/).filter((p) => p.trim());
    for (const para of paragraphs) {
      normalizedBlocks.push({
        text: para.trim(),
        confidence,
        bbox: null,
        order: order++,
        language: defaultLanguage,
      });
    }
  }

  return {
    pageNumber,
    blocks: normalizedBlocks,
    fullText,
  };
}
