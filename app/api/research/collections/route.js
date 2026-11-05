import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import {
  getUserResearchCollections,
  createResearchCollection,
  updateResearchCollection,
  deleteResearchCollection,
} from "@/server/research/workspace";

// GET /api/research/collections
export async function GET(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const collections = await getUserResearchCollections(user.id);
    return NextResponse.json({ collections });
  } catch (err) {
    console.error("GET /api/research/collections error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/research/collections
export async function POST(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, tags } = body || {};

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const collection = await createResearchCollection({
      userId: user.id,
      title,
      description,
      tags,
    });

    return NextResponse.json({ success: true, collection });
  } catch (err) {
    console.error("POST /api/research/collections error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/research/collections?id=...
export async function DELETE(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Collection ID is required" }, { status: 400 });
    }

    await deleteResearchCollection({ userId: user.id, collectionId: id });
    return NextResponse.json({ success: true, message: "Collection deleted" });
  } catch (err) {
    console.error("DELETE /api/research/collections error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
