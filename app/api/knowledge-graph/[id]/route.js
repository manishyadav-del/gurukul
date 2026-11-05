import { NextResponse } from "next/server";
import { getConceptDetails } from "@/server/knowledge/knowledgeGraph";
import { getAuthenticatedUser } from "@/server/security/authGuard";

// GET /api/knowledge-graph/[id]
export async function GET(request, { params }) {
  try {
    const user = await getAuthenticatedUser(request);
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Concept identifier is required." }, { status: 400 });
    }

    const concept = await getConceptDetails(id, user);
    return NextResponse.json({ concept });
  } catch (err) {
    console.error("GET /api/knowledge-graph/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Concept not found." },
      { status: 404 }
    );
  }
}
