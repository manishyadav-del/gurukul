import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { canManageBooks } from "@/lib/permissions";
import { createQuiz, listQuizzes } from "@/server/learning/quizzes";

// GET /api/quizzes
export async function GET(request) {
  try {
    const user = await getAuthenticatedUser(request);
    const { searchParams } = new URL(request.url);

    const bookId = searchParams.get("bookId");
    const chapterId = searchParams.get("chapterId");
    const topic = searchParams.get("topic");
    const difficulty = searchParams.get("difficulty");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const isPrivileged = user && canManageBooks(user);
    const includeUnpublished = isPrivileged && searchParams.get("includeDrafts") === "true";

    const result = await listQuizzes({
      bookId,
      chapterId,
      topic,
      difficulty,
      includeUnpublished,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/quizzes error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list quizzes" },
      { status: 500 }
    );
  }
}

// POST /api/quizzes
export async function POST(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }
    const isPrivileged = user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.role === "QUIZ_ADMIN" || user.role === "EDITOR" || user.role === "EXPERT" || canManageBooks(user);
    if (!isPrivileged) {
      return NextResponse.json({ error: "Forbidden: Admin, Editor, or Expert privileges required" }, { status: 403 });
    }

    const body = await request.json();
    const quiz = await createQuiz({
      title: body.title,
      description: body.description,
      bookId: body.bookId,
      chapterId: body.chapterId,
      topic: body.topic,
      difficulty: body.difficulty,
      isPublished: body.isPublished !== undefined ? body.isPublished : false,
      questions: body.questions,
    });

    return NextResponse.json({ success: true, quiz }, { status: 201 });
  } catch (error) {
    console.error("POST /api/quizzes error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create quiz" },
      { status: error.statusCode || 500 }
    );
  }
}
