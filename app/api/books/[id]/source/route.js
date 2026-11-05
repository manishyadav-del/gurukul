import { NextResponse } from "next/server.js";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import prisma from "@/lib/prisma.js";
import { getStorageRoot, getPrivateStorageRoot } from "@/server/storage/paths.js";
import { requireReviewPermission } from "@/server/security/authGuard.js";

function resolveDiskPath(relativePath) {
  if (!relativePath) return null;
  const cleaned = relativePath.replace(/^\/+/, "");
  const candidates = [
    path.resolve(/*turbopackIgnore: true*/ getPrivateStorageRoot(), cleaned),
    path.resolve(/*turbopackIgnore: true*/ getStorageRoot(), cleaned),
    path.resolve(/*turbopackIgnore: true*/ process.cwd(), "public", cleaned),
    path.resolve(/*turbopackIgnore: true*/ process.cwd(), cleaned),
  ];
  for (const cand of candidates) {
    try {
      if (fs.existsSync(/*turbopackIgnore: true*/ cand) && fs.statSync(/*turbopackIgnore: true*/ cand).isFile()) {
        return cand;
      }
    } catch {
      // ignore access error and continue
    }
  }
  return null;
}

/**
 * GET /api/books/[id]/source
 * Securely streams the original source manuscript PDF.
 * Strictly requires review or manage permission (Admin / Editor / Proofreader / Reviewer).
 * Supports RFC 7233 byte-range streaming for memory-efficient PDF chunking.
 */
export async function GET(request, { params }) {
  try {
    const auth = await requireReviewPermission(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const { id } = await params;
    const book = await prisma.book.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        originalFileUrl: true,
        originalFileName: true,
      },
    });

    if (!book || !book.originalFileUrl) {
      return NextResponse.json(
        { error: "Original source PDF not found for this book" },
        { status: 404 }
      );
    }

    const diskPath = resolveDiskPath(book.originalFileUrl);
    if (!diskPath) {
      return NextResponse.json(
        { error: "Source file not present on storage" },
        { status: 404 }
      );
    }

    const stat = fs.statSync(/*turbopackIgnore: true*/ diskPath);
    const fileSize = stat.size;
    const fileName = book.originalFileName || `${book.slug || book.id}-source.pdf`;

    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get("download") === "true";

    // Support RFC 7233 HTTP Range requests (206 Partial Content)
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
          "Content-Disposition": `${isDownload ? "attachment" : "inline"}; filename="${encodeURIComponent(fileName)}"`,
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
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
        "Content-Disposition": `${isDownload ? "attachment" : "inline"}; filename="${encodeURIComponent(fileName)}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("GET /api/books/[id]/source error:", error);
    return NextResponse.json(
      { error: "Failed to download source PDF", details: error.message },
      { status: 500 }
    );
  }
}
