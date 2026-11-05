/**
 * Generates test PDF buffers without external dependencies (pure JS & PDF 1.4 syntax).
 */

// 1. Digital PDF with selectable text
export function createDigitalPdfBuffer() {
  const content = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>>/Contents 4 0 R>>endobj
4 0 obj<</Length 160>>stream
BT
/F1 18 Tf
50 720 Td
(Brihat Parashara Hora Shastra - Chapter 1) Tj
/F1 12 Tf
0 -36 Td
(Vedic Astrology considers Jupiter, Sun, Moon, Mars, Mercury, Venus and Saturn as the core primary grahas.) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000052 00000 n 
0000000100 00000 n 
0000000248 00000 n 
trailer<</Size 5/Root 1 0 R>>
startxref
459
%%EOF`;
  return Buffer.from(content, "utf-8");
}

// 2. Scanned PDF (Contains only an embedded image with no selectable text)
export function createScannedPdfBuffer() {
  // 1x1 pixel 24-bit RGB bitmap stream
  const content = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</XObject<</Im1 4 0 R>>>>/Contents 5 0 R>>endobj
4 0 obj<</Type/XObject/Subtype/Image/Width 1/Height 1/ColorSpace/DeviceRGB/BitsPerComponent 8/Length 3>>stream
\xff\x00\x00
endstream
endobj
5 0 obj<</Length 45>>stream
q
500 0 0 700 50 50 cm
/Im1 Do
Q
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000052 00000 n 
0000000100 00000 n 
0000000216 00000 n 
0000000331 00000 n 
trailer<</Size 6/Root 1 0 R>>
startxref
426
%%EOF`;
  return Buffer.from(content, "binary");
}

// 3. Mixed PDF (Contains both embedded image and selectable text)
export function createMixedPdfBuffer() {
  const content = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>/XObject<</Im1 4 0 R>>>>/Contents 5 0 R>>endobj
4 0 obj<</Type/XObject/Subtype/Image/Width 1/Height 1/ColorSpace/DeviceRGB/BitsPerComponent 8/Length 3>>stream
\x00\xff\x00
endstream
endobj
5 0 obj<</Length 180>>stream
q
200 0 0 200 50 500 cm
/Im1 Do
Q
BT
/F1 16 Tf
50 450 Td
(Planetary Kundli Chart Analysis with Diagrams) Tj
/F1 12 Tf
0 -30 Td
(The ascendant lord sits in the tenth house of profession and authority.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000052 00000 n 
0000000100 00000 n 
0000000249 00000 n 
0000000364 00000 n 
trailer<</Size 6/Root 1 0 R>>
startxref
595
%%EOF`;
  return Buffer.from(content, "binary");
}

// 4. Invalid PDF
export function createInvalidPdfBuffer() {
  return Buffer.from("THIS IS NOT A VALID PDF FILE - JUST CORRUPTED DATA", "utf-8");
}
