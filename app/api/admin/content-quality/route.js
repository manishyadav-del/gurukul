import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireReviewPermission } from "@/server/security/authGuard";
import { evaluateBookQuality } from "@/server/ocr/qualityChecks";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/content-quality
 * Returns live database metrics, book processing table data, review queue,
 * and recent audit history for the Content Quality Dashboard.
 */
export async function GET(request) {
  try {
    const auth = await requireReviewPermission(request);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status") || "ALL";
    const languageFilter = searchParams.get("language") || "ALL";
    const ocrStatusFilter = searchParams.get("ocrStatus") || "ALL";
    const reviewStatusFilter = searchParams.get("reviewStatus") || "ALL";
    const searchQuery = searchParams.get("q") || "";

    // 1. Fetch live metrics counts directly from database
    const [
      totalBooks,
      publishedBooks,
      awaitingReview,
      awaitingApproval,
      failedOrPartialBooksCount,
      pagesRequiringProofreading,
      rejectedOrArchived,
      availableReviewers,
    ] = await Promise.all([
      // Total books
      prisma.book.count(),
      // Published books
      prisma.book.count({ where: { status: "PUBLISHED" } }),
      // Awaiting review
      prisma.book.count({ where: { status: "NEEDS_REVIEW" } }),
      // Awaiting approval
      prisma.book.count({ where: { status: "PENDING_APPROVAL" } }),
      // Failed or partial OCR books
      prisma.book.count({
        where: {
          OR: [
            { status: "FAILED" },
            { processingStatus: { in: ["FAILED", "OCR_PROCESSING", "ANALYZING"] } },
            { ocrErrors: { some: { resolved: false } } },
            { pages: { some: { ocrCompleted: false } } },
          ],
        },
      }),
      // Pages requiring proofreading
      prisma.bookPage.count({
        where: {
          OR: [
            { proofread: false },
            { ocrConfidence: { lt: 0.70, not: null } },
          ],
        },
      }),
      // Rejected or archived
      prisma.book.count({
        where: { status: { in: ["REJECTED", "ARCHIVED"] } },
      }),
      // Available reviewers
      prisma.user.findMany({
        where: {
          role: { in: ["ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN", "EDITOR", "PROOFREADER", "OCR_MANAGER"] },
          isActive: true,
        },
        select: { id: true, name: true, email: true, role: true },
        orderBy: { name: "asc" },
      }),
    ]);

    // 2. Fetch all books with page & OCR metrics
    const rawBooks = await prisma.book.findMany({
      include: {
        pages: {
          select: {
            id: true,
            pageNumber: true,
            ocrCompleted: true,
            proofread: true,
            ocrConfidence: true,
            ocrEngine: true,
            processingMethod: true,
            reviewedBy: true,
            reviewedAt: true,
          },
        },
        ocrErrors: {
          where: { resolved: false },
          select: { id: true },
        },
        _count: {
          select: {
            chapters: true,
            passages: true,
            correctionHistory: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // 3. Process each book's metrics
    const processedBooks = rawBooks.map((book) => {
      const pages = book.pages || [];
      const totalPages = pages.length;
      const processedPages = pages.filter((p) => p.ocrCompleted).length;
      const proofreadPages = pages.filter((p) => p.proofread).length;
      const pagesRequiringReview = pages.filter(
        (p) => !p.proofread || (p.ocrConfidence !== null && p.ocrConfidence < 0.70)
      ).length;

      const proofreadingCoverage =
        totalPages > 0 ? Math.round((proofreadPages / totalPages) * 100) : 0;

      // Detect predominant OCR engine
      const engines = pages.map((p) => p.ocrEngine || "tesseract").filter(Boolean);
      const ocrEngine = engines.length > 0 ? engines[0] : "tesseract";

      // Calculate average OCR confidence
      const validConfs = pages
        .map((p) => p.ocrConfidence)
        .filter((c) => typeof c === "number" && !isNaN(c));
      const avgConfidence =
        validConfs.length > 0
          ? Number((validConfs.reduce((a, b) => a + b, 0) / validConfs.length).toFixed(2))
          : 0.85;

      const unresolvedErrorsCount = book.ocrErrors?.length || 0;

      // Determine Publication Readiness Status
      let readinessStatus = "Needs Attention";
      if (
        book.status === "PUBLISHED" ||
        (book.status === "APPROVED" && proofreadingCoverage >= 100 && unresolvedErrorsCount === 0)
      ) {
        readinessStatus = "Passed";
      } else if (
        book.status === "FAILED" ||
        book.processingStatus === "FAILED" ||
        !book.originalFileUrl ||
        totalPages === 0
      ) {
        readinessStatus = "Blocked";
      }

      // Check for assigned reviewer from pages or publicationReadiness
      const pageReviewers = pages.map((p) => p.reviewedBy).filter(Boolean);
      const assignedReviewer =
        pageReviewers.length > 0
          ? pageReviewers[0]
          : book.publicationReadiness?.assignment?.assignedEmail || null;

      return {
        id: book.id,
        title: book.title,
        slug: book.slug,
        language: book.language,
        script: book.script,
        author: book.author || "Classical Sage",
        publisher: book.publisher,
        status: book.status,
        processingStatus: book.processingStatus,
        publishedVersion: book.publishedVersion,
        publishedAt: book.publishedAt,
        publishedBy: book.publishedBy,
        approvedAt: book.approvedAt,
        approvedBy: book.approvedBy,
        rejectionReason: book.rejectionReason,
        totalPages,
        processedPages,
        proofreadPages,
        pagesRequiringReview,
        proofreadingCoverage,
        ocrEngine,
        avgConfidence,
        unresolvedErrorsCount,
        readinessStatus,
        assignedReviewer,
        hasPdf: Boolean(book.originalFileUrl || book.generatedPdfUrl),
        updatedAt: book.updatedAt,
        createdAt: book.createdAt,
        chaptersCount: book._count?.chapters || 0,
        passagesCount: book._count?.passages || 0,
        correctionsCount: book._count?.correctionHistory || 0,
      };
    });

    // 4. Build Review Queue (Books requiring editorial or approval action)
    const reviewQueue = processedBooks.filter(
      (b) =>
        b.status === "NEEDS_REVIEW" ||
        b.status === "PENDING_APPROVAL" ||
        (b.status === "DRAFT" && b.totalPages > 0) ||
        b.pagesRequiringReview > 0
    );

    // 5. Fetch Recent Audit Logs for Books and OCR
    const recentAudit = await prisma.adminAuditLog.findMany({
      where: {
        OR: [
          { targetResource: "Book" },
          { targetResource: "BookPage" },
          { action: { contains: "BOOK" } },
          { action: { contains: "OCR" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      metrics: {
        totalBooks,
        publishedBooks,
        awaitingReview,
        awaitingApproval,
        failedOrPartialBooksCount,
        pagesRequiringProofreading,
        rejectedOrArchived,
      },
      books: processedBooks,
      reviewQueue,
      recentAudit,
      availableReviewers,
    });
  } catch (error) {
    console.error("GET /api/admin/content-quality error:", error);
    return NextResponse.json(
      { error: "Failed to load content quality data", details: error.message },
      { status: 500 }
    );
  }
}
