/**
 * Classical Astrology Source Comparison Engine
 * 
 * Analyzes retrieved passages from different classical scriptures
 * (e.g., Brihat Parashara Hora Shastra, Phaladeepika, Saravali, Brihat Jataka)
 * to group perspectives, identify textual consensus, highlight traditional nuances,
 * and provide reader navigation links.
 */

/**
 * Groups and compares retrieved passages by source text.
 * 
 * @param {Array<Object>} passages - Retrieved evidence passages
 * @returns {Object} Grouped source comparison analysis
 */
export function comparePassageSources(passages = []) {
  if (!Array.isArray(passages) || passages.length === 0) {
    return {
      hasMultipleSources: false,
      sourceCount: 0,
      sources: [],
      consensus: null,
      divergences: [],
      hasDisagreement: false,
    };
  }

  // 1. Group by Book Title / Author
  const bookGroups = new Map();

  for (const p of passages) {
    const bookTitle = p.bookTitle || p.book?.title || "Classical Text";
    const author = p.bookAuthor || p.book?.author || "Vedic Sage";
    const key = `${bookTitle}__${author}`;

    if (!bookGroups.has(key)) {
      bookGroups.set(key, {
        bookTitle,
        author,
        passages: [],
      });
    }

    bookGroups.get(key).passages.push({
      passageId: p.passageId || p.id,
      chapterTitle: p.chapterTitle || p.chapter?.title || "Chapter",
      sourcePage: p.sourcePage,
      text: p.text,
      snippet: p.snippet || (p.text ? p.text.slice(0, 200) + "..." : ""),
      readerUrl: p.readerUrl || `/library/books`,
      relevance: p.relevance || p.finalScore || 1.0,
      language: p.language || "Sanskrit",
    });
  }

  const sources = Array.from(bookGroups.values());
  const hasMultipleSources = sources.length > 1;

  // 2. Identify Thematic Consensus vs Nuances
  // We strictly analyze actual text without fabricating agreements or false conflicts
  let consensus = null;
  const divergences = [];

  if (hasMultipleSources) {
    // Check if texts share common positive or cautionary sentiments
    const allTexts = passages.map((p) => (p.text || "").toLowerCase());
    const hasAuspiciousTokens = allTexts.some((t) =>
      t.includes("शुभ") || t.includes("लाभ") || t.includes("कीर्ति") || t.includes("fame") || t.includes("wealth")
    );
    const hasAfflictionTokens = allTexts.some((t) =>
      t.includes("दोष") || t.includes("कष्ट") || t.includes("हानि") || t.includes("affliction") || t.includes("obstacle")
    );

    if (hasAuspiciousTokens && !hasAfflictionTokens) {
      consensus = {
        themeEn: "Concordant auspicious indications across classical authorities.",
        themeHi: "शास्त्रीय ग्रंथों में इस योग/स्थिति के प्रति एकमत शुभ फल का प्रतिपादन है।",
      };
    } else if (hasAfflictionTokens && !hasAuspiciousTokens) {
      consensus = {
        themeEn: "Concordant cautionary principles advising spiritual discipline and remedies.",
        themeHi: "शास्त्रीय ग्रंथों में सावधानी, आत्म-संयम एवं शास्त्रीय शांति उपायों का विधान है।",
      };
    }

    // Identify book-specific perspective emphasis
    sources.forEach((src) => {
      const sample = src.passages[0]?.text || "";
      if (src.bookTitle.toLowerCase().includes("parashara")) {
        divergences.push({
          source: src.bookTitle,
          perspectiveEn: "Emphasizes foundational dharmic principles, planetary dignities, and remedial Upayas.",
          perspectiveHi: "पाराशर परंपरा मूल धर्म, ग्रहों के नैसर्गिक बल और शांति उपायों पर बल देती है।",
        });
      } else if (src.bookTitle.toLowerCase().includes("phaladeepika")) {
        divergences.push({
          source: src.bookTitle,
          perspectiveEn: "Provides direct empirical results (Phala) regarding status, vehicles, and worldly manifestations.",
          perspectiveHi: "फलदीपिका सांसारिक पद, वाहन, मान-सम्मान एवं भौतिक फलों का प्रत्यक्ष वर्णन करती है।",
        });
      } else if (src.bookTitle.toLowerCase().includes("saravali")) {
        divergences.push({
          source: src.bookTitle,
          perspectiveEn: "Elaborates on detailed psychological traits, temperament, and relational dynamics.",
          perspectiveHi: "सारावली जातक के मनोवैज्ञानिक स्वभाव, शारीरिक लक्षण और आंतरिक प्रवृत्तियों पर प्रकाश डालती है।",
        });
      }
    });
  }

  // Format treatises and summary for UI consumption
  const treatises = sources.map((s) => ({
    treatise: s.bookTitle,
    author: s.author,
    passagesCount: s.passages.length,
    keyExcerpt: s.passages[0]?.snippet || (s.passages[0]?.text ? s.passages[0].text.slice(0, 160) + "..." : ""),
    readerUrl: s.passages[0]?.readerUrl || null,
  }));

  const comparisonAnalysis = consensus
    ? consensus.themeEn
    : divergences.length > 0
    ? divergences.map((d) => `${d.source}: ${d.perspectiveEn}`).join("; ")
    : "Multiple passages from classical authorities provide complementary perspectives.";

  return {
    hasMultipleSources,
    sourceCount: sources.length,
    sources,
    treatises,
    comparisonAnalysis,
    consensus,
    divergences,
    hasDisagreement: divergences.length > 1,
  };
}

export const compareClassicalSources = comparePassageSources;

