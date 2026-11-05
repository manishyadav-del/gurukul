import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";

// GET /api/learning/recent
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ success: true, recentTopics: [] });
    }

    const recentTopics = await prisma.userRecentTopic.findMany({
      where: { userId: authUser.id },
      orderBy: { viewedAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      recentTopics,
    });
  } catch (error) {
    console.error("GET /api/learning/recent error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recently viewed topics", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/learning/recent - Record viewing a topic
export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ success: false, reason: "GUEST" });
    }

    const body = await request.json();
    const { topicKey, title, category = "ASTROLOGY", url } = body;

    if (!topicKey || !title || !url) {
      return NextResponse.json(
        { error: "topicKey, title, and url are required" },
        { status: 400 }
      );
    }

    const record = await prisma.userRecentTopic.upsert({
      where: {
        userId_topicKey: {
          userId: authUser.id,
          topicKey,
        },
      },
      update: {
        title,
        category,
        url,
        viewedAt: new Date(),
      },
      create: {
        userId: authUser.id,
        topicKey,
        title,
        category,
        url,
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error("POST /api/learning/recent error:", error);
    return NextResponse.json(
      { error: "Failed to record recently viewed topic", details: error.message },
      { status: 500 }
    );
  }
}
