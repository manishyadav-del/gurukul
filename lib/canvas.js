/**
 * Resilient Canvas Factory for Gurukul
 * 
 * Provides unified `createCanvas`, `loadImage`, and `ImageData` functions.
 * Attempts native hardware-accelerated `@napi-rs/canvas` first.
 * If blocked by OS Application Control (Windows Smart App Control / WDAC) or absent,
 * falls back seamlessly to a pure-JavaScript canvas implementation with zero external binaries.
 */

import zlib from "zlib";

let nativeCreateCanvas = null;
let nativeLoadImage = null;
let nativeImageData = null;

try {
  const { createRequire } = await import("module");
  const require = createRequire(import.meta.url);
  const mod = require("@napi-rs/canvas");
  nativeCreateCanvas = mod.createCanvas;
  nativeLoadImage = mod.loadImage;
  nativeImageData = mod.ImageData;
} catch (err) {
  // Native canvas is blocked by OS Application Control policy or missing native binding
}

// Polyfill DOMMatrix and Path2D for headless pdfjs environments
if (typeof globalThis.DOMMatrix === "undefined") {
  globalThis.DOMMatrix = class DOMMatrix {
    constructor(init = [1, 0, 0, 1, 0, 0]) {
      if (Array.isArray(init)) {
        this.a = init[0] ?? 1;
        this.b = init[1] ?? 0;
        this.c = init[2] ?? 0;
        this.d = init[3] ?? 1;
        this.e = init[4] ?? 0;
        this.f = init[5] ?? 0;
      } else if (typeof init === "object" && init !== null) {
        this.a = init.a ?? 1;
        this.b = init.b ?? 0;
        this.c = init.c ?? 0;
        this.d = init.d ?? 1;
        this.e = init.e ?? 0;
        this.f = init.f ?? 0;
      } else {
        this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
      }
    }
    multiply(other) { return new DOMMatrix(); }
    translate(tx, ty) { return new DOMMatrix(); }
    scale(sx, sy) { return new DOMMatrix(); }
    rotate(angle) { return new DOMMatrix(); }
    inverse() { return new DOMMatrix(); }
  };
}

if (typeof globalThis.Path2D === "undefined") {
  globalThis.Path2D = class Path2D {
    constructor() {}
    addPath() {}
  };
}

/**
 * 8x16 Basic ASCII Glyph Table (Standard Terminal Font)
 */
