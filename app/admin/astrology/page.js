import prisma from "@/lib/prisma.js";
import AstrologyAdminClient from "@/components/admin/AstrologyAdminClient.jsx";

export const dynamic = "force-dynamic";

export default async function AdminAstrologyPage() {
  let settings = await prisma.platformSettings.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    settings = await prisma.platformSettings.create({
      data: { id: "default" },
    });
  }

  const todayStr = new Date().toISOString().split("T")[0];

  const [
    totalReports,
    todayReports,
    totalCharts,
    remedies,
    kundaliniModules,
    totalNumerologyProfiles,
    totalNumerologyReports,
  ] = await Promise.all([
    prisma.dailyAstrologyReport.count().catch(() => 0),
    prisma.dailyAstrologyReport.count({ where: { reportDate: todayStr } }).catch(() => 0),
    prisma.birthChart.count().catch(() => 0),
    prisma.dailyRemedy.findMany({ orderBy: { createdAt: "asc" } }).catch(() => []),
    prisma.kundaliniModule.findMany({ orderBy: { order: "asc" } }).catch(() => []),
    prisma.numerologyProfile.count().catch(() => 0),
    prisma.numerologyReport.count().catch(() => 0),
  ]);

  const initialData = {
    settings,
    cacheStats: {
      totalDailyReports: totalReports,
      todayCachedReports: todayReports,
      totalBirthCharts: totalCharts,
      totalRemedies: remedies.length,
      totalKundaliniModules: kundaliniModules.length,
      totalNumerologyProfiles,
      totalNumerologyReports,
    },
    remedies,
    kundaliniModules,
  };

  return <AstrologyAdminClient initialData={initialData} />;
}
