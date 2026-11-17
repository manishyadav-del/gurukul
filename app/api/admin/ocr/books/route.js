import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin/auth";
import { PERMISSIONS } from "@/server/admin/permissions";
import { getBookQualityReports } from "@/server/admin/ocrAnalytics";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const auth = await requireAdmin(request, PERMISSIONS.OCR_READ);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "ALL";
    const language = searchParams.get("language") || "ALL";

    const result = await getBookQualityReports({
      page,
      limit,
      q,
      status,
      language,
    });

    return NextResponse.json({
      success: true,
      data: result.reports,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("GET /api/admin/ocr/books error:", error);
    return NextResponse.json(
      { error: "Failed to load book quality reports", details: error.message },
      { status: 500 }
    );
  }
}
