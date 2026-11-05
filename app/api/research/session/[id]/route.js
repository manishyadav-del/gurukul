import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { getResearchSession } from "@/server/research/workspace";

// GET /api/research/session/[id]
export async function GET(request, { params }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const session = await getResearchSession(user.id, id);
    return NextResponse.json({ session });
  } catch (err) {
    console.error("GET /api/research/session/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
