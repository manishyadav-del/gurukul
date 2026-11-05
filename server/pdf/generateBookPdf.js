import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";
import { createCanvas } from "../../lib/canvas.js";
import prisma from "../../lib/prisma.js";

/**
 * Word wrap helper for Devanagari and English text on canvas.
 */
function wrapText(ctx, text, maxWidth) {
  if (!text) return [];
  const paragraphs = text.split(/\r?\n/);
  const allLines = [];

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      allLines.push(""); // Empty line for paragraph gap
      continue;
    }

    const words = trimmed.split(/\s+/);
    let currentLine = "";

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        allLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      allLines.push(currentLine);
    }
  }

  return allLines;
}

/**
 * Renders an ornamental cover / title page for the digitized book.
 */
function renderCoverPage(book, totalChapters, totalPassages) {
  const width = 1240;
  const height = 1754;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 1. Background (Warm Antique Cream)
  ctx.fillStyle = "#faf8f5";
  ctx.fillRect(0, 0, width, height);

  // 2. Double Ornamental Borders
  ctx.strokeStyle = "#b45309"; // Amber-700
  ctx.lineWidth = 6;
  ctx.strokeRect(60, 60, width - 120, height - 120);

  ctx.strokeStyle = "#d97706"; // Amber-500
  ctx.lineWidth = 2;
  ctx.strokeRect(76, 76, width - 152, height - 152);

  // Corner decorative marks
  const corners = [
    [76, 76],
    [width - 76, 76],
    [76, height - 76],
    [width - 76, height - 76],
  ];
  ctx.fillStyle = "#b45309";
  for (const [cx, cy] of corners) {
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Top Emblem & Header
  ctx.textAlign = "center";
  ctx.fillStyle = "#92400e";
  ctx.font = "bold 28px Nirmala UI, Mangal, Arial, sans-serif";
  ctx.fillText("॥ श्री गुरुकुल ज्योतिष डिजिटल ग्रंथावली ॥", width / 2, 220);

  ctx.fillStyle = "#78350f";
  ctx.font = "20px Nirmala UI, Mangal, Arial, sans-serif";
  ctx.fillText("GURUKUL DIGITAL MANUSCRIPT & ASTROLOGY ARCHIVE", width / 2, 260);

  // Decorative line
  ctx.strokeStyle = "#b45309";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 200, 290);
  ctx.lineTo(width / 2 + 200, 290);
  ctx.stroke();

  // 4. Grand Book Title
  ctx.fillStyle = "#1c1917";
  ctx.font = "bold 56px Nirmala UI, Mangal, serif, Arial";
  const titleLines = wrapText(ctx, book.title, 900);
  let titleY = 460;
  for (const tLine of titleLines) {
    ctx.fillText(tLine, width / 2, titleY);
    titleY += 72;
  }

  // 5. Author / Tradition
  ctx.fillStyle = "#b45309";
  ctx.font = "bold 30px Nirmala UI, Mangal, Arial, sans-serif";
  ctx.fillText(`रचयिता / सम्पादक: ${book.author || "महर्षि परम्परा"}`, width / 2, titleY + 30);

  // 6. Metadata Card in center
  const cardY = titleY + 110;
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.roundRect(width / 2 - 380, cardY, 760, 280, [16]);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#451a03";
  ctx.font = "bold 22px Nirmala UI, Mangal, Arial, sans-serif";
  ctx.fillText("— प्रामाणिक डिजिटाइज्ड संस्करण विवरण —", width / 2, cardY + 50);

  ctx.textAlign = "left";
  ctx.fillStyle = "#374151";
  ctx.font = "20px Nirmala UI, Mangal, Arial, sans-serif";
  const startX = width / 2 - 320;
  ctx.fillText(`• मूल भाषा: ${book.language || "हिन्दी / संस्कृत"}`, startX, cardY + 105);
  ctx.fillText(`• लिपि: ${book.script || "देवनागरी"}`, startX, cardY + 145);
  ctx.fillText(`• कुल अध्याय: ${totalChapters}`, startX, cardY + 185);
  ctx.fillText(`• कुल पद / श्लोक: ${totalPassages}`, startX, cardY + 225);

  const startX2 = width / 2 + 60;
  ctx.fillText(`• ओसीआर इंजन: शुद्ध जावास्क्रिप्ट OCR`, startX2, cardY + 105);
  ctx.fillText(`• प्रमाणीकरण स्थिति: डिजिटल स्वीकृत`, startX2, cardY + 145);
  ctx.fillText(`• संस्करण: गुरुकुल ई-बुक संस्मरण`, startX2, cardY + 185);
  ctx.fillText(`• प्रकाशन वर्ष: ${new Date().getFullYear()}`, startX2, cardY + 225);

  // 7. Gurukul Seal & Guarantee at bottom
  ctx.textAlign = "center";
  ctx.fillStyle = "#047857"; // Emerald-700
  ctx.font = "bold 22px Nirmala UI, Mangal, Arial, sans-serif";
  ctx.fillText("✔ AI & Pure JavaScript OCR द्वारा शुद्धीकृत एवं व्यवस्थित संस्करण", width / 2, height - 260);

  ctx.fillStyle = "#6b7280";
  ctx.font = "18px Nirmala UI, Mangal, Arial, sans-serif";
  ctx.fillText("गुरुकुल डिजिटल ज्योतिष पीठ • सर्वशास्त्र शोध संस्थान", width / 2, height - 190);
  ctx.fillText(`URL: /library/${book.slug} • डिजिटल प्रतिलिपि`, width / 2, height - 160);

  return canvas.toBuffer("image/png");
}

