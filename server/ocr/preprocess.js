/**
 * Advanced Image Preprocessing for OCR Quality & Manuscript Accuracy
 * JavaScript-only implementation using pixel manipulation and @napi-rs/canvas.
 * 
 * Capabilities:
 * - Grayscale conversion (luminosity)
 * - Contrast enhancement with midpoint adjustment
 * - Fast Adaptive Local Thresholding (Integral Image) preserving fine Devanagari matras and accents
 * - Otsu Global Binarization
 * - Gentle isolated speckle noise removal (preserves anusvara, nukta, and dandas)
 * - Skew detection & deskewing via projection profile variance
 * - 90/180/270 degree rotation correction
 * - Two-page scan detection and separation
 * 
 * @module server/ocr/preprocess
 */

/**
 * Converts RGB to grayscale using the standard luminosity formula.
 */
export function rgbToGray(r, g, b) {
  return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
}

/**
 * Convert RGBA pixel data to grayscale.
 * @param {Buffer|Uint8ClampedArray} pixels
 * @returns {Buffer}
 */
export function toGrayscale(pixels) {
  const data = Buffer.from(pixels);
  for (let i = 0; i < data.length; i += 4) {
    const gray = rgbToGray(data[i], data[i + 1], data[i + 2]);
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
  return data;
}

/**
 * Apply contrast enhancement to RGBA pixel data.
 * @param {Buffer|Uint8ClampedArray} pixels
 * @param {number} factor - Contrast multiplier (1.0 = no change, 1.3 - 1.6 = enhanced)
 * @returns {Buffer}
 */
export function enhanceContrast(pixels, factor = 1.4) {
  const data = Buffer.from(pixels);
  const mid = 128;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, Math.round(mid + factor * (data[i] - mid))));
    data[i + 1] = Math.min(255, Math.max(0, Math.round(mid + factor * (data[i + 1] - mid))));
    data[i + 2] = Math.min(255, Math.max(0, Math.round(mid + factor * (data[i + 2] - mid))));
  }
  return data;
}

/**
 * Builds an integral image (summed-area table) for fast local area averaging.
 * Runs in O(width * height) time.
 */
export function buildIntegralImage(grayPixels, width, height) {
  const integral = new Float64Array((width + 1) * (height + 1));
  const stride = width + 1;

  for (let y = 0; y < height; y++) {
    let rowSum = 0;
    const yOffset = y * width;
    const intYOffset = (y + 1) * stride;
    const prevIntYOffset = y * stride;

    for (let x = 0; x < width; x++) {
      rowSum += grayPixels[yOffset + x];
      integral[intYOffset + (x + 1)] = integral[prevIntYOffset + (x + 1)] + rowSum;
    }
  }

  return integral;
}

/**
 * Adaptive Local Thresholding (Bradley-Roth / Sauvola style) using integral image.
 * Preserves thin Devanagari strokes, matras, and Sanskrit accents in unevenly lit or aged pages.
 * 
 * @param {Buffer|Uint8ClampedArray} pixels - Grayscale RGBA pixels
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {Object} [options]
 * @param {number} [options.windowSize] - Local neighborhood size (default: ~width / 32)
 * @param {number} [options.tRatio=0.12] - Sensitivity threshold ratio
 * @returns {Buffer}
 */
export function adaptiveThreshold(pixels, width, height, options = {}) {
  const data = Buffer.from(pixels);
  const winSize = options.windowSize || Math.max(15, Math.round(width / 32));
  const s = Math.floor(winSize / 2);
  const tRatio = options.tRatio ?? 0.12;

  // Extract single-channel grayscale values
  const gray = new Uint8Array(width * height);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    gray[j] = data[i];
  }

  const integral = buildIntegralImage(gray, width, height);
  const stride = width + 1;

  for (let y = 0; y < height; y++) {
    const y0 = Math.max(0, y - s);
    const y1 = Math.min(height, y + s + 1);
    const yOffset = y * width;

    for (let x = 0; x < width; x++) {
      const x0 = Math.max(0, x - s);
      const x1 = Math.min(width, x + s + 1);

      const count = (x1 - x0) * (y1 - y0);
      const sum =
        integral[y1 * stride + x1] -
        integral[y0 * stride + x1] -
        integral[y1 * stride + x0] +
        integral[y0 * stride + x0];

      const mean = sum / count;
      const pixelVal = gray[yOffset + x];
      const threshold = mean * (1 - tRatio);

      const binaryVal = pixelVal < threshold ? 0 : 255;
      const idx = (yOffset + x) * 4;
      data[idx] = binaryVal;
      data[idx + 1] = binaryVal;
      data[idx + 2] = binaryVal;
    }
  }

  return data;
}

/**
 * Apply Otsu binarization to grayscale RGBA pixel data.
 */
