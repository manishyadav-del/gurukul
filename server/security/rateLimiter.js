/**
 * Gurukul Adaptive Sliding-Window Rate Limiter
 * 
 * Provides defense against:
 * - Brute-force credential stuffing on authentication endpoints
 * - Denial-of-Service (DoS) and API request flooding
 * - Excessive resource consumption on expensive search and AI RAG endpoints
 * 
 * Automatically manages memory via periodic garbage collection of expired buckets.
 */

import { NextResponse } from "next/server.js";

// In-memory sliding log / token bucket storage
const rateLimitStore = new Map();

// Configuration presets per API category
export const RATE_LIMIT_TIERS = {
  // Strict: 5 failed or total attempts per 15 mins for login / auth
  AUTH: {
    max: 5,
    windowSec: 15 * 60,
    tierName: "AUTH",
  },
  // Sensitive Mutations: 30 requests per minute (books upload, review submissions)
  MUTATION: {
    max: 30,
    windowSec: 60,
    tierName: "MUTATION",
  },
  // Heavy RAG & Astrological Calculations: 40 requests per minute
  AI_RESEARCH: {
    max: 40,
    windowSec: 60,
    tierName: "AI_RESEARCH",
  },
  // Multilingual Full-Text Search: 80 requests per minute
  SEARCH: {
    max: 80,
    windowSec: 60,
    tierName: "SEARCH",
  },
  // General Read APIs: 150 requests per minute
  GENERAL: {
    max: 150,
    windowSec: 60,
    tierName: "GENERAL",
  },
};

/**
 * Extracts a robust client IP from request headers.
 */
export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "127.0.0.1";
}

/**
 * Periodically cleans up expired keys every 5 minutes to prevent memory growth.
 */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function purgeExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Checks and increments rate limit for a given key and tier.
 * 
 * @param {string} identifier - Unique client key (IP, user ID, or composite)
 * @param {Object} tierConfig - Configuration from RATE_LIMIT_TIERS
 * @returns {{ allowed: boolean, limit: number, remaining: number, resetSec: number }}
 */
export function checkRateLimit(identifier, tierConfig = RATE_LIMIT_TIERS.GENERAL) {
  purgeExpiredEntries();

  const now = Date.now();
  const windowMs = tierConfig.windowSec * 1000;
  const key = `${tierConfig.tierName}:${identifier}`;

  let record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, record);
    return {
      allowed: true,
      limit: tierConfig.max,
      remaining: tierConfig.max - 1,
      resetSec: tierConfig.windowSec,
    };
  }

  record.count += 1;
  const remaining = Math.max(0, tierConfig.max - record.count);
  const resetSec = Math.ceil((record.resetTime - now) / 1000);

  if (record.count > tierConfig.max) {
    return {
      allowed: false,
      limit: tierConfig.max,
      remaining: 0,
      resetSec,
    };
  }

  return {
    allowed: true,
    limit: tierConfig.max,
    remaining,
    resetSec,
  };
}

/**
 * Helper to record failed attempts specifically for auth tiers.
 */
export function recordAuthFailure(identifier) {
  const tierConfig = RATE_LIMIT_TIERS.AUTH;
  const key = `${tierConfig.tierName}:${identifier}`;
  const now = Date.now();
  const windowMs = tierConfig.windowSec * 1000;

  let record = rateLimitStore.get(key);
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
  } else {
    record.count += 1;
  }
  rateLimitStore.set(key, record);
}

/**
 * Helper to reset auth attempts upon successful login.
 */
export function resetAuthLimit(identifier) {
  const key = `${RATE_LIMIT_TIERS.AUTH.tierName}:${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Express / Next.js Route Handler guard.
 * Returns null if allowed, or a pre-configured 429 Response if rate limit is exceeded.
 * 
 * @param {Request} request
 * @param {Object} tierConfig
 * @param {string} [customSuffix]
 * @returns {NextResponse|null}
 */
export function applyRateLimit(request, tierConfig = RATE_LIMIT_TIERS.GENERAL, customSuffix = "") {
  const ip = getClientIp(request);
  const identifier = customSuffix ? `${ip}:${customSuffix}` : ip;
  const result = checkRateLimit(identifier, tierConfig);

  if (!result.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "Too Many Requests",
        message: `Rate limit exceeded for this endpoint. Please retry in ${result.resetSec} seconds.`,
        retryAfter: result.resetSec,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.resetSec),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(result.resetSec),
        },
      }
    );
  }

  return null;
}
