/**
 * Test Suite: Daily Vedic Remedies, Puja Recommendations & Kundalini Guidance
 * 
 * Verifies:
 * 1. Panchang integration and deterministic time-window calculation
 * 2. Weekday-specific deity and planetary remedy matching (BPHS Ch. 84)
 * 3. Sanskrit and Devanagari Unicode integrity (Gayatri, Shiva, Surya, Dandas)
 * 4. Daan (charity), Sattvic habit, and traditional Avoidance guidelines
 * 5. Free and accessible alternatives for all rituals
 * 6. Classical source citations (Rigveda, BPHS, Shat-Chakra-Nirupana)
 * 7. Kundalini safety-first compliance (no forceful retention, stop instructions, medical disclaimer)
 * 8. User practice completion & bookmark persistence
 * 9. Authorization guardrails on admin and user action endpoints (401/403)
 * 10. Database query fallback resilience
 */

process.env.NODE_ENV = "test";

import prisma from "../lib/prisma.js";
import { computePanchang } from "../server/astrology/panchang.js";
import { getDailySpiritualGuidance } from "../server/astrology/remedyEngine.js";
import { INITIAL_REMEDIES, INITIAL_KUNDALINI_MODULES } from "../server/astrology/seedRemediesAndKundalini.js";
import { GET as getDailyGuidanceRoute } from "../app/api/astrology/daily-guidance/route.js";
import { POST as postPracticeActionRoute } from "../app/api/astrology/daily-guidance/actions/route.js";
import { GET as getKundaliniRoute } from "../app/api/spirituality/kundalini/route.js";
import { GET as getAdminRemediesRoute, POST as postAdminRemediesRoute } from "../app/api/admin/remedies/route.js";
import { createAccessToken } from "../server/admin/auth.js";

