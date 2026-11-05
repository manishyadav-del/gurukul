/**
 * Scanned Image Fixtures for OCR Verification (Node.js & @napi-rs/canvas)
 * Generates verified raster images (English, Hindi, Sanskrit, Mixed, Low-Res, Rotated, Blank)
 */

import fs from "fs";
import path from "path";
import { createCanvas } from "../../lib/canvas.js";

/**
 * Creates an English scanned page image
 */
export function createEnglishScannedImageBuffer() {
  const canvas = createCanvas(600, 200);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 600, 200);
  ctx.fillStyle = "#000000";
  ctx.font = "28px sans-serif";
  ctx.fillText("Jupiter In The Ninth House", 30, 70);
  ctx.fillText("Classical Vedic Astrology Principles", 30, 130);
  return canvas.toBuffer("image/png");
}

/**
 * Creates a Hindi scanned page image with Devanagari font
 */
export function createHindiScannedImageBuffer() {
  const cachedPath = path.resolve(process.cwd(), "scripts/fixtures/cache/hindi_clean.png");
  if (fs.existsSync(cachedPath)) {
    return fs.readFileSync(cachedPath);
  }

  const canvas = createCanvas(600, 200);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 600, 200);
  ctx.fillStyle = "#000000";
  ctx.font = "32px Nirmala UI";
  ctx.fillText("गुरु ग्रह और शनि का प्रभाव", 30, 70);
  ctx.fillText("मेष राशि में सूर्य उच्च का होता है।", 30, 130);
  return canvas.toBuffer("image/png");
}

/**
 * Creates a Sanskrit scanned shloka image with Devanagari font
 */
export function createSanskritScannedImageBuffer() {
  const cachedPath = path.resolve(process.cwd(), "scripts/fixtures/cache/sanskrit_shloka.png");
  if (fs.existsSync(cachedPath)) {
    return fs.readFileSync(cachedPath);
  }

  const canvas = createCanvas(600, 200);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 600, 200);
  ctx.fillStyle = "#000000";
  ctx.font = "32px Nirmala UI";
  ctx.fillText("॥ अथ प्रथमोऽध्यायः ॥", 30, 70);
  ctx.fillText("शान्ताकारं भुजगशयनं पद्मनाभं सुरेशम् ॥", 30, 130);
  return canvas.toBuffer("image/png");
}

/**
 * Creates a Mixed script scanned image (English + Hindi)
 */
export function createMixedScriptScannedImageBuffer() {
  const cachedPath = path.resolve(process.cwd(), "scripts/fixtures/cache/mixed_clean.png");
  if (fs.existsSync(cachedPath)) {
    return fs.readFileSync(cachedPath);
  }

  const canvas = createCanvas(650, 200);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 650, 200);
  ctx.fillStyle = "#000000";
  ctx.font = "30px Nirmala UI";
  ctx.fillText("Planetary Aspect: गुरु दृष्टि", 30, 70);
  ctx.fillText("Ninth House brings शुभ फल", 30, 130);
  return canvas.toBuffer("image/png");
}

/**
 * Creates a low-resolution scan image
 */
export function createLowResScannedImageBuffer() {
  const canvas = createCanvas(250, 80);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#eeeeee";
  ctx.fillRect(0, 0, 250, 80);
  ctx.fillStyle = "#222222";
  ctx.font = "16px sans-serif";
  ctx.fillText("Low Resolution Astrology Text", 10, 45);
  return canvas.toBuffer("image/png");
}

/**
 * Creates a blank scanned image
 */
export function createBlankScannedImageBuffer() {
  const canvas = createCanvas(400, 200);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 400, 200);
  return canvas.toBuffer("image/png");
}

/**
 * Creates a 90-degree rotated page image
 */
export function createRotatedScannedImageBuffer() {
  const canvas = createCanvas(200, 500);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 200, 500);

  ctx.save();
  ctx.translate(100, 250);
  ctx.rotate((90 * Math.PI) / 180);
  ctx.fillStyle = "#000000";
  ctx.font = "28px sans-serif";
  ctx.fillText("Rotated Astrology Manuscript", -200, 10);
  ctx.restore();

  return canvas.toBuffer("image/png");
}