/**
 * Renders Table of Contents (विषय-सूची) page.
 */
function renderTableOfContents(book, chapters) {
  const width = 1240;
  const height = 1754;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Frame border
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.strokeRect(60, 60, width - 120, height - 120);

  // Header
  ctx.textAlign = "center";
  ctx.fillStyle = "#92400e";
  ctx.font = "bold 36px Nirmala UI, Mangal, Arial, sans-serif";
  ctx.fillText("॥ विषय-सूची ॥", width / 2, 160);

  ctx.fillStyle = "#6b7280";
  ctx.font = "20px Nirmala UI, Mangal, Arial, sans-serif";
  ctx.fillText("TABLE OF CONTENTS", width / 2, 200);

  // Divider
  ctx.strokeStyle = "#b45309";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 140, 230);
  ctx.lineTo(width / 2 + 140, 230);
  ctx.stroke();

  // Chapter List
  let y = 320;
  ctx.textAlign = "left";

  chapters.forEach((ch, idx) => {
    if (y > height - 180) return; // Prevent overflow on single TOC

    const numStr = `अध्याय ${ch.chapterNumber || idx + 1}`;
    ctx.fillStyle = "#b45309";
    ctx.font = "bold 22px Nirmala UI, Mangal, Arial, sans-serif";
    ctx.fillText(numStr, 120, y);

    ctx.fillStyle = "#1c1917";
    ctx.font = "22px Nirmala UI, Mangal, Arial, sans-serif";
    const chTitle = ch.title || `Chapter ${idx + 1}`;
    ctx.fillText(chTitle.slice(0, 50), 260, y);

    // Page number on right
    ctx.textAlign = "right";
    ctx.fillStyle = "#6b7280";
    ctx.fillText(`पृष्ठ ${ch.startPage || idx + 1}`, width - 140, y);
    ctx.textAlign = "left";

    // Dotted leader line
    ctx.strokeStyle = "#d1d5db";
    ctx.setLineDash([3, 6]);
    ctx.beginPath();
    ctx.moveTo(270 + ctx.measureText(chTitle.slice(0, 50)).width + 20, y - 6);
    ctx.lineTo(width - 240, y - 6);
    ctx.stroke();
    ctx.setLineDash([]);

    y += 65;
  });

  // Footer
  ctx.textAlign = "center";
  ctx.fillStyle = "#9ca3af";
  ctx.font = "16px Nirmala UI, Mangal, Arial, sans-serif";
  ctx.fillText("- विषय-सूची समाप्त -", width / 2, height - 100);

  return canvas.toBuffer("image/png");
}

/**
 * Typesets a content page with running headers, footers, and passage layout.
 */
