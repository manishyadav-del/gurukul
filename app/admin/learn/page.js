import prisma from "@/lib/prisma";
import LearnAdminClient from "@/components/admin/LearnAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminLearnPage() {
  const modules = await prisma.learningModule.findMany({
    include: {
      _count: {
        select: { lessons: true },
      },
    },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return <LearnAdminClient initialModules={modules} />;
}
