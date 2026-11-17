import prisma from "../../lib/prisma.js";

/**
 * Scholarly Verification Statuses
 */
export const VERIFICATION_STATUSES = {
  UNREVIEWED: "UNREVIEWED",
  PENDING_REVIEW: "PENDING_REVIEW",
  UNDER_REVIEW: "UNDER_REVIEW",
  VERIFIED: "VERIFIED",
  VERIFIED_WITH_CORRECTIONS: "VERIFIED_WITH_CORRECTIONS",
  NEEDS_CORRECTION: "NEEDS_CORRECTION",
  REJECTED: "REJECTED",
};

/**
 * Evaluates human scholarly verification and OCR provenance grade.
 * 
 * @param {Object} item - Passage or Page record
 * @returns {Object} Provenance quality metadata
 */
export function evaluateVerificationProvenance(item = {}) {
  const status = item.verificationStatus || (item.proofread ? "VERIFIED" : "UNREVIEWED");
  const ocrConfidence = typeof item.ocrConfidence === "number" ? item.ocrConfidence : 0.88;
  const isHumanVerified = ["VERIFIED", "VERIFIED_WITH_CORRECTIONS"].includes(status);
  const isPending = ["PENDING_REVIEW", "UNDER_REVIEW"].includes(status);
  const needsCorrection = status === "NEEDS_CORRECTION";
  const isRejected = status === "REJECTED";

  let badgeLabel = "Unverified OCR Draft";
  let badgeColor = "amber";
  let explanation = "Extracted via optical character recognition. Awaiting scholarly proofreading.";

  if (isHumanVerified) {
    if (status === "VERIFIED_WITH_CORRECTIONS") {
      badgeLabel = "Verified with Corrections";
      badgeColor = "emerald";
      explanation = "Transcribed and verified by a Sanskrit scholar with textual corrections applied.";
    } else {
      badgeLabel = "Verified Scholarly Text";
      badgeColor = "emerald";
      explanation = "Checked against original manuscript folio by a verified Vedic scholar.";
    }
  } else if (isPending) {
    badgeLabel = "Scholarly Review in Progress";
    badgeColor = "sky";
    explanation = "Currently queued or under review by manuscript proofreaders.";
  } else if (needsCorrection) {
    badgeLabel = "Correction Required";
    badgeColor = "rose";
    explanation = "Reviewer flagged character errors, missing ligatures, or scan defects.";
  } else if (isRejected) {
    badgeLabel = "Rejected Content";
    badgeColor = "rose";
    explanation = "Marked as unscholarly, corrupted scan, or ineligible for citation.";
  } else if (ocrConfidence >= 0.90) {
    badgeLabel = "High-Confidence OCR (Unverified)";
    badgeColor = "amber";
    explanation = "Optical confidence >= 90%, but human scholarly review has not occurred.";
  }

  return {
    verificationStatus: status,
    isHumanVerified,
    isPending,
    needsCorrection,
    isRejected,
    ocrConfidence: Math.round(ocrConfidence * 100) / 100,
    badgeLabel,
    badgeColor,
    explanation,
  };
}

/**
 * Retrieves the comprehensive provenance record for a specific passage.
 * Traces manuscript source, bibliographic edition, OCR extraction metadata,
 * translation attributions, and immutable verification audit history.
 * 
 * @param {string} passageId - Unique identifier of the passage
 * @returns {Promise<Object>} Scholarly provenance packet
 */
