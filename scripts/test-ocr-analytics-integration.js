/**
 * Comprehensive integration test for Gurukul OCR Analytics and Monitoring Engine
 */
import {
  getOcrOverviewMetrics,
  getOcrQualityDistribution,
  getBookQualityReports,
  getBookPageAudit,
  getOcrErrorAnalytics,
  getOcrCorrectionFeedback,
  getOcrPerformanceAnalytics,
  getOcrActionableAlerts,
  generateOcrCsvExport,
} from "../server/admin/ocrAnalytics.js";
import prisma from "../lib/prisma.js";

async function runTests() {
  console.log("=== STARTING OCR QUALITY ANALYTICS & MONITOR INTEGRATION TEST ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = "") {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}: ${details}`);
      failed++;
    }
  }

  try {
    // 1. Overview Metrics
    console.log("\n--- 1. Testing getOcrOverviewMetrics ---");
    const overview = await getOcrOverviewMetrics(true);
    assert(overview && typeof overview.totalBooks === "number", "Overview has totalBooks count", `Got: ${overview?.totalBooks}`);
    assert(overview && typeof overview.totalPages === "number", "Overview has totalPages count", `Got: ${overview?.totalPages}`);
    assert(overview && typeof overview.successRate === "number", "Overview has numeric successRate", `Got: ${overview?.successRate}`);
    assert(overview && overview.queue && typeof overview.queue.queuedCount === "number", "Overview includes queue telemetry");
    console.log(`Summary: ${overview.totalBooks} books, ${overview.totalPages} pages, successRate: ${overview.successRate}%, proofread: ${overview.proofreadPages}`);

    // 2. Quality Distribution
    console.log("\n--- 2. Testing getOcrQualityDistribution ---");
    const quality = await getOcrQualityDistribution();
    assert(Array.isArray(quality.tiers), "Quality returns tiers array");
    assert(quality.tiers.length === 4, "Quality distribution has 4 tiers (Verified, High, Needs Review, Low)");
    assert(typeof quality.totalEvaluatedPages === "number", "Quality returns totalEvaluatedPages");
    assert(Array.isArray(quality.methods), "Quality returns extraction vs OCR methods breakdown");
    console.log(`Distribution tiers:`, quality.tiers.map(d => `${d.label}: ${d.count} (${d.percentage}%)`).join(", "));

    // 3. Book Quality Reports (Paginated)
    console.log("\n--- 3. Testing getBookQualityReports ---");
    const bookReports = await getBookQualityReports({ page: 1, limit: 5 });
    assert(Array.isArray(bookReports.reports), "Book reports returns an array");
    assert(bookReports.pagination && bookReports.pagination.total >= 0, "Book reports returns valid pagination");
    if (bookReports.reports.length > 0) {
      const b0 = bookReports.reports[0];
      assert(b0.title && typeof b0.totalBookPages === "number", "Book report item has title and totalBookPages", `Title: ${b0.title}`);
      assert(typeof b0.verificationProgress === "number", "Book report item has numeric verificationProgress");
      console.log(`Sample book: "${b0.title}" (${b0.language}) - ${b0.totalBookPages} pages, ${b0.verificationProgress}% verified, avgConf: ${b0.avgConfidence}`);
    }

    // 4. Single Book Drill-down Page Audit
    console.log("\n--- 4. Testing getBookPageAudit ---");
    if (bookReports.reports.length > 0) {
      const sampleBookId = bookReports.reports[0].id;
      const audit = await getBookPageAudit(sampleBookId);
      assert(audit && audit.book && audit.book.id === sampleBookId, "Book page audit matches requested book ID");
      assert(Array.isArray(audit.pages), "Book page audit returns pages array");
      if (audit.pages.length > 0) {
        const p0 = audit.pages[0];
        assert(typeof p0.pageNumber === "number" && p0.proofreadUrl, "Page audit includes pageNumber and proofreadUrl", `Url: ${p0.proofreadUrl}`);
        console.log(`Sample page ${p0.pageNumber}: tier=${p0.tier}, conf=${p0.confidence}, method=${p0.processingMethod}, engine=${p0.ocrEngine}, errors=${p0.unresolvedErrors.length}`);
      }
    }

    // 5. Error Analytics
    console.log("\n--- 5. Testing getOcrErrorAnalytics ---");
    const errors = await getOcrErrorAnalytics();
    assert(typeof errors.totalErrors === "number", "Error analytics returns totalErrors count", `Got: ${errors.totalErrors}`);
    assert(Array.isArray(errors.categories), "Error analytics returns categories array");
    assert(errors.categories.length === 8, "Error analytics includes all 8 standardized error categories");
    console.log(`Total errors: ${errors.totalErrors}, top category: ${errors.categories[0]?.label} (${errors.categories[0]?.count})`);

    // 6. Correction Feedback Analytics
    console.log("\n--- 6. Testing getOcrCorrectionFeedback ---");
    const corrections = await getOcrCorrectionFeedback();
    assert(typeof corrections.totalCorrectionsRecorded === "number", "Correction feedback returns totalCorrectionsRecorded", `Got: ${corrections.totalCorrectionsRecorded}`);
    assert(Array.isArray(corrections.topCharacterReplacements), "Returns topCharacterReplacements array");
    assert(Array.isArray(corrections.suggestedRules), "Returns suggestedRules array");
    console.log(`Analyzed corrections: ${corrections.totalCorrectionsRecorded}, suggested rules: ${corrections.suggestedRules.length}`);
    if (corrections.suggestedRules.length > 0) {
      console.log(`Rule 1: "${corrections.suggestedRules[0].title}" - ${corrections.suggestedRules[0].pattern}`);
    }

    // 7. Performance Analytics
    console.log("\n--- 7. Testing getOcrPerformanceAnalytics ---");
    const perf = await getOcrPerformanceAnalytics();
    assert(perf.memoryMetrics && typeof perf.memoryMetrics.heapUsedMb === "number", "Performance includes heap memory metrics");
    assert(Array.isArray(perf.distribution), "Performance includes latency distribution buckets");
    assert(Array.isArray(perf.optimizationRecommendations), "Performance includes actionable suggestions");
    console.log(`Heap: ${perf.memoryMetrics.heapUsedMb} MB / ${perf.memoryMetrics.heapTotalMb} MB, Latency distribution: ${perf.distribution.map(l => `${l.bucket}: ${l.count}`).join(", ")}`);

    // 8. Actionable Alerts
    console.log("\n--- 8. Testing getOcrActionableAlerts ---");
    const alerts = await getOcrActionableAlerts();
    assert(Array.isArray(alerts.alerts), "Alerts returns alerts array");
    assert(typeof alerts.totalAlerts === "number", "Alerts returns totalAlerts count");
    console.log(`Active alerts: ${alerts.totalAlerts} (Critical: ${alerts.criticalCount}, Warning: ${alerts.warningCount})`);

    // 9. CSV Export for Books and Pages
    console.log("\n--- 9. Testing generateOcrCsvExport ---");
    const booksCsv = await generateOcrCsvExport("books");
    assert(typeof booksCsv === "string" && booksCsv.startsWith("Book ID,"), "Books CSV export contains expected CSV header");
    const pagesCsv = await generateOcrCsvExport("pages");
    assert(typeof pagesCsv === "string" && pagesCsv.startsWith("Page ID,"), "Pages CSV export contains expected CSV header");
    console.log(`Books CSV size: ${booksCsv.length} bytes, Pages CSV size: ${pagesCsv.length} bytes`);

  } catch (err) {
    console.error("Test execution threw error:", err);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log(`\n=== TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
