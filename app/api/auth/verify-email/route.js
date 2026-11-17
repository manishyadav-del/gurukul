import { NextResponse } from "next/server";
import { verifyEmailOtp } from "@/server/email/emailService";
import { logger } from "@/server/monitoring/logger";

// POST /api/auth/verify-email
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, otpCode } = body || {};

    if (!email || !otpCode) {
      return NextResponse.json(
        { error: "Email and 6-digit verification code are required" },
        { status: 400 }
      );
    }

    const result = await verifyEmailOtp(email, otpCode);

    logger.info("Email verification successful", {
      userId: result.user.id,
      email: result.user.email,
    });

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Email address verified successfully. Welcome to Gurukul!",
      user: result.user,
    });
  } catch (error) {
    logger.warn("Email verification failed", { error: error.message });
    return NextResponse.json(
      { error: error.message || "Failed to verify email" },
      { status: 400 }
    );
  }
}
