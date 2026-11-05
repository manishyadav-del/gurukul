import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/server/admin/auth";
import { PERMISSIONS } from "@/server/admin/permissions";

export async function GET(request) {
  const auth = await requireAdmin(request, PERMISSIONS.USERS_READ);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    if (!query || query.length < 2) {
      return NextResponse.json({
        query: "",
        results: {
          users: [],
          books: [],
          chapters: [],
          quizzes: [],
          learningModules: [],
          invitations: [],
          actionItems: [],
        },
        totalMatches: 0,
      });
    }

    const [
      users,
      books,
      chapters,
      quizzes,
      learningModules,
      invitations,
      actionItems,
    ] = await Promise.all([
      // 1. Users
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, email: true, role: true },
        take: 5,
      }),

      // 2. Books
      prisma.book.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { author: { contains: query, mode: "insensitive" } },
            { language: { contains: query, mode: "insensitive" } },
          ],
        },
        select: { id: true, title: true, author: true, status: true },
        take: 5,
      }),

      // 3. Chapters
      prisma.chapter.findMany({
        where: {
          title: { contains: query, mode: "insensitive" },
        },
        select: {
          id: true,
          title: true,
          chapterNumber: true,
          book: { select: { id: true, title: true } },
        },
        take: 5,
      }),

      // 4. Quizzes
      prisma.quiz.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { topic: { contains: query, mode: "insensitive" } },
          ],
        },
        select: { id: true, title: true, topic: true, difficulty: true },
        take: 5,
      }),

      // 5. Learning Modules
      prisma.learningModule.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
          ],
        },
        select: { id: true, title: true, category: true, slug: true },
        take: 5,
      }),

      // 6. Invitations
      prisma.familyInvitation.findMany({
        where: {
          invitedEmail: { contains: query, mode: "insensitive" },
        },
        select: { id: true, invitedEmail: true, status: true },
        take: 5,
      }),

      // 7. Action Items
      prisma.adminActionItem.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
          ],
        },
        select: { id: true, title: true, severity: true, actionUrl: true },
        take: 5,
      }),
    ]);

    const totalMatches =
      users.length +
      books.length +
      chapters.length +
      quizzes.length +
      learningModules.length +
      invitations.length +
      actionItems.length;

    return NextResponse.json({
      query,
      results: {
        users,
        books,
        chapters,
        quizzes,
        learningModules,
        invitations,
        actionItems,
      },
      totalMatches,
    });
  } catch (error) {
    console.error("GET /api/admin/search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
