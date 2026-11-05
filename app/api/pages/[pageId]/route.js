import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { updatePageSchema } from "@/lib/validation";
import { getAuthenticatedUser, requireReviewPermission } from "@/server/security/authGuard";
import { canReviewBooks } from "@/lib/permissions";
import { logAdminActivity } from "@/server/admin/audit";

// GET /api/pages/[pageId]
export async function GET(request, { params }) {
  try {
    const { pageId } = await params;

    const page = await prisma.bookPage.findUnique({
      where: { id: pageId },
      include: {
        ocrBlocks: { orderBy: { blockOrder: "asc" } },
        ocrErrors: { orderBy: { createdAt: "desc" } },
        passages: {
          orderBy: { passageNumber: "asc" },
          select: {
            id: true, passageNumber: true, text: true,
            rawText: true, cleanedText: true, proofreadText: true,
            startOffset: true, endOffset: true,
          },
        },
        book: {
          select: {
            id: true, title: true, slug: true, language: true, pageCount: true, status: true,
          },
        },
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Protect unpublished books from unauthorized access
    if (page.book?.status !== "PUBLISHED") {
      const user = await getAuthenticatedUser(request);
      if (!user || !canReviewBooks(user)) {
        return NextResponse.json(
          { error: "Forbidden: Page belongs to an unpublished manuscript" },
          { status: 403 }
        );
      }
    }

    const [prevPage, nextPage] = await Promise.all([
      prisma.bookPage.findFirst({
        where: { bookId: page.bookId, pageNumber: { lt: page.pageNumber } },
        orderBy: { pageNumber: "desc" },
        select: { id: true, pageNumber: true, proofread: true },
      }),
      prisma.bookPage.findFirst({
        where: { bookId: page.bookId, pageNumber: { gt: page.pageNumber } },
        orderBy: { pageNumber: "asc" },
        select: { id: true, pageNumber: true, proofread: true },
      }),
    ]);

    return NextResponse.json({
      page,
      navigation: {
        prevPageId: prevPage?.id || null,
        prevPageNumber: prevPage?.pageNumber || null,
        nextPageId: nextPage?.id || null,
        nextPageNumber: nextPage?.pageNumber || null,
      },
    });
  } catch (error) {
    console.error("GET /api/pages/[pageId] error:", error);
    return NextResponse.json({ error: "Failed to fetch page", details: error.message }, { status: 500 });
  }
}

// PATCH /api/pages/[pageId]
export async function PATCH(request, { params }) {
  try {
    const { pageId } = await params;
    const auth = await requireReviewPermission(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;

    const page = await prisma.bookPage.findUnique({
      where: { id: pageId },
      select: {
        id: true,
        bookId: true,
        pageNumber: true,
        proofreadText: true,
        rawText: true,
        cleanedText: true,
        proofread: true,
        book: {
          select: {
            id: true,
            status: true,
            publishedVersion: true,
          },
        },
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const body = await request.json();
    const validated = updatePageSchema.parse(body);

    const updateData = {};
    if (validated.proofreadText !== undefined) {
      updateData.proofreadText = validated.proofreadText;
    }
    if (validated.proofread !== undefined) {
      updateData.proofread = validated.proofread;
    }

    const actorId = user.id;
    const actorEmail = user.email || user.id || "admin";

    // Handle Rollback request if requested
    if (body.rollbackCorrectionId) {
      const targetCorrection = await prisma.correctionHistory.findUnique({
        where: { id: body.rollbackCorrectionId },
      });
      if (!targetCorrection || targetCorrection.pageId !== pageId) {
        return NextResponse.json({ error: "Correction record not found for rollback" }, { status: 404 });
      }
      updateData.proofreadText = targetCorrection.previousText;
    }

    // Transactional update for data integrity
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.bookPage.update({
        where: { id: pageId },
        data: updateData,
      });

      if (validated.flagError) {
        await tx.ocrError.create({
          data: {
            bookId: page.bookId,
            pageId: pageId,
            errorType: validated.flagError.errorType,
            message: validated.flagError.message,
            resolved: false,
          },
        });
      }

      if (
        (validated.proofreadText !== undefined && page.proofreadText !== validated.proofreadText) ||
        body.rollbackCorrectionId
      ) {
        await tx.correctionHistory.create({
          data: {
            pageId: pageId,
            bookId: page.bookId,
            previousText: page.proofreadText || page.cleanedText || page.rawText || "",
            correctedText: updateData.proofreadText || "",
            correctedBy: actorEmail,
          },
        });

        // If the book is already PUBLISHED or APPROVED, content edit invalidates approval and triggers review state
        if (page.book?.status === "PUBLISHED" || page.book?.status === "APPROVED") {
          await tx.book.update({
            where: { id: page.bookId },
            data: {
              status: "NEEDS_REVIEW",
              approvedAt: null,
              approvedBy: null,
              publishedVersion: page.book.status === "PUBLISHED" ? (page.book.publishedVersion || 1) + 1 : page.book.publishedVersion,
            },
          });
        }
      }

      return updated;
    });

    await logAdminActivity({
      actorId,
      actorEmail,
      actorRole: user.role,
      action: "PAGE_EDIT_PROOFREAD",
      targetResource: "BookPage",
      targetId: pageId,
      status: "SUCCESS",
      details: {
        pageNumber: page.pageNumber,
        bookId: page.bookId,
        proofreadMarked: validated.proofread,
        hasTextUpdate: validated.proofreadText !== undefined,
      },
    });

    return NextResponse.json({ page: result });
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 422 });
    }
    console.error("PATCH /api/pages/[pageId] error:", error);
    return NextResponse.json({ error: "Failed to update page", details: error.message }, { status: 500 });
  }
}
