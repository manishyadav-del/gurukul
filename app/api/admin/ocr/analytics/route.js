import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin/auth";
import { PERMISSIONS } from "@/server/admin/permissions";
import {
  getOcrOverviewMetrics,
  getOcrQualityDistribution,
  getOcrErrorAnalytics,
  getOcrCorrectionFeedback,
  getOcrPerformanceAnalytics,
  getOcrActionableAlerts,
} from "@/server/admin/ocrAnalytics";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const auth = await requireAdmin(request, PERMISSIONS.OCR_READ);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const fresh = searchParams.get("fresh") === "true";

    const [
      overview,
      quality,
      errors,
      corrections,
      performance,
      alerts,
    ] = await Promise.all([
      getOcrOverviewMetrics(fresh),
      getOcrQualityDistribution(),
      getOcrErrorAnalytics(),
      getOcrCorrectionFeedback(),
      getOcrPerformanceAnalytics(),
      getOcrActionableAlerts(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        overview,
        quality,
        errors,
        corrections,
        performance,
        alerts,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/ocr/analytics error:", error);
    return NextResponse.json(
      { error: "Failed to compile OCR analytics", details: error.message },
      { status: 500 }
    );
  }
}
