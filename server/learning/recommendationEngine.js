/**
 * server/learning/recommendationEngine.js
 * 
 * Authentic, Explainable Recommendation Engine for Gurukul.
 * 
 * Generates transparent, grounded study suggestions based strictly on:
 * - Previously completed lessons & modules
 * - Recently viewed concepts (UserRecentTopic)
 * - Saved & bookmarked concepts (UserSavedConcept, Bookmark)
 * - Incomplete lessons & structured learning path progression
 * - Classical Ontology Cross-Links (CONCEPT_RELATIONSHIPS & getRelatedConcepts)
 * - Reading progress in original manuscripts (ReadingProgress)
 * 
 * Organized into 3 Core Categories:
 * 1. VEDIC_ASTROLOGY
 * 2. KUNDALINI_SPIRITUALITY
 * 3. DIGITAL_LIBRARY
 */

import prisma from "../../lib/prisma.js";
import { getRelatedConcepts } from "../astrology/conceptRelationships.js";
import { ALL_LEARNING_PATHS } from "./learningPaths.js";

/**
 * Generates transparent, explainable recommendations for a user.
 * 
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} [params.categoryFilter="ALL"] - "ALL" | "VEDIC_ASTROLOGY" | "KUNDALINI_SPIRITUALITY" | "DIGITAL_LIBRARY"
 * @param {number} [params.limit=12]
 * @returns {Promise<Array>} List of recommendations with clear explainability reasons
 */
