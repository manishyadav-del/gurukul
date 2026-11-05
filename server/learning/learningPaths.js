/**
 * server/learning/learningPaths.js
 * 
 * Structured Learning Paths for Gurukul:
 * 1. Vedic Astrology Foundation Path (Jyotisha Shastra)
 * 2. Kundalini & Shat-Chakra Subtle Anatomy Path
 * 
 * Grounded in classical treatises:
 * - Brihat Parashara Hora Shastra (BPHS)
 * - Shat-Chakra-Nirupana & Shiva Samhita
 * - Taittiriya Upanishad & Saravali
 */

import prisma from "../../lib/prisma.js";
import { awardXp, recordDailyActivity } from "../gamification/engine.js";

export const VEDIC_ASTROLOGY_PATH = {
  id: "path-vedic-astrology",
  slug: "vedic-astrology-foundation",
  title: "Vedic Astrology Foundation (Jyotisha Shastra)",
  sanskritTitle: "ज्योतिष शास्त्र प्रवेश",
  category: "VEDIC_ASTROLOGY",
  categoryLabel: "Vedic Astrology",
  description:
    "Systematic mastery of classical Parashari Jyotisha, from the cosmic eye of the Vedas to Janma Kundli synthesis.",
  objectives: [
    "Understand the astronomical and philosophical foundations of Jyotisha as a Vedanga.",
    "Master the 12 Bhavas (houses) and their natural significations (Karakas).",
    "Analyze the 9 Navagrahas, their dignities, friendships, and aspects (Drishti).",
    "Explore the 12 Rashis, elements (Tattvas), and 27 Nakshatras with their 4 Padas.",
    "Synthesize planetary placements in a North Indian Janma Kundli chart.",
  ],
  estimatedHours: 12,
  lessons: [
    {
      id: "astro-lesson-1",
      order: 1,
      title: "Introduction to Jyotisha (Vedanga)",
      sanskrit: "ज्योतिष परिचय",
      conceptKey: "astrology-intro",
      summary: "The eye of the Vedas: cosmic time, karma, and the astronomical basis of Indian sidereal astrology.",
      durationMin: 20,
      url: "/explore?category=overview",
      classicalSource: "Rig Veda Jyotisha & Brihat Parashara Hora Shastra",
    },
    {
      id: "astro-lesson-2",
      order: 2,
      title: "Janma Kundli Architecture",
      sanskrit: "जन्म कुण्डली रचना",
      conceptKey: "janma-kundli",
      summary: "Structure of the North Indian diamond chart, Lagna (Ascendant), and the 12 directional divisions.",
      durationMin: 25,
      url: "/explore?category=kundli-portal",
      classicalSource: "BPHS Ch. 3 & Saravali Ch. 4",
    },
    {
      id: "astro-lesson-3",
      order: 3,
      title: "The 12 Bhavas (Houses of Karma)",
      sanskrit: "द्वादश भाव विचार",
      conceptKey: "bhava-1",
      summary: "Deep study of Tanu, Dhana, Sahaja, Sukha, Putra, Ari, Yuvati, Randhra, Dharma, Karma, Labha, and Vyaya.",
      durationMin: 45,
      url: "/explore?category=bhavas",
      classicalSource: "BPHS Bhava Adhyaya",
    },
    {
      id: "astro-lesson-4",
      order: 4,
      title: "The 9 Navagrahas (Planetary Forces)",
      sanskrit: "नवग्रह मण्डल",
      conceptKey: "graha-surya",
      summary: "Surya (Atman), Chandra (Manas), Mangala (Energy), Budha (Intellect), Guru (Wisdom), Shukra (Beauty), Shani (Seva), Rahu, and Ketu.",
      durationMin: 50,
      url: "/explore?category=grahas",
      classicalSource: "BPHS Graha Gunopadharanadhyaya",
    },
    {
      id: "astro-lesson-5",
      order: 5,
      title: "The 12 Rashis & Elemental Tattvas",
      sanskrit: "द्वादश राशि एवं तत्त्व",
      conceptKey: "rashi-mesha",
      summary: "Aries to Pisces: movable, fixed, and dual modalities across Fire, Earth, Air, and Water elements.",
      durationMin: 35,
      url: "/explore?category=rashis",
      classicalSource: "Brihat Jataka Ch. 1",
    },
    {
      id: "astro-lesson-6",
      order: 6,
      title: "The 27 Nakshatras & 4 Padas",
      sanskrit: "सप्तविंशति नक्षत्र",
      conceptKey: "nakshatra-ashwini",
      summary: "The 27 lunar asterisms from Ashwini to Revati, their ruling grahas, deities, and Navamsha padas.",
      durationMin: 60,
      url: "/explore?category=nakshatras",
      classicalSource: "Taittiriya Brahmana & Brihat Samhita",
    },
    {
      id: "astro-lesson-7",
      order: 7,
      title: "The 5 Limbs of Panchang",
      sanskrit: "पञ्चाङ्ग विचार",
      conceptKey: "panchang-tithi",
      summary: "Astronomical calculation and qualitative influence of Tithi, Vara, Nakshatra, Yoga, and Karana.",
      durationMin: 30,
      url: "/explore?category=panchang",
      classicalSource: "Surya Siddhanta & Muhurta Chintamani",
    },
    {
      id: "astro-lesson-8",
      order: 8,
      title: "Planetary Relationships, Dignities & Drishti",
      sanskrit: "ग्रह मैत्री, उच्च-नीच एवं दृष्टि",
      conceptKey: "graha-guru",
      summary: "Exaltation (Uchcha), Debilitation (Neecha), Moolatrikona, natural friendships, and full planetary aspects.",
      durationMin: 40,
      url: "/explore?category=grahas",
      classicalSource: "BPHS Ch. 3 & Phaladeepika Ch. 2",
    },
    {
      id: "astro-lesson-9",
      order: 9,
      title: "Kundli Interpretation & Synthesis",
      sanskrit: "कुण्डली समन्वय एवं फलकथन",
      conceptKey: "kundli-synthesis",
      summary: "Synthesizing Lagna lord, Chandra Rashi, Dashas, and houses to derive grounded, non-fatalistic life guidance.",
      durationMin: 45,
      url: "/astrology?tab=kundli-portal",
      classicalSource: "Saravali & Brihat Jataka",
    },
  ],
};

