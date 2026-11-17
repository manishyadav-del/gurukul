import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { canReviewBooks, canManageBooks } from "@/lib/permissions";

// GET /api/admin/manuscript/[id]/structure
// Returns hierarchical manuscript sections (Grantha -> Kanda -> Adhyaya -> Prakarana -> Shloka)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user || (!canReviewBooks(user) && !canManageBooks(user))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const book = await prisma.book.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true, title: true, tradition: true },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const sections = await prisma.chapter.findMany({
      where: { bookId: book.id },
      orderBy: [{ sortOrder: "asc" }, { sequenceNumber: "asc" }, { chapterNumber: "asc" }],
      select: {
        id: true,
        bookId: true,
        parentId: true,
        structuralType: true,
        title: true,
        sanskritTitle: true,
        hindiTitle: true,
        englishTitle: true,
        sequenceNumber: true,
        chapterNumber: true,
        slug: true,
        startPage: true,
        endPage: true,
        sortOrder: true,
        description: true,
        status: true,
        isPublished: true,
        _count: {
          select: {
            passages: true,
            scholarlyExplanations: true,
          },
        },
      },
    });

    // Build nested tree structure
    const sectionMap = {};
    const rootSections = [];

    sections.forEach((sec) => {
      sectionMap[sec.id] = { ...sec, children: [] };
    });

    sections.forEach((sec) => {
      if (sec.parentId && sectionMap[sec.parentId]) {
        sectionMap[sec.parentId].children.push(sectionMap[sec.id]);
      } else {
        rootSections.push(sectionMap[sec.id]);
      }
    });

    return NextResponse.json({
      book,
      totalSections: sections.length,
      tree: rootSections,
      flat: sections,
    });
  } catch (err) {
    console.error("GET /api/admin/manuscript/[id]/structure error:", err);
    return NextResponse.json({ error: err.message || "Failed to load manuscript structure" }, { status: 500 });
  }
}

// POST /api/admin/manuscript/[id]/structure
// Create a new hierarchical manuscript section (e.g. Kanda, Adhyaya, Prakarana)
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user || (!canManageBooks(user) && !canReviewBooks(user))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const book = await prisma.book.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      parentId = null,
      structuralType = "ADHYAYA", // GRANTHA, KANDA, BHAGA, ADHYAYA, PRAKARANA, SECTION, SHLOKA_GROUP
      title,
      sanskritTitle = null,
      hindiTitle = null,
      englishTitle = null,
      sequenceNumber = 1,
      startPage = null,
      endPage = null,
      description = null,
      isPublished = true,
    } = body || {};

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Generate unique slug
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    let slug = baseSlug || `section-${Date.now()}`;

    const existingSlug = await prisma.chapter.findUnique({
      where: { bookId_slug: { bookId: book.id, slug } },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const nextSortOrder = (await prisma.chapter.count({ where: { bookId: book.id } })) + 1;

    const newSection = await prisma.chapter.create({
      data: {
        bookId: book.id,
        parentId: parentId || null,
        structuralType,
        title: title.trim(),
        sanskritTitle: (sanskritTitle || "").trim() || null,
        hindiTitle: (hindiTitle || "").trim() || null,
        englishTitle: (englishTitle || "").trim() || null,
        sequenceNumber: Number(sequenceNumber) || 1,
        chapterNumber: nextSortOrder,
        sortOrder: nextSortOrder,
        slug,
        startPage: startPage ? Number(startPage) : null,
        endPage: endPage ? Number(endPage) : null,
        description: description || null,
        isPublished: isPublished !== false,
        status: isPublished ? "APPROVED" : "DRAFT",
      },
    });

    return NextResponse.json({
      success: true,
      section: newSection,
    });
  } catch (err) {
    console.error("POST /api/admin/manuscript/[id]/structure error:", err);
    return NextResponse.json({ error: err.message || "Failed to create manuscript section" }, { status: 500 });
  }
}

// PUT /api/admin/manuscript/[id]/structure
// Update existing hierarchical section
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user || (!canManageBooks(user) && !canReviewBooks(user))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { sectionId, ...updateFields } = body || {};

    if (!sectionId) {
      return NextResponse.json({ error: "sectionId is required" }, { status: 400 });
    }

    const updated = await prisma.chapter.update({
      where: { id: sectionId },
      data: {
        ...(updateFields.title && { title: updateFields.title.trim() }),
        ...(updateFields.sanskritTitle !== undefined && { sanskritTitle: updateFields.sanskritTitle }),
        ...(updateFields.hindiTitle !== undefined && { hindiTitle: updateFields.hindiTitle }),
        ...(updateFields.englishTitle !== undefined && { englishTitle: updateFields.englishTitle }),
        ...(updateFields.structuralType && { structuralType: updateFields.structuralType }),
        ...(updateFields.parentId !== undefined && { parentId: updateFields.parentId || null }),
        ...(updateFields.sequenceNumber !== undefined && { sequenceNumber: Number(updateFields.sequenceNumber) }),
        ...(updateFields.startPage !== undefined && { startPage: updateFields.startPage ? Number(updateFields.startPage) : null }),
        ...(updateFields.endPage !== undefined && { endPage: updateFields.endPage ? Number(updateFields.endPage) : null }),
        ...(updateFields.isPublished !== undefined && { isPublished: Boolean(updateFields.isPublished) }),
        ...(updateFields.description !== undefined && { description: updateFields.description }),
      },
    });

    return NextResponse.json({ success: true, section: updated });
  } catch (err) {
    console.error("PUT /api/admin/manuscript/[id]/structure error:", err);
    return NextResponse.json({ error: err.message || "Failed to update manuscript section" }, { status: 500 });
  }
}

// DELETE /api/admin/manuscript/[id]/structure
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user || (!canManageBooks(user) && !canReviewBooks(user))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get("sectionId");

    if (!sectionId) {
      return NextResponse.json({ error: "sectionId query parameter is required" }, { status: 400 });
    }

    await prisma.chapter.delete({
      where: { id: sectionId },
    });

    return NextResponse.json({ success: true, deletedId: sectionId });
  } catch (err) {
    console.error("DELETE /api/admin/manuscript/[id]/structure error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete section" }, { status: 500 });
  }
}
