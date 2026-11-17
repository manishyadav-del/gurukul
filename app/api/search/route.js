import { NextResponse } from "next/server";
import { searchSchema } from "@/lib/validation";
import { searchContent } from "@/lib/search";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { applyRateLimit, RATE_LIMIT_TIERS } from "@/server/security/rateLimiter";
import { apiError } from "@/server/security/apiResponse";

// GET /api/search?q=jupiter&page=1&limit=20&language=Sanskrit&bookId=...&type=VERSE
export async function GET(request) {
  // Apply rate limit protection
  const rateLimitResponse = applyRateLimit(request, RATE_LIMIT_TIERS.SEARCH);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const page = searchParams.get("page") || 1;
    const limit = searchParams.get("limit") || 20;
    const language = searchParams.get("language") || undefined;
    const bookId = searchParams.get("bookId") || undefined;
    const author = searchParams.get("author") || undefined;
    const subject = searchParams.get("subject") || undefined;
    const mode = searchParams.get("mode") || undefined;
    const passageType = searchParams.get("passageType") || searchParams.get("type") || undefined;

    const chapterId = searchParams.get("chapterId") || undefined;
    const ocrStatus = searchParams.get("ocrStatus") || undefined;
    const hasSearchableText = searchParams.get("hasSearchableText") || undefined;

    const parsed = searchSchema.safeParse({
      q,
      page,
      limit,
      language,
      bookId,
      chapterId,
      author,
      subject,
      mode,
      passageType,
      ocrStatus,
      hasSearchableText,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid search parameters", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const user = await getAuthenticatedUser(request);

    const {
      q: query,
      page: validPage,
      limit: validLimit,
      language: validLang,
      bookId: validBookId,
      chapterId: validChapterId,
      author: validAuthor,
      subject: validSubject,
      mode: validMode,
      passageType: validType,
      ocrStatus: validOcrStatus,
      hasSearchableText: validHasSearchableText,
    } = parsed.data;

    const searchResults = await searchContent({
      query,
      page: validPage,
      limit: validLimit,
      language: validLang,
      bookId: validBookId,
      chapterId: validChapterId,
      author: validAuthor,
      subject: validSubject,
      mode: validMode,
      passageType: validType,
      ocrStatus: validOcrStatus,
      hasSearchableText: validHasSearchableText,
      user,
    });

    return NextResponse.json(searchResults);
  } catch (error) {
    return apiError(error, 500, "SEARCH_FAILED", request);
  }
}
