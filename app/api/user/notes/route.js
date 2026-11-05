import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import {
  createNote,
  updateNote,
  deleteNote,
  getUserNotes,
} from "@/server/learning/notes";

async function getUserId(request) {
  const authUser = await getAuthenticatedUser(request);
  return authUser?.id || null;
}

// GET /api/user/notes
export async function GET(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");
    const chapterId = searchParams.get("chapterId");
    const passageId = searchParams.get("passageId");
    const isHighlight = searchParams.get("isHighlight") !== null
      ? searchParams.get("isHighlight") === "true"
      : null;

    const result = await getUserNotes({
      userId,
      bookId,
      chapterId,
      passageId,
      isHighlight,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/user/notes error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve notes" },
      { status: error.statusCode || 500 }
    );
  }
}

// POST /api/user/notes
export async function POST(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const note = await createNote({
      userId,
      passageId: body.passageId,
      bookId: body.bookId,
      chapterId: body.chapterId,
      body: body.body,
      selectedText: body.selectedText,
      color: body.color,
      isHighlight: body.isHighlight,
      startOffset: body.startOffset,
      endOffset: body.endOffset,
      sourcePage: body.sourcePage,
    });

    return NextResponse.json({ success: true, note }, { status: 201 });
  } catch (error) {
    console.error("POST /api/user/notes error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create note" },
      { status: error.statusCode || 500 }
    );
  }
}

// PUT /api/user/notes
export async function PUT(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updated = await updateNote({
      noteId: body.noteId || body.id,
      userId,
      body: body.body,
      color: body.color,
      selectedText: body.selectedText,
    });

    return NextResponse.json({ success: true, note: updated });
  } catch (error) {
    console.error("PUT /api/user/notes error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update note" },
      { status: error.statusCode || 500 }
    );
  }
}

// DELETE /api/user/notes
export async function DELETE(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get("id");

    if (!noteId) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    const result = await deleteNote({ noteId, userId });
    return NextResponse.json(result);
  } catch (error) {
    console.error("DELETE /api/user/notes error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete note" },
      { status: error.statusCode || 500 }
    );
  }
}
