import prisma from "@/lib/prisma";
import AdminOverviewClient from "@/components/admin/AdminOverviewClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const range = resolvedParams?.range || "30d";

  const now = new Date();
  let startDate = new Date(0); // All time

  if (range === "today") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (range === "7d") {
    startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  } else if (range === "30d") {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  const [
    userCount,
    newUsersCount,
    bookCount,
    publishedBookCount,
    chapterCount,
    passageCount,
    pendingProofreadCount,
    ocrQueuedCount,
    familyCount,
    pendingInvitesCount,
    aiConversationsCount,
    quizAttemptCount,
    quizzesTotal,
    recentLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startDate } } }),
    prisma.book.count(),
    prisma.book.count({ where: { status: "PUBLISHED" } }),
    prisma.chapter.count(),
    prisma.passage.count(),
    prisma.bookPage.count({ where: { proofread: false } }),
    prisma.ingestJob.count({
      where: {
        status: { in: ["QUEUED", "ANALYZING", "EXTRACTING", "OCR_PROCESSING", "STRUCTURING"] },
      },
    }),
    prisma.familyMember.count({ where: { isArchived: false } }),
    prisma.familyInvitation.count({ where: { status: "PENDING" } }),
    prisma.aIConversation.count({ where: { createdAt: { gte: startDate } } }),
    prisma.quizAttempt.count({ where: { createdAt: { gte: startDate } } }),
    prisma.quiz.count(),
    prisma.adminAuditLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const stats = {
    userCount,
    newUsersCount,
    bookCount,
    publishedBookCount,
    chapterCount,
    passageCount,
    pendingProofreadCount,
    ocrQueuedCount,
    familyCount,
    pendingInvitesCount,
    aiConversationsCount,
    quizAttemptCount,
    quizzesTotal,
  };

  return (
    <AdminOverviewClient
      stats={stats}
      recentLogs={recentLogs}
      currentRange={range}
    />
  );
}
