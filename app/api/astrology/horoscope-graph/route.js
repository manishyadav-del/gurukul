import { NextResponse } from "next/server";
import {
  buildLiveHoroscopeGraph,
  getLiveElementDetails,
  explainHoroscopeWithRAG,
} from "@/server/astrology/horoscopeGraphEngine.js";
import { computePanchang } from "@/server/astrology/panchang.js";
import { computeDailyTransits } from "@/server/astrology/transits.js";

/**
 * GET /api/astrology/horoscope-graph
 * 
 * Returns the live calculated horoscope knowledge graph for a date, location,
 * and selected Rashi, or returns detailed shastric explanations for a clicked element.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const lat = parseFloat(searchParams.get("lat") || "28.6139");
    const lon = parseFloat(searchParams.get("lon") || "77.2090");
    const tz = parseFloat(searchParams.get("tz") || "5.5");
    const timezone = searchParams.get("timezone") || "Asia/Kolkata";
    const selectedRashi = searchParams.get("selectedRashi") || "Aries";
    const language = searchParams.get("language") || "en";

    const elementType = searchParams.get("elementType");
    const elementKey = searchParams.get("elementKey");

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json({ error: "Invalid coordinates provided" }, { status: 400 });
    }

    // If specific element inquiry is requested
    if (elementType && elementKey) {
      const panchang = computePanchang({
        date,
        latitude: lat,
        longitude: lon,
        tzOffset: tz,
        timezone,
      });
      const transits = computeDailyTransits({ date, tzOffset: tz });

      const details = await getLiveElementDetails({
        elementType,
        elementKey,
        panchang,
        transits,
        language,
      });
      return NextResponse.json({ success: true, ...details });
    }

    // Default: Return the full live horoscope graph
    const graphData = await buildLiveHoroscopeGraph({
      date,
      lat,
      lon,
      tz,
      timezone,
      selectedRashi,
      language,
    });

    const response = NextResponse.json(graphData);
    response.headers.set("Cache-Control", "public, max-age=120, stale-while-revalidate=300");
    return response;
  } catch (error) {
    console.error("GET /api/astrology/horoscope-graph error:", error);
    return NextResponse.json(
      { error: "Failed to compute live horoscope graph", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/astrology/horoscope-graph
 * 
 * Executes RAG-grounded explanations for calculated horoscope elements
 * using authentic manuscript citations without hallucinations.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      action = "explain_panchang",
      panchang,
      transits,
      selectedRashi = "Aries",
      cityName = "New Delhi",
      customPrompt = "",
      language = "en",
    } = body;

    const result = await explainHoroscopeWithRAG({
      action,
      panchang,
      transits,
      selectedRashi,
      cityName,
      customPrompt,
      language,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/astrology/horoscope-graph error:", error);
    return NextResponse.json(
      { error: "Failed to generate horoscope explanation", details: error.message },
      { status: 500 }
    );
  }
}
