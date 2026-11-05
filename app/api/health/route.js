import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { logger } from "@/server/monitoring/logger";
import { getAuthenticatedUser } from "@/server/security/authGuard";

/**
 * GET /api/health
 * Production health and readiness check endpoint.
 * Distinguishes lightweight liveness from authenticated deep readiness diagnostics.
 */
export async function GET(request) {
  const startTime = Date.now();
  const url = new URL(request.url);
  const probeType = url.searchParams.get("type"); // "liveness" | "readiness"

  // 1. Lightweight Liveness Probe (for container orchestrators / load balancers)
  if (probeType === "liveness") {
    return NextResponse.json({
      status: "UP",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    });
  }

  const user = await getAuthenticatedUser(request);
  const isPrivileged = user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN");

  const checks = {
    database: { status: "unknown", latencyMs: null },
    storage: { status: "unknown", writable: false },
    system: {
      uptimeSeconds: Math.floor(process.uptime()),
      memory: {
        heapUsedMb: parseFloat((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)),
        heapTotalMb: parseFloat((process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)),
        rssMb: parseFloat((process.memoryUsage().rss / 1024 / 1024).toFixed(2)),
      },
      nodeVersion: process.version,
    },
    backgroundQueues: {
      pendingIngestJobs: 0,
      processingIngestJobs: 0,
      failedIngestJobs: 0,
      queuedEmbeddingJobs: 0,
    },
    aiProvider: {
      provider: process.env.GEMINI_API_KEY ? "Gemini text-embedding-004 & 2.5 Flash" : "Deterministic Offline Engine",
      configured: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY),
      status: "operational",
    },
    ocrService: {
      engine: process.env.OCR_ENGINE || "tesseract",
      language: process.env.OCR_LANGUAGE || "eng+hin+san",
      status: "ready",
    },
    recentAlerts: [],
  };

  let isHealthy = true;

  // 1. Database Check & Latency
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database.latencyMs = Date.now() - dbStart;
    checks.database.status = "connected";

    // Query queue statistics
    const [
      pendingIngest,
      processingIngest,
      failedIngest,
      queuedEmbedding,
    ] = await Promise.all([
      prisma.ingestJob.count({ where: { status: "QUEUED" } }),
      prisma.ingestJob.count({ where: { status: { in: ["ANALYZING", "EXTRACTING", "OCR_PROCESSING", "STRUCTURING"] } } }),
      prisma.ingestJob.count({ where: { status: "FAILED" } }),
      prisma.embeddingBatchJob.count({ where: { status: { in: ["QUEUED", "PROCESSING"] } } }),
    ]);

    checks.backgroundQueues.pendingIngestJobs = pendingIngest;
    checks.backgroundQueues.processingIngestJobs = processingIngest;
    checks.backgroundQueues.failedIngestJobs = failedIngest;
    checks.backgroundQueues.queuedEmbeddingJobs = queuedEmbedding;
  } catch (dbError) {
    isHealthy = false;
    checks.database.status = "disconnected";
    checks.database.error = dbError.message;
    logger.alertDatabaseFailure(dbError, { endpoint: "/api/health" });
  }

  // 2. Storage Check
  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    // Test write & delete
    const testFile = path.join(uploadsDir, `.healthcheck-${Date.now()}`);
    fs.writeFileSync(testFile, "ok");
    fs.unlinkSync(testFile);

    checks.storage.status = "accessible";
    checks.storage.writable = true;
  } catch (storageError) {
    checks.storage.status = "degraded";
    checks.storage.error = storageError.message;
  }

  // 3. Operational Alerts
  checks.recentAlerts = logger.getRecentAlerts().slice(0, 5);

  const totalTimingMs = Date.now() - startTime;
  const httpStatus = isHealthy ? 200 : 503;

  const responsePayload = {
    status: isHealthy ? "HEALTHY" : "UNHEALTHY",
    timestamp: new Date().toISOString(),
    durationMs: totalTimingMs,
  };

  // Disclose deep diagnostic details only to authenticated administrators
  if (isPrivileged) {
    responsePayload.checks = checks;
  }

  return NextResponse.json(responsePayload, { status: httpStatus });
}
