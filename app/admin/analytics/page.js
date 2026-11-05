import prisma from "@/lib/prisma";
import AnalyticsAdminClient from "@/components/admin/AnalyticsAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const range = resolvedParams?.range || "30d";
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
    avgScoreResult,
  ] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: startDate } } }),
    prisma.user.count(),
    prisma.readingProgress.count({ where: { updatedAt: { gte: startDate } } }),
    prisma.quizAttempt.count({ where: { createdAt: { gte: startDate } } }),
    prisma.aIConversation.count({ where: { createdAt: { gte: startDate } } }),
    prisma.ingestJob.count({ where: { status: "COMPLETED", createdAt: { gte: startDate } } }),
    prisma.ingestJob.count({ where: { status: "FAILED", createdAt: { gte: startDate } } }),
    prisma.quizAttempt.aggregate({
      where: { createdAt: { gte: startDate } },
      _avg: { percentage: true },
    }),
  ]);

  const daysData = [];
  for (let i = Math.min(days, 14) - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    daysData.push({
      date: dateStr,
      users: Math.max(0, Math.round(newUsers / Math.min(days, 14))),
      reads: Math.max(0, Math.round(readingCount / Math.min(days, 14))),
      quizzes: Math.max(0, Math.round(quizAttempts / Math.min(days, 14))),
    });
  }

  const initialData = {
    range,
    days,
    metrics: {
      newUsers,
      totalUsers,
      readingCount,
      quizAttempts,
      averageQuizPercentage: Math.round(avgScoreResult._avg?.percentage || 0),
      aiConversations,
      ocrCompleted,
      ocrFailed,
      ocrThroughputRate: ocrCompleted + ocrFailed > 0
        ? `${Math.round((ocrCompleted / (ocrCompleted + ocrFailed)) * 100)}%`
        : "100%",
    },
    timeline: daysData,
  };

  return <AnalyticsAdminClient initialData={initialData} />;
}
