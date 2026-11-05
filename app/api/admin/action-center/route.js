import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/server/admin/auth";
import { PERMISSIONS } from "@/server/admin/permissions";
import {
  scanAndSyncActionItems,
  getContentQualityReport,
} from "@/server/admin/actionCenter";

export async function GET(request) {
  const auth = await requireAdmin(request, PERMISSIONS.AUDIT_READ);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "ALL";
    const severity = searchParams.get("severity") || "ALL";

    const where = {};
    if (status !== "ALL") where.status = status;
    if (severity !== "ALL") where.severity = severity;

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

    return NextResponse.json({
      items,
      stats: {
        totalOpen,
        totalCritical,
        totalWarnings,
      },
      qualityReport,
    });
  } catch (error) {
    console.error("GET /api/admin/action-center error:", error);
    return NextResponse.json(
      { error: "Failed to load action items" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const auth = await requireAdmin(request, PERMISSIONS.AUDIT_READ);
  if (!auth.authorized) return auth.response;

  try {
    const newItems = await scanAndSyncActionItems();
    return NextResponse.json({
      success: true,
      message: `Database scanned. ${newItems.length} incident(s) detected.`,
      detectedCount: newItems.length,
    });
  } catch (error) {
    console.error("POST /api/admin/action-center error:", error);
    return NextResponse.json(
      { error: "Scan execution failed" },
      { status: 500 }
    );
  }
}
