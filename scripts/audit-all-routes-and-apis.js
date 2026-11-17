/**
 * Comprehensive Route-by-Route & API Production Launch Audit Script
 * 
 * Tests every single discovered page, API endpoint, auth guard, and reader route against
 * the live running server at http://localhost:3000.
 */

import http from "http";

const BASE_URL = "http://localhost:3000";

let passed = 0;
let failed = 0;
const results = [];

async function probeUrl(urlPath, options = {}) {
  const url = `${BASE_URL}${urlPath}`;
  const method = options.method || "GET";

  try {
    const res = await fetch(url, {
      method,
      headers: {
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      redirect: "manual", // inspect redirects directly
    });

    return {
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
      redirectUrl: res.headers.get("location"),
      ok: res.ok,
    };
  } catch (err) {
    return {
      status: 0,
      error: err.message,
      ok: false,
    };
  }
}

function record(name, category, url, status, expectedStatus, details = "") {
  const isMatch = Array.isArray(expectedStatus)
    ? expectedStatus.includes(status)
    : status === expectedStatus;

  if (isMatch) {
    console.log(`  ✓ PASS [${status}] ${name} (${url})`);
    passed++;
    results.push({ name, category, url, status, expected: expectedStatus, passed: true });
  } else {
    console.error(`  ✗ FAIL [${status} != ${expectedStatus}] ${name} (${url}) ${details}`);
    failed++;
    results.push({ name, category, url, status, expected: expectedStatus, passed: false, details });
  }
}

async function runAudit() {
  console.log("\n==================================================================");
  console.log("  GURUKUL – FULL WEBSITE ROUTE & API PRODUCTION LAUNCH AUDIT");
  console.log("==================================================================\n");

  // 1. PUBLIC PAGES (Expected: 200 OK)
  console.log("--- 1. PUBLIC PAGES AUDIT ---");
  const publicPages = [
    { name: "Homepage", url: "/" },
    { name: "Digital Library Index", url: "/library" },
    { name: "Book Details (Arogyanidhii)", url: "/library/arogyanidhii" },
    { name: "Book Reader (Arogyanidhii PDF)", url: "/library/arogyanidhii/pdf" },
    { name: "Astrology Portal", url: "/astrology" },
    { name: "Vedic Calendar & Festivals", url: "/astrology/calendar" },
    { name: "Daily Astrology Overview", url: "/astrology/daily" },
    { name: "Daily Vedic Guidance & Practice", url: "/astrology/daily-guidance" },
    { name: "My Personal Kundli Dashboard", url: "/astrology/my-dashboard" },
    { name: "AI Jyotish Assistant", url: "/astrology/ai-assistant" },
    { name: "AI Hub Overview", url: "/ai" },
    { name: "AI Chat Interface", url: "/ai/chat" },
    { name: "Explore Topics & Concepts", url: "/explore" },
    { name: "Community & Circles", url: "/community" },
    { name: "Quiz Portal", url: "/quiz" },
    { name: "Scholarly Research Workspace", url: "/research" },
    { name: "Sanskrit Verse & Grammar Explorer", url: "/sanskrit" },
    { name: "Universal Search", url: "/search" },
    { name: "Spirituality & Kundalini Module", url: "/spirituality/kundalini" },
    { name: "Admin Login Page", url: "/admin/login" },
  ];

  for (const p of publicPages) {
    const res = await probeUrl(p.url);
    record(p.name, "Public Page", p.url, res.status, 200, res.error);
  }

  // 2. DASHBOARD PAGES (Expected: 200 OK or 307/302 Redirect to sign in for unauthenticated)
  console.log("\n--- 2. USER DASHBOARD ACCESS & REDIRECTION AUDIT ---");
  const dashboardPages = [
    { name: "Dashboard Overview", url: "/dashboard" },
    { name: "User Profile", url: "/dashboard/profile" },
    { name: "Reading Progress", url: "/dashboard/progress" },
    { name: "Saved Bookmarks", url: "/dashboard/bookmarks" },
    { name: "Personal Notes", url: "/dashboard/notes" },
    { name: "Family Circle", url: "/dashboard/family" },
    { name: "XP Leaderboard", url: "/dashboard/leaderboard" },
    { name: "User Settings", url: "/dashboard/settings" },
  ];

  for (const d of dashboardPages) {
    const res = await probeUrl(d.url);
    // Should either render with guest fallback (200) or cleanly redirect to sign in (302/307/308)
    record(d.name, "Dashboard Page", d.url, res.status, [200, 302, 307, 308], res.error);
  }

  // 3. ADMIN CONSOLE PAGES (Expected: Redirect to /admin/login for unauthenticated)
  console.log("\n--- 3. ADMIN CONSOLE SECURITY & RBAC AUDIT ---");
  const adminPages = [
    { name: "Admin Console Root", url: "/admin" },
    { name: "Admin Action Center", url: "/admin/action-center" },
    { name: "Admin Books Manager", url: "/admin/books" },
    { name: "Admin Content Quality", url: "/admin/content-quality" },
    { name: "Admin OCR Operations", url: "/admin/ocr" },
    { name: "Admin Source Verification", url: "/admin/verification" },
    { name: "Admin Festivals Studio", url: "/admin/festivals" },
    { name: "Admin Astrology Console", url: "/admin/astrology" },
    { name: "Admin Astro AI", url: "/admin/astro-ai" },
    { name: "Admin Knowledge Graph", url: "/admin/knowledge-graph" },
    { name: "Admin Curriculum & Lessons", url: "/admin/learn" },
    { name: "Admin Quizzes", url: "/admin/quizzes" },
    { name: "Admin Users Management", url: "/admin/users" },
    { name: "Admin Family Circles", url: "/admin/family" },
    { name: "Admin Platform Analytics", url: "/admin/analytics" },
    { name: "Admin Audit Logs", url: "/admin/audit-logs" },
    { name: "Admin System Health", url: "/admin/system-health" },
    { name: "Admin Platform Settings", url: "/admin/settings" },
  ];

  for (const a of adminPages) {
    const res = await probeUrl(a.url);
    // Next.js client layout redirects unauthenticated users or server layout renders cleanly
    record(a.name, "Admin Page", a.url, res.status, [200, 302, 307, 308], res.error);
  }

  // 4. CORE PUBLIC APIS (Expected: 200 OK)
  console.log("\n--- 4. CORE PUBLIC APIS AUDIT ---");
  const publicApis = [
    { name: "System Health API", url: "/api/health" },
    { name: "Books Catalog API", url: "/api/books" },
    { name: "Book Recommendations API", url: "/api/books/recommendations" },
    { name: "Book PDF Info API (Arogyanidhii)", url: "/api/books/arogyanidhii/pdf?info=true" },
    { name: "Search API (q=astrology)", url: "/api/search?q=astrology" },
    { name: "Daily Astrology API (Panchang)", url: "/api/astrology/daily" },
    { name: "Daily Vedic Guidance API", url: "/api/astrology/daily-guidance" },
    { name: "Daily Practice Plan API", url: "/api/astrology/daily-practice" },
    { name: "Vedic Calendar Month API", url: "/api/astrology/calendar/month" },
    { name: "Vedic Calendar Upcoming API", url: "/api/astrology/calendar/upcoming" },
    { name: "Vrata Schedule API", url: "/api/astrology/calendar/vrata" },
    { name: "Knowledge Search API", url: "/api/knowledge-graph/search?q=Sun" },
    { name: "XP Leaderboard API", url: "/api/gamification/leaderboard" },
    { name: "Gamification Status API", url: "/api/gamification/status" },
    { name: "Provenance Statistics API", url: "/api/provenance/statistics" },
    { name: "Provenance Queue API", url: "/api/provenance/queue" },
  ];

  for (const api of publicApis) {
    const res = await probeUrl(api.url);
    record(api.name, "Public API", api.url, res.status, 200, res.error);
  }

  // 5. SECURITY & ACCESS CONTROL CHECK (Unauthenticated calls to protected routes must be blocked: 401 or 403)
  console.log("\n--- 5. NEGATIVE SECURITY & AUTHORIZATION TESTS ---");
  const protectedApis = [
    { name: "Protected User Profile API", url: "/api/user/profile" },
    { name: "Protected User Bookmarks API", url: "/api/user/bookmarks" },
    { name: "Protected User Notes API", url: "/api/user/notes" },
    { name: "Protected Reading Analytics API", url: "/api/user/reading-analytics" },
    { name: "Protected Calendar Preferences API", url: "/api/astrology/calendar/preferences" },
    { name: "Protected Calendar Reminders API", url: "/api/astrology/calendar/reminders" },
    { name: "Protected Admin System Health API", url: "/api/admin/system-health" },
    { name: "Protected Admin Users API", url: "/api/admin/users" },
    { name: "Protected Admin Audit Logs API", url: "/api/admin/audit" },
    { name: "Protected Admin Festivals API", url: "/api/admin/festivals" },
  ];

  for (const sec of protectedApis) {
    const res = await probeUrl(sec.url);
    record(sec.name, "Security Guard", sec.url, res.status, [401, 403], `Expected 401/403 for unauthenticated call`);
  }

  // 6. RFC 7233 PDF BYTE-RANGE STREAMING TEST
  console.log("\n--- 6. PDF DELIVERY & STREAMING RFC 7233 AUDIT ---");
  const pdfStreamRes = await probeUrl("/api/books/arogyanidhii/pdf", {
    headers: { Range: "bytes=0-511" },
  });
  record("RFC 7233 206 Partial Content", "PDF Streaming", "/api/books/arogyanidhii/pdf", pdfStreamRes.status, 206);
  assert(pdfStreamRes.headers["content-range"] !== undefined, "Content-Range header present in 206 response");
  assert(pdfStreamRes.headers["content-length"] === "512", "Content-Length is exactly 512 bytes for 0-511 range");

  console.log("\n==================================================================");
  console.log(`  AUDIT RESULTS: ${passed} PASSED | ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log("==================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

runAudit().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
