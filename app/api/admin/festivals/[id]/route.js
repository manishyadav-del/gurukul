import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/server/security/authGuard";
import { ROLES } from "@/lib/permissions";

export async function GET(request, { params }) {
  try {
    const auth = await requireRole(request, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
    if (auth.errorResponse) return auth.errorResponse;

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const festival = await prisma.vedicFestival.findUnique({
      where: { id },
      include: {
        rule: true,
        scriptureReferences: true,
      },
    });

    if (!festival) {
      return NextResponse.json({ success: false, error: "Festival not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, festival });
  } catch (error) {
    console.error("Admin festival GET ID error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load festival" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await requireRole(request, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
    if (auth.errorResponse) return auth.errorResponse;
    const adminUser = auth.user;

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    const {
      name,
      nameHi,
      nameSanskrit,
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
      rule,
      scriptureReference,
    } = body;

    const existing = await prisma.vedicFestival.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Festival not found" }, { status: 404 });
    }

    const updated = await prisma.vedicFestival.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(nameHi !== undefined ? { nameHi } : {}),
        ...(nameSanskrit !== undefined ? { nameSanskrit } : {}),
        ...(category ? { category } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(descriptionHi !== undefined ? { descriptionHi } : {}),
        ...(significance !== undefined ? { significance } : {}),
        ...(significanceHi !== undefined ? { significanceHi } : {}),
        ...(deities ? { deities } : {}),
        ...(pujaVidhi !== undefined ? { pujaVidhi } : {}),
        ...(pujaVidhiHi !== undefined ? { pujaVidhiHi } : {}),
        ...(vrataRules !== undefined ? { vrataRules } : {}),
        ...(vrataRulesHi !== undefined ? { vrataRulesHi } : {}),
        ...(mantras ? { mantras } : {}),
        ...(faqs ? { faqs } : {}),
        ...(regionalVariations ? { regionalVariations } : {}),
        ...(typeof isPublished === "boolean" ? { isPublished } : {}),
        ...(status ? { status } : {}),
        version: { increment: 1 },
      },
      include: {
        rule: true,
        scriptureReferences: true,
      },
    });

    // Update Rule if provided
    if (rule) {
      await prisma.festivalRule.upsert({
        where: { festivalId: id },
        update: {
          lunarMonth: rule.lunarMonth || null,
          paksha: rule.paksha || null,
          tithi: rule.tithi ? parseInt(rule.tithi, 10) : null,
          solarSign: rule.solarSign || null,
          determinationRule: rule.determinationRule || "UDAYA_TITHI",
          traditionConvention: rule.traditionConvention || "ALL",
          isRecurringMonthly: !!rule.isRecurringMonthly,
          paranaRule: rule.paranaRule || null,
        },
        create: {
          festivalId: id,
          lunarMonth: rule.lunarMonth || null,
          paksha: rule.paksha || null,
          tithi: rule.tithi ? parseInt(rule.tithi, 10) : null,
          solarSign: rule.solarSign || null,
          determinationRule: rule.determinationRule || "UDAYA_TITHI",
          traditionConvention: rule.traditionConvention || "ALL",
          isRecurringMonthly: !!rule.isRecurringMonthly,
          paranaRule: rule.paranaRule || null,
        },
      });
    }

    // Upsert Scripture Reference if provided
    if (scriptureReference) {
      const existingRef = await prisma.festivalScriptureReference.findFirst({
        where: { festivalId: id },
      });

      if (existingRef) {
        await prisma.festivalScriptureReference.update({
          where: { id: existingRef.id },
          data: {
            bookSlug: scriptureReference.bookSlug || existingRef.bookSlug,
            bookTitle: scriptureReference.bookTitle || existingRef.bookTitle,
            chapterTitle: scriptureReference.chapterTitle,
            verseNumber: scriptureReference.verseNumber,
            pageNumber: scriptureReference.pageNumber ? parseInt(scriptureReference.pageNumber, 10) : null,
            shlokaSanskrit: scriptureReference.shlokaSanskrit,
            translationEn: scriptureReference.translationEn,
            translationHi: scriptureReference.translationHi,
            readerUrl: scriptureReference.readerUrl,
          },
        });
      } else {
        await prisma.festivalScriptureReference.create({
          data: {
            festivalId: id,
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
        });
      }
    }

    // Record Audit Log
    try {
      await prisma.adminAuditLog.create({
        data: {
          actorId: adminUser.id,
          action: "UPDATE_VEDIC_FESTIVAL",
          entityType: "VedicFestival",
          entityId: id,
          metadata: { name: updated.name, status: updated.status },
        },
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      festival: updated,
    });
  } catch (error) {
    console.error("Admin festival PUT ID error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update festival" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireRole(request, [ROLES.ADMIN, ROLES.SUPER_ADMIN]);
    if (auth.errorResponse) return auth.errorResponse;
    const adminUser = auth.user;

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const festival = await prisma.vedicFestival.findUnique({ where: { id } });
    if (!festival) {
      return NextResponse.json({ success: false, error: "Festival not found" }, { status: 404 });
    }

    await prisma.vedicFestival.delete({ where: { id } });

    // Record Audit Log
    try {
      await prisma.adminAuditLog.create({
        data: {
          actorId: adminUser.id,
          action: "DELETE_VEDIC_FESTIVAL",
          entityType: "VedicFestival",
          entityId: id,
          metadata: { name: festival.name, slug: festival.slug },
        },
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({ success: true, message: "Festival deleted" });
  } catch (error) {
    console.error("Admin festival DELETE ID error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete festival" },
      { status: 500 }
    );
  }
}
