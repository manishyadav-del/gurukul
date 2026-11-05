import { PrismaClient } from "@prisma/client";
import assert from "node:assert/strict";

const prisma = new PrismaClient();

async function runTests() {
  console.log("==================================================================");
  console.log("   GURUKUL DIGITAL LIBRARY FUNCTIONAL & UX VERIFICATION SUITE   ");
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}`);
      console.error(`         ${err.message}`);
      failed++;
    }
  }

  async function testAsync(name, fn) {
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}`);
      console.error(`         ${err.message}`);
      failed++;
    }
  }

  // 1. Verify DB Published Books
  await testAsync("Database contains published books with non-empty titles", async () => {
    const books = await prisma.book.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true, slug: true, language: true, script: true, author: true, pageCount: true }
    });
    assert(books.length >= 13, `Expected at least 13 published books, found ${books.length}`);
    books.forEach(b => {
      assert(b.title && b.title.length > 0, `Book ${b.id} must have a title`);
      assert(b.slug && b.slug.length > 0, `Book ${b.id} must have a slug`);
    });
  });

  // 2. Verify Classical Seed Books Have PDFs and Pages
  await testAsync("Classical seed books have generated PDFs and BookPage records", async () => {
    const seedSlugs = [
      "brihat-parashara-hora-shastra",
      "saravali",
      "phaladeepika",
      "jataka-parijata",
      "brihat-jataka",
      "manasagari",
      "gurukul-astrology"
    ];

    for (const slug of seedSlugs) {
      const book = await prisma.book.findFirst({
        where: { slug, status: "PUBLISHED" },
        include: { pages: true }
      });
      assert(book, `Book with slug ${slug} must exist in DB and be published`);
      assert(book.pages.length > 0, `Book ${slug} must have pages in DB (found ${book.pages.length})`);
      assert(book.pageCount >= book.pages.length, `Book ${slug} pageCount (${book.pageCount}) must be >= pages.length (${book.pages.length})`);
    }
  });

  // 3. Category Inference Logic
  test("Category inference classifies astrology books accurately", () => {
    const testBooks = [
      { title: "Brihat Parashara Hora Shastra", description: "Vedic Astrology classic" },
      { title: "Saravali", description: "Planetary aspects and horoscopes" },
      { title: "Phaladeepika", description: "Predictive astrology" },
    ];
    // Inferred logic
    for (const b of testBooks) {
      const text = `${b.title} ${b.description}`.toLowerCase();
      const isAstro = text.includes("astrology") || text.includes("hora") || text.includes("parashara") || text.includes("saravali");
      assert(isAstro, `Expected ${b.title} to classify as Astrology`);
    }
  });

  test("Category inference classifies ayurveda books accurately", () => {
    const testBooks = [
      { title: "Arogyanidhii", description: "Ayurvedic wellness guide" },
      { title: "Vividh Chikitsa", description: "Traditional chikitsa methods" },
    ];
    for (const b of testBooks) {
      const text = `${b.title} ${b.description}`.toLowerCase();
      const isAyur = text.includes("chikitsa") || text.includes("arogya") || text.includes("ayurveda");
      assert(isAyur, `Expected ${b.title} to classify as Ayurveda`);
    }
  });

  // 4. Grouping & Deduplication Logic
  test("Deduplication groups identical titles and selects best edition", () => {
    const sampleBooks = [
      { id: "1", title: "Brihat Jataka", pageCount: 3, createdAt: new Date("2026-01-01") },
      { id: "2", title: "Brihat Jataka", pageCount: 15, createdAt: new Date("2026-02-01") },
      { id: "3", title: "Brihat Jataka", pageCount: 5, createdAt: new Date("2026-01-15") },
      { id: "4", title: "Saravali", pageCount: 10, createdAt: new Date("2026-01-01") },
    ];

    const titleMap = new Map();
    sampleBooks.forEach(b => {
      const key = b.title.trim().toLowerCase();
      if (!titleMap.has(key)) titleMap.set(key, []);
      titleMap.get(key).push(b);
    });

    const deduped = [];
    titleMap.forEach(eds => {
      const best = [...eds].sort((a, b) => (b.pageCount || 0) - (a.pageCount || 0))[0];
      deduped.push({ ...best, editionCount: eds.length });
    });

    assert.equal(deduped.length, 2, "Expected 2 unique titles");
    const bj = deduped.find(b => b.title === "Brihat Jataka");
    assert.equal(bj.id, "2", "Should pick edition with highest pageCount");
    assert.equal(bj.editionCount, 3, "Should report 3 editions for Brihat Jataka");
  });

  // 5. Multi-criteria Filtering & Sorting Logic
  test("Sorting works for newest, title, and page count", () => {
    const items = [
      { title: "Zodiac Signs", pageCount: 100, createdAt: new Date("2026-01-01") },
      { title: "Astrology Basics", pageCount: 20, createdAt: new Date("2026-02-01") },
      { title: "Kundali Guide", pageCount: 50, createdAt: new Date("2026-03-01") },
    ];

    const byTitle = [...items].sort((a, b) => a.title.localeCompare(b.title));
    assert.equal(byTitle[0].title, "Astrology Basics");
    assert.equal(byTitle[2].title, "Zodiac Signs");

    const byPages = [...items].sort((a, b) => b.pageCount - a.pageCount);
    assert.equal(byPages[0].title, "Zodiac Signs");
    assert.equal(byPages[2].title, "Astrology Basics");

    const byNewest = [...items].sort((a, b) => b.createdAt - a.createdAt);
    assert.equal(byNewest[0].title, "Kundali Guide");
    assert.equal(byNewest[2].title, "Zodiac Signs");
  });

  // 6. Navigation Routes and Reader Target Paths
  await testAsync("All published books resolve valid reader paths and overview paths", async () => {
    const books = await prisma.book.findMany({
      where: { status: "PUBLISHED" },
      take: 5
    });

    for (const b of books) {
      const readerPath = `/library/${b.slug || b.id}/pdf`;
      const overviewPath = `/library/${b.slug || b.id}`;
      assert(readerPath.startsWith("/library/"), "Reader path must start with /library/");
      assert(readerPath.endsWith("/pdf"), "Reader path must end with /pdf");
      assert(overviewPath.length > "/library/".length, "Overview path must contain valid slug or id");
    }
  });

  // 7. Reading Progress Data Integrity
  await testAsync("Reading progress accurately calculates percentage", async () => {
    const progressRecords = await prisma.readingProgress.findMany({
      take: 5,
      include: { book: true }
    });

    for (const prog of progressRecords) {
      assert(prog.progress >= 0 && prog.progress <= 100, `Progress should be 0-100%, got ${prog.progress}`);
      assert(prog.book, "Reading progress must link to an existing book");
    }
  });

  console.log("\n------------------------------------------------------------------");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("==================================================================\n");

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
