import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas } from "../../lib/canvas.js";
import { uploadFile } from "../storage/upload.js";
import { getPageImagePath, getPagePreviewPath } from "../storage/paths.js";
import { toUint8Array } from "./analyzePdf.js";

/**
 * Renders a PDF page to a WebP (or PNG) image buffer and saves to storage.
 * 
 * @param {Buffer|Uint8Array} pdfBuffer - PDF data
 * @param {number} pageNumber - 1-based page number
 * @param {string} bookId - Book ID for saving image assets
 * @param {Object} options - Rendering options (dpi, format)
 * @returns {Promise<{
 *   pageNumber: number,
 *   imageBuffer: Buffer,
 *   relativePath: string,
 *   publicUrl: string,
 *   previewRelativePath: string,
 *   previewPublicUrl: string,
 *   width: number,
 *   height: number
 * }>}
 */
export async function renderPdfPageToImage(pdfBuffer, pageNumber, bookId, options = {}) {
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

  // 72 points per inch in PDF. Calculate scale from target DPI (supports 300-400 DPI):
  const targetDpi = options.dpi || parseInt(process.env.OCR_DPI || "300", 10);
  const scale = Math.min(6.0, Math.max(1.0, targetDpi / 72));

  const viewport = page.getViewport({ scale });
  const canvas = createCanvas(Math.round(viewport.width), Math.round(viewport.height));
  const ctx = canvas.getContext("2d");

  // Fill canvas white first (transparent PDF backgrounds will render black without this)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise;

  const ext = options.format || "webp";
  const mimeType = ext === "png" ? "image/png" : "image/webp";
  const imageBuffer = canvas.toBuffer(mimeType);

  // Save main page image
  const pageRelativePath = getPageImagePath(bookId, pageNumber, ext);
  const pageUpload = await uploadFile(pageRelativePath, imageBuffer, {
    contentType: mimeType,
  });

  // Render a lightweight preview (e.g. scale 1.0)
  let previewRelativePath = null;
  let previewPublicUrl = null;
  try {
    const previewViewport = page.getViewport({ scale: 1.0 });
    const previewCanvas = createCanvas(Math.round(previewViewport.width), Math.round(previewViewport.height));
    const pctx = previewCanvas.getContext("2d");
    pctx.fillStyle = "#ffffff";
    pctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
    await page.render({ canvasContext: pctx, viewport: previewViewport }).promise;
    const previewBuffer = previewCanvas.toBuffer(mimeType);

    previewRelativePath = getPagePreviewPath(bookId, pageNumber, ext);
    const previewUpload = await uploadFile(previewRelativePath, previewBuffer, {
      contentType: mimeType,
    });
    previewPublicUrl = previewUpload.publicUrl;
  } catch (err) {
    console.warn(`Preview generation skipped for page ${pageNumber}:`, err.message);
    previewPublicUrl = pageUpload.publicUrl;
  }

  return {
    pageNumber,
    imageBuffer,
    relativePath: pageUpload.relativePath,
    publicUrl: pageUpload.publicUrl,
    previewRelativePath: previewRelativePath || pageUpload.relativePath,
    previewPublicUrl,
    width: Math.round(viewport.width),
    height: Math.round(viewport.height),
  };
}
