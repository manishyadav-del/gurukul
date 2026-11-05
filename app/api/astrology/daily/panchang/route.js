/**
 * GET /api/astrology/daily/panchang
 *
 * Lightweight endpoint returning only Panchang data (no AI interpretation).
 * Fast, deterministic, cacheable.
 *
 * Query parameters:
 *   date      - YYYY-MM-DD (defaults to today)
 *   lat       - latitude (required)
 *   lon       - longitude (required)
 *   tz        - timezone offset in hours (defaults to 0)
 *   timezone  - IANA timezone string for display
 */

import { NextResponse } from "next/server";
import { computePanchang } from "@/server/astrology/panchang";
import { computeDailyTransits, buildTransitsOverview } from "@/server/astrology/transits";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat      = parseFloat(searchParams.get("lat") || "0");
    const lon      = parseFloat(searchParams.get("lon") || "0");
    const tzOffset = parseFloat(searchParams.get("tz")  || "0");
    const timezone = searchParams.get("timezone") || "UTC";

    if (isNaN(lat) || isNaN(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      return NextResponse.json({ error: "Invalid lat/lon parameters" }, { status: 400 });
    }

    // Date
    const dateParam = searchParams.get("date");
    let reportDate;
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      reportDate = dateParam;
    } else {
      const nowLocal = new Date(Date.now() + tzOffset * 3600 * 1000);
      reportDate = nowLocal.toISOString().split("T")[0];
    }

    const panchang = computePanchang({ date: reportDate, latitude: lat, longitude: lon, tzOffset, timezone });
    const transits = computeDailyTransits({ date: reportDate, tzOffset });
    const transitsOverview = buildTransitsOverview(transits);

    const response = NextResponse.json({ success: true, panchang, transits: transitsOverview });
    // Cache for 5 minutes
    response.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    return response;
  } catch (error) {
    console.error("GET /api/astrology/daily/panchang error:", error);
    return NextResponse.json({ error: "Failed to compute Panchang", details: error.message }, { status: 500 });
  }
}