function renderContentPage({ book, chapter, lines, pageNum, totalPages }) {
  const width = 1240;
  const height = 1754;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Page background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Running Header
  ctx.fillStyle = "#9ca3af";
  ctx.font = "16px Nirmala UI, Mangal, Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(book.title.slice(0, 45), 100, 90);

  ctx.textAlign = "right";
  ctx.fillText(chapter ? chapter.title.slice(0, 45) : "", width - 100, 90);

  // Hairline header rule
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, 105);
  ctx.lineTo(width - 100, 105);
  ctx.stroke();

  // Content Lines
  let y = 170;
  const maxWidth = width - 200;

  for (const lineObj of lines) {
    if (y > height - 140) break;

    const { text, type } = lineObj;

    if (!text || text.trim() === "") {
      y += 24; // paragraph spacing
      continue;
    }

    if (type === "CHAPTER_HEADING") {
      ctx.textAlign = "center";
      ctx.fillStyle = "#b45309";
      ctx.font = "bold 32px Nirmala UI, Mangal, Arial, sans-serif";
      ctx.fillText(text, width / 2, y + 10);
      y += 50;

      // Decorative mini line
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 80, y);
      ctx.lineTo(width / 2 + 80, y);
      ctx.stroke();
      y += 40;
      ctx.textAlign = "left";
      continue;
    }

    if (type === "HEADING") {
      ctx.textAlign = "left";
      ctx.fillStyle = "#78350f";
      ctx.font = "bold 24px Nirmala UI, Mangal, Arial, sans-serif";
      ctx.fillText(text, 100, y);
      y += 38;
      continue;
    }

    // Verse / Shloka (identified by Sanskrit danda । or ॥)
    const isVerse = text.includes("॥") || text.includes("।");
    if (isVerse) {
      ctx.fillStyle = "#7c2d12"; // Deep rustic maroon for shlokas
      ctx.font = "italic 21px Nirmala UI, Mangal, serif, Arial";
      ctx.fillText(text, 130, y); // Indented

      // Draw subtle vertical left bar
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(115, y - 18, 3, 24);
      y += 36;
      continue;
    }

    // Standard Prose / Commentary
    ctx.fillStyle = "#1f2937";
    ctx.font = "20px Nirmala UI, Mangal, Arial, sans-serif";
    ctx.fillText(text, 100, y);
    y += 33;
  }

  // Running Footer
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, height - 100);
  ctx.lineTo(width - 100, height - 100);
  ctx.stroke();

  ctx.fillStyle = "#9ca3af";
  ctx.font = "16px Nirmala UI, Mangal, Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("॥ गुरुकुल डिजिटल ग्रंथावली ॥", 100, height - 70);

  ctx.textAlign = "right";
  ctx.fillText(`- ${pageNum} -`, width - 100, height - 70);

  return canvas.toBuffer("image/png");
}

/**
 * Master Function: Generates a brand-new, publication-grade digital Book PDF
 * from OCR-extracted chapters, passages, and pages.
 * 
 * @param {string} bookId - Book UUID
 * @param {Object} [options] - Optional overrides
 * @returns {Promise<{ success: boolean, pdfUrl: string, totalPages: number, fileSize: number }>}
 */
