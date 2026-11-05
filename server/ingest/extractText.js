import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { toUint8Array } from "./analyzePdf.js";

/**
 * Extracts digital selectable text and layout blocks from a PDF page using pdfjs-dist.
 * 
 * @param {Buffer|Uint8Array} pdfBuffer - PDF data
 * @param {number} pageNumber - 1-based page number
 * @returns {Promise<{
 *   pageNumber: number,
 *   pdfPageIndex: number,
 *   rawText: string,
 *   blocks: Array<{
 *     text: string,
 *     confidence: number,
 *     bbox: { x: number, y: number, width: number, height: number } | null,
 *     order: number,
 *     language: string | null
 *   }>
 * }>}
 */
export async function extractTextFromPdfPage(pdfBuffer, pageNumber) {
  const data = toUint8Array(pdfBuffer);
  const loadingTask = pdfjsLib.getDocument({
    data,
    useSystemFonts: true,
    disableFontFace: true,
  });

  const doc = await loadingTask.promise;
  if (pageNumber < 1 || pageNumber > doc.numPages) {
    throw new Error(`Requested pageNumber ${pageNumber} out of range (1..${doc.numPages})`);
  }

  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1.0 });
  const textContent = await page.getTextContent();

  const items = textContent.items
    .filter((item) => typeof item.str === "string" && item.str.trim().length > 0)
    .map((item) => {
      const tx = item.transform ? item.transform[4] : 0;
      const ty = item.transform ? item.transform[5] : 0;
      const y = Math.max(0, viewport.height - ty);
      const x = Math.max(0, tx);
      const width = item.width || 0;
      const height = item.height || 12;

      return {
        str: item.str,
        x,
        y,
        width,
        height,
      };
    });

  items.sort((a, b) => {
    const yDiff = a.y - b.y;
    if (Math.abs(yDiff) > 6) {
      return yDiff;
    }
    return a.x - b.x;
  });

  const lines = [];
  let currentLine = [];
  let lastY = null;

  for (const item of items) {
    if (lastY === null || Math.abs(item.y - lastY) <= 6) {
      currentLine.push(item);
      lastY = item.y;
    } else {
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
      currentLine = [item];
      lastY = item.y;
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  const blocks = [];
  const textLines = [];
  let order = 1;

  for (const lineItems of lines) {
    const lineText = lineItems.map((i) => i.str).join(" ").trim();
    if (!lineText) continue;

    textLines.push(lineText);

    const minX = Math.min(...lineItems.map((i) => i.x));
    const maxX = Math.max(...lineItems.map((i) => i.x + i.width));
    const minY = Math.min(...lineItems.map((i) => i.y));
    const maxY = Math.max(...lineItems.map((i) => i.y + i.height));

    blocks.push({
      text: lineText,
      confidence: 1.0,
      bbox: {
        x: Math.round(minX),
        y: Math.round(minY),
        width: Math.round(maxX - minX),
        height: Math.round(maxY - minY),
      },
      order: order++,
      language: null,
    });
  }

  const rawText = textLines.join("\n");

  return {
    pageNumber,
    pdfPageIndex: pageNumber - 1,
    rawText,
    blocks,
  };
}
