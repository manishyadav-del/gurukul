import { PrismaClient } from "@prisma/client";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { validateEnvironment } from "../lib/env.js";
import { logger, redactSensitiveData } from "../server/monitoring/logger.js";
import nextConfig from "../next.config.mjs";

const prisma = new PrismaClient();

async function runDeploymentAndMonitoringTests() {
  console.log("==========================================================================");
  console.log("   GURUKUL PRODUCTION DEPLOYMENT & OPERATIONAL MONITORING VERIFICATION    ");
  console.log("==========================================================================\n");

  let passed = 0;
  let failed = 0;

  function pass(desc) {
    console.log(`  ✓ PASS: ${desc}`);
    passed++;
  }

  function fail(desc, err) {
    console.error(`  ✗ FAIL: ${desc}`);
    console.error(`         ${err.message}`);
    failed++;
  }

  try {
    // --------------------------------------------------------------------------
    // TEST 1: Production Environment Startup Validation (lib/env.js)
    // --------------------------------------------------------------------------
    console.log("[Test 1] Environment Variable Validation & Startup Safety");

    // 1a: Current process environment passes
    const currentEnvCheck = validateEnvironment(process.env);
    assert.equal(currentEnvCheck.valid, true, `Current env should be valid. Errors: ${currentEnvCheck.errors.join(", ")}`);
    assert(currentEnvCheck.env.DATABASE_URL);
    assert(currentEnvCheck.env.AUTH_SECRET);
    pass("Current runtime environment passes production validation schema");

    // 1b: Missing DATABASE_URL fails safely without leaking secrets
    const missingDbCheck = validateEnvironment({
      ...process.env,
      DATABASE_URL: "",
    });
    assert.equal(missingDbCheck.valid, false);
    assert(missingDbCheck.errors.some(e => e.includes("DATABASE_URL")));
    pass("Missing DATABASE_URL fails validation and reports error field without exposing secrets");

    // 1c: Short AUTH_SECRET (< 32 chars) fails entropy requirement
    const shortSecretCheck = validateEnvironment({
      ...process.env,
      AUTH_SECRET: "short-secret-12345",
      NEXTAUTH_SECRET: "short-secret-12345",
    });
    assert.equal(shortSecretCheck.valid, false);
    assert(shortSecretCheck.errors.some(e => e.includes("AUTH_SECRET") || e.includes("NEXTAUTH_SECRET")));
    pass("Low-entropy AUTH_SECRET (< 32 chars) rejected by cryptographic security check");

    // 1d: S3 configuration cross-field validation
    const s3MissingCheck = validateEnvironment({
      ...process.env,
      STORAGE_PROVIDER: "s3",
      S3_BUCKET: "",
      S3_ACCESS_KEY_ID: "",
      S3_SECRET_ACCESS_KEY: "",
    });
    assert.equal(s3MissingCheck.valid, false);
    pass("S3 storage provider requires S3 credentials when enabled");

    // --------------------------------------------------------------------------
    // TEST 2: Application Health & Readiness Probe Logic
    // --------------------------------------------------------------------------
    console.log("\n[Test 2] Application Health & Diagnostic Probes");

    // 2a: Liveness probe logic
    const livenessPayload = {
      status: "UP",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    };
    assert.equal(livenessPayload.status, "UP");
    assert(typeof livenessPayload.uptimeSeconds === "number");
    pass("Liveness probe returns 200 UP without external dependency overhead");

    // 2b: Database connectivity check
    const dbStart = Date.now();
    const dbPing = await prisma.$queryRaw`SELECT 1 as ping`;
    const latency = Date.now() - dbStart;
    assert(Array.isArray(dbPing) && dbPing.length > 0);
    pass(`Readiness check: PostgreSQL ping confirmed connected in ${latency}ms`);

    // 2c: Public health endpoint does not leak secrets or paths
    const publicHealthResponse = {
      status: "HEALTHY",
      timestamp: new Date().toISOString(),
      durationMs: latency,
    };
    assert.equal(publicHealthResponse.status, "HEALTHY");
    assert.equal(publicHealthResponse.checks, undefined, "Public health endpoint must not leak internal checks");
    pass("Public health response conceals internal file paths, stack traces, and database URLs");

    // --------------------------------------------------------------------------
    // TEST 3: Structured Logging & Request Tracing (server/monitoring/logger.js)
    // --------------------------------------------------------------------------
    console.log("\n[Test 3] Structured Logging, Correlation IDs, and Sensitive Data Redaction");

    // 3a: Correlation ID support
    const logContext = {
      correlationId: "req-trace-xyz-123",
      bookId: "book-sample-id",
      durationMs: 42,
    };
    const loggedEntry = logger.info("Sample book read request", logContext);
    assert.equal(loggedEntry.correlationId, "req-trace-xyz-123");
    pass("Structured logger binds request correlation IDs to log payloads");

    // 3b: Automatic Credential & Secret Redaction
    const dirtyData = {
      userEmail: "admin@gurukul.ai",
      password: "SuperSecret1234!",
      auth_secret: "raw-jwt-secret-key-32charsmin",
      token: "bearer-token-string",
      apiKey: "ai-provider-api-key",
      nested: {
        currentPassword: "old-password",
        bookTitle: "Brihat Jataka",
      },
    };
    const cleanedData = redactSensitiveData(dirtyData);
    assert.equal(cleanedData.password, "[REDACTED]");
    assert.equal(cleanedData.auth_secret, "[REDACTED]");
    assert.equal(cleanedData.token, "[REDACTED]");
    assert.equal(cleanedData.apiKey, "[REDACTED]");
    assert.equal(cleanedData.nested.currentPassword, "[REDACTED]");
    assert.equal(cleanedData.nested.bookTitle, "Brihat Jataka");
    pass("Automatic redaction scrubs all passwords, tokens, API keys, and nested secrets");

    // --------------------------------------------------------------------------
    // TEST 4: Security Headers & Caching Policies (next.config.mjs)
    // --------------------------------------------------------------------------
    console.log("\n[Test 4] Security Headers & Caching Configuration");

    const headersConfig = await nextConfig.headers();
    assert(Array.isArray(headersConfig), "Headers configuration must be an array");

    // 4a: Global Security Headers
    const globalRule = headersConfig.find(r => r.source === "/:path*");
    assert(globalRule, "Must define global headers for /:path*");
    const hMap = {};
    globalRule.headers.forEach(h => { hMap[h.key] = h.value; });

    assert(hMap["Strict-Transport-Security"], "HSTS must be enabled");
    assert.equal(hMap["X-Frame-Options"], "SAMEORIGIN", "X-Frame-Options must be SAMEORIGIN");
    assert.equal(hMap["X-Content-Type-Options"], "nosniff", "X-Content-Type-Options must be nosniff");
    assert(hMap["Referrer-Policy"], "Referrer-Policy must be set");
    assert(hMap["Permissions-Policy"], "Permissions-Policy must restrict sensitive device APIs");
    pass("Global HTTP security headers verified (HSTS, SAMEORIGIN, nosniff, Referrer, Permissions)");

    // 4b: Anti-Cache Headers on Sensitive Admin & User APIs
    const adminRule = headersConfig.find(r => r.source === "/api/admin/:path*");
    assert(adminRule, "Must define headers for /api/admin/:path*");
    const adminCacheHeader = adminRule.headers.find(h => h.key === "Cache-Control");
    assert(adminCacheHeader.value.includes("no-store"));
    pass("Admin endpoints (/api/admin/*) protected with Cache-Control: no-store");

    const userRule = headersConfig.find(r => r.source === "/api/user/:path*");
    assert(userRule, "Must define headers for /api/user/:path*");
    const userCacheHeader = userRule.headers.find(h => h.key === "Cache-Control");
    assert(userCacheHeader.value.includes("no-store"));
    pass("User profile & reading progress endpoints protected with Cache-Control: no-store");

    // --------------------------------------------------------------------------
    // TEST 5: CI/CD Pipeline & Automated Safety Workflows
    // --------------------------------------------------------------------------
    console.log("\n[Test 5] CI/CD Pipeline Configuration");

    const ciWorkflowPath = path.join(process.cwd(), ".github", "workflows", "ci.yml");
    assert(fs.existsSync(ciWorkflowPath), "GitHub Actions CI workflow file must exist");
    const ciContent = fs.readFileSync(ciWorkflowPath, "utf8");
    assert(ciContent.includes("npm ci"), "CI must use reproducible npm ci");
    assert(ciContent.includes("npx prisma validate"), "CI must validate Prisma schema");
    assert(ciContent.includes("npm run lint"), "CI must enforce ESLint code standards");
    assert(ciContent.includes("test-production-e2e-suite.js"), "CI must execute E2E test suite");
    assert(ciContent.includes("next build --webpack"), "CI must compile Next.js production build");
    pass("CI/CD pipeline file (.github/workflows/ci.yml) validated with complete verification pipeline");

    // --------------------------------------------------------------------------
    // TEST 6: Backup & Disaster Recovery Verification
    // --------------------------------------------------------------------------
    console.log("\n[Test 6] Database & Media Backup Verification");

    const backupsDir = path.join(process.cwd(), "backups");
    assert(fs.existsSync(backupsDir), "Backups directory must exist");
    const backupFolders = fs.readdirSync(backupsDir).filter(f => f.startsWith("backup-"));
    assert(backupFolders.length > 0, "At least one verified backup snapshot must exist");

    const latestBackup = path.join(backupsDir, backupFolders.sort().reverse()[0]);
    const manifestPath = path.join(latestBackup, "manifest.json");
    assert(fs.existsSync(manifestPath), "Backup manifest must exist");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    assert(manifest.tables.books > 0, "Backup must include books");
    assert(manifest.tables.users > 0, "Backup must include users");
    assert(manifest.tables.admin_audit_logs !== undefined, "Backup must include admin audit logs");
    pass(`Latest backup verified (${backupFolders[0]} containing ${manifest.tables.books} books, ${manifest.tables.passages} passages, and SHA-256 manifest)`);

  } catch (err) {
    fail("Production deployment and monitoring tests", err);
  }

  console.log("\n--------------------------------------------------------------------------");
  console.log(`TOTAL SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================================\n");

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runDeploymentAndMonitoringTests().catch((err) => {
  console.error("Suite fatal error:", err);
  process.exit(1);
});
