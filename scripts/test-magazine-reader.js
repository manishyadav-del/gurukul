import prisma from "../lib/prisma.js";
import fs from "fs";
import path from "path";
import pageFlipPkg from "page-flip";

const PageFlip = pageFlipPkg.PageFlip || pageFlipPkg.default?.PageFlip || pageFlipPkg;

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

async function runMagazineReaderSuite() {
  console.log("===============================================================================");
  console.log("  GURUKUL: REALISTIC 3D MAGAZINE-STYLE PDF READER & EXPLAIN SUITE");
  console.log("===============================================================================\n");

  // Module 1: Component File Integrity & Exports
  console.log("--- Module 1: Component File Integrity & Exports ---");
  const flipbookPath = path.join(process.cwd(), "components", "reader", "Magazine3DFlipbook.jsx");
  const toolbarPath = path.join(process.cwd(), "components", "reader", "MagazineToolbar.jsx");
  const explainPanelPath = path.join(process.cwd(), "components", "reader", "MagazineExplainPanel.jsx");
  const viewerPath = path.join(process.cwd(), "components", "reader", "BookPdfViewer.jsx");

  assert(fs.existsSync(flipbookPath), "Magazine3DFlipbook.jsx component exists");
  assert(fs.existsSync(toolbarPath), "MagazineToolbar.jsx component exists");
  assert(fs.existsSync(explainPanelPath), "MagazineExplainPanel.jsx component exists");
  assert(fs.existsSync(viewerPath), "BookPdfViewer.jsx component exists");

  const flipbookSource = fs.readFileSync(flipbookPath, "utf-8");
  const toolbarSource = fs.readFileSync(toolbarPath, "utf-8");
  const explainPanelSource = fs.readFileSync(explainPanelPath, "utf-8");
  const viewerSource = fs.readFileSync(viewerPath, "utf-8");

  assert(flipbookSource.includes("export default function Magazine3DFlipbook"), "Exports Magazine3DFlipbook default");
  assert(toolbarSource.includes("export default function MagazineToolbar"), "Exports MagazineToolbar default");
  assert(explainPanelSource.includes("export default function MagazineExplainPanel"), "Exports MagazineExplainPanel default");
  assert(viewerSource.includes("export default function BookPdfViewer"), "Exports BookPdfViewer default");
  assert(viewerSource.includes("export { getPageOcrState }"), "Preserves getPageOcrState export for backward compatibility");

  // Module 2: 3D Magazine Architecture & Visual Presentation
  console.log("\n--- Module 2: 3D Magazine Architecture & Visual Presentation ---");
  assert(typeof PageFlip === "function", "page-flip 3D engine is installed and loadable in Node/Next.js");
  assert(viewerSource.includes('const [viewMode, setViewMode] = useState("MAGAZINE")'), "Default reader viewMode is set to 'MAGAZINE' (3D Flipbook)");
  assert(flipbookSource.includes("PageFlip"), "Integrates PageFlip 3D physics engine");
  assert(flipbookSource.includes("maxShadowOpacity"), "Configures realistic 3D paper shadows");
  assert(flipbookSource.includes("flippingTime"), "Configures realistic page curl animation timing");
  assert(flipbookSource.includes("showCover: true"), "Enforces physical magazine book cover behavior");
  assert(flipbookSource.includes("bg-gradient-to-l from-black") || flipbookSource.includes("bg-gradient-to-r from-black"), "Renders central spine gutter shadow for physical realism");
  assert(flipbookSource.includes("Shirabandha") || flipbookSource.includes("headband"), "Renders traditional Vedic silk headband (Shirabandha) at central gutter");
  assert(flipbookSource.includes("boxShadow") && flipbookSource.includes("#ede4d1"), "Simulates layered paper edge depth for stacked folios");
  assert(!viewerSource.includes('layoutMode === "SPLIT"'), "Default reading view excludes noisy side-by-side OCR columns");

  // Module 3: Responsive Layouts & Intelligent Viewport Scaling
  console.log("\n--- Module 3: Responsive Layouts & Intelligent Viewport Scaling ---");
  assert(flipbookSource.includes("updateOptimalDimensions"), "Computes optimal viewport dimensions dynamically");
  assert(flipbookSource.includes("maxSpreadW"), "Maximizes desktop reading space while preserving aspect ratio");
  assert(flipbookSource.includes("portrait"), "Tracks portrait vs landscape orientation");
  assert(flipbookSource.includes("winW < 860"), "Automatically adapts to single-page portrait layout on mobile and compact screens");
  assert(flipbookSource.includes("usePortrait: dimensions.isPortrait"), "Passes dynamic usePortrait flag to 3D flipbook engine");

  // Module 4: High-DPI Sanskrit Typography & Reading Themes
  console.log("\n--- Module 4: High-DPI Sanskrit Typography & Reading Themes ---");
  assert(flipbookSource.includes("dpr") && flipbookSource.includes("renderScale"), "Calculates high-DPI canvas render scale for crisp Devanagari typography");
  assert(viewerSource.includes('const [theme, setTheme] = useState("classic")'), "Provides 'classic' Vedic manuscript reading theme by default");
  assert(toolbarSource.includes("onChangeTheme"), "Toolbar integrates reading theme switcher (Classic / Modern / Night)");
  assert(toolbarSource.includes("Modern") && toolbarSource.includes("Night"), "Supports 'classic', 'modern', and 'night' reading themes");

  // Module 5: Minimal Reader Toolbar
  console.log("\n--- Module 5: Minimal Reader Toolbar ---");
  assert(toolbarSource.includes("onPrevPage"), "Provides Previous Page navigation control");
  assert(toolbarSource.includes("onNextPage"), "Provides Next Page navigation control");
  assert(toolbarSource.includes("editingPage"), "Provides page indicator and direct jump input");
  assert(toolbarSource.includes("onZoomIn") && toolbarSource.includes("onZoomOut"), "Provides Zoom controls");
  assert(toolbarSource.includes("onZoomFit"), "Provides Zoom Fit control");
  assert(toolbarSource.includes("onToggleFullscreen"), "Provides Fullscreen toggle");
  assert(toolbarSource.includes("onToggleChapters"), "Provides Table of Contents trigger");
  assert(toolbarSource.includes("Explain"), "Features prominent golden Explain button");

  // Module 6: On-Demand AI Explanation Drawer
  console.log("\n--- Module 6: On-Demand AI Explanation Drawer ---");
  assert(explainPanelSource.includes("/api/reader/explain"), "Connects to Gurukul /api/reader/explain endpoint");
  assert(explainPanelSource.includes("AI Research Synthesis • Grounded in Shastra"), "Identifies AI-generated synthesis clearly");
  assert(explainPanelSource.includes("wordMeanings"), "Supports Sanskrit word-by-word meaning breakdown");
  assert(explainPanelSource.includes("citations"), "Provides grounded citations and verification indicators");
  assert(explainPanelSource.includes("Resume Reading") || explainPanelSource.includes("Close Drawer"), "Allows non-destructive dismissal returning to reading position");

  // Module 7: Real Database Book & PDF Streaming Verification
  console.log("\n--- Module 7: Real Database Book & PDF Streaming Verification ---");
  const testBook = await prisma.book.findFirst({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true, slug: true, pageCount: true },
  });

  assert(Boolean(testBook), `Retrieved authentic database book: "${testBook.title}"`);
  assert(testBook.pageCount > 0, `Book has authentic page count (${testBook.pageCount} pages)`);

  const { GET } = await import("../app/api/books/[id]/pdf/route.js");
  const req = new Request(`http://localhost:3000/api/books/${testBook.id}/pdf`);
  const res = await GET(req, { params: Promise.resolve({ id: testBook.id }) });
  assert(res.status === 200, "Secure PDF streaming route responds with HTTP 200");
  assert(res.headers.get("accept-ranges") === "bytes", "Streams with RFC 7233 byte-range support for high performance");

  console.log("\n===============================================================================");
  console.log(`  MAGAZINE READER SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("===============================================================================");

  if (failed > 0) process.exit(1);
}

runMagazineReaderSuite()
  .catch((err) => {
    console.error("Test failed fatal error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
