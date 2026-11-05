import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireReviewPermission } from "@/server/security/authGuard";
import { logAdminActivity } from "@/server/admin/audit";

// POST /api/pages/[pageId]/approve
export async function POST(request, { params }) {
  try {
    const { pageId } = await params;
    const auth = await requireReviewPermission(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;

    const page = await prisma.bookPage.findUnique({
      where: { id: pageId },
      include: {
        ocrErrors: { where: { resolved: false } },
        book: { select: { id: true, title: true } },
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const approve = body?.approve !== false;

    // Validation: Page content eligibility check
    const currentText = (page.proofreadText || page.cleanedText || page.rawText || "").trim();
    if (approve && currentText.length === 0) {
      return NextResponse.json(
        {
          error: "Eligibility check failed: Cannot approve an empty page. Please provide text or record a verified note.",
          code: "EMPTY_PAGE_UNAPPROVABLE",
        },
        { status: 422 }
      );
    }

    // Check for hard pipeline failures that require human correction first
    const hasUnresolvedRenderFailures = page.ocrErrors.some(
      (err) => err.errorType === "IMAGE_RENDER_FAILED" || err.errorType === "OCR_FAILED"
    );
    if (approve && hasUnresolvedRenderFailures && !page.proofreadText) {
      return NextResponse.json(
        {
          error: "Eligibility check failed: Page has unresolved critical OCR/render errors. Provide corrected proofread text before approval.",
          code: "CRITICAL_ERRORS_UNRESOLVED",
        },
        { status: 422 }
      );
    }

    const reviewerEmail = user.email || user.id || "reviewer";

    // Transactional approval and error resolution
    const updated = await prisma.$transaction(async (tx) => {
      const pageResult = await tx.bookPage.update({
        where: { id: pageId },
        data: {
          proofread: approve,
          reviewedBy: approve ? reviewerEmail : null,
          reviewedAt: approve ? new Date() : null,
        },
      });

      if (approve) {
        // Resolve only errors that have been addressed by human proofreading
        // (LOW_CONFIDENCE, EMPTY_PAGE, or explicitly targeted error IDs)
        const errorIdsToResolve = Array.isArray(body.resolvedErrorIds)
          ? body.resolvedErrorIds
          : page.ocrErrors
              .filter((e) => ["LOW_CONFIDENCE", "EMPTY_PAGE", "TEXT_EXTRACTION_FAILED"].includes(e.errorType))
              .map((e) => e.id);

        if (errorIdsToResolve.length > 0) {
          await tx.ocrError.updateMany({
            where: {
              id: { in: errorIdsToResolve },
              pageId,
            },
            data: {
              resolved: true,
              resolvedBy: reviewerEmail,
              resolvedAt: new Date(),
            },
          });
        }
      }

      return pageResult;
    });

    await logAdminActivity({
      actorId: user.id,
      actorEmail: reviewerEmail,
      actorRole: user.role,
      action: approve ? "PAGE_APPROVE" : "PAGE_REVOKE_APPROVAL",
      targetResource: "BookPage",
      targetId: pageId,
      status: "SUCCESS",
      details: {
        pageNumber: page.pageNumber,
        bookId: page.bookId,
        bookTitle: page.book?.title,
        approved: approve,
      },
    });

    return NextResponse.json({
      success: true,
      page: updated,
      message: approve ? "Page reviewed and approved successfully" : "Page approval revoked",
    });
  } catch (error) {
    console.error("POST /api/pages/[pageId]/approve error:", error);
    return NextResponse.json({ error: "Failed to approve page", details: error.message }, { status: 500 });
  }
}
