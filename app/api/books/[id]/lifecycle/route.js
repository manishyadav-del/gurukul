import { NextResponse } from "next/server";
import { transitionBookStatus } from "@/server/books/lifecycle";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import prisma from "@/lib/prisma";

/**
 * POST /api/books/[id]/lifecycle
 * Governed lifecycle state transition endpoint
 * Body: { targetStatus: "PENDING_APPROVAL"|"APPROVED"|"REJECTED"|"ARCHIVED"|"NEEDS_REVIEW"|"DRAFT", reason?: string, notes?: string, overrideWarnings?: boolean }
 */
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { targetStatus, reason, notes, overrideWarnings } = body;

    if (!targetStatus) {
      return NextResponse.json({ error: "targetStatus is required" }, { status: 400 });
    }

    const updatedBook = await transitionBookStatus(id, targetStatus, {
      user,
      reason,
      notes,
      overrideWarnings,
    });

    return NextResponse.json({
      success: true,
      message: `Book successfully transitioned to ${targetStatus}`,
      book: updatedBook,
    });
  } catch (error) {
    console.error("POST /api/books/[id]/lifecycle error:", error);
    const status = error.statusCode || 500;
    return NextResponse.json(
      {
        error: error.message || "Failed to transition book lifecycle status",
        checklist: error.readinessReport?.checklist,
        readinessScore: error.readinessReport?.readinessScore,
      },
      { status }
    );
  }
}

/**
 * GET /api/books/[id]/lifecycle
 * Returns current book lifecycle info, audit history, and permitted transitions
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const book = await prisma.book.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        status: true,
        processingStatus: true,
        publishedAt: true,
        publishedBy: true,
        publishedVersion: true,
        approvedAt: true,
        approvedBy: true,
        rejectionReason: true,
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const { ALLOWED_TRANSITIONS } = await import("@/server/books/lifecycle");
    const allowedNext = ALLOWED_TRANSITIONS[book.status] || [];

    // Fetch recent audit logs for this book
    const auditLogs = await prisma.adminAuditLog.findMany({
      where: {
        targetResource: "Book",
        targetId: id,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      book,
      allowedNextTransitions: allowedNext,
      auditHistory: auditLogs,
    });
  } catch (error) {
    console.error("GET /api/books/[id]/lifecycle error:", error);
    return NextResponse.json({ error: "Failed to fetch lifecycle details" }, { status: 500 });
  }
}
