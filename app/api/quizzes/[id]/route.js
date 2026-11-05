import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { canManageBooks } from "@/lib/permissions";
import { getQuiz } from "@/server/learning/quizzes";

// GET /api/quizzes/[id]
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(request);
    const { searchParams } = new URL(request.url);

    const isPrivileged = user && canManageBooks(user);
    const includeAnswers = isPrivileged && searchParams.get("includeAnswers") === "true";

    const quiz = await getQuiz(id, { includeAnswers });

    // Guardrail: Draft quizzes are only visible to privileged editors
    if (!quiz.isPublished && !isPrivileged) {
      return NextResponse.json(
        { error: "This quiz is currently in draft mode and pending editorial approval." },
        { status: 403 }
      );
    }

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("GET /api/quizzes/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve quiz" },
      { status: error.statusCode || 500 }
    );
  }
}

// PUT /api/quizzes/[id]
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }
    const isPrivileged = user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.role === "QUIZ_ADMIN" || canManageBooks(user);

    if (!isPrivileged) {
      return NextResponse.json({ error: "Forbidden: Admin or Quiz Manager privileges required" }, { status: 403 });
    }

    const body = await request.json();
    const data = {};

    if (body.title) data.title = body.title.trim();
    if (body.description !== undefined) data.description = body.description;
    if (body.difficulty) data.difficulty = body.difficulty.toUpperCase();
    if (body.isPublished !== undefined) data.isPublished = Boolean(body.isPublished);
    if (body.topic !== undefined) data.topic = body.topic;

    const updated = await prisma.quiz.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, quiz: updated });
  } catch (error) {
    console.error("PUT /api/quizzes/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update quiz" },
      { status: 500 }
    );
  }
}

// DELETE /api/quizzes/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }
    const isPrivileged = user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.role === "QUIZ_ADMIN" || canManageBooks(user);

    if (!isPrivileged) {
      return NextResponse.json({ error: "Forbidden: Admin or Quiz Manager privileges required" }, { status: 403 });
    }

    await prisma.quiz.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("DELETE /api/quizzes/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete quiz" },
      { status: 500 }
    );
  }
}
