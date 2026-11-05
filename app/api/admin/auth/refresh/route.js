import { NextResponse } from "next/server";
import {
  rotateAdminSession,
  COOKIE_ACCESS_NAME,
  COOKIE_REFRESH_NAME,
  getAdminCookieOptions,
} from "@/server/admin/auth";

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "unknown";

  try {
    let rawRefreshToken = request.cookies.get(COOKIE_REFRESH_NAME)?.value;

    if (!rawRefreshToken) {
      try {
        const body = await request.json();
        rawRefreshToken = body?.refreshToken;
      } catch {}
    }

    if (!rawRefreshToken) {
      return NextResponse.json(
        { error: "Refresh token is missing" },
        { status: 400 }
      );
    }

    const rotation = await rotateAdminSession(rawRefreshToken, {
      ipAddress: ip,
      userAgent,
    });

    if (!rotation.success) {
      const response = NextResponse.json(
        { error: rotation.error, reuseDetected: Boolean(rotation.reuseDetected) },
        { status: rotation.status || 401 }
      );
      // Clear cookies on invalid or compromised tokens
      response.cookies.delete(COOKIE_ACCESS_NAME);
      response.cookies.delete(COOKIE_REFRESH_NAME);
      return response;
    }

    const response = NextResponse.json({
      success: true,
      message: "Admin tokens rotated successfully",
      user: {
        id: rotation.user.id,
        name: rotation.user.name,
        email: rotation.user.email,
        role: rotation.user.role,
        permissions: rotation.permissions,
      },
    });

    response.cookies.set(
      COOKIE_ACCESS_NAME,
      rotation.accessToken,
      getAdminCookieOptions(15 * 60)
    );
    response.cookies.set(
      COOKIE_REFRESH_NAME,
      rotation.refreshToken,
      getAdminCookieOptions(7 * 24 * 60 * 60)
    );

    return response;
  } catch (error) {
    console.error("Admin refresh error:", error);
    return NextResponse.json(
      { error: "Token refresh service failed" },
      { status: 500 }
    );
  }
}
