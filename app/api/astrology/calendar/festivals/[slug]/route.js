import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { FESTIVAL_DEFINITIONS } from "@/server/astrology/vedicCalendarData";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    // First try database
    let festival = await prisma.vedicFestival.findUnique({
      where: { slug },
      include: {
        rule: true,
        scriptureReferences: true,
      },
    });

    // Fallback to in-memory definitions if not found
    if (!festival) {
      const mem = FESTIVAL_DEFINITIONS.find((f) => f.slug === slug);
      if (mem) {
        festival = {
          ...mem,
          rule: mem.rule,
          scriptureReferences: mem.scriptureReference ? [mem.scriptureReference] : [],
        };
      }
    }

    if (!festival) {
      return NextResponse.json(
        { success: false, error: "Festival not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      festival,
    });
  } catch (error) {
    console.error("Vedic Festival Detail API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve festival details" },
      { status: 500 }
    );
  }
}