export async function getPassageProvenance(passageId) {
  if (!passageId) throw new Error("Passage ID is required");

  const passage = await prisma.passage.findUnique({
    where: { id: passageId },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          slug: true,
          author: true,
          publisher: true,
          edition: true,
          publicationYear: true,
          tradition: true,
          isbn: true,
          language: true,
          script: true,
          originalFileName: true,
          originalFileUrl: true,
          coverImageUrl: true,
          coverUrl: true,
          pageCount: true,
          status: true,
          manuscriptProvenance: true,
        },
      },
      chapter: {
        select: {
          id: true,
          number: true,
          chapterNumber: true,
          title: true,
          slug: true,
          startPage: true,
          endPage: true,
        },
      },
      page: {
        select: {
          id: true,
          pageNumber: true,
          pdfPageIndex: true,
          imageUrl: true,
          processingMethod: true,
          ocrEngine: true,
          ocrConfidence: true,
          ocrCompleted: true,
          proofread: true,
          reviewedBy: true,
          reviewedAt: true,
          ocrProfile: true,
          qualityIssues: true,
          retryCount: true,
          verificationStatus: true,
        },
      },
      correctionHistory: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      scholarlyReviews: {
        orderBy: { createdAt: "desc" },
        take: 30,
      },
      conceptReferences: {
        take: 10,
        include: {
          concept: {
            select: {
              id: true,
              slug: true,
              name: true,
              sanskrit: true,
              category: true,
            },
          },
        },
      },
    },
  });

  if (!passage) return null;

  const provenanceGrade = evaluateVerificationProvenance(passage);

  // Structural provenance locator
  const structuralReference = {
    bookTitle: passage.book?.title || "Classical Scripture",
    bookSlug: passage.book?.slug || "",
    author: passage.book?.author || "Traditional Vedic Sage",
    tradition: passage.book?.tradition || "Classical Vedic / Shastra",
    chapterNumber: passage.chapter?.chapterNumber || passage.chapter?.number || null,
    chapterTitle: passage.chapter?.title || "General Section",
    chapterSlug: passage.chapter?.slug || "",
    verseNumber: passage.verseNumber || (passage.passageNumber ? `Verse ${passage.passageNumber}` : null),
    sourcePage: passage.sourcePage || passage.page?.pageNumber || null,
    endPage: passage.endPage || null,
    manuscriptPageUrl: passage.page?.imageUrl || null,
    pdfSourceUrl: `/api/books/${passage.book?.id}/source`,
    readerUrl: `/library/${passage.book?.slug || "book"}/${passage.chapter?.slug || "chapter"}?passageId=${passage.id}#passage-${passage.id}`,
  };

  // Bibliographic metadata
  const bibliographicDetails = {
    publisher: passage.book?.publisher || null,
    publicationYear: passage.book?.publicationYear || null,
    edition: passage.book?.edition || null,
    isbn: passage.book?.isbn || null,
    originalLanguage: passage.book?.language || "Sanskrit",
    script: passage.book?.script || "Devanagari",
    manuscriptProvenance: passage.book?.manuscriptProvenance || null,
  };

  // Content layers with rigorous separation between original scripture, translations, and AI
  const contentLayers = {
    originalText: passage.text || "",
    rawOcrText: passage.rawText || passage.text || "",
    proofreadText: passage.proofreadText || null,
    transliteration: passage.transliteration || null,
    translations: {
      hindi: {
        text: passage.hindiTranslation || null,
        source: passage.translationSource || null,
        translator: passage.translator || null,
        isAvailable: Boolean(passage.hindiTranslation),
      },
      english: {
        text: passage.englishTranslation || null,
        source: passage.translationSource || null,
        translator: passage.translator || null,
        isAvailable: Boolean(passage.englishTranslation),
      },
    },
    traditionalCommentary: {
      commentary: passage.commentary || null,
      source: passage.commentarySource || null,
      isAvailable: Boolean(passage.commentary),
    },
    anvaya: passage.anvaya || null,
  };

  // OCR and Extraction Provenance
  const extractionProvenance = {
    processingMethod: passage.page?.processingMethod || "OCR",
    ocrEngine: passage.page?.ocrEngine || "tesseract",
    opticalConfidence: passage.ocrConfidence ?? passage.page?.ocrConfidence ?? null,
    textLayerReliability: passage.page?.qualityIssues?.hasDtpFont
      ? "LEGACY_DTP_CONVERTED"
      : passage.page?.processingMethod === "TEXT_EXTRACTION"
      ? "DIGITAL_NATIVE_EMBEDDED"
      : "OPTICAL_SCAN_EXTRACTED",
    legacyDtpFontDetected: Boolean(passage.page?.qualityIssues?.hasDtpFont),
    retryCount: passage.page?.retryCount || 0,
    pageScanVerified: Boolean(passage.page?.proofread),
  };

  // Verification and Review History
  const verificationAudit = {
    currentStatus: passage.verificationStatus || "UNREVIEWED",
    verifiedBy: passage.verifiedBy || null,
    verifiedAt: passage.verifiedAt || null,
    scholarlyNotes: passage.scholarlyNotes || null,
    reviewTrail: passage.scholarlyReviews.map((r) => ({
      id: r.id,
      action: r.action,
      previousStatus: r.previousStatus,
      newStatus: r.newStatus,
      reviewerEmail: r.reviewerEmail,
      reviewerRole: r.reviewerRole,
      reason: r.reason,
      scholarlyNotes: r.scholarlyNotes,
      createdAt: r.createdAt,
    })),
    correctionHistory: passage.correctionHistory.map((c) => ({
      id: c.id,
      previousText: c.previousText,
      correctedText: c.correctedText,
      correctedBy: c.correctedBy,
      reason: c.reason,
      notes: c.notes,
      createdAt: c.createdAt,
    })),
  };

  return {
    passageId: passage.id,
    passageNumber: passage.passageNumber,
    passageType: passage.passageType,
    provenanceGrade,
    structuralReference,
    bibliographicDetails,
    contentLayers,
    extractionProvenance,
    verificationAudit,
    associatedConcepts: passage.conceptReferences.map((ref) => ({
      id: ref.concept.id,
      slug: ref.concept.slug,
      name: ref.concept.name,
      sanskrit: ref.concept.sanskrit,
      category: ref.concept.category,
      relevance: ref.relevance,
    })),
  };
}

