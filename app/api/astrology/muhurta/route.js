import { NextResponse } from "next/server";
import { evaluateActivityMuhurta, MUHURTA_ACTIVITIES } from "@/server/astrology/muhurtaPlanner";

// GET or POST /api/astrology/muhurta
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const latitude = parseFloat(searchParams.get("lat") || "28.6139");
    const longitude = parseFloat(searchParams.get("lon") || "77.2090");
    const tzOffset = parseFloat(searchParams.get("tz") || "5.5");
    const activityKey = searchParams.get("activity") || "VYAPAR";
    const language = searchParams.get("lang") || "en";

    const result = evaluateActivityMuhurta({
      date,
      latitude,
      longitude,
      tzOffset,
      activityKey,
      language,
    });

    return NextResponse.json({
      success: true,
      availableActivities: Object.values(MUHURTA_ACTIVITIES).map((a) => ({
        key: a.id,
        nameEn: a.nameEn,
        nameHi: a.nameHi,
      })),
      ...result,
    });
  } catch (error) {
    console.error("GET /api/astrology/muhurta error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate Muhurta planner." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      date = new Date().toISOString().split("T")[0],
      latitude = 28.6139,
      longitude = 77.2090,
      tzOffset = 5.5,
      activityKey = "VYAPAR",
      language = "en",
    } = body;

    const result = evaluateActivityMuhurta({
      date,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      tzOffset: parseFloat(tzOffset),
      activityKey,
      language,
    });

    return NextResponse.json({
      success: true,
      availableActivities: Object.values(MUHURTA_ACTIVITIES).map((a) => ({
        key: a.id,
        nameEn: a.nameEn,
        nameHi: a.nameHi,
      })),
      ...result,
    });
  } catch (error) {
    console.error("POST /api/astrology/muhurta error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate Muhurta planner." },
      { status: 500 }
    );
  }
}
