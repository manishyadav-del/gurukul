import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import {
  getFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  unlinkFamilyMember,
} from "@/server/family/familyService";

// GET /api/family/[id] — Retrieve an authorized profile
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const member = await getFamilyMember(id, authUser.id);
    if (!member) {
      return NextResponse.json({ error: "Family member not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, member });
  } catch (error) {
    console.error("GET /api/family/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve family member" },
      { status: error.statusCode || 500 }
    );
  }
}

// PATCH /api/family/[id] — Update an authorized profile
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const body = await request.json();

    // Check if unlinking action requested
    if (body.action === "UNLINK") {
      const result = await unlinkFamilyMember(id, authUser.id);
      return NextResponse.json(result);
    }

    const updated = await updateFamilyMember(id, authUser.id, body);
    return NextResponse.json({ success: true, member: updated });
  } catch (error) {
    console.error("PATCH /api/family/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update family member" },
      { status: error.statusCode || 400 }
    );
  }
}

// DELETE /api/family/[id] — Archive or remove an authorized profile
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    const result = await deleteFamilyMember(id, authUser.id, { permanent });
    return NextResponse.json(result);
  } catch (error) {
    console.error("DELETE /api/family/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete family member" },
      { status: error.statusCode || 400 }
    );
  }
}
