import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { submitQuizAttempt, getUserQuizAttempts } from "@/server/learning/quizzes";
import prisma from "@/lib/prisma";

// POST /api/quizzes/[id]/attempt
export async function POST(request, { params }) {
  try {
    const { id: quizId } = await params;
    const authUser = await getAuthenticatedUser(request);
    let userId = authUser?.id || null;

    if (!userId) {
      // Find or create guest user to record attempts for anonymous quizzes
      let guestUser = await prisma.user.findFirst({
        where: { email: "guest@gurukul.ai" },
      });
      if (!guestUser) {
        guestUser = await prisma.user.create({
          data: {
            email: "guest@gurukul.ai",
            name: "Gurukul Guest",
            role: "USER",
          },
        });
      }
      userId = guestUser.id;
    }

    const body = await request.json();
    const answers = Array.isArray(body.answers) ? body.answers : [];

    const result = await submitQuizAttempt({
      quizId,
      userId,
      answers,
    });

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error) {
    console.error("POST /api/quizzes/[id]/attempt error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit quiz attempt" },
      { status: error.statusCode || 500 }
    );
  }
}

// GET /api/quizzes/[id]/attempt
export async function GET(request, { params }) {
  try {
    const { id: quizId } = await params;
    const authUser = await getAuthenticatedUser(request);
    const userId = authUser?.id || null;

    if (!userId) {
      return NextResponse.json({ attempts: [] });
    }

    const attempts = await getUserQuizAttempts(userId, quizId);
    return NextResponse.json({ attempts });
  } catch (error) {
    console.error("GET /api/quizzes/[id]/attempt error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch attempt history" },
      { status: 500 }
    );
  }
}
