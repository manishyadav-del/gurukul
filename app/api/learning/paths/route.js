import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import {
  getLearningPathsWithProgress,
  toggleLessonCompletion,
} from "@/server/learning/learningPaths";

// GET /api/learning/paths
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    const paths = await getLearningPathsWithProgress(authUser?.id || null);

    return NextResponse.json({
      success: true,
      paths,
    });
  } catch (error) {
    console.error("GET /api/learning/paths error:", error);
    return NextResponse.json(
      { error: "Failed to fetch learning paths", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/learning/paths - Toggle lesson completion
export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { pathId, lessonId, completed = true } = body;

    if (!pathId || !lessonId) {
      return NextResponse.json(
        { error: "pathId and lessonId are required" },
        { status: 400 }
      );
    }

    const result = await toggleLessonCompletion({
      userId: authUser.id,
      pathId,
      lessonId,
      completed,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/learning/paths error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update learning path progress" },
      { status: 500 }
    );
  }
}
