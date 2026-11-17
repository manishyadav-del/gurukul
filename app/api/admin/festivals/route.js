import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/server/security/authGuard";
import { ROLES } from "@/lib/permissions";

export async function GET(request) {
  try {
    const auth = await requireRole(request, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where = {};
    if (category && category !== "ALL") {
      where.category = category;
    }
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nameHi: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const festivals = await prisma.vedicFestival.findMany({
      where,
      include: {
        rule: true,
        scriptureReferences: true,
        _count: {
          select: {
            preferences: true,
            reminders: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      festivals,
    });
  } catch (error) {
    console.error("Admin festivals GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load festivals" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = await requireRole(request, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
    if (auth.errorResponse) return auth.errorResponse;
    const adminUser = auth.user;

    const body = await request.json();
    const {
      name,
      nameHi,
      nameSanskrit,
      slug,
      category = "FESTIVAL",
      description,
      descriptionHi,
      significance,
      significanceHi,
      deities = [],
      pujaVidhi,
      pujaVidhiHi,
      vrataRules,
      vrataRulesHi,
      mantras = [],
      faqs = [],
      regionalVariations = {},
      isPublished = true,
      status = "PUBLISHED",
      rule,
      scriptureReference,
    } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: "Name and Slug are required" },
        { status: 400 }
      );
    }

    // Verify unique slug
    const existing = await prisma.vedicFestival.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A festival with this slug already exists" },
        { status: 409 }
      );
    }

    const created = await prisma.vedicFestival.create({
      data: {
        name,
        nameHi,
        nameSanskrit,
        slug,
        category,
        description,
        descriptionHi,
        significance,
        significanceHi,
        deities,
        pujaVidhi,
        pujaVidhiHi,
        vrataRules,
        vrataRulesHi,
        mantras,
        faqs,
        regionalVariations,
        isPublished,
        status,
        sourceVerified: true,
        sourceNotes: `Created by Admin: ${adminUser.email}`,
        ...(rule
          ? {
              rule: {
                create: {
                  lunarMonth: rule.lunarMonth || null,
                  paksha: rule.paksha || null,
                  tithi: rule.tithi ? parseInt(rule.tithi, 10) : null,
                  solarSign: rule.solarSign || null,
                  determinationRule: rule.determinationRule || "UDAYA_TITHI",
                  traditionConvention: rule.traditionConvention || "ALL",
                  isRecurringMonthly: !!rule.isRecurringMonthly,
                  paranaRule: rule.paranaRule || null,
                },
              },
            }
          : {}),
        ...(scriptureReference
          ? {
              scriptureReferences: {
                create: {
                  bookSlug: scriptureReference.bookSlug || "brihat-parashara-hora-shastra",
                  bookTitle: scriptureReference.bookTitle || "Brihat Parashara Hora Shastra",
                  chapterTitle: scriptureReference.chapterTitle,
                  verseNumber: scriptureReference.verseNumber,
                  pageNumber: scriptureReference.pageNumber ? parseInt(scriptureReference.pageNumber, 10) : null,
                  shlokaSanskrit: scriptureReference.shlokaSanskrit || "",
                  translationEn: scriptureReference.translationEn,
                  translationHi: scriptureReference.translationHi,
                  readerUrl: scriptureReference.readerUrl,
                  sourceVerification: "VERIFIED",
                },
              },
            }
          : {}),
      },
      include: {
        rule: true,
        scriptureReferences: true,
      },
    });

    // Record Admin Audit Log
    try {
      await prisma.adminAuditLog.create({
        data: {
          actorId: adminUser.id,
          action: "CREATE_VEDIC_FESTIVAL",
          entityType: "VedicFestival",
          entityId: created.id,
          metadata: { name: created.name, slug: created.slug },
        },
      });
    } catch {
      // Non-blocking log
    }

    return NextResponse.json({
      success: true,
      festival: created,
    });
  } catch (error) {
    console.error("Admin festivals POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create festival" },
      { status: 500 }
    );
  }
}
