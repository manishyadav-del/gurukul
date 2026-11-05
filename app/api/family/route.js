import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { listFamilyMembers, createFamilyMember } from "@/server/family/familyService";

// GET /api/family — List authorized family members
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get("includeArchived") === "true";

    const members = await listFamilyMembers(authUser.id, { includeArchived });
    return NextResponse.json({ success: true, members });
  } catch (error) {
    console.error("GET /api/family error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve family members" },
      { status: error.statusCode || 500 }
    );
  }
}

// POST /api/family — Create a new family member
export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const member = await createFamilyMember(authUser.id, body);
    return NextResponse.json({ success: true, member }, { status: 201 });
  } catch (error) {
    console.error("POST /api/family error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create family member" },
      { status: error.statusCode || 400 }
    );
  }
}
