import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";

// GET /api/numerology/reports - List user's historical reports
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request).catch(() => null);
    if (!authUser?.id) {
      return NextResponse.json(
        { error: "Authentication required to view saved numerology reports." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("id");

    if (reportId) {
      const report = await prisma.numerologyReport.findUnique({
        where: { id: reportId },
      });
      if (!report || report.userId !== authUser.id) {
        return NextResponse.json({ error: "Report not found or access denied." }, { status: 404 });
      }
      return NextResponse.json({ success: true, report });
    }

    const reports = await prisma.numerologyReport.findMany({
      where: { userId: authUser.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        birthDate: true,
        system: true,
        language: true,
        version: true,
        engineVersion: true,
        coreNumbers: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (err) {
    console.error("GET /api/numerology/reports error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch numerology reports" },
      { status: 500 }
    );
  }
}

// DELETE /api/numerology/reports?id=xyz - Delete a saved report
export async function DELETE(request) {
  try {
    const authUser = await getAuthenticatedUser(request).catch(() => null);
    if (!authUser?.id) {
      return NextResponse.json(
        { error: "Authentication required to delete numerology report." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("id");
    if (!reportId) {
      return NextResponse.json({ error: "Report ID is required." }, { status: 400 });
    }

    const existing = await prisma.numerologyReport.findUnique({
      where: { id: reportId },
    });

    if (!existing || existing.userId !== authUser.id) {
      return NextResponse.json({ error: "Report not found or access denied." }, { status: 404 });
    }

    await prisma.numerologyReport.delete({
      where: { id: reportId },
    });

    return NextResponse.json({ success: true, message: "Report deleted successfully." });
  } catch (err) {
    console.error("DELETE /api/numerology/reports error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete numerology report" },
      { status: 500 }
    );
  }
}
