import { NextResponse } from "next/server";
import { getVrataSchedule } from "@/server/astrology/vedicCalendarEngine";

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

    const vrats = await getVrataSchedule({
      year,
      month,
      latitude: lat,
      longitude: lon,
      tzOffset: tz,
      timezone: tzStr,
    });

    return NextResponse.json({
      success: true,
      year,
      month,
      vrats,
    });
  } catch (error) {
    console.error("Vrata Schedule API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to compute Vrata schedule" },
      { status: 500 }
    );
  }
}