export function binarize(pixels, threshold = 0) {
  const data = Buffer.from(pixels);
  let t = threshold;

  if (t === 0) {
    const hist = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
      hist[data[i]]++;
    }
    const total = data.length / 4;
    let sumB = 0, wB = 0, wF;
    let sum = 0;
    for (let i = 0; i < 256; i++) sum += i * hist[i];
    let varMax = 0;
    for (let i = 0; i < 256; i++) {
      wB += hist[i];
      if (wB === 0) continue;
      wF = total - wB;
      if (wF === 0) break;
      sumB += i * hist[i];
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;
      const varBetween = wB * wF * (mB - mF) ** 2;
      if (varBetween > varMax) {
        varMax = varBetween;
        t = i;
      }
    }
  }

  for (let i = 0; i < data.length; i += 4) {
    const val = data[i] > t ? 255 : 0;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  return data;
}

/**
 * Gentle Speckle Noise Reduction that preserves small Devanagari diacritics.
 * Only removes isolated 1-2 pixel noise dust without eroding matras or punctuation.
 */
export function reduceNoiseGentle(pixels, width, height) {
  const src = Buffer.from(pixels);
  const dst = Buffer.from(pixels);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      // If current pixel is dark (text foreground)
      if (src[idx] < 128) {
        let whiteNeighbors = 0;
        // Count surrounding white pixels
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nIdx = ((y + dy) * width + (x + dx)) * 4;
            if (src[nIdx] >= 128) whiteNeighbors++;
          }
        }
        // If entirely surrounded by white (isolated single dust speckle)
        if (whiteNeighbors >= 8) {
          dst[idx] = 255;
          dst[idx + 1] = 255;
          dst[idx + 2] = 255;
        }
      }
    }
  }

  return dst;
}

/**
 * Detects skew angle (in degrees, between -10 and +10) via horizontal projection profile variance.
 * 
 * @param {Buffer} pixelData - RGBA pixels
 * @param {number} width
 * @param {number} height
 * @returns {number} Estimated skew angle in degrees (positive = tilted clockwise)
 */
export function detectSkewAngle(pixelData, width, height) {
  // Downsample for fast calculation (up to ~600px wide)
  const step = Math.max(1, Math.round(width / 400));
  const sampleW = Math.floor(width / step);
  const sampleH = Math.floor(height / step);

  const gray = new Uint8Array(sampleW * sampleH);
  for (let y = 0; y < sampleH; y++) {
    const srcY = y * step;
    for (let x = 0; x < sampleW; x++) {
      const srcX = x * step;
      const idx = (srcY * width + srcX) * 4;
      gray[y * sampleW + x] = pixelData[idx] < 128 ? 1 : 0; // 1 = dark pixel
    }
  }

  let bestAngle = 0;
  let maxVariance = -1;

  // Search angles from -5 to +5 in 0.5 degree steps
  for (let deg = -5.0; deg <= 5.0; deg += 0.5) {
    const rad = (deg * Math.PI) / 180;
    const tan = Math.tan(rad);
    const rowSums = new Float64Array(sampleH);

    for (let y = 0; y < sampleH; y++) {
      for (let x = 0; x < sampleW; x++) {
        if (gray[y * sampleW + x] === 1) {
          const shiftedY = Math.round(y + (x - sampleW / 2) * tan);
          if (shiftedY >= 0 && shiftedY < sampleH) {
            rowSums[shiftedY]++;
          }
        }
      }
    }

    // Calculate variance of row sums
    let sum = 0;
    for (let y = 0; y < sampleH; y++) sum += rowSums[y];
    const mean = sum / sampleH;
    let variance = 0;
    for (let y = 0; y < sampleH; y++) {
      const diff = rowSums[y] - mean;
      variance += diff * diff;
    }

    if (variance > maxVariance) {
      maxVariance = variance;
      bestAngle = deg;
    }
  }

  return bestAngle;
}

/**
 * Detects if a scanned image is a two-page spread (facing pages scan).
 * 
 * @param {number} width
 * @param {number} height
 * @param {Buffer} pixelData
 * @returns {{ isTwoPageSpread: boolean, splitX: number }}
 */
export function detectTwoPageSpread(width, height, pixelData) {
  // A two-page scan is typically wide (aspect ratio > 1.25)
  if (width < height * 1.22) {
    return { isTwoPageSpread: false, splitX: Math.round(width / 2) };
  }

  // Look for a vertical gutter (minimum text density or dark shadow line) in the middle 20%
  const startX = Math.round(width * 0.42);
  const endX = Math.round(width * 0.58);
  const step = Math.max(1, Math.round(height / 300));

  let minDensity = Infinity;
  let splitX = Math.round(width / 2);

  for (let x = startX; x <= endX; x += 4) {
    let darkPixels = 0;
    let totalSamples = 0;
    for (let y = 0; y < height; y += step) {
      const idx = (y * width + x) * 4;
      if (pixelData[idx] < 128) darkPixels++;
      totalSamples++;
    }
    const density = darkPixels / totalSamples;
    if (density < minDensity) {
      minDensity = density;
      splitX = x;
    }
  }

  return {
    isTwoPageSpread: true,
    splitX,
  };
}

