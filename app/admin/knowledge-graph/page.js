import { Suspense } from "react";
import prisma from "@/lib/prisma";
import KnowledgeGraphAdminStudio from "@/components/admin/KnowledgeGraphAdminStudio";
import { getAuthenticatedAdmin } from "@/server/admin/auth";
import { PERMISSIONS } from "@/server/admin/permissions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Knowledge Graph Administration | Gurukul Astrology",
  description: "Knowledge graph ontology, classical entity verification, AI review queue, and extraction jobs.",
};

export default async function AdminKnowledgeGraphPage() {
  // Fetch initial summary metrics directly from PostgreSQL
  const [
    totalConcepts,
    totalRelationships,
    approvedRelationships,
    pendingReviewRelationships,
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

  const initialData = {
    metrics: {
      totalConcepts,
      totalRelationships,
      approvedRelationships,
      pendingReviewRelationships,
      totalExtractionJobs,
      categoryCounts,
    },
    recentRelationships,
    pendingRelationships: pendingRelationshipsSample,
    recentJobs,
  };

  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-stone-500 text-sm">
          Loading Knowledge Graph Administration Studio...
        </div>
      }
    >
      <KnowledgeGraphAdminStudio initialData={initialData} />
    </Suspense>
  );
}
