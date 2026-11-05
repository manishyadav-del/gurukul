import { NextResponse } from "next/server";
import { inspectInvitationToken } from "@/server/family/familyService";

// GET /api/family/invitations/inspect?token=... — Inspect token validity safely
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token query parameter is required" },
        { status: 400 }
      );
    }

    const inspection = await inspectInvitationToken(token);
    return NextResponse.json(inspection);
  } catch (error) {
    console.error("GET /api/family/invitations/inspect error:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to verify invitation token" },
      { status: 500 }
    );
  }
}
