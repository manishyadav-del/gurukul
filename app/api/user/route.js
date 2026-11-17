import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { isAdminRole } from "@/server/admin/permissions";
import { apiError } from "@/server/security/apiResponse";

// GET /api/user (User profile, reading stats, bookmarks)
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryEmail = searchParams.get("email");

    // Only administrators may query other users' profiles
    let targetEmail = authUser.email;
    if (queryEmail && queryEmail !== authUser.email) {
      if (isAdminRole(authUser.role)) {
        targetEmail = queryEmail;
      } else {
        return NextResponse.json(
          { error: "Forbidden: Cannot access another user's profile" },
          { status: 403 }
        );
      }
    }

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        bookmarks: {
          include: {
            passage: {
              include: {
                book: { select: { title: true, slug: true } },
                chapter: { select: { title: true, slug: true } },
              },
            },
          },
        },
        notes: {
          take: 5,
          orderBy: { updatedAt: "desc" },
        },
        readingProgress: {
          include: {
            book: { select: { title: true, slug: true, coverUrl: true } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Never leak passwordHash or private credentials
    const { passwordHash, ...safeUser } = user;

    return NextResponse.json(safeUser);
  } catch (error) {
    return apiError(error, 500, "USER_FETCH_FAILED", request);
  }
}
