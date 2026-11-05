import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { acceptFamilyInvitation } from "@/server/family/familyService";

// POST /api/family/invitations/accept — Accept an invitation securely
export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json(
        { error: "Unauthorized: You must be logged in to accept an invitation" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required" },
        { status: 400 }
      );
    }

    const result = await acceptFamilyInvitation(token, authUser);
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/family/invitations/accept error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to accept invitation" },
      { status: error.statusCode || 400 }
    );
  }
}
