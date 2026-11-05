/**
 * Admin API: /api/admin/remedies
 * 
 * Provides management of Daily Remedies, Puja instructions, Mantras,
 * and Source References.
 * Strictly requires manage permission (Admin / Editor).
 */

import { NextResponse } from "next/server.js";
import prisma from "../../../../lib/prisma.js";
import { requireManagePermission } from "../../../../server/security/authGuard.js";
import { logAdminActivity } from "../../../../server/admin/audit.js";

export async function GET(request) {
  try {
    const auth = await requireManagePermission(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const query = searchParams.get("q");

    const where = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { purpose: { contains: query, mode: "insensitive" } },
        { deity: { contains: query, mode: "insensitive" } },
        { sourceReference: { contains: query, mode: "insensitive" } },
      ];
    }

    const remedies = await prisma.dailyRemedy.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, remedies, count: remedies.length });
  } catch (error) {
    console.error("GET /api/admin/remedies error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin remedies", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = await requireManagePermission(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;

    const body = await request.json();
    const {
      title,
      slug,
      category,
      deity,
      planetaryAssociation,
      purpose,
      materials,
      instructions,
      durationMinutes,
      suitableTiming,
      sanskritMantra,
      transliteration,
      mantraMeaning,
      tradition,
      sourceReference,
      costLevel,
      accessibilityAlternatives,
      applicableWeekdays,
      applicableTithis,
      applicableNakshatras,
      isVerified,
      status,
    } = body;

    if (!title || !category || !purpose || !tradition) {
      return NextResponse.json(
        { error: "title, category, purpose, and tradition are mandatory fields" },
        { status: 400 }
      );
    }

    const cleanSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const remedy = await prisma.dailyRemedy.create({
      data: {
        title,
        slug: cleanSlug,
        category,
        deity: deity || null,
        planetaryAssociation: planetaryAssociation || "General",
        purpose,
        materials: Array.isArray(materials) ? materials : [],
        instructions: instructions || [],
        durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : 10,
        suitableTiming: suitableTiming || null,
        sanskritMantra: sanskritMantra || null,
        transliteration: transliteration || null,
        mantraMeaning: mantraMeaning || null,
        tradition,
        sourceReference: sourceReference || "Traditional practice",
        costLevel: costLevel || "FREE",
        accessibilityAlternatives: accessibilityAlternatives || null,
        applicableWeekdays: Array.isArray(applicableWeekdays) ? applicableWeekdays : [0, 1, 2, 3, 4, 5, 6],
        applicableTithis: Array.isArray(applicableTithis) ? applicableTithis : ["All"],
        applicableNakshatras: Array.isArray(applicableNakshatras) ? applicableNakshatras : ["All"],
        isVerified: isVerified !== undefined ? Boolean(isVerified) : true,
        status: status || "PUBLISHED",
      },
    });

    await logAdminActivity({
      actorId: user.id,
      actorEmail: user.email || user.id,
      actorRole: user.role,
      action: "REMEDY_CREATE",
      targetResource: "DailyRemedy",
      targetId: remedy.id,
      status: "SUCCESS",
      details: { title: remedy.title, category: remedy.category },
    });

    return NextResponse.json({ success: true, remedy }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/remedies error:", error);
    return NextResponse.json(
      { error: "Failed to create remedy", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const auth = await requireManagePermission(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;

    const body = await request.json();
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json({ error: "Remedy ID is required" }, { status: 400 });
    }

    const remedy = await prisma.dailyRemedy.update({
      where: { id },
      data: updateFields,
    });

    await logAdminActivity({
      actorId: user.id,
      actorEmail: user.email || user.id,
      actorRole: user.role,
      action: "REMEDY_UPDATE",
      targetResource: "DailyRemedy",
      targetId: remedy.id,
      status: "SUCCESS",
      details: { title: remedy.title },
    });

    return NextResponse.json({ success: true, remedy });
  } catch (error) {
    console.error("PUT /api/admin/remedies error:", error);
    return NextResponse.json(
      { error: "Failed to update remedy", details: error.message },
      { status: 500 }
    );
  }
}
