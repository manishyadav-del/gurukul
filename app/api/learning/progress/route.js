import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { awardXp, recordDailyActivity } from "@/server/gamification/engine";

// GET /api/learning/progress
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authUser.id;

    const [learningProgress, kundaliniProgress] = await Promise.all([
      prisma.userLearningProgress.findMany({
        where: { userId },
        include: {
          module: {
            select: { id: true, title: true, slug: true, category: true, difficulty: true },
          },
          lesson: {
            select: { id: true, title: true, slug: true, durationMin: true },
          },
        },
        orderBy: { lastStudied: "desc" },
      }),
      prisma.userKundaliniProgress.findMany({
        where: { userId },
        include: {
          module: {
            select: { id: true, title: true, slug: true, level: true, chakraAssociation: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      learningProgress,
      kundaliniProgress,
    });
  } catch (error) {
    console.error("GET /api/learning/progress error:", error);
    return NextResponse.json(
      { error: "Failed to fetch learning progress", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/learning/progress
export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authUser.id;
    const body = await request.json();
    const { moduleId, lessonId, completed, action } = body;

    if (!moduleId) {
      return NextResponse.json({ error: "moduleId is required" }, { status: 400 });
    }

    // Check if this is a standard learning module or kundalini module
    const [standardModule, kundaliniModule] = await Promise.all([
      prisma.learningModule.findUnique({
        where: { id: moduleId },
        include: { lessons: { select: { id: true } } },
      }),
      prisma.kundaliniModule.findUnique({
        where: { id: moduleId },
      }),
    ]);

    if (!standardModule && !kundaliniModule) {
      return NextResponse.json({ error: "Learning module not found" }, { status: 404 });
    }

    let isMarkedCompleted = typeof completed === "boolean" ? completed : action === "complete";

    // 1. Handle Kundalini module progress
    if (kundaliniModule) {
      const record = await prisma.userKundaliniProgress.upsert({
        where: {
          userId_moduleId: {
            userId,
            moduleId: kundaliniModule.id,
          },
        },
        update: {
          completed: isMarkedCompleted,
          completedAt: isMarkedCompleted ? new Date() : null,
          updatedAt: new Date(),
        },
        create: {
          userId,
          moduleId: kundaliniModule.id,
          completed: isMarkedCompleted,
          completedAt: isMarkedCompleted ? new Date() : null,
        },
      });

      if (isMarkedCompleted) {
        await recordDailyActivity({ userId });
        await awardXp({
          userId,
          actionType: "CHAPTER_COMPLETED",
          referenceId: `kundalini-${kundaliniModule.id}`,
          description: `Completed study module: ${kundaliniModule.title}`,
        });
      }

      return NextResponse.json({ success: true, type: "KUNDALINI", progress: record });
    }

    // 2. Handle Foundational LearningModule progress
    const record = await prisma.userLearningProgress.upsert({
      where: {
        userId_moduleId_lessonId: {
          userId,
          moduleId: standardModule.id,
          lessonId: lessonId || null,
        },
      },
      update: {
        completed: isMarkedCompleted,
        completedAt: isMarkedCompleted ? new Date() : null,
        lastStudied: new Date(),
        updatedAt: new Date(),
      },
      create: {
        userId,
        moduleId: standardModule.id,
        lessonId: lessonId || null,
        completed: isMarkedCompleted,
        completedAt: isMarkedCompleted ? new Date() : null,
      },
    });

    if (isMarkedCompleted) {
      await recordDailyActivity({ userId });
      await awardXp({
        userId,
        actionType: "CHAPTER_COMPLETED",
        referenceId: `lesson-${lessonId || standardModule.id}`,
        description: `Completed lesson in ${standardModule.title}`,
      });
    }

    return NextResponse.json({ success: true, type: "STANDARD", progress: record });
  } catch (error) {
    console.error("POST /api/learning/progress error:", error);
    return NextResponse.json(
      { error: "Failed to update learning progress", details: error.message },
      { status: 500 }
    );
  }
}
