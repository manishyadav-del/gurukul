import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin/auth";
import { PERMISSIONS } from "@/server/admin/permissions";
import { generateOcrCsvExport } from "@/server/admin/ocrAnalytics";
import { logAdminActivity } from "@/server/admin/audit";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const auth = await requireAdmin(request, PERMISSIONS.OCR_READ);
  if (!auth.authorized) return auth.response;
  const admin = auth.admin;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "books"; // 'books' or 'pages'

    const csvContent = await generateOcrCsvExport(type);

    await logAdminActivity({
      actorId: admin.user.id,
      actorEmail: admin.user.email,
      actorRole: admin.role,
      action: "OCR_CSV_EXPORT",
      targetResource: type === "pages" ? "BookPage" : "Book",
      status: "SUCCESS",
      details: { exportType: type, rowCount: csvContent.split("\n").length - 1 },
    });

    const filename = `gurukul_ocr_${type}_quality_report_${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("GET /api/admin/ocr/export error:", error);
    return NextResponse.json(
      { error: "Failed to generate CSV export", details: error.message },
      { status: 500 }
    );
  }
}