export async function getExplainableRecommendations({
  userId,
  categoryFilter = "ALL",
  limit = 12,
}) {
  if (!userId) {
    return getFoundationalDefaultRecommendations(categoryFilter);
  }

  // 1. Gather all actual user learning activity in parallel
  const [
    userLearning,
    userKundalini,
    savedConcepts,
    bookmarks,
    readingProgress,
    recentTopics,
    quizAttempts,
  ] = await Promise.all([
    prisma.userLearningProgress.findMany({
      where: { userId },
      include: {
        lesson: { select: { id: true, title: true, slug: true, order: true } },
        module: { select: { id: true, title: true, slug: true, category: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.userKundaliniProgress.findMany({
      where: { userId },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            slug: true,
            chakraAssociation: true,
            chakraElement: true,
            bijaMantra: true,
            level: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.userSavedConcept.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    prisma.bookmark.findMany({
      where: { userId },
      include: {
        passage: {
          include: {
            book: { select: { id: true, title: true, slug: true } },
            chapter: { select: { id: true, title: true, slug: true, chapterNumber: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.readingProgress.findMany({
      where: { userId },
      include: {
        book: {
          select: { id: true, title: true, slug: true, author: true, language: true, pageCount: true },
        },
        chapter: {
          select: { id: true, title: true, slug: true, chapterNumber: true, startPage: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    prisma.userRecentTopic.findMany({
      where: { userId },
      orderBy: { viewedAt: "desc" },
      take: 8,
    }),
    prisma.quizAttempt.findMany({
      where: { userId },
      include: {
        quiz: { select: { id: true, title: true, slug: true, topic: true, difficulty: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const recommendations = [];
  const addedKeys = new Set();

  function addRec(rec) {
    if (!rec || addedKeys.has(rec.id)) return;
    addedKeys.add(rec.id);
    recommendations.push(rec);
  }

  const completedLessonSlugs = new Set();
  userLearning.forEach((ul) => {
    if (ul.completed && ul.lesson?.slug) completedLessonSlugs.add(ul.lesson.slug);
  });
  const completedKundaliniSlugs = new Set();
  userKundalini.forEach((uk) => {
    if (uk.completed && uk.module?.slug) completedKundaliniSlugs.add(uk.module.slug);
  });

  // --------------------------------------------------------------------------
  // SIGNAL 1: Next Step in Structured Learning Paths
  // --------------------------------------------------------------------------
  for (const path of ALL_LEARNING_PATHS) {
    for (let i = 0; i < path.lessons.length; i++) {
      const lesson = path.lessons[i];
      const isCompleted =
        completedLessonSlugs.has(lesson.id) ||
        completedLessonSlugs.has(lesson.conceptKey) ||
        completedKundaliniSlugs.has(lesson.conceptKey);

      if (!isCompleted) {
        const prevLesson = i > 0 ? path.lessons[i - 1] : null;
        const reason = prevLesson
          ? `Next sequential step in ${path.title} after "${prevLesson.title}"`
          : `Foundational starting lesson for ${path.title}`;

        addRec({
          id: `path-next-${path.id}-${lesson.id}`,
          category: path.category,
          categoryLabel: path.categoryLabel,
          title: lesson.title,
          subtitle: `${path.title} • Lesson ${lesson.order} of ${path.lessons.length}`,
          sanskrit: lesson.sanskrit,
          badge: "Path Progression",
          url: lesson.url,
          reason,
          relevanceScore: 100,
          sourceSignal: "LEARNING_PATH_PROGRESSION",
          estimatedMin: lesson.durationMin,
        });
        break; // Only recommend the immediate next incomplete lesson per path
      }
    }
  }

  // --------------------------------------------------------------------------
  // SIGNAL 2: Classical Ontology Resonances (Chakra & Graha Completions)
  // --------------------------------------------------------------------------
  // Example from prompt:
  // "If a user completes the Muladhara Chakra lesson, recommend:
  // - Muladhara's associated Tattva
  // - Bija Mantra
  // - Classical references
  // - The next chakra lesson"

  const completedChakras = userKundalini.filter((k) => k.completed);
  for (const kc of completedChakras) {
    const chakraModule = kc.module;
    const chakraKey = `chakra-${chakraModule?.slug?.replace("-chakra", "") || "muladhara"}`;
    const related = getRelatedConcepts(chakraKey);

    // Recommend associated Tattva & Bija Mantra
    if (chakraModule?.chakraElement || chakraModule?.bijaMantra) {
      addRec({
        id: `rec-chakra-resonance-${kc.id}`,
        category: "KUNDALINI_SPIRITUALITY",
        categoryLabel: "Kundalini & Subtle Anatomy",
        title: `${chakraModule.chakraElement || "Pancha Tattva"} & ${chakraModule.bijaMantra || "Bija Mantra"} Exploration`,
        subtitle: `Subtle vibrational resonance of ${chakraModule.title}`,
        sanskrit: chakraModule.bijaMantra,
        badge: "Tattva & Bija Study",
        url: `/explore?category=chakras`,
        reason: `Recommended because you completed ${chakraModule.title}: deepen your understanding of its ${chakraModule.chakraElement || "element"} and sacred sound phonemes.`,
        relevanceScore: 90,
        sourceSignal: "ONTOLOGY_SUBTLE_RESONANCE",
      });
    }

    // Recommend related classical Grahas from ontology
    const relatedGraha = related.find((r) => r.category === "grahas");
    if (relatedGraha) {
      addRec({
        id: `rec-ontology-graha-${kc.id}-${relatedGraha.key}`,
        category: "VEDIC_ASTROLOGY",
        categoryLabel: "Vedic Astrology",
        title: `Planetary Resonance: ${relatedGraha.relation}`,
        subtitle: `Cosmic correlation between ${chakraModule.title} and Navagrahas`,
        badge: "Cross-Disciplinary Resonance",
        url: `/explore?category=grahas`,
        reason: `Recommended because you studied ${chakraModule.title}: in classical Yogic Jyotisha, this subtle center resonates directly with ${relatedGraha.key.replace("graha-", "")}.`,
        relevanceScore: 85,
        sourceSignal: "ONTOLOGY_CROSS_DISCIPLINE",
      });
    }
  }

  // Example from prompt:
  // "If a user studies Navagrahas, recommend:
  // - Planetary dignity
  // - Planetary friendships
  // - Drishti
  // - Related Bhava and Rashi concepts"
  const studiedGrahas = savedConcepts.filter((c) => c.category === "GRAHA" || c.conceptKey.startsWith("graha-"));
  for (const sg of studiedGrahas) {
    const related = getRelatedConcepts(sg.conceptKey);
    const relatedRashi = related.find((r) => r.category === "rashis");
    const relatedBhava = related.find((r) => r.category === "bhavas");

    if (relatedRashi || relatedBhava) {
      addRec({
        id: `rec-graha-dignity-${sg.id}`,
        category: "VEDIC_ASTROLOGY",
        categoryLabel: "Vedic Astrology",
        title: `Planetary Dignities, Friendships & Drishti (${sg.term})`,
        subtitle: `Exaltation, Debilitation, and Aspectual Gaze`,
        sanskrit: sg.sanskritTerm,
        badge: "Planetary Dignity",
        url: `/explore?category=grahas`,
        reason: `Recommended because you studied ${sg.term}: analyze its signs of exaltation (${relatedRashi?.relation || "dignity"}), natural friendships, and full drishti.`,
        relevanceScore: 88,
        sourceSignal: "ONTOLOGY_PLANETARY_DIGNITY",
      });
    }
  }

  // --------------------------------------------------------------------------
  // SIGNAL 2B: AI Knowledge Graph Classical Connections
  // --------------------------------------------------------------------------
  try {
    const activeSlugs = [
      ...recentTopics.map((rt) => rt.topicSlug).filter(Boolean),
      ...savedConcepts.map((sc) => sc.conceptKey?.replace(/^(chakra|graha)-/, "")).filter(Boolean),
    ].slice(0, 5);

    if (activeSlugs.length > 0) {
      const graphRelations = await prisma.knowledgeRelationship.findMany({
        where: {
          OR: [
            { sourceConcept: { slug: { in: activeSlugs } } },
            { targetConcept: { slug: { in: activeSlugs } } },
          ],
          status: "APPROVED",
        },
        include: {
          sourceConcept: { select: { slug: true, name: true, sanskrit: true, category: true } },
          targetConcept: { select: { slug: true, name: true, sanskrit: true, category: true, summary: true } },
        },
        take: 6,
      });

      for (const rel of graphRelations) {
        const wasSource = activeSlugs.includes(rel.sourceConcept.slug);
        const studiedConcept = wasSource ? rel.sourceConcept : rel.targetConcept;
        const targetConcept = wasSource ? rel.targetConcept : rel.sourceConcept;

        const cat =
          targetConcept.category === "CHAKRA" || targetConcept.category === "TATTVA" || targetConcept.category === "NADI"
            ? "KUNDALINI_SPIRITUALITY"
            : "VEDIC_ASTROLOGY";

        addRec({
          id: `rec-kg-${rel.id}`,
          category: cat,
          categoryLabel: cat === "KUNDALINI_SPIRITUALITY" ? "Kundalini & Subtle Anatomy" : "Vedic Astrology",
          title: `Classical Connection: ${targetConcept.name}`,
          subtitle: `${rel.title || rel.relationshipType} from ${studiedConcept.name}`,
          sanskrit: targetConcept.sanskrit,
          badge: "Knowledge Graph",
          url: `/explore?concept=${encodeURIComponent(targetConcept.slug)}`,
          reason: `Discovered in classical Knowledge Graph via "${rel.title || rel.relationshipType}" relationship with your studied concept "${studiedConcept.name}" (${rel.classicalSource || "Classical Lineage"}).`,
          relevanceScore: 87,
          sourceSignal: "KNOWLEDGE_GRAPH_RELATION",
        });
      }
    }
  } catch (err) {
    console.error("[recommendationEngine] Error gathering Knowledge Graph recommendations:", err);
  }

  // --------------------------------------------------------------------------
  // SIGNAL 3: Digital Library Manuscript Reading Continuation
  // --------------------------------------------------------------------------
  const activeReading = readingProgress.filter((rp) => rp.progress > 0 && rp.progress < 100);
  for (const rp of activeReading) {
    const bookTitle = rp.book?.title || "Classical Manuscript";
    const lastPage = rp.pageNumber || rp.chapter?.startPage || 1;
    const resumeUrl = `/library/${rp.book?.slug}/${rp.chapter?.slug || ""}?page=${lastPage}`;

    addRec({
      id: `rec-reading-continue-${rp.id}`,
      category: "DIGITAL_LIBRARY",
      categoryLabel: "Digital Library",
      title: `Resume: ${rp.chapter?.title || bookTitle}`,
      subtitle: `${bookTitle} • Page ${lastPage} (${Math.round(rp.progress)}% completed)`,
      badge: "In Progress",
      url: resumeUrl,
      reason: `You were studying this manuscript (${Math.round(rp.progress)}% complete). Pick up exactly where you left off.`,
      relevanceScore: 95,
      sourceSignal: "READING_PROGRESS_RESUME",
    });
  }

  // --------------------------------------------------------------------------
  // SIGNAL 4: Bookmarked Concepts Deepening
  // --------------------------------------------------------------------------
  for (const bm of savedConcepts.slice(0, 3)) {
    addRec({
      id: `rec-bookmark-deepen-${bm.id}`,
      category: bm.category === "CHAKRA" ? "KUNDALINI_SPIRITUALITY" : "VEDIC_ASTROLOGY",
      categoryLabel: bm.category === "CHAKRA" ? "Kundalini & Subtle Anatomy" : "Vedic Astrology",
      title: `Classical Deep-Dive: ${bm.term}`,
      subtitle: bm.sanskritTerm ? `${bm.sanskritTerm} • Shastric Analysis` : "Saved Study Concept",
      sanskrit: bm.sanskritTerm,
      badge: "Bookmarked Concept",
      url: `/explore?category=all`,
      reason: `Recommended based on your bookmarked concept "${bm.term}": explore verified citations and classical shlokas.`,
      relevanceScore: 82,
      sourceSignal: "BOOKMARKED_CONCEPT",
    });
  }

  // --------------------------------------------------------------------------
  // SIGNAL 5: Weakness Mastery / Quiz Reinforcement
  // --------------------------------------------------------------------------
  const weakQuiz = quizAttempts.find((qa) => qa.percentage < 70);
  if (weakQuiz && weakQuiz.quiz) {
    addRec({
      id: `rec-quiz-reinforce-${weakQuiz.id}`,
      category: "VEDIC_ASTROLOGY",
      categoryLabel: "Vedic Astrology",
      title: `Knowledge Reinforcement: ${weakQuiz.quiz.title}`,
      subtitle: `Previous score: ${weakQuiz.percentage}% • Review key concepts`,
      badge: "Mastery Review",
      url: `/quiz/${weakQuiz.quiz.slug || weakQuiz.quiz.id}`,
      reason: `Strengthen your grasp of ${weakQuiz.quiz.title} to elevate your comprehension from ${weakQuiz.score}/${weakQuiz.totalQuestions}.`,
      relevanceScore: 78,
      sourceSignal: "ASSESSMENT_MASTERY",
    });
  }

  // --------------------------------------------------------------------------
  // SIGNAL 6: Fallback Foundational Recommendations if list is sparse
  // --------------------------------------------------------------------------
  if (recommendations.length < 4) {
    const defaults = getFoundationalDefaultRecommendations("ALL");
    defaults.forEach((def) => addRec(def));
  }

  // Filter by category if requested
  let filtered = recommendations;
  if (categoryFilter && categoryFilter !== "ALL") {
    filtered = recommendations.filter((r) => r.category === categoryFilter);
  }

  // Sort by relevanceScore descending and trim to limit
  return filtered.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit);
}

/**
 * Returns default explainable recommendations for new students or guests.
 */
function getFoundationalDefaultRecommendations(categoryFilter = "ALL") {
  const defaults = [
    {
      id: "rec-default-astro-foundations",
      category: "VEDIC_ASTROLOGY",
      categoryLabel: "Vedic Astrology",
      title: "Introduction to Jyotisha (Cosmic Eye of the Vedas)",
      subtitle: "Vedic Astrology Foundation Path • Lesson 1",
      sanskrit: "ज्योतिष परिचय",
      badge: "Foundational Path",
      url: "/explore?category=overview",
      reason: "Essential first step: understand the astronomical foundations of Indian sidereal astrology and karmic time.",
      relevanceScore: 100,
      sourceSignal: "DEFAULT_ONBOARDING",
    },
    {
      id: "rec-default-kundalini-muladhara",
      category: "KUNDALINI_SPIRITUALITY",
      categoryLabel: "Kundalini & Subtle Anatomy",
      title: "Muladhara Chakra: Earth Element & Primal Stability",
      subtitle: "Seven Shat-Chakra Learning System",
      sanskrit: "मूलाधार चक्र",
      badge: "Subtle Anatomy",
      url: "/explore?category=chakras",
      reason: "Recommended starting point for yogic subtle anatomy: learn the root foundation (Prithvi Tattva, LAM Bija).",
      relevanceScore: 95,
      sourceSignal: "DEFAULT_ONBOARDING",
    },
    {
      id: "rec-default-navagrahas",
      category: "VEDIC_ASTROLOGY",
      categoryLabel: "Vedic Astrology",
      title: "The 9 Navagrahas: Cosmic Archetypes & Dignities",
      subtitle: "Brihat Parashara Hora Shastra Foundation",
      sanskrit: "नवग्रह मण्डल",
      badge: "Core Shastra",
      url: "/explore?category=grahas",
      reason: "Core curriculum: discover how Surya, Chandra, and the planetary deities govern human consciousness and the subtle body.",
      relevanceScore: 90,
      sourceSignal: "DEFAULT_ONBOARDING",
    },
    {
      id: "rec-default-library-reading",
      category: "DIGITAL_LIBRARY",
      categoryLabel: "Digital Library",
      title: "Explore Brihat Parashara Hora Shastra",
      subtitle: "Original Sanskrit Manuscript with Verified Translations",
      badge: "Classical Manuscript",
      url: "/library",
      reason: "Read authentic digitized palm-leaf and printed editions of ancient astrology treatises in the Gurukul Digital Library.",
      relevanceScore: 85,
      sourceSignal: "DEFAULT_ONBOARDING",
    },
  ];

  if (categoryFilter && categoryFilter !== "ALL") {
    return defaults.filter((d) => d.category === categoryFilter);
  }
  return defaults;
}
