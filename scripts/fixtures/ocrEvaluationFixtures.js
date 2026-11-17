/**
 * Comprehensive OCR Evaluation Dataset Fixtures
 * 
 * Generates verified test pages with exact ground-truth references:
 * 1. Clean digital text (Hindi & English)
 * 2. Low-resolution scan
 * 3. Skewed / tilted scan (tilted ~3.5 degrees)
 * 4. Rotated scan (90 degrees)
 * 5. Noisy / speckle degraded scan
 * 6. Sanskrit classical shloka with complex conjuncts (शान्ताकारं...)
 * 7. Mixed language page (English + Sanskrit shloka + Hindi commentary)
 * 8. Legacy Kruti Dev / corrupted text page
 * 
 * JavaScript only using @napi-rs/canvas.
 */

import fs from "fs";
import path from "path";
import { createCanvas } from "../../lib/canvas.js";

/**
 * 1. Clean English Astrology Page
 */
export function createCleanEnglishFixture() {
  const groundTruth = "Jupiter In The Ninth House\nClassical Vedic Astrology Principles";
  const canvas = createCanvas(700, 220);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 700, 220);
  ctx.fillStyle = "#000000";
  ctx.font = "30px sans-serif";
  ctx.fillText("Jupiter In The Ninth House", 40, 80);
  ctx.fillText("Classical Vedic Astrology Principles", 40, 150);

  return {
    buffer: canvas.toBuffer("image/png"),
    groundTruth,
    language: "eng",
    type: "CLEAN_DIGITAL_ENGLISH",
  };
}

/**
 * 2. Clean Hindi Devanagari Astrology Page
 */
export function createCleanHindiFixture() {
  const groundTruth = "गुरु ग्रह और शनि का प्रभाव\nमेष राशि में सूर्य उच्च का होता है।";
  const cachedPath = path.resolve(process.cwd(), "scripts/fixtures/cache/hindi_clean.png");
  if (fs.existsSync(cachedPath)) {
    return {
      buffer: fs.readFileSync(cachedPath),
      groundTruth,
      language: "hin",
      type: "CLEAN_HINDI_DEVANAGARI",
    };
  }

  const canvas = createCanvas(700, 220);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 700, 220);
  ctx.fillStyle = "#000000";
  ctx.font = "34px Nirmala UI";
  ctx.fillText("गुरु ग्रह और शनि का प्रभाव", 40, 80);
  ctx.fillText("मेष राशि में सूर्य उच्च का होता है।", 40, 150);

  return {
    buffer: canvas.toBuffer("image/png"),
    groundTruth,
    language: "hin",
    type: "CLEAN_HINDI_DEVANAGARI",
  };
}

/**
 * 3. Sanskrit Shloka with Complex Conjuncts
 */
export function createSanskritShlokaFixture() {
  const groundTruth = "॥ अथ प्रथमोऽध्यायः ॥\nशान्ताकारं भुजगशयनं पद्मनाभं सुरेशम् ॥";
  const cachedPath = path.resolve(process.cwd(), "scripts/fixtures/cache/sanskrit_shloka.png");
  if (fs.existsSync(cachedPath)) {
    return {
      buffer: fs.readFileSync(cachedPath),
      groundTruth,
      language: "san",
      type: "SANSKRIT_COMPLEX_CONJUNCTS",
    };
  }

  const canvas = createCanvas(750, 240);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 750, 240);
  ctx.fillStyle = "#000000";
  ctx.font = "34px Nirmala UI";
  ctx.fillText("॥ अथ प्रथमोऽध्यायः ॥", 40, 80);
  ctx.fillText("शान्ताकारं भुजगशयनं पद्मनाभं सुरेशम् ॥", 40, 160);

  return {
    buffer: canvas.toBuffer("image/png"),
    groundTruth,
    language: "san",
    type: "SANSKRIT_COMPLEX_CONJUNCTS",
  };
}

/**
 * 4. Mixed Script Page (English heading + Sanskrit shloka + Hindi commentary)
 */
export function createMixedLanguageFixture() {
  const groundTruth = "Planetary Aspect: गुरु दृष्टि\nNinth House brings शुभ फल";
  const cachedPath = path.resolve(process.cwd(), "scripts/fixtures/cache/mixed_clean.png");
  if (fs.existsSync(cachedPath)) {
    return {
      buffer: fs.readFileSync(cachedPath),
      groundTruth,
      language: "san+hin+eng",
      type: "MIXED_LANGUAGE_SCRIPT",
    };
  }

  const canvas = createCanvas(750, 220);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 750, 220);
  ctx.fillStyle = "#000000";
  ctx.font = "32px Nirmala UI";
  ctx.fillText("Planetary Aspect: गुरु दृष्टि", 40, 80);
  ctx.fillText("Ninth House brings शुभ फल", 40, 150);

  return {
    buffer: canvas.toBuffer("image/png"),
    groundTruth,
    language: "san+hin+eng",
    type: "MIXED_LANGUAGE_SCRIPT",
  };
}

