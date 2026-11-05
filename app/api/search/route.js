import { NextResponse } from "next/server";
import { searchSchema } from "@/lib/validation";
import { searchContent } from "@/lib/search";
import { getAuthenticatedUser } from "@/server/security/authGuard";

// GET /api/search?q=jupiter&page=1&limit=20&language=Sanskrit&bookId=...&type=VERSE
export async function GET(request) {
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

    const parsed = searchSchema.safeParse({
      q,
      page,
      limit,
      language,
      bookId,
      author,
      subject,
      mode,
      passageType,
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
      author: validAuthor,
      subject: validSubject,
      mode: validMode,
      passageType: validType,
    } = parsed.data;

    const searchResults = await searchContent({
      query,
      page: validPage,
      limit: validLimit,
      language: validLang,
      bookId: validBookId,
      author: validAuthor,
      subject: validSubject,
      mode: validMode,
      passageType: validType,
      user,
    });

    return NextResponse.json(searchResults);
  } catch (error) {
    console.error("GET /api/search error:", error);
    return NextResponse.json(
      { error: "Search query failed", details: error.message },
      { status: 500 }
    );
  }
}
