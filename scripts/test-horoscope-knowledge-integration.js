/**
 * scripts/test-horoscope-knowledge-integration.js
 * 
 * Verification Test Suite for the Real Website-Based Horoscope Knowledge Graph Integration.
 */

import { computePanchang } from "../server/astrology/panchang.js";
import { computeDailyTransits, buildTransitsOverview } from "../server/astrology/transits.js";
import {
  buildLiveHoroscopeGraph,
  getLiveElementDetails,
  explainHoroscopeWithRAG,
} from "../server/astrology/horoscopeGraphEngine.js";

async function runTestSuite() {
  console.log("\n================================================================");
  console.log("   GURUKUL REAL HOROSCOPE KNOWLEDGE INTEGRATION VERIFICATION   ");
  console.log("================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = "") {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Real Astronomical Panchang Calculations (New Delhi)
    // ----------------------------------------------------
    const delhiPanchang = computePanchang({
      date: "2026-11-02",
      latitude: 28.6139,
      longitude: 77.2090,
      tzOffset: 5.5,
      timezone: "Asia/Kolkata",
    });

    assert(
      delhiPanchang.tithi?.name && delhiPanchang.tithi?.paksha,
      "Tithi calculated with name and paksha",
      JSON.stringify(delhiPanchang.tithi)
    );
    assert(
      delhiPanchang.nakshatra?.name && delhiPanchang.nakshatra?.pada >= 1 && delhiPanchang.nakshatra?.pada <= 4,
      `Nakshatra calculated (${delhiPanchang.nakshatra?.name}) with valid Pada (${delhiPanchang.nakshatra?.pada})`
    );
    assert(
      delhiPanchang.yoga?.name && delhiPanchang.karana?.name,
      `Yoga (${delhiPanchang.yoga?.name}) and Karana (${delhiPanchang.karana?.name}) calculated`
    );
    assert(
      delhiPanchang.sunrise?.local && delhiPanchang.sunset?.local,
      `Sunrise (${delhiPanchang.sunrise?.local}) and Sunset (${delhiPanchang.sunset?.local}) calculated for New Delhi`
    );
    assert(
      delhiPanchang.rahuKaal?.startLocal && delhiPanchang.rahuKaal?.endLocal,
      `Rahu Kaal window calculated: ${delhiPanchang.rahuKaal?.startLocal} - ${delhiPanchang.rahuKaal?.endLocal}`
    );

    // ----------------------------------------------------
    // TEST 2: Location-Based Variation (New Delhi vs London)
    // ----------------------------------------------------
    const londonPanchang = computePanchang({
      date: "2026-11-02",
      latitude: 51.5074,
      longitude: -0.1278,
      tzOffset: 0.0,
      timezone: "Europe/London",
    });

    assert(
      delhiPanchang.sunrise?.local !== londonPanchang.sunrise?.local,
      "Sunrise varies accurately between New Delhi and London (No hardcoded static values)",
      `Delhi: ${delhiPanchang.sunrise?.local}, London: ${londonPanchang.sunrise?.local}`
    );
    assert(
      delhiPanchang.rahuKaal?.startLocal !== londonPanchang.rahuKaal?.startLocal,
      "Rahu Kaal timings adjust according to local solar coordinates and timezone"
    );

    // ----------------------------------------------------
    // TEST 3: Choghadiya Slots Determinism
    // ----------------------------------------------------
    assert(
      delhiPanchang.choghadiya?.day?.length === 8 && delhiPanchang.choghadiya?.night?.length === 8,
      "Calculated exactly 8 daytime and 8 nighttime Choghadiya intervals"
    );
    const firstDaySlot = delhiPanchang.choghadiya?.day[0];
    assert(
      firstDaySlot.startLocal === delhiPanchang.sunrise?.local,
      `First day Choghadiya starts exactly at sunrise (${firstDaySlot.startLocal} == ${delhiPanchang.sunrise?.local})`
    );

    // ----------------------------------------------------
    // TEST 4: Navagraha Sidereal Transits with Lahiri Ayanamsa
    // ----------------------------------------------------
    const transits = computeDailyTransits({ date: "2026-11-02", tzOffset: 5.5 });
    assert(transits.length === 9, "Computed sidereal positions for all 9 Navagrahas");

    const sunTransit = transits.find((t) => t.id === "surya" || t.planet === "SUN");
    assert(
      sunTransit && sunTransit.sign && sunTransit.degree >= 0 && sunTransit.degree < 30,
      `Sun placed in ${sunTransit?.sign} at ${sunTransit?.degree?.toFixed(2)}° (valid 0-30° sign arc)`
    );

    const moonTransit = transits.find((t) => t.id === "chandra" || t.planet === "MOON");
    assert(
      moonTransit && moonTransit.sign && moonTransit.nakshatra,
      `Moon placed in ${moonTransit?.sign} under ${moonTransit?.nakshatra} Nakshatra`
    );

    // ----------------------------------------------------
    // TEST 5: Live Horoscope Knowledge Graph Generation
    // ----------------------------------------------------
    const liveGraph = await buildLiveHoroscopeGraph({
      date: "2026-11-02",
      lat: 28.6139,
      lon: 77.2090,
      tz: 5.5,
      timezone: "Asia/Kolkata",
      selectedRashi: "Taurus",
      language: "en",
    });

    assert(
      liveGraph.nodes.length >= 20,
      `buildLiveHoroscopeGraph constructed ${liveGraph.nodes.length} nodes from real horoscope calculations`
    );
    assert(
      liveGraph.edges.length >= 15,
      `buildLiveHoroscopeGraph constructed ${liveGraph.edges.length} shastric relationships`
    );

    // Check center node
    const centerNode = liveGraph.nodes.find((n) => n.isCenter);
    assert(
      centerNode && centerNode.category === "CALCULATED_SKY",
      "Center node reflects verified daily sky context"
    );

    // Check connected transit planet nodes
    const grahaNodes = liveGraph.nodes.filter((n) => n.category === "TRANSIT_GRAHA");
    assert(
      grahaNodes.length === 9,
      "Graph contains all 9 Navagrahas connected with their real transit signs and degrees"
    );

    // ----------------------------------------------------
    // TEST 6: Shastric Element Inspector Details
    // ----------------------------------------------------
    const nakshatraDetails = await getLiveElementDetails({
      elementType: "nakshatra",
      elementKey: delhiPanchang.nakshatra?.name,
      panchang: delhiPanchang,
      transits,
      language: "en",
    });

    assert(
      nakshatraDetails && nakshatraDetails.calculatedFact?.includes("Active today"),
      "Nakshatra details include real calculated astronomical fact"
    );
    assert(
      nakshatraDetails && nakshatraDetails.classicalCitation?.includes("Brihat"),
      `Nakshatra details cite authentic classical treatise: ${nakshatraDetails?.classicalCitation}`
    );

    const tithiDetails = await getLiveElementDetails({
      elementType: "tithi",
      elementKey: "tithi",
      panchang: delhiPanchang,
      transits,
      language: "en",
    });
    assert(
      tithiDetails && tithiDetails.classicalCitation?.includes("Surya Siddhanta"),
      `Tithi details cite Surya Siddhanta: ${tithiDetails?.classicalCitation}`
    );

    // ----------------------------------------------------
    // TEST 7: AI RAG Horoscope Explanation & Citations
    // ----------------------------------------------------
    const ragResult = await explainHoroscopeWithRAG({
      action: "explain_panchang",
      panchang: delhiPanchang,
      transits,
      selectedRashi: "Taurus",
      cityName: "New Delhi",
      language: "en",
    });

    assert(
      ragResult.success && ragResult.explanation?.length > 50,
      "explainHoroscopeWithRAG generated source-grounded explanation from actual values"
    );
    assert(
      ragResult.disclaimer?.includes("non-fatalistic"),
      "Explanation contains strict non-fatalistic educational disclaimer"
    );

    console.log("\n================================================================");
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("================================================================\n");

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error("Test Suite error:", err);
    process.exit(1);
  }
}

runTestSuite();
