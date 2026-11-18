import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import path from "path";
import { createBookSchema } from "@/lib/validation";
import { registerBook } from "@/server/ingest/registerBook";
import { uploadFile } from "@/server/storage/upload";
import { getOriginalPdfPath } from "@/server/storage/paths";
import {
  getAuthenticatedUser,
  requireManagePermission,
  secureBookWhereClause,
} from "@/server/security/authGuard";
import { enqueueBookJob } from "@/server/jobs/queue";
import { logAdminActivity } from "@/server/admin/audit";
import { apiError } from "@/server/security/apiResponse";
import { applyRateLimit, RATE_LIMIT_TIERS } from "@/server/security/rateLimiter";

// Maximum upload size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// GET /api/books?page=1&limit=20&status=...
export async function GET(request) {
  try {
    const user = await getAuthenticatedUser(request);
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;
    const status = searchParams.get("status");

    let baseWhere = {};
    if (status) {
      baseWhere.status = status;
    }

    // Public users can strictly only view PUBLISHED books
    const where = secureBookWhereClause(baseWhere, user);

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: {
          _count: {
            select: {
              chapters: true,
              passages: true,
              pages: true,
              ingestJobs: true,
              ocrErrors: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.book.count({ where }),
    ]);

    // Protect private internal storage paths from unprivileged users
    const { canReviewBooks } = await import("@/lib/permissions.js");
    const sanitizedBooks = books.map((b) => {
      if (!user || !canReviewBooks(user)) {
        const { originalFileUrl, sourcePdf, ...rest } = b;
        return rest;
      }
      return b;
    });

    return NextResponse.json({
      books: sanitizedBooks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return apiError(error, 500, "BOOKS_FETCH_FAILED", request);
  }
}

// POST /api/books (Upload PDF + Create Book Metadata)
export async function POST(request) {
  const rateLimitResponse = applyRateLimit(request, RATE_LIMIT_TIERS.MUTATION);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const auth = await requireManagePermission(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;

    const contentType = request.headers.get("content-type") || "";

    // 1. Multipart Form Data (PDF file upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      const title = formData.get("title");
      const author = formData.get("author") || null;
      const publisher = formData.get("publisher") || null;
      const edition = formData.get("edition") || null;
      const isbn = formData.get("isbn") || null;
      const description = formData.get("description") || null;
      const tradition = formData.get("tradition") || formData.get("category") || null;
      const publicationYear = formData.get("publicationYear") ? parseInt(formData.get("publicationYear"), 10) : null;
      const language = formData.get("language") || "Hindi";
      const script = formData.get("script") || (language === "English" ? "Latin" : "Devanagari");
      let coverImageUrl = formData.get("coverImageUrl") || null;
      const coverFile = formData.get("coverImage") || formData.get("cover");

      if (!file || typeof file === "string") {
        return NextResponse.json({ error: "PDF file is required in 'file' field" }, { status: 400 });
      }

      // Security validations
      const originalFileName = path.basename(file.name || "book.pdf");
      const ext = path.extname(originalFileName).toLowerCase();

      if (ext !== ".pdf") {
        return NextResponse.json(
          { error: "Invalid file type. Only PDF files (.pdf) are allowed." },
          { status: 400 }
        );
      }

      if (file.type && file.type !== "application/pdf" && file.type !== "application/x-pdf") {
        return NextResponse.json(
          { error: "Invalid MIME type. Expected application/pdf" },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File size exceeds the 100MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB)` },
          { status: 400 }
        );
      }

      const fileBuffer = Buffer.from(await file.arrayBuffer());

      // Validate PDF signature magic bytes (%PDF-)
      if (fileBuffer.length < 5 || fileBuffer.toString("utf8", 0, 5) !== "%PDF-") {
        return NextResponse.json(
          { error: "Malformed PDF. Missing standard %PDF- file header signature." },
          { status: 400 }
        );
      }

      // Compute SHA-256 hash for duplicate manuscript detection
      const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
      const duplicateBook = await prisma.book.findFirst({
        where: { fileHash },
        select: { id: true, title: true, slug: true, status: true },
      });

      if (duplicateBook && !formData.get("allowDuplicate")) {
        return NextResponse.json(
          {
            error: `Duplicate file detected. Matches existing book "${duplicateBook.title}" (${duplicateBook.slug}).`,
            isDuplicate: true,
            existingBookId: duplicateBook.id,
            existingBookTitle: duplicateBook.title,
          },
          { status: 409 }
        );
      }

      // Register book in database first to get unique bookId and slug
      let newBook = null;
      let originalStoragePath = null;
      try {
        newBook = await registerBook({
          title: title || originalFileName.replace(/\.pdf$/i, ""),
          author,
          publisher,
          edition,
          isbn,
          description,
          tradition,
          publicationYear,
          language,
          script,
          originalFileName,
          fileHash,
        });

        // Save PDF into storage under books/{bookId}/original/{filename}
        originalStoragePath = getOriginalPdfPath(newBook.id, originalFileName);
        await uploadFile(originalStoragePath, fileBuffer, {
          contentType: "application/pdf",
          isPrivate: true,
        });

        // Handle cover image upload if present
        let resolvedCoverUrl = coverImageUrl;
        if (coverFile && typeof coverFile !== "string" && coverFile.size > 0) {
          const coverExt = path.extname(coverFile.name || "cover.jpg").toLowerCase();
          if ([".jpg", ".jpeg", ".png", ".webp"].includes(coverExt)) {
            const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
            const coverPath = `books/${newBook.id}/cover${coverExt}`;
            await uploadFile(coverPath, coverBuffer, {
              contentType: coverFile.type || "image/jpeg",
              isPrivate: false,
            });
            resolvedCoverUrl = `/uploads/${coverPath}`;
          }
        }

        // Update book with storage relative path
        await prisma.book.update({
          where: { id: newBook.id },
          data: {
            originalFileUrl: originalStoragePath,
            sourcePdf: originalStoragePath,
            ...(resolvedCoverUrl && { coverImageUrl: resolvedCoverUrl, coverUrl: resolvedCoverUrl }),
          },
        });
      } catch (uploadErr) {
        // Clean up partial records and orphaned files if storage/registration fails
        if (newBook?.id) {
          try {
            await prisma.book.delete({ where: { id: newBook.id } });
          } catch {}
        }
        if (originalStoragePath) {
          try {
            const { deleteFile } = await import("@/server/storage/delete.js");
            await deleteFile(originalStoragePath);
          } catch {}
        }
        throw uploadErr;
      }

      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email || user.id,
        actorRole: user.role,
        action: "BOOK_UPLOAD",
        targetResource: "Book",
        targetId: newBook.id,
        status: "SUCCESS",
        details: {
          fileName: originalFileName,
          fileSize: file.size,
          fileHash,
        },
      });

      // Support synchronous Phase 1 extraction if explicitly requested in dev/test (forbidden in production)
      const url = new URL(request.url);
      const isSyncRequested = url.searchParams.get("sync") === "true";

      if (isSyncRequested) {
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { error: "Synchronous PDF processing is disabled in production. Use background queue." },
            { status: 400 }
          );
        }
        const { processPhase1Book } = await import("@/server/ingest/processPhase1.js");
        const phase1Result = await processPhase1Book(newBook.id, fileBuffer);
        const finalBook = await prisma.book.findUnique({
          where: { id: newBook.id },
          include: {
            _count: {
              select: { pages: true, ocrErrors: true },
            },
          },
        });
        return NextResponse.json(
          { ...finalBook, analysis: phase1Result.summary },
          { status: 201 }
        );
      }

      // By default: ENQUEUE into reliable background queue
      const queueResult = await enqueueBookJob(newBook.id, {
        priority: 1,
        dpi: 300,
      });

      return NextResponse.json(
        {
          ...newBook,
          fileHash,
          jobId: queueResult.job?.id,
          status: "QUEUED",
          statusUrl: `/api/ingest/${queueResult.job?.id}`,
          message: "PDF uploaded successfully. Background OCR and ingestion enqueued.",
        },
        { status: 201 }
      );
    }

    // 2. JSON Body (Metadata creation)
    const body = await request.json();
    const validatedData = createBookSchema.parse(body);

    const newBook = await registerBook(validatedData);

    await logAdminActivity({
      actorId: user.id,
      actorEmail: user.email || user.id,
      actorRole: user.role,
      action: "BOOK_METADATA_CREATE",
      targetResource: "Book",
      targetId: newBook.id,
      status: "SUCCESS",
      details: { title: newBook.title },
    });

    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 422 }
      );
    }
    return apiError(error, 500, "BOOK_CREATE_FAILED", request);
  }
}
