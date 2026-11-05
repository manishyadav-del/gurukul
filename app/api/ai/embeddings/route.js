import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { runEmbeddingBatchJob } from "@/server/ai/embeddingJob";
import { requireRole } from "@/server/security/authGuard";

// GET /api/ai/embeddings - Check embedding status and count
export async function GET(request) {
  try {
    const auth = await requireRole(request, ["ADMIN", "EDITOR", "OCR_MANAGER"]);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const totalPassages = await prisma.passage.count({
      where: {
        book: { status: { in: ["PUBLISHED", "APPROVED", "PROOFREAD"] } },
      },
    });

    const embeddedCount = await prisma.passageEmbedding.count({
      where: { status: "COMPLETED" },
    });

    const failedCount = await prisma.passageEmbedding.count({
      where: { status: "FAILED" },
    });

    const recentJobs = await prisma.embeddingBatchJob.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      totalApprovedPassages: totalPassages,
      embeddedPassages: embeddedCount,
      failedPassages: failedCount,
      coveragePercent: totalPassages > 0 ? parseFloat(((embeddedCount / totalPassages) * 100).toFixed(2)) : 0,
      recentJobs,
    });
  } catch (error) {
    console.error("GET /api/ai/embeddings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch embeddings status" },
      { status: 500 }
    );
  }
}

// POST /api/ai/embeddings - Trigger incremental batch embedding job
export async function POST(request) {
  try {
    const auth = await requireRole(request, ["ADMIN"]);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const body = await request.json().catch(() => ({}));

    const batchSize = parseInt(body.batchSize || "50", 10);
    const maxPassages = parseInt(body.maxPassages || "200", 10);
    const force = Boolean(body.force);
    const bookId = body.bookId || null;

    const summary = await runEmbeddingBatchJob({
      batchSize,
      maxPassages,
      force,
      bookId,
    });

    return NextResponse.json({
      success: true,
      job: summary,
    });
  } catch (error) {
    console.error("POST /api/ai/embeddings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to run embedding batch job" },
      { status: 500 }
    );
  }
}