export async function generateBookPdf(bookId, options = {}) {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      chapters: {
        orderBy: { chapterNumber: "asc" },
      },
      passages: {
        orderBy: [{ chapterId: "asc" }, { sortOrder: "asc" }],
      },
      pages: {
        orderBy: { pageNumber: "asc" },
      },
    },
  });

  if (!book) {
    throw new Error(`Book with id ${bookId} not found`);
  }

  console.log(`[PDF Generator] Generating digital book PDF for "${book.title}" (${bookId})...`);

  // Initialize PDFDocument
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`${book.title} - गुरुकुल डिजिटल संस्करण`);
  pdfDoc.setAuthor(book.author || "गुरुकुल डिजिटल ग्रंथावली");
  pdfDoc.setSubject("Classical Astrology & Vedic Manuscript");
  pdfDoc.setCreator("Gurukul Digital Astrology Platform");

  const pdfWidth = 595.28; // Standard A4 width
  const pdfHeight = 841.89; // Standard A4 height

  // 1. Cover Page
  const coverPng = renderCoverPage(book, book.chapters.length, book.passages.length);
  const coverImg = await pdfDoc.embedPng(coverPng);
  const coverPage = pdfDoc.addPage([pdfWidth, pdfHeight]);
  coverPage.drawImage(coverImg, { x: 0, y: 0, width: pdfWidth, height: pdfHeight });

  // 2. Table of Contents Page
  if (book.chapters.length > 0) {
    const tocPng = renderTableOfContents(book, book.chapters);
    const tocImg = await pdfDoc.embedPng(tocPng);
    const tocPage = pdfDoc.addPage([pdfWidth, pdfHeight]);
    tocPage.drawImage(tocImg, { x: 0, y: 0, width: pdfWidth, height: pdfHeight });
  }

  // 3. Typeset Chapters and Content into Pages
  // Create a canvas for measuring text wrapping
  const measureCanvas = createCanvas(1240, 1754);
  const measureCtx = measureCanvas.getContext("2d");
  measureCtx.font = "20px Nirmala UI, Mangal, Arial, sans-serif";

  // Group passages by chapter
  const chaptersList = book.chapters.length > 0
    ? book.chapters
    : [{ id: "default", title: book.title, chapterNumber: 1 }];

  let currentBookPageNum = 1;
  const maxLinesPerPage = 38;

  for (const ch of chaptersList) {
    const chPassages = book.passages.filter((p) => p.chapterId === ch.id);

    // If no passages attached to chapter, fall back to book pages
    const rawContentList = chPassages.length > 0
      ? chPassages.map((p) => ({ text: p.text, type: p.passageType }))
      : book.pages.map((p) => ({ text: p.cleanedText || p.rawText, type: "PARAGRAPH" }));

    // Prepare line buffer for chapter
    const chapterLines = [];
    chapterLines.push({ text: `अध्याय ${ch.chapterNumber || 1}: ${ch.title}`, type: "CHAPTER_HEADING" });
    chapterLines.push({ text: "", type: "GAP" });

    for (const item of rawContentList) {
      if (!item.text) continue;
      const wrapped = wrapText(measureCtx, item.text, 1040);
      for (const wLine of wrapped) {
        chapterLines.push({
          text: wLine,
          type: item.type === "HEADING" ? "HEADING" : "PARAGRAPH",
        });
      }
      chapterLines.push({ text: "", type: "GAP" }); // paragraph gap
    }

    // Chunk lines into pages
    for (let i = 0; i < chapterLines.length; i += maxLinesPerPage) {
      const pageLines = chapterLines.slice(i, i + maxLinesPerPage);
      const pagePng = renderContentPage({
        book,
        chapter: ch,
        lines: pageLines,
        pageNum: currentBookPageNum,
        totalPages: Math.ceil(chapterLines.length / maxLinesPerPage),
      });

      const pageImg = await pdfDoc.embedPng(pagePng);
      const a4Page = pdfDoc.addPage([pdfWidth, pdfHeight]);
      a4Page.drawImage(pageImg, { x: 0, y: 0, width: pdfWidth, height: pdfHeight });
      currentBookPageNum++;
    }
  }

  // Compile and Save PDF bytes
  const pdfBytes = await pdfDoc.save();

  // Storage destination
  const targetDir = path.join(process.cwd(), "public", "uploads", "books", book.id, "generated");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filename = `${book.slug || book.id}-digitized-edition.pdf`;
  const absolutePath = path.join(targetDir, filename);
  fs.writeFileSync(absolutePath, Buffer.from(pdfBytes));

  const publicUrl = `/uploads/books/${book.id}/generated/${filename}`;

  // Update book record in database safely
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE "books" SET "generatedPdfUrl" = $1 WHERE id = $2`,
      publicUrl,
      book.id
    );
  } catch (dbErr) {
    console.warn("[PDF Generator] DB column update skipped/failed:", dbErr.message);
  }

  console.log(`[PDF Generator] Successfully generated PDF at: ${publicUrl} (${pdfBytes.length} bytes, ${pdfDoc.getPageCount()} pages)`);

  return {
    success: true,
    pdfUrl: publicUrl,
    totalPages: pdfDoc.getPageCount(),
    fileSize: pdfBytes.length,
    absolutePath,
  };
}
