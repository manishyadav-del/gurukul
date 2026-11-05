import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";

// GET /api/astrology/ai-assistant/conversations — List authenticated user's conversations
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const conversations = await prisma.aIConversation.findMany({
      where: { userId: authUser.id }, // STRICT USER ISOLATION
      include: {
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      conversations: conversations.map((c) => ({
        id: c.id,
        title: c.title,
        language: c.language,
        messageCount: c._count.messages,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/astrology/ai-assistant/conversations error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list conversations" },
      { status: 500 }
    );
  }
}

// POST /api/astrology/ai-assistant/conversations — Start a new conversation
export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const title = body.title ? body.title.trim() : "New Astrology Discussion";
    const language = body.language || "en";
    const birthProfileId = body.birthProfileId || null;

    const conversation = await prisma.aIConversation.create({
      data: {
        userId: authUser.id,
        birthProfileId,
        title,
        language,
      },
    });

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        title: conversation.title,
        language: conversation.language,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
  } catch (error) {
    console.error("POST /api/astrology/ai-assistant/conversations error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create conversation" },
      { status: 500 }
    );
  }
}
