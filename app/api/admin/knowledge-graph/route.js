import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/server/admin/auth";
import { PERMISSIONS } from "@/server/admin/permissions";
import { logAdminActivity } from "@/server/admin/audit";
import {
  adminUpsertConcept,
  adminUpdateRelationshipStatus,
  adminApproveRelationship,
  adminRejectRelationship,
  adminMergeConcepts,
  adminGetPendingReviewRelationships,
  adminGetExtractionJobs,
  adminReprocessExtraction,
  extractAndStorePassageKnowledge,
  seedClassicalKnowledgeGraph,
} from "@/server/knowledge/knowledgeGraph";

// GET /api/admin/knowledge-graph
export async function GET(request) {
  const auth = await requireAdmin(request, PERMISSIONS.BOOKS_READ);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view"); // "pending", "jobs", "overview"

    if (view === "pending") {
      const page = parseInt(searchParams.get("page") || "1", 10);
      const pendingData = await adminGetPendingReviewRelationships({ page, limit: 20 });
      return NextResponse.json(pendingData);
    }

    if (view === "jobs") {
      const page = parseInt(searchParams.get("page") || "1", 10);
      const status = searchParams.get("status") || null;
      const jobsData = await adminGetExtractionJobs({ page, limit: 20, status });
      return NextResponse.json(jobsData);
    }

    const [
      totalConcepts,
      totalRelationships,
      approvedRelationships,
      pendingReviewRelationshipsCount,
      totalExtractionJobs,
      categoryCounts,
      recentRelationships,
      pendingRelationshipsSample,
      recentJobs,
    ] = await Promise.all([
      prisma.knowledgeConcept.count(),
      prisma.knowledgeRelationship.count(),
      prisma.knowledgeRelationship.count({ where: { status: "APPROVED" } }),
      prisma.knowledgeRelationship.count({ where: { status: { in: ["AI_DISCOVERED", "NEEDS_REVIEW"] } } }),
      prisma.knowledgeExtractionJob.count(),
      prisma.knowledgeConcept.groupBy({
        by: ["category"],
        _count: true,
      }),
      prisma.knowledgeRelationship.findMany({
        take: 15,
        orderBy: { updatedAt: "desc" },
        include: {
          sourceConcept: { select: { id: true, name: true, slug: true, category: true, color: true } },
          targetConcept: { select: { id: true, name: true, slug: true, category: true, color: true } },
        },
      }),
      prisma.knowledgeRelationship.findMany({
        where: { status: { in: ["AI_DISCOVERED", "NEEDS_REVIEW"] } },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          sourceConcept: { select: { id: true, name: true, slug: true, category: true, color: true } },
          targetConcept: { select: { id: true, name: true, slug: true, category: true, color: true } },
          sourceBook: { select: { id: true, title: true, slug: true } },
          sourcePassage: { select: { id: true, text: true, sourcePage: true } },
        },
      }),
      prisma.knowledgeExtractionJob.findMany({
        take: 10,
        orderBy: { startedAt: "desc" },
        include: {
          book: { select: { id: true, title: true, slug: true } },
        },
      }),
    ]);

    return NextResponse.json({
      metrics: {
        totalConcepts,
        totalRelationships,
        approvedRelationships,
        pendingReviewRelationships: pendingReviewRelationshipsCount,
        totalExtractionJobs,
        categoryCounts,
      },
      recentRelationships,
      pendingRelationships: pendingRelationshipsSample,
      recentJobs,
    });
  } catch (error) {
    console.error("GET /api/admin/knowledge-graph error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve knowledge graph metrics", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/knowledge-graph
export async function POST(request) {
  const auth = await requireAdmin(request, PERMISSIONS.BOOKS_WRITE);
  if (!auth.authorized) return auth.response;
  const user = auth.admin.user;

  try {
    const body = await request.json();
    const action = body.action;

    if (action === "seed_graph") {
      const result = await seedClassicalKnowledgeGraph();
      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: "SEED_KNOWLEDGE_GRAPH",
        targetResource: "KnowledgeGraph",
        targetId: "canonical",
        status: "SUCCESS",
        details: result,
      });
      return NextResponse.json({ success: true, result });
    }

    if (action === "upsert_concept") {
      const concept = await adminUpsertConcept(body.concept);
      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: "UPSERT_KNOWLEDGE_CONCEPT",
        targetResource: "KnowledgeConcept",
        targetId: concept.id,
        status: "SUCCESS",
        details: { slug: concept.slug, name: concept.name },
      });
      return NextResponse.json({ success: true, concept });
    }

    if (action === "approve_relationship") {
      const { relationshipId, reviewerNotes } = body;
      const updated = await adminApproveRelationship({
        relationshipId,
        reviewer: user.email || user.name || "Admin",
        reviewerNotes,
      });

      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: "APPROVE_KNOWLEDGE_RELATIONSHIP",
        targetResource: "KnowledgeRelationship",
        targetId: relationshipId,
        status: "SUCCESS",
        details: { status: "APPROVED", reviewerNotes },
      });

      return NextResponse.json({ success: true, relationship: updated });
    }

    if (action === "reject_relationship") {
      const { relationshipId, reason, reviewerNotes } = body;
      const updated = await adminRejectRelationship({
        relationshipId,
        reviewer: user.email || user.name || "Admin",
        reason,
        reviewerNotes,
      });

      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: "REJECT_KNOWLEDGE_RELATIONSHIP",
        targetResource: "KnowledgeRelationship",
        targetId: relationshipId,
        status: "SUCCESS",
        details: { status: "REJECTED", reason, reviewerNotes },
      });

      return NextResponse.json({ success: true, relationship: updated });
    }

    if (action === "update_relationship_status") {
      const { relationshipId, status } = body;
      const updated = await adminUpdateRelationshipStatus({
        relationshipId,
        status,
        reviewer: user.email || user.name || "Admin",
      });

      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: "UPDATE_RELATIONSHIP_STATUS",
        targetResource: "KnowledgeRelationship",
        targetId: relationshipId,
        status: "SUCCESS",
        details: { newStatus: status },
      });

      return NextResponse.json({ success: true, relationship: updated });
    }

    if (action === "merge_concepts") {
      const { primarySlug, secondarySlug } = body;
      const mergeResult = await adminMergeConcepts({
        primarySlug,
        secondarySlug,
        reviewer: user.email || user.name || "Admin",
      });

      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: "MERGE_KNOWLEDGE_CONCEPTS",
        targetResource: "KnowledgeConcept",
        targetId: primarySlug,
        status: "SUCCESS",
        details: mergeResult,
      });

      return NextResponse.json({ success: true, mergeResult });
    }

    if (action === "extract_knowledge") {
      const { passageId, text, bookId, method, autoApprove } = body;
      const extraction = await extractAndStorePassageKnowledge({
        passageId,
        text,
        bookId,
        method: method || "RULE_BASED_NLP",
        autoApprove: Boolean(autoApprove),
        reviewer: user.email || user.name || "Admin",
      });

      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: "RUN_KNOWLEDGE_EXTRACTION",
        targetResource: "KnowledgeExtractionJob",
        targetId: extraction.jobId,
        status: "SUCCESS",
        details: { entitiesFound: extraction.entitiesFound, relationsFound: extraction.relationsFound },
      });

      return NextResponse.json({ success: true, extraction });
    }

    if (action === "reprocess_extraction") {
      const { jobId } = body;
      const reprocessResult = await adminReprocessExtraction(jobId);

      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: "REPROCESS_EXTRACTION_JOB",
        targetResource: "KnowledgeExtractionJob",
        targetId: jobId,
        status: "SUCCESS",
        details: reprocessResult,
      });

      return NextResponse.json({ success: true, reprocessResult });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error("POST /api/admin/knowledge-graph error:", error);
    return NextResponse.json(
      { error: "Admin knowledge graph action failed", details: error.message },
      { status: 500 }
    );
  }
}
