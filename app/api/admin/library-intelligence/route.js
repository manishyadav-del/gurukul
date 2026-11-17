import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin/auth";
import { PERMISSIONS } from "@/server/admin/permissions";
import { getLibraryIntelligenceReport } from "@/server/admin/libraryIntelligence";

// GET /api/admin/library-intelligence
export async function GET(request) {
  const auth = await requireAdmin(request, PERMISSIONS.BOOKS_READ);
  if (!auth.authorized) return auth.response;

  try {
    const report = await getLibraryIntelligenceReport();
    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("GET /api/admin/library-intelligence error:", error);
    return NextResponse.json(
      { error: "Failed to generate library intelligence report", details: error.message },
      { status: 500 }
    );
  }
}
