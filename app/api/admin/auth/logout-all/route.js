import { NextResponse } from "next/server";
import {
  revokeAllUserAdminSessions,
  COOKIE_ACCESS_NAME,
  COOKIE_REFRESH_NAME,
  getAuthenticatedAdmin,
} from "@/server/admin/auth";
import { logAdminActivity } from "@/server/admin/audit";

export async function POST(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized. Administrator session required." },
        { status: 401 }
      );
    }

    await revokeAllUserAdminSessions(admin.user.id, "LOGOUT_ALL");

    await logAdminActivity({
      actorId: admin.user.id,
      actorEmail: admin.user.email,
      actorRole: admin.role,
      action: "AUTH_LOGOUT_ALL",
      targetResource: "AdminSession",
      status: "SUCCESS",
      details: { userId: admin.user.id },
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    const response = NextResponse.json({
      success: true,
      message: "All active administrative sessions revoked successfully",
    });

    response.cookies.delete(COOKIE_ACCESS_NAME);
    response.cookies.delete(COOKIE_REFRESH_NAME);

    return response;
  } catch (error) {
    console.error("Admin logout-all error:", error);
    return NextResponse.json(
      { error: "Failed to revoke all sessions" },
      { status: 500 }
    );
  }
}
