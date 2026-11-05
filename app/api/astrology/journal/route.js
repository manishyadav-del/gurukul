import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";

// GET /api/astrology/journal — Fetch private journal entries for authenticated user
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const eventFilter = searchParams.get("event")?.trim() || "";
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where = {
      userId: authUser.id, // STRICT USER ISOLATION
      itemType: "ASTROLOGY_JOURNAL",
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    const items = await prisma.researchItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
    });

    // Format items
    const entries = items
      .map((item) => {
        const meta = (typeof item.metadata === "object" && item.metadata) ? item.metadata : {};
        return {
          id: item.id,
          title: item.title,
          notes: item.notes || "",
          entryDate: meta.entryDate || item.createdAt.toISOString().split("T")[0],
          astrologyEvent: meta.astrologyEvent || "Daily Astrological Reflection",
          mahadasha: meta.mahadasha || null,
          antardasha: meta.antardasha || null,
          tags: Array.isArray(meta.tags) ? meta.tags : [],
          mood: meta.mood || "Contemplative",
          reflection: meta.reflection || "",
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };
      })
      .filter((entry) => {
        if (!eventFilter) return true;
        return entry.astrologyEvent.toLowerCase().includes(eventFilter.toLowerCase());
      });

    // Sort chronologically by entryDate descending
    entries.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());

    return NextResponse.json({
      success: true,
      count: entries.length,
      entries,
    });
  } catch (error) {
    console.error("GET /api/astrology/journal error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch journal entries" },
      { status: 500 }
    );
  }
}

// POST /api/astrology/journal — Create a private astrology journal entry
export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: "Journal entry title is required" }, { status: 400 });
    }

    const entryDate = body.entryDate || new Date().toISOString().split("T")[0];
    const astrologyEvent = body.astrologyEvent || "Daily Astrological Reflection";
    const tags = Array.isArray(body.tags) ? body.tags.map((t) => String(t).trim()).filter(Boolean) : [];
    const mood = body.mood || "Contemplative";
    const notes = body.notes ? body.notes.trim() : "";

    const metadata = {
      entryDate,
      astrologyEvent,
      mahadasha: body.mahadasha || null,
      antardasha: body.antardasha || null,
      tags,
      mood,
      reflection: body.reflection || "",
    };

    const item = await prisma.researchItem.create({
      data: {
        userId: authUser.id, // STRICT USER ISOLATION
        itemType: "ASTROLOGY_JOURNAL",
        title: body.title.trim(),
        notes,
        metadata,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Journal entry recorded successfully",
      entry: {
        id: item.id,
        title: item.title,
        notes: item.notes,
        entryDate,
        astrologyEvent,
        mahadasha: metadata.mahadasha,
        antardasha: metadata.antardasha,
        tags,
        mood,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    });
  } catch (error) {
    console.error("POST /api/astrology/journal error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create journal entry" },
      { status: 500 }
    );
  }
}
