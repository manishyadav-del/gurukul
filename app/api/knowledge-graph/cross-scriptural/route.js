import { NextResponse } from "next/server";
import { getCrossScripturalComparison } from "@/server/knowledge/knowledgeGraph";

// GET /api/knowledge-graph/cross-scriptural?concept=...
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const concept = searchParams.get("concept") || searchParams.get("slug") || searchParams.get("id");

    if (!concept) {
      return NextResponse.json(
        { error: "'concept' parameter (ID or slug) is required." },
        { status: 400 }
      );
    }

    const comparison = await getCrossScripturalComparison(concept);
    return NextResponse.json(comparison);
  } catch (err) {
    console.error("GET /api/knowledge-graph/cross-scriptural error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve cross-scriptural intelligence." },
      { status: 500 }
    );
  }
}
