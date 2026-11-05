/**
 * Gurukul Admin Authentication Engine
 * Implements short-lived access tokens, hashed rotating refresh tokens,
 * token reuse detection (family invalidation), and RBAC validation.
 */

import crypto from "crypto";
import prisma from "../../lib/prisma.js";
import {
  isAdminRole,
  getPermissionsForRole,
  hasPermission,
  ADMIN_ROLES,
} from "./permissions.js";
import { logAdminActivity } from "./audit.js";

const ACCESS_TOKEN_SECRET =
  process.env.ADMIN_JWT_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "gurukul-admin-secret-access-token-key-32chars";

const ACCESS_TOKEN_MAX_AGE_SEC = 15 * 60; // 15 minutes
const REFRESH_TOKEN_MAX_AGE_SEC = 7 * 24 * 60 * 60; // 7 days

export const COOKIE_ACCESS_NAME = "gurukul_admin_access";
export const COOKIE_REFRESH_NAME = "gurukul_admin_refresh";

/**
 * Base64URL encoding/decoding helpers
 */
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64").toString("utf-8");
}

/**
 * Generates a signed RFC 7519 HMAC-SHA256 JWT access token
 */
export function createAccessToken(user, sessionId) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const permissions = getPermissionsForRole(user.role);

  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions,
    sessionId,
    iat: now,
    exp: now + ACCESS_TOKEN_MAX_AGE_SEC,
    iss: "gurukul-admin",
    aud: "gurukul-admin-dashboard",
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", ACCESS_TOKEN_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verifies and parses a signed JWT access token
 */
export function verifyAccessToken(token) {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;

  const expectedSignature = crypto
    .createHmac("sha256", ACCESS_TOKEN_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  // Constant-time comparison
  if (signature.length !== expectedSignature.length) return null;
  const isMatch = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
  if (!isMatch) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }
    if (payload.iss !== "gurukul-admin" || payload.aud !== "gurukul-admin-dashboard") {
      return null; // Invalid claims
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Computes SHA-256 hash of refresh token
 */
export function hashRefreshToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Creates an admin session with a cryptographically secure refresh token
 */
export async function createAdminSession({
  userId,
  ipAddress = null,
  userAgent = null,
  existingFamilyId = null,
}) {
  const rawRefreshToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashRefreshToken(rawRefreshToken);
  const familyId = existingFamilyId || crypto.randomUUID();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_SEC * 1000);

  const session = await prisma.adminSession.create({
    data: {
      userId,
      tokenHash,
      familyId,
      ipAddress,
      userAgent,
      expiresAt,
      lastUsedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
      },
    },
  });

  const accessToken = createAccessToken(session.user, session.id);

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    session,
    user: session.user,
  };
}

/**
 * Rotates a refresh token with automatic reuse detection
 */
export async function rotateAdminSession(rawRefreshToken, { ipAddress, userAgent }) {
  if (!rawRefreshToken) {
    return { success: false, error: "Missing refresh token", status: 400 };
  }

  const tokenHash = hashRefreshToken(rawRefreshToken);
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
      },
    },
  });

  if (!session) {
    return { success: false, error: "Invalid refresh token", status: 401 };
  }

  // 1. REUSE DETECTION: If token was already revoked, terminate the entire family!
  if (session.isRevoked) {
    await prisma.adminSession.updateMany({
      where: { familyId: session.familyId },
      data: {
        isRevoked: true,
        revokedReason: "REUSE_DETECTED",
      },
    });

    await logAdminActivity({
      actorId: session.userId,
      actorEmail: session.user?.email || "unknown",
      actorRole: session.user?.role || "UNKNOWN",
      action: "SECURITY_ALERT_TOKEN_REUSE",
      targetResource: "AdminSession",
      targetId: session.id,
      status: "FORBIDDEN",
      details: {
        familyId: session.familyId,
        revokedReason: session.revokedReason,
        detectedIp: ipAddress,
      },
      ipAddress,
      userAgent,
    });

    return {
      success: false,
      error: "Security alert: Refresh token reuse detected. All active sessions have been terminated.",
      status: 401,
      reuseDetected: true,
    };
  }

  // 2. EXPIRATION CHECK
  if (new Date() > new Date(session.expiresAt)) {
    await prisma.adminSession.update({
      where: { id: session.id },
      data: { isRevoked: true, revokedReason: "EXPIRED" },
    });
    return { success: false, error: "Refresh token has expired", status: 401 };
  }

  // 3. USER STATUS CHECK
  if (!session.user || session.user.isActive === false) {
    return { success: false, error: "Account has been deactivated", status: 403 };
  }

  // 4. ATOMIC ROTATION: Revoke old token and issue new token in same family
  const nextRawRefreshToken = crypto.randomBytes(32).toString("hex");
  const nextTokenHash = hashRefreshToken(nextRawRefreshToken);
  const nextExpiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_SEC * 1000);

  const [_, newSession] = await prisma.$transaction([
    prisma.adminSession.update({
      where: { id: session.id },
      data: {
        isRevoked: true,
        revokedReason: "ROTATED",
      },
    }),
    prisma.adminSession.create({
      data: {
        userId: session.userId,
        tokenHash: nextTokenHash,
        familyId: session.familyId,
        ipAddress: ipAddress || session.ipAddress,
        userAgent: userAgent || session.userAgent,
        expiresAt: nextExpiresAt,
        lastUsedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    }),
  ]);

  const newAccessToken = createAccessToken(newSession.user, newSession.id);

  return {
    success: true,
    accessToken: newAccessToken,
    refreshToken: nextRawRefreshToken,
    session: newSession,
    user: newSession.user,
    permissions: getPermissionsForRole(newSession.user.role),
  };
}

