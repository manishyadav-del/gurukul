import prisma from "@/lib/prisma";
import AstroAiAdminClient from "@/components/admin/AstroAiAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminAstroAiPage() {
  let settings = await prisma.platformSettings.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    settings = await prisma.platformSettings.create({
      data: { id: "default" },
    });
  }

  const [
    totalConversations,
    totalMessages,
    totalEmbeddedPassages,
    totalPassages,
    sourcesCount,
    recentBatchJobs,
  ] = await Promise.all([
    prisma.aIConversation.count(),
    prisma.aIMessage.count(),
    prisma.passageEmbedding.count({ where: { status: "COMPLETED" } }),
    prisma.passage.count(),
    prisma.aISource.count(),
    prisma.embeddingBatchJob.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const coveragePct =
    totalPassages > 0
      ? Math.round((totalEmbeddedPassages / totalPassages) * 100)
      : 100;

  const initialData = {
    settings,
    stats: {
      totalConversations,
      totalMessages,
      totalEmbeddedPassages,
      totalPassages,
      coveragePct,
      sourcesCount,
    },
    batchJobs: recentBatchJobs,
  };

  return <AstroAiAdminClient initialData={initialData} />;
}
