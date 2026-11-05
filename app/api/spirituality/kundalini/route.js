/**
 * GET /api/spirituality/kundalini
 * 
 * Returns all published Kundalini and Chakra educational modules,
 * complete with traditional historical context, gentle awareness practices,
 * seven-chakra classical curriculum, and user completion status if authenticated.
 */

import { NextResponse } from "next/server.js";
import prisma from "../../../../lib/prisma.js";
import { getAuthenticatedUser } from "../../../../server/security/authGuard.js";
import { INITIAL_KUNDALINI_MODULES } from "../../../../server/astrology/seedRemediesAndKundalini.js";
import { CHAKRAS_ARRAY } from "../../../../server/spirituality/chakraKnowledge.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.toLowerCase()?.trim() || "";
    const category = searchParams.get("category")?.toLowerCase() || "";

    const authUser = await getAuthenticatedUser(request);
    const userId = authUser?.id || null;

    let modules = [];
    try {
      modules = await prisma.kundaliniModule.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { order: "asc" },
      });
    } catch (err) {
      console.warn("[kundalini API] DB fetch failed, using fallback:", err.message);
    }

    if (!modules || modules.length === 0) {
      modules = INITIAL_KUNDALINI_MODULES.map((m, i) => ({
        ...m,
        id: `seed-kundalini-${i}`,
      }));
    }

    // Fetch user progress and saved notes if authenticated
    let userProgressMap = new Map();
    let savedNotesMap = new Map();
    if (userId) {
      try {
        const progressList = await prisma.userKundaliniProgress.findMany({
          where: { userId },
        });
        for (const p of progressList) {
          userProgressMap.set(p.moduleId, p);
        }

        const savedConcepts = await prisma.userSavedConcept.findMany({
          where: { userId, category: "KUNDALINI" },
        });
        for (const sc of savedConcepts) {
          savedNotesMap.set(sc.conceptKey, sc.notes);
        }
      } catch (err) {
        console.warn("[kundalini API] Failed to fetch user progress:", err.message);
      }
    }

    const enhancedModules = modules.map((mod) => {
      const p = userProgressMap.get(mod.id) || userProgressMap.get(mod.slug);
      return {
        ...mod,
        isCompleted: Boolean(p?.completed),
        isBookmarked: Boolean(p?.bookmarked),
        completedAt: p?.completedAt || null,
      };
    });

    let enhancedChakras = CHAKRAS_ARRAY.map((chakra) => {
      // Find matching db module by slug if exists
      const dbMatch = modules.find((m) => m.slug === chakra.slug);
      const p = (dbMatch && userProgressMap.get(dbMatch.id)) || userProgressMap.get(chakra.slug) || userProgressMap.get(chakra.id);
      const userNote = savedNotesMap.get(`chakra-reflection-${chakra.slug}`) || savedNotesMap.get(`chakra-reflection-${chakra.id}`) || "";

      return {
        ...chakra,
        dbModuleId: dbMatch?.id || null,
        isCompleted: Boolean(p?.completed),
        isBookmarked: Boolean(p?.bookmarked),
        completedAt: p?.completedAt || null,
        userReflectionNote: userNote,
      };
    });

    // Search filter if provided
    if (q) {
      enhancedChakras = enhancedChakras.filter((c) =>
        c.sanskritName.toLowerCase().includes(q) ||
        c.englishName.toLowerCase().includes(q) ||
        c.meaning.toLowerCase().includes(q) ||
        c.element.toLowerCase().includes(q) ||
        c.bijaMantra.toLowerCase().includes(q) ||
        c.everydayExamples.some((ex) => ex.scenario.toLowerCase().includes(q) || ex.example.toLowerCase().includes(q))
      );
    }

    const response = NextResponse.json({
      success: true,
      modules: category === "chakras" ? [] : enhancedModules,
      chakras: category === "modules" ? [] : enhancedChakras,
      totalChakras: enhancedChakras.length,
      safetyDisclaimer: {
        title: "Traditional Kundalini & Meditation Safety Standards",
        content:
          "Kundalini and Chakra practices presented on Gurukul are strictly educational and contemplative. They follow classical traditions of non-violence (Ahimsa) and gentle mindfulness. Users should never engage in forceful breath retention, hyperventilation, or unsupervised intensive rituals. If you experience dizziness, disorientation, anxiety, or pain, discontinue the practice immediately.",
      },
    });

    if (userId) {
      response.headers.set("Cache-Control", "private, max-age=30");
    } else {
      response.headers.set("Cache-Control", "public, max-age=1800, stale-while-revalidate=3600");
    }

    return response;
  } catch (error) {
    console.error("GET /api/spirituality/kundalini error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Kundalini modules", details: error.message },
      { status: 500 }
    );
  }
}
