import fs from "fs";
import path from "path";
import sharp from "sharp";

const cacheDir = path.resolve(process.cwd(), "scripts/fixtures/cache");
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

async function generate() {
  // 1. Hindi fixture
  const hindiSvg = `<svg width="700" height="220" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <text x="40" y="80" font-family="Nirmala UI, Arial, sans-serif" font-size="34" font-weight="bold" fill="black">गुरु ग्रह और शनि का प्रभाव</text>
    <text x="40" y="150" font-family="Nirmala UI, Arial, sans-serif" font-size="34" font-weight="bold" fill="black">मेष राशि में सूर्य उच्च का होता है।</text>
  </svg>`;
  const hindiBuf = await sharp(Buffer.from(hindiSvg)).png().toBuffer();
  fs.writeFileSync(path.join(cacheDir, "hindi_clean.png"), hindiBuf);

  // 2. Sanskrit shloka fixture
  const sanskritSvg = `<svg width="750" height="240" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <text x="40" y="80" font-family="Nirmala UI, Arial, sans-serif" font-size="34" font-weight="bold" fill="black">॥ अथ प्रथमोऽध्यायः ॥</text>
    <text x="40" y="160" font-family="Nirmala UI, Arial, sans-serif" font-size="34" font-weight="bold" fill="black">शान्ताकारं भुजगशयनं पद्मनाभं सुरेशम् ॥</text>
  </svg>`;
  const sanskritBuf = await sharp(Buffer.from(sanskritSvg)).png().toBuffer();
  fs.writeFileSync(path.join(cacheDir, "sanskrit_shloka.png"), sanskritBuf);

  // 3. Mixed language fixture
  const mixedSvg = `<svg width="750" height="220" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <text x="40" y="80" font-family="Nirmala UI, Arial, sans-serif" font-size="32" font-weight="bold" fill="black">Planetary Aspect: गुरु दृष्टि</text>
    <text x="40" y="150" font-family="Nirmala UI, Arial, sans-serif" font-size="32" font-weight="bold" fill="black">Ninth House brings शुभ फल</text>
  </svg>`;
  const mixedBuf = await sharp(Buffer.from(mixedSvg)).png().toBuffer();
  fs.writeFileSync(path.join(cacheDir, "mixed_clean.png"), mixedBuf);

  // 4. Skewed Devanagari fixture
  const skewedSvg = `<svg width="800" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <g transform="rotate(3.5, 400, 150)">
      <text x="100" y="130" font-family="Nirmala UI, Arial, sans-serif" font-size="34" font-weight="bold" fill="black">बृहत्पाराशर होराशास्त्रम्</text>
      <text x="100" y="200" font-family="Nirmala UI, Arial, sans-serif" font-size="34" font-weight="bold" fill="black">ज्योतिष शास्त्र का मूल ग्रंथ</text>
    </g>
  </svg>`;
  const skewedBuf = await sharp(Buffer.from(skewedSvg)).png().toBuffer();
  fs.writeFileSync(path.join(cacheDir, "skewed_hindi.png"), skewedBuf);

  console.log("Cached fixture PNGs generated successfully in", cacheDir);
}

generate().catch(console.error);
