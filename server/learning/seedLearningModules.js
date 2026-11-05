import prisma from "../../lib/prisma.js";

export const INITIAL_LEARNING_MODULES = [
  {
    title: "Vedic Astrology Foundations",
    slug: "vedic-astrology-foundations",
    description: "An authentic introduction to Parasara Jyotish, cosmic order (Rta), and the philosophical foundations of karmic timelines.",
    category: "ASTROLOGY_FOUNDATIONS",
    difficulty: "BEGINNER",
    order: 1,
    isPublished: true,
    lessons: [
      {
        title: "Introduction to Jyotisha (The Eye of the Veda)",
        slug: "intro-to-jyotisha",
        order: 1,
        durationMin: 12,
        isPublished: true,
        content: "Jyotisha is traditionally revered as the Vedanga (limb of the Veda) that serves as the cosmic eye. Rather than fatalistic fortune telling, it is a diagnostic discipline observing how individual consciousness intersects with macrocosmic planetary rhythms.",
      },
      {
        title: "The Law of Karma and Planetary Periods",
        slug: "law-of-karma-and-planetary-periods",
        order: 2,
        durationMin: 15,
        isPublished: true,
        content: "Every thought, intention, and action generates a karmic imprint (Sanskara). Grahas do not cause events; they reflect the ripening (Vipaka) of past actions according to precise cosmic timing.",
      },
    ],
  },
  {
    title: "Navagrahas: The Nine Cosmic Energies",
    slug: "navagrahas-nine-cosmic-energies",
    description: "Deep study of the Sun (Surya), Moon (Chandra), Mars (Mangala), and the other primary planetary archetypes shaping consciousness.",
    category: "GRAHAS_AND_PLANETS",
    difficulty: "BEGINNER",
    order: 2,
    isPublished: true,
    lessons: [
      {
        title: "Surya and Chandra: Soul and Mind",
        slug: "surya-and-chandra-soul-and-mind",
        order: 1,
        durationMin: 14,
        isPublished: true,
        content: "Surya (the Sun) signifies the Atman (soul), vitality, dharma, and innate self-authority. Chandra (the Moon) embodies the Manas (sensory and emotional mind), intuition, and receptivity.",
      },
      {
        title: "Mangala and Budha: Energy and Intellect",
        slug: "mangala-and-budha-energy-and-intellect",
        order: 2,
        durationMin: 16,
        isPublished: true,
        content: "Mangala represents focused courage, vitality, and physical drive. Budha represents analytical intellect, discriminative intelligence (Buddhi), and speech.",
      },
    ],
  },
  {
    title: "The 12 Bhavas: Domains of Human Experience",
    slug: "the-twelve-bhavas-human-experience",
    description: "Explore the 12 houses (Bhavas) representing Tanu (self), Dhana (wealth), Sahaja (siblings), Bandhu (home), and Moksha (liberation).",
    category: "BHAVAS_AND_HOUSES",
    difficulty: "INTERMEDIATE",
    order: 3,
    isPublished: true,
    lessons: [
      {
        title: "The Four Kendras: Pillars of Life",
        slug: "the-four-kendras-pillars-of-life",
        order: 1,
        durationMin: 18,
        isPublished: true,
        content: "Houses 1, 4, 7, and 10 form the Kendras (cardinal pillars) of the chart. They represent self-awareness, emotional grounding, partnership, and professional duty in the world.",
      },
    ],
  },
];

export async function ensureInitialLearningModules() {
  const count = await prisma.learningModule.count();
  if (count > 0) return;

  for (const mod of INITIAL_LEARNING_MODULES) {
    const created = await prisma.learningModule.create({
      data: {
        title: mod.title,
        slug: mod.slug,
        description: mod.description,
        category: mod.category,
        difficulty: mod.difficulty,
        order: mod.order,
        isPublished: mod.isPublished,
        lessons: {
          create: mod.lessons.map((l) => ({
            title: l.title,
            slug: l.slug,
            order: l.order,
            durationMin: l.durationMin,
            isPublished: l.isPublished,
            content: l.content,
          })),
        },
      },
    });
    console.log(`Seeded learning module: ${created.title}`);
  }
}
