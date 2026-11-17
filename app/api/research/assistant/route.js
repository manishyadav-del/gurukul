import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { askResearchQuestion } from "@/server/ai/researchAssistant";
import { applyRateLimit, RATE_LIMIT_TIERS } from "@/server/security/rateLimiter";
import { apiError } from "@/server/security/apiResponse";

// POST /api/research/assistant
export async function POST(request) {
  try {
    const rateLimitResponse = applyRateLimit(request, RATE_LIMIT_TIERS.AI_RESEARCH);
    if (rateLimitResponse) return rateLimitResponse;

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
    return apiError(err, 500, "RESEARCH_ASSISTANT_FAILED", request);
  }
}
