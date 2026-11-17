import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createAndSendVerificationToken } from "@/server/email/emailService";
import { logger } from "@/server/monitoring/logger";

// POST /api/auth/resend-code
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body || {};

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address" },
        { status: 404 }
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json(
        { message: "This email address is already verified. You can sign in directly." },
        { status: 200 }
      );
    }

    await createAndSendVerificationToken(normalizedEmail, user.name);

    logger.info("Resent verification code", { email: normalizedEmail });

    return NextResponse.json({
      success: true,
      message: "A fresh 6-digit verification code has been dispatched to your email address.",
    });
  } catch (error) {
    logger.error("Resend verification code error", error);
    return NextResponse.json(
      { error: error.message || "Failed to resend verification code" },
      { status: 500 }
    );
  }
}
