import { NextResponse } from "next/server";
import { getKnowledgeGraph } from "@/server/knowledge/knowledgeGraph";
import { getAuthenticatedUser } from "@/server/security/authGuard";

// GET /api/knowledge-graph?category=...&subCategory=...&search=...&limit=...&center=...
export async function GET(request) {
  try {
    const user = await getAuthenticatedUser(request);
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category") || null;
    const subCategory = searchParams.get("subCategory") || null;
    const search = searchParams.get("search") || null;
    const centerConceptId = searchParams.get("center") || searchParams.get("centerConceptId") || null;
    const pathStart = searchParams.get("pathStart") || searchParams.get("start") || null;
    const pathEnd = searchParams.get("pathEnd") || searchParams.get("end") || null;
    const scripture = searchParams.get("scripture") || null;
    const limit = Math.min(parseInt(searchParams.get("limit") || "40", 10), 100);
    const depth = Math.min(parseInt(searchParams.get("depth") || "1", 10), 3);

    const graph = await getKnowledgeGraph({
      category,
      subCategory,
      search,
      centerConceptId,
      pathStart,
      pathEnd,
      scripture,
      limit,
      depth,
      user,
    });

    return NextResponse.json(graph);
  } catch (err) {
    console.error("GET /api/knowledge-graph error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve knowledge graph." },
      { status: 500 }
    );
  }
}
