import { NextResponse } from "next/server.js";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import prisma from "../../../../../lib/prisma.js";
import { generateBookPdf } from "../../../../../server/pdf/generateBookPdf.js";
import { getGeneratedBookPdfUrl } from "../../../../../lib/bookPdfHelper.js";
import { getAuthenticatedUser, requireManagePermission } from "../../../../../server/security/authGuard.js";
import { canReviewBooks } from "../../../../../lib/permissions.js";
import { logAdminActivity } from "../../../../../server/admin/audit.js";

/**
 * GET /api/books/[id]/pdf
 * Securely streams the publication-grade or source PDF for the requested book.
 * Enforces publication check for public access.
 * Supports RFC 7233 HTTP Range requests (206 Partial Content) for efficient chunked streaming in PDF.js.
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const book = await prisma.book.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        originalFileUrl: true,
        originalFileName: true,
        pageCount: true,
        updatedAt: true,
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Access control: Unpublished books strictly require authenticated reviewer/manager
    if (book.status !== "PUBLISHED") {
      const user = await getAuthenticatedUser(request);
      if (!user) {
        return NextResponse.json(
          { error: "Unauthorized: Please log in to view this unpublished manuscript" },
          { status: 401 }
        );
      }
      if (!canReviewBooks(user)) {
        return NextResponse.json(
          { error: "Forbidden: Manuscript PDF is unpublished and restricted to reviewers" },
          { status: 403 }
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get("download") === "true";
    const isInfoRequest = searchParams.get("info") === "true" || searchParams.get("format") === "json";

    // Locate PDF file on disk
    let diskPath = null;
    let filename = `${book.slug || book.id}-digitized-edition.pdf`;

    // 1. Check generated digital book PDF
    const generatedPdfRelative = getGeneratedBookPdfUrl(book.id, book.slug);
    if (generatedPdfRelative) {
      const genDiskPath = path.join(process.cwd(), "public", generatedPdfRelative.replace(/^\//, ""));
      if (fs.existsSync(genDiskPath)) {
        diskPath = genDiskPath;
        filename = path.basename(genDiskPath);
      }
    }

    // 2. Check original source PDF
    if (!diskPath && book.originalFileUrl) {
      const origDiskPath = path.join(process.cwd(), "public", book.originalFileUrl.replace(/^\//, ""));
      if (fs.existsSync(origDiskPath)) {
        diskPath = origDiskPath;
        filename = book.originalFileName || `${book.slug || book.id}-source.pdf`;
      }
    }

    // 3. If neither exists, attempt on-the-fly generation
    if (!diskPath) {
      try {
        const generated = await generateBookPdf(book.id);
        if (generated?.absolutePath && fs.existsSync(generated.absolutePath)) {
          diskPath = generated.absolutePath;
        }
      } catch (genErr) {
        console.warn(`[GET /api/books/${book.id}/pdf] On-the-fly generation failed:`, genErr.message);
      }
    }

    if (!diskPath || !fs.existsSync(/*turbopackIgnore: true*/ diskPath)) {
      return NextResponse.json(
        {
          error: "Manuscript PDF file not found on storage. It may not have been uploaded or generated yet.",
          exists: false,
          bookId: book.id,
        },
        { status: 404 }
      );
    }

    const stat = fs.statSync(/*turbopackIgnore: true*/ diskPath);
    const fileSize = stat.size;

    // If caller explicitly asked for JSON metadata
    if (isInfoRequest) {
      return NextResponse.json({
        exists: true,
        bookId: book.id,
        title: book.title,
        slug: book.slug,
        size: fileSize,
        pageCount: book.pageCount,
        streamUrl: `/api/books/${book.id}/pdf`,
      });
    }

    // Parse HTTP Range header if present
    const rangeHeader = request.headers.get("range");
    if (rangeHeader && rangeHeader.startsWith("bytes=")) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (isNaN(start) || start >= fileSize || end >= fileSize || start > end) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            "Content-Range": `bytes */${fileSize}`,
          },
        });
      }

      const chunkSize = end - start + 1;
      const nodeStream = fs.createReadStream(/*turbopackIgnore: true*/ diskPath, { start, end });
      const webStream = Readable.toWeb(nodeStream);

      return new Response(webStream, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": String(chunkSize),
          "Content-Type": "application/pdf",
          "Content-Disposition": `${isDownload ? "attachment" : "inline"}; filename="${encodeURIComponent(filename)}"`,
          "Cache-Control": book.status === "PUBLISHED" ? "public, max-age=3600" : "private, no-cache",
        },
      });
    }

    // Stream entire file
    const nodeStream = fs.createReadStream(/*turbopackIgnore: true*/ diskPath);
    const webStream = Readable.toWeb(nodeStream);

    return new Response(webStream, {
      status: 200,
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Length": String(fileSize),
        "Content-Type": "application/pdf",
        "Content-Disposition": `${isDownload ? "attachment" : "inline"}; filename="${encodeURIComponent(filename)}"`,
        "Cache-Control": book.status === "PUBLISHED" ? "public, max-age=3600" : "private, no-cache",
      },
    });
  } catch (error) {
    console.error("GET /api/books/[id]/pdf error:", error);
    return NextResponse.json({ error: "Failed to fetch book PDF details" }, { status: 500 });
  }
}

/**
 * POST /api/books/[id]/pdf
 * Generates or re-generates the publication-grade digital book PDF from OCR content.
 * Requires book management permission.
 */
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const auth = await requireManagePermission(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;

    const book = await prisma.book.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const result = await generateBookPdf(id);

    await logAdminActivity({
      actorId: user.id,
      actorEmail: user.email || user.id,
      actorRole: user.role,
      action: "BOOK_PDF_GENERATE",
      targetResource: "Book",
      targetId: id,
      status: "SUCCESS",
      details: {
        totalPages: result.totalPages,
        fileSize: result.fileSize,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Digital book PDF successfully generated for "${book.title}"`,
      pdfUrl: result.pdfUrl,
      totalPages: result.totalPages,
      fileSize: result.fileSize,
    });
  } catch (error) {
    console.error("POST /api/books/[id]/pdf error:", error);
    return NextResponse.json(
      { error: "Failed to generate book PDF", details: error.message },
      { status: 500 }
    );
  }
}
