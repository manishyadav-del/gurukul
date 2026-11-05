import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { askResearchQuestion } from "@/server/ai/researchAssistant";

// POST /api/research/assistant
export async function POST(request) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();

    const {
      query,
      bookIds = [],
      subject = null,
      language = "en",
    } = body || {};

    if (!query || !query.trim()) {
      return NextResponse.json(
        { error: "Research query is required." },
        { status: 400 }
      );
    }

    const result = await askResearchQuestion({
      query: query.trim(),
      bookIds: Array.isArray(bookIds) ? bookIds : [],
      subject,
      language,
      user,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/research/assistant error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process research inquiry." },
      { status: 500 }
    );
  }
}
