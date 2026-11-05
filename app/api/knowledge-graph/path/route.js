import { NextResponse } from "next/server";
import { findPathBetweenConcepts } from "@/server/knowledge/knowledgeGraph";

// GET /api/knowledge-graph/path?start=...&end=...&maxDepth=...
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start") || searchParams.get("source");
    const end = searchParams.get("end") || searchParams.get("target");
    const maxDepth = Math.min(Math.max(parseInt(searchParams.get("maxDepth") || "4", 10), 1), 6);
    const maxPaths = Math.min(Math.max(parseInt(searchParams.get("maxPaths") || "1", 10), 1), 3);

    if (!start || !end) {
      return NextResponse.json(
        { error: "Both 'start' and 'end' concept parameters are required." },
        { status: 400 }
      );
    }

    const pathResult = await findPathBetweenConcepts(start, end, { maxDepth, maxPaths });
    return NextResponse.json(pathResult);
  } catch (err) {
    console.error("GET /api/knowledge-graph/path error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to find path between concepts." },
      { status: 500 }
    );
  }
}
