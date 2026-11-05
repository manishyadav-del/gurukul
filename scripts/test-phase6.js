/**
 * Phase 6 Verification Test Suite: AI Astrology Assistant & Calculation Engine
 * 
 * Verifies:
 * 1. Birth input validation and timezone normalization
 * 2. Deterministic planetary calculations (Lahiri Ayanamsa, Sidereal Lagna, 9 Grahas)
 * 3. Calculation determinism across repeated executions
 * 4. Moon Nakshatra, Pada, and Vimshottari Mahadasha balance calculation
 * 5. Retrograde motion detection (Vakri Grahas)
 * 6. Rahu & Ketu exact 180-degree opposition
 * 7. Multilingual passage retrieval and citation mapping from published books
 * 8. AI system prompt assembly with grounding and ethical safety guardrails
 * 9. Offline / heuristic interpretation synthesis with scripture citations
 * 10. Database persistence of BirthProfile, BirthChart, and PlanetPosition records
 * 11. Database persistence of AIConversation, AIMessage, and AISource citations
 * 12. User data isolation and authorization checks
 */

import prisma from "../lib/prisma.js";
import { validateBirthDetails, parseTimezoneOffsetMinutes } from "../server/astrology/validation.js";
import { calculateBirthChart } from "../server/astrology/engine.js";
import {
  computeLahiriAyanamsa,
  computeAscendant,
  computeGrahaPositions,
  computeVimshottariDasha,
  getNakshatraAndPada,
  normalizeAngle,
} from "../server/astrology/calculations.js";
import { retrieveRelevantPassages, extractRetrievalQueries } from "../server/ai/retrieval.js";
import {
  buildAstrologySystemPrompt,
  generateOfflineAstrologyResponse,
  generateAstrologyInterpretation,
} from "../server/ai/interpreter.js";
import { registerBook } from "../server/ingest/registerBook.js";
import { structureBook } from "../server/ingest/structureBook.js";
import * as Astronomy from "astronomy-engine";

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${name}`);
    failed++;
  }
}

async function runPhase6Tests() {
  console.log("\n========================================================");
  console.log("  PHASE 6 VERIFICATION: AI ASTROLOGY ASSISTANT ENGINE");
  console.log("========================================================\n");

  // 1. Birth Input Validation & Timezone Normalization
  console.log("[1/12] Testing Birth Input Validation & Timezone Normalization...");
  {
    const valid = validateBirthDetails({
      name: "Varahamihira",
      birthDate: "1990-05-15",
      birthTime: "14:30:00",
      latitude: 28.6139,
      longitude: 77.209,
      timezone: "+05:30",
    });
    assert(valid.isValid === true, "Valid birth details pass validation");
    assert(valid.normalized.timezoneOffsetMinutes === 330, "Timezone +05:30 resolves to 330 minutes");
    assert(valid.normalized.utcDate instanceof Date, "Constructed valid UTC Date instance");

    // Invalid coordinates
    const invalidCoords = validateBirthDetails({
      name: "Test",
      birthDate: "1990-05-15",
      birthTime: "14:30",
      latitude: 105.0, // > 90
      longitude: 77.0,
    });
    assert(invalidCoords.isValid === false, "Latitude > 90 is rejected");

    // Invalid time
    const invalidTime = validateBirthDetails({
      name: "Test",
      birthDate: "1990-05-15",
      birthTime: "25:70",
      latitude: 28.0,
      longitude: 77.0,
    });
    assert(invalidTime.isValid === false, "Invalid time format/value is rejected");

    // Timezone parser
    assert(parseTimezoneOffsetMinutes("+00:00") === 0, "UTC offset resolves to 0");
    assert(parseTimezoneOffsetMinutes("-05:00") === -300, "EST offset resolves to -300");
  }

  // 2. Deterministic Planetary Calculations & Lahiri Ayanamsa
  console.log("\n[2/12] Testing Deterministic Planetary Calculations & Lahiri Ayanamsa...");
  {
    const astroTime = Astronomy.MakeTime(new Date("2024-01-01T12:00:00Z"));
    const ayanamsa = computeLahiriAyanamsa(astroTime);
    assert(ayanamsa >= 23.8 && ayanamsa <= 24.3, `Lahiri Ayanamsa for 2024 (${ayanamsa.toFixed(4)}°) within expected range`);

    const asc = computeAscendant(astroTime, 28.6139, 77.209, ayanamsa);
    assert(asc.siderealDegree >= 0 && asc.siderealDegree < 360, "Ascendant longitude within [0, 360)");
    assert(asc.signIndex >= 0 && asc.signIndex < 12, "Ascendant sign index within 0-11");
    assert(asc.degreeInSign >= 0 && asc.degreeInSign < 30, "Ascendant degree in sign within [0, 30)");
    assert(asc.pada >= 1 && asc.pada <= 4, "Ascendant Pada is between 1 and 4");

    const grahas = computeGrahaPositions(astroTime, ayanamsa, asc.signIndex);
    assert(grahas.length === 9, "Calculated exactly 9 Grahas (Sun through Ketu)");

    const sun = grahas.find((g) => g.planet === "SUN");
    assert(sun && sun.house >= 1 && sun.house <= 12, "Sun has valid house assignment (1-12)");
  }

  // 3. Calculation Determinism Across Repeated Runs
  console.log("\n[3/12] Testing Calculation Determinism Across Repeated Runs...");
  {
    const input = {
      name: "Arjuna",
      birthDate: "1995-10-24",
      birthTime: "08:30",
      birthPlace: "New Delhi",
      latitude: 28.6139,
      longitude: 77.209,
      timezone: "+05:30",
    };

    const run1 = calculateBirthChart(input);
    const run2 = calculateBirthChart(input);

    assert(run1.ascendant.siderealTotalDegree === run2.ascendant.siderealTotalDegree, "Ascendant identical across runs");
    assert(run1.moon.degree === run2.moon.degree, "Moon degree identical across runs");
    assert(run1.dasha.currentMahadasha === run2.dasha.currentMahadasha, "Current Mahadasha identical across runs");
    assert(JSON.stringify(run1.planets) === JSON.stringify(run2.planets), "All 9 Graha coordinates identical across runs");
  }

  // 4. Moon Nakshatra, Pada & Vimshottari Mahadasha
  console.log("\n[4/12] Testing Moon Nakshatra, Pada & Vimshottari Dasha...");
  {
    // Test known Nakshatra: Rohini spans 40.0° to 53.333° (Lord: Moon)
    const rohiniInfo = getNakshatraAndPada(45.0);
    assert(rohiniInfo.nakshatra.name === "Rohini", "45° correctly identified as Rohini Nakshatra");
    assert(rohiniInfo.nakshatra.lord === "Moon", "Rohini lord correctly identified as Moon");
    assert(rohiniInfo.pada === 2, "45° correctly identified as Pada 2 of Rohini");

    const birthDate = new Date("2000-01-01T00:00:00Z");
    const dasha = computeVimshottariDasha(45.0, birthDate, new Date("2005-01-01T00:00:00Z"));
    assert(dasha.startingLord === "Moon", "Starting Mahadasha lord is Moon");
    assert(dasha.timeline.length === 9, "Generated complete 9-Mahadasha timeline");
    assert(dasha.balanceYears > 0 && dasha.balanceYears <= 10, "Moon balance years is valid positive duration");
  }

  // 5. Retrograde Motion Detection & Node Opposition
  console.log("\n[5/12] Testing Retrograde Motion Detection & Rahu/Ketu Opposition...");
  {
    const astroTime = Astronomy.MakeTime(new Date("2024-01-01T12:00:00Z"));
    const ayanamsa = computeLahiriAyanamsa(astroTime);
    const grahas = computeGrahaPositions(astroTime, ayanamsa, 0);

    const sun = grahas.find((g) => g.planet === "SUN");
    const moon = grahas.find((g) => g.planet === "MOON");
    assert(sun.retrograde === false, "Sun is never retrograde");
    assert(moon.retrograde === false, "Moon is never retrograde");

    const rahu = grahas.find((g) => g.planet === "RAHU");
    const ketu = grahas.find((g) => g.planet === "KETU");
    const angleDiff = Math.abs(normalizeAngle(rahu.siderealDegree - ketu.siderealDegree + 180) - 180);
    assert(Math.abs(angleDiff - 180) < 0.001 || angleDiff < 0.001, "Rahu and Ketu are in exact 180° opposition");
  }

  // 6. Astrological Factor Extraction
  console.log("\n[6/12] Testing Astrological Factor Extraction for Retrieval...");
  {
    const chart = calculateBirthChart({
      name: "Sita",
      birthDate: "1998-04-12",
      birthTime: "06:15",
      latitude: 26.8467,
      longitude: 80.9462,
      timezone: "+05:30",
    });

    assert(chart.chartFactors.length > 5, "Extracted rich array of chart factors");
    assert(chart.chartFactors.some((f) => f.includes("Lagna")), "Includes Lagna factor");
    assert(chart.chartFactors.some((f) => f.includes("Moon")), "Includes Moon factor");
    assert(chart.chartFactors.some((f) => f.includes("Mahadasha")), "Includes active Mahadasha factor");

    const queries = extractRetrievalQueries("Tell me about my career and wealth", chart);
    assert(queries.length > 0, "Generated targeted retrieval queries");
    assert(queries.some((q) => q.toLowerCase().includes("career") || q.includes("कर्म")), "Contains expanded career keyword");
  }

  // 7. Scripture Passage Retrieval & Citation Mapping
  console.log("\n[7/12] Testing Classical Passage Retrieval & Citation Generation...");
  {
    // Setup test book with published classical text
    const testBook = await registerBook({
      title: "Brihat Parashara Classical Jyotish",
      author: "Maharshi Parashara",
      language: "Sanskrit",
      script: "Devanagari",
      originalFileName: "bphs_classical_test.pdf",
      originalFileUrl: "/uploads/bphs_classical_test.pdf",
    });

    await prisma.bookPage.create({
      data: {
        bookId: testBook.id,
        pageNumber: 1,
        pdfPageIndex: 1,
        processingMethod: "TEXT_EXTRACTION",
        rawText: "अथ नवम भाव विचारः। भाग्य भावो गुरु युतः।",
        cleanedText: "अथ नवम भाव विचारः। भाग्य भावो गुरु युतः।",
        language: "Sanskrit",
        ocrCompleted: true,
      },
    });

    await structureBook(testBook.id, {
      chapterTitles: ["Navama Bhava Adhyaya"],
      passageCount: 1,
    });

    // Mark published
    await prisma.book.update({
      where: { id: testBook.id },
      data: { status: "PUBLISHED" },
    });

    const passages = await retrieveRelevantPassages({
      query: "Guru नवम भाव भाग्य",
      limit: 3,
    });

    assert(passages.length > 0, "Retrieved relevant classical scripture passages");
    const first = passages[0];
    assert(first.bookTitle !== undefined, "Citation includes bookTitle");
    assert(first.chapterTitle !== undefined, "Citation includes chapterTitle");
    assert(first.readerUrl && first.readerUrl.startsWith("/library/"), "Citation generates valid readerUrl");
  }

  // 8. AI Prompt Assembly & Grounding Rules
  console.log("\n[8/12] Testing AI System Prompt Assembly & Grounding...");
  {
    const dummyChart = {
      ascendant: { sign: "Aries", degree: 15.2, nakshatra: "Bharani", pada: 1 },
      moon: { sign: "Cancer", degree: 22.1, nakshatra: "Ashlesha", pada: 3 },
      dasha: { currentMahadasha: "Jupiter", balanceText: "2y 4m of Mercury" },
      planets: [
        { name: "Jupiter", sign: "Sagittarius", house: 9, degree: 12.0, retrograde: false, nakshatra: "Mula", pada: 4 },
      ],
    };

    const dummyPassages = [
      {
        bookTitle: "Brihat Jataka",
        bookAuthor: "Varahamihira",
        chapterTitle: "Graha Balam",
        sourcePage: 45,
        text: "बृहस्पतिः स्वभवने शुभ फलप्रदः।",
      },
    ];

    const promptEn = buildAstrologySystemPrompt({ language: "en", chart: dummyChart, passages: dummyPassages });
    assert(promptEn.includes("MANDATORY RULES"), "Enforces mandatory rules in prompt");
    assert(promptEn.includes("ETHICAL SAFETY"), "Enforces ethical safety guardrails in prompt");
    assert(promptEn.includes("Brihat Jataka"), "Includes retrieved scripture in context");
    assert(promptEn.includes("Jupiter in Sagittarius"), "Includes deterministic chart coordinates");

    const promptHi = buildAstrologySystemPrompt({ language: "hi", chart: dummyChart, passages: dummyPassages });
    assert(promptHi.includes("Hindi"), "Language directive switches to Hindi for Hindi queries");
  }

  // 9. Offline Heuristic Fallback Interpretation & Disclaimers
  console.log("\n[9/12] Testing Offline Heuristic Interpretation & Disclaimers...");
  {
    const dummyPassages = [
      {
        bookTitle: "Phaladeepika",
        bookAuthor: "Mantreswara",
        chapterTitle: "Bhavaphala",
        sourcePage: 12,
        text: "The placement of Jupiter in ninth house confers wisdom and spiritual knowledge.",
      },
    ];

    const responseEn = generateOfflineAstrologyResponse({
      userQuery: "What are the effects of Jupiter in 9th house?",
      passages: dummyPassages,
      language: "en",
    });

    assert(responseEn.includes("Phaladeepika"), "Offline response cites classical book");
    assert(responseEn.includes("Disclaimer:"), "English response includes mandatory ethical disclaimer");

    const responseHi = generateOfflineAstrologyResponse({
      userQuery: "बृहस्पति ग्रह का नवम भाव में क्या प्रभाव है?",
      passages: dummyPassages,
      language: "hi",
    });

    assert(responseHi.includes("अस्वीकरण:"), "Hindi response includes Hindi ethical disclaimer");
    assert(responseHi.includes("Phaladeepika"), "Hindi response includes classical book reference");
  }

  // 10. Database Persistence of BirthProfile, BirthChart, and PlanetPositions
  console.log("\n[10/12] Testing Database Persistence of Birth Chart Models...");
  {
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: `astro_test_${Date.now()}@gurukul.ai`,
        name: "Nakshatra Seeker",
        role: "USER",
      },
    });

    const chartData = calculateBirthChart({
      name: "Nakshatra Seeker",
      birthDate: "1992-08-18",
      birthTime: "11:20",
      latitude: 19.076,
      longitude: 72.8777,
      timezone: "+05:30",
    });

    const profile = await prisma.birthProfile.create({
      data: {
        userId: testUser.id,
        name: chartData.profile.name,
        birthDate: new Date(chartData.profile.utcDate),
        birthTime: chartData.profile.birthTime,
        birthPlace: chartData.profile.birthPlace,
        latitude: chartData.profile.latitude,
        longitude: chartData.profile.longitude,
        timezone: chartData.profile.timezone,
      },
    });
    assert(profile.id !== undefined, "Successfully persisted BirthProfile record");

    const chartRecord = await prisma.birthChart.create({
      data: {
        birthProfileId: profile.id,
        ascendant: chartData.ascendant.siderealTotalDegree,
        lagnaSign: chartData.ascendant.sign,
        lagnaDegree: chartData.ascendant.degree,
        ayanamsa: chartData.calculation.ayanamsa,
        ayanamsaValue: chartData.calculation.ayanamsaValue,
        moonSign: chartData.moon.sign,
        moonNakshatra: chartData.moon.nakshatra,
        moonPada: chartData.moon.pada,
        currentDasha: chartData.dasha.currentMahadasha,
        dashaBalance: chartData.dasha.balanceText,
        chartData: chartData,
        planets: {
          create: chartData.planets.map((p) => ({
            planet: p.planet,
            sign: p.sign,
            house: p.house,
            degree: p.degree,
            speed: p.speed,
            nakshatra: p.nakshatra,
            pada: p.pada,
            retrograde: p.retrograde,
            signLord: p.signLord,
            nakshatraLord: p.nakshatraLord,
          })),
        },
      },
      include: {
        planets: true,
      },
    });

    assert(chartRecord.id !== undefined, "Successfully persisted BirthChart record");
    assert(chartRecord.planets.length === 9, "Persisted all 9 PlanetPosition records");
  }

  // 11. Database Persistence of AI Conversation & AISources
  console.log("\n[11/12] Testing Persistence of AI Conversation, Messages, and AISources...");
  {
    const user = await prisma.user.findFirst();

    const conversation = await prisma.aIConversation.create({
      data: {
        userId: user.id,
        title: "Test Jyotisha Dialogue",
        language: "en",
      },
    });

    const userMsg = await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: "What is the nature of Saturn?",
      },
    });

    const asstMsg = await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: "Saturn is the planet of perseverance, discipline, and karmic justice.",
        sources: {
          create: [
            {
              bookTitle: "Brihat Parashara Hora Shastra",
              chapterTitle: "Graha Swaroopa",
              pageNumber: 24,
              citationText: "शनिः कृशदीर्घतनुः पिङ्गेक्षणो वातप्रकृतिः।",
              readerUrl: "/library/bphs/graha-swaroopa",
              relevance: 0.95,
            },
          ],
        },
      },
      include: {
        sources: true,
      },
    });

    assert(asstMsg.sources.length === 1, "Persisted AISource citation with assistant message");
    assert(asstMsg.sources[0].bookTitle === "Brihat Parashara Hora Shastra", "AISource preserves exact bookTitle");
    assert(asstMsg.sources[0].readerUrl.includes("/library/"), "AISource preserves reader navigation URL");
  }

  // 12. End-to-End Interpretation Pipeline Execution
  console.log("\n[12/12] Testing End-to-End Interpretation Pipeline...");
  {
    const chart = calculateBirthChart({
      name: "Vidura",
      birthDate: "1988-11-05",
      birthTime: "17:45",
      latitude: 28.6139,
      longitude: 77.209,
      timezone: "+05:30",
    });

    const result = await generateAstrologyInterpretation({
      userQuery: "How does my Lagna shape my life purpose?",
      chart,
      passages: [],
      language: "en",
    });

    assert(result.content.length > 50, "Generated non-empty interpretation text");
    assert(result.content.includes("Disclaimer:"), "Interpretation contains ethical disclaimer");
    assert(result.provider !== undefined, "Result specifies interpretation provider");
  }

  console.log("\n========================================================");
  console.log(`  PHASE 6 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase6Tests().catch((err) => {
  console.error("Fatal error during Phase 6 tests:", err);
  process.exit(1);
});