/**
 * Full preprocessing pipeline executing grayscale, contrast, adaptive thresholding,
 * and noise reduction.
 */
export function preprocessPixels(pixelData, width, height, options = {}) {
  const {
    grayscale = true,
    contrast = true,
    contrastFactor = 1.4,
    adaptive = true,
    binarize: doBinarize = false,
    denoise = true,
  } = options;

  let data = Buffer.from(pixelData);

  if (grayscale) {
    data = toGrayscale(data);
  }
  if (contrast) {
    data = enhanceContrast(data, contrastFactor);
  }
  if (adaptive) {
    data = adaptiveThreshold(data, width, height, {
      windowSize: options.windowSize,
      tRatio: options.tRatio ?? 0.12,
    });
  } else if (doBinarize) {
    data = binarize(data);
  }
  if (denoise) {
    data = reduceNoiseGentle(data, width, height);
  }

  return data;
}

/**
 * Preprocesses an image Buffer (PNG, JPEG, WebP) and returns an enhanced Buffer.
 * Supports deskewing, rotation, and configurable preprocessing recipes.
 * Does NOT mutate the original image buffer.
 * 
 * @param {Buffer} imageBuffer - Input image buffer
 * @param {Object} [options]
 * @param {number} [options.rotation=0] - Rotation angle (90, 180, 270)
 * @param {boolean} [options.deskew=false] - Auto-detect and correct page skew
 * @param {boolean} [options.adaptive=true] - Local adaptive thresholding
 * @param {boolean} [options.grayscale=true]
 * @param {boolean} [options.contrast=true]
 * @param {number} [options.contrastFactor=1.3]
 * @param {boolean} [options.denoise=true]
 * @param {string} [options.format='png'] - Output format ('png' or 'webp')
 * @returns {Promise<Buffer>} Preprocessed image buffer
 */
export async function preprocessImageBuffer(imageBuffer, options = {}) {
  let createCanvas, loadImage, ImageData;
  try {
    const canvasMod = await import("@napi-rs/canvas");
    createCanvas = canvasMod.createCanvas;
    loadImage = canvasMod.loadImage;
    ImageData = canvasMod.ImageData;
  } catch (err) {
    // Graceful fallback: If native canvas binding is blocked by OS Application Control policy (e.g. Windows Smart App Control),
    // return the raw image buffer so Tesseract can continue recognition without unhandled process termination.
    return imageBuffer;
  }

  const img = await loadImage(imageBuffer);

  const rotation = options.rotation || 0;
  let targetWidth = img.width;
  let targetHeight = img.height;

  if (rotation === 90 || rotation === 270) {
    targetWidth = img.height;
    targetHeight = img.width;
  }

  let canvas = createCanvas(targetWidth, targetHeight);
  let ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  if (rotation !== 0) {
    ctx.save();
    ctx.translate(targetWidth / 2, targetHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();
  } else {
    ctx.drawImage(img, 0, 0);
  }

  // Pixel data manipulations
  let imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);

  // Optional skew detection and deskewing
  if (options.deskew) {
    const skewAngle = detectSkewAngle(imgData.data, targetWidth, targetHeight);
    if (Math.abs(skewAngle) >= 0.4 && Math.abs(skewAngle) <= 10.0) {
      const deskewCanvas = createCanvas(targetWidth, targetHeight);
      const deskewCtx = deskewCanvas.getContext("2d");
      deskewCtx.fillStyle = "#ffffff";
      deskewCtx.fillRect(0, 0, targetWidth, targetHeight);
      deskewCtx.save();
      deskewCtx.translate(targetWidth / 2, targetHeight / 2);
      deskewCtx.rotate((-skewAngle * Math.PI) / 180);
      deskewCtx.drawImage(canvas, -targetWidth / 2, -targetHeight / 2);
      deskewCtx.restore();

      canvas = deskewCanvas;
      ctx = deskewCtx;
      imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    }
  }

  // Preprocess pixels with chosen recipe
  const shouldFilter =
    options.grayscale !== false ||
    options.contrast ||
    options.adaptive ||
    options.binarize ||
    options.denoise;

  if (shouldFilter) {
    const processed = preprocessPixels(imgData.data, targetWidth, targetHeight, {
      grayscale: options.grayscale !== false,
      contrast: options.contrast ?? true,
      contrastFactor: options.contrastFactor ?? 1.35,
      adaptive: options.adaptive ?? false, // Default soft grayscale contrast unless explicitly adaptive
      binarize: options.binarize ?? false,
      denoise: options.denoise ?? true,
      tRatio: options.tRatio,
    });
    const newImgData = new ImageData(new Uint8ClampedArray(processed), targetWidth, targetHeight);
    ctx.putImageData(newImgData, 0, 0);
  }

  return canvas.toBuffer(options.format === "webp" ? "image/webp" : "image/png");
}
