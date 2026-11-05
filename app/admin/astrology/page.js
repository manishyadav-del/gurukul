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

  const [totalReports, todayReports, totalCharts, remedies, kundaliniModules] = await Promise.all([
    prisma.dailyAstrologyReport.count(),
    prisma.dailyAstrologyReport.count({ where: { reportDate: todayStr } }),
    prisma.birthChart.count(),
    prisma.dailyRemedy.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.kundaliniModule.findMany({ orderBy: { order: "asc" } }),
  ]);

  const initialData = {
    settings,
    cacheStats: {
      totalDailyReports: totalReports,
      todayCachedReports: todayReports,
      totalBirthCharts: totalCharts,
      totalRemedies: remedies.length,
      totalKundaliniModules: kundaliniModules.length,
    },
    remedies,
    kundaliniModules,
  };

  return <AstrologyAdminClient initialData={initialData} />;
}
