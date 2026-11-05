import prisma from "../../lib/prisma.js";

/**
 * Gurukul OCR & Content Quality Assessment Engine.
 * Evaluates text integrity, Devanagari conjuncts, Sanskrit diacritics,
 * missing pages, malformed chapter boundaries, and publication readiness.
 */

/**
 * Evaluates quality of a single BookPage.
 * 
 * @param {Object} page - BookPage record with text and metadata
 * @param {Object} options - Configurable thresholds
 * @returns {Object} Quality evaluation result with score, flags, and warnings
 */
export function evaluatePageQuality(page, options = {}) {
  const issues = [];
  let qualityScore = 100;

  const rawText = page.rawText || "";
  const cleanedText = page.cleanedText || "";
  const proofreadText = page.proofreadText || "";
  const currentText = (proofreadText || cleanedText || rawText).trim();
  const confidence = page.ocrConfidence ?? 0.85;

  const isIndic =
    page.language === "hi" ||
    page.language === "sa" ||
    page.language === "Hindi" ||
    page.language === "Sanskrit" ||
    page.book?.language === "Hindi" ||
    page.book?.language === "Sanskrit";

  // 1. Empty or unexpectedly short page
  if (currentText.length === 0) {
    issues.push({
      code: "EMPTY_PAGE",
      severity: "CRITICAL",
      message: "Page yielded zero extractable text.",
    });
    qualityScore -= 50;
  } else if (currentText.length < (options.minLength || 25)) {
    // Check if it's a legitimate short verse or colophon
    const isVerse = currentText.includes("॥") || currentText.includes("।") || /अध्याय|इति|ॐ/u.test(currentText);
    if (!isVerse) {
      issues.push({
        code: "SHORT_PAGE",
        severity: "WARNING",
        message: `Page content is unusually short (${currentText.length} chars) and not identified as a verse or colophon.`,
      });
      qualityScore -= 15;
    }
  }

  // 2. Corrupted or non-Unicode mojibake
  if (/[\uFFFD\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(currentText)) {
    issues.push({
      code: "CORRUPTED_UNICODE",
      severity: "CRITICAL",
      message: "Detected unmapped glyphs or non-printable control characters (\uFFFD).",
    });
    qualityScore -= 30;
  }

  // 3. Devanagari & Sanskrit Script Integrity
  if (isIndic && currentText.length > 20) {
    const devanagariMatches = currentText.match(/[\u0900-\u097F]/g) || [];
    const devanagariRatio = devanagariMatches.length / currentText.length;

    // Abnormal character distribution for Indic manuscript
    if (devanagariRatio < 0.25) {
      issues.push({
        code: "LOW_DEVANAGARI_RATIO",
        severity: "WARNING",
        message: `Only ${Math.round(devanagariRatio * 100)}% Devanagari characters detected on Indic language page. Possible legacy font mojibake.`,
      });
      qualityScore -= 25;
    }

    // Broken conjuncts / double virama error (e.g. ््)
    if (/\u094D\u094D/.test(currentText)) {
      issues.push({
        code: "BROKEN_CONJUNCT_VIRAMA",
        severity: "WARNING",
        message: "Detected illegal consecutive virama sequences in Devanagari conjuncts.",
      });
      qualityScore -= 10;
    }

    // Dangling dependent vowel matras at start of words (e.g. space followed by ा, ि, ी, etc.)
    if (/\s[\u093E-\u094C]/.test(currentText)) {
      issues.push({
        code: "DANGLING_MATRA",
        severity: "INFO",
        message: "Detected isolated dependent vowel signs (matras) not attached to a consonant.",
      });
      qualityScore -= 5;
    }
  }

  // 4. OCR Confidence Score
  const minConfidence = options.minConfidence || 0.75;
  if (page.processingMethod === "OCR" && confidence < minConfidence) {
    issues.push({
      code: "LOW_CONFIDENCE",
      severity: confidence < 0.5 ? "CRITICAL" : "WARNING",
      message: `OCR confidence (${Math.round(confidence * 100)}%) is below operational threshold (${Math.round(minConfidence * 100)}%).`,
    });
    qualityScore -= Math.round((minConfidence - confidence) * 50);
  }

  // 5. Unresolved Processing Errors
  if (Array.isArray(page.ocrErrors) && page.ocrErrors.some((e) => !e.resolved)) {
    const activeErrors = page.ocrErrors.filter((e) => !e.resolved);
    issues.push({
      code: "UNRESOLVED_ERRORS",
      severity: "WARNING",
      message: `Page has ${activeErrors.length} unresolved OCR processing error(s).`,
      errorTypes: activeErrors.map((e) => e.errorType),
    });
    qualityScore -= 15;
  }

  const finalScore = Math.max(0, Math.min(100, qualityScore));

  return {
    score: finalScore,
    status: finalScore >= 80 ? "PASSED" : finalScore >= 60 ? "NEEDS_REVIEW" : "CRITICAL",
    issues,
    isApproved: Boolean(page.proofread),
    hasProofreadText: Boolean(page.proofreadText),
  };
}

/**
 * Evaluates comprehensive quality and publication readiness for an entire Book.
 * 
 * @param {string} bookId - Book UUID
 * @returns {Promise<Object>}
 */
export async function evaluateBookQuality(bookId) {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      pages: {
        orderBy: { pageNumber: "asc" },
        include: { ocrErrors: { where: { resolved: false } } },
      },
      chapters: {
        orderBy: { sortOrder: "asc" },
        include: {
          passages: { select: { id: true, passageNumber: true, text: true } },
        },
      },
      passages: {
        select: { id: true, chapterId: true, text: true, sourcePage: true },
      },
    },
  });

  if (!book) {
    throw new Error(`Book ${bookId} not found`);
  }

  const issues = [];
  const checklist = [];

  const totalPages = book.pages.length;
  const proofreadPages = book.pages.filter((p) => p.proofread).length;
  const unproofreadCount = totalPages - proofreadPages;

  // 1. Page inventory and gap detection
  const pageNumbers = book.pages.map((p) => p.pageNumber);
  const minPage = pageNumbers.length > 0 ? Math.min(...pageNumbers) : 1;
  const maxPage = pageNumbers.length > 0 ? Math.max(...pageNumbers) : 0;
  const missingPages = [];
  const duplicatePages = [];
  const seenPages = new Set();

  for (let num = minPage; num <= maxPage; num++) {
    if (!pageNumbers.includes(num)) {
      missingPages.push(num);
    }
  }

  for (const num of pageNumbers) {
    if (seenPages.has(num)) {
      duplicatePages.push(num);
    }
    seenPages.add(num);
  }

  if (missingPages.length > 0) {
    issues.push({
      code: "MISSING_PAGES",
      severity: "CRITICAL",
      message: `Detected ${missingPages.length} missing page(s) in sequence: [${missingPages.slice(0, 10).join(", ")}${missingPages.length > 10 ? "..." : ""}].`,
    });
  }

  if (duplicatePages.length > 0) {
    issues.push({
      code: "DUPLICATE_PAGES",
      severity: "CRITICAL",
      message: `Detected duplicate page numbers: [${duplicatePages.join(", ")}].`,
    });
  }

  checklist.push({
    item: "Page Sequence & Completeness",
    passed: missingPages.length === 0 && duplicatePages.length === 0 && totalPages > 0,
    details: `${totalPages} total pages recorded (${missingPages.length} missing, ${duplicatePages.length} duplicates)`,
  });

  // 2. Unresolved Critical OCR Errors
  const totalUnresolvedErrors = book.pages.reduce((acc, p) => acc + (p.ocrErrors?.length || 0), 0);
  checklist.push({
    item: "Unresolved OCR Errors",
    passed: totalUnresolvedErrors === 0,
    details: totalUnresolvedErrors === 0 ? "Zero active OCR errors" : `${totalUnresolvedErrors} unresolved errors remain`,
  });

  // 3. Chapter and Hierarchy Boundaries
  let malformedChapters = 0;
  for (const ch of book.chapters) {
    if (ch.startPage && ch.endPage && ch.startPage > ch.endPage) {
      malformedChapters++;
      issues.push({
        code: "MALFORMED_CHAPTER_BOUNDARY",
        severity: "CRITICAL",
        message: `Chapter "${ch.title}" has startPage (${ch.startPage}) greater than endPage (${ch.endPage}).`,
      });
    }
  }

  checklist.push({
    item: "Chapter Hierarchy Boundaries",
    passed: malformedChapters === 0 && (book.chapters.length > 0 || totalPages > 0),
    details: book.chapters.length > 0
      ? `${book.chapters.length} chapters structured (${malformedChapters} malformed)`
      : `${totalPages} continuous pages without division`,
  });

  // 4. Unassigned passages
  const unassignedPassages = book.passages.filter((p) => p.chapterId === null);
  checklist.push({
    item: "Passage Chapter Assignment",
    passed: unassignedPassages.length === 0,
    details: unassignedPassages.length === 0 ? "All passages assigned to chapters" : `${unassignedPassages.length} unassigned passages`,
  });

  // 5. Proofreading Coverage
  const proofreadingRatio = totalPages > 0 ? proofreadPages / totalPages : 0;
  checklist.push({
    item: "Editorial Proofreading Coverage",
    passed: proofreadingRatio >= 1.0,
    details: `${proofreadPages} of ${totalPages} pages proofread (${Math.round(proofreadingRatio * 100)}%)`,
  });

  // 6. Source File Integrity
  checklist.push({
    item: "Source PDF & Storage Integrity",
    passed: Boolean(book.originalFileUrl),
    details: book.originalFileUrl ? "Original PDF persisted in storage" : "Missing source PDF",
  });

  const allMandatoryPassed = checklist.every((c) => c.passed);
  const readinessScore = Math.round(
    (checklist.filter((c) => c.passed).length / checklist.length) * 100
  );

  const report = {
    bookId: book.id,
    title: book.title,
    status: book.status,
    readinessScore,
    isReadyForPublication: allMandatoryPassed,
    checklist,
    issues,
    summary: {
      totalPages,
      proofreadPages,
      unproofreadCount,
      chaptersCount: book.chapters.length,
      passagesCount: book.passages.length,
      unassignedPassagesCount: unassignedPassages.length,
      unresolvedErrorsCount: totalUnresolvedErrors,
    },
    evaluatedAt: new Date().toISOString(),
  };

  // Cache publication readiness in database
  await prisma.book.update({
    where: { id: bookId },
    data: { publicationReadiness: report },
  });

  return report;
}
