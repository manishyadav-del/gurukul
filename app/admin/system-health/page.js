import prisma from "@/lib/prisma";
import SystemHealthAdminClient from "@/components/admin/SystemHealthAdminClient";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export default async function AdminSystemHealthPage() {
  const startTime = performance.now();

  let dbStatus = "HEALTHY";
  let dbLatencyMs = 0;
  try {
    const dbStart = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Math.round((performance.now() - dbStart) * 10) / 10;
  } catch (err) {
    dbStatus = "DEGRADED";
  }

  const [queuedJobs, activeJobs, failedJobs] = await Promise.all([
    prisma.ingestJob.count({ where: { status: "QUEUED" } }),
    prisma.ingestJob.count({
      where: {
        status: { in: ["ANALYZING", "EXTRACTING", "OCR_PROCESSING", "STRUCTURING"] },
      },
    }),
    prisma.ingestJob.count({ where: { status: "FAILED" } }),
  ]);

  const queueStatus =
    failedJobs > 5 ? "WARNING" : activeJobs > 0 || queuedJobs > 0 ? "BUSY" : "IDLE";

  const resendApiKey = process.env.RESEND_API_KEY;
  const emailProvider = {
    provider: resendApiKey ? "Resend API (Live Dispatch)" : "Local Development Memory Buffer",
    status: resendApiKey ? "CONFIGURED" : "FALLBACK_MODE",
    fromAddress: process.env.EMAIL_FROM || "Gurukul <noreply@gurukul.org>",
  };

  const mem = process.memoryUsage();
  const runtime = {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    uptimeSeconds: Math.round(process.uptime()),
    heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
    heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
    rssMb: Math.round(mem.rss / 1024 / 1024),
  };

  const ephemerisHealth = {
    engine: "astronomy-engine-v2",
    algorithms: "Sidereal Vedic (Lahiri/KP/Raman)",
    status: "HEALTHY",
  };

  let storageStatus = "HEALTHY";
  try {
    const uploadsDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(uploadsDir)) storageStatus = "WARNING";
  } catch {
    storageStatus = "UNKNOWN";
  }

  const totalDurationMs = Math.round(performance.now() - startTime);

  const initialData = {
    overallStatus:
      dbStatus === "HEALTHY" && queueStatus !== "WARNING" ? "HEALTHY" : "WARNING",
    probedAt: new Date().toISOString(),
    durationMs: totalDurationMs,
    services: {
      database: { status: dbStatus, latencyMs: dbLatencyMs, engine: "PostgreSQL" },
      jobQueue: { status: queueStatus, queuedJobs, activeJobs, failedJobs },
      email: emailProvider,
      astronomyEngine: ephemerisHealth,
      storage: { status: storageStatus },
      runtime,
    },
  };

  return <SystemHealthAdminClient initialData={initialData} />;
}