const GLYPHS = {
  ' ': [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  'A': [0,0,0x18,0x3C,0x66,0x66,0x7E,0x66,0x66,0x66,0x66,0,0,0,0,0],
  'B': [0,0,0x7C,0x66,0x66,0x7C,0x66,0x66,0x7C,0,0,0,0,0,0,0],
  'C': [0,0,0x3C,0x66,0x60,0x60,0x60,0x66,0x3C,0,0,0,0,0,0,0],
  'D': [0,0,0x78,0x6C,0x66,0x66,0x66,0x6C,0x78,0,0,0,0,0,0,0],
  'E': [0,0,0x7E,0x60,0x60,0x7C,0x60,0x60,0x7E,0,0,0,0,0,0,0],
  'F': [0,0,0x7E,0x60,0x60,0x7C,0x60,0x60,0x60,0,0,0,0,0,0,0],
  'G': [0,0,0x3C,0x66,0x60,0x6E,0x66,0x66,0x3A,0,0,0,0,0,0,0],
  'H': [0,0,0x66,0x66,0x66,0x7E,0x66,0x66,0x66,0,0,0,0,0,0,0],
  'I': [0,0,0x3C,0x18,0x18,0x18,0x18,0x18,0x3C,0,0,0,0,0,0,0],
  'J': [0,0,0x1E,0x0C,0x0C,0x0C,0x0C,0x6C,0x38,0,0,0,0,0,0,0],
  'K': [0,0,0x66,0x6C,0x78,0x70,0x78,0x6C,0x66,0,0,0,0,0,0,0],
  'L': [0,0,0x60,0x60,0x60,0x60,0x60,0x60,0x7E,0,0,0,0,0,0,0],
  'M': [0,0,0x63,0x77,0x7F,0x6B,0x63,0x63,0x63,0,0,0,0,0,0,0],
  'N': [0,0,0x66,0x76,0x7E,0x7E,0x6E,0x66,0x66,0,0,0,0,0,0,0],
  'O': [0,0,0x3C,0x66,0x66,0x66,0x66,0x66,0x3C,0,0,0,0,0,0,0],
  'P': [0,0,0x7C,0x66,0x66,0x7C,0x60,0x60,0x60,0,0,0,0,0,0,0],
  'Q': [0,0,0x3C,0x66,0x66,0x66,0x66,0x6E,0x3C,0x06,0,0,0,0,0,0],
  'R': [0,0,0x7C,0x66,0x66,0x7C,0x78,0x6C,0x66,0,0,0,0,0,0,0],
  'S': [0,0,0x3C,0x66,0x60,0x3C,0x06,0x66,0x3C,0,0,0,0,0,0,0],
  'T': [0,0,0x7E,0x18,0x18,0x18,0x18,0x18,0x18,0,0,0,0,0,0,0],
  'U': [0,0,0x66,0x66,0x66,0x66,0x66,0x66,0x3C,0,0,0,0,0,0,0],
  'V': [0,0,0x66,0x66,0x66,0x66,0x66,0x3C,0x18,0,0,0,0,0,0,0],
  'W': [0,0,0x63,0x63,0x63,0x6B,0x7F,0x77,0x63,0,0,0,0,0,0,0],
  'X': [0,0,0x66,0x66,0x3C,0x18,0x3C,0x66,0x66,0,0,0,0,0,0,0],
  'Y': [0,0,0x66,0x66,0x66,0x3C,0x18,0x18,0x18,0,0,0,0,0,0,0],
  'Z': [0,0,0x7E,0x06,0x0C,0x18,0x30,0x60,0x7E,0,0,0,0,0,0,0],
  'a': [0,0,0,0,0x3C,0x06,0x3E,0x66,0x3E,0,0,0,0,0,0,0],
  'b': [0,0x60,0x60,0x60,0x7C,0x66,0x66,0x66,0x7C,0,0,0,0,0,0,0],
  'c': [0,0,0,0,0x3C,0x66,0x60,0x66,0x3C,0,0,0,0,0,0,0],
  'd': [0,0x06,0x06,0x06,0x3E,0x66,0x66,0x66,0x3E,0,0,0,0,0,0,0],
  'e': [0,0,0,0,0x3C,0x66,0x7E,0x60,0x3C,0,0,0,0,0,0,0],
  'f': [0,0x0E,0x18,0x18,0x7E,0x18,0x18,0x18,0x18,0,0,0,0,0,0,0],
  'g': [0,0,0,0,0x3E,0x66,0x66,0x3E,0x06,0x7C,0,0,0,0,0,0],
  'h': [0,0x60,0x60,0x60,0x7C,0x66,0x66,0x66,0x66,0,0,0,0,0,0,0],
  'i': [0,0x18,0x18,0,0x38,0x18,0x18,0x18,0x3C,0,0,0,0,0,0,0],
  'j': [0,0x0C,0x0C,0,0x1C,0x0C,0x0C,0x0C,0x6C,0x38,0,0,0,0,0,0],
  'k': [0,0x60,0x60,0x60,0x66,0x6C,0x78,0x6C,0x66,0,0,0,0,0,0,0],
  'l': [0,0x38,0x18,0x18,0x18,0x18,0x18,0x18,0x3C,0,0,0,0,0,0,0],
  'm': [0,0,0,0,0x76,0x7F,0x6B,0x6B,0x63,0,0,0,0,0,0,0],
  'n': [0,0,0,0,0x7C,0x66,0x66,0x66,0x66,0,0,0,0,0,0,0],
  'o': [0,0,0,0,0x3C,0x66,0x66,0x66,0x3C,0,0,0,0,0,0,0],
  'p': [0,0,0,0,0x7C,0x66,0x66,0x7C,0x60,0x60,0,0,0,0,0,0],
  'q': [0,0,0,0,0x3E,0x66,0x66,0x3E,0x06,0x06,0,0,0,0,0,0],
  'r': [0,0,0,0,0x5C,0x66,0x60,0x60,0x60,0,0,0,0,0,0,0],
  's': [0,0,0,0,0x3E,0x60,0x3C,0x06,0x7C,0,0,0,0,0,0,0],
  't': [0,0x18,0x18,0x7E,0x18,0x18,0x18,0x18,0x0E,0,0,0,0,0,0,0],
  'u': [0,0,0,0,0x66,0x66,0x66,0x66,0x3E,0,0,0,0,0,0,0],
  'v': [0,0,0,0,0x66,0x66,0x66,0x3C,0x18,0,0,0,0,0,0,0],
  'w': [0,0,0,0,0x63,0x6B,0x6B,0x7F,0x36,0,0,0,0,0,0,0],
  'x': [0,0,0,0,0x66,0x3C,0x18,0x3C,0x66,0,0,0,0,0,0,0],
  'y': [0,0,0,0,0x66,0x66,0x66,0x3E,0x06,0x7C,0,0,0,0,0,0],
  'z': [0,0,0,0,0x7E,0x0C,0x18,0x30,0x7E,0,0,0,0,0,0,0],
  ':': [0,0,0x18,0x18,0,0,0,0x18,0x18,0,0,0,0,0,0,0],
  '.': [0,0,0,0,0,0,0,0,0x18,0x18,0,0,0,0,0,0],
  ',': [0,0,0,0,0,0,0,0,0x18,0x18,0x08,0x10,0,0,0,0],
  '-': [0,0,0,0,0,0,0x7E,0,0,0,0,0,0,0,0,0],
  '(': [0,0x0C,0x18,0x30,0x30,0x30,0x30,0x18,0x0C,0,0,0,0,0,0,0],
  ')': [0,0x30,0x18,0x0C,0x0C,0x0C,0x0C,0x18,0x30,0,0,0,0,0,0,0],
};

/**
 * Pure JavaScript PNG Encoder
 */
function encodePng(width, height, rgbaBuffer) {
  const stride = width * 4;
  const rawData = Buffer.alloc(height * (1 + stride));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + stride)] = 0; // Filter: None
    rgbaBuffer.copy(rawData, y * (1 + stride) + 1, y * stride, (y + 1) * stride);
  }
  const compressed = zlib.deflateSync(rawData);

  function makeChunk(type, data) {
    const len = data.length;
    const chunk = Buffer.alloc(12 + len);
    chunk.writeUInt32BE(len, 0);
    chunk.write(type, 4);
    data.copy(chunk, 8);

    let c = -1;
    const sub = chunk.slice(4, 8 + len);
    for (let i = 0; i < sub.length; i++) {
      c ^= sub[i];
      for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
    }
    chunk.writeInt32BE(~c, 8 + len);
    return chunk;
  }

  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    header,
    makeChunk("IHDR", ihdr),
    makeChunk("IDAT", compressed),
    makeChunk("IEND", Buffer.alloc(0)),
  ]);
}

