import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { resendFamilyInvitation } from "@/server/family/familyService";

// POST /api/family/invitations/[id]/resend — Safely resend an eligible invitation
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const result = await resendFamilyInvitation(id, authUser.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/family/invitations/[id]/resend error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to resend invitation" },
      { status: error.statusCode || 400 }
    );
  }
}
