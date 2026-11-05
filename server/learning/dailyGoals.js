/**
 * server/learning/dailyGoals.js
 * 
 * Timezone-aware Daily Learning Goals, Weekly Progress Summary, and Streak Engine.
 * Integrates with PostgreSQL via Prisma:
 * - UserDailyGoal
 * - User (currentStreak, longestStreak, lastActiveDate, timezone)
 * - XPTransaction (XP earned today / weekly)
 */

import prisma from "../../lib/prisma.js";
import { getFormattedDateInTimezone, getDayDifference } from "../gamification/engine.js";

/**
 * Retrieves today's daily learning goals and 7-day weekly activity summary.
 * 
 * @param {string} userId
 * @returns {Promise<Object>} Goals, streak, and weekly progress
 */
export async function getUserDailyGoalsSummary(userId) {
  if (!userId) {
    return getGuestDailyGoalsPreview();
  }

  // 1. Fetch user timezone and streak metadata
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      timezone: true,
      currentStreak: true,
      longestStreak: true,
      lastActiveDate: true,
      totalXp: true,
      level: true,
    },
  });

  if (!user) {
    return getGuestDailyGoalsPreview();
  }

  const effectiveTz = user.timezone || "Asia/Kolkata";
  const todayStr = getFormattedDateInTimezone(new Date(), effectiveTz);

  // 2. Fetch or initialize today's goal record
  let todayGoal = await prisma.userDailyGoal.findUnique({
    where: {
      userId_date: {
        userId,
        date: todayStr,
      },
    },
  });

  if (!todayGoal) {
    // Check previous day to carry over custom target settings if any
    const previousGoal = await prisma.userDailyGoal.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const targetTopics = previousGoal?.targetTopics || 2;
    const targetPages = previousGoal?.targetPages || 10;

    todayGoal = await prisma.userDailyGoal.create({
      data: {
        userId,
        date: todayStr,
        targetTopics,
        studiedTopics: 0,
        targetPages,
        readPages: 0,
        isCompleted: false,
      },
    });
  }

  // Check if today meets completion condition
  const meetsCriteria =
    todayGoal.studiedTopics >= todayGoal.targetTopics &&
    todayGoal.readPages >= todayGoal.targetPages;

  if (meetsCriteria && !todayGoal.isCompleted) {
    todayGoal = await prisma.userDailyGoal.update({
      where: { id: todayGoal.id },
      data: { isCompleted: true },
    });
  }

  // 3. Compute Weekly Progress Summary (Last 7 Calendar Days in User Timezone)
  const weeklyDays = [];
  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getFormattedDateInTimezone(d, effectiveTz);
    const dayOfWeek = DAY_NAMES[d.getDay()];
    weeklyDays.push({ date: dateStr, dayOfWeek });
  }

  const weeklyDates = weeklyDays.map((w) => w.date);

  const [historyGoals, weeklyXp] = await Promise.all([
    prisma.userDailyGoal.findMany({
      where: {
        userId,
        date: { in: weeklyDates },
      },
    }),
    prisma.xPTransaction.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    }),
  ]);

  const historyMap = new Map(historyGoals.map((g) => [g.date, g]));

  const weeklySummary = weeklyDays.map((w) => {
    const goal = historyMap.get(w.date);
    const isToday = w.date === todayStr;

    // Filter XP for this day in user timezone
    const dayXp = weeklyXp
      .filter((tx) => getFormattedDateInTimezone(tx.createdAt, effectiveTz) === w.date)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const studied = goal?.studiedTopics || 0;
    const read = goal?.readPages || 0;
    const isCompleted = Boolean(goal?.isCompleted);
    const active = studied > 0 || read > 0 || dayXp > 0;

    return {
      date: w.date,
      dayOfWeek: w.dayOfWeek,
      isToday,
      active,
      studiedTopics: studied,
      readPages: read,
      isCompleted,
      xpEarned: dayXp,
    };
  });

  const totalWeeklyXp = weeklySummary.reduce((sum, d) => sum + d.xpEarned, 0);
  const totalWeeklyTopics = weeklySummary.reduce((sum, d) => sum + d.studiedTopics, 0);
  const totalWeeklyPages = weeklySummary.reduce((sum, d) => sum + d.readPages, 0);
  const activeDaysCount = weeklySummary.filter((d) => d.active).length;

  // Streak status
  const activeToday = user.lastActiveDate === todayStr;

  return {
    timezone: effectiveTz,
    today: {
      date: todayStr,
      targetTopics: todayGoal.targetTopics,
      studiedTopics: todayGoal.studiedTopics,
      topicsProgressPercent: Math.min(
        100,
        Math.round((todayGoal.studiedTopics / Math.max(1, todayGoal.targetTopics)) * 100)
      ),
      targetPages: todayGoal.targetPages,
      readPages: todayGoal.readPages,
      pagesProgressPercent: Math.min(
        100,
        Math.round((todayGoal.readPages / Math.max(1, todayGoal.targetPages)) * 100)
      ),
      isCompleted: Boolean(todayGoal.isCompleted),
    },
    streak: {
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      lastActiveDate: user.lastActiveDate,
      activeToday,
    },
    weeklyProgress: {
      activeDaysCount,
      totalWeeklyXp,
      totalWeeklyTopics,
      totalWeeklyPages,
      days: weeklySummary,
    },
  };
}