/**
 * Submits a passage to the scholarly verification queue.
 * 
 * @param {Object} params
 * @param {string} params.passageId
 * @param {Object} params.user
 * @param {string} [params.notes]
 */
export async function submitPassageForReview({ passageId, user, notes = null }) {
  if (!passageId) throw new Error("Passage ID required");
  const actorEmail = user?.email || user?.id || "scholar@gurukul.org";
  const actorRole = user?.role || "PROOFREADER";

  const passage = await prisma.passage.findUnique({
    where: { id: passageId },
    select: { id: true, bookId: true, pageId: true, text: true, verificationStatus: true },
  });

  if (!passage) throw new Error("Passage not found");

  const newStatus = VERIFICATION_STATUSES.PENDING_REVIEW;

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.passage.update({
      where: { id: passageId },
      data: {
        verificationStatus: newStatus,
        needsReview: true,
      },
    });

    await tx.scholarlyReview.create({
      data: {
        bookId: passage.bookId,
        passageId: passage.id,
        pageId: passage.pageId,
        reviewerId: user?.id || null,
        reviewerEmail: actorEmail,
        reviewerRole: actorRole,
        previousStatus: passage.verificationStatus || "UNREVIEWED",
        newStatus,
        action: "SUBMIT_FOR_REVIEW",
        scholarlyNotes: notes,
        originalText: passage.text,
      },
    });

    return updated;
  });

  return result;
}

/**
 * Verifies or corrects a passage with full scholarly attribution,
 * immutable review audit, and character-change tracking.
 * 
 * @param {Object} params
 * @param {string} params.passageId
 * @param {string} params.status - 'VERIFIED' | 'VERIFIED_WITH_CORRECTIONS' | 'NEEDS_CORRECTION' | 'REJECTED'
 * @param {string} [params.correctedText]
 * @param {string} [params.reason]
 * @param {string} [params.scholarlyNotes]
 * @param {string} [params.transliteration]
 * @param {string} [params.hindiTranslation]
 * @param {string} [params.englishTranslation]
 * @param {string} [params.translationSource]
 * @param {string} [params.translator]
 * @param {string} [params.commentary]
 * @param {string} [params.commentarySource]
 * @param {string} [params.anvaya]
 * @param {string} [params.verseNumber]
 * @param {Object} params.user
 */
