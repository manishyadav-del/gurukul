/**
 * Gamification Engine for Gurukul Astrology Platform
 * 
 * Provides:
 * - Deterministic XP award with idempotent database-level unique constraints
 * - Anti-farming cooldowns and daily activity caps
 * - Timezone-aware streak tracking (today, yesterday, missed day)
 * - Level calculation (Levels 1 to 5)
 * - Automated achievement evaluation and badge unlocking
 * - Privacy-respecting weekly and all-time leaderboards
 */

import prisma from "../../lib/prisma.js";
import { REWARD_RULES, LEVEL_THRESHOLDS, INITIAL_ACHIEVEMENTS } from "./constants.js";

/**
 * Returns formatted YYYY-MM-DD string for a date in given timezone.
 */
export function getFormattedDateInTimezone(date = new Date(), timeZone = "Asia/Kolkata") {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timeZone || "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date);
  } catch {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date);
  }
}

/**
 * Calculates day difference between two YYYY-MM-DD date strings.
 * Returns > 0 if dateStr1 is later than dateStr2.
 */
export function getDayDifference(dateStr1, dateStr2) {
  if (!dateStr1 || !dateStr2) return null;
  const d1 = new Date(dateStr1 + "T00:00:00Z");
  const d2 = new Date(dateStr2 + "T00:00:00Z");
  const diffMs = d1.getTime() - d2.getTime();
  return Math.round(diffMs / (24 * 60 * 60 * 1000));
}

/**
 * Calculates user's level and progression metadata from total accumulated XP.
 */
export function calculateLevel(totalXp = 0) {
  const safeXp = Math.max(0, parseInt(totalXp, 10) || 0);

  let currentThreshold = LEVEL_THRESHOLDS[0];
  let currentIdx = 0;

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    const t = LEVEL_THRESHOLDS[i];
    if (safeXp >= t.minXp) {
      currentThreshold = t;
      currentIdx = i;
    } else {
      break;
    }
  }

  const isMaxLevel = currentIdx === LEVEL_THRESHOLDS.length - 1;
  const nextThreshold = isMaxLevel ? null : LEVEL_THRESHOLDS[currentIdx + 1];

  let progressPercent = 100;
  let xpToNextLevel = 0;
  let currentLevelXp = safeXp - currentThreshold.minXp;

  if (!isMaxLevel && nextThreshold) {
    const span = nextThreshold.minXp - currentThreshold.minXp;
    xpToNextLevel = Math.max(0, nextThreshold.minXp - safeXp);
    progressPercent = Math.min(100, Math.max(0, Math.floor((currentLevelXp / span) * 100)));
  }

  return {
    level: currentThreshold.level,
    title: currentThreshold.title,
    sanskritTitle: currentThreshold.sanskritTitle,
    totalXp: safeXp,
    minXp: currentThreshold.minXp,
    maxXp: currentThreshold.maxXp,
    currentLevelXp,
    xpToNextLevel,
    progressPercent,
    isMaxLevel,
    nextLevel: nextThreshold ? nextThreshold.level : null,
  };
}

/**
 * Seeds initial achievements in database if not already present.
 */
export async function seedAchievements() {
  const seeded = [];
  for (const ach of INITIAL_ACHIEVEMENTS) {
    const record = await prisma.achievement.upsert({
      where: { code: ach.code },
      update: {
        title: ach.title,
        description: ach.description,
        badgeIcon: ach.badgeIcon,
        category: ach.category,
        xpReward: ach.xpReward,
        criteria: ach.criteria,
      },
      create: {
        code: ach.code,
        title: ach.title,
        description: ach.description,
        badgeIcon: ach.badgeIcon,
        category: ach.category,
        xpReward: ach.xpReward,
        criteria: ach.criteria,
      },
    });
    seeded.push(record);
  }
  return seeded;
}

/**
 * Awards XP to a user with idempotency protection and anti-farming rules.
 * 
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.actionType
 * @param {number} [params.amount] - Optional override, defaults to REWARD_RULES[actionType].amount
 * @param {string} [params.referenceId] - Unique reference (e.g. chapterId, quizAttemptId, or streak date)
 * @param {string} [params.description]
 * @returns {Promise<Object>} Result of award attempt
 */
