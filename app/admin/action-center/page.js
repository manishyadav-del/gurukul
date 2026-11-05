import prisma from "@/lib/prisma";
import ActionCenterAdminClient from "@/components/admin/ActionCenterAdminClient";
import {
  scanAndSyncActionItems,
  getContentQualityReport,
} from "@/server/admin/actionCenter";

export const dynamic = "force-dynamic";

export default async function AdminActionCenterPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const status = resolvedParams?.status || "ALL";

  // Auto-sync any fresh incidents on initial load
  await scanAndSyncActionItems();

  const where = {};
  if (status !== "ALL") where.status = status;

  const [items, totalOpen, totalCritical, totalWarnings, qualityReport] =
    await Promise.all([
      prisma.adminActionItem.findMany({
        where,
        orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
        take: 50,
      }),
      prisma.adminActionItem.count({ where: { status: "OPEN" } }),
      prisma.adminActionItem.count({
        where: { severity: "CRITICAL", status: "OPEN" },
      }),
      prisma.adminActionItem.count({
        where: { severity: "WARNING", status: "OPEN" },
      }),
      getContentQualityReport(),
    ]);

  const initialData = {
    items,
    stats: {
      totalOpen,
      totalCritical,
      totalWarnings,
    },
    qualityReport,
  };

  return <ActionCenterAdminClient initialData={initialData} />;
}
