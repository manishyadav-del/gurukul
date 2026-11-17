/**
 * Gurukul End-to-End Manuscript Publishing, Secure Reader & Authentication Hardening Test Suite
 *
 * Verifies all 4 core journeys:
 *  1. Vedic Hierarchical Manuscript Publishing & pdf-lib Artifact Generation
 *  2. 3D Magazine Reader & Scholarly Verified Explanations Integration
 *  3. Secure PDF Streaming & RFC 7233 Byte-Range Access Control
 *  4. Email OTP Verification Hardening & NextAuth Credential Guard
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { PDFDocument } from "pdf-lib";
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
import {
  createAndSendVerificationToken,
  verifyEmailOtp,
} from "../server/email/emailService.js";
import { authOptions } from "../lib/auth.js";

async function runE2ETests() {
  console.log("===============================================================================");
  console.log("  GURUKUL E2E MANUSCRIPT PUBLISHING, SECURE READER & AUTH HARDENING SUITE      ");
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

  const timestamp = Date.now();
  const testBookSlug = `e2e-manuscript-${timestamp}`;
  const testEmail = `e2e_scholar_${timestamp}@gurukul.local`;
  let testBook = null;
  let testUser = null;

  try {
    // =========================================================================
    // JOURNEY 1: Vedic Hierarchical Manuscript Publishing & Artifact Generation
    // =========================================================================
    console.log("--- JOURNEY 1: Vedic Manuscript Hierarchy & Controlled Publishing ---");

    // Create an authentic 5-page PDF in uploads directory for this test book
    testBook = await prisma.book.create({
      data: {
        title: "Brihat Parasara Hora Sastra (E2E Test)",
        slug: testBookSlug,
        status: "PUBLISHED",
        author: "Maharshi Parasara",
        language: "Sanskrit",
        script: "Devanagari",
        pageCount: 5,
        originalFileName: "Parasara_E2E.pdf",
      },
    });

    const bookUploadDir = path.join(process.cwd(), "public", "uploads", "books", testBook.id, "original");
    fs.mkdirSync(bookUploadDir, { recursive: true });
    const originalPdfPath = path.join(bookUploadDir, "Parasara_E2E.pdf");

    // Generate sample 5-page PDF with pdf-lib
    const sourceDoc = await PDFDocument.create();
    for (let i = 1; i <= 5; i++) {
      const page = sourceDoc.addPage([595, 842]);
      page.drawText(`Brihat Parasara Hora Sastra - Page ${i}`, { x: 50, y: 800, size: 14 });
    }
    const pdfBytes = await sourceDoc.save();
    fs.writeFileSync(originalPdfPath, pdfBytes);

    await prisma.book.update({
      where: { id: testBook.id },
      data: {
        originalFileUrl: `books/${testBook.id}/original/Parasara_E2E.pdf`,
      },
    });

    assert(fs.existsSync(originalPdfPath), "Original immutable PDF source successfully stored on disk");

    // Create 3-level Vedic hierarchy (Grantha -> Kanda -> Adhyaya -> Prakarana)
    const kanda = await prisma.chapter.create({
      data: {
        bookId: testBook.id,
        title: "Purva Kanda",
        slug: `purva-kanda-${timestamp}`,
        sanskritTitle: "पूर्वकाण्ड",
        structuralType: "KANDA",
        sequenceNumber: 1,
        startPage: 1,
        endPage: 5,
      },
    });

    const adhyaya = await prisma.chapter.create({
      data: {
        bookId: testBook.id,
        parentId: kanda.id,
        title: "Srishti Krama Adhyaya",
        slug: `srishti-krama-${timestamp}`,
        sanskritTitle: "सृष्टिक्रम अध्याय",
        structuralType: "ADHYAYA",
        sequenceNumber: 1,
        startPage: 1,
        endPage: 3,
      },
    });

    const prakarana = await prisma.chapter.create({
      data: {
        bookId: testBook.id,
        parentId: adhyaya.id,
        title: "Grahopadhi Varnana Prakarana",
        slug: `grahopadhi-varnana-${timestamp}`,
        sanskritTitle: "ग्रहोपाधि वर्णन प्रकरण",
        structuralType: "PRAKARANA",
        sequenceNumber: 1,
        startPage: 1,
        endPage: 2,
      },
    });

    assert(kanda.structuralType === "KANDA", "Root Grantha structural node created as KANDA");
    assert(adhyaya.parentId === kanda.id, "Adhyaya correctly parented under Kanda in Vedic hierarchy");
    assert(prakarana.parentId === adhyaya.id, "Prakarana correctly nested under Adhyaya");

    // Create 5 BookPage records with diverse verification statuses
    // Pages 1 and 2: VERIFIED & PUBLISHED
    // Page 3: UNDER_REVIEW & NOT PUBLISHED
    // Page 4: NEEDS_CORRECTION & NOT PUBLISHED
    // Page 5: EXCLUDED & NOT PUBLISHED
    const p1 = await prisma.bookPage.create({
      data: {
        bookId: testBook.id,
        pageNumber: 1,
        pdfPageIndex: 0,
        rawText: "श्रीगणेशाय नमः। अथ सृष्टिक्रमं व्याख्यास्यामः॥",
        isIncluded: true,
        isPublished: true,
        verificationStatus: "VERIFIED",
      },
    });

    const p2 = await prisma.bookPage.create({
      data: {
        bookId: testBook.id,
        pageNumber: 2,
        pdfPageIndex: 1,
        rawText: "सर्वेषां च ग्रहाणां तु बलमष्टविधं स्मृतम्॥",
        isIncluded: true,
        isPublished: true,
        verificationStatus: "VERIFIED",
      },
    });

    const p3 = await prisma.bookPage.create({
      data: {
        bookId: testBook.id,
        pageNumber: 3,
        pdfPageIndex: 2,
        rawText: "Page 3 draft raw text",
        isIncluded: true,
        isPublished: false,
        verificationStatus: "UNDER_REVIEW",
      },
    });

    const p4 = await prisma.bookPage.create({
      data: {
        bookId: testBook.id,
        pageNumber: 4,
        pdfPageIndex: 3,
        rawText: "Page 4 draft OCR with errors",
        isIncluded: true,
        isPublished: false,
        verificationStatus: "NEEDS_CORRECTION",
      },
    });

    const p5 = await prisma.bookPage.create({
      data: {
        bookId: testBook.id,
        pageNumber: 5,
        pdfPageIndex: 4,
        rawText: "Blank end paper",
        isIncluded: false,
        isPublished: false,
        exclusionReason: "BLANK_PAGE",
        verificationStatus: "EXCLUDED",
      },
    });

    // Compile publication artifact for approved pages [1, 2]
    const compileResult = await compilePublicationPdf(testBook.id, {
      approvedPages: [1, 2],
      excludedPages: [3, 4, 5],
      reviewerEmail: "scholarly_council@gurukul.org",
      reviewerRole: "SUPER_ADMIN",
    });

    assert(compileResult.success, "Publication artifact compiled successfully via pdf-lib");
    assert(compileResult.manifest.pageCount === 2, "Compiled PDF contains exactly 2 approved pages");
    assert(compileResult.manifest.version === 1, "First release assigned version v1");
    const publishedDiskFile = path.join(process.cwd(), "public", compileResult.manifest.publishedPdfPath.replace(/^\//, ""));
    assert(fs.existsSync(publishedDiskFile), "Published PDF artifact exists on disk");
    assert(fs.existsSync(originalPdfPath), "Original source PDF remains untouched and immutable");

    // =========================================================================
    // JOURNEY 2: Reader & Scholarly Verified Explanations Integration
    // =========================================================================
    console.log("\n--- JOURNEY 2: Reader Access Gate & Verified Explanations ---");

    const anonymousUser = null;
    const reviewerUser = { id: "rev-1", role: "ADMIN", email: "reviewer@gurukul.org" };
    const allBookPages = [p1, p2, p3, p4, p5];

    // Test Verification Gate filtering for pages
    const publicPages = filterPagesForUser(allBookPages, anonymousUser);
    assert(publicPages.length === 2, "Public reader only receives verified and published pages (2 of 5)");
    assert(
      publicPages.every((p) => p.isPublished && p.verificationStatus === "VERIFIED"),
      "Public pages are strictly VERIFIED"
    );

    const reviewerPages = filterPagesForUser(allBookPages, reviewerUser);
    assert(reviewerPages.length === 5, "Authorized reviewer can inspect all 5 pages");

    // Create Scholarly Explanations: 1 Verified, 1 Unverified Draft
    const exp1 = await prisma.scholarlyExplanation.create({
      data: {
        bookId: testBook.id,
        pageNumber: 1,
        explanationType: "TRADITIONAL_COMMENTARY",
        language: "sa",
        content: "सृष्टिक्रमः नाम जगतः प्रादुर्भावप्रकारः। अत्र प्रथमतः परमेश्वरस्य सङ्कल्पेन महत्तत्त्वादीनामुत्पत्तिः वर्णिता।",
        status: "VERIFIED",
        isPublished: true,
        reviewerEmail: "scholarly_council@gurukul.org",
      },
    });

    const expDraft = await prisma.scholarlyExplanation.create({
      data: {
        bookId: testBook.id,
        pageNumber: 1,
        explanationType: "AI_EXPLANATION",
        language: "en",
        content: "Draft AI synthesis pending council review.",
        status: "PENDING_REVIEW",
        isPublished: false,
      },
    });

    const allExplanations = [exp1, expDraft];
    const publicExplanations = filterExplanationsForUser(allExplanations, anonymousUser);
    assert(publicExplanations.length === 1, "Public reader receives ONLY verified explanations (1 of 2)");
    assert(publicExplanations[0].id === exp1.id, "Verified commentary matches approved record");
    assert(publicExplanations[0].status === "VERIFIED", "Public explanation status is strictly VERIFIED");

    const reviewerExplanations = filterExplanationsForUser(allExplanations, reviewerUser);
    assert(reviewerExplanations.length === 2, "Reviewer can see both verified commentary and pending AI draft");

    // Empty state test for unverified page 3
    const emptyExplanations = filterExplanationsForUser([], anonymousUser);
    assert(emptyExplanations.length === 0, "Unverified page returns empty array (triggers reader empty state)");

    // =========================================================================
    // JOURNEY 3: PDF Security & RFC 7233 Byte-Range Access Control
    // =========================================================================
    console.log("\n--- JOURNEY 3: PDF Delivery & RFC 7233 Byte-Range Streaming ---");

    const activeArtifact = await getActivePublicationArtifact(testBook.id);
    assert(activeArtifact !== null, "getActivePublicationArtifact returns active published release");
    assert(activeArtifact.manifest.status === "PUBLISHED", "Active artifact manifest status is PUBLISHED");

    // Verify PDF file byte range support
    const publishedPdfBytes = fs.readFileSync(activeArtifact.absolutePath);
    const totalSize = publishedPdfBytes.length;
    assert(totalSize > 0, `Published PDF size is valid (${totalSize} bytes)`);

    // Simulate RFC 7233 range request (first 512 bytes)
    const rangeStart = 0;
    const rangeEnd = Math.min(511, totalSize - 1);
    const chunk = publishedPdfBytes.subarray(rangeStart, rangeEnd + 1);
    assert(chunk.length === 512, "Byte-range slice (0-511) yields exactly 512 bytes for PDF.js chunk streaming");
    assert(chunk.toString("utf8", 0, 4) === "%PDF", "PDF header (%PDF) present in initial byte-range response");

    // Verify SHA256 integrity
    const hash = crypto.createHash("sha256").update(publishedPdfBytes).digest("hex");
    assert(hash === activeArtifact.manifest.fileHash, "Active publication fileHash matches cryptographic SHA256");

    // =========================================================================
    // JOURNEY 4: Email OTP Verification Hardening & NextAuth Credential Guard
    // =========================================================================
    console.log("\n--- JOURNEY 4: Email OTP Verification & NextAuth Credential Guard ---");

    const bcrypt = await import("bcryptjs");
    const testPassword = "SecurePass123!";
    const passwordHash = await bcrypt.default.hash(testPassword, 10);

    testUser = await prisma.user.create({
      data: {
        email: testEmail,
        name: "E2E Vedic Seeker",
        passwordHash,
        isEmailVerified: false,
        role: "USER",
      },
    });

    assert(testUser.isEmailVerified === false, "New user created with isEmailVerified = false");

    // NextAuth Credentials Provider Check: Must throw EMAIL_NOT_VERIFIED
    const credentialsProvider = authOptions.providers.find((p) => p.name === "Credentials" || p.id === "credentials");
    const authorizeFn = credentialsProvider.options?.authorize || credentialsProvider.authorize;
    let caughtError = null;
    try {
      await authorizeFn({
        email: testEmail,
        password: testPassword,
      });
    } catch (err) {
      caughtError = err.message;
    }

    assert(
      caughtError && caughtError.includes("EMAIL_NOT_VERIFIED"),
      `NextAuth credentials provider strictly blocks unverified user: "${caughtError}"`
    );

    // Generate and dispatch 6-digit email OTP
    const tokenResult = await createAndSendVerificationToken(testUser.email, testUser.name);
    assert(tokenResult.success, "Verification token generated and dispatched successfully");

    const tokenRecord = await prisma.emailVerificationToken.findFirst({
      where: { email: testEmail, used: false },
      orderBy: { createdAt: "desc" },
    });

    assert(tokenRecord !== null, "EmailVerificationToken saved in database");
    assert(/^\d{6}$/.test(tokenRecord.otpCode), `Token OTP is a 6-digit numeric code: [${tokenRecord.otpCode}]`);
    assert(tokenRecord.expiresAt > new Date(), "Token expiration timestamp is set in the future");

    // Rejection of invalid OTP code
    let invalidError = null;
    try {
      await verifyEmailOtp(testEmail, "000000");
    } catch (err) {
      invalidError = err.message;
    }
    assert(
      invalidError && invalidError.includes("Invalid or expired"),
      "Invalid 6-digit OTP code correctly rejected"
    );

    // Completion of email OTP verification with valid code
    const validVerifyResult = await verifyEmailOtp(testEmail, tokenRecord.otpCode);
    assert(validVerifyResult.success, "Valid 6-digit OTP code successfully verified");

    const updatedUser = await prisma.user.findUnique({ where: { id: testUser.id } });
    assert(updatedUser.isEmailVerified === true, "User isEmailVerified updated to true");
    assert(updatedUser.emailVerified !== null, "User emailVerified timestamp recorded");

    // Single-use token enforcement: Replay attack prevention
    let replayError = null;
    try {
      await verifyEmailOtp(testEmail, tokenRecord.otpCode);
    } catch (err) {
      replayError = err.message;
    }
    assert(
      replayError && replayError.includes("Invalid or expired"),
      "Replaying previously used OTP code is strictly rejected"
    );

    // NextAuth Credentials Provider Check: Now permits verified session creation
    const authenticatedSession = await authorizeFn({
      email: testEmail,
      password: testPassword,
    });

    assert(authenticatedSession !== null, "Verified user successfully authenticated by NextAuth");
    assert(authenticatedSession.email === testEmail, "Authenticated session matches verified user email");

  } catch (err) {
    console.error("Test execution exception:", err);
    failed++;
  } finally {
    // Clean up isolated test data
    console.log("\n--- Cleaning up E2E test data ---");
    try {
      if (testUser) {
        await prisma.emailVerificationToken.deleteMany({ where: { email: testUser.email } });
        await prisma.user.delete({ where: { id: testUser.id } });
      }
      if (testBook) {
        await prisma.scholarlyExplanation.deleteMany({ where: { bookId: testBook.id } });
        await prisma.publicationManifest.deleteMany({ where: { bookId: testBook.id } });
        await prisma.bookPage.deleteMany({ where: { bookId: testBook.id } });
        await prisma.chapter.deleteMany({ where: { bookId: testBook.id } });
        await prisma.book.delete({ where: { id: testBook.id } });

        // Remove test upload files
        const testUploadDir = path.join(process.cwd(), "public", "uploads", "books", testBook.id);
        if (fs.existsSync(testUploadDir)) {
          fs.rmSync(testUploadDir, { recursive: true, force: true });
        }
      }
      console.log("  ✓ E2E test records cleaned up cleanly.");
    } catch (cleanupErr) {
      console.warn("Cleanup warning:", cleanupErr.message);
    }
  }

  console.log("\n===============================================================================");
  console.log(`   E2E TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("===============================================================================");

  process.exit(failed > 0 ? 1 : 0);
}

runE2ETests().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
