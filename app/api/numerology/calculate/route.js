import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import {
  calculateCompleteNumerology,
  calculateVedicNumerology,
} from "@/server/numerology/numerologyEngine";

// POST /api/numerology/calculate
export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser(request).catch(() => null);
    const body = await request.json().catch(() => ({}));

    let name = body.name ? String(body.name).trim() : "";
    let birthDate = body.birthDate || null;
    const system = body.system ? String(body.system).toUpperCase().trim() : "CHALDEAN";
    const language = body.language ? String(body.language).toLowerCase().trim() : "en";
    const targetDate = body.targetDate || new Date().toISOString().split("T")[0];
    const saveToProfile = body.saveToProfile !== undefined ? Boolean(body.saveToProfile) : Boolean(authUser?.id);

    // If name or birthDate is not provided in body, fall back to authenticated user's birth profile
    if ((!name || !birthDate) && authUser?.id) {
      const birthProfile = await prisma.birthProfile.findFirst({
        where: { userId: authUser.id },
        orderBy: { updatedAt: "desc" },
      });
      if (birthProfile) {
        if (!name) name = birthProfile.name;
        if (!birthDate) birthDate = birthProfile.birthDate.toISOString().split("T")[0];
      } else {
        const userRecord = await prisma.user.findUnique({
          where: { id: authUser.id },
          select: { name: true, dateOfBirth: true },
        });
        if (!name && userRecord?.name) name = userRecord.name;
        if (!birthDate && userRecord?.dateOfBirth) {
          birthDate = userRecord.dateOfBirth.toISOString().split("T")[0];
        }
      }
    }

    // 1. Server-side validation
    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "A valid name with at least 2 characters is required." },
        { status: 400 }
      );
    }

    if (!birthDate) {
      return NextResponse.json(
        { error: "A valid birth date (YYYY-MM-DD) is required." },
        { status: 400 }
      );
    }

    const parsedDate = new Date(birthDate);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid birth date format. Please provide YYYY-MM-DD." },
        { status: 400 }
      );
    }

    // Check bounds: birth year must be reasonable (1850 to next year)
    const year = parsedDate.getUTCFullYear();
    const currentYear = new Date().getFullYear();
    if (year < 1850 || year > currentYear + 1) {
      return NextResponse.json(
        { error: `Birth year must be between 1850 and ${currentYear + 1}.` },
        { status: 400 }
      );
    }

    // 2. Perform deterministic calculation on the server
    const completeResult = calculateCompleteNumerology({
      name,
      birthDate,
      system,
      language,
      targetDate,
    });

    const vedicReport = calculateVedicNumerology({ name, birthDate });

    // 3. Optional persistence for authenticated users
    let savedReportId = null;
    let savedProfileId = null;

    if (authUser?.id && saveToProfile) {
      try {
        const saved = await prisma.$transaction(async (tx) => {
          // Count existing reports for this user and name to determine version
          const previousCount = await tx.numerologyReport.count({
            where: {
              userId: authUser.id,
              name,
              system: completeResult.system,
            },
          });

          // Create new historical report record
          const reportRecord = await tx.numerologyReport.create({
            data: {
              userId: authUser.id,
              name,
              birthDate: parsedDate,
              system: completeResult.system,
              language: completeResult.language,
              targetDate: new Date(targetDate),
              coreNumbers: completeResult.calculation.coreNumbers || {
                mulank: vedicReport.mulank.value,
                bhagyank: vedicReport.bhagyank.value,
                namank: vedicReport.namank.value,
              },
              reportData: completeResult.report,
              version: previousCount + 1,
              engineVersion: "2.0.0",
            },
          });

          // Update primary numerologyProfile for dashboard compatibility
          const existingProfile = await tx.numerologyProfile.findFirst({
            where: {
              userId: authUser.id,
              name,
            },
          });

          const profileData = {
            userId: authUser.id,
            name,
            birthDate: parsedDate,
            mulank: vedicReport.mulank.value,
            bhagyank: vedicReport.bhagyank.value,
            namank: vedicReport.namank.value,
            rulerPlanet: vedicReport.mulank.planet,
            luckyColors: vedicReport.mulank.luckyColors,
            luckyDays: vedicReport.mulank.luckyDays,
            luckyGemstone: vedicReport.mulank.luckyGemstone,
            friendlyNumbers: vedicReport.mulank.friendlyNumbers,
            enemyNumbers: vedicReport.mulank.enemyNumbers,
            neutralNumbers: vedicReport.mulank.neutralNumbers,
            gridData: vedicReport.grid,
            calculationData: vedicReport,
          };

          let profileRecord;
          if (existingProfile) {
            profileRecord = await tx.numerologyProfile.update({
              where: { id: existingProfile.id },
              data: profileData,
            });
          } else {
            profileRecord = await tx.numerologyProfile.create({
              data: profileData,
            });
          }

          return { reportId: reportRecord.id, profileId: profileRecord.id };
        });

        savedReportId = saved.reportId;
        savedProfileId = saved.profileId;
      } catch (dbErr) {
        console.warn("[Numerology API] Database persistence non-blocking warning:", dbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      persisted: Boolean(savedReportId),
      reportId: savedReportId,
      profileId: savedProfileId,
      system: completeResult.system,
      language: completeResult.language,
      report: completeResult.report,
      calculation: completeResult.calculation,
      vedic: vedicReport,
    });
  } catch (err) {
    console.error("POST /api/numerology/calculate error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error calculating numerology report" },
      { status: 500 }
    );
  }
}