export async function verifyPassage({
  passageId,
  status,
  correctedText = null,
  reason = null,
  scholarlyNotes = null,
  transliteration = undefined,
  hindiTranslation = undefined,
  englishTranslation = undefined,
  translationSource = undefined,
  translator = undefined,
  commentary = undefined,
  commentarySource = undefined,
  anvaya = undefined,
  verseNumber = undefined,
  user,
}) {
  if (!passageId) throw new Error("Passage ID is required");
  if (!status || !Object.values(VERIFICATION_STATUSES).includes(status)) {
    throw new Error(`Invalid verification status: ${status}`);
  }

  const actorEmail = user?.email || user?.id || "admin@gurukul.org";
  const actorRole = user?.role || "EXPERT";

  const existing = await prisma.passage.findUnique({
    where: { id: passageId },
    include: {
      book: {
        select: { id: true, status: true, publishedVersion: true },
      },
    },
  });

  if (!existing) throw new Error("Passage not found");

  const hasTextCorrection =
    correctedText !== null &&
    correctedText !== undefined &&
    correctedText.trim() !== "" &&
    correctedText.trim() !== existing.text.trim();

  const finalStatus = hasTextCorrection && status === "VERIFIED"
    ? VERIFICATION_STATUSES.VERIFIED_WITH_CORRECTIONS
    : status;

  const dataToUpdate = {
    verificationStatus: finalStatus,
    verifiedBy: actorEmail,
    verifiedAt: new Date(),
    scholarlyNotes: scholarlyNotes ?? existing.scholarlyNotes,
    needsReview: finalStatus === "NEEDS_CORRECTION",
  };

  if (hasTextCorrection) {
    const trimmed = correctedText.trim();
    dataToUpdate.text = trimmed;
    dataToUpdate.proofreadText = trimmed;
    dataToUpdate.cleanedText = trimmed;
    dataToUpdate.previousText = existing.text;
    dataToUpdate.searchText = trimmed
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  if (transliteration !== undefined) dataToUpdate.transliteration = transliteration;
  if (hindiTranslation !== undefined) dataToUpdate.hindiTranslation = hindiTranslation;
  if (englishTranslation !== undefined) dataToUpdate.englishTranslation = englishTranslation;
  if (translationSource !== undefined) dataToUpdate.translationSource = translationSource;
  if (translator !== undefined) dataToUpdate.translator = translator;
  if (commentary !== undefined) dataToUpdate.commentary = commentary;
  if (commentarySource !== undefined) dataToUpdate.commentarySource = commentarySource;
  if (anvaya !== undefined) dataToUpdate.anvaya = anvaya;
  if (verseNumber !== undefined) dataToUpdate.verseNumber = verseNumber;

  const result = await prisma.$transaction(async (tx) => {
    const updatedPassage = await tx.passage.update({
      where: { id: passageId },
      data: dataToUpdate,
    });

    // Immutable review record
    await tx.scholarlyReview.create({
      data: {
        bookId: existing.bookId,
        passageId: existing.id,
        pageId: existing.pageId,
        reviewerId: user?.id || null,
        reviewerEmail: actorEmail,
        reviewerRole: actorRole,
        previousStatus: existing.verificationStatus || "UNREVIEWED",
        newStatus: finalStatus,
        action: hasTextCorrection ? "CORRECT_AND_VERIFY" : finalStatus === "REJECTED" ? "REJECT" : "APPROVE",
        reason: reason || null,
        scholarlyNotes: scholarlyNotes || null,
        originalText: existing.text,
        verifiedText: hasTextCorrection ? dataToUpdate.text : existing.text,
        characterChanges: hasTextCorrection
          ? {
              previousLength: existing.text.length,
              newLength: dataToUpdate.text.length,
              charDelta: dataToUpdate.text.length - existing.text.length,
            }
          : null,
      },
    });

    // If text was modified, save to CorrectionHistory and invalidate outdated embeddings
    if (hasTextCorrection) {
      await tx.correctionHistory.create({
        data: {
          bookId: existing.bookId,
          pageId: existing.pageId,
          passageId: existing.id,
          previousText: existing.text,
          correctedText: dataToUpdate.text,
          correctedBy: actorEmail,
          reason: reason || "Scholarly verse verification",
          notes: scholarlyNotes || null,
          reviewStatus: finalStatus,
        },
      });

      await tx.passageEmbedding.updateMany({
        where: { passageId: existing.id },
        data: { status: "OUTDATED" },
      });
    }

    return updatedPassage;
  });

  return result;
}

/**
 * Retrieves the verification queue with filters for scholarly review.
 * 
 * @param {Object} params
 * @param {string} [params.status]
 * @param {string} [params.bookId]
 * @param {string} [params.language]
 * @param {string} [params.tradition]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 */
export async function getVerificationQueue({
  status = null,
  bookId = null,
  language = null,
  tradition = null,
  page = 1,
  limit = 20,
} = {}) {
  const where = {};

  if (status && status !== "ALL") {
    where.verificationStatus = status;
  } else if (!status) {
    // Default queue shows items requiring attention
    where.verificationStatus = {
      in: ["PENDING_REVIEW", "UNDER_REVIEW", "NEEDS_CORRECTION", "UNREVIEWED"],
    };
  }

  if (bookId) where.bookId = bookId;

  if (language || tradition) {
    where.book = {};
    if (language) where.book.language = { equals: language, mode: "insensitive" };
    if (tradition) where.book.tradition = { contains: tradition, mode: "insensitive" };
  }

  const skip = (Math.max(page, 1) - 1) * limit;

  const [total, passages] = await Promise.all([
    prisma.passage.count({ where }),
    prisma.passage.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ updatedAt: "desc" }, { sortOrder: "asc" }],
      include: {
        book: {
          select: {
            id: true,
            title: true,
            slug: true,
            author: true,
            tradition: true,
            language: true,
          },
        },
        chapter: {
          select: {
            id: true,
            title: true,
            chapterNumber: true,
          },
        },
        page: {
          select: {
            id: true,
            pageNumber: true,
            imageUrl: true,
            ocrConfidence: true,
            processingMethod: true,
          },
        },
        _count: {
          select: {
            correctionHistory: true,
            scholarlyReviews: true,
          },
        },
      },
    }),
  ]);

  return {
    queue: passages.map((p) => ({
      id: p.id,
      passageNumber: p.passageNumber,
      verseNumber: p.verseNumber,
      text: p.text,
      rawText: p.rawText,
      verificationStatus: p.verificationStatus || "UNREVIEWED",
      ocrConfidence: p.ocrConfidence ?? p.page?.ocrConfidence ?? null,
      needsReview: p.needsReview,
      verifiedBy: p.verifiedBy,
      verifiedAt: p.verifiedAt,
      scholarlyNotes: p.scholarlyNotes,
      bookTitle: p.book?.title,
      bookId: p.book?.id,
      author: p.book?.author,
      tradition: p.book?.tradition,
      language: p.book?.language,
      chapterTitle: p.chapter?.title,
      sourcePage: p.sourcePage || p.page?.pageNumber,
      manuscriptPageUrl: p.page?.imageUrl,
      correctionCount: p._count.correctionHistory,
      reviewCount: p._count.scholarlyReviews,
      provenanceGrade: evaluateVerificationProvenance(p),
    })),
    pagination: {
      page: Math.max(page, 1),
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Returns aggregated statistics for the Scholarly Verification Studio.
 * 
 * @returns {Promise<Object>} Statistics packet
 */
export async function getVerificationStatistics() {
  const [
    totalPassages,
    verifiedCount,
    verifiedWithCorrectionsCount,
    pendingReviewCount,
    underReviewCount,
    needsCorrectionCount,
    rejectedCount,
    unreviewedCount,
    totalBooks,
    recentReviews,
  ] = await Promise.all([
    prisma.passage.count(),
    prisma.passage.count({ where: { verificationStatus: "VERIFIED" } }),
    prisma.passage.count({ where: { verificationStatus: "VERIFIED_WITH_CORRECTIONS" } }),
    prisma.passage.count({ where: { verificationStatus: "PENDING_REVIEW" } }),
    prisma.passage.count({ where: { verificationStatus: "UNDER_REVIEW" } }),
    prisma.passage.count({ where: { verificationStatus: "NEEDS_CORRECTION" } }),
    prisma.passage.count({ where: { verificationStatus: "REJECTED" } }),
    prisma.passage.count({ where: { verificationStatus: "UNREVIEWED" } }),
    prisma.book.count(),
    prisma.scholarlyReview.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        book: { select: { id: true, title: true } },
        passage: { select: { id: true, passageNumber: true, sourcePage: true } },
      },
    }),
  ]);

  const verifiedTotal = verifiedCount + verifiedWithCorrectionsCount;
  const verifiedPercentage = totalPassages > 0
    ? Math.round((verifiedTotal / totalPassages) * 1000) / 10
    : 0;

  return {
    overview: {
      totalPassages,
      totalBooks,
      verifiedTotal,
      verifiedPercentage,
    },
    byStatus: {
      VERIFIED: verifiedCount,
      VERIFIED_WITH_CORRECTIONS: verifiedWithCorrectionsCount,
      PENDING_REVIEW: pendingReviewCount,
      UNDER_REVIEW: underReviewCount,
      NEEDS_CORRECTION: needsCorrectionCount,
      REJECTED: rejectedCount,
      UNREVIEWED: unreviewedCount,
    },
    recentReviews: recentReviews.map((r) => ({
      id: r.id,
      action: r.action,
      newStatus: r.newStatus,
      reviewerEmail: r.reviewerEmail,
      reviewerRole: r.reviewerRole,
      reason: r.reason,
      scholarlyNotes: r.scholarlyNotes,
      bookTitle: r.book?.title,
      passageId: r.passageId,
      sourcePage: r.passage?.sourcePage,
      createdAt: r.createdAt,
    })),
  };
}