/**
 * Revokes a single admin session
 */
export async function revokeAdminSession(rawRefreshToken, reason = "LOGOUT") {
  if (!rawRefreshToken) return false;
  const tokenHash = hashRefreshToken(rawRefreshToken);
  try {
    await prisma.adminSession.update({
      where: { tokenHash },
      data: { isRevoked: true, revokedReason: reason },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Revokes all admin sessions for a user (Logout-All / Security Reset)
 */
export async function revokeAllUserAdminSessions(userId, reason = "LOGOUT_ALL") {
  if (!userId) return false;
  try {
    await prisma.adminSession.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true, revokedReason: reason },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Extracts and verifies the current authenticated admin context from:
 * 1. Admin JWT access token cookie (gurukul_admin_access)
 * 2. Authorization: Bearer <token> header
 * 3. Fallback: Active NextAuth session with an administrative role
 */
export async function getAuthenticatedAdmin(request) {
  let token = null;

  // 1. Try reading from request cookies or headers
  if (request?.cookies) {
    if (typeof request.cookies.get === "function") {
      token = request.cookies.get(COOKIE_ACCESS_NAME)?.value;
    } else if (typeof request.cookies === "object") {
      token = request.cookies[COOKIE_ACCESS_NAME];
    }
  }

  if (!token && request?.headers) {
    const authHeader =
      typeof request.headers.get === "function"
        ? request.headers.get("authorization")
        : request.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  // Next.js server component cookie store fallback
  if (!token) {
    try {
      const nextHeaders = await import("next/headers");
      if (nextHeaders && typeof nextHeaders.cookies === "function") {
        const cookieStore = await nextHeaders.cookies();
        token = cookieStore.get(COOKIE_ACCESS_NAME)?.value;
      }
    } catch {}
  }

  // 2. Validate JWT access token
  if (token) {
    const payload = verifyAccessToken(token);
    if (payload && payload.id) {
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          avatarUrl: true,
        },
      });

      if (user && user.isActive !== false && isAdminRole(user.role)) {
        return {
          user,
          role: user.role,
          permissions: getPermissionsForRole(user.role),
          authType: "JWT",
          sessionId: payload.sessionId,
        };
      }
    }
  }

  // 3. Fallback: NextAuth server session
  try {
    const nextAuth = await import("next-auth");
    const { authOptions } = await import("../../lib/auth.js");
    const getServerSession = nextAuth.getServerSession || nextAuth.default?.getServerSession;
    if (getServerSession) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            avatarUrl: true,
          },
        });

        if (user && user.isActive !== false && isAdminRole(user.role)) {
          return {
            user,
            role: user.role,
            permissions: getPermissionsForRole(user.role),
            authType: "NEXTAUTH",
            sessionId: "nextauth-session",
          };
        }
      }
    }
  } catch {}

  return null;
}

/**
 * Server API route authorization guard
 */
export async function requireAdmin(request, requiredPermission = null) {
  const admin = await getAuthenticatedAdmin(request);

  if (!admin) {
    return {
      authorized: false,
      response: Response.json(
        { error: "Unauthorized. Administrator session required." },
        { status: 401 }
      ),
    };
  }

  if (requiredPermission && !hasPermission(admin.role, requiredPermission)) {
    return {
      authorized: false,
      response: Response.json(
        {
          error: `Forbidden. Missing required permission: ${requiredPermission}`,
          requiredPermission,
          role: admin.role,
        },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, admin };
}

/**
 * Cookie options helper
 */
export function getAdminCookieOptions(maxAge) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}
