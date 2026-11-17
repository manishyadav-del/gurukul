/**
 * Comprehensive Test Suite for Gurukul
 * Vedic Structured Digital Manuscript & Verified PDF Publishing System
 */

import fs from "fs";
import path from "path";
import prisma from "../lib/prisma.js";
import {
  compilePublicationPdf,
  getActivePublicationArtifact,
  getImmutableSourcePdfPath,
} from "../server/manuscript/publicationEngine.js";
import {
  canAccessUnverifiedContent,
  filterPagesForUser,
  filterPassagesForUser,
  filterExplanationsForUser,
} from "../server/manuscript/verificationGate.js";

async function runTests() {
  console.log("===============================================================================");
  console.log("   GURUKUL VEDIC STRUCTURED DIGITAL MANUSCRIPT & VERIFIED PUBLISHING TESTS    ");
  console.log("===============================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Fetch or create a test manuscript book
    console.log("--- TEST SUITE 1: Vedic Hierarchical Manuscript Structure ---");
    let testBook = await prisma.book.findFirst({
      where: { status: "PUBLISHED" },
      include: { pages: true, chapters: true },
    });

    if (!testBook) {
      testBook = await prisma.book.create({
        data: {
          title: "Vedic Test Manuscript",
          slug: `vedic-test-${Date.now()}`,
          status: "PUBLISHED",
          pageCount: 10,
        },
        include: { pages: true, chapters: true },
      });
    }

    assert(Boolean(testBook && testBook.id), `Loaded test manuscript: "${testBook.title}" (ID: ${testBook.id})`);

    // 1b. Create Vedic Hierarchical Sections (Kanda -> Adhyaya -> Prakarana)
    const kanda = await prisma.chapter.create({
      data: {
        bookId: testBook.id,
        structuralType: "KANDA",
        title: "Bala Kanda",
        sanskritTitle: "बालकाण्डम्",
        hindiTitle: "बाल काण्ड",
        englishTitle: "Book of Youth",
        sequenceNumber: 1,
        slug: `bala-kanda-${Date.now()}`,
        startPage: 1,
        endPage: 5,
        isPublished: true,
      },
    });

    const adhyaya = await prisma.chapter.create({
      data: {
        bookId: testBook.id,
        parentId: kanda.id,
        structuralType: "ADHYAYA",
        title: "Adhyaya 1 - Mangalacharanam",
        sanskritTitle: "प्रथमोध्यायः - मङ्गलाचरणम्",
        hindiTitle: "अध्याय १ - मंगलाचरण",
        sequenceNumber: 1,
        slug: `mangalacharanam-${Date.now()}`,
        startPage: 1,
        endPage: 2,
        isPublished: true,
      },
    });

    const prakarana = await prisma.chapter.create({
      data: {
        bookId: testBook.id,
        parentId: adhyaya.id,
        structuralType: "PRAKARANA",
        title: "Guru Vandana Section",
        sanskritTitle: "गुरुवन्दना प्रकरणम्",
        sequenceNumber: 1,
        slug: `guru-vandana-${Date.now()}`,
        startPage: 1,
        endPage: 1,
        isPublished: true,
      },
    });

    assert(kanda.structuralType === "KANDA", "Root structural type correctly saved as KANDA");
    assert(adhyaya.parentId === kanda.id, "Adhyaya correctly parented under Kanda");
    assert(prakarana.parentId === adhyaya.id, "Prakarana correctly nested under Adhyaya");
    assert(adhyaya.sanskritTitle === "प्रथमोध्यायः - मङ्गलाचरणम्", "Sanskrit Devanagari title preserved accurately");

    // 2. Page-Level Verification & Control Engine
    console.log("\n--- TEST SUITE 2: Granular Page Verification & Access Gate ---");

    // Ensure at least 4 test pages exist in DB
    for (let p = 1; p <= 4; p++) {
      await prisma.bookPage.upsert({
        where: { bookId_pageNumber: { bookId: testBook.id, pageNumber: p } },
        create: {
          bookId: testBook.id,
          pageNumber: p,
          pdfPageIndex: p - 1,
          rawText: `Sample Sanskrit verse text for page ${p}`,
          cleanedText: `Sample Sanskrit verse text for page ${p}`,
          verificationStatus: p <= 2 ? "VERIFIED" : "UNREVIEWED",
          isIncluded: p !== 4,
          isPublished: p <= 2,
        },
        update: {
          verificationStatus: p <= 2 ? "VERIFIED" : "UNREVIEWED",
          isIncluded: p !== 4,
          isPublished: p <= 2,
        },
      });
    }

    const allPages = await prisma.bookPage.findMany({
      where: { bookId: testBook.id },
      orderBy: { pageNumber: "asc" },
    });

    // Public user simulation (no session)
    const publicUser = null;
    const publicVisiblePages = filterPagesForUser(allPages, publicUser);

    assert(
      publicVisiblePages.every((p) => p.isPublished && p.isIncluded && ["VERIFIED", "VERIFIED_WITH_CORRECTIONS"].includes(p.verificationStatus) || p.proofread),
      "Public users only receive pages that are strictly published and verified"
    );

    assert(
      !publicVisiblePages.some((p) => p.pageNumber === 3),
      "Page 3 (UNREVIEWED) is strictly hidden from public users"
    );

    assert(
      !publicVisiblePages.some((p) => p.pageNumber === 4),
      "Page 4 (EXCLUDED) is strictly hidden from public users"
    );

    // Privileged reviewer simulation
    const reviewerUser = { id: "test-reviewer-1", role: "ADMIN", email: "scholar@gurukul.org" };
    const reviewerVisiblePages = filterPagesForUser(allPages, reviewerUser);

    assert(
      reviewerVisiblePages.length === allPages.length,
      "Scholarly reviewer has complete inspection access to all pages (verified and unreviewed)"
    );

    // 3. Controlled PDF Publication Artifact Engine
    console.log("\n--- TEST SUITE 3: Controlled PDF Publication Engine ---");

    // Create a dedicated isolated test book for testing publication artifact generation
    let isolatedTestBook = await prisma.book.findFirst({
      where: { slug: "isolated-publication-test-book" },
      include: { pages: true },
    });

    if (!isolatedTestBook) {
      isolatedTestBook = await prisma.book.create({
        data: {
          title: "Isolated Publication Test Manuscript",
          slug: "isolated-publication-test-book",
          status: "PUBLISHED",
          pageCount: 3,
        },
        include: { pages: true },
      });
    }

    // Ensure dedicated original folder and test PDF exists for isolatedTestBook
    const testBookDir = path.join(process.cwd(), "public", "uploads", "books", isolatedTestBook.id, "original");
    if (!fs.existsSync(testBookDir)) {
      fs.mkdirSync(testBookDir, { recursive: true });
    }

    const testPdfPath = path.join(testBookDir, "test-manuscript.pdf");
    if (!fs.existsSync(testPdfPath)) {
      // Create a genuine 3-page test PDF with pdf-lib
      const { PDFDocument, rgb } = await import("pdf-lib");
      const sampleDoc = await PDFDocument.create();
      for (let i = 1; i <= 3; i++) {
        const page = sampleDoc.addPage([600, 800]);
        page.drawText(`Vedic Test Page ${i}`, { x: 50, y: 700, size: 24, color: rgb(0.1, 0.3, 0.2) });
      }
      const sampleBytes = await sampleDoc.save();
      fs.writeFileSync(testPdfPath, sampleBytes);
    }

    await prisma.book.update({
      where: { id: isolatedTestBook.id },
      data: {
        originalFileName: "test-manuscript.pdf",
        originalFileUrl: `/uploads/books/${isolatedTestBook.id}/original/test-manuscript.pdf`,
      },
    });

    for (let p = 1; p <= 3; p++) {
      await prisma.bookPage.upsert({
        where: { bookId_pageNumber: { bookId: isolatedTestBook.id, pageNumber: p } },
        create: {
          bookId: isolatedTestBook.id,
          pageNumber: p,
          pdfPageIndex: p - 1,
          verificationStatus: "VERIFIED",
          isIncluded: true,
          isPublished: true,
        },
        update: {
          verificationStatus: "VERIFIED",
          isIncluded: true,
          isPublished: true,
        },
      });
    }

    const initialSourceMtime = fs.statSync(testPdfPath).mtimeMs;

    // Compile publication artifact with approved pages: [1, 2]
    const pubResult = await compilePublicationPdf(isolatedTestBook.id, [1, 2], {
      userId: reviewerUser.id,
      userEmail: reviewerUser.email,
      notes: "Automated test release: Verified folios 1 and 2",
    });

    assert(pubResult.success === true, "compilePublicationPdf completed successfully");
    assert(pubResult.pageCount === 2, `Compiled PDF artifact contains exactly 2 approved pages (got ${pubResult.pageCount})`);
    assert(pubResult.version >= 1, `Publication release version assigned: v${pubResult.version}`);
    assert(Boolean(pubResult.fileHash), `Cryptographic SHA256 checksum generated: ${pubResult.fileHash.slice(0, 16)}...`);

    const publishedDiskPath = path.join(process.cwd(), "public", pubResult.pdfUrl.replace(/^\//, ""));
    assert(fs.existsSync(publishedDiskPath), "Generated publication PDF artifact exists on disk in published directory");

    // Verify source immutability
    const postSourceMtime = fs.statSync(testPdfPath).mtimeMs;
    assert(initialSourceMtime === postSourceMtime, "Immutable source PDF remains completely untouched and unmodified");

    // Verify active artifact lookup
    const activeArtifact = await getActivePublicationArtifact(isolatedTestBook.id);
    assert(Boolean(activeArtifact && activeArtifact.manifest), "Active publication manifest registered in database");
    assert(activeArtifact.manifest.status === "PUBLISHED", "Active manifest status is PUBLISHED");

    // 4. Scholarly Explanations Verification Lifecycle
    console.log("\n--- TEST SUITE 4: Scholarly Explanations Verification Lifecycle ---");

    // Create an unreviewed AI draft explanation
    const aiDraft = await prisma.scholarlyExplanation.create({
      data: {
        bookId: testBook.id,
        pageNumber: 1,
        explanationType: "AI_GENERATED",
        content: "Draft AI analysis of Mangalacharanam opening verse.",
        language: "en",
        status: "UNREVIEWED",
        isPublished: false,
      },
    });

    // Create a verified council commentary
    const councilCommentary = await prisma.scholarlyExplanation.create({
      data: {
        bookId: testBook.id,
        pageNumber: 1,
        explanationType: "COMMENTARY",
        content: "Authentic classical commentary explaining verse syntax and spiritual import.",
        language: "en",
        status: "VERIFIED",
        isPublished: true,
        reviewerEmail: "chief.scholar@gurukul.org",
      },
    });

    const allExplanations = [aiDraft, councilCommentary];
    const publicExplanations = filterExplanationsForUser(allExplanations, publicUser);

    assert(
      publicExplanations.length === 1 && publicExplanations[0].id === councilCommentary.id,
      "Public users only receive verified and published scholarly commentary"
    );

    assert(
      !publicExplanations.some((e) => e.status === "UNREVIEWED"),
      "AI draft (UNREVIEWED) is strictly gated from public readers"
    );

    const reviewerExplanations = filterExplanationsForUser(allExplanations, reviewerUser);
    assert(
      reviewerExplanations.length === 2,
      "Scholarly reviewers can inspect all draft explanations for approval"
    );

    // Clean up test chapters created
    await prisma.chapter.deleteMany({
      where: { id: { in: [prakarana.id, adhyaya.id, kanda.id] } },
    });
    await prisma.scholarlyExplanation.deleteMany({
      where: { id: { in: [aiDraft.id, councilCommentary.id] } },
    });

  } catch (err) {
    console.error("Test execution encountered an error:", err);
    failed++;
  }

  console.log("\n===============================================================================");
  console.log(`   TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("===============================================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
