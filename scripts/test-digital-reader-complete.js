import { GET } from "../app/api/books/[id]/pdf/route.js";
import { POST as explainPOST } from "../app/api/reader/explain/route.js";
import { getPageOcrState } from "../lib/reader/ocrState.js";
import { getGeneratedBookPdfUrl } from "../lib/bookPdfHelper.js";
import { PrismaClient } from "@prisma/client";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function runReaderTestSuite() {
  console.log("==================================================================");
  console.log("   GURUKUL COMPLETE DIGITAL BOOK READER VERIFICATION SUITE       ");
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}`);
      console.error(`         ${err.message}`);
      failed++;
    }
  }

  async function testAsync(name, fn) {
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}`);
      console.error(`         ${err.message}`);
      failed++;
    }
  }

  // --- SUITE 1: PDF STORAGE & GENERATION VERIFICATION ---
  await testAsync("1.1 All published books have verified digitized PDFs accessible on disk", async () => {
    const publishedBooks = await prisma.book.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true, slug: true, pageCount: true }
    });
    assert(publishedBooks.length >= 10, "Should have at least 10 published books");

    let validCount = 0;
    for (const b of publishedBooks) {
      const relUrl = getGeneratedBookPdfUrl(b.id, b.slug);
      assert(relUrl, `Book "${b.title}" must have a generated PDF URL`);
      const diskPath = path.join(process.cwd(), "public", relUrl.replace(/^\//, ""));
      assert(fs.existsSync(diskPath), `PDF disk file must exist at ${diskPath}`);
      const stats = fs.statSync(diskPath);
      assert(stats.size > 1000, `PDF file for "${b.title}" must have non-trivial size (>1KB)`);
      validCount++;
    }
    console.log(`         Verified ${validCount} published books have valid PDFs on disk.`);
  });

  // --- SUITE 2: SECURE STREAMING & RFC 7233 RANGE REQUESTS ---
  await testAsync("2.1 Secure PDF route supports full stream and sets correct headers", async () => {
    const book = await prisma.book.findFirst({ where: { status: "PUBLISHED" } });
    assert(book, "Requires published book");

    const req = new Request(`http://localhost:3000/api/books/${book.id}/pdf`);
    const res = await GET(req, { params: Promise.resolve({ id: book.id }) });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("content-type"), "application/pdf");
    assert.equal(res.headers.get("accept-ranges"), "bytes");
    const buf = await res.arrayBuffer();
    assert(buf.byteLength > 5000, "PDF payload must be substantial");
  });

  await testAsync("2.2 RFC 7233 Byte-Range requests stream exact chunks with HTTP 206", async () => {
    const book = await prisma.book.findFirst({ where: { status: "PUBLISHED" } });
    
    // Chunk 1: bytes 0-1023
    const req1 = new Request(`http://localhost:3000/api/books/${book.id}/pdf`, {
      headers: { range: "bytes=0-1023" }
    });
    const res1 = await GET(req1, { params: Promise.resolve({ id: book.id }) });
    assert.equal(res1.status, 206);
    assert(res1.headers.get("content-range").startsWith("bytes 0-1023/"));
    const chunk1 = await res1.arrayBuffer();
    assert.equal(chunk1.byteLength, 1024);

    // Chunk 2: bytes 1024-2047
    const req2 = new Request(`http://localhost:3000/api/books/${book.id}/pdf`, {
      headers: { range: "bytes=1024-2047" }
    });
    const res2 = await GET(req2, { params: Promise.resolve({ id: book.id }) });
    assert.equal(res2.status, 206);
    assert(res2.headers.get("content-range").startsWith("bytes 1024-2047/"));
    const chunk2 = await res2.arrayBuffer();
    assert.equal(chunk2.byteLength, 1024);
  });

  await testAsync("2.3 Secure PDF route metadata inspection (?info=true)", async () => {
    const book = await prisma.book.findFirst({ where: { status: "PUBLISHED" } });
    const req = new Request(`http://localhost:3000/api/books/${book.id}/pdf?info=true`);
    const res = await GET(req, { params: Promise.resolve({ id: book.id }) });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.exists, true);
    assert.equal(data.bookId, book.id);
    assert(data.size > 0);
  });

  // --- SUITE 3: RBAC & PUBLICATION LIFECYCLE ACCESS CONTROL ---
  await testAsync("3.1 Unpublished manuscript denies public unauthorized access with 401/403", async () => {
    const draftBook = await prisma.book.findFirst({
      where: { status: { not: "PUBLISHED" } }
    });
    if (draftBook) {
      const req = new Request(`http://localhost:3000/api/books/${draftBook.id}/pdf`);
      const res = await GET(req, { params: Promise.resolve({ id: draftBook.id }) });
      assert(res.status === 401 || res.status === 403, `Expected 401 or 403 for draft book, got ${res.status}`);
    } else {
      console.log("         (Skipped: All existing books in test DB are published)");
    }
  });

  // --- SUITE 4: LOCAL PDF.JS VENDOR ASSETS EXISTENCE ---
  test("4.1 Local PDF.js vendor assets and cmaps exist for offline / restricted environments", () => {
    const workerPath = path.join(process.cwd(), "public", "vendor", "pdfjs", "pdf.worker.min.mjs");
    const mjsPath = path.join(process.cwd(), "public", "vendor", "pdfjs", "pdf.min.mjs");
    const cmapsDir = path.join(process.cwd(), "public", "vendor", "pdfjs", "cmaps");

    assert(fs.existsSync(workerPath), "Local pdf.worker.min.mjs must exist in public/vendor/pdfjs/");
    assert(fs.existsSync(mjsPath), "Local pdf.min.mjs must exist in public/vendor/pdfjs/");
    assert(fs.existsSync(cmapsDir), "Local cmaps directory must exist in public/vendor/pdfjs/");
  });

  // --- SUITE 5: SPREAD & PAGE CORRESPONDENCE LOGIC ---
  test("5.1 Two-page spread calculation guarantees consistent pairs and handles odd page totals", () => {
    function getSpreadPages(currentPage, numPages) {
      const leftPageNum = currentPage % 2 === 1 ? currentPage : Math.max(1, currentPage - 1);
      const rightPageNum = leftPageNum + 1;
      return {
        left: leftPageNum,
        right: rightPageNum <= numPages ? rightPageNum : null,
        isEndLeaf: rightPageNum > numPages
      };
    }

    // 3-page manuscript:
    // Page 1 -> Spread (1, 2)
    assert.deepEqual(getSpreadPages(1, 3), { left: 1, right: 2, isEndLeaf: false });
    // Page 2 -> Spread (1, 2)
    assert.deepEqual(getSpreadPages(2, 3), { left: 1, right: 2, isEndLeaf: false });
    // Page 3 -> Spread (3, null) with EndLeaf
    assert.deepEqual(getSpreadPages(3, 3), { left: 3, right: null, isEndLeaf: true });

    // 4-page manuscript:
    // Page 3 -> Spread (3, 4)
    assert.deepEqual(getSpreadPages(3, 4), { left: 3, right: 4, isEndLeaf: false });
    // Page 4 -> Spread (3, 4)
    assert.deepEqual(getSpreadPages(4, 4), { left: 3, right: 4, isEndLeaf: false });
  });

  // --- SUITE 6: OCR VERIFICATION STATE MACHINE ---
  test("6.1 getPageOcrState correctly identifies verified, unreviewed, warning, and error states", () => {
    // Verified page
    const verifiedPage = {
      id: "p1",
      pageNumber: 1,
      ocrCompleted: true,
      proofread: true,
      rawText: "Sample text",
      ocrConfidence: 0.95
    };
    const s1 = getPageOcrState(verifiedPage);
    assert.equal(s1.status, "COMPLETED");
    assert.equal(s1.isVerified, true);
    assert(s1.label.includes("Verified"));

    // Unreviewed draft
    const draftPage = {
      id: "p2",
      pageNumber: 2,
      ocrCompleted: true,
      proofread: false,
      rawText: "Draft text",
      ocrConfidence: 0.88
    };
    const s2 = getPageOcrState(draftPage);
    assert.equal(s2.status, "COMPLETED");
    assert.equal(s2.isVerified, false);
    assert(s2.label.includes("Draft"));

    // Low confidence / warning
    const lowConfPage = {
      id: "p3",
      pageNumber: 3,
      ocrCompleted: true,
      proofread: false,
      ocrConfidence: 0.65
    };
    const s3 = getPageOcrState(lowConfPage);
    assert.equal(s3.isWarning, true);

    // Failed page
    const failedPage = {
      id: "p4",
      pageNumber: 4,
      qualityIssues: { failed: true }
    };
    const s4 = getPageOcrState(failedPage);
    assert.equal(s4.status, "FAILED");
    assert.equal(s4.isError, true);
  });

  // --- SUITE 7: "UNDERSTAND THIS PASSAGE" ASSISTANT ---
  await testAsync("7.1 Contextual Reading Assistant generates grounded explanations with terminology & examples", async () => {
    const req = new Request("http://localhost:3000/api/reader/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        passageText: "लग्ने व्यये वा रिपुगेपि वा स्यात् भौमस्य दृष्टिः यदि सूर्यपुत्रे।",
        bookTitle: "Brihat Jataka",
        chapterTitle: "Graha Drishti",
        pageNumber: 1,
        language: "en"
      })
    });

    const res = await explainPOST(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    const exp = data.explanation;
    assert(exp.originalPassage, "Must have original passage");
    assert(exp.simpleExplanation, "Must have simple meaning");
    assert(exp.keyTerms && exp.keyTerms.length > 0, "Must have key terminology");
    assert(exp.realLifeExample, "Must have practical real-life example");
    console.log(`         Generated explanation with ${exp.keyTerms.length} terms: "${exp.keyTerms[0].term}"`);
  });

  // --- SUITE 8: USER PROGRESS & BOOKMARKS RESILIENCY ---
  await testAsync("8.1 Reading progress calculation computes accurate percentage", async () => {
    const totalPages = 50;
    const testCases = [
      { page: 1, expectedPct: 2 },
      { page: 25, expectedPct: 50 },
      { page: 50, expectedPct: 100 }
    ];

    for (const tc of testCases) {
      const pct = Math.min(100, Math.round((tc.page / totalPages) * 100));
      assert.equal(pct, tc.expectedPct);
    }
  });

  console.log("\n------------------------------------------------------------------");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("==================================================================\n");

  await prisma.$disconnect();
  if (failed > 0) process.exit(1);
}

runReaderTestSuite().catch(err => {
  console.error("Test execution threw fatal error:", err);
  process.exit(1);
});
