import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/server/admin/auth";
import { PERMISSIONS } from "@/server/admin/permissions";

export async function GET(request) {
  const auth = await requireAdmin(request, PERMISSIONS.ANALYTICS_READ);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";

    const days = range === "7d" ? 7 : range === "90d" ? 90 : range === "all" ? 365 : 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      newUsers,
      totalUsers,
      readingCount,
      quizAttempts,
      aiConversations,
      ocrCompleted,
      ocrFailed,
      userEvents,
      readEvents,
      quizEvents,
    ] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: startDate } } }),
      prisma.user.count(),
      prisma.readingProgress.count({ where: { updatedAt: { gte: startDate } } }),
      prisma.quizAttempt.count({ where: { createdAt: { gte: startDate } } }),
      prisma.aIConversation.count({ where: { createdAt: { gte: startDate } } }),
      prisma.ingestJob.count({ where: { status: "COMPLETED", createdAt: { gte: startDate } } }),
      prisma.ingestJob.count({ where: { status: "FAILED", createdAt: { gte: startDate } } }),
      prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
      prisma.readingProgress.findMany({
        where: { updatedAt: { gte: startDate } },
        select: { updatedAt: true },
      }),
      prisma.quizAttempt.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
    ]);

    // Average quiz score
    const avgScoreResult = await prisma.quizAttempt.aggregate({
      where: { createdAt: { gte: startDate } },
      _avg: { percentage: true },
    });

    const averageQuizPercentage = Math.round(avgScoreResult._avg?.percentage || 0);

    // Aggregate real daily activity counts into calendar day buckets
    const numPoints = Math.min(days, 14);
    const dayBuckets = [];
    const dayMap = {};

    for (let i = numPoints - 1; i >= 0; i--) {
      const d = new Date();
      d.setUTCHours(0, 0, 0, 0);
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().split("T")[0];
      const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dayMap[key] = { date: dateLabel, users: 0, reads: 0, quizzes: 0 };
      dayBuckets.push(key);
    }

    for (const u of userEvents) {
      const k = u.createdAt?.toISOString().split("T")[0];
      if (dayMap[k]) dayMap[k].users += 1;
    }
    for (const r of readEvents) {
      const k = r.updatedAt?.toISOString().split("T")[0];
      if (dayMap[k]) dayMap[k].reads += 1;
    }
    for (const q of quizEvents) {
      const k = q.createdAt?.toISOString().split("T")[0];
      if (dayMap[k]) dayMap[k].quizzes += 1;
    }

    const daysData = dayBuckets.map((key) => dayMap[key]);

    return NextResponse.json({
      range,
      days,
      metrics: {
        newUsers,
        totalUsers,
        readingCount,
        quizAttempts,
        averageQuizPercentage,
        aiConversations,
        ocrCompleted,
        ocrFailed,
        ocrThroughputRate: ocrCompleted + ocrFailed > 0
          ? `${Math.round((ocrCompleted / (ocrCompleted + ocrFailed)) * 100)}%`
          : "100%",
      },
      timeline: daysData,
    });
  } catch (error) {
    console.error("GET /api/admin/analytics error:", error);
    return NextResponse.json({ error: "Failed to compute analytics" }, { status: 500 });
  }
}