export const KUNDALINI_PATH = {
  id: "path-kundalini-spirituality",
  slug: "kundalini-subtle-anatomy",
  title: "Kundalini & Shat-Chakra Subtle Anatomy",
  sanskritTitle: "कुण्डलिनी एवं षट्चक्र विद्या",
  category: "KUNDALINI_SPIRITUALITY",
  categoryLabel: "Kundalini & Subtle Anatomy",
  description:
    "Authentic study of yogic subtle physiology, chakras, tattvas, nadis, and granthis grounded in original Sanskrit treatises.",
  safetyNotice:
    "Strictly educational and self-reflective. Gurukul teachings do not endorse forced breath retention (Kumbhaka) or commercialized claims. Not medical treatment.",
  objectives: [
    "Learn the classical Shat-Chakra model from Muladhara to Sahasrara.",
    "Understand the five Maha-Tattvas (Earth, Water, Fire, Air, Space) and their energetic centers.",
    "Study sacred Bija Mantras and the Sanskrit phonemes inscribed upon each lotus petal.",
    "Explore the triple Nadi convergence (Ida, Pingala, and Sushumna).",
    "Examine the three Granthis (Brahma, Vishnu, and Rudra knots) and classical shastric references.",
  ],
  estimatedHours: 10,
  lessons: [
    {
      id: "kund-lesson-1",
      order: 1,
      title: "Introduction to Kundalini & Pranic Body",
      sanskrit: "कुण्डलिनी एवं प्राण शरीर",
      conceptKey: "chakra-muladhara",
      summary: "The coiled spiritual potential: Sukshma Sharira (subtle body), Prana Vayus, and authentic yogic frameworks.",
      durationMin: 25,
      url: "/spirituality/kundalini",
      classicalSource: "Hatha Yoga Pradipika Ch. 3 & Taittiriya Upanishad",
    },
    {
      id: "kund-lesson-2",
      order: 2,
      title: "The Seven Classical Chakras",
      sanskrit: "सप्त चक्र मण्डल",
      conceptKey: "chakra-muladhara",
      summary: "Detailed study of Muladhara, Svadhisthana, Manipura, Anahata, Vishuddha, Ajna, and Sahasrara.",
      durationMin: 55,
      url: "/explore?category=chakras",
      classicalSource: "Shat-Chakra-Nirupana v. 1-49",
    },
    {
      id: "kund-lesson-3",
      order: 3,
      title: "The Five Maha-Tattvas (Cosmic Elements)",
      sanskrit: "पञ्च महातत्त्व",
      conceptKey: "chakra-manipura",
      summary: "Prithvi (Earth), Jala (Water), Agni (Fire), Vayu (Air), and Akasha (Space): qualities, sensory organs, and subtle centers.",
      durationMin: 35,
      url: "/explore?category=chakras",
      classicalSource: "Shiva Samhita Ch. 1 & Taittiriya Upanishad",
    },
    {
      id: "kund-lesson-4",
      order: 4,
      title: "Bija Mantras & Sanskrit Petal Phonemes",
      sanskrit: "बीज मन्त्र एवं दल वर्ण",
      conceptKey: "chakra-anahata",
      summary: "The 50 Sanskrit letters on the petals from Ka to Ksha, and root seeds: LAM, VAM, RAM, YAM, HAM, and OM.",
      durationMin: 30,
      url: "/explore?category=chakras",
      classicalSource: "Shat-Chakra-Nirupana & Sharada Tilaka",
    },
    {
      id: "kund-lesson-5",
      order: 5,
      title: "Ida, Pingala & Sushumna Nadis",
      sanskrit: "इडा, पिङ्गला एवं सुषुम्णा नाडी",
      conceptKey: "chakra-ajna",
      summary: "The solar (Pingala) and lunar (Ida) energetic channels and the central conduit of non-dual consciousness (Sushumna).",
      durationMin: 30,
      url: "/explore?category=chakras",
      classicalSource: "Shiva Samhita Ch. 2 & Shandilya Upanishad",
    },
    {
      id: "kund-lesson-6",
      order: 6,
      title: "The Three Granthis (Spiritual Knots)",
      sanskrit: "त्रिग्रन्थि विचार",
      conceptKey: "chakra-sahasrara",
      summary: "Brahma Granthi (Physical Attachment), Vishnu Granthi (Emotional Bondage), and Rudra Granthi (Intellectual Pride).",
      durationMin: 30,
      url: "/explore?category=chakras",
      classicalSource: "Hatha Yoga Pradipika Ch. 4 v. 70-76",
    },
    {
      id: "kund-lesson-7",
      order: 7,
      title: "Classical Shastric Grounding & Safety",
      sanskrit: "शास्त्रीय प्रमाण एवं सावधानियाँ",
      conceptKey: "chakra-sahasrara",
      summary: "Distinguishing ancient textual science from modern pseudo-tantric myths; safety guidelines and calm awareness.",
      durationMin: 25,
      url: "/spirituality/kundalini",
      classicalSource: "Shiva Samhita & Hatha Yoga Pradipika",
    },
  ],
};