/**
 * Updates daily targets for user (targetTopics, targetPages).
 * 
 * @param {Object} params
 * @param {string} params.userId
 * @param {number} [params.targetTopics]
 * @param {number} [params.targetPages]
 * @returns {Promise<Object>} Updated goal
 */
export async function updateUserDailyTargets({ userId, targetTopics, targetPages }) {
  if (!userId) {
    throw new Error("Authentication required to update daily targets.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  });
  const tz = user?.timezone || "Asia/Kolkata";
  const todayStr = getFormattedDateInTimezone(new Date(), tz);

  const safeTopics = typeof targetTopics === "number" && targetTopics > 0 ? Math.min(20, targetTopics) : undefined;
  const safePages = typeof targetPages === "number" && targetPages > 0 ? Math.min(100, targetPages) : undefined;

  const updateData = {};
  if (safeTopics !== undefined) updateData.targetTopics = safeTopics;
  if (safePages !== undefined) updateData.targetPages = safePages;

  const updatedGoal = await prisma.userDailyGoal.upsert({
    where: {
      userId_date: {
        userId,
        date: todayStr,
      },
    },
    update: updateData,
    create: {
      userId,
      date: todayStr,
      targetTopics: safeTopics || 2,
      targetPages: safePages || 10,
      studiedTopics: 0,
      readPages: 0,
    },
  });

  return { success: true, todayGoal: updatedGoal };
}

/**
 * Records reading progress increments into today's daily goal.
 * 
 * @param {Object} params
 * @param {string} params.userId
 * @param {number} params.pagesCount
 * @returns {Promise<Object>}
 */
export async function recordReadingPagesInDailyGoal({ userId, pagesCount = 1 }) {
  if (!userId || pagesCount <= 0) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  });
  const tz = user?.timezone || "Asia/Kolkata";
  const todayStr = getFormattedDateInTimezone(new Date(), tz);

  const goal = await prisma.userDailyGoal.upsert({
    where: {
      userId_date: {
        userId,
        date: todayStr,
      },
    },
    update: {
      readPages: { increment: pagesCount },
    },
    create: {
      userId,
      date: todayStr,
      readPages: pagesCount,
      targetPages: 10,
      studiedTopics: 0,
      targetTopics: 2,
    },
  });

  return goal;
}

function getGuestDailyGoalsPreview() {
  return {
    timezone: "Asia/Kolkata",
    today: {
      date: getFormattedDateInTimezone(new Date(), "Asia/Kolkata"),
      targetTopics: 2,
      studiedTopics: 0,
      topicsProgressPercent: 0,
      targetPages: 10,
      readPages: 0,
      pagesProgressPercent: 0,
      isCompleted: false,
    },
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      activeToday: false,
    },
    weeklyProgress: {
      activeDaysCount: 0,
      totalWeeklyXp: 0,
      totalWeeklyTopics: 0,
      totalWeeklyPages: 0,
      days: [],
    },
  };
}
