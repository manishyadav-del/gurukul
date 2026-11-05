import { NextResponse } from "next/server";
import { evaluateBookQuality } from "@/server/ocr/qualityChecks";
import { requireReviewPermission, requirePublishPermission } from "@/server/security/authGuard";
import prisma from "@/lib/prisma";
import { logAdminActivity } from "@/server/admin/audit";

// GET /api/books/[id]/readiness
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const auth = await requireReviewPermission(request);
    if (auth.errorResponse) return auth.errorResponse;

    const report = await evaluateBookQuality(id);
    return NextResponse.json(report);
  } catch (error) {
    console.error("GET /api/books/[id]/readiness error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate publication readiness", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/books/[id]/readiness (Publish action gated by quality checklist and state machine)
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const auth = await requirePublishPermission(request);
    if (auth.errorResponse) return auth.errorResponse;
    const user = auth.user;

    const body = await request.json().catch(() => ({}));
    const override = Boolean(body.overrideWarnings);

    const { transitionBookStatus } = await import("@/server/books/lifecycle");
    const updatedBook = await transitionBookStatus(id, "PUBLISHED", {
      user,
      notes: body.notes,
      overrideWarnings: override,
    });

    return NextResponse.json({
      success: true,
      message: `Book "${updatedBook.title}" successfully published as Version ${updatedBook.publishedVersion}!`,
      book: updatedBook,
    });
  } catch (error) {
    console.error("POST /api/books/[id]/readiness error:", error);
    const status = error.statusCode || 500;
    return NextResponse.json(
      {
        error: error.message || "Failed to publish book",
        checklist: error.readinessReport?.checklist,
        readinessScore: error.readinessReport?.readinessScore,
      },
      { status }
    );
  }
}
