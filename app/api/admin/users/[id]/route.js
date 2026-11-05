import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { requireAdmin, revokeAllUserAdminSessions } from "@/server/admin/auth";
import { PERMISSIONS, ADMIN_ROLES } from "@/server/admin/permissions";
import { logAdminActivity } from "@/server/admin/audit";

export async function GET(request, { params }) {
  const auth = await requireAdmin(request, PERMISSIONS.USERS_READ);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        avatarUrl: true,
        totalXp: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            readingProgress: true,
            quizAttempts: true,
            bookmarks: true,
            notes: true,
            ownedFamilyMembers: true,
            adminSessions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("GET /api/admin/users/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const auth = await requireAdmin(request, PERMISSIONS.USERS_WRITE);
  if (!auth.authorized) return auth.response;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "unknown";

  try {
    const { id } = await params;
    const body = await request.json();
    const { role, isActive, newPassword, revokeSessions } = body;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // 1. SUPER ADMIN SAFEGUARD: Prevent demoting or deactivating the last active Super Admin / Admin
    const isTargetAdmin =
      targetUser.role === ADMIN_ROLES.SUPER_ADMIN || targetUser.role === ADMIN_ROLES.ADMIN;

    const willDemote = role && role !== targetUser.role && role !== ADMIN_ROLES.SUPER_ADMIN && role !== ADMIN_ROLES.ADMIN;
    const willDeactivate = isActive === false && targetUser.isActive !== false;

    if (isTargetAdmin && (willDemote || willDeactivate)) {
      const activeAdminCount = await prisma.user.count({
        where: {
          role: { in: [ADMIN_ROLES.SUPER_ADMIN, ADMIN_ROLES.ADMIN] },
          isActive: true,
        },
      });

      if (activeAdminCount <= 1) {
        return NextResponse.json(
          {
            error:
              "Operation blocked: Cannot demote or deactivate the platform's last active Super Administrator. Assign another administrator first.",
          },
          { status: 400 }
        );
      }
    }

    const updateData = {};

    if (role && role !== targetUser.role) {
      updateData.role = role;
    }

    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    if (newPassword && typeof newPassword === "string" && newPassword.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    // Revoke sessions if requested or if user is deactivated
    if (revokeSessions || updateData.isActive === false) {
      await revokeAllUserAdminSessions(id, "ADMINISTRATIVE_REVOKE");
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // Record audit log
    await logAdminActivity({
      actorId: auth.admin.user.id,
      actorEmail: auth.admin.user.email,
      actorRole: auth.admin.role,
      action: "USER_MODIFIED",
      targetResource: "User",
      targetId: id,
      status: "SUCCESS",
      details: {
        previousRole: targetUser.role,
        newRole: updatedUser.role,
        previousStatus: targetUser.isActive,
        newStatus: updatedUser.isActive,
        passwordReset: Boolean(newPassword),
        sessionsRevoked: Boolean(revokeSessions || updateData.isActive === false),
      },
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: "User successfully updated",
      user: updatedUser,
    });
  } catch (error) {
    console.error("PATCH /api/admin/users/[id] error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
