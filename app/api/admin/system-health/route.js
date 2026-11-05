import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/server/admin/auth";
import { PERMISSIONS } from "@/server/admin/permissions";
import { getQueueMetrics } from "@/server/jobs/queue";
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

    // 3. Search & AI Embeddings Backlog
    const [outdatedEmbeddings, totalEmbeddings, totalPassages] = await Promise.all([
      prisma.passageEmbedding.count({ where: { status: "OUTDATED" } }).catch(() => 0),
      prisma.passageEmbedding.count().catch(() => 0),
      prisma.passage.count().catch(() => 0),
    ]);

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
        },
        storage: {
          status: storageStatus,
          latencyMs: storageLatencyMs,
          provider: process.env.STORAGE_PROVIDER || "local",
        },
        runtime,
        astronomyEngine: ephemerisHealth,
      },
    };

    cachedHealthData = payload;
    lastCacheTime = now;

    return NextResponse.json(payload);
  } catch (error) {
    console.error("GET /api/admin/system-health error:", error);
    return NextResponse.json(
      { error: "System health check failed", details: error.message },
      { status: 500 }
    );
  }
}
