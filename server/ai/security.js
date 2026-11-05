/**
 * Security, Authorization & Reliability Guardrails for AI Astrology Services
 * 
 * Implements:
 * - Ownership verification for user birth charts and personal profiles
 * - Input validation and query length constraints
 * - In-memory sliding-window rate limiting per IP / User ID
 * - Prompt injection defense and delimiter sanitization
 * - Controlled timeout execution wrapper
 */

import prisma from "../../lib/prisma.js";

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 40;
const rateLimitMap = new Map();

/**
 * Checks in-memory sliding window rate limits.
 * 
 * @param {string} identifier - User ID or IP address
 * @returns {{ allowed: boolean, remaining: number, resetMs: number }}
 */
export function checkRateLimit(
  identifier,
  maxRequests = MAX_REQUESTS_PER_WINDOW,
  windowMs = RATE_LIMIT_WINDOW_MS
) {
  const now = Date.now();
  const id = identifier || "anonymous";

  if (!rateLimitMap.has(id)) {
    rateLimitMap.set(id, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetMs: windowMs };
  }

  const record = rateLimitMap.get(id);

  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + windowMs;
    return { allowed: true, remaining: maxRequests - 1, resetMs: windowMs };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(0, record.resetAt - now),
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetMs: Math.max(0, record.resetAt - now),
  };
}

/**
 * Validates and sanitizes user input query against prompt injection attacks.
 * 
 * @param {string} rawQuery
 * @returns {{ valid: boolean, sanitized: string, error?: string }}
 */
export function validateAndSanitizeQuery(rawQuery = "") {
  if (typeof rawQuery !== "string") {
    return { valid: false, sanitized: "", error: "Query must be a string." };
  }

  const trimmed = rawQuery.trim();
  if (!trimmed) {
    return { valid: false, sanitized: "", error: "Query cannot be empty." };
  }

  if (trimmed.length > 1000) {
    return {
      valid: false,
      sanitized: trimmed.slice(0, 1000),
      error: "Query exceeds maximum permitted length of 1000 characters.",
    };
  }

  // Defend against prompt injection patterns attempting to hijack system role
  const adversarialPatterns = [
    /ignore (all )?(previous|above) instructions/gi,
    /you are now in developer mode/gi,
    /override system prompt/gi,
    /system:\s*role/gi,
    /assistant:\s*ignore/gi,
    /forget constraints/gi,
    /dan mode/gi,
    /jailbreak/gi,
  ];

  let sanitized = trimmed;
  for (const pattern of adversarialPatterns) {
    sanitized = sanitized.replace(pattern, "[sanitized]");
  }

  return { valid: true, sanitized };
}

export const sanitizeAndValidateQuery = validateAndSanitizeQuery;

/**
 * Enforces ownership and authorization for user birth profiles and charts.
 * Prevents unauthorized access or leakage across users.
 * 
 * @param {string} profileId
 * @param {Object|string} user - Requesting user object or user ID
 * @returns {Promise<boolean>} True if authorized
 */
export async function verifyChartOwnership(profileId, user) {
  if (!profileId) return true; // No chart requested
  const userId = typeof user === "string" ? user : user?.id;
  const userRole = typeof user === "object" ? user?.role : null;
  if (!userId) return false; // Private charts require authentication

  // Admins are authorized
  if (userRole === "ADMIN") return true;

  try {
    const profile = await prisma.birthProfile.findUnique({
      where: { id: profileId },
      select: { userId: true },
    });

    if (!profile) return false;
    return profile.userId === userId;
  } catch (err) {
    console.error("[Security] Error verifying chart ownership:", err);
    return false;
  }
}

/**
 * Wraps an asynchronous task with a strict timeout.
 * 
 * @param {Promise} promise
 * @param {number} timeoutMs
 * @param {string} [timeoutMessage="Operation timed out"]
 * @returns {Promise}
 */
export function withTimeout(promise, timeoutMs = 12000, timeoutMessage = "Operation timed out") {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    ),
  ]);
}