export async function awardXp({
  userId,
  actionType,
  amount = null,
  referenceId = null,
  description = null,
  skipCheckAchievements = false,
}) {
  if (!userId) {
    throw new Error("userId is required to award XP");
  }
  if (!actionType) {
    throw new Error("actionType is required to award XP");
  }

  const rule = REWARD_RULES[actionType];
  const finalAmount = typeof amount === "number" ? amount : (rule?.amount || 0);

  if (finalAmount <= 0) {
    return { awarded: false, reason: "ZERO_OR_NEGATIVE_XP", amount: 0 };
  }

  const finalDescription = description || rule?.description || `Reward for ${actionType}`;

  // 1. Check idempotency for referenceId
  if (referenceId) {
    const existing = await prisma.xPTransaction.findUnique({
      where: {
        userId_actionType_referenceId: {
          userId,
          actionType,
          referenceId,
        },
      },
    });
    if (existing) {
      return {
        awarded: false,
        reason: "ALREADY_AWARDED",
        amount: existing.amount,
        transactionId: existing.id,
      };
    }
  }

  // 2. Anti-farming cooldown & daily limits for READING_SESSION
  if (actionType === "READING_SESSION") {
    const cooldownMinutes = rule?.cooldownMinutes || 30;
    const cooldownAgo = new Date(Date.now() - cooldownMinutes * 60 * 1000);

    const recentSession = await prisma.xPTransaction.findFirst({
      where: {
        userId,
        actionType: "READING_SESSION",
        createdAt: { gte: cooldownAgo },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentSession) {
      return {
        awarded: false,
        reason: "COOLDOWN_ACTIVE",
        cooldownMinutes,
        lastAwardedAt: recentSession.createdAt,
      };
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCount = await prisma.xPTransaction.count({
      where: {
        userId,
        actionType: "READING_SESSION",
        createdAt: { gte: startOfDay },
      },
    });

    const maxPerDay = rule?.maxPerDay || 5;
    if (todayCount >= maxPerDay) {
      return {
        awarded: false,
        reason: "DAILY_LIMIT_REACHED",
        maxPerDay,
        todayCount,
      };
    }
  }

  // 3. Atomically persist transaction and increment user totalXp
  try {
    const [tx, updatedUser] = await prisma.$transaction([
      prisma.xPTransaction.create({
        data: {
          userId,
          amount: finalAmount,
          actionType,
          referenceId: referenceId || null,
          description: finalDescription,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          totalXp: { increment: finalAmount },
        },
        select: {
          id: true,
          totalXp: true,
          level: true,
          currentStreak: true,
          longestStreak: true,
        },
      }),
    ]);

    // Recompute level based on updated totalXp
    const levelInfo = calculateLevel(updatedUser.totalXp);
    if (levelInfo.level !== updatedUser.level) {
      await prisma.user.update({
        where: { id: userId },
        data: { level: levelInfo.level },
      });
      updatedUser.level = levelInfo.level;
    }

    // 4. Check for newly unlocked achievements (prevent recursive re-entrancy)
    const newAchievements =
      skipCheckAchievements || actionType === "ACHIEVEMENT_UNLOCKED"
        ? []
        : await checkAchievements(userId);

    return {
      awarded: true,
      amount: finalAmount,
      transactionId: tx.id,
      actionType,
      referenceId,
      totalXp: updatedUser.totalXp,
      level: updatedUser.level,
      levelInfo,
      newAchievements,
    };
  } catch (error) {
    // If unique constraint was hit during race condition
    if (error.code === "P2002") {
      return { awarded: false, reason: "ALREADY_AWARDED" };
    }
    throw error;
  }
}

/**
 * Records daily active study and computes streak based on user's timezone.
 * 
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} [params.userTimezone]
 * @param {Date} [params.customDate] - Used for testing timezone/streak mechanics
 * @returns {Promise<Object>} Updated streak state
 */
export async function recordDailyActivity({ userId, userTimezone = null, customDate = null }) {
  if (!userId) {
    throw new Error("userId is required for daily streak tracking");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      lastActiveDate: true,
      currentStreak: true,
      longestStreak: true,
      timezone: true,
      totalXp: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const effectiveTimezone = userTimezone || user.timezone || "Asia/Kolkata";
  const now = customDate || new Date();
  const todayStr = getFormattedDateInTimezone(now, effectiveTimezone);

  // If user already active today, no streak change
  if (user.lastActiveDate === todayStr) {
    return {
      activeToday: true,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastActiveDate: todayStr,
      bonusAwarded: false,
    };
  }

  let newStreak = 1;
  let streakBonusAwarded = false;

  if (user.lastActiveDate) {
    const diff = getDayDifference(todayStr, user.lastActiveDate);
    if (diff === 1) {
      // Exactly consecutive day
      newStreak = (user.currentStreak || 0) + 1;
    } else {
      // Missed one or more days
      newStreak = 1;
    }
  } else {
    // First time activity
    newStreak = 1;
  }

  const newLongest = Math.max(user.longestStreak || 0, newStreak);

  // Update user streak and lastActiveDate
  await prisma.user.update({
    where: { id: userId },
    data: {
      lastActiveDate: todayStr,
      currentStreak: newStreak,
      longestStreak: newLongest,
      timezone: effectiveTimezone,
    },
  });

  // Award streak bonus XP if streak continued
  if (newStreak > 1) {
    const bonusResult = await awardXp({
      userId,
      actionType: "DAILY_STREAK_BONUS",
      referenceId: `streak-${todayStr}`,
      description: `Daily streak continued (${newStreak} days)`,
    });
    streakBonusAwarded = bonusResult.awarded;
  }

  // Check achievements (e.g. 7-day streak badge)
  const newAchievements = await checkAchievements(userId);

  return {
    activeToday: true,
    currentStreak: newStreak,
    longestStreak: newLongest,
    lastActiveDate: todayStr,
    streakBonusAwarded,
    newAchievements,
  };
}

/**
 * Evaluates achievement criteria and unlocks unearned badges for the user.
 * 
 * @param {string} userId
 * @returns {Promise<Array<Object>>} Newly unlocked achievements
 */
export async function checkAchievements(userId) {
  if (!userId) return [];

  // Ensure initial achievements exist in DB
  await seedAchievements();

  // Load user data, achievements, reading progress, and quiz attempts
  const [user, userAchievements, readingProgress, quizAttempts, achievements] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, currentStreak: true, longestStreak: true, totalXp: true },
    }),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    }),
    prisma.readingProgress.findMany({
      where: { userId },
      include: {
        book: { select: { id: true, language: true, status: true } },
      },
    }),
    prisma.quizAttempt.findMany({
      where: { userId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            topic: true,
            book: { select: { language: true } },
          },
        },
      },
    }),
    prisma.achievement.findMany(),
  ]);

  if (!user) return [];

  const unlockedSet = new Set(userAchievements.map((ua) => ua.achievementId));
  const newlyUnlocked = [];

  for (const ach of achievements) {
    if (unlockedSet.has(ach.id)) continue;

    let qualifies = false;

    switch (ach.code) {
      case "FIRST_CHAPTER": {
        // At least 1 completed chapter or reading progress record with progress >= 100
        qualifies = readingProgress.some((rp) => rp.progress >= 100 || rp.isCompleted);
        break;
      }

      case "FIRST_BOOK": {
        // At least 1 fully completed book (progress >= 100 on book)
        qualifies = readingProgress.some((rp) => rp.progress >= 100 || rp.isCompleted);
        break;
      }

      case "FIRST_QUIZ": {
        // At least 1 completed quiz attempt
        qualifies = quizAttempts.length >= 1;
        break;
      }

      case "QUIZ_MASTER": {
        // 3 distinct quizzes with 100% score
        const perfectQuizIds = new Set();
        for (const qa of quizAttempts) {
          if (qa.percentage >= 100) {
            perfectQuizIds.add(qa.quizId);
          }
        }
        qualifies = perfectQuizIds.size >= 3;
        break;
      }

      case "SANSKRIT_EXPLORER": {
        // Verified Sanskrit scholarship: reading progress in Sanskrit >= 20% or quiz in Sanskrit
        const sanskritReading = readingProgress.some(
          (rp) => rp.book?.language?.toLowerCase() === "sanskrit" && rp.progress >= 20
        );
        const sanskritQuiz = quizAttempts.some(
          (qa) =>
            qa.quiz?.book?.language?.toLowerCase() === "sanskrit" ||
            qa.quiz?.topic?.toLowerCase().includes("sanskrit") ||
            qa.quiz?.title?.toLowerCase().includes("sanskrit")
        );
        qualifies = sanskritReading || sanskritQuiz;
        break;
      }

      case "SEVEN_DAY_STREAK": {
        // Current or longest streak >= 7
        qualifies = (user.currentStreak >= 7) || (user.longestStreak >= 7);
        break;
      }

      default:
        break;
    }

    if (qualifies) {
      try {
        const ua = await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: ach.id,
          },
          include: {
            achievement: true,
          },
        });

        // Award achievement reward XP
        if (ach.xpReward > 0) {
          await awardXp({
            userId,
            actionType: "ACHIEVEMENT_UNLOCKED",
            amount: ach.xpReward,
            referenceId: ach.id,
            description: `Unlocked achievement: ${ach.title}`,
            skipCheckAchievements: true,
          });
        }

        newlyUnlocked.push(ua.achievement);
        unlockedSet.add(ach.id);
      } catch (err) {
        // Ignore unique constraint violation if concurrent check occurred
        if (err.code !== "P2002") {
          console.error("Error creating user achievement:", err);
        }
      }
    }
  }

  return newlyUnlocked;
}