export const ALL_LEARNING_PATHS = [VEDIC_ASTROLOGY_PATH, KUNDALINI_PATH];

/**
 * Returns learning paths with authenticated user progress annotated.
 * 
 * @param {string} userId
 * @returns {Promise<Array>} Annotated learning paths
 */
export async function getLearningPathsWithProgress(userId) {
  let completedSet = new Set();

  if (userId) {
    const [userLearning, userKundalini, savedConcepts] = await Promise.all([
      prisma.userLearningProgress.findMany({
        where: { userId, completed: true },
        select: { lessonId: true, lesson: { select: { slug: true } } },
      }),
      prisma.userKundaliniProgress.findMany({
        where: { userId, completed: true },
        select: { moduleId: true, module: { select: { slug: true } } },
      }),
      prisma.userSavedConcept.findMany({
        where: { userId },
        select: { conceptKey: true },
      }),
    ]);

    userLearning.forEach((p) => {
      if (p.lessonId) completedSet.add(p.lessonId);
      if (p.lesson?.slug) completedSet.add(p.lesson.slug);
    });
    userKundalini.forEach((k) => {
      completedSet.add(k.moduleId);
      if (k.module?.slug) completedSet.add(k.module.slug);
    });
    savedConcepts.forEach((sc) => completedSet.add(`concept-${sc.conceptKey}`));
  }

  return ALL_LEARNING_PATHS.map((path) => {
    let completedCount = 0;
    const lessonsWithProgress = path.lessons.map((lesson, idx) => {
      // Check if marked completed by lesson id, concept key, or module
      const isCompleted =
        completedSet.has(lesson.id) ||
        completedSet.has(`lesson-${lesson.id}`) ||
        completedSet.has(lesson.conceptKey);

      if (isCompleted) {
        completedCount++;
      }

      return {
        ...lesson,
        isCompleted,
        isNext: false, // will set below
      };
    });

    // Find the immediate next incomplete lesson
    const nextIncompleteIdx = lessonsWithProgress.findIndex((l) => !l.isCompleted);
    if (nextIncompleteIdx !== -1) {
      lessonsWithProgress[nextIncompleteIdx].isNext = true;
    }

    const totalLessons = path.lessons.length;
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const isCompleted = progressPercent === 100;
    const nextLesson = nextIncompleteIdx !== -1 ? lessonsWithProgress[nextIncompleteIdx] : null;

    return {
      ...path,
      totalLessons,
      completedCount,
      progressPercent,
      isCompleted,
      nextLesson,
      lessons: lessonsWithProgress,
    };
  });
}

