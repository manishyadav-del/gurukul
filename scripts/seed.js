import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Clean existing seed data if needed
  await prisma.quizAnswer.deleteMany({});
  await prisma.quizAttempt.deleteMany({});
  await prisma.quizOption.deleteMany({});
  await prisma.quizQuestion.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.readingProgress.deleteMany({});
  await prisma.passage.deleteMany({});
  await prisma.chapter.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Admin User
  const passwordHash = await bcrypt.hash("Admin@12345", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@example.com",
      role: "SUPER_ADMIN",
      passwordHash,
      isActive: true,
      locale: "en",
    },
  });
  console.log("✅ Created Admin User:", admin.email);

  // 3. Create Gurukul Astrology Book
  const book = await prisma.book.create({
    data: {
      title: "Gurukul Astrology",
      slug: "gurukul-astrology",
      author: "Acharya Gurukul",
      description:
        "Comprehensive foundational treatise on Vedic principles, celestial bodies, signs, and houses for learners.",
      language: "Hindi",
      script: "Devanagari",
      coverUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600",
      pageCount: 108,
      status: "PUBLISHED",
    },
  });
  console.log("✅ Created Book:", book.title);

  // 4. Create Chapters
  const chapter1 = await prisma.chapter.create({
    data: {
      bookId: book.id,
      number: 1,
      title: "Prathama Adhyaya: Jyotish Parichay (Introduction to Astrology)",
      slug: "prathama-adhyaya",
      startPage: 1,
      endPage: 25,
      sortOrder: 1,
    },
  });

  const chapter2 = await prisma.chapter.create({
    data: {
      bookId: book.id,
      number: 2,
      title: "Dvitiya Adhyaya: Navagraha Vigyan (Science of the Nine Planets)",
      slug: "dvitiya-adhyaya",
      startPage: 26,
      endPage: 60,
      sortOrder: 2,
    },
  });

  const chapter3 = await prisma.chapter.create({
    data: {
      bookId: book.id,
      number: 3,
      title: "Tritiya Adhyaya: Dwadasha Bhava (The Twelve Houses)",
      slug: "tritiya-adhyaya",
      startPage: 61,
      endPage: 108,
      sortOrder: 3,
    },
  });
  console.log("✅ Created 3 Chapters");

  // 5. Create Passages
  const p1 = await prisma.passage.create({
    data: {
      bookId: book.id,
      chapterId: chapter1.id,
      number: 1,
      sortOrder: 1,
      text: "ज्योतिष शास्त्र वेदों का चक्षु (नेत्र) कहलाता है। इसके अध्ययन से काल चक्र और प्रकृति के सूक्ष्म नियमों का ज्ञान प्राप्त होता है।",
      rawText: "Jyotish shastra vedon ka chakshu kehlata hai...",
      sourcePage: 3,
      ocrConfidence: 0.98,
    },
  });

  const p2 = await prisma.passage.create({
    data: {
      bookId: book.id,
      chapterId: chapter1.id,
      number: 2,
      sortOrder: 2,
      text: "काल गणना के मुख्य अंग तिथि, वार, नक्षत्र, योग और करण हैं जिन्हें पंचांग कहा जाता है।",
      rawText: "Kaal ganana ke mukhya anga tithi, vaar, nakshatra, yoga, evam karana...",
      sourcePage: 5,
      ocrConfidence: 0.99,
    },
  });

  const p3 = await prisma.passage.create({
    data: {
      bookId: book.id,
      chapterId: chapter2.id,
      number: 3,
      sortOrder: 1,
      text: "सूर्य आत्मा का कारक है और चंद्र मन का। गुरु ज्ञान और विवेक का प्रतिनिधि ग्रह माना गया है।",
      rawText: "Surya aatma ka kaarak hai aur chandra mann ka...",
      sourcePage: 28,
      ocrConfidence: 0.97,
    },
  });
  console.log("✅ Created Passages");

  // 6. Create Quiz with 3 questions
  const quiz = await prisma.quiz.create({
    data: {
      title: "Vedic Astrology Fundamentals Quiz",
      description: "Test your knowledge on the basics of Jyotish, Panchanga, and Grahas.",
      bookId: book.id,
      difficulty: "EASY",
      isPublished: true,
      questions: {
        create: [
          {
            question: "What are the Vedas considered to represent astrology as?",
            explanation: "Astrology is known as the 'Eye of the Vedas' (Veda Chakshu).",
            sourcePassageId: p1.id,
            options: {
              create: [
                { text: "Eyes (Chakshu)", isCorrect: true },
                { text: "Hands (Hasta)", isCorrect: false },
                { text: "Nose (Ghrana)", isCorrect: false },
                { text: "Feet (Pada)", isCorrect: false },
              ],
            },
          },
          {
            question: "How many limbs make up the traditional Panchanga?",
            explanation: "Panchanga literally translates to five limbs: Tithi, Vaar, Nakshatra, Yoga, and Karana.",
            sourcePassageId: p2.id,
            options: {
              create: [
                { text: "Three", isCorrect: false },
                { text: "Five", isCorrect: true },
                { text: "Seven", isCorrect: false },
                { text: "Nine", isCorrect: false },
              ],
            },
          },
          {
            question: "Which celestial body is considered the significator (karaka) of the Soul (Atma)?",
            explanation: "Surya (Sun) is the natural karaka of the Atma (Soul).",
            sourcePassageId: p3.id,
            options: {
              create: [
                { text: "Moon (Chandra)", isCorrect: false },
                { text: "Sun (Surya)", isCorrect: true },
                { text: "Jupiter (Guru)", isCorrect: false },
                { text: "Mars (Mangal)", isCorrect: false },
              ],
            },
          },
        ],
      },
    },
  });
  console.log("✅ Created Quiz:", quiz.title);

  // 7. Reading Progress & Bookmark Sample for Admin
  await prisma.readingProgress.create({
    data: {
      userId: admin.id,
      bookId: book.id,
      passageId: p1.id,
      progress: 15.5,
    },
  });

  await prisma.bookmark.create({
    data: {
      userId: admin.id,
      passageId: p1.id,
    },
  });

  console.log("✨ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
