import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";

// PATCH /api/astrology/journal/[id] — Update an existing private journal entry
export async function PATCH(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Journal entry ID required" }, { status: 400 });
    }

    // STRICT USER OWNERSHIP CHECK
    const existing = await prisma.researchItem.findFirst({
      where: {
        id,
        userId: authUser.id,
        itemType: "ASTROLOGY_JOURNAL",
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Journal entry not found or access denied" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updateData = {};

    if (body.title !== undefined) {
      if (!body.title.trim()) {
        return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
      }
      updateData.title = body.title.trim();
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes ? body.notes.trim() : "";
    }

    // Update metadata if any metadata fields provided
    const currentMeta = (typeof existing.metadata === "object" && existing.metadata) ? existing.metadata : {};
    const updatedMeta = { ...currentMeta };

    if (body.entryDate !== undefined) updatedMeta.entryDate = body.entryDate;
    if (body.astrologyEvent !== undefined) updatedMeta.astrologyEvent = body.astrologyEvent;
    if (body.mahadasha !== undefined) updatedMeta.mahadasha = body.mahadasha;
    if (body.antardasha !== undefined) updatedMeta.antardasha = body.antardasha;
    if (body.tags !== undefined && Array.isArray(body.tags)) updatedMeta.tags = body.tags;
    if (body.mood !== undefined) updatedMeta.mood = body.mood;
    if (body.reflection !== undefined) updatedMeta.reflection = body.reflection;

    updateData.metadata = updatedMeta;

    const updated = await prisma.researchItem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Journal entry updated successfully",
      entry: {
        id: updated.id,
        title: updated.title,
        notes: updated.notes,
        entryDate: updatedMeta.entryDate,
        astrologyEvent: updatedMeta.astrologyEvent,
        mahadasha: updatedMeta.mahadasha,
        antardasha: updatedMeta.antardasha,
        tags: updatedMeta.tags,
        mood: updatedMeta.mood,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("PATCH /api/astrology/journal/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update journal entry" },
      { status: 500 }
    );
  }
}

// DELETE /api/astrology/journal/[id] — Delete a private journal entry
export async function DELETE(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Journal entry ID required" }, { status: 400 });
    }

    // STRICT USER OWNERSHIP CHECK
    const existing = await prisma.researchItem.findFirst({
      where: {
        id,
        userId: authUser.id,
        itemType: "ASTROLOGY_JOURNAL",
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Journal entry not found or access denied" },
        { status: 404 }
      );
    }

    await prisma.researchItem.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Journal entry deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/astrology/journal/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete journal entry" },
      { status: 500 }
    );
  }
}
