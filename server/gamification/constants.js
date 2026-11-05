/**
 * Gamification System Constants: Reward Rules, Levels, and Achievement Definitions
 */

// Configurable Reward Rules (XP)
export const REWARD_RULES = {
  READING_SESSION: {
    amount: 10,
    cooldownMinutes: 30, // Anti-farming cooldown
    maxPerDay: 5,
    description: "Completed active scripture reading session",
  },
  CHAPTER_COMPLETED: {
    amount: 30,
    description: "Completed manuscript chapter",
  },
  BOOK_COMPLETED: {
    amount: 120,
    description: "Completed full classical book",
  },
  QUIZ_COMPLETED: {
    amount: 25,
    description: "Completed astrology quiz",
  },
  QUIZ_PASSED: {
    amount: 20,
    description: "Passed quiz with qualifying score (>=60%)",
  },
  QUIZ_PERFECT: {
    amount: 50,
    description: "Mastered quiz with 100% score",
  },
  DAILY_STREAK_BONUS: {
    amount: 15,
    description: "Maintained consecutive day learning streak",
  },
};

// Learning Level Thresholds (Accumulated XP)
export const LEVEL_THRESHOLDS = [
  { level: 1, minXp: 0, maxXp: 99, title: "Novice Seeker", sanskritTitle: "जिज्ञासु" },
  { level: 2, minXp: 100, maxXp: 299, title: "Dedicated Student", sanskritTitle: "अध्येता" },
  { level: 3, minXp: 300, maxXp: 699, title: "Scripture Scholar", sanskritTitle: "विद्वान" },
  { level: 4, minXp: 700, maxXp: 1499, title: "Jyotish Acharya", sanskritTitle: "आचार्य" },
  { level: 5, minXp: 1500, maxXp: 999999, title: "Vedic Rishi", sanskritTitle: "ऋषि" },
];

// Configurable Achievement Badges
export const INITIAL_ACHIEVEMENTS = [
  {
    code: "FIRST_CHAPTER",
    title: "First Chapter Completed",
    description: "Completed reading your first classical chapter in the digital reader.",
    badgeIcon: "book-open",
    category: "READING",
    xpReward: 50,
    criteria: "Read and finish 1 full chapter.",
  },
  {
    code: "FIRST_BOOK",
    title: "First Book Completed",
    description: "Completed reading an entire digital classical scripture.",
    badgeIcon: "award",
    category: "READING",
    xpReward: 100,
    criteria: "Achieve 100% completion in any manuscript.",
  },
  {
    code: "FIRST_QUIZ",
    title: "First Quiz Completed",
    description: "Successfully submitted and graded your first astrology quiz.",
    badgeIcon: "check-circle",
    category: "ASSESSMENT",
    xpReward: 50,
    criteria: "Complete any astrology assessment.",
  },
  {
    code: "QUIZ_MASTER",
    title: "Quiz Master",
    description: "Achieved a perfect 100% score on 3 distinct quiz assessments.",
    badgeIcon: "sparkles",
    category: "MASTERY",
    xpReward: 100,
    criteria: "Earn 100% score on 3 or more quizzes.",
  },
  {
    code: "SANSKRIT_EXPLORER",
    title: "Sanskrit Explorer",
    description: "Studied authentic Sanskrit shlokas and completed a Sanskrit-based assessment.",
    badgeIcon: "scroll",
    category: "SCHOLARSHIP",
    xpReward: 75,
    criteria: "Engage in verified Sanskrit manuscript study and quiz.",
  },
  {
    code: "SEVEN_DAY_STREAK",
    title: "Seven-Day Learning Streak",
    description: "Maintained active study across 7 consecutive days.",
    badgeIcon: "flame",
    category: "CONSISTENCY",
    xpReward: 150,
    criteria: "Log qualifying learning activity for 7 days in a row.",
  },
];
