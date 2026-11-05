/**
 * /api/spirituality/kundalini/progress
 * 
 * Handles:
 * - GET: Retrieves user's personal spiritual dashboard metrics, streaks, XP,
 *        completed chakras, meditation history, and saved reflection notes.
 * - POST: Records completed chakra lessons, pranayama sessions, meditation practices,
 *         mantras studied, bookmarks, and reflection notes.
 * 
 * Integrates with Gurukul's core gamification engine (awardXp, recordDailyActivity)
 * without duplicating progress or reward services.
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, getAuthenticatedUser } from "@/server/security/authGuard";
import { getChakraBySlug } from "@/server/spirituality/chakraKnowledge";
import {
  awardXp,
  recordDailyActivity,
  calculateLevel,
  getFormattedDateInTimezone,
} from "@/server/gamification/engine";

// GET: Personal Spiritual Learning Dashboard Metrics
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({
        authenticated: false,
        metrics: {
          completedChakrasCount: 0,
          totalChakras: 7,
          meditationSessionsCount: 0,
          meditationMinutesTotal: 0,
          pranayamaSessionsCount: 0,
          pranayamaMinutesTotal: 0,
          mantrasStudiedCount: 0,
          currentStreak: 0,
          totalXp: 0,
          level: calculateLevel(0),
          savedNotes: [],
          bookmarkedSlugs: [],
        },
      });
    }

    const userId = authUser.id;

    // Fetch user with streak and XP
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        currentStreak: true,
        longestStreak: true,
        totalXp: true,
        lastActiveDate: true,
      },
    });

    // 1. Completed Chakras & Bookmarks
    const chakraProgress = await prisma.userKundaliniProgress.findMany({
      where: { userId },
      include: { module: { select: { slug: true, title: true, order: true } } },
    });

    const completedChakras = chakraProgress.filter((p) => p.completed);
    const bookmarkedSlugs = chakraProgress.filter((p) => p.bookmarked).map((p) => p.module?.slug || p.moduleId);

    // 2. Practice logs & XP transactions for spiritual activities
    const [savedConcepts, spiritualTransactions] = await Promise.all([
      prisma.userSavedConcept.findMany({
        where: { userId, category: "KUNDALINI" },
        orderBy: { updatedAt: "desc" },
        take: 20,
      }),
      prisma.xPTransaction.findMany({
        where: {
          userId,
          actionType: { in: ["MEDITATION_SESSION", "PRANAYAMA_SESSION", "MANTRA_STUDY", "CHAKRA_LESSON_COMPLETED"] },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
    ]);

    const meditationTransactions = spiritualTransactions.filter((t) => t.actionType === "MEDITATION_SESSION");
    const pranayamaTransactions = spiritualTransactions.filter((t) => t.actionType === "PRANAYAMA_SESSION");
    const mantraTransactions = spiritualTransactions.filter((t) => t.actionType === "MANTRA_STUDY");

    // Compute approximate minutes from recorded transactions or defaults
    const meditationMinutes = meditationTransactions.reduce((acc, t) => {
      const match = (t.description || "").match(/(\d+)\s*min/);
      return acc + (match ? parseInt(match[1], 10) : 10);
    }, 0);

    const pranayamaMinutes = pranayamaTransactions.reduce((acc, t) => {
      const match = (t.description || "").match(/(\d+)\s*min/);
      return acc + (match ? parseInt(match[1], 10) : 5);
    }, 0);

    const totalXp = user?.totalXp || 0;
    const levelInfo = calculateLevel(totalXp);

    return NextResponse.json({
      authenticated: true,
      metrics: {
        completedChakrasCount: completedChakras.length,
        totalChakras: 7,
        completionPercentage: Math.round((completedChakras.length / 7) * 100),
        meditationSessionsCount: meditationTransactions.length,
        meditationMinutesTotal: meditationMinutes,
        pranayamaSessionsCount: pranayamaTransactions.length,
        pranayamaMinutesTotal: pranayamaMinutes,
        mantrasStudiedCount: mantraTransactions.length,
        currentStreak: user?.currentStreak || 0,
        longestStreak: user?.longestStreak || 0,
        totalXp,
        level: levelInfo,
        savedNotes: savedConcepts.map((sc) => ({
          id: sc.id,
          conceptKey: sc.conceptKey,
          term: sc.term,
          notes: sc.notes,
          updatedAt: sc.updatedAt,
        })),
        bookmarkedSlugs,
        recentActivity: spiritualTransactions.slice(0, 8).map((t) => ({
          id: t.id,
          actionType: t.actionType,
          amount: t.amount,
          description: t.description,
          createdAt: t.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/spirituality/kundalini/progress error:", error);
    return NextResponse.json(
      { error: "Failed to fetch spiritual dashboard metrics", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Record Spiritual Practices, Reflections & Completion
export async function POST(request) {
  try {
    const auth = await requireAuth(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;

    const body = await request.json();
    const {
      moduleId,
      action,
      notes,
      term,
      durationMinutes,
      practiceName,
      meditationTitle,
      cyclesCompleted,
      shlokaId,
    } = body;

    if (!action) {
      return NextResponse.json({ error: "action parameter is required" }, { status: 400 });
    }

    // 1. Handle Guided Pranayama Session Completion
    if (action === "pranayama_session") {
      const minutes = parseInt(durationMinutes, 10) || 5;
      const cycles = parseInt(cyclesCompleted, 10) || 5;
      const name = practiceName || "Classical Pranayama";

      const xpResult = await awardXp({
        userId: user.id,
        actionType: "PRANAYAMA_SESSION",
        amount: 15,
        description: `Completed ${minutes} min pranayama: ${name} (${cycles} cycles)`,
        referenceId: `pranayama-${user.id}-${Date.now()}`,
      });

      const streakResult = await recordDailyActivity({
        userId: user.id,
      });

      return NextResponse.json({
        success: true,
        action,
        xpAwarded: xpResult.amount || 15,
        streak: streakResult.currentStreak || user.currentStreak || 1,
        message: `Pranayama session recorded: ${name} (+${xpResult.amount || 15} XP).`,
      });
    }

    // 2. Handle Guided Meditation Session Completion
    if (action === "meditation_session") {
      const minutes = parseInt(durationMinutes, 10) || 10;
      const title = meditationTitle || "Guided Meditation";

      const xpResult = await awardXp({
        userId: user.id,
        actionType: "MEDITATION_SESSION",
        amount: 25,
        description: `Completed ${minutes} min guided meditation: ${title}`,
        referenceId: `meditation-${user.id}-${Date.now()}`,
      });

      const streakResult = await recordDailyActivity({
        userId: user.id,
      });

      return NextResponse.json({
        success: true,
        action,
        xpAwarded: xpResult.amount || 25,
        streak: streakResult.currentStreak || user.currentStreak || 1,
        message: `Meditation session recorded: ${title} (+${xpResult.amount || 25} XP).`,
      });
    }

    // 3. Handle Sanskrit Mantra Studied
    if (action === "mantra_studied") {
      const id = shlokaId || moduleId || "sacred-mantra";
      const xpResult = await awardXp({
        userId: user.id,
        actionType: "MANTRA_STUDY",
        amount: 15,
        description: `Studied Sanskrit shloka & anvaya: ${term || id}`,
        referenceId: `mantra-${user.id}-${id}`,
      });

      await recordDailyActivity({ userId: user.id });

      // Record in UserRecentTopic
      await prisma.userRecentTopic.create({
        data: {
          userId: user.id,
          topicType: "MANTRA",
          topicId: id,
          title: term || "Sanskrit Shloka",
          sourcePath: `/spirituality/kundalini?shloka=${id}`,
        },
      }).catch(() => null);

      return NextResponse.json({
        success: true,
        action,
        xpAwarded: xpResult.awarded ? xpResult.amount : 0,
        message: `Mantra study recorded (+${xpResult.amount || 15} XP).`,
      });
    }

    // 4. Handle Reflection Notes Save via UserSavedConcept
    if (action === "save_notes") {
      if (!moduleId) {
        return NextResponse.json({ error: "moduleId is required for save_notes" }, { status: 400 });
      }

      const savedNote = await prisma.userSavedConcept.upsert({
        where: {
          userId_conceptKey: {
            userId: user.id,
            conceptKey: `chakra-reflection-${moduleId}`,
          },
        },
        update: {
          notes: notes || "",
          updatedAt: new Date(),
        },
        create: {
          userId: user.id,
          conceptKey: `chakra-reflection-${moduleId}`,
          term: term || moduleId,
          sanskritTerm: null,
          category: "KUNDALINI",
          meaning: "Personal reflection and contemplation notes",
          notes: notes || "",
        },
      });

      return NextResponse.json({
        success: true,
        action,
        savedNote,
        message: "Reflection notes saved successfully.",
      });
    }

    // 5. Handle Chakra Lesson Completion & Bookmark
    if (!moduleId) {
      return NextResponse.json({ error: "moduleId is required" }, { status: 400 });
    }

    // Try finding by id or slug in DB
    let kundaliniModule = await prisma.kundaliniModule.findFirst({
      where: {
        OR: [{ id: moduleId }, { slug: moduleId }],
      },
    });

    // If not in DB yet, check if it's one of the 7 classical chakras and auto-upsert
    if (!kundaliniModule) {
      const chakra = getChakraBySlug(moduleId);
      if (chakra) {
        kundaliniModule = await prisma.kundaliniModule.upsert({
          where: { slug: chakra.slug },
          update: {
            title: `${chakra.sanskritName} (${chakra.englishName})`,
            subtitle: chakra.meaning,
            chakraAssociation: chakra.englishName,
            chakraElement: chakra.element,
            bijaMantra: chakra.bijaMantra,
            historicalContext: chakra.introduction?.traditionalVersusModern,
            practices: chakra.guidedLearning?.safeMindfulnessExercise || {},
            safetyGuidance: chakra.guidedLearning?.safeMindfulnessExercise?.clearStopSignals?.join("; ") || "Practice safely",
            sourceReferences: chakra.sources || [],
            order: chakra.number,
            status: "PUBLISHED",
          },
          create: {
            slug: chakra.slug,
            title: `${chakra.sanskritName} (${chakra.englishName})`,
            subtitle: chakra.meaning,
            chakraAssociation: chakra.englishName,
            chakraElement: chakra.element,
            bijaMantra: chakra.bijaMantra,
            historicalContext: chakra.introduction?.traditionalVersusModern,
            practices: chakra.guidedLearning?.safeMindfulnessExercise || {},
            safetyGuidance: chakra.guidedLearning?.safeMindfulnessExercise?.clearStopSignals?.join("; ") || "Practice safely",
            sourceReferences: chakra.sources || [],
            order: chakra.number,
            status: "PUBLISHED",
          },
        });
      }
    }

    if (!kundaliniModule) {
      return NextResponse.json({ error: `Module '${moduleId}' not found` }, { status: 404 });
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
    } else {
      return NextResponse.json({ error: `Invalid action '${action}'` }, { status: 400 });
    }

    const record = await prisma.userKundaliniProgress.upsert({
      where: {
        userId_moduleId: {
          userId: user.id,
          moduleId: kundaliniModule.id,
        },
      },
      update: updateData,
      create: {
        userId: user.id,
        moduleId: kundaliniModule.id,
        completed: action === "complete",
        completedAt: action === "complete" ? new Date() : null,
        bookmarked: action === "bookmark",
      },
    });

    // Award XP and update streak when marking complete
    let xpResult = { awarded: false, amount: 0 };
    if (action === "complete") {
      xpResult = await awardXp({
        userId: user.id,
        actionType: "CHAKRA_LESSON_COMPLETED",
        amount: 20,
        description: `Completed study of classical center: ${kundaliniModule.title}`,
        referenceId: `chakra-${user.id}-${kundaliniModule.id}`,
      });
      await recordDailyActivity({ userId: user.id });
    }

    return NextResponse.json({
      success: true,
      action,
      record,
      xpAwarded: xpResult.amount || 0,
      message: `Progress for '${kundaliniModule.title}' updated.`,
    });
  } catch (error) {
    console.error("POST /api/spirituality/kundalini/progress error:", error);
    return NextResponse.json(
      { error: "Failed to update Kundalini progress", details: error.message },
      { status: 500 }
    );
  }
}
