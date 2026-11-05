import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/server/admin/auth";
import { PERMISSIONS } from "@/server/admin/permissions";
import { logAdminActivity } from "@/server/admin/audit";
import { runEmbeddingBatchJob } from "@/server/ai/embeddingJob";

// GET /api/admin/research
export async function GET(request) {
  const auth = await requireAdmin(request, PERMISSIONS.BOOKS_READ);
  if (!auth.authorized) return auth.response;

  try {
    const [
      totalBooks,
      publishedBooks,
      totalPassages,
      totalEmbeddings,
      lowConfidencePassages,
      recentEmbeddingJobs,
      totalResearchItems,
      sampleLowConfidence,
    ] = await Promise.all([
      prisma.book.count(),
      prisma.book.count({ where: { status: "PUBLISHED" } }),
      prisma.passage.count(),
      prisma.passageEmbedding.count({ where: { status: "COMPLETED" } }),
      prisma.passage.count({
        where: {
          ocrConfidence: { lt: 0.65 },
        },
      }),
      prisma.embeddingBatchJob.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.researchItem.count(),
      prisma.passage.findMany({
        where: {
          ocrConfidence: { lt: 0.65 },
        },
        take: 10,
        select: {
          id: true,
          text: true,
          ocrConfidence: true,
          sourcePage: true,
          status: true,
          needsReview: true,
          book: { select: { id: true, title: true, status: true } },
          chapter: { select: { id: true, title: true } },
        },
        orderBy: { ocrConfidence: "asc" },
      }),
    ]);

    return NextResponse.json({
      metrics: {
        totalBooks,
        publishedBooks,
        totalPassages,
        totalEmbeddings,
        pendingEmbeddings: Math.max(0, totalPassages - totalEmbeddings),
        lowConfidencePassages,
        totalResearchItems,
      },
      recentEmbeddingJobs,
      sampleLowConfidence,
    });
  } catch (error) {
    console.error("GET /api/admin/research error:", error);
    return NextResponse.json(
      { error: "Failed to load admin research metrics", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/research
export async function POST(request) {
  const auth = await requireAdmin(request, PERMISSIONS.BOOKS_WRITE);
  if (!auth.authorized) return auth.response;
  const user = auth.admin.user;

  try {
    const body = await request.json();
    const action = body.action;

    if (action === "reprocess_embeddings") {
      const { batchSize = 50, maxPassages = 500, force = false, bookId = null } = body;
      const jobResult = await runEmbeddingBatchJob({ batchSize, maxPassages, force, bookId });

      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: "REPROCESS_EMBEDDINGS",
        targetResource: "PassageEmbedding",
        targetId: jobResult.jobId || "batch",
        status: "SUCCESS",
        details: { batchSize, maxPassages, force, bookId, processed: jobResult.processedCount },
      });

      return NextResponse.json({ success: true, job: jobResult });
    }

    if (action === "verify_passage") {
      const { passageId, proofreadText } = body;
      if (!passageId) {
        return NextResponse.json({ error: "Missing passageId" }, { status: 400 });
      }

      const updated = await prisma.passage.update({
        where: { id: passageId },
        data: {
          proofreadText: proofreadText || undefined,
          status: "APPROVED",
          needsReview: false,
          ocrConfidence: 1.0,
        },
      });

      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: "VERIFY_PASSAGE_SCHOLARLY",
        targetResource: "Passage",
        targetId: passageId,
        status: "SUCCESS",
        details: { passageId },
      });

      return NextResponse.json({ success: true, passage: updated });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error("POST /api/admin/research error:", error);
    return NextResponse.json(
      { error: "Admin research action failed", details: error.message },
      { status: 500 }
    );
  }
}
