/**
 * Production Authentication & Authorization Guard for Gurukul
 * 
 * Enforces:
 * - Server-side session verification via NextAuth JWT
 * - Rejection of spoofed client-provided headers (x-user-id, x-user-role) in production
 * - Role-Based Access Control (RBAC) for Admin, Editor, Proofreader, Expert, User
 * - Publication status guardrails protecting unpublished manuscripts
 */

import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth.js";
import { canManageBooks, canReviewBooks, canPublishBooks, canProcessOcr, ROLES } from "../../lib/permissions.js";
import { getAuthenticatedAdmin } from "../admin/auth.js";

/**
 * Extracts the verified authenticated user from:
 * 1. Admin signed JWT (gurukul_admin_access cookie or Authorization Bearer)
 * 2. NextAuth signed server session
 * 3. Verified internal service secret (x-internal-secret)
 * 
 * In production and normal operation, client headers cannot be used to forge roles.
 * 
 * @param {Request} request
 * @returns {Promise<Object|null>} Verified user object or null
 */
export async function getAuthenticatedUser(request) {
  // 1. Check Admin JWT access token / session
  try {
    const admin = await getAuthenticatedAdmin(request);
    if (admin && admin.user?.id) {
      return {
        id: admin.user.id,
        email: admin.user.email,
        name: admin.user.name,
        role: admin.user.role || ROLES.USER,
        permissions: admin.permissions || [],
        isAdmin: true,
      };
    }
  } catch (err) {
    // Continue to check NextAuth session
  }

  // 2. Check cryptographically signed NextAuth session
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role || ROLES.USER,
        permissions: [],
      };
    }
  } catch (err) {
    // Session retrieval error
  }

  // 3. Check Internal Secret Header for Server-to-Server Workers or CLI scripts
  const internalSecret = request.headers.get("x-internal-secret");
  const configuredSecret = process.env.INTERNAL_API_SECRET || process.env.ADMIN_API_KEY;
  if (configuredSecret && internalSecret && internalSecret === configuredSecret) {
    const serviceRole = request.headers.get("x-service-role") || ROLES.ADMIN;
    const serviceUserId = request.headers.get("x-service-id") || "system-internal-worker";
    return {
      id: serviceUserId,
      email: "worker@gurukul.internal",
      name: "Gurukul Internal Service",
      role: serviceRole,
      isInternalService: true,
    };
  }

  // 4. Automated Test Suite Bridge (Strictly disabled in production)
  if (process.env.NODE_ENV === "test") {
    const testUserId = request.headers.get("x-user-id") || request.headers.get("x-test-user-id");
    const testRole = request.headers.get("x-user-role") || request.headers.get("x-test-user-role");
    if (testUserId) {
      return {
        id: testUserId,
        email: `test_${testUserId}@gurukul.local`,
        name: "Test Runner User",
        role: testRole || ROLES.USER,
      };
    }
  }

  return null;
}

/**
 * Requires an authenticated user. Returns 401 if unauthenticated.
 * 
 * @param {Request} request
 * @returns {Promise<{ user: Object } | { errorResponse: Response }>}
 */
export async function requireAuth(request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return {
      errorResponse: Response.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      ),
    };
  }
  return { user };
}

/**
 * Requires specific user roles. Returns 401 or 403.
 * 
 * @param {Request} request
 * @param {Array<string>} allowedRoles
 * @returns {Promise<{ user: Object } | { errorResponse: Response }>}
 */
export async function requireRole(request, allowedRoles = [ROLES.ADMIN]) {
  const auth = await requireAuth(request);
  if (auth.errorResponse) return auth;

  const { user } = auth;
  const isSuperOrAdmin = user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ADMIN;
  const isAllowed = allowedRoles.includes(user.role) || isSuperOrAdmin;

  if (!isAllowed) {
    return {
      errorResponse: Response.json(
        { error: `Forbidden: Requires one of roles [${allowedRoles.join(", ")}]` },
        { status: 403 }
      ),
    };
  }

  return { user };
}

/**
 * Requires permission to review / proofread books and pages.
 */
export async function requireReviewPermission(request) {
  const auth = await requireAuth(request);
  if (auth.errorResponse) return auth;

  if (!canReviewBooks(auth.user)) {
    return {
      errorResponse: Response.json(
        { error: "Forbidden: Review or Proofreader permission required" },
        { status: 403 }
      ),
    };
  }

  return auth;
}

/**
 * Requires permission to manage books (create, edit, delete, structure, process).
 */
export async function requireManagePermission(request) {
  const auth = await requireAuth(request);
  if (auth.errorResponse) return auth;

  if (!canManageBooks(auth.user)) {
    return {
      errorResponse: Response.json(
        { error: "Forbidden: Book management permission required" },
        { status: 403 }
      ),
    };
  }

  return auth;
}

/**
 * Requires permission to publish books.
 */
export async function requirePublishPermission(request) {
  const auth = await requireAuth(request);
  if (auth.errorResponse) return auth;

  if (!canPublishBooks(auth.user)) {
    return {
      errorResponse: Response.json(
        { error: "Forbidden: Book publication permission required" },
        { status: 403 }
      ),
    };
  }

  return auth;
}

/**
 * Requires permission to run or retry OCR jobs.
 */
export async function requireOcrPermission(request) {
  const auth = await requireAuth(request);
  if (auth.errorResponse) return auth;

  if (!canProcessOcr(auth.user)) {
    return {
      errorResponse: Response.json(
        { error: "Forbidden: OCR operations permission required" },
        { status: 403 }
      ),
    };
  }

  return auth;
}

/**
 * Ensures public users can only query published books.
 * Staff/Admins can query draft or proofread books if authorized.
 * 
 * @param {Object} baseWhere - Prisma query where object
 * @param {Object|null} user - Authenticated user object
 * @returns {Object} Secure where clause
 */
export function secureBookWhereClause(baseWhere = {}, user = null) {
  const isPrivileged = user && canManageBooks(user);

  if (isPrivileged) {
    return baseWhere;
  }

  // Enforce strictly PUBLISHED status for unauthenticated or normal user queries
  return {
    ...baseWhere,
    status: "PUBLISHED",
  };
}
