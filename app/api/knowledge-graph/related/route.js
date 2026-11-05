import { NextResponse } from "next/server";
import { getConceptDetails } from "@/server/knowledge/knowledgeGraph";
import { getAuthenticatedUser } from "@/server/security/authGuard";

// GET /api/knowledge-graph/related?id=...
export async function GET(request) {
  try {
    const user = await getAuthenticatedUser(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") || searchParams.get("slug");

    if (!id) {
      return NextResponse.json({ error: "id parameter is required." }, { status: 400 });
    }

    const concept = await getConceptDetails(id, user);

    const related = [
      ...(concept.outgoingRelations || []).map((r) => ({
        ...r.targetConcept,
        relationshipType: r.relationshipType,
        title: r.title,
        classicalSource: r.classicalSource,
        tradition: r.tradition,
        direction: "outgoing",
      })),
      ...(concept.incomingRelations || []).map((r) => ({
        ...r.sourceConcept,
        relationshipType: r.relationshipType,
        title: r.title,
        classicalSource: r.classicalSource,
        tradition: r.tradition,
        direction: "incoming",
      })),
    ];

    return NextResponse.json({
      concept: { id: concept.id, slug: concept.slug, name: concept.name },
      related,
      total: related.length,
    });
  } catch (err) {
    console.error("GET /api/knowledge-graph/related error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
