import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { createFamilyInvitation } from "@/server/family/familyService";
import prisma from "@/lib/prisma";

// GET /api/family/invitations — List invitations for authenticated inviter
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const invitations = await prisma.familyInvitation.findMany({
      where: { inviterId: authUser.id },
      include: {
        familyMember: {
          select: { id: true, name: true, relationship: true, linkedUserId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    const formatted = invitations.map((inv) => {
      let computedStatus = inv.status;
      if (inv.status === "PENDING" && new Date(inv.expiresAt) <= now) {
        computedStatus = "EXPIRED";
      }
      return {
        id: inv.id,
        familyMemberId: inv.familyMemberId,
        familyMemberName: inv.familyMember?.name,
        relationship: inv.relationship || inv.familyMember?.relationship,
        invitedEmail: inv.invitedEmail,
        status: computedStatus,
        rawStatus: inv.status,
        expiresAt: inv.expiresAt,
        acceptedAt: inv.acceptedAt,
        revokedAt: inv.revokedAt,
        createdAt: inv.createdAt,
        isLinked: Boolean(inv.familyMember?.linkedUserId),
      };
    });

    return NextResponse.json({ success: true, invitations: formatted });
  } catch (error) {
    console.error("GET /api/family/invitations error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve invitations" },
      { status: error.statusCode || 500 }
    );
  }
}

// POST /api/family/invitations — Create and send an invitation
export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const result = await createFamilyInvitation(authUser.id, body);

    return NextResponse.json(
      {
        success: true,
        message: `Invitation successfully sent to ${result.invitation.invitedEmail}`,
        ...result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/family/invitations error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to create invitation",
        invitationId: error.invitationId || null,
      },
      { status: error.statusCode || 400 }
    );
  }
}
