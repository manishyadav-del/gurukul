import prisma from "@/lib/prisma";
import ContentQualityDashboardClient from "@/components/admin/ContentQualityDashboardClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminBooksPage() {
  const session = await getServerSession(authOptions).catch(() => null);
  const userRole = session?.user?.role || "ADMIN";

  // 1. Fetch live metrics directly from PostgreSQL
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
    prisma.book.count(),
    prisma.book.count({ where: { status: "PUBLISHED" } }),
    prisma.book.count({ where: { status: "NEEDS_REVIEW" } }),
    prisma.book.count({ where: { status: "PENDING_APPROVAL" } }),
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
    prisma.bookPage.count({
      where: {
        OR: [
          { proofread: false },
          { ocrConfidence: { lt: 0.70, not: null } },
        ],
      },
    }),
    prisma.book.count({
      where: { status: { in: ["REJECTED", "ARCHIVED"] } },
    }),
    prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "SUPER_ADMIN", "CONTENT_ADMIN", "EDITOR", "PROOFREADER", "OCR_MANAGER"] },
        isActive: true,
      },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // 2. Fetch all books with page and OCR details
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

  // 3. Process books data
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

    const engines = pages.map((p) => p.ocrEngine || "tesseract").filter(Boolean);
    const ocrEngine = engines.length > 0 ? engines[0] : "tesseract";

    const validConfs = pages
      .map((p) => p.ocrConfidence)
      .filter((c) => typeof c === "number" && !isNaN(c));
    const avgConfidence =
      validConfs.length > 0
        ? Number((validConfs.reduce((a, b) => a + b, 0) / validConfs.length).toFixed(2))
        : 0.85;

    const unresolvedErrorsCount = book.ocrErrors?.length || 0;

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

  // 4. Review Queue
  const reviewQueue = processedBooks.filter(
    (b) =>
      b.status === "NEEDS_REVIEW" ||
      b.status === "PENDING_APPROVAL" ||
      (b.status === "DRAFT" && b.totalPages > 0) ||
      b.pagesRequiringReview > 0
  );

  // 5. Recent Audit Logs
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

  const metrics = {
    totalBooks,
    publishedBooks,
    awaitingReview,
    awaitingApproval,
    failedOrPartialBooksCount,
    pagesRequiringProofreading,
    rejectedOrArchived,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ContentQualityDashboardClient
        initialMetrics={metrics}
        initialBooks={processedBooks}
        initialReviewQueue={reviewQueue}
        initialAudit={recentAudit}
        availableReviewers={availableReviewers}
        currentUserRole={userRole}
      />
    </div>
  );
}
