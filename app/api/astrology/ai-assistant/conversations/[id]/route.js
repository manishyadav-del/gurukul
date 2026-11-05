import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";

// GET /api/astrology/ai-assistant/conversations/[id] — Fetch conversation history
export async function GET(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Conversation ID required" }, { status: 400 });
    }

    // STRICT USER ISOLATION
    const conversation = await prisma.aIConversation.findFirst({
      where: {
        id,
        userId: authUser.id,
      },
      include: {
        messages: {
          include: {
            sources: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        title: conversation.title,
        language: conversation.language,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messages: conversation.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          metadata: m.metadata || {},
          sources: m.sources.map((s) => ({
            id: s.id,
            bookTitle: s.bookTitle,
            chapterTitle: s.chapterTitle,
            pageNumber: s.pageNumber,
            citationText: s.citationText,
            readerUrl: s.readerUrl,
            relevance: s.relevance,
          })),
          createdAt: m.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/astrology/ai-assistant/conversations/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

// PATCH /api/astrology/ai-assistant/conversations/[id] — Rename conversation
export async function PATCH(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const title = body.title ? body.title.trim() : "";

    if (!title) {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    }

    // STRICT USER ISOLATION
    const existing = await prisma.aIConversation.findFirst({
      where: { id, userId: authUser.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    const updated = await prisma.aIConversation.update({
      where: { id },
      data: { title },
    });

    return NextResponse.json({
      success: true,
      conversation: {
        id: updated.id,
        title: updated.title,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("PATCH /api/astrology/ai-assistant/conversations/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to rename conversation" },
      { status: 500 }
    );
  }
}

// DELETE /api/astrology/ai-assistant/conversations/[id] — Delete conversation
export async function DELETE(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const { id } = await params;

    // STRICT USER ISOLATION
    const existing = await prisma.aIConversation.findFirst({
      where: { id, userId: authUser.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    await prisma.aIConversation.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/astrology/ai-assistant/conversations/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
