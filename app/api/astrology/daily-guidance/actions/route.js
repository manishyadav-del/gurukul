/**
 * POST /api/astrology/daily-guidance/actions
 * 
 * Handles user completion, bookmarking, and notes for daily Vedic remedies,
 * Pujas, and spiritual practices.
 * 
 * Automatically awards XP and records daily streak activity.
 */

import { NextResponse } from "next/server.js";
import prisma from "../../../../../lib/prisma.js";
import { requireAuth } from "../../../../../server/security/authGuard.js";
import { awardXp, recordDailyActivity } from "../../../../../server/gamification/engine.js";
import { CLASSICAL_PUJAS } from "../../../../../server/astrology/remedyEngine.js";
import { INITIAL_REMEDIES } from "../../../../../server/astrology/seedRemediesAndKundalini.js";

export async function POST(request) {
  try {
    const auth = await requireAuth(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;

    const body = await request.json();
    const { remedyId, practiceDate, action, notes } = body;

    if (!remedyId || !practiceDate || !action) {
      return NextResponse.json(
        { error: "remedyId, practiceDate, and action are required" },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(practiceDate)) {
      return NextResponse.json({ error: "Invalid practiceDate format (YYYY-MM-DD)" }, { status: 400 });
    }

    // 1. Resolve Remedy: Check by ID or Slug
    let remedy = await prisma.dailyRemedy.findFirst({
      where: {
        OR: [{ id: remedyId }, { slug: remedyId }],
      },
    });

    // 2. If not in DB yet, check CLASSICAL_PUJAS or INITIAL_REMEDIES and auto-create
    if (!remedy) {
      const pujaMatch = CLASSICAL_PUJAS.find((p) => p.id === remedyId || p.category === remedyId);
      if (pujaMatch) {
        remedy = await prisma.dailyRemedy.create({
          data: {
            title: pujaMatch.titleEn,
            slug: pujaMatch.id,
            category: "PUJA",
            deity: pujaMatch.deity,
            planetaryAssociation: pujaMatch.planetaryAssociation,
            purpose: pujaMatch.traditionalSignificanceEn,
            materials: pujaMatch.materials || [],
            instructions: pujaMatch.procedureSteps || [],
            durationMinutes: 15,
            sanskritMantra: pujaMatch.sanskritMantras?.[0]?.devanagari || null,
            transliteration: pujaMatch.sanskritMantras?.[0]?.iast || null,
            mantraMeaning: pujaMatch.sanskritMantras?.[0]?.meaningEn || null,
            tradition: "Vedic & Puranic",
            sourceReference: pujaMatch.sourceScripture,
            status: "PUBLISHED",
          },
        }).catch(() => null);
      } else {
        const seedMatch = INITIAL_REMEDIES.find((r) => r.slug === remedyId || remedyId.includes(r.slug));
        if (seedMatch) {
          remedy = await prisma.dailyRemedy.create({
            data: {
              ...seedMatch,
              slug: seedMatch.slug,
              status: "PUBLISHED",
            },
          }).catch(() => null);
        }
      }
    }

    // Fallback search again
    if (!remedy) {
      remedy = await prisma.dailyRemedy.findFirst({
        where: {
          OR: [{ id: remedyId }, { slug: remedyId }],
        },
      });
    }

    if (!remedy) {
      // If still not found, create a generic entry so user practice is safely recorded
      remedy = await prisma.dailyRemedy.create({
        data: {
          title: remedyId.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          slug: remedyId,
          category: remedyId.startsWith("puja") ? "PUJA" : "PRACTICE",
          purpose: "Personal Vedic sadhana and spiritual practice",
          instructions: ["Engage with mindful reverence and calm presence."],
          tradition: "Classical Vedic",
          status: "PUBLISHED",
        },
      }).catch(async () => {
        return await prisma.dailyRemedy.findFirst({ where: { slug: remedyId } });
      });
    }

    if (!remedy) {
      return NextResponse.json({ error: "Could not record practice for specified remedy" }, { status: 404 });
    }

    let updateData = {};
    if (action === "complete") {
      updateData = { completed: true, completedAt: new Date() };
    } else if (action === "uncomplete") {
      updateData = { completed: false, completedAt: null };
    } else if (action === "bookmark") {
      updateData = { bookmarked: true };
    } else if (action === "unbookmark") {
      updateData = { bookmarked: false };
    } else if (action === "note") {
      updateData = { notes: notes || "" };
    } else {
      return NextResponse.json({ error: `Invalid action '${action}'` }, { status: 400 });
    }

    const log = await prisma.userPracticeLog.upsert({
      where: {
        userId_remedyId_practiceDate: {
          userId: user.id,
          remedyId: remedy.id,
          practiceDate,
        },
      },
      update: updateData,
      create: {
        userId: user.id,
        remedyId: remedy.id,
        practiceDate,
        completed: action === "complete",
        completedAt: action === "complete" ? new Date() : null,
        bookmarked: action === "bookmark",
        notes: notes || null,
      },
    });

    // Award XP and update streak when completing
    let xpResult = { awarded: false, amount: 0 };
    if (action === "complete") {
      xpResult = await awardXp({
        userId: user.id,
        actionType: "REMEDY_COMPLETED",
        amount: 20,
        description: `Completed daily practice: ${remedy.title}`,
        referenceId: `remedy-${user.id}-${remedy.id}-${practiceDate}`,
      });
      await recordDailyActivity({ userId: user.id });
    }

    return NextResponse.json({
      success: true,
      action,
      log,
      xpAwarded: xpResult.amount || 0,
      message: `Practice '${remedy.title}' successfully updated.`,
    });
  } catch (error) {
    console.error("POST /api/astrology/daily-guidance/actions error:", error);
    return NextResponse.json(
      { error: "Failed to update practice log", details: error.message },
      { status: 500 }
    );
  }
}
