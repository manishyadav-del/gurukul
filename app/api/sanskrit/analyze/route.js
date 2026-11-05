import { NextResponse } from "next/server";
import { analyzeSanskritVerse } from "@/server/sanskrit/shastraIntelligence";

// POST /api/sanskrit/analyze — Morphological, metrical & syntactic analysis of Sanskrit verse
export async function POST(request) {
  try {
    const body = await request.json();
    const { verseText, verseId, language = "en" } = body;

    if (!verseText && !verseId) {
      return NextResponse.json(
        { error: "Sanskrit verse text or verseId is required." },
        { status: 400 }
      );
    }

    const analysis = analyzeSanskritVerse({
      verseText: verseText || "",
      verseId: verseId || null,
      language,
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("POST /api/sanskrit/analyze error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze Sanskrit verse" },
      { status: 500 }
    );
  }
}
