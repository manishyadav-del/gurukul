import prisma from "@/lib/prisma";
import OcrManagementClient from "@/components/admin/OcrManagementClient";
import {
  getOcrOverviewMetrics,
  getOcrQualityDistribution,
  getBookQualityReports,
  getOcrErrorAnalytics,
  getOcrCorrectionFeedback,
  getOcrPerformanceAnalytics,
  getOcrActionableAlerts,
} from "@/server/admin/ocrAnalytics";

export const dynamic = "force-dynamic";

export default async function AdminOcrPage() {
  const [
    overviewMetrics,
    qualityDistribution,
    bookReportsData,
    errorAnalytics,
    correctionFeedback,
    performanceAnalytics,
    actionableAlerts,
    recentJobs,
    flaggedPages,
  ] = await Promise.all([
    getOcrOverviewMetrics(true),
    getOcrQualityDistribution(),
    getBookQualityReports({ limit: 15 }),
    getOcrErrorAnalytics(),
    getOcrCorrectionFeedback(),
    getOcrPerformanceAnalytics(),
    getOcrActionableAlerts(),
    prisma.ingestJob.findMany({
      take: 25,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      include: {
        book: {
          select: { id: true, title: true, slug: true, language: true },
        },
      },
    }),
    prisma.bookPage.findMany({
      where: {
        OR: [
          { ocrCompleted: false },
          { ocrConfidence: { lt: 0.75 } },
          { ocrErrors: { some: { resolved: false } } },
        ],
      },
      take: 30,
      orderBy: [{ retryCount: "desc" }, { updatedAt: "desc" }],
      include: {
        book: {
          select: { id: true, title: true, slug: true, language: true },
        },
        ocrErrors: {
          where: { resolved: false },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    }),
  ]);

  const initialData = {
    stats: overviewMetrics,
    quality: qualityDistribution,
    bookReports: bookReportsData,
    errors: errorAnalytics,
    corrections: correctionFeedback,
    performance: performanceAnalytics,
    alerts: actionableAlerts,
    jobs: recentJobs,
    flaggedPages,
  };

  return <OcrManagementClient initialData={initialData} />;
}