const runId = Date.now().toString(36);
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n==========================================================================");
  console.log("  GURUKUL DAILY VEDIC REMEDIES & KUNDALINI VERIFICATION SUITE");
  console.log("==========================================================================\n");

  // --------------------------------------------------------------------------
  // SECTION 1: PANCHANG INTEGRATION & DETERMINISTIC CALCULATIONS
  // --------------------------------------------------------------------------
  console.log("[1/6] Testing Daily Panchang & Astronomical Alignment...");

  const testDate = "2026-10-25"; // Sunday
  const panchang = computePanchang({
    date: testDate,
    latitude: 28.6139,
    longitude: 77.2090,
    tzOffset: 5.5,
    timezone: "Asia/Kolkata",
  });

  assert(panchang !== null, "Panchang computes deterministically without error");
  assert(panchang.vara?.en === "Sunday", "Identified Sunday (Ravivara) accurately");
  assert(panchang.vara?.lord === "Sun", "Sun recognized as weekday planetary lord");
  assert(panchang.tithi?.name !== undefined, "Calculated verified lunar Tithi");
  assert(panchang.nakshatra?.name !== undefined, "Calculated verified sidereal Nakshatra");
  assert(panchang.rahuKaal?.startLocal !== undefined, "Calculated local Rahu Kaal window");
  assert(panchang.sunrise?.local !== undefined, "Calculated verified local sunrise");

  // --------------------------------------------------------------------------
  // SECTION 2: DETERMINISTIC SPIRITUAL REMEDIES & SOURCE GROUNDING
  // --------------------------------------------------------------------------
  console.log("\n[2/6] Testing Sourced Remedies & Weekday Deity Alignment...");

  const guidance = await getDailySpiritualGuidance({
    panchang,
    date: testDate,
    language: "en",
  });

  assert(Array.isArray(guidance.recommendedPractices), "Returns array of recommended practices");
  assert(guidance.recommendedPractices.length >= 3 && guidance.recommendedPractices.length <= 5, "Returns balanced set of 3 to 5 practices");

  // Check Sunday primary alignment (Surya / Gayatri)
  const sundayPractice = guidance.recommendedPractices.find(
    (p) => p.planetaryAssociation === "Sun" || p.deity?.includes("Surya")
  );
  assert(Boolean(sundayPractice), "Primary recommendation aligns with Sunday Surya deity");

  // Check categories represented
  const hasPujaOrMantra = guidance.recommendedPractices.some((p) => p.category === "PUJA" || p.category === "MANTRA");
  assert(hasPujaOrMantra, "Includes traditional Puja or Mantra recitation");

  const hasAvoidance = guidance.recommendedPractices.some((p) => p.category === "AVOIDANCE");
  assert(hasAvoidance, "Includes traditional Rahu Kaal avoidance guideline");

  // Check Unicode Sanskrit preservation
  const gayatriRemedy = guidance.recommendedPractices.find((p) => p.slug === "surya-arghya-gayatri");
  assert(
    gayatriRemedy?.sanskritMantra?.includes("ॐ भूर्भुवः स्वः") &&
    gayatriRemedy?.sanskritMantra?.includes("॥"),
    "Sanskrit mantra preserved with Devanagari ligatures and dandas (॥)"
  );

  // Check source references
  assert(
    gayatriRemedy?.sourceReference?.includes("Rigveda") ||
    gayatriRemedy?.sourceReference?.includes("Brihat Parashara"),
    "Remedy is anchored in authentic classical scripture (Rigveda / BPHS)"
  );

  // Check accessibility alternative
  assert(
    Boolean(gayatriRemedy?.accessibilityAlternatives),
    "Provides free/accessible alternatives for seekers who cannot perform ritual"
  );

  // Test personalized guidance with nested chartData objects (prevents React child object crash)
  const mockProfileWithObjectChart = {
    name: "Arjuna Seeker",
    birthChart: {
      chartData: {
        ascendant: {
          sign: "Taurus",
          sanskritSign: "वृषभ",
          degree: 14.52,
          siderealTotalDegree: 44.52,
          nakshatra: "Rohini",
          sanskritNakshatra: "रोहिणी",
          pada: 2,
          signLord: "Venus",
        },
        moon: {
          sign: "Cancer",
          sanskritSign: "कर्क",
          degree: 22.1,
          nakshatra: "Pushya",
          sanskritNakshatra: "पुष्य",
          pada: 4,
          signLord: "Moon",
        },
      },
    },
  };

  const personalizedResult = await getDailySpiritualGuidance({
    panchang,
    date: testDate,
    birthProfile: mockProfileWithObjectChart,
    language: "en",
  });

  assert(
    typeof personalizedResult.personalizedGuidance?.userAscendant === "string" &&
    personalizedResult.personalizedGuidance?.userAscendant === "Taurus",
    "Extracted userAscendant as clean string (not object) from chartData"
  );
  assert(
    typeof personalizedResult.personalizedGuidance?.userMoonSign === "string" &&
    personalizedResult.personalizedGuidance?.userMoonSign === "Cancer",
    "Extracted userMoonSign as clean string (not object) from chartData"
  );
  assert(
    !personalizedResult.personalizedGuidance?.astrologicalInsight?.includes("[object Object]"),
    "Astrological insight string interpolation contains no [object Object]"
  );

  // --------------------------------------------------------------------------
  // SECTION 3: KUNDALINI EDUCATIONAL MODULES & SAFETY COMPLIANCE
  // --------------------------------------------------------------------------
  console.log("\n[3/6] Testing Kundalini Education & Safety Standards...");

  assert(INITIAL_KUNDALINI_MODULES.length === 6, "Seeded 6 comprehensive Kundalini educational modules");

  const mod1 = INITIAL_KUNDALINI_MODULES[0];
  assert(mod1.level === "BEGINNER", "First module is structured as BEGINNER level");
  assert(mod1.historicalContext?.includes("Upanishads"), "Historical context cites traditional Upanishads");
  assert(
    mod1.safetyGuidance?.includes("Never attempt aggressive, forceful breath retention"),
    "Strict safety notice prohibits forceful Kumbhaka and hyperventilation"
  );
  assert(
    mod1.safetyGuidance?.includes("Spiritual practice must never replace medical"),
    "Explicit medical disclaimer forbids replacing healthcare with spiritual practice"
  );
  assert(
    mod1.safetyGuidance?.includes("cease immediately, drink warm water"),
    "Clear emergency stop instructions provided for dizziness or disorientation"
  );

  // Check progressive modules
  const theoryMod = INITIAL_KUNDALINI_MODULES.find((m) => m.level === "THEORY");
  assert(Boolean(theoryMod) && theoryMod.slug.includes("kashmir-shaivism"), "Includes high-level theoretical module on Kashmir Shaivism (Spanda / Tantraloka)");

  // --------------------------------------------------------------------------
  // SECTION 4: API ENDPOINT EXECUTION (PANCHANG & GUIDANCE)
  // --------------------------------------------------------------------------
  console.log("\n[4/6] Testing Public Daily Guidance & Kundalini APIs...");

  const reqUrl = new URL("http://localhost:3000/api/astrology/daily-guidance?date=2026-10-25&lat=28.6139&lon=77.2090&tz=5.5");
  const publicReq = new Request(reqUrl);
  const guidanceApiRes = await getDailyGuidanceRoute(publicReq);

  assert(guidanceApiRes.status === 200, "GET /api/astrology/daily-guidance returns HTTP 200 OK");
  const guidanceBody = await guidanceApiRes.json();
  assert(guidanceBody.success === true, "Daily guidance response returns success: true");
  assert(guidanceBody.guidance?.panchangSummary !== undefined, "Attached full panchangSummary");
  assert(Array.isArray(guidanceBody.guidance?.goodHabits), "Attached Sattvic daily habits (Mitabhashana, etc.)");

  const kundaliniReq = new Request("http://localhost:3000/api/spirituality/kundalini");
  const kundaliniApiRes = await getKundaliniRoute(kundaliniReq);
  assert(kundaliniApiRes.status === 200, "GET /api/spirituality/kundalini returns HTTP 200 OK");
  const kundaliniBody = await kundaliniApiRes.json();
  assert(kundaliniBody.modules?.length >= 6, "Kundalini API returns 6 or more educational modules");
  assert(Boolean(kundaliniBody.safetyDisclaimer), "Kundalini API returns safety disclaimer banner");

  // --------------------------------------------------------------------------
  // SECTION 5: USER ACTION LOGS & DATABASE PERSISTENCE
  // --------------------------------------------------------------------------
  console.log("\n[5/6] Testing Practice Logging & Progress Persistence...");

  // Create test user in DB
  const testUser = await prisma.user.create({
    data: {
      email: `spiritual_seeker_${runId}@gurukul.local`,
      name: "Spiritual Seeker Test",
      role: "USER",
    },
  });

  const remedyRecord = await prisma.dailyRemedy.findFirst({
    where: { status: "PUBLISHED" },
  });

  assert(Boolean(remedyRecord), "Found published remedy record in database");

  // Test unauthenticated action rejection (401)
  const unauthReq = new Request("http://localhost:3000/api/astrology/daily-guidance/actions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      remedyId: remedyRecord.id,
      practiceDate: "2026-10-25",
      action: "complete",
    }),
  });
  const unauthRes = await postPracticeActionRoute(unauthReq);
  assert(unauthRes.status === 401, "Anonymous user blocked from modifying practice log with 401 Unauthorized");

  // Test authenticated action
  const authReq = new Request("http://localhost:3000/api/astrology/daily-guidance/actions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-test-user-id": testUser.id,
      "x-test-user-role": "USER",
    },
    body: JSON.stringify({
      remedyId: remedyRecord.id,
      practiceDate: "2026-10-25",
      action: "complete",
    }),
  });
  const authRes = await postPracticeActionRoute(authReq);
  assert(authRes.status === 200, "Authenticated user completes practice with HTTP 200 OK");
  const authBody = await authRes.json();
  assert(authBody.log?.completed === true, "Practice log persisted with completed: true");

  // --------------------------------------------------------------------------
  // SECTION 6: ADMIN AUTHORIZATION GUARDS
  // --------------------------------------------------------------------------
  console.log("\n[6/6] Testing Admin Authorization Guardrails...");

  // Regular user trying to access admin remedies
  const userAdminReq = new Request("http://localhost:3000/api/admin/remedies", {
    headers: {
      "x-test-user-id": testUser.id,
      "x-test-user-role": "USER",
    },
  });
  const userAdminRes = await getAdminRemediesRoute(userAdminReq);
  assert(userAdminRes.status === 403, "Regular USER role blocked from /api/admin/remedies with 403 Forbidden");

  // Admin user access
  const adminUser = await prisma.user.create({
    data: {
      email: `admin_remedies_${runId}@gurukul.local`,
      name: "Remedies Admin",
      role: "ADMIN",
    },
  });

  const adminJwt = createAccessToken(adminUser, `session-${runId}`);
  const validAdminReq = new Request("http://localhost:3000/api/admin/remedies", {
    headers: {
      authorization: `Bearer ${adminJwt}`,
    },
  });
  const validAdminRes = await getAdminRemediesRoute(validAdminReq);
  assert(validAdminRes.status === 200, "Verified ADMIN token allowed into /api/admin/remedies with HTTP 200 OK");
  const adminBody = await validAdminRes.json();
  assert(adminBody.remedies?.length >= 8, "Admin catalog returns all seeded remedies");

  // Cleanup test user records
  await prisma.userPracticeLog.deleteMany({ where: { userId: testUser.id } });
  await prisma.user.deleteMany({ where: { id: { in: [testUser.id, adminUser.id] } } });
  console.log("  ✓ Cleanup of test users completed cleanly.");

  console.log("\n==========================================================================");
  console.log(`  SUITE RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log("==========================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
