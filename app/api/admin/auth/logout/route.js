import { NextResponse } from "next/server";
import {
  revokeAdminSession,
  COOKIE_ACCESS_NAME,
  COOKIE_REFRESH_NAME,
  getAuthenticatedAdmin,
} from "@/server/admin/auth";
import { logAdminActivity } from "@/server/admin/audit";

export async function POST(request) {
  try {
    const admin = await getAuthenticatedAdmin(request);
    const rawRefreshToken = request.cookies.get(COOKIE_REFRESH_NAME)?.value;

    if (rawRefreshToken) {
      await revokeAdminSession(rawRefreshToken, "LOGOUT");
    }

    if (admin) {
      await logAdminActivity({
        actorId: admin.user.id,
        actorEmail: admin.user.email,
        actorRole: admin.role,
        action: "AUTH_LOGOUT",
        targetResource: "AdminAuth",
        status: "SUCCESS",
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1",
        userAgent: request.headers.get("user-agent") || "unknown",
      });
    }

    const response = NextResponse.json({
      success: true,
      message: "Admin successfully logged out",
    });

    response.cookies.delete(COOKIE_ACCESS_NAME);
    response.cookies.delete(COOKIE_REFRESH_NAME);

    return response;
  } catch (error) {
    console.error("Admin logout error:", error);
    return NextResponse.json(
      { error: "Logout process encountered an error" },
      { status: 500 }
    );
  }
}