/**
 * 5. Skewed / Tilted Scanned Page (~3.5 degrees tilt)
 */
export function createSkewedPageFixture() {
  const groundTruth = "बृहत्पाराशर होराशास्त्रम्\nज्योतिष शास्त्र का मूल ग्रंथ";
  const cachedPath = path.resolve(process.cwd(), "scripts/fixtures/cache/skewed_hindi.png");
  if (fs.existsSync(cachedPath)) {
    return {
      buffer: fs.readFileSync(cachedPath),
      groundTruth,
      language: "hin",
      type: "SKEWED_SCAN",
    };
  }

  const canvas = createCanvas(800, 300);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 800, 300);

  ctx.save();
  ctx.translate(400, 150);
  ctx.rotate((3.5 * Math.PI) / 180); // 3.5 degrees skew
  ctx.fillStyle = "#111111";
  ctx.font = "34px Nirmala UI";
  ctx.fillText("बृहत्पाराशर होराशास्त्रम्", -300, -20);
  ctx.fillText("ज्योतिष शास्त्र का मूल ग्रंथ", -300, 50);
  ctx.restore();

  return {
    buffer: canvas.toBuffer("image/png"),
    groundTruth,
    language: "hin",
    type: "SKEWED_SCAN",
  };
}

/**
 * 6. Rotated Scanned Page (90 degrees orientation)
 */
export function createRotatedPageFixture() {
  const groundTruth = "Rotated Astrology Manuscript";
  const canvas = createCanvas(250, 600);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 250, 600);

  ctx.save();
  ctx.translate(125, 300);
  ctx.rotate((90 * Math.PI) / 180);
  ctx.fillStyle = "#000000";
  ctx.font = "32px sans-serif";
  ctx.fillText("Rotated Astrology Manuscript", -220, 10);
  ctx.restore();

  return {
    buffer: canvas.toBuffer("image/png"),
    groundTruth,
    language: "eng",
    type: "ROTATED_90_DEG_SCAN",
  };
}

/**
 * 7. Low-Resolution Scan Image
 */
export function createLowResPageFixture() {
  const groundTruth = "Low Resolution Astrology Text";
  const canvas = createCanvas(300, 90);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f4f4f4";
  ctx.fillRect(0, 0, 300, 90);
  ctx.fillStyle = "#222222";
  ctx.font = "18px sans-serif";
  ctx.fillText("Low Resolution Astrology Text", 15, 50);

  return {
    buffer: canvas.toBuffer("image/png"),
    groundTruth,
    language: "eng",
    type: "LOW_RES_SCAN",
  };
}

/**
 * 8. Noisy Scan with Speckle & Degraded Background
 */
export function createNoisyDegradedPageFixture() {
  const groundTruth = "सूर्य सिद्धान्त खगोल शास्त्र";
  const canvas = createCanvas(700, 200);
  const ctx = canvas.getContext("2d");

  // Aged parchment background
  ctx.fillStyle = "#f5eee0";
  ctx.fillRect(0, 0, 700, 200);

  // Add random speckle dust noise
  ctx.fillStyle = "#665544";
  for (let i = 0; i < 400; i++) {
    const rx = Math.floor(Math.random() * 700);
    const ry = Math.floor(Math.random() * 200);
    ctx.fillRect(rx, ry, 1, 1);
  }

  // Draw Devanagari text
  ctx.fillStyle = "#1a1612";
  ctx.font = "36px Nirmala UI";
  ctx.fillText("सूर्य सिद्धान्त खगोल शास्त्र", 40, 110);

  return {
    buffer: canvas.toBuffer("image/png"),
    groundTruth,
    language: "hin",
    type: "NOISY_DEGRADED_SCAN",
  };
}

/**
 * 9. Legacy Kruti Dev Text Sample
 */
export function createKrutiDevSample() {
  // Kruti Dev for: "गुरु ग्रह और शनि का प्रभाव"
  // "x" -> ग, "q" -> ु, "j" -> र, "q" -> ु  => xq# / xq:
  // "xzg" -> ग्रह
  // "vkSj" -> और
  // "'kfu" -> शनि
  // "dk" -> का
  // "izHkko" -> प्रभाव
  const krutiDevText = "xq# xzg vkSj 'kfu dk izHkko";
  const groundTruth = "गुरु ग्रह और शनि का प्रभाव";

  return {
    krutiDevText,
    groundTruth,
    type: "LEGACY_KRUTI_DEV",
  };
}

/**
 * 10. Legacy Chanakya / Walkman-Chanakya Text Sample
 */
export function createChanakyaSample() {
  // Chanakya encoded sample using standard Chanakya high-ASCII ligature map
  const chanakyaText = "dàkò àòùñØæçéë Ú Û";
  const groundTruth = "काजो";

  return {
    chanakyaText,
    groundTruth,
    type: "LEGACY_CHANAKYA",
  };
}
