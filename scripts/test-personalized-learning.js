/**
 * scripts/test-personalized-learning.js
 * 
 * End-to-End Automated Test Suite for:
 * Gurukul Personalized Learning & Recommendation Engine
 * 
 * Tests:
 * 1. Structured Learning Paths (Vedic Astrology & Kundalini)
 * 2. Explainable Recommendation Engine & Shastric Reasoning
 * 3. Daily Goals & Timezone-Aware Streak Tracking
 * 4. XP Idempotency & Duplicate Award Prevention
 * 5. Recent Topics Tracking
 * 6. User Data Isolation
 */

import prisma from "../lib/prisma.js";
import {
  ALL_LEARNING_PATHS,
  getLearningPathsWithProgress,
  toggleLessonCompletion,
} from "../server/learning/learningPaths.js";
import { getExplainableRecommendations } from "../server/learning/recommendationEngine.js";
import {
  getUserDailyGoalsSummary,
  updateUserDailyTargets,
  recordReadingPagesInDailyGoal,
} from "../server/learning/dailyGoals.js";
import {
  awardXp,
  recordDailyActivity,
  getFormattedDateInTimezone,
} from "../server/gamification/engine.js";

async function runPersonalizedLearningTests() {
  console.log("================================================================================");
  console.log("   GURUKUL PERSONALIZED LEARNING & RECOMMENDATION VERIFICATION SUITE           ");
  console.log("================================================================================\n");

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✓ [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  ✗ [FAIL] ${message}`);
      failedTests++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // 1. SETUP TEST USERS (USER A & USER B FOR ISOLATION)
    // -------------------------------------------------------------------------
    console.log("--- 1. Test Setup & Isolation Preparation ---");

    const userA = await prisma.user.upsert({
      where: { email: "student-a-learning@gurukul.ai" },
      update: { timezone: "Asia/Kolkata" },
      create: {
        email: "student-a-learning@gurukul.ai",
        name: "Student Arjuna",
        role: "USER",
        timezone: "Asia/Kolkata",
      },
    });

    const userB = await prisma.user.upsert({
      where: { email: "student-b-learning@gurukul.ai" },
      update: { timezone: "America/New_York" },
      create: {
        email: "student-b-learning@gurukul.ai",
        name: "Student Bharata",
        role: "USER",
        timezone: "America/New_York",
      },
    });

    assert(Boolean(userA.id && userB.id), "Test users A and B initialized");

    // Clean previous test state for these test users
    await prisma.userLearningProgress.deleteMany({
      where: { userId: { in: [userA.id, userB.id] } },
    });
    await prisma.userKundaliniProgress.deleteMany({
      where: { userId: { in: [userA.id, userB.id] } },
    });
    await prisma.userSavedConcept.deleteMany({
      where: { userId: { in: [userA.id, userB.id] } },
    });
    await prisma.userDailyGoal.deleteMany({
      where: { userId: { in: [userA.id, userB.id] } },
    });
    await prisma.userRecentTopic.deleteMany({
      where: { userId: { in: [userA.id, userB.id] } },
    });
    await prisma.xPTransaction.deleteMany({
      where: { userId: { in: [userA.id, userB.id] } },
    });

    console.log("  ✓ Cleaned prior test records for deterministic testing");

    // -------------------------------------------------------------------------
    // 2. STRUCTURED LEARNING PATHS VERIFICATION
    // -------------------------------------------------------------------------
    console.log("\n--- 2. Structured Learning Paths (Astrology & Kundalini) ---");

    assert(ALL_LEARNING_PATHS.length === 2, "Found both canonical learning paths");
    const astroPath = ALL_LEARNING_PATHS.find((p) => p.id === "path-vedic-astrology");
    const kundPath = ALL_LEARNING_PATHS.find((p) => p.id === "path-kundalini-spirituality");

    assert(astroPath.lessons.length === 9, "Vedic Astrology path contains 9 ordered lessons");
    assert(kundPath.lessons.length === 7, "Kundalini path contains 7 ordered lessons");
    assert(
      kundPath.safetyNotice.includes("Kumbhaka"),
      "Kundalini path includes safety notice excluding forced Kumbhaka"
    );

    // Initial progress should be 0%
    const initialPaths = await getLearningPathsWithProgress(userA.id);
    const userAstroInitial = initialPaths.find((p) => p.id === "path-vedic-astrology");
    assert(userAstroInitial.progressPercent === 0, "Initial astrology path progress is 0%");
    assert(userAstroInitial.nextLesson.id === "astro-lesson-1", "Next lesson is Lesson 1 (Intro to Jyotisha)");

    // Complete Lesson 1
    const completeRes = await toggleLessonCompletion({
      userId: userA.id,
      pathId: "path-vedic-astrology",
      lessonId: "astro-lesson-1",
      completed: true,
    });

    assert(completeRes.success, "Successfully completed Lesson 1 in Vedic Astrology path");
    assert(completeRes.xpAward.awarded, `Awarded XP: ${completeRes.xpAward.amount}`);

    // Progress should now be 11% (1/9)
    const updatedPaths = await getLearningPathsWithProgress(userA.id);
    const userAstroUpdated = updatedPaths.find((p) => p.id === "path-vedic-astrology");
    assert(userAstroUpdated.completedCount === 1, "Completed count is now 1");
    assert(userAstroUpdated.progressPercent === 11, "Progress percentage updated to 11%");
    assert(userAstroUpdated.nextLesson.id === "astro-lesson-2", "Next lesson advanced to Lesson 2 (Janma Kundli)");

    // -------------------------------------------------------------------------
    // 3. XP IDEMPOTENCY & DUPLICATE AWARD PREVENTION
    // -------------------------------------------------------------------------
    console.log("\n--- 3. XP Idempotency & Duplicate Prevention ---");

    const duplicateComplete = await toggleLessonCompletion({
      userId: userA.id,
      pathId: "path-vedic-astrology",
      lessonId: "astro-lesson-1",
      completed: true,
    });

    assert(
      duplicateComplete.xpAward.awarded === false,
      "Duplicate completion correctly prevented secondary XP award"
    );
    assert(
      duplicateComplete.xpAward.reason === "ALREADY_AWARDED",
      "Reason confirms ALREADY_AWARDED idempotency"
    );

    // -------------------------------------------------------------------------
    // 4. EXPLAINABLE RECOMMENDATION ENGINE
    // -------------------------------------------------------------------------
    console.log("\n--- 4. Explainable Recommendation Engine ---");

    // Add a completed Kundalini module for Muladhara to trigger ontology resonance
    const muladharaModule = await prisma.kundaliniModule.upsert({
      where: { slug: "muladhara-root-chakra" },
      update: {
        title: "Muladhara Root Center",
        chakraAssociation: "Root",
        chakraElement: "Prithvi (Earth)",
        bijaMantra: "LAM (लं)",
      },
      create: {
        slug: "muladhara-root-chakra",
        title: "Muladhara Root Center",
        chakraAssociation: "Root",
        chakraElement: "Prithvi (Earth)",
        bijaMantra: "LAM (लं)",
        practices: [],
        safetyGuidance: "Gentle awareness",
      },
    });

    await prisma.userKundaliniProgress.upsert({
      where: {
        userId_moduleId: {
          userId: userA.id,
          moduleId: muladharaModule.id,
        },
      },
      update: { completed: true },
      create: {
        userId: userA.id,
        moduleId: muladharaModule.id,
        completed: true,
      },
    });

    // Add a saved concept for Surya Graha
    await prisma.userSavedConcept.upsert({
      where: {
        userId_conceptKey: {
          userId: userA.id,
          conceptKey: "graha-surya",
        },
      },
      update: { term: "Surya", category: "GRAHA" },
      create: {
        userId: userA.id,
        conceptKey: "graha-surya",
        term: "Surya",
        category: "GRAHA",
      },
    });

    // Fetch recommendations for User A
    const recommendations = await getExplainableRecommendations({
      userId: userA.id,
      categoryFilter: "ALL",
    });

    assert(recommendations.length >= 3, `Generated ${recommendations.length} explainable recommendations`);

    // Verify all recommendations have explainability reasons
    const allHaveReasons = recommendations.every((r) => r.reason && r.reason.length > 10);
    assert(allHaveReasons, "Every single recommendation includes an explicit shastric reason");

    // Verify path progression recommendation
    const pathRec = recommendations.find((r) => r.sourceSignal === "LEARNING_PATH_PROGRESSION");
    assert(Boolean(pathRec), "Includes next-step learning path progression recommendation");

    // Verify Muladhara resonance recommendation (Tattva / Bija)
    const chakraRec = recommendations.find((r) => r.sourceSignal === "ONTOLOGY_SUBTLE_RESONANCE");
    assert(Boolean(chakraRec), "Recommends Prithvi Tattva & LAM Bija from completed Muladhara");
    assert(
      chakraRec.reason.includes("Muladhara"),
      `Chakra recommendation explainability verified: "${chakraRec?.reason}"`
    );

    // Verify Surya Graha dignity recommendation
    const grahaRec = recommendations.find((r) => r.sourceSignal === "ONTOLOGY_PLANETARY_DIGNITY");
    assert(Boolean(grahaRec), "Recommends planetary dignity and drishti for studied Surya Graha");

    // Verify Category Filtering
    const astroRecs = await getExplainableRecommendations({
      userId: userA.id,
      categoryFilter: "VEDIC_ASTROLOGY",
    });
    assert(
      astroRecs.every((r) => r.category === "VEDIC_ASTROLOGY"),
      "Category filter 'VEDIC_ASTROLOGY' strictly returns only Vedic Astrology items"
    );

    // -------------------------------------------------------------------------
    // 5. DAILY LEARNING GOALS & TIMEZONE-AWARE STREAKS
    // -------------------------------------------------------------------------
    console.log("\n--- 5. Daily Learning Goals & Timezone-Aware Streaks ---");

    const goalsA = await getUserDailyGoalsSummary(userA.id);
    assert(goalsA.timezone === "Asia/Kolkata", "User A timezone correctly resolved to Asia/Kolkata");
    assert(goalsA.today.targetTopics === 2, "Default target topics initialized to 2");
    assert(goalsA.today.targetPages === 10, "Default target pages initialized to 10");
    assert(goalsA.weeklyProgress.days.length === 7, "Weekly progress returns exactly 7 calendar days");

    // Update daily targets
    const updateTargetRes = await updateUserDailyTargets({
      userId: userA.id,
      targetTopics: 3,
      targetPages: 15,
    });
    assert(updateTargetRes.success, "Successfully updated daily goals targets");
    assert(updateTargetRes.todayGoal.targetTopics === 3, "targetTopics updated to 3");
    assert(updateTargetRes.todayGoal.targetPages === 15, "targetPages updated to 15");

    // Record reading pages into today's goal
    const updatedGoal = await recordReadingPagesInDailyGoal({
      userId: userA.id,
      pagesCount: 5,
    });
    assert(updatedGoal.readPages >= 5, `readPages incremented to ${updatedGoal.readPages}`);

    // Streak test
    const streakRes = await recordDailyActivity({
      userId: userA.id,
      userTimezone: "Asia/Kolkata",
    });
    assert(streakRes.currentStreak >= 1, `Current streak active: ${streakRes.currentStreak}`);

    // -------------------------------------------------------------------------
    // 6. RECENT TOPICS TRACKING
    // -------------------------------------------------------------------------
    console.log("\n--- 6. Recent Topics Tracking ---");

    await prisma.userRecentTopic.upsert({
      where: {
        userId_topicKey: {
          userId: userA.id,
          topicKey: "chakra-anahata",
        },
      },
      update: { viewedAt: new Date() },
      create: {
        userId: userA.id,
        topicKey: "chakra-anahata",
        title: "Anahata Heart Chakra",
        category: "KUNDALINI",
        url: "/explore?category=chakras",
      },
    });

    const recent = await prisma.userRecentTopic.findMany({
      where: { userId: userA.id },
    });
    assert(recent.length >= 1, `Persisted ${recent.length} recent topics`);
    assert(recent[0].topicKey === "chakra-anahata", "Verified topicKey 'chakra-anahata'");

    // -------------------------------------------------------------------------
    // 7. USER DATA ISOLATION (USER A vs USER B)
    // -------------------------------------------------------------------------
    console.log("\n--- 7. User Data Isolation ---");

    const goalsB = await getUserDailyGoalsSummary(userB.id);
    assert(goalsB.timezone === "America/New_York", "User B timezone is America/New_York");
    assert(goalsB.today.studiedTopics === 0, "User B has 0 studied topics (isolated from User A)");
    assert(goalsB.today.readPages === 0, "User B has 0 read pages (isolated from User A)");

    const pathsB = await getLearningPathsWithProgress(userB.id);
    const userBAstro = pathsB.find((p) => p.id === "path-vedic-astrology");
    assert(userBAstro.progressPercent === 0, "User B path progress is 0% (isolated from User A's 11%)");

    // -------------------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------------------
    await prisma.userLearningProgress.deleteMany({
      where: { userId: { in: [userA.id, userB.id] } },
    });
    await prisma.userKundaliniProgress.deleteMany({
      where: { userId: { in: [userA.id, userB.id] } },
    });
    await prisma.userSavedConcept.deleteMany({
      where: { userId: { in: [userA.id, userB.id] } },
    });
    await prisma.userDailyGoal.deleteMany({
      where: { userId: { in: [userA.id, userB.id] } },
    });
    await prisma.userRecentTopic.deleteMany({
      where: { userId: { in: [userA.id, userB.id] } },
    });
    await prisma.xPTransaction.deleteMany({
      where: { userId: { in: [userA.id, userB.id] } },
    });
    console.log("  ✓ Cleaned up test user data");

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log("\n================================================================================");
    console.log(`TOTAL TESTS: ${totalTests}`);
    console.log(`PASSED:      ${passedTests}`);
    console.log(`FAILED:      ${failedTests}`);
    console.log("================================================================================\n");

    if (failedTests > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error("Test execution threw error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPersonalizedLearningTests();
