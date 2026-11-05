/**
 * Gurukul Admin Audit Logging Engine
 * Records immutable, queryable administrative actions with sanitized details.
 */

import prisma from "../../lib/prisma.js";

const SANITIZED_KEYS = [
  "password",
  "passwordHash",
  "currentPassword",
  "newPassword",
  "token",
  "tokenHash",
  "secret",
  "refreshToken",
  "accessToken",
  "apiKey",
];

function sanitizePayload(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitizePayload);

  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SANITIZED_KEYS.some((s) => lowerKey.includes(s.toLowerCase()))) {
      clean[key] = "[REDACTED]";
    } else if (val && typeof val === "object") {
      clean[key] = sanitizePayload(val);
    } else {
      clean[key] = val;
    }
  }
  return clean;
}

/**
 * Persists an administrative activity log entry.
 *
 * @param {Object} entry
 * @param {string} [entry.actorId]
 * @param {string} entry.actorEmail
 * @param {string} entry.actorRole
 * @param {string} entry.action
 * @param {string} entry.targetResource
 * @param {string} [entry.targetId]
 * @param {string} [entry.status="SUCCESS"]
 * @param {Object} [entry.details]
 * @param {string} [entry.ipAddress]
 * @param {string} [entry.userAgent]
 */
export async function logAdminActivity({
  actorId = null,
  actorEmail,
  actorRole = "ADMIN",
  action,
  targetResource,
  targetId = null,
  status = "SUCCESS",
  details = null,
  ipAddress = null,
  userAgent = null,
}) {
  try {
    const sanitizedDetails = details ? sanitizePayload(details) : null;

    return await prisma.adminAuditLog.create({
      data: {
        actorId,
        actorEmail: actorEmail || "system@gurukul.internal",
        actorRole: String(actorRole),
        action,
        targetResource,
        targetId: targetId ? String(targetId) : null,
        status,
        details: sanitizedDetails,
        ipAddress: ipAddress ? String(ipAddress).slice(0, 100) : null,
        userAgent: userAgent ? String(userAgent).slice(0, 500) : null,
      },
    });
  } catch (err) {
    console.error("Failed to write admin audit log:", err);
    // Non-blocking for primary administrative flow, but logged to stderr
    return null;
  }
}
