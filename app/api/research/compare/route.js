import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { compareSourcesAcrossBooks } from "@/server/ai/researchAssistant";

// POST /api/research/compare
export async function POST(request) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();

    const {
      bookIds = [],
      topic,
      topicOrQuery,
      language = "en",
    } = body || {};

    const targetTopic = topic || topicOrQuery;

    if (!Array.isArray(bookIds) || bookIds.length < 2) {
      return NextResponse.json(
        { error: "Please select at least two books to compare." },
        { status: 400 }
      );
    }

    if (!targetTopic || !targetTopic.trim()) {
      return NextResponse.json(
        { error: "A topic or concept is required for comparison." },
        { status: 400 }
      );
    }

    const comparison = await compareSourcesAcrossBooks({
      bookIds,
      topicOrQuery: targetTopic.trim(),
      language,
      user,
    });

    return NextResponse.json(comparison);
  } catch (err) {
    console.error("POST /api/research/compare error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to execute source comparison." },
      { status: 500 }
    );
  }
}
