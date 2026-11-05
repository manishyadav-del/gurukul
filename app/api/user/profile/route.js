import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import bcrypt from "bcryptjs";

// GET /api/user/profile — Retrieve authenticated user profile
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        locale: true,
        timezone: true,
        avatarUrl: true,
        dateOfBirth: true,
        birthTime: true,
        birthPlace: true,
        gender: true,
        totalXp: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
        isPublicLeaderboard: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            ownedFamilyMembers: { where: { isArchived: false } },
            sentInvitations: { where: { status: "PENDING" } },
            birthProfiles: true,
            bookmarks: true,
            notes: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve user profile" },
      { status: 500 }
    );
  }
}

// PATCH /api/user/profile — Update authenticated user profile
export async function PATCH(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const updateData = {};

    if (body.name !== undefined) {
      if (!body.name || !body.name.trim()) {
        return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      }
      updateData.name = body.name.trim();
    }

    if (body.avatarUrl !== undefined) {
      updateData.avatarUrl = body.avatarUrl ? body.avatarUrl.trim() : null;
    }

    if (body.locale !== undefined) {
      updateData.locale = body.locale.trim() || "en";
    }

    if (body.timezone !== undefined) {
      updateData.timezone = body.timezone.trim() || "Asia/Kolkata";
    }

    if (body.gender !== undefined) {
      updateData.gender = body.gender ? body.gender.trim() : null;
    }

    if (body.birthPlace !== undefined) {
      updateData.birthPlace = body.birthPlace ? body.birthPlace.trim() : null;
    }

    if (body.birthTime !== undefined) {
      updateData.birthTime = body.birthTime ? body.birthTime.trim() : null;
    }

    if (body.dateOfBirth !== undefined) {
      if (!body.dateOfBirth) {
        updateData.dateOfBirth = null;
      } else {
        const parsed = new Date(body.dateOfBirth);
        if (!isNaN(parsed.getTime())) {
          updateData.dateOfBirth = parsed;
        }
      }
    }

    // Email change verification
    if (body.email && body.email.toLowerCase().trim() !== authUser.email.toLowerCase().trim()) {
      const newEmail = body.email.toLowerCase().trim();
      const existing = await prisma.user.findUnique({
        where: { email: newEmail },
      });

      if (existing) {
        return NextResponse.json(
          { error: "This email address is already in use by another account" },
          { status: 409 }
        );
      }

      // Password verification required to change email
      if (!body.currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to change your account email address" },
          { status: 400 }
        );
      }

      const currentUser = await prisma.user.findUnique({ where: { id: authUser.id } });
      if (currentUser.passwordHash) {
        const isValid = await bcrypt.compare(body.currentPassword, currentUser.passwordHash);
        if (!isValid) {
          return NextResponse.json(
            { error: "Incorrect current password. Email change rejected." },
            { status: 403 }
          );
        }
      }

      updateData.email = newEmail;
    }

    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        locale: true,
        timezone: true,
        avatarUrl: true,
        dateOfBirth: true,
        birthTime: true,
        birthPlace: true,
        gender: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("PATCH /api/user/profile error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
