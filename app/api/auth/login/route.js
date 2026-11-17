import { NextResponse } from "next/server.js";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma.js";
import { logger } from "@/server/monitoring/logger.js";
import {
  applyRateLimit,
  RATE_LIMIT_TIERS,
  recordAuthFailure,
  resetAuthLimit,
} from "@/server/security/rateLimiter.js";
import { apiSuccess, apiError } from "@/server/security/apiResponse.js";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return apiError("Email and password are required", 400, "MISSING_CREDENTIALS", request);
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // 1. Rate Limiting Protection (Brute-force defense)
    const rateLimitResponse = applyRateLimit(
      request,
      RATE_LIMIT_TIERS.AUTH,
      normalizedEmail
    );
    if (rateLimitResponse) return rateLimitResponse;

    // 2. Fetch User Record
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // 3. Strict Password Verification (Prevents unhashed account bypass)
    if (!user || !user.passwordHash) {
      recordAuthFailure(normalizedEmail);
      logger.warn("Direct login failed: account not found or has no password set", {
        email: normalizedEmail,
      });
      return apiError("Invalid email or password", 401, "INVALID_CREDENTIALS", request);
    }

    const isValid = await bcrypt.compare(String(password), user.passwordHash);
    if (!isValid) {
      recordAuthFailure(normalizedEmail);
      logger.warn("Direct login failed: incorrect password", {
        email: normalizedEmail,
        userId: user.id,
      });
      return apiError("Invalid email or password", 401, "INVALID_CREDENTIALS", request);
    }

    // 4. Reset rate limit counters on success
    resetAuthLimit(normalizedEmail);

    logger.info("Direct API login successful", { userId: user.id, email: user.email });

    return apiSuccess(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          level: user.level,
          totalXp: user.totalXp,
        },
      },
      200,
      {},
      request
    );
  } catch (error) {
    logger.error("Login API exception", { error: error.message, stack: error.stack });
    return apiError(error, 500, "AUTH_SYSTEM_ERROR", request);
  }
}
