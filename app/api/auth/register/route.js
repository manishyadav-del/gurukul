import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { logger } from "@/server/monitoring/logger";
import { createAndSendVerificationToken } from "@/server/email/emailService";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, locale = "en", timezone = "Asia/Kolkata" } = body;

    // 1. Validation
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Uniqueness check
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    // 3. Password Hashing
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Create User Record with isEmailVerified: false
    const user = await prisma.user.create({
      data: {
        name: name ? String(name).trim() : null,
        email: normalizedEmail,
        passwordHash,
        role: "USER",
        locale: String(locale).trim(),
        timezone: String(timezone).trim(),
        isEmailVerified: false,
        totalXp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        locale: true,
        timezone: true,
        level: true,
        totalXp: true,
        currentStreak: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // 5. Generate and dispatch Email Verification OTP code
    await createAndSendVerificationToken(normalizedEmail, user.name);

    logger.info("User registered successfully; verification code dispatched", { userId: user.id, email: user.email });

    return NextResponse.json(
      {
        success: true,
        requireVerification: true,
        message: "Verification code sent to your email address. Please enter the 6-digit code to complete registration.",
        email: normalizedEmail,
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("User registration error", error);
    return NextResponse.json(
      { error: "Failed to register account", details: error.message },
      { status: 500 }
    );
  }
}
