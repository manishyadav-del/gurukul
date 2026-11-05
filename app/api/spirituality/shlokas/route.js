import { NextResponse } from "next/server";
import { queryShlokas, SANSKRIT_SHLOKAS } from "@/server/spirituality/sanskritShlokas.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const category = searchParams.get("category") || "ALL";
    const source = searchParams.get("source") || "ALL";
    const id = searchParams.get("id");

    if (id) {
      const found = SANSKRIT_SHLOKAS.find((s) => s.id === id);
      if (!found) {
        return NextResponse.json(
          { success: false, error: "Shloka not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, shloka: found });
    }

    const results = queryShlokas({ query, category, source });

    const categories = Array.from(new Set(SANSKRIT_SHLOKAS.map((s) => s.category)));
    const sources = Array.from(new Set(SANSKRIT_SHLOKAS.map((s) => s.source)));

    return NextResponse.json({
      success: true,
      count: results.length,
      categories,
      sources,
      shlokas: results,
    });
  } catch (error) {
    console.error("Shlokas API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Sanskrit Shlokas" },
      { status: 500 }
    );
  }
}
