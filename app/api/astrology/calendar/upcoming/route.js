import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUpcomingFestivals } from "@/server/astrology/vedicCalendarEngine";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || new Date().toISOString().split("T")[0];
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const category = searchParams.get("category") || "ALL";
    const tradition = searchParams.get("tradition") || "ALL";
    const lat = parseFloat(searchParams.get("lat") || "28.6139");
    const lon = parseFloat(searchParams.get("lon") || "77.2090");
    const tz = parseFloat(searchParams.get("tz") || "5.5");
    const tzStr = searchParams.get("tzStr") || "Asia/Kolkata";

    const dbFestivals = await prisma.vedicFestival.findMany({
      where: {
        isPublished: true,
      },
      include: {
        rule: true,
        scriptureReferences: true,
      },
    });

    const upcoming = await getUpcomingFestivals({
      startDate,
      limit,
      latitude: lat,
      longitude: lon,
      tzOffset: tz,
      timezone: tzStr,
      category,
      tradition,
      customFestivals: dbFestivals,
    });

    return NextResponse.json({
      success: true,
      upcoming,
    });
  } catch (error) {
    console.error("Vedic Calendar Upcoming API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch upcoming festivals" },
      { status: 500 }
    );
  }
}