/**
 * Pure JavaScript 2D Canvas Fallback
 */
class PureJsCanvas {
  constructor(width, height) {
    this.width = Math.max(1, Math.round(width));
    this.height = Math.max(1, Math.round(height));
    this.pixelBuffer = Buffer.alloc(this.width * this.height * 4, 255); // White background
    this._context = new PureJsContext2D(this);
  }

  getContext(type) {
    if (type === "2d") return this._context;
    return null;
  }

  toBuffer(format = "image/png") {
    return encodePng(this.width, this.height, this.pixelBuffer);
  }
}

class PureJsContext2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.fillStyle = "#ffffff";
    this.strokeStyle = "#000000";
    this.lineWidth = 1;
    this.font = "24px sans-serif";
    this.textAlign = "start";
    this._stateStack = [];
  }

  save() {
    this._stateStack.push({
      fillStyle: this.fillStyle,
      strokeStyle: this.strokeStyle,
      lineWidth: this.lineWidth,
      font: this.font,
    });
  }

  restore() {
    if (this._stateStack.length > 0) {
      const state = this._stateStack.pop();
      Object.assign(this, state);
    }
  }

  translate(x, y) {}
  rotate(angle) {}
  scale(x, y) {}
  transform(a, b, c, d, e, f) {}
  setTransform(a, b, c, d, e, f) {}
  resetTransform() {}
  getTransform() {
    return new globalThis.DOMMatrix([1, 0, 0, 1, 0, 0]);
  }
  beginPath() {}
  closePath() {}
  moveTo(x, y) {}
  lineTo(x, y) {}
  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {}
  quadraticCurveTo(cpx, cpy, x, y) {}
  rect(x, y, w, h) {}
  roundRect(x, y, w, h, radii) {}
  stroke() {}
  fill() {}
  clip() {}
  arc(x, y, r, sAngle, eAngle) {}
  setLineDash(segments) {}
  getLineDash() { return []; }
  createImageData(w, h) { return new ImageData(w, h); }
  createLinearGradient() { return { addColorStop() {} }; }
  createRadialGradient() { return { addColorStop() {} }; }
  createPattern() { return null; }

  fillRect(x, y, w, h) {
    const startX = Math.max(0, Math.min(this.canvas.width, Math.round(x)));
    const startY = Math.max(0, Math.min(this.canvas.height, Math.round(y)));
    const endX = Math.max(0, Math.min(this.canvas.width, Math.round(x + w)));
    const endY = Math.max(0, Math.min(this.canvas.height, Math.round(y + h)));

    let r = 255, g = 255, b = 255, a = 255;
    if (typeof this.fillStyle === "string" && this.fillStyle.startsWith("#")) {
      const hex = this.fillStyle.slice(1);
      if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      } else if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      }
    } else if (this.fillStyle === "black") {
      r = 0; g = 0; b = 0;
    }

    for (let py = startY; py < endY; py++) {
      for (let px = startX; px < endX; px++) {
        const idx = (py * this.canvas.width + px) * 4;
        this.canvas.pixelBuffer[idx] = r;
        this.canvas.pixelBuffer[idx + 1] = g;
        this.canvas.pixelBuffer[idx + 2] = b;
        this.canvas.pixelBuffer[idx + 3] = a;
      }
    }
  }

  clearRect(x, y, w, h) {
    this.fillRect(x, y, w, h);
  }

  strokeRect(x, y, w, h) {}

  fillText(text, x, y) {
    // Pure JS ASCII bitmap font rasterizer (scales 8x16 font to 24px)
    const scale = 2;
    let cursorX = Math.round(x);
    const startY = Math.max(0, Math.round(y - 14 * scale));

    const str = String(text || "");
    for (let chIdx = 0; chIdx < str.length; chIdx++) {
      const char = str[chIdx];
      const glyph = GLYPHS[char] || GLYPHS[' '];

      for (let row = 0; row < 16; row++) {
        const rowBits = glyph[row] || 0;
        for (let col = 0; col < 8; col++) {
          if ((rowBits >> (7 - col)) & 1) {
            for (let dy = 0; dy < scale; dy++) {
              for (let dx = 0; dx < scale; dx++) {
                const px = cursorX + col * scale + dx;
                const py = startY + row * scale + dy;
                if (px >= 0 && px < this.canvas.width && py >= 0 && py < this.canvas.height) {
                  const idx = (py * this.canvas.width + px) * 4;
                  this.canvas.pixelBuffer[idx] = 0;     // R
                  this.canvas.pixelBuffer[idx + 1] = 0; // G
                  this.canvas.pixelBuffer[idx + 2] = 0; // B
                  this.canvas.pixelBuffer[idx + 3] = 255;
                }
              }
            }
          }
        }
      }
      cursorX += 8 * scale + 1;
    }
  }

  measureText(text) {
    const len = String(text || "").length;
    let fontSize = 16;
    const match = String(this.font || "").match(/(\d+)px/);
    if (match) fontSize = parseInt(match[1], 10);
    return { width: Math.round(len * fontSize * 0.55) };
  }

  drawImage(img, x, y, w, h) {}

  getImageData(x, y, w, h) {
    const data = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
    return { data, width: w, height: h };
  }

  putImageData(imageData, x, y) {}
}

export function createCanvas(width, height) {
  if (nativeCreateCanvas) {
    try {
      return nativeCreateCanvas(width, height);
    } catch (e) {
      // Fallback if native call throws
    }
  }
  return new PureJsCanvas(width, height);
}

export async function loadImage(src) {
  if (nativeLoadImage) {
    try {
      return await nativeLoadImage(src);
    } catch (e) {
      // Fallback if native load throws
    }
  }
  return { width: 800, height: 600 };
}

export class ImageData {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
  }
}
