import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/server/admin/auth";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);

    if (!admin) {
      return NextResponse.json(
        { authenticated: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const unreadNotificationsCount = await prisma.adminNotification.count({
      where: { isRead: false },
    });

    return NextResponse.json({
      authenticated: true,
      user: {
        id: admin.user.id,
        name: admin.user.name,
        email: admin.user.email,
        role: admin.role,
        avatarUrl: admin.user.avatarUrl,
        permissions: admin.permissions,
      },
      authType: admin.authType,
      unreadNotificationsCount,
    });
  } catch (error) {
    console.error("Admin /me error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Failed to verify session" },
      { status: 500 }
    );
  }
}
