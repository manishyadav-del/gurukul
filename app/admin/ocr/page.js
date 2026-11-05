import prisma from "@/lib/prisma";
import OcrManagementClient from "@/components/admin/OcrManagementClient";
import { getQueueMetrics } from "@/server/jobs/queue";

export const dynamic = "force-dynamic";

export default async function AdminOcrPage() {
  const queueMetrics = await getQueueMetrics();

  const [
    totalPages,
    extractedPages,
    ocrCompletedPages,
    proofreadPages,
    lowConfidencePages,
    unresolvedErrorsCount,
    avgDurationResult,
    recentJobs,
    flaggedPages,
  ] = await Promise.all([
    prisma.bookPage.count(),
    prisma.bookPage.count({ where: { processingMethod: "TEXT_EXTRACTION", ocrCompleted: true } }),
    prisma.bookPage.count({ where: { processingMethod: "OCR", ocrCompleted: true } }),
    prisma.bookPage.count({ where: { proofread: true } }),
    // Fixed: ocrConfidence is on 0.00 - 1.00 float scale
    prisma.bookPage.count({ where: { ocrConfidence: { lt: 0.75, not: null } } }),
    prisma.ocrError.count({ where: { resolved: false } }),
    prisma.bookPage.aggregate({
      _avg: { processingDurationMs: true },
      where: { processingDurationMs: { gt: 0 } },
    }),
    prisma.ingestJob.findMany({
      take: 20,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: {
        book: {
          select: { id: true, title: true, slug: true, language: true },
        },
      },
    }),
    prisma.bookPage.findMany({
      where: {
        OR: [
          { ocrCompleted: false },
          { ocrConfidence: { lt: 0.75 } },
          { ocrErrors: { some: { resolved: false } } },
        ],
      },
      take: 30,
      orderBy: [{ retryCount: "desc" }, { updatedAt: "desc" }],
      include: {
        book: {
          select: { id: true, title: true, slug: true, language: true },
        },
        ocrErrors: {
          where: { resolved: false },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    }),
  ]);

  const avgPageDurationMs = Math.round(avgDurationResult._avg.processingDurationMs || 0);

  const initialData = {
    stats: {
      totalPages,
      extractedPages,
      ocrCompletedPages,
      proofreadPages,
      pendingProofread: Math.max(0, totalPages - proofreadPages),
      lowConfidencePages,
      unresolvedErrorsCount,
      activeJobsCount: queueMetrics.activeCount,
      queuedJobsCount: queueMetrics.queuedCount,
      failedJobsCount: queueMetrics.failedCount,
      completedJobsCount: queueMetrics.completedCount,
      stalledJobsCount: queueMetrics.stalledCount,
      oldestQueuedAgeSec: queueMetrics.oldestQueuedAgeSec,
      activeWorkerCount: queueMetrics.activeWorkerCount,
      lastWorkerHeartbeat: queueMetrics.lastWorkerHeartbeat ? queueMetrics.lastWorkerHeartbeat.toISOString() : null,
      avgPageDurationMs,
      ocrSuccessRate: totalPages > 0
        ? Math.round(((totalPages - unresolvedErrorsCount) / totalPages) * 1000) / 10
        : 100,
    },
    jobs: recentJobs,
    flaggedPages,
  };

  return <OcrManagementClient initialData={initialData} />;
}