/**
 * Retrieves the bibliographic provenance for a book,
 * including page-level OCR confidence and verification coverage.
 * 
 * @param {string} bookId 
 */
export async function getBookProvenance(bookId) {
  if (!bookId) throw new Error("Book ID is required");

  const book = await prisma.book.findFirst({
    where: { OR: [{ id: bookId }, { slug: bookId }] },
    include: {
      _count: {
        select: {
          pages: true,
          passages: true,
          chapters: true,
        },
      },
      pages: {
        select: {
          id: true,
          pageNumber: true,
          ocrConfidence: true,
          proofread: true,
          verificationStatus: true,
          processingMethod: true,
        },
        orderBy: { pageNumber: "asc" },
      },
    },
  });

  if (!book) return null;

  const totalPages = book.pages.length;
  const verifiedPages = book.pages.filter((p) => p.proofread || p.verificationStatus === "VERIFIED").length;
  const averageConfidence = totalPages > 0
    ? book.pages.reduce((acc, p) => acc + (p.ocrConfidence || 0), 0) / totalPages
    : 0;

  return {
    id: book.id,
    title: book.title,
    slug: book.slug,
    author: book.author || "Traditional Vedic Sage",
    tradition: book.tradition || "Classical Vedic Shastra",
    publisher: book.publisher || null,
    publicationYear: book.publicationYear || null,
    edition: book.edition || null,
    isbn: book.isbn || null,
    language: book.language,
    script: book.script,
    originalFileName: book.originalFileName,
    originalFileUrl: book.originalFileUrl,
    pageCount: book.pageCount || totalPages,
    status: book.status,
    manuscriptProvenance: book.manuscriptProvenance,
    metrics: {
      totalPages,
      totalPassages: book._count.passages,
      totalChapters: book._count.chapters,
      verifiedPages,
      verificationPercentage: totalPages > 0 ? Math.round((verifiedPages / totalPages) * 100) : 0,
      averageOcrConfidence: Math.round(averageConfidence * 100) / 100,
    },
  };
}
