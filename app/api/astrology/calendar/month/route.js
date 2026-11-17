import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMonthlyVedicCalendar } from "@/server/astrology/vedicCalendarEngine";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const year = parseInt(searchParams.get("year") || String(now.getFullYear()), 10);
    const month = parseInt(searchParams.get("month") || String(now.getMonth() + 1), 10);
    const lat = parseFloat(searchParams.get("lat") || "28.6139");
    const lon = parseFloat(searchParams.get("lon") || "77.2090");
    const tz = parseFloat(searchParams.get("tz") || "5.5");
    const tzStr = searchParams.get("tzStr") || "Asia/Kolkata";
    const tradition = searchParams.get("tradition") || "ALL";

    // Query published festivals from DB with rules and scripture references
    const dbFestivals = await prisma.vedicFestival.findMany({
      where: {
        isPublished: true,
      },
      include: {
        rule: true,
        scriptureReferences: true,
      },
    });

    const monthCalendar = await getMonthlyVedicCalendar({
      year,
      month,
      latitude: lat,
      longitude: lon,
      tzOffset: tz,
      timezone: tzStr,
      tradition,
      customFestivals: dbFestivals,
    });

    return NextResponse.json({
      success: true,
      calendar: monthCalendar,
    });
  } catch (error) {
    console.error("Vedic Calendar Month API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to compute Vedic calendar" },
      { status: 500 }
    );
  }
}
