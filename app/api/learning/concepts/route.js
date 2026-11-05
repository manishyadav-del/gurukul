import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";

// GET /api/learning/concepts
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where = { userId: authUser.id };
    if (category && category.toUpperCase() !== "ALL") {
      where.category = category.toUpperCase();
    }

    const concepts = await prisma.userSavedConcept.findMany({
      where,
      include: {
        sourceBook: { select: { id: true, title: true, slug: true } },
        sourcePassage: {
          select: { id: true, sourcePage: true, chapter: { select: { title: true, slug: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ concepts });
  } catch (error) {
    console.error("GET /api/learning/concepts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved concepts", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/learning/concepts
export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      term,
      conceptKey,
      sanskritTerm,
      category = "GENERAL",
      meaning,
      notes,
      sourceBookId,
      sourcePassageId,
    } = body;

    if (!term || !term.trim()) {
      return NextResponse.json({ error: "Concept term is required" }, { status: 400 });
    }

    const normalizedKey = (conceptKey || term).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

    const concept = await prisma.userSavedConcept.upsert({
      where: {
        userId_conceptKey: {
          userId: authUser.id,
          conceptKey: normalizedKey,
        },
      },
      update: {
        term: term.trim(),
        sanskritTerm: sanskritTerm?.trim() || null,
        category: category.toUpperCase(),
        meaning: meaning?.trim() || null,
        notes: notes?.trim() || null,
        sourceBookId: sourceBookId || null,
        sourcePassageId: sourcePassageId || null,
        updatedAt: new Date(),
      },
      create: {
        userId: authUser.id,
        conceptKey: normalizedKey,
        term: term.trim(),
        sanskritTerm: sanskritTerm?.trim() || null,
        category: category.toUpperCase(),
        meaning: meaning?.trim() || null,
        notes: notes?.trim() || null,
        sourceBookId: sourceBookId || null,
        sourcePassageId: sourcePassageId || null,
      },
    });

    return NextResponse.json({ success: true, concept });
  } catch (error) {
    console.error("POST /api/learning/concepts error:", error);
    return NextResponse.json(
      { error: "Failed to save concept", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/learning/concepts
export async function DELETE(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const conceptKey = searchParams.get("conceptKey");

    if (!id && !conceptKey) {
      return NextResponse.json({ error: "id or conceptKey is required" }, { status: 400 });
    }

    const where = id
      ? { id, userId: authUser.id }
      : { userId_conceptKey: { userId: authUser.id, conceptKey } };

    await prisma.userSavedConcept.deleteMany({
      where: id ? { id, userId: authUser.id } : { userId: authUser.id, conceptKey },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/learning/concepts error:", error);
    return NextResponse.json(
      { error: "Failed to delete concept", details: error.message },
      { status: 500 }
    );
  }
}
