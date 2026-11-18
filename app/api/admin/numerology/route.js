import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/server/admin/auth";
import { PERMISSIONS } from "@/server/admin/permissions";
import { logAdminActivity } from "@/server/admin/audit";
import {
  calculateCompleteNumerology,
  CHALDEAN_VALUES,
  NUMEROLOGY_PLANETARY_PROFILES,
} from "@/server/numerology/numerologyEngine";
import {
  PYTHAGOREAN_LETTER_VALUES,
  PYTHAGOREAN_MASTER_NUMBERS,
  CHALDEAN_COMPOUND_MEANINGS,
} from "@/server/numerology/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/numerology
 * Retrieves system metadata, letter matrices, master numbers, compound interpretations, and database metrics.
 */
export async function GET(request) {
  const auth = await requireAdmin(request, PERMISSIONS.NUMEROLOGY_READ);
  if (!auth.authorized) return auth.response;

  try {
    const [totalProfiles, totalReports] = await Promise.all([
      prisma.numerologyProfile.count().catch(() => 0),
      prisma.numerologyReport.count().catch(() => 0),
    ]);

    // Format compound number sample (10-33 for quick admin review)
    const compoundNumbersSample = Object.entries(CHALDEAN_COMPOUND_MEANINGS)
      .slice(0, 24)
      .map(([num, data]) => ({
        number: parseInt(num, 10),
        name: data.titleEn,
        nameHi: data.titleHi,
        symbolism: data.meaningEn,
        nature: data.nature,
      }));

    return NextResponse.json({
      success: true,
      stats: {
        totalProfiles,
        totalReports,
        engineVersion: "2.0.0",
        supportedSystems: [
          {
            id: "CHALDEAN",
            name: "Chaldean Numerology (कैलडियन अंक विद्या)",
            letterRange: "1 to 8 (9 is sacred and excluded from letter map)",
            coreFeatures: ["Name Number", "Compound Number (10-52)", "Day Number", "Destiny Number"],
          },
          {
            id: "PYTHAGOREAN",
            name: "Pythagorean Western Numerology (पाइथागोरस अंक विद्या)",
            letterRange: "1 to 9 cyclical (A=1..I=9, J=1..)",
            coreFeatures: ["Life Path Number", "Expression / Destiny", "Soul Urge (Vowels)", "Personality (Consonants)", "Master Numbers 11, 22, 33"],
          },
          {
            id: "VEDIC",
            name: "Vedic Sankhya Shastra (वैदिक अंक शास्त्र)",
            letterRange: "Planetary Rulerships (1=Surya, 2=Chandra, 3=Guru, 4=Rahu, 5=Budha, 6=Shukra, 7=Ketu, 8=Shani, 9=Mangal)",
            coreFeatures: ["Mulank (Root/Day)", "Bhagyank (Destiny/Life Path)", "Namank (Name)", "Loshu 3x3 Grid"],
          },
        ],
      },
      letterMatrices: {
        chaldean: CHALDEAN_VALUES,
        pythagorean: PYTHAGOREAN_LETTER_VALUES,
      },
      planetaryArchetypes: NUMEROLOGY_PLANETARY_PROFILES,
      masterNumbers: PYTHAGOREAN_MASTER_NUMBERS,
      compoundNumbersSample,
    });
  } catch (error) {
    console.error("GET /api/admin/numerology error:", error);
    return NextResponse.json(
      { error: "Failed to load numerology administrative metadata" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/numerology
 * Runs a deterministic calculation diagnostic test across systems and logs admin audit trail.
 */
export async function POST(request) {
  const auth = await requireAdmin(request, PERMISSIONS.NUMEROLOGY_READ);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { name = "Aryabhata", birthDate = "1990-05-15", system = "CHALDEAN", language = "en" } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Valid name is required for diagnostic" }, { status: 400 });
    }

    const testResult = calculateCompleteNumerology({
      name: name.trim(),
      birthDate,
      system,
      language,
    });

    await logAdminActivity({
      actorId: auth.admin.user.id,
      actorEmail: auth.admin.user.email,
      actorRole: auth.admin.role,
      action: "NUMEROLOGY_DIAGNOSTIC_RUN",
      targetResource: "NumerologyEngine",
      targetId: system,
      status: "SUCCESS",
      details: {
        inputName: name.trim(),
        birthDate,
        system,
        calculatedNumbers: {
          coreNumber: testResult.calculation.coreNumber || testResult.calculation.lifePathNumber || testResult.calculation.mulank,
          destinyNumber: testResult.calculation.destinyNumber || testResult.calculation.bhagyank,
        },
      },
    });

    return NextResponse.json({
      success: true,
      diagnostic: testResult,
      verifiedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("POST /api/admin/numerology diagnostic error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute numerology diagnostic calculation" },
      { status: 500 }
    );
  }
}
