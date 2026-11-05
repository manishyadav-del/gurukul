import { NextResponse } from "next/server";
import { SANSKRIT_SHLOKAS, queryShlokas } from "@/server/spirituality/sanskritShlokas";
import { analyzeSyllablesAndMeter } from "@/server/sanskrit/shastraIntelligence";

// GET /api/sanskrit/verses — List verified Sanskrit shlokas with metrical metadata
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "ALL";
    const source = searchParams.get("source") || "ALL";

    const filtered = queryShlokas({ query, category, source });

    const verses = filtered.map((s) => {
      const scan = analyzeSyllablesAndMeter(s.devanagari);
      return {
        id: s.id,
        source: s.source,
        author: s.author,
        category: s.category,
        subject: s.subject,
        chapter: s.chapter,
        verseNumber: s.verseNumber,
        devanagari: s.devanagari,
        iast: s.iast,
        chhanda: s.chhanda,
        meterDetected: scan.identifiedMeter,
        totalSyllables: scan.totalSyllables,
        translationEn: s.translationEn,
        translationHi: s.translationHi,
      };
    });

    const categories = Array.from(new Set(SANSKRIT_SHLOKAS.map((s) => s.category)));
    const sources = Array.from(new Set(SANSKRIT_SHLOKAS.map((s) => s.source)));

    return NextResponse.json({
      success: true,
      count: verses.length,
      categories,
      sources,
      verses,
    });
  } catch (error) {
    console.error("GET /api/sanskrit/verses error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch Sanskrit verses" },
      { status: 500 }
    );
  }
}
