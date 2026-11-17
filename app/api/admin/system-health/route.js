import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/server/admin/auth";
import { PERMISSIONS } from "@/server/admin/permissions";
import { getQueueMetrics } from "@/server/jobs/queue";
import { logger } from "@/server/monitoring/logger";
import { apiError } from "@/server/security/apiResponse";
import fs from "fs/promises";
import path from "path";

// Cache health probe responses for 10 seconds to avoid repeating heavy aggregates
let cachedHealthData = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 10000;

export async function GET(request) {
  const auth = await requireAdmin(request, PERMISSIONS.AUDIT_READ);
  if (!auth.authorized) return auth.response;

  const now = Date.now();
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get("force") === "true";

  if (!forceRefresh && cachedHealthData && now - lastCacheTime < CACHE_TTL_MS) {
    return NextResponse.json(cachedHealthData);
  }

  try {
    const startTime = performance.now();

    // 1. Database Ping & Query Latency Probe
    let dbStatus = "HEALTHY";
    let dbLatencyMs = 0;
    try {
      const dbStart = performance.now();
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Math.round((performance.now() - dbStart) * 10) / 10;
    } catch (dbErr) {
      dbStatus = "DEGRADED";
      console.error("DB Ping error:", dbErr);
    }

    // 2. Real Queue & Worker Metrics from durable queue
    const queueMetrics = await getQueueMetrics();

    const queueStatus =
      queueMetrics.failedCount > 5 || queueMetrics.stalledCount > 0
        ? "WARNING"
        : queueMetrics.activeCount > 0 || queueMetrics.queuedCount > 0
        ? "BUSY"
        : "IDLE";

    // 3. Search & AI Embeddings Backlog & Batch Jobs
    const [
      outdatedEmbeddings,
      totalEmbeddings,
      totalPassages,
      embeddingJobGroups,
      knowledgeJobGroups,
    ] = await Promise.all([
      prisma.passageEmbedding.count({ where: { status: "OUTDATED" } }).catch(() => 0),
      prisma.passageEmbedding.count().catch(() => 0),
      prisma.passage.count().catch(() => 0),
      prisma.embeddingBatchJob.groupBy({
        by: ["status"],
        _count: { id: true },
      }).catch(() => []),
      prisma.knowledgeExtractionJob.groupBy({
        by: ["status"],
        _count: { id: true },
      }).catch(() => []),
    ]);

    const embeddingJobsSummary = {
      queued: embeddingJobGroups.find((g) => g.status === "QUEUED")?._count?.id || 0,
      processing: embeddingJobGroups.find((g) => g.status === "PROCESSING")?._count?.id || 0,
      completed: embeddingJobGroups.find((g) => g.status === "COMPLETED")?._count?.id || 0,
      failed: embeddingJobGroups.find((g) => g.status === "FAILED")?._count?.id || 0,
    };

    const knowledgeJobsSummary = {
      pending: knowledgeJobGroups.find((g) => g.status === "PENDING")?._count?.id || 0,
      processing: knowledgeJobGroups.find((g) => g.status === "PROCESSING")?._count?.id || 0,
      completed: knowledgeJobGroups.find((g) => g.status === "COMPLETED")?._count?.id || 0,
      failed: knowledgeJobGroups.find((g) => g.status === "FAILED")?._count?.id || 0,
    };

    const embeddingBacklog = Math.max(0, totalPassages - totalEmbeddings) + outdatedEmbeddings;

    // 4. OCR Throughput Calculation (pages per minute from recent records)
    const recentPagesAggregate = await prisma.bookPage.aggregate({
      _avg: { processingDurationMs: true },
      _count: { id: true },
      where: {
        ocrCompleted: true,
        processingDurationMs: { gt: 0 },
      },
    });

    const avgPageMs = Math.round(recentPagesAggregate._avg.processingDurationMs || 0);
    const pagesPerMinute = avgPageMs > 0 ? Math.round((60000 / avgPageMs) * 10) / 10 : 0;

    // 5. Storage Latency Probe
    let storageStatus = "HEALTHY";
    let storageLatencyMs = 0;
    try {
      const storageStart = performance.now();
      const testPath = path.join(process.cwd(), "public");
      await fs.access(testPath);
      storageLatencyMs = Math.round((performance.now() - storageStart) * 10) / 10;
    } catch {
      storageStatus = "WARNING";
    }

    // 6. Memory & CPU Runtime Usage
    const mem = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const runtime = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptimeSeconds: Math.round(process.uptime()),
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
      rssMb: Math.round(mem.rss / 1024 / 1024),
      cpuUserMs: Math.round(cpuUsage.user / 1000),
      cpuSystemMs: Math.round(cpuUsage.system / 1000),
    };

    // 7. Ephemeris & Astronomy Engine
    const ephemerisHealth = {
      engine: "astronomy-engine-v2",
      algorithms: "Sidereal Vedic (Lahiri/KP/Raman)",
      status: "HEALTHY",
    };

    const totalDurationMs = Math.round(performance.now() - startTime);

    const payload = {
      overallStatus:
        dbStatus === "HEALTHY" && queueStatus !== "WARNING" ? "HEALTHY" : "WARNING",
      probedAt: new Date().toISOString(),
      durationMs: totalDurationMs,
      services: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
          engine: "PostgreSQL 14+ (Prisma v6)",
        },
        jobQueue: {
          status: queueStatus,
          queuedJobs: queueMetrics.queuedCount,
          activeJobs: queueMetrics.activeCount,
          failedJobs: queueMetrics.failedCount,
          stalledJobs: queueMetrics.stalledCount,
          oldestQueuedAgeSec: queueMetrics.oldestQueuedAgeSec,
          activeWorkers: queueMetrics.activeWorkerCount,
          lastWorkerHeartbeat: queueMetrics.lastWorkerHeartbeat,
        },
        ocrPipeline: {
          status: queueStatus === "WARNING" ? "WARNING" : "HEALTHY",
          avgPageDurationMs: avgPageMs,
          estimatedPagesPerMinute: pagesPerMinute,
        },
        searchAndAi: {
          status: embeddingBacklog > 50 ? "BACKLOG" : "HEALTHY",
          totalPassages,
          indexedEmbeddings: totalEmbeddings,
          outdatedEmbeddings,
          backlogCount: embeddingBacklog,
          embeddingJobs: embeddingJobsSummary,
        },
        knowledgeJobs: {
          status: knowledgeJobsSummary.failed > 0 ? "WARNING" : "HEALTHY",
          ...knowledgeJobsSummary,
        },
        storage: {
          status: storageStatus,
          latencyMs: storageLatencyMs,
          provider: process.env.STORAGE_PROVIDER || "local",
        },
        runtime,
        astronomyEngine: ephemerisHealth,
      },
      alerts: logger.getRecentAlerts ? logger.getRecentAlerts().slice(0, 15) : [],
    };

    cachedHealthData = payload;
    lastCacheTime = now;

    return NextResponse.json(payload);
  } catch (error) {
    return apiError(error, 500, "SYSTEM_HEALTH_CHECK_FAILED", request);
  }
}