// GET /api/numerology/calculate — Retrieve saved report/profile or calculate from user session
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request).catch(() => null);
    if (!authUser?.id) {
      return NextResponse.json(
        { error: "Authentication required to retrieve saved numerology reports." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("reportId");
    const profileId = searchParams.get("profileId");
    const requestedSystem = searchParams.get("system")?.toUpperCase() || "CHALDEAN";
    const requestedLang = searchParams.get("lang")?.toLowerCase() || "en";

    // 1. Direct report retrieval by ID
    if (reportId) {
      const record = await prisma.numerologyReport.findUnique({
        where: { id: reportId },
      });
      if (!record || record.userId !== authUser.id) {
        return NextResponse.json({ error: "Report not found or access denied." }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        reportId: record.id,
        system: record.system,
        language: record.language,
        version: record.version,
        report: record.reportData,
        coreNumbers: record.coreNumbers,
        createdAt: record.createdAt,
      });
    }

    // 2. Direct profile retrieval by ID
    if (profileId) {
      const record = await prisma.numerologyProfile.findUnique({
        where: { id: profileId },
      });
      if (!record || record.userId !== authUser.id) {
        return NextResponse.json({ error: "Profile not found or access denied." }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        profile: record,
        report: record.calculationData,
      });
    }

    // 3. Retrieve latest saved report for user
    const latestSavedReport = await prisma.numerologyReport.findFirst({
      where: { userId: authUser.id },
      orderBy: { createdAt: "desc" },
    });

    if (latestSavedReport) {
      return NextResponse.json({
        success: true,
        reportId: latestSavedReport.id,
        system: latestSavedReport.system,
        language: latestSavedReport.language,
        version: latestSavedReport.version,
        report: latestSavedReport.reportData,
        coreNumbers: latestSavedReport.coreNumbers,
        createdAt: latestSavedReport.createdAt,
      });
    }

    // 4. Retrieve primary birth profile and generate fresh report
    const birthProfile = await prisma.birthProfile.findFirst({
      where: { userId: authUser.id },
      orderBy: { updatedAt: "desc" },
    });

    if (birthProfile) {
      const freshResult = calculateCompleteNumerology({
        name: birthProfile.name,
        birthDate: birthProfile.birthDate.toISOString().split("T")[0],
        system: requestedSystem,
        language: requestedLang,
      });

      const vedicReport = calculateVedicNumerology({
        name: birthProfile.name,
        birthDate: birthProfile.birthDate.toISOString().split("T")[0],
      });

      return NextResponse.json({
        success: true,
        reportId: null,
        system: freshResult.system,
        language: freshResult.language,
        report: freshResult.report,
        calculation: freshResult.calculation,
        vedic: vedicReport,
      });
    }

    return NextResponse.json({
      success: true,
      report: null,
      message: "No birth details found. Please calculate your numbers.",
    });
  } catch (err) {
    console.error("GET /api/numerology/calculate error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve numerology profile" },
      { status: 500 }
    );
  }
}