/**
 * Returns full gamification status for a user including badges, XP, and streak.
 * 
 * @param {string} userId
 * @returns {Promise<Object>} Gamification status
 */
export async function getGamificationStatus(userId) {
  if (!userId) {
    return {
      levelInfo: calculateLevel(0),
      currentStreak: 0,
      longestStreak: 0,
      totalXp: 0,
      achievements: [],
      recentTransactions: [],
      isPublicLeaderboard: true,
    };
  }

  // Ensure achievements seeded
  await seedAchievements();

  const [user, allAchievements, userAchievements, recentTransactions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        totalXp: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true,
        timezone: true,
        isPublicLeaderboard: true,
      },
    }),
    prisma.achievement.findMany({
      orderBy: { createdAt: "asc" },
    }),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true, unlockedAt: true },
    }),
    prisma.xPTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  if (!user) {
    return null;
  }

  const unlockedMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt]));

  const enrichedAchievements = allAchievements.map((ach) => ({
    id: ach.id,
    code: ach.code,
    title: ach.title,
    description: ach.description,
    badgeIcon: ach.badgeIcon,
    category: ach.category,
    xpReward: ach.xpReward,
    criteria: ach.criteria,
    unlocked: unlockedMap.has(ach.id),
    unlockedAt: unlockedMap.get(ach.id) || null,
  }));

  const levelInfo = calculateLevel(user.totalXp);

  return {
    userId: user.id,
    name: user.name,
    totalXp: user.totalXp,
    level: user.level,
    levelInfo,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    lastActiveDate: user.lastActiveDate,
    timezone: user.timezone,
    isPublicLeaderboard: user.isPublicLeaderboard,
    achievements: enrichedAchievements,
    unlockedBadgesCount: userAchievements.length,
    totalBadgesCount: allAchievements.length,
    recentTransactions,
  };
}

