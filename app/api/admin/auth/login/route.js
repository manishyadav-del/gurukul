import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import {
  createAdminSession,
  COOKIE_ACCESS_NAME,
  COOKIE_REFRESH_NAME,
  getAdminCookieOptions,
} from "@/server/admin/auth";
import { isAdminRole, getPermissionsForRole } from "@/server/admin/permissions";
import { logAdminActivity } from "@/server/admin/audit";

// In-memory brute-force rate limiter (sliding window)
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(key) {
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record) return { allowed: true };

  if (now > record.resetTime) {
    loginAttempts.delete(key);
    return { allowed: true };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const waitSec = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, waitSec };
  }

  return { allowed: true };
}

function recordFailedAttempt(key) {
  const now = Date.now();
  const record = loginAttempts.get(key) || { count: 0, resetTime: now + LOCKOUT_MS };
  record.count += 1;
  loginAttempts.set(key, record);
}

function clearAttempts(key) {
  loginAttempts.delete(key);
}

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "unknown";

  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const rateLimitKey = `${ip}:${normalizedEmail}`;
    const rateLimit = checkRateLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Please try again in ${rateLimit.waitSec} seconds.`,
        },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Uniform response time / message to prevent account enumeration
    if (!user || !user.passwordHash) {
      recordFailedAttempt(rateLimitKey);
      await logAdminActivity({
        actorEmail: normalizedEmail,
        action: "AUTH_LOGIN_FAILED",
        targetResource: "AdminAuth",
        status: "FAILED",
        details: { reason: "User not found or no password" },
        ipAddress: ip,
        userAgent,
      });
      return NextResponse.json(
        { error: "Invalid administrator credentials" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      recordFailedAttempt(rateLimitKey);
      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: "AUTH_LOGIN_FAILED",
        targetResource: "AdminAuth",
        status: "FAILED",
        details: { reason: "Incorrect password" },
        ipAddress: ip,
        userAgent,
      });
      return NextResponse.json(
        { error: "Invalid administrator credentials" },
        { status: 401 }
      );
    }

    // Verify account active status
    if (user.isActive === false) {
      return NextResponse.json(
        { error: "This administrator account is currently deactivated." },
        { status: 403 }
      );
    }

    // Verify role has administrative clearance
    if (!isAdminRole(user.role)) {
      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: "AUTH_LOGIN_DENIED",
        targetResource: "AdminAuth",
        status: "FORBIDDEN",
        details: { reason: "User lacks administrator privileges", role: user.role },
        ipAddress: ip,
        userAgent,
      });
      return NextResponse.json(
        { error: "Access denied. Administrator clearance required." },
        { status: 403 }
      );
    }

    // Clear rate limiter upon successful authentication
    clearAttempts(rateLimitKey);

    // Create session and rotating tokens
    const { accessToken, refreshToken, session } = await createAdminSession({
      userId: user.id,
      ipAddress: ip,
      userAgent,
    });

    await logAdminActivity({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: "AUTH_LOGIN_SUCCESS",
      targetResource: "AdminAuth",
      targetId: session.id,
      status: "SUCCESS",
      details: { role: user.role, familyId: session.familyId },
      ipAddress: ip,
      userAgent,
    });

    const response = NextResponse.json({
      success: true,
      message: "Admin authentication successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        permissions: getPermissionsForRole(user.role),
      },
    });

    // Set secure HttpOnly cookies
    response.cookies.set(COOKIE_ACCESS_NAME, accessToken, getAdminCookieOptions(15 * 60));
    response.cookies.set(
      COOKIE_REFRESH_NAME,
      refreshToken,
      getAdminCookieOptions(7 * 24 * 60 * 60)
    );

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Authentication service error. Please try again." },
      { status: 500 }
    );
  }
}
