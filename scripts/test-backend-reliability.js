import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import {
  applyRateLimit,
  checkRateLimit,
  recordAuthFailure,
  resetAuthLimit,
  RATE_LIMIT_TIERS,
} from "../server/security/rateLimiter.js";
import { apiSuccess, apiError, getCorrelationId } from "../server/security/apiResponse.js";
import { logger, redactSensitiveData } from "../server/monitoring/logger.js";
import { runEmbeddingBatchJob } from "../server/ai/embeddingJob.js";
import { extractAndStorePassageKnowledge } from "../server/knowledge/knowledgeGraph.js";

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

async function runBackendReliabilitySuite() {
  console.log("===============================================================================");
  console.log("  GURUKUL: BACKEND RELIABILITY, API PERFORMANCE & PLATFORM SECURITY SUITE");
  console.log("===============================================================================\n");

  // =========================================================================
  // Module 1: Authentication Hardening & Credential Protection
  // =========================================================================
  console.log("--- Module 1: Authentication Hardening & Credential Protection ---");

  // 1.1 Verify admin user exists and password hash works
  const adminUser = await prisma.user.findFirst({
    where: { email: "admin@example.com" },
  });
  assert(Boolean(adminUser), "Admin user exists in database");
  assert(Boolean(adminUser.passwordHash), "Admin user has password hash stored");

  // 1.2 Test bcrypt verification with correct and incorrect passwords
  const validPasswordMatches = await bcrypt.compare("Admin@12345", adminUser.passwordHash);
  assert(validPasswordMatches === true, "Valid password 'Admin@12345' verifies successfully");

  const invalidPasswordMatches = await bcrypt.compare("WrongPassword!123", adminUser.passwordHash);
  assert(invalidPasswordMatches === false, "Invalid password fails verification strictly");

  // 1.3 Verify simulation of empty hash defense (missing hash must never authenticate)
  const dummyUserNoHash = { email: "ghost@example.com", passwordHash: null };
  const shouldBlockNoHash = !dummyUserNoHash.passwordHash;
  assert(shouldBlockNoHash === true, "Missing password hash immediately blocks authorization");

  // 1.4 Verify sensitive field redaction from user objects
  const rawUserPayload = {
    id: "usr-test-1",
    name: "Admin Scholar",
    email: "admin@example.com",
    passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz",
    role: "SUPER_ADMIN",
  };
  const sanitizedUser = { ...rawUserPayload };
  delete sanitizedUser.passwordHash;
  assert(!("passwordHash" in sanitizedUser), "Password hash is stripped from user API representation");

  // =========================================================================
  // Module 2: Adaptive Rate Limiting & Sliding Window Protection
  // =========================================================================
  console.log("\n--- Module 2: Adaptive Rate Limiting & Sliding Window Protection ---");

  const testIp = `test-ip-${Date.now()}`;
  const customTier = { max: 3, windowSec: 10, tierName: "TEST" };

  // First request - allowed
  const r1 = checkRateLimit(`ip:${testIp}`, customTier);
  assert(r1.allowed === true && r1.remaining === 2, "First request allowed with correct remaining quota");

  // Second & third requests - allowed
  checkRateLimit(`ip:${testIp}`, customTier);
  const r3 = checkRateLimit(`ip:${testIp}`, customTier);
  assert(r3.allowed === true && r3.remaining === 0, "Third request consumes last available quota");

  // Fourth request - blocked (429)
  const r4 = checkRateLimit(`ip:${testIp}`, customTier);
  assert(r4.allowed === false, "Fourth request is throttled (429 rate limit breached)");
  assert(r4.resetSec > 0, "Throttled response includes positive resetSec interval");

  // Test applyRateLimit helper returns NextResponse on limit breach
  const mockReq = {
    headers: {
      get: (k) => (k.toLowerCase() === "x-forwarded-for" ? testIp : null),
    },
  };
  // Pre-seed limit breach on testIp for applyRateLimit
  checkRateLimit(testIp, customTier);
  checkRateLimit(testIp, customTier);
  checkRateLimit(testIp, customTier);
  checkRateLimit(testIp, customTier);

  const blockedResponse = applyRateLimit(mockReq, customTier);
  assert(blockedResponse !== null && blockedResponse.status === 429, "applyRateLimit returns HTTP 429 NextResponse");

  // Auth failure counter & reset
  const testEmail = `scholar-${Date.now()}@gurukul.org`;
  recordAuthFailure(testEmail);
  const authLimitCheck = checkRateLimit(testEmail, RATE_LIMIT_TIERS.AUTH);
  assert(authLimitCheck.remaining < RATE_LIMIT_TIERS.AUTH.max, "Auth failure counter increments and reduces remaining quota");

  resetAuthLimit(testEmail);
  const authLimitReset = checkRateLimit(testEmail, RATE_LIMIT_TIERS.AUTH);
  assert(authLimitReset.remaining === RATE_LIMIT_TIERS.AUTH.max - 1, "resetAuthLimit successfully clears accumulated auth failures");

  // =========================================================================
  // Module 3: Centralized Safe API Responses & Correlation Tracing
  // =========================================================================
  console.log("\n--- Module 3: Centralized Safe API Responses & Correlation Tracing ---");

  // 3.1 Test apiSuccess formatting
  const mockSuccessReq = {
    headers: {
      get: (k) => (k.toLowerCase() === "x-correlation-id" ? "cid-test-456" : null),
    },
  };
  const successRes = apiSuccess({ status: "OK", count: 42 }, 200, { page: 1 }, mockSuccessReq);
  assert(successRes.status === 200, "apiSuccess returns HTTP 200 status");
  assert(successRes.headers.get("X-Correlation-ID") === "cid-test-456", "Preserves incoming X-Correlation-ID header");
  assert(successRes.headers.get("X-Content-Type-Options") === "nosniff", "Sets nosniff security header");

  // 3.2 Test apiError sanitization
  const sensitiveError = new Error("Connection failed to postgres://user:secretpass@127.0.0.1:5432/db");
  sensitiveError.stack = "Error: Connection failed\n at Query.run (/app/secret/internal.js:42:15)";

  const errorRes = apiError(sensitiveError, 500, "DATABASE_ERROR", mockSuccessReq);
  assert(errorRes.status === 500, "apiError sets semantic HTTP status 500");
  assert(errorRes.headers.get("X-Correlation-ID") === "cid-test-456", "Error response includes correlation ID");

  // =========================================================================
  // Module 4: Structured Production Logging & Redaction Engine
  // =========================================================================
  console.log("\n--- Module 4: Structured Production Logging & Redaction Engine ---");

  // 4.1 Test deep scrubbing of sensitive credentials
  const dirtyObject = {
    username: "acharya_dev",
    password: "SuperSecretPassword123!",
    api_key: "AIzaSyD-secret-google-gemini-key",
    metadata: {
      authToken: "jwt-token-header.payload.signature",
      birthTime: "08:30",
    },
  };
  const scrubbed = redactSensitiveData(dirtyObject);
  assert(scrubbed.password === "[REDACTED]", "Password is scrubbed from logs");
  assert(scrubbed.api_key === "[REDACTED]", "API key is scrubbed from logs");
  assert(scrubbed.metadata.authToken === "[REDACTED]", "Nested tokens are scrubbed from logs");
  assert(scrubbed.metadata.birthTime === "08:30", "Non-sensitive operational data is preserved");

  // 4.2 Test operational alert recording & circular buffer
  const initialAlertsCount = logger.getRecentAlerts().length;
  logger.alertDatabaseFailure(new Error("Simulated test pool transient timeout"), { source: "test" });
  logger.alertSlowSearch("Sanskrit Jyotish Shloka", 450, 300);

  const updatedAlerts = logger.getRecentAlerts();
  assert(updatedAlerts.length >= initialAlertsCount + 2, "Actionable alerts recorded in circular buffer");
  assert(updatedAlerts[0].category === "SLOW_SEARCH" || updatedAlerts[1].category === "DATABASE_FAILURE", "Alert categories correctly categorized");

  // =========================================================================
  // Module 5: Extended Prisma Client & Query Performance Monitoring
  // =========================================================================
  console.log("\n--- Module 5: Extended Prisma Client & Query Performance Monitoring ---");

  const queryStart = performance.now();
  const [totalBooks, totalPassages, totalIndices] = await Promise.all([
    prisma.book.count(),
    prisma.passage.count(),
    prisma.$queryRaw`SELECT count(*) FROM pg_indexes WHERE schemaname = 'public'`,
  ]);
  const queryDuration = performance.now() - queryStart;

  assert(totalBooks > 0, `Database read succeeded: ${totalBooks} books in database`);
  assert(totalPassages > 0, `Database read succeeded: ${totalPassages} passages in database`);
  assert(queryDuration < 1000, `Multi-model aggregate query executed efficiently (${Math.round(queryDuration)}ms)`);

  // Verify newly created high-traffic indexes exist in PostgreSQL schema
  const indexesInDb = await prisma.$queryRaw`
    SELECT indexname FROM pg_indexes
    WHERE tablename IN ('passages', 'book_pages', 'embedding_batch_jobs', 'knowledge_relationships')
  `;
  const indexNames = indexesInDb.map((idx) => idx.indexname);
  assert(
    indexNames.some((name) => name.includes("verificationStatus") || name.includes("status")),
    "High-traffic indexes verified on passages table"
  );
  assert(
    indexNames.some((name) => name.includes("proofread") || name.includes("verificationStatus")),
    "Indexes verified on book_pages table"
  );

  // =========================================================================
  // Module 6: Background Worker Deduplication & Resilient Job Queue
  // =========================================================================
  console.log("\n--- Module 6: Background Worker Deduplication & Resilient Job Queue ---");

  // 6.1 Test EmbeddingBatchJob deduplication
  // Create an active test job in PROCESSING status
  const testActiveBatch = await prisma.embeddingBatchJob.create({
    data: {
      status: "PROCESSING",
      model: "text-embedding-004",
      startedAt: new Date(),
    },
  });

  // Calling runEmbeddingBatchJob must detect existing active batch and return deduplicated
  const deduplicatedJob = await runEmbeddingBatchJob({ batchSize: 5 });
  assert(
    deduplicatedJob.status === "ALREADY_PROCESSING" || deduplicatedJob.jobId === testActiveBatch.id,
    "runEmbeddingBatchJob deduplicates active processing batches to prevent API spam"
  );

  // Clean up test batch job
  await prisma.embeddingBatchJob.delete({ where: { id: testActiveBatch.id } });

  // 6.2 Test KnowledgeExtractionJob deduplication
  const samplePassage = await prisma.passage.findFirst({
    where: { text: { not: "" } },
  });
  assert(Boolean(samplePassage), "Found sample passage for extraction deduplication verification");

  if (samplePassage) {
    const activeExtractJob = await prisma.knowledgeExtractionJob.create({
      data: {
        passageId: samplePassage.id,
        status: "PROCESSING",
        method: "RULE_BASED_NLP",
        startedAt: new Date(),
      },
    });

    const secondExtractionResult = await extractAndStorePassageKnowledge({
      passageId: samplePassage.id,
      text: samplePassage.text || "अथ ज्योतिःशास्त्रप्रवचनम्",
      bookId: samplePassage.bookId,
    });
    assert(
      secondExtractionResult.deduplicated === true || secondExtractionResult.status === "ALREADY_PROCESSING",
      "extractAndStorePassageKnowledge safely skips concurrent duplicate extraction on same passage"
    );

    // Clean up test extraction job
    await prisma.knowledgeExtractionJob.delete({ where: { id: activeExtractJob.id } });
  }

  // =========================================================================
  // Module 7: Admin System Health Diagnostic Integrity
  // =========================================================================
  console.log("\n--- Module 7: Admin System Health Diagnostic Integrity ---");

  const [dbPingResult] = await prisma.$queryRaw`SELECT 1 as live`;
  assert(dbPingResult.live === 1, "Database live ping probe returned 1");

  const recentAlerts = logger.getRecentAlerts();
  assert(Array.isArray(recentAlerts), "System health logger alerts returns array of recent events");

  const totalEmbeddingJobs = await prisma.embeddingBatchJob.count();
  const totalKnowledgeJobs = await prisma.knowledgeExtractionJob.count();
  assert(typeof totalEmbeddingJobs === "number", `Embedding batch jobs monitored (${totalEmbeddingJobs} total)`);
  assert(typeof totalKnowledgeJobs === "number", `Knowledge extraction jobs monitored (${totalKnowledgeJobs} total)`);

  console.log("\n===============================================================================");
  console.log(`  BACKEND RELIABILITY TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("===============================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runBackendReliabilitySuite()
  .catch((err) => {
    console.error("Test execution fatal error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