/**
 * Toggles or records completion of a lesson within a learning path.
 * Awards idempotent XP and logs daily streak activity.
 * 
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.pathId
 * @param {string} params.lessonId
 * @param {boolean} [params.completed=true]
 * @returns {Promise<Object>} Result
 */
export async function toggleLessonCompletion({ userId, pathId, lessonId, completed = true }) {
  if (!userId) {
    throw new Error("Authentication required to update learning progress.");
  }
  if (!pathId || !lessonId) {
    throw new Error("pathId and lessonId are required.");
  }

  const targetPath = ALL_LEARNING_PATHS.find((p) => p.id === pathId);
  if (!targetPath) {
    throw new Error(`Learning path '${pathId}' not found.`);
  }

  const targetLesson = targetPath.lessons.find((l) => l.id === lessonId);
  if (!targetLesson) {
    throw new Error(`Lesson '${lessonId}' not found in path '${pathId}'.`);
  }

  // Ensure a matching LearningModule exists in DB to satisfy foreign key
  const moduleSlug = targetPath.slug;
  const dbModule = await prisma.learningModule.upsert({
    where: { slug: moduleSlug },
    update: {
      title: targetPath.title,
      category: targetPath.category,
      difficulty: "BEGINNER",
      isPublished: true,
    },
    create: {
      slug: moduleSlug,
      title: targetPath.title,
      description: targetPath.description,
      category: targetPath.category,
      difficulty: "BEGINNER",
      isPublished: true,
      order: targetPath.id === "path-vedic-astrology" ? 1 : 2,
    },
  });

  // Ensure the Lesson exists in DB
  const dbLesson = await prisma.lesson.upsert({
    where: {
      moduleId_slug: {
        moduleId: dbModule.id,
        slug: targetLesson.id,
      },
    },
    update: {
      title: targetLesson.title,
      durationMin: targetLesson.durationMin || 20,
      order: targetLesson.order,
      isPublished: true,
    },
    create: {
      moduleId: dbModule.id,
      slug: targetLesson.id,
      title: targetLesson.title,
      content: targetLesson.summary,
      durationMin: targetLesson.durationMin || 20,
      order: targetLesson.order,
      isPublished: true,
    },
  });

  // Upsert UserLearningProgress
  const progressRecord = await prisma.userLearningProgress.upsert({
    where: {
      userId_moduleId_lessonId: {
        userId,
        moduleId: dbModule.id,
        lessonId: dbLesson.id,
      },
    },
    update: {
      completed,
      completedAt: completed ? new Date() : null,
      lastStudied: new Date(),
    },
    create: {
      userId,
      moduleId: dbModule.id,
      lessonId: dbLesson.id,
      completed,
      completedAt: completed ? new Date() : null,
    },
  });

  let xpAward = null;
  let streakResult = null;

  if (completed) {
    // Record daily streak
    streakResult = await recordDailyActivity({ userId });

    // Award XP idempotently using lessonId as referenceId
    xpAward = await awardXp({
      userId,
      actionType: "LESSON_COMPLETED",
      referenceId: `path-lesson-${dbLesson.id}`,
      amount: 40,
      description: `Completed lesson: ${targetLesson.title} in ${targetPath.title}`,
    });

    // Also update today's UserDailyGoal topics count if present
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });
    const tz = user?.timezone || "Asia/Kolkata";
    const todayStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    await prisma.userDailyGoal.upsert({
      where: {
        userId_date: {
          userId,
          date: todayStr,
        },
      },
      update: {
        studiedTopics: { increment: 1 },
      },
      create: {
        userId,
        date: todayStr,
        studiedTopics: 1,
        targetTopics: 2,
        readPages: 0,
        targetPages: 10,
      },
    });
  }

  return {
    success: true,
    completed,
    pathId,
    lessonId,
    progressRecord,
    xpAward,
    streakResult,
  };
}
