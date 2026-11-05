import { NextResponse } from "next/server";
import { extractAndStorePassageKnowledge } from "@/server/knowledge/knowledgeGraph";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { canManageBooks } from "@/lib/permissions";

// POST /api/knowledge-graph/extract
export async function POST(request) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();

    const { passageId, text, bookId, method, autoApprove } = body;

    if (!passageId && (!text || text.trim().length < 5)) {
      return NextResponse.json(
        { error: "Either passageId or valid text content is required." },
        { status: 400 }
      );
    }

    // Only privileged admins can request autoApprove
    const isPrivileged = user && canManageBooks(user);
    const shouldAutoApprove = Boolean(autoApprove && isPrivileged);

    const result = await extractAndStorePassageKnowledge({
      passageId,
      text,
      bookId,
      method: method || "RULE_BASED_NLP",
      autoApprove: shouldAutoApprove,
      reviewer: user ? (user.name || user.email) : null,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/knowledge-graph/extract error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to execute knowledge extraction pipeline." },
      { status: 500 }
    );
  }
}
