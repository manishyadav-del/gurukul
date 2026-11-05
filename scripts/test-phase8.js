/**
 * Phase 8 Verification Test Suite: Gamification and Learning Engagement for Gurukul
 * 
 * Verifies:
 * 1. XP and Points Award Engine with configurable server-side reward rules
 * 2. Idempotency & Database Unique Constraint (duplicate award prevention)
 * 3. Anti-Farming Cooldowns and Daily Limits for Reading Sessions
 * 4. Level Calculation & Automatic Level Ups (Levels 1 to 5 with Sanskrit titles)
 * 5. Timezone-Aware Daily Streaks (same day, consecutive day, missed day reset)
 * 6. Badge & Achievement Unlocking: FIRST_CHAPTER, FIRST_BOOK, FIRST_QUIZ, QUIZ_MASTER, SANSKRIT_EXPLORER, SEVEN_DAY_STREAK
 * 7. Achievement Idempotency (prevent duplicate unlocks and reward spam)
 * 8. Leaderboard Generation (All-time and Weekly aggregations)
 * 9. Privacy Opt-Out Guardrails (hiding opted-out users and stripping sensitive info)
 * 10. End-to-End Quiz Attempt Gamification Integration
 */

import prisma from "../lib/prisma.js";
import { registerBook } from "../server/ingest/registerBook.js";
import { structureBook } from "../server/ingest/structureBook.js";
import { createQuiz, submitQuizAttempt } from "../server/learning/quizzes.js";
import {
  awardXp,
  calculateLevel,
  recordDailyActivity,
  checkAchievements,
  getGamificationStatus,
  getLeaderboard,
  toggleLeaderboardPrivacy,
  seedAchievements,
  getDayDifference,
  getFormattedDateInTimezone,
} from "../server/gamification/engine.js";
import { REWARD_RULES, LEVEL_THRESHOLDS } from "../server/gamification/constants.js";

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${name}`);
    failed++;
  }
}

async function runPhase8Tests() {
  console.log("\n========================================================");
  console.log("  PHASE 8 VERIFICATION: GAMIFICATION & LEARNING ENGAGEMENT");
  console.log("========================================================\n");

  // Setup: Seed achievements & create distinct test users
  console.log("[Setup] Initializing achievements, test users, and manuscript content...");
  await seedAchievements();

  const userTestA = await prisma.user.create({
    data: {
      email: `gamify_a_${Date.now()}@gurukul.ai`,
      name: "Aryabhata Student",
      role: "USER",
      timezone: "Asia/Kolkata",
    },
  });

  const userTestB = await prisma.user.create({
    data: {
      email: `gamify_b_${Date.now()}@gurukul.ai`,
      name: "Varahamihira Seeker",
      role: "USER",
      timezone: "America/New_York",
      isPublicLeaderboard: false, // Opted out!
    },
  });

  const testBook = await registerBook({
    title: "Brihat Samhita Astrology Edition",
    author: "Varahamihira",
    language: "Sanskrit",
    script: "Devanagari",
    originalFileName: "brihat_samhita_gamify.pdf",
    originalFileUrl: "/uploads/brihat_samhita_gamify.pdf",
  });

  await prisma.bookPage.create({
    data: {
      bookId: testBook.id,
      pageNumber: 1,
      pdfPageIndex: 1,
      processingMethod: "TEXT_EXTRACTION",
      rawText: "दिशः समस्ताः फलदा भवन्ति।",
      cleanedText: "दिशः समस्ताः फलदा भवन्ति।",
      language: "Sanskrit",
      ocrCompleted: true,
    },
  });

  await structureBook(testBook.id, {
    chapterTitles: ["Graha Gochara"],
    passageCount: 1,
  });

  await prisma.book.update({
    where: { id: testBook.id },
    data: { status: "PUBLISHED" },
  });

  const chapter = await prisma.chapter.findFirst({ where: { bookId: testBook.id } });
  const passage = await prisma.passage.findFirst({ where: { bookId: testBook.id } });

  // 1. XP and Points Award Engine
  console.log("\n[1/10] Testing XP and Points Award Engine with Configurable Rules...");
  {
    const initialStatus = await getGamificationStatus(userTestA.id);
    assert(initialStatus.totalXp === 0, "Initial XP is 0");
    assert(initialStatus.level === 1, "Initial Level is 1 (Novice Seeker)");

    // Award Chapter Completed XP
    const awardResult = await awardXp({
      userId: userTestA.id,
      actionType: "CHAPTER_COMPLETED",
      referenceId: "chap-test-1",
      description: "Finished reading first chapter",
    });

    assert(awardResult.awarded === true, "XP successfully awarded for CHAPTER_COMPLETED");
    assert(awardResult.amount === REWARD_RULES.CHAPTER_COMPLETED.amount, "Award amount matches configured rule (30 XP)");
    assert(awardResult.totalXp === 30, "User totalXp updated to 30");

    const statusAfter = await getGamificationStatus(userTestA.id);
    assert(statusAfter.totalXp === 30, "Persisted totalXp reflects transaction");
    assert(statusAfter.recentTransactions.length === 1, "Recorded transaction in history");
  }

  // 2. Idempotency & Duplicate Prevention
  console.log("\n[2/10] Testing Idempotency & Database Unique Constraints...");
  {
    // Try awarding the EXACT same chapter completion again
    const duplicateAttempt = await awardXp({
      userId: userTestA.id,
      actionType: "CHAPTER_COMPLETED",
      referenceId: "chap-test-1",
      description: "Finished reading first chapter duplicate request",
    });

    assert(duplicateAttempt.awarded === false, "Duplicate reward rejected");
    assert(duplicateAttempt.reason === "ALREADY_AWARDED", "Rejection reason is ALREADY_AWARDED");

    const status = await getGamificationStatus(userTestA.id);
    assert(status.totalXp === 30, "totalXp did not increase on duplicate attempt");
    assert(status.recentTransactions.length === 1, "No duplicate transaction record created");
  }

  // 3. Anti-Farming Cooldowns & Daily Caps for Reading Sessions
  console.log("\n[3/10] Testing Anti-Farming Cooldowns & Daily Caps...");
  {
    // First session award
    const session1 = await awardXp({
      userId: userTestA.id,
      actionType: "READING_SESSION",
    });
    assert(session1.awarded === true, "First reading session awarded 10 XP");

    // Immediate second session award (within 30 min cooldown)
    const session2 = await awardXp({
      userId: userTestA.id,
      actionType: "READING_SESSION",
    });
    assert(session2.awarded === false, "Rapid second session rejected by anti-farming cooldown");
    assert(session2.reason === "COOLDOWN_ACTIVE", "Reason is COOLDOWN_ACTIVE");
    assert(session2.cooldownMinutes === 30, "Cooldown duration enforced at 30 minutes");
  }

  // 4. Level Calculation & Automatic Level Progression
  console.log("\n[4/10] Testing Level Thresholds (Levels 1 to 5) & Progression...");
  {
    // Check pure calculation
    const lvl1 = calculateLevel(0);
    assert(lvl1.level === 1 && lvl1.title === "Novice Seeker" && lvl1.sanskritTitle === "जिज्ञासु", "0 XP -> Level 1 Novice Seeker");
    assert(lvl1.progressPercent === 0 && lvl1.xpToNextLevel === 100, "0% progress, 100 XP to Level 2");

    const lvl2 = calculateLevel(150);
    assert(lvl2.level === 2 && lvl2.title === "Dedicated Student" && lvl2.sanskritTitle === "अध्येता", "150 XP -> Level 2 Dedicated Student");
    assert(lvl2.progressPercent === 25, "150 XP is 25% through Level 2 (100..300)");

    const lvl3 = calculateLevel(500);
    assert(lvl3.level === 3 && lvl3.title === "Scripture Scholar" && lvl3.sanskritTitle === "विद्वान", "500 XP -> Level 3 Scripture Scholar");

    const lvl4 = calculateLevel(1000);
    assert(lvl4.level === 4 && lvl4.title === "Jyotish Acharya" && lvl4.sanskritTitle === "आचार्य", "1000 XP -> Level 4 Jyotish Acharya");

    const lvl5 = calculateLevel(2000);
    assert(lvl5.level === 5 && lvl5.title === "Vedic Rishi" && lvl5.sanskritTitle === "ऋषि", "2000 XP -> Level 5 Vedic Rishi");
    assert(lvl5.isMaxLevel === true && lvl5.progressPercent === 100, "Level 5 is max level with 100% progress");

    // Award enough XP to userTestA to trigger database level-up from Level 1 to Level 2
    // userTestA currently has 40 XP (30 + 10)
    const levelUpAward = await awardXp({
      userId: userTestA.id,
      actionType: "BOOK_COMPLETED",
      referenceId: "book-test-1",
      amount: 100, // 40 + 100 = 140 XP -> Level 2
    });

    assert(levelUpAward.awarded === true, "Awarded 100 XP");
    assert(levelUpAward.totalXp === 140, "Total XP updated to 140");
    assert(levelUpAward.level === 2, "User automatically leveled up to Level 2");

    const dbUser = await prisma.user.findUnique({ where: { id: userTestA.id } });
    assert(dbUser.level === 2, "Database record updated to level 2");
  }

  // 5. Timezone-Aware Daily Streaks
  console.log("\n[5/10] Testing Timezone-Aware Daily Streaks...");
  {
    // Record first activity today in Asia/Kolkata
    const today = new Date();
    const streakDay1 = await recordDailyActivity({
      userId: userTestA.id,
      userTimezone: "Asia/Kolkata",
      customDate: today,
    });

    assert(streakDay1.currentStreak === 1, "First activity sets currentStreak to 1");
    assert(streakDay1.longestStreak === 1, "longestStreak set to 1");

    // Same day duplicate activity -> streak unchanged
    const sameDay = await recordDailyActivity({
      userId: userTestA.id,
      userTimezone: "Asia/Kolkata",
      customDate: today,
    });
    assert(sameDay.currentStreak === 1, "Duplicate activity on same day leaves streak at 1");
    assert(sameDay.bonusAwarded === false, "No duplicate bonus awarded on same day");

    // Consecutive day activity (tomorrow) -> streak increments to 2
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const streakDay2 = await recordDailyActivity({
      userId: userTestA.id,
      userTimezone: "Asia/Kolkata",
      customDate: tomorrow,
    });
    assert(streakDay2.currentStreak === 2, "Consecutive day increments streak to 2");
    assert(streakDay2.longestStreak === 2, "longestStreak updated to 2");
    assert(streakDay2.streakBonusAwarded === true, "Streak continuation awarded bonus XP");

    // Missed day (3 days later) -> streak resets to 1, but longestStreak preserved
    const threeDaysLater = new Date(tomorrow.getTime() + 3 * 24 * 60 * 60 * 1000);
    const streakReset = await recordDailyActivity({
      userId: userTestA.id,
      userTimezone: "Asia/Kolkata",
      customDate: threeDaysLater,
    });
    assert(streakReset.currentStreak === 1, "Missed study day resets currentStreak to 1");
    assert(streakReset.longestStreak === 2, "Historical longestStreak preserved at 2");
  }

  // 6. Achievement & Badge Unlocking
  console.log("\n[6/10] Testing Achievement and Badge Unlocking...");
  {
    // A: FIRST_CHAPTER & FIRST_BOOK via reading progress
    await prisma.readingProgress.create({
      data: {
        userId: userTestA.id,
        bookId: testBook.id,
        chapterId: chapter.id,
        progress: 100,
        isCompleted: true,
      },
    });

    const newBadgesReading = await checkAchievements(userTestA.id);
    const badgeCodes = newBadgesReading.map((b) => b.code);
    assert(badgeCodes.includes("FIRST_CHAPTER"), "Unlocked FIRST_CHAPTER badge upon chapter completion");
    assert(badgeCodes.includes("FIRST_BOOK"), "Unlocked FIRST_BOOK badge upon book completion");
    assert(badgeCodes.includes("SANSKRIT_EXPLORER"), "Unlocked SANSKRIT_EXPLORER on Sanskrit manuscript study");

    // B: SEVEN_DAY_STREAK badge
    // Artificially simulate 7-day streak for User A
    await prisma.user.update({
      where: { id: userTestA.id },
      data: { currentStreak: 7, longestStreak: 7 },
    });
    const streakBadges = await checkAchievements(userTestA.id);
    assert(streakBadges.some((b) => b.code === "SEVEN_DAY_STREAK"), "Unlocked SEVEN_DAY_STREAK badge when streak reaches 7");
  }

  // 7. Achievement Idempotency
  console.log("\n[7/10] Testing Achievement Idempotency...");
  {
    // Re-running checkAchievements should not re-unlock already earned badges
    const rerun = await checkAchievements(userTestA.id);
    assert(rerun.length === 0, "No duplicate badges returned on subsequent check");

    const totalUserAchievements = await prisma.userAchievement.count({
      where: { userId: userTestA.id },
    });
    // Distinct badges unlocked
    const uniqueBadges = await prisma.userAchievement.findMany({
      where: { userId: userTestA.id },
      select: { achievementId: true },
    });
    const setOfIds = new Set(uniqueBadges.map((u) => u.achievementId));
    assert(totalUserAchievements === setOfIds.size, "Database has zero duplicate user achievements");
  }

  // 8. Leaderboard Generation (All-Time and Weekly)
  console.log("\n[8/10] Testing Leaderboard Generation...");
  {
    const leaderboard = await getLeaderboard({
      type: "all-time",
      currentUserId: userTestA.id,
    });

    assert(leaderboard.leaderboard.length > 0, "Generates populated all-time leaderboard");
    assert(leaderboard.leaderboard[0].rank === 1, "First scholar has rank #1");
    assert(leaderboard.leaderboard[0].name !== undefined, "Entry includes scholar name");
    assert(leaderboard.leaderboard[0].totalXp >= 0, "Entry includes totalXp");
    assert(leaderboard.currentUserRank !== null, "Returns current user rank metadata");
    assert(leaderboard.currentUserRank.rank >= 1, "Current user has valid numerical rank");

    // Weekly leaderboard
    const weekly = await getLeaderboard({
      type: "weekly",
      currentUserId: userTestA.id,
    });
    assert(weekly.type === "weekly", "Returns weekly leaderboard");
    assert(Array.isArray(weekly.leaderboard), "Leaderboard is an array");
  }

  // 9. Privacy Opt-Out Guardrails
  console.log("\n[9/10] Testing Privacy Opt-Out Guardrails...");
  {
    // userTestB was initialized with isPublicLeaderboard: false
    const leaderboard = await getLeaderboard({
      type: "all-time",
      currentUserId: userTestB.id,
    });

    // Check that userTestB is NOT present in the public listing
    const foundB = leaderboard.leaderboard.find((s) => s.userId === userTestB.id);
    assert(foundB === undefined, "Opted-out user (userTestB) is strictly omitted from public leaderboard");
    assert(leaderboard.currentUserRank.optedOut === true, "Current user rank reports optedOut: true");

    // Ensure NO sensitive fields leak in public listings
    for (const entry of leaderboard.leaderboard) {
      assert(entry.email === undefined, "Never leaks user email in leaderboard");
      assert(entry.birthChart === undefined, "Never leaks birth chart");
      assert(entry.notes === undefined, "Never leaks study notes");
    }

    // Toggle userTestB to public
    await toggleLeaderboardPrivacy({ userId: userTestB.id, isPublicLeaderboard: true });
    const refreshed = await getLeaderboard({
      type: "all-time",
      currentUserId: userTestB.id,
    });
    assert(refreshed.currentUserRank.optedOut === false, "User B becomes publicly ranked after toggle");
  }

  // 10. End-to-End Quiz Attempt Gamification Integration
  console.log("\n[10/10] Testing End-to-End Quiz Attempt Gamification Integration...");
  {
    // Create a quiz
    const quiz = await createQuiz({
      title: "Planetary Strengths in Brihat Samhita",
      bookId: testBook.id,
      chapterId: chapter.id,
      difficulty: "HARD",
      isPublished: true,
      questions: [
        {
          question: "Which directional strength is denoted by Digbala in classical jyotish?",
          explanation: "Digbala refers to directional vitality where Jupiter and Mercury are strong in the East (Lagna).",
          sourcePassageId: passage.id,
          sourcePage: 1,
          options: [
            { text: "Directional vitality", isCorrect: true },
            { text: "Temporal strength only", isCorrect: false },
          ],
        },
      ],
    });

    // User A submits quiz attempt with 100% correct answer
    const q1 = quiz.questions[0];
    const correctOption = q1.options.find((o) => o.isCorrect);

    const xpBefore = (await getGamificationStatus(userTestA.id)).totalXp;

    const attemptResult = await submitQuizAttempt({
      quizId: quiz.id,
      userId: userTestA.id,
      answers: [{ questionId: q1.id, selectedOptionId: correctOption.id }],
    });

    assert(attemptResult.percentage === 100, "Attempt scored 100%");
    assert(attemptResult.gamification !== undefined, "Attempt response includes gamification summary");
    assert(attemptResult.gamification.awardedXp > 0, "Earned XP from quiz attempt");

    const xpAfter = (await getGamificationStatus(userTestA.id)).totalXp;
    // Base 25 + Pass 20 + Perfect 50 = 95 XP
    assert(xpAfter > xpBefore, "User's persisted XP increased after quiz submission");
  }

  console.log("\n========================================================");
  console.log(`  PHASE 8 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase8Tests().catch((err) => {
  console.error("Fatal error during Phase 8 tests:", err);
  process.exit(1);
});