/**
 * Generates leaderboard with privacy opt-out filtering and strict data sanitization.
 * 
 * @param {Object} params
 * @param {string} [params.type] - "all-time" | "weekly"
 * @param {number} [params.page]
 * @param {number} [params.limit]
 * @param {string} [params.currentUserId]
 * @returns {Promise<Object>} Leaderboard payload
 */
export async function getLeaderboard({
  type = "all-time",
  page = 1,
  limit = 20,
  currentUserId = null,
} = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;

  let leaderboard = [];
  let total = 0;

  if (type === "weekly") {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Group XP transactions from the last 7 days for public users
    const weeklyXpSums = await prisma.xPTransaction.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: sevenDaysAgo },
        user: { isPublicLeaderboard: true },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: "desc",
        },
      },
      take: safeLimit,
      skip,
    });

    const userIds = weeklyXpSums.map((row) => row.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        level: true,
        currentStreak: true,
        _count: { select: { userAchievements: true } },
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    leaderboard = weeklyXpSums.map((row, idx) => {
      const u = userMap.get(row.userId) || {};
      const xp = row._sum.amount || 0;
      return {
        rank: skip + idx + 1,
        userId: row.userId,
        name: u.name || "Anonymous Seeker",
        level: u.level || 1,
        totalXp: xp,
        currentStreak: u.currentStreak || 0,
        badgesCount: u._count?.userAchievements || 0,
      };
    });

    total = await prisma.user.count({
      where: {
        isPublicLeaderboard: true,
        xpTransactions: { some: { createdAt: { gte: sevenDaysAgo } } },
      },
    });
  } else {
    // All-time leaderboard
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: { isPublicLeaderboard: true },
        select: {
          id: true,
          name: true,
          level: true,
          totalXp: true,
          currentStreak: true,
          _count: { select: { userAchievements: true } },
        },
        orderBy: [{ totalXp: "desc" }, { createdAt: "asc" }],
        skip,
        take: safeLimit,
      }),
      prisma.user.count({ where: { isPublicLeaderboard: true } }),
    ]);

    total = totalCount;
    leaderboard = users.map((u, idx) => ({
      rank: skip + idx + 1,
      userId: u.id,
      name: u.name || "Anonymous Seeker",
      level: u.level,
      totalXp: u.totalXp,
      currentStreak: u.currentStreak,
      badgesCount: u._count.userAchievements,
    }));
  }

  // If currentUserId provided, find their rank and privacy state
  let currentUserRank = null;
  if (currentUserId) {
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        id: true,
        name: true,
        level: true,
        totalXp: true,
        currentStreak: true,
        isPublicLeaderboard: true,
        _count: { select: { userAchievements: true } },
      },
    });

    if (currentUser) {
      if (!currentUser.isPublicLeaderboard) {
        currentUserRank = {
          optedOut: true,
          isPublicLeaderboard: false,
          totalXp: currentUser.totalXp,
          level: currentUser.level,
          currentStreak: currentUser.currentStreak,
          badgesCount: currentUser._count.userAchievements,
        };
      } else {
        const higherCount = await prisma.user.count({
          where: {
            isPublicLeaderboard: true,
            totalXp: { gt: currentUser.totalXp },
          },
        });
        currentUserRank = {
          rank: higherCount + 1,
          optedOut: false,
          isPublicLeaderboard: true,
          totalXp: currentUser.totalXp,
          level: currentUser.level,
          currentStreak: currentUser.currentStreak,
          badgesCount: currentUser._count.userAchievements,
        };
      }
    }
  }

  return {
    type,
    page: safePage,
    limit: safeLimit,
    total,
    totalPages: Math.ceil(total / safeLimit),
    leaderboard,
    currentUserRank,
  };
}

/**
 * Toggles a user's leaderboard visibility privacy preference.
 * 
 * @param {Object} params
 * @param {string} params.userId
 * @param {boolean} params.isPublicLeaderboard
 * @returns {Promise<Object>} Updated privacy setting
 */
export async function toggleLeaderboardPrivacy({ userId, isPublicLeaderboard }) {
  if (!userId) {
    throw new Error("userId is required");
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isPublicLeaderboard: Boolean(isPublicLeaderboard) },
    select: {
      id: true,
      name: true,
      isPublicLeaderboard: true,
    },
  });

  return updated;
}
