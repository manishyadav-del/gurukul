import { NextResponse } from "next/server";
import { searchKnowledgeConcepts } from "@/server/knowledge/knowledgeGraph";

// GET /api/knowledge-graph/search?q=...&category=...&limit=...
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || searchParams.get("query") || "";
    const category = searchParams.get("category") || null;
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

    const concepts = await searchKnowledgeConcepts({ query, category, limit });
    return NextResponse.json({ concepts, total: concepts.length });
  } catch (err) {
    console.error("GET /api/knowledge-graph/search error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
