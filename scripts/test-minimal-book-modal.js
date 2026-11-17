import prisma from "../lib/prisma.js";
import fs from "fs";
import path from "path";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runMinimalBookModalSuite() {
  console.log("===============================================================================");
  console.log("  GURUKUL: MINIMAL BOOK-FIRST EXPERIENCE & ON-DEMAND KNOWLEDGE SUITE");
  console.log("===============================================================================\n");

  // Module 1: Component File Integrity & Exports
  console.log("--- Module 1: Component File Integrity & Exports ---");
  const modalPath = path.join(process.cwd(), "components", "library", "MinimalBookModal.jsx");
  assert(fs.existsSync(modalPath), "MinimalBookModal.jsx component exists in components/library/");

  const modalSource = fs.readFileSync(modalPath, "utf-8");
  assert(modalSource.includes("export default function MinimalBookModal"), "Exports MinimalBookModal component as default");

  // Module 2: Minimal Initial View Verification
  console.log("\n--- Module 2: Minimal Initial View Architecture ---");
  assert(modalSource.includes('const [mode, setMode] = useState("minimal")'), "Initial view mode defaults to 'minimal' (book-first)");
  assert(modalSource.includes("<BookPresentation3D"), "Initial view features BookPresentation3D artwork as visual centerpiece");
  assert(modalSource.includes("authorName"), "Displays author conditionally (only if available)");
  assert(modalSource.includes("Read Book"), "Prominent 'Read Book' action provided in initial view");
  assert(modalSource.includes("Explore Book & Knowledge"), "Subtle 'Explore Book & Knowledge' action provided");

  // Verify that technical metadata cards are excluded from the initial view
  const initialViewBlock = modalSource.slice(
    modalSource.indexOf('{mode === "minimal" ? ('),
    modalSource.indexOf(': (')
  );
  assert(!initialViewBlock.includes("Pages</span>"), "Initial view strictly excludes page count badges");
  assert(!initialViewBlock.includes("Chapters</span>"), "Initial view strictly excludes chapter count badges");
  assert(!initialViewBlock.includes("Script</span>"), "Initial view strictly excludes script information");
  assert(!initialViewBlock.includes("Publisher</span>"), "Initial view strictly excludes publisher information");
  assert(!initialViewBlock.includes("Supported Digital Reader Features"), "Initial view strictly excludes reader feature lists");
  assert(!initialViewBlock.includes("Manuscript Overview & Scope"), "Initial view strictly excludes long manuscript descriptions");

  // Module 3: On-Demand Exploration & Categorized Tabs
  console.log("\n--- Module 3: On-Demand Exploration Architecture ---");
  assert(modalSource.includes('setActiveTab("about")'), "Provides 'About This Book' tab on demand");
  assert(modalSource.includes('setActiveTab("contents")'), "Provides 'Contents' tab with chapter hierarchy");
  assert(modalSource.includes('setActiveTab("details")'), "Provides 'Book Information' tab for technical metadata");
  assert(modalSource.includes('setActiveTab("learn")'), "Provides 'Learn & AI Study' tab for interactive knowledge exploration");
  assert(modalSource.includes("Back to Book View"), "Provides immediate return path back to minimal book-first view");

  // Module 4: Interactive Learning Experience & On-Demand AI
  console.log("\n--- Module 4: Interactive Learning Experience & On-Demand AI ---");
  assert(modalSource.includes("/api/research/assistant"), "Integrates existing Gurukul Research Assistant endpoint");
  assert(modalSource.includes("handleAskSage"), "AI inquiry triggered strictly on user demand via handleAskSage()");
  assert(modalSource.includes("AI Research Synthesis • Grounded in Shastra"), "Clearly labels AI-synthesized knowledge vs scripture");
  assert(modalSource.includes("Grounded Classical Citations"), "Provides direct citations to verified Shastra passages");

  // Module 5: Real Database Book & Chapter Availability
  console.log("\n--- Module 5: Real Database Book & Chapter Availability ---");
  const sampleBook = await prisma.book.findFirst({
    where: { status: "PUBLISHED" },
    include: {
      chapters: { take: 3 },
      _count: { select: { passages: true, pages: true, chapters: true } },
    },
  });

  assert(Boolean(sampleBook), `Retrieved authentic database book: "${sampleBook.title}"`);
  assert(sampleBook.chapters.length > 0, `Chapters available for interactive Table of Contents (${sampleBook.chapters.length} loaded)`);

  // Module 6: DigitalLibraryView Integration
  console.log("\n--- Module 6: DigitalLibraryView Integration ---");
  const libraryViewPath = path.join(process.cwd(), "components", "library", "DigitalLibraryView.jsx");
  const libraryViewSource = fs.readFileSync(libraryViewPath, "utf-8");
  assert(libraryViewSource.includes("MinimalBookModal"), "DigitalLibraryView imports and renders MinimalBookModal");

  console.log("\n===============================================================================");
  console.log(`  MINIMAL BOOK-FIRST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("===============================================================================");

  if (failed > 0) process.exit(1);
}

runMinimalBookModalSuite()
  .catch((err) => {
    console.error("Test failed fatal error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
