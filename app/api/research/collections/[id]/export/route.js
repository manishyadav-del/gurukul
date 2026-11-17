import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { exportResearchCollection } from "@/server/research/workspace";

// GET /api/research/collections/[id]/export?format=markdown|bibtex|json
export async function GET(request, { params }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") || "markdown").toLowerCase();

    const { filename, contentType, content } = await exportResearchCollection({
      userId: user.id,
      collectionId: id,
      format,
    });

    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("GET /api/research/collections/[id]/export error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
