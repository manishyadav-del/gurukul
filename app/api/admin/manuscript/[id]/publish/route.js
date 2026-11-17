import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { canManageBooks } from "@/lib/permissions";
import { compilePublicationPdf } from "@/server/manuscript/publicationEngine";
import { logAdminActivity } from "@/server/admin/audit";

// GET /api/admin/manuscript/[id]/publish
// Retrieve publication manifests & release history
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const book = await prisma.book.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true, title: true, publishedVersion: true, status: true },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const manifests = await prisma.publicationManifest.findMany({
      where: { bookId: book.id },
      orderBy: { version: "desc" },
    });

    return NextResponse.json({
      book,
      manifests,
    });
  } catch (err) {
    console.error("GET /api/admin/manuscript/[id]/publish error:", err);
    return NextResponse.json({ error: err.message || "Failed to load publication manifests" }, { status: 500 });
  }
}

// POST /api/admin/manuscript/[id]/publish
// Compiles a new publication artifact containing only approved & verified pages
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user || !canManageBooks(user)) {
      return NextResponse.json({ error: "Forbidden: Admin or Manager permission required to publish manuscripts" }, { status: 403 });
    }

    const book = await prisma.book.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true, title: true },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { approvedPages = null, notes = null } = body || {};

    const result = await compilePublicationPdf(book.id, approvedPages, {
      userId: user.id,
      userEmail: user.email,
      notes,
    });

    await logAdminActivity({
      userId: user.id,
      userEmail: user.email,
      action: "MANUSCRIPT_PUBLISHED",
      resourceType: "BOOK",
      resourceId: book.id,
      details: {
        version: result.version,
        pageCount: result.pageCount,
        fileHash: result.fileHash,
        pdfUrl: result.pdfUrl,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `Successfully compiled and published scholarly edition v${result.version} with ${result.pageCount} pages.`,
      result,
    });
  } catch (err) {
    console.error("POST /api/admin/manuscript/[id]/publish error:", err);
    return NextResponse.json({ error: err.message || "Failed to compile publication PDF" }, { status: 500 });
  }
}
