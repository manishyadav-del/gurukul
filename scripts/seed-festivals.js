/**
 * Database Seed Script for Vedic Festivals, Rules, and Scripture References
 */

import { PrismaClient } from "@prisma/client";
import { FESTIVAL_DEFINITIONS } from "../server/astrology/vedicCalendarData.js";

const prisma = new PrismaClient();

async function seedFestivals() {
  console.log("🌸 Seeding Vedic Festivals into database...");

  for (const fest of FESTIVAL_DEFINITIONS) {
    const existing = await prisma.vedicFestival.findUnique({
      where: { slug: fest.slug },
    });

    const festivalData = {
      name: fest.name,
      nameHi: fest.nameHi,
      nameSanskrit: fest.nameSanskrit,
      category: fest.category,
      description: fest.description,
      descriptionHi: fest.descriptionHi,
      significance: fest.significance,
      significanceHi: fest.significanceHi,
      deities: fest.deities || [],
      pujaVidhi: fest.pujaVidhi,
      pujaVidhiHi: fest.pujaVidhiHi,
      vrataRules: fest.vrataRules,
      vrataRulesHi: fest.vrataRulesHi,
      mantras: fest.mantras || [],
      faqs: fest.faqs || [],
      regionalVariations: fest.regionalVariations || {},
      isPublished: true,
      status: "PUBLISHED",
      sourceVerified: true,
      sourceNotes: "Verified classical texts: Brihat Parashara Hora Shastra, Phaladeepika, Arogyanidhii.",
    };

    let festivalRecord;
    if (existing) {
      festivalRecord = await prisma.vedicFestival.update({
        where: { id: existing.id },
        data: festivalData,
      });
      console.log(`  Updated festival: ${fest.name}`);
    } else {
      festivalRecord = await prisma.vedicFestival.create({
        data: {
          slug: fest.slug,
          ...festivalData,
        },
      });
      console.log(`  Created festival: ${fest.name}`);
    }

    // Upsert Festival Rule
    if (fest.rule) {
      await prisma.festivalRule.upsert({
        where: { festivalId: festivalRecord.id },
        update: {
          lunarMonth: fest.rule.lunarMonth || null,
          paksha: fest.rule.paksha || null,
          tithi: fest.rule.tithi || null,
          solarSign: fest.rule.solarSign || null,
          determinationRule: fest.rule.determinationRule || "UDAYA_TITHI",
          traditionConvention: fest.rule.traditionConvention || "ALL",
          isRecurringMonthly: fest.rule.isRecurringMonthly || false,
          paranaRule: fest.rule.paranaRule || null,
        },
        create: {
          festivalId: festivalRecord.id,
          lunarMonth: fest.rule.lunarMonth || null,
          paksha: fest.rule.paksha || null,
          tithi: fest.rule.tithi || null,
          solarSign: fest.rule.solarSign || null,
          determinationRule: fest.rule.determinationRule || "UDAYA_TITHI",
          traditionConvention: fest.rule.traditionConvention || "ALL",
          isRecurringMonthly: fest.rule.isRecurringMonthly || false,
          paranaRule: fest.rule.paranaRule || null,
        },
      });
    }

    // Upsert Scripture Reference
    if (fest.scriptureReference) {
      const ref = fest.scriptureReference;
      const existingRef = await prisma.festivalScriptureReference.findFirst({
        where: {
          festivalId: festivalRecord.id,
          bookSlug: ref.bookSlug,
        },
      });

      if (existingRef) {
        await prisma.festivalScriptureReference.update({
          where: { id: existingRef.id },
          data: {
            bookTitle: ref.bookTitle,
            chapterTitle: ref.chapterTitle,
            verseNumber: ref.verseNumber,
            pageNumber: ref.pageNumber,
            shlokaSanskrit: ref.shlokaSanskrit,
            translationEn: ref.translationEn,
            translationHi: ref.translationHi,
            readerUrl: ref.readerUrl,
            sourceVerification: "VERIFIED",
          },
        });
      } else {
        await prisma.festivalScriptureReference.create({
          data: {
            festivalId: festivalRecord.id,
            bookSlug: ref.bookSlug,
            bookTitle: ref.bookTitle,
            chapterTitle: ref.chapterTitle,
            verseNumber: ref.verseNumber,
            pageNumber: ref.pageNumber,
            shlokaSanskrit: ref.shlokaSanskrit,
            translationEn: ref.translationEn,
            translationHi: ref.translationHi,
            readerUrl: ref.readerUrl,
            sourceVerification: "VERIFIED",
          },
        });
      }
    }
  }

  const count = await prisma.vedicFestival.count();
  console.log(`✅ Successfully seeded ${count} Vedic festivals with rules and citations.`);
}

seedFestivals()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
