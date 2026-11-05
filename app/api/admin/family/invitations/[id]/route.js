import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/server/admin/auth";
import { PERMISSIONS } from "@/server/admin/permissions";
import { logAdminActivity } from "@/server/admin/audit";

export async function PATCH(request, { params }) {
  const auth = await requireAdmin(request, PERMISSIONS.FAMILY_WRITE);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const { action, reason } = body || {};

    const invitation = await prisma.familyInvitation.findUnique({
      where: { id },
      include: { inviter: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (action === "REVOKE") {
      const updated = await prisma.familyInvitation.update({
        where: { id },
        data: {
          status: "REVOKED",
          revokedAt: new Date(),
        },
      });

      await logAdminActivity({
        actorId: auth.admin.user.id,
        actorEmail: auth.admin.user.email,
        actorRole: auth.admin.role,
        action: "INVITATION_REVOKED_BY_ADMIN",
        targetResource: "FamilyInvitation",
        targetId: id,
        status: "SUCCESS",
        details: {
          invitedEmail: invitation.invitedEmail,
          inviterEmail: invitation.inviter?.email,
          reason: reason || "Administrative intervention",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Family invitation successfully revoked",
        invitation: updated,
      });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/admin/family/invitations/[id] error:", error);
    return NextResponse.json({ error: "Failed to update invitation" }, { status: 500 });
  }
}
