import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireReviewPermission, requireManagePermission } from "@/server/security/authGuard";
import { logAdminActivity } from "@/server/admin/audit";

// PATCH /api/passages/[passageId]
export async function PATCH(request, { params }) {
  try {
    const { passageId } = await params;
    const auth = await requireReviewPermission(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;

    const body = await request.json();
    const { text, passageType, status, chapterId, needsReview } = body;

    const existing = await prisma.passage.findUnique({
      where: { id: passageId },
      include: {
        book: {
          select: { id: true, status: true, publishedVersion: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Passage not found" }, { status: 404 });
    }

    const dataToUpdate = {};
    let textModified = false;

    // If text was modified, audit previous text in CorrectionHistory & invalidate stale embeddings
    if (text !== undefined && text !== existing.text) {
      textModified = true;
      dataToUpdate.text = text;
      dataToUpdate.cleanedText = text;
      dataToUpdate.proofreadText = text;
      dataToUpdate.previousText = existing.text;

      // Update search text
      dataToUpdate.searchText = text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    if (passageType !== undefined) dataToUpdate.passageType = passageType;
    if (chapterId !== undefined) dataToUpdate.chapterId = chapterId || null;
    if (status !== undefined) {
      dataToUpdate.status = status;
      if (status === "APPROVED" || status === "PUBLISHED") {
        dataToUpdate.needsReview = false;
      }
    }
    if (needsReview !== undefined) dataToUpdate.needsReview = Boolean(needsReview);

    const actorEmail = user.email || user.id || "admin";

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.passage.update({
        where: { id: passageId },
        data: dataToUpdate,
        include: {
          correctionHistory: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (textModified) {
        await tx.correctionHistory.create({
          data: {
            bookId: existing.bookId,
            pageId: existing.pageId,
            passageId: existing.id,
            previousText: existing.text,
            correctedText: text,
            correctedBy: actorEmail,
          },
        });

        // Invalidate stale embeddings for this passage
        await tx.passageEmbedding.updateMany({
          where: { passageId: existing.id },
          data: { status: "OUTDATED" },
        });

        // If the book is already PUBLISHED or APPROVED, content edit invalidates approval and triggers review state
        if (existing.book?.status === "PUBLISHED" || existing.book?.status === "APPROVED") {
          await tx.book.update({
            where: { id: existing.bookId },
            data: {
              status: "NEEDS_REVIEW",
              approvedAt: null,
              approvedBy: null,
              publishedVersion: existing.book.status === "PUBLISHED" ? (existing.book.publishedVersion || 1) + 1 : existing.book.publishedVersion,
            },
          });
        }
      }

      return p;
    });

    await logAdminActivity({
      actorId: user.id,
      actorEmail,
      actorRole: user.role,
      action: "PASSAGE_EDIT",
      targetResource: "Passage",
      targetId: passageId,
      status: "SUCCESS",
      details: {
        bookId: existing.bookId,
        textModified,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/passages/[passageId] error:", error);
    return NextResponse.json(
      { error: "Failed to update passage", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/passages/[passageId]
export async function DELETE(request, { params }) {
  try {
    const { passageId } = await params;
    const auth = await requireManagePermission(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;

    const existing = await prisma.passage.findUnique({
      where: { id: passageId },
      select: { id: true, bookId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Passage not found" }, { status: 404 });
    }

    await prisma.passage.delete({
      where: { id: passageId },
    });

    await logAdminActivity({
      actorId: user.id,
      actorEmail: user.email || user.id,
      actorRole: user.role,
      action: "PASSAGE_DELETE",
      targetResource: "Passage",
      targetId: passageId,
      status: "SUCCESS",
      details: {
        bookId: existing.bookId,
      },
    });

    return NextResponse.json({ success: true, message: "Passage deleted" });
  } catch (error) {
    console.error("DELETE /api/passages/[passageId] error:", error);
    return NextResponse.json(
      { error: "Failed to delete passage", details: error.message },
      { status: 500 }
    );
  }
}
