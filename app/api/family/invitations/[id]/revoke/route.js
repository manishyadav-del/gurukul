import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { revokeFamilyInvitation } from "@/server/family/familyService";

// POST /api/family/invitations/[id]/revoke — Revoke a pending invitation
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const result = await revokeFamilyInvitation(id, authUser.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/family/invitations/[id]/revoke error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to revoke invitation" },
      { status: error.statusCode || 400 }
    );
  }
}
