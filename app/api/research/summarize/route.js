import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { summarizePassage } from "@/server/ai/researchAssistant";

// POST /api/research/summarize
export async function POST(request) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();
    const { passageId, passageText, language = "en" } = body || {};

    if (!passageId && (!passageText || !passageText.trim())) {
      return NextResponse.json(
        { error: "Either passageId or passageText is required." },
        { status: 400 }
      );
    }

    const summary = await summarizePassage({
      passageId,
      passageText,
      language,
      user,
    });

    return NextResponse.json(summary);
  } catch (err) {
    console.error("POST /api/research/summarize error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to summarize passage." },
      { status: 500 }
    );
  }
}
