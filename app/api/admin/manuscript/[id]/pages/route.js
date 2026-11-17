import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { canReviewBooks, canManageBooks } from "@/lib/permissions";
import { logAdminActivity } from "@/server/admin/audit";

// GET /api/admin/manuscript/[id]/pages
// Returns all pages with verification and publication metadata for studio inspection
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user || (!canReviewBooks(user) && !canManageBooks(user))) {
      return NextResponse.json({ error: "Unauthorized access to manuscript pages" }, { status: 403 });
    }

    const book = await prisma.book.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true, title: true, slug: true, pageCount: true, status: true },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const pages = await prisma.bookPage.findMany({
      where: { bookId: book.id },
      orderBy: { pageNumber: "asc" },
      select: {
        id: true,
        pageNumber: true,
        pdfPageIndex: true,
        imageUrl: true,
        width: true,
        height: true,
        rawText: true,
        cleanedText: true,
        proofreadText: true,
        ocrConfidence: true,
        ocrCompleted: true,
        proofread: true,
        verificationStatus: true,
        isIncluded: true,
        isPublished: true,
        exclusionReason: true,
        verifiedByUserId: true,
        verifiedAt: true,
        _count: {
          select: {
            passages: true,
            scholarlyExplanations: true,
          },
        },
      },
    });

    return NextResponse.json({
      book,
      totalPages: pages.length,
      verifiedPagesCount: pages.filter((p) => ["VERIFIED", "VERIFIED_WITH_CORRECTIONS"].includes(p.verificationStatus)).length,
      publishedPagesCount: pages.filter((p) => p.isPublished && p.isIncluded).length,
      excludedPagesCount: pages.filter((p) => !p.isIncluded).length,
      pages,
    });
  } catch (err) {
    console.error("GET /api/admin/manuscript/[id]/pages error:", err);
    return NextResponse.json({ error: err.message || "Failed to load manuscript pages" }, { status: 500 });
  }
}

// PATCH /api/admin/manuscript/[id]/pages
// Batch or individual update of page publication, inclusion, or verification status
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user || (!canReviewBooks(user) && !canManageBooks(user))) {
      return NextResponse.json({ error: "Unauthorized to modify manuscript pages" }, { status: 403 });
    }

    const book = await prisma.book.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true, title: true },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      pageNumbers, // array of page numbers or single number
      action, // 'approve', 'reject', 'include', 'exclude', 'publish', 'unpublish', 'custom'
      verificationStatus,
      isIncluded,
      isPublished,
      exclusionReason,
      notes,
    } = body || {};

    let targetPages = [];
    if (Array.isArray(pageNumbers)) {
      targetPages = pageNumbers.map(Number).filter((n) => Number.isInteger(n) && n > 0);
    } else if (Number.isInteger(Number(pageNumbers))) {
      targetPages = [Number(pageNumbers)];
    }

    if (targetPages.length === 0) {
      return NextResponse.json({ error: "No valid page numbers provided" }, { status: 400 });
    }

    const updateData = {};

    switch (action) {
      case "approve":
        updateData.verificationStatus = "VERIFIED";
        updateData.proofread = true;
        updateData.isIncluded = true;
        updateData.isPublished = true;
        updateData.verifiedByUserId = user.id;
        updateData.verifiedAt = new Date();
        updateData.exclusionReason = null;
        break;
      case "reject":
        updateData.verificationStatus = "REJECTED";
        updateData.isPublished = false;
        updateData.verifiedByUserId = user.id;
        updateData.verifiedAt = new Date();
        if (exclusionReason) updateData.exclusionReason = exclusionReason;
        break;
      case "include":
        updateData.isIncluded = true;
        updateData.exclusionReason = null;
        break;
      case "exclude":
        updateData.isIncluded = false;
        updateData.isPublished = false;
        if (exclusionReason) updateData.exclusionReason = exclusionReason;
        break;
      case "publish":
        updateData.isPublished = true;
        updateData.isIncluded = true;
        break;
      case "unpublish":
        updateData.isPublished = false;
        break;
      default:
        if (typeof verificationStatus === "string") updateData.verificationStatus = verificationStatus;
        if (typeof isIncluded === "boolean") updateData.isIncluded = isIncluded;
        if (typeof isPublished === "boolean") updateData.isPublished = isPublished;
        if (exclusionReason !== undefined) updateData.exclusionReason = exclusionReason;
        updateData.verifiedByUserId = user.id;
        updateData.verifiedAt = new Date();
    }

    const result = await prisma.bookPage.updateMany({
      where: {
        bookId: book.id,
        pageNumber: { in: targetPages },
      },
      data: updateData,
    });

    // Record Scholarly Review audit trail
    for (const pageNum of targetPages) {
      const pageRecord = await prisma.bookPage.findUnique({
        where: { bookId_pageNumber: { bookId: book.id, pageNumber: pageNum } },
        select: { id: true },
      });

      if (pageRecord) {
        await prisma.scholarlyReview.create({
          data: {
            bookId: book.id,
            pageId: pageRecord.id,
            reviewerId: user.id,
            reviewerEmail: user.email || "reviewer@gurukul.org",
            reviewerRole: user.role || "PROOFREADER",
            previousStatus: "UPDATED",
            newStatus: updateData.verificationStatus || "UPDATED",
            action: (action || "PAGE_STATUS_UPDATE").toUpperCase(),
            reason: exclusionReason || notes || `Action: ${action} on page ${pageNum}`,
            scholarlyNotes: notes || null,
          },
        }).catch(() => {});
      }
    }

    await logAdminActivity({
      userId: user.id,
      userEmail: user.email,
      action: "MANUSCRIPT_PAGES_UPDATED",
      resourceType: "BOOK_PAGE",
      resourceId: book.id,
      details: {
        targetPages,
        action,
        updateData,
        count: result.count,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
      targetPages,
      appliedState: updateData,
    });
  } catch (err) {
    console.error("PATCH /api/admin/manuscript/[id]/pages error:", err);
    return NextResponse.json({ error: err.message || "Failed to update manuscript pages" }, { status: 500 });
  }
}
