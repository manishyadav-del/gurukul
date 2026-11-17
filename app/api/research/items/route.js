import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import {
  getResearchItems,
  saveResearchItem,
  updateResearchItem,
  deleteResearchItem,
} from "@/server/research/workspace";

// GET /api/research/items?collectionId=...&itemType=...&search=...
export async function GET(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get("collectionId") || null;
    const itemType = searchParams.get("itemType") || null;
    const search = searchParams.get("search") || null;

    const items = await getResearchItems({
      userId: user.id,
      collectionId,
      itemType,
      search,
    });

    return NextResponse.json({ items });
  } catch (err) {
    console.error("GET /api/research/items error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/research/items
export async function POST(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      collectionId,
      itemType,
      title,
      query,
      answer,
      notes,
      bookId,
      passageId,
      chapterId,
      pageNumber,
      citations,
      comparisonData,
      metadata,
    } = body || {};

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const item = await saveResearchItem({
      userId: user.id,
      collectionId,
      itemType: itemType || "QUERY_ANSWER",
      title,
      query,
      answer,
      notes,
      bookId,
      passageId,
      chapterId,
      pageNumber,
      citations,
      comparisonData,
      metadata,
    });

    return NextResponse.json({ success: true, item });
  } catch (err) {
    console.error("POST /api/research/items error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/research/items
export async function PUT(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, notes, collectionId, metadata } = body || {};

    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const updated = await updateResearchItem({
      userId: user.id,
      itemId: id,
      title,
      notes,
      collectionId,
      metadata,
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (err) {
    console.error("PUT /api/research/items error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/research/items?id=...
export async function DELETE(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    await deleteResearchItem({ userId: user.id, itemId: id });
    return NextResponse.json({ success: true, message: "Research item deleted" });
  } catch (err) {
    console.error("DELETE /api/research/items error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
