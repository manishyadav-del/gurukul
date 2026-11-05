import { NextResponse } from "next/server";
import { analyzeSanskritVerse } from "@/server/sanskrit/shastraIntelligence";
import { SANSKRIT_SHLOKAS } from "@/server/spirituality/sanskritShlokas";

// GET /api/sanskrit/verses/[id] — Retrieve detailed verse morphological analysis
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Verse ID required" }, { status: 400 });
    }

    const shloka = SANSKRIT_SHLOKAS.find((s) => s.id === id);
    if (!shloka) {
      return NextResponse.json({ error: "Sanskrit verse not found" }, { status: 404 });
    }

    const analysis = analyzeSanskritVerse({ verseId: id });

    return NextResponse.json({
      success: true,
      verse: analysis,
    });
  } catch (error) {
    console.error("GET /api/sanskrit/verses/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve verse analysis" },
      { status: 500 }
    );
  }
}
