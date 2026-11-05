import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireManagePermission } from "@/server/security/authGuard";
import { logAdminActivity } from "@/server/admin/audit";

// PATCH /api/chapters/[chapterId]
export async function PATCH(request, { params }) {
  try {
    const { chapterId } = await params;
    const auth = await requireManagePermission(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;

    const body = await request.json();
    const { title, subheading, chapterNumber, startPage, endPage, status, isPublished } = body;

    const existing = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { book: { select: { id: true, title: true, status: true, publishedVersion: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    const dataToUpdate = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (subheading !== undefined) dataToUpdate.subheading = subheading;
    if (chapterNumber !== undefined) {
      dataToUpdate.chapterNumber = Number(chapterNumber);
      dataToUpdate.number = Number(chapterNumber);
      dataToUpdate.sortOrder = Number(chapterNumber);
    }
    if (startPage !== undefined) dataToUpdate.startPage = Number(startPage);
    if (endPage !== undefined) dataToUpdate.endPage = Number(endPage);
    if (status !== undefined) {
      dataToUpdate.status = status;
      if (status === "APPROVED") dataToUpdate.needsReview = false;
      if (status === "PUBLISHED") {
        dataToUpdate.isPublished = true;
        dataToUpdate.needsReview = false;
      }
    }
    if (isPublished !== undefined) dataToUpdate.isPublished = Boolean(isPublished);

    const updated = await prisma.$transaction(async (tx) => {
      const ch = await tx.chapter.update({
        where: { id: chapterId },
        data: dataToUpdate,
      });

      // If structural edit occurs on already PUBLISHED or APPROVED book, invalidate approval & trigger review state
      if ((existing.book?.status === "PUBLISHED" || existing.book?.status === "APPROVED") && (title !== undefined || startPage !== undefined || endPage !== undefined || chapterNumber !== undefined)) {
        await tx.book.update({
          where: { id: existing.book.id },
          data: {
            status: "NEEDS_REVIEW",
            approvedAt: null,
            approvedBy: null,
            publishedVersion: existing.book.status === "PUBLISHED" ? (existing.book.publishedVersion || 1) + 1 : existing.book.publishedVersion,
          },
        });
      }

      return ch;
    });

    await logAdminActivity({
      actorId: user.id,
      actorEmail: user.email || user.id,
      actorRole: user.role,
      action: "CHAPTER_UPDATE",
      targetResource: "Chapter",
      targetId: chapterId,
      status: "SUCCESS",
      details: {
        bookId: existing.bookId,
        fieldsUpdated: Object.keys(dataToUpdate),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/chapters/[chapterId] error:", error);
    return NextResponse.json(
      { error: "Failed to update chapter", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/chapters/[chapterId]
export async function DELETE(request, { params }) {
  try {
    const { chapterId } = await params;
    const auth = await requireManagePermission(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;

    const existing = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { id: true, bookId: true, title: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // Unlink passages first
    await prisma.passage.updateMany({
      where: { chapterId },
      data: { chapterId: null },
    });

    await prisma.chapter.delete({
      where: { id: chapterId },
    });

    await logAdminActivity({
      actorId: user.id,
      actorEmail: user.email || user.id,
      actorRole: user.role,
      action: "CHAPTER_DELETE",
      targetResource: "Chapter",
      targetId: chapterId,
      status: "SUCCESS",
      details: {
        bookId: existing.bookId,
        title: existing.title,
      },
    });

    return NextResponse.json({ message: "Chapter deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/chapters/[chapterId] error:", error);
    return NextResponse.json(
      { error: "Failed to delete chapter", details: error.message },
      { status: 500 }
    );
  }
}
