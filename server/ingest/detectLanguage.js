/**
 * Language detector for digital books.
 * Distinguishes English (en), Hindi (hi), Sanskrit (sa), Mixed, or Unknown.
 * 
 * Never translates source text.
 * 
 * @param {string} text - Input text
 * @returns {'hi' | 'en' | 'sa' | 'mixed' | 'unknown'}
 */
export function detectLanguage(text) {
  if (!text || typeof text !== "string") {
    return "unknown";
  }

  const devanagariMatches = text.match(/[\u0900-\u097F]/g) || [];
  const latinMatches = text.match(/[a-zA-Z]/g) || [];

  const devanagariCount = devanagariMatches.length;
  const latinCount = latinMatches.length;
  const totalLetters = devanagariCount + latinCount;

  if (totalLetters < 10) {
    return "unknown";
  }

  const devanagariRatio = devanagariCount / totalLetters;
  const latinRatio = latinCount / totalLetters;

  // Mixed language threshold
  if (devanagariRatio >= 0.20 && latinRatio >= 0.20) {
    return "mixed";
  }

  // English dominant
  if (latinRatio >= 0.75) {
    return "en";
  }

  // Devanagari dominant - Distinguish between Hindi (hi) and Sanskrit (sa)
  if (devanagariRatio >= 0.70) {
    const lower = text.toLowerCase();

    // Specific Hindi grammatical stop words / postpositions
    const hindiPattern = /\b(है|हैं|था|थे|थी|का|के|की|में|से|पर|को|और|नहीं|यह|वह|होता|होती|करते|दिया|लिया)\b/g;
    const hindiMatches = lower.match(hindiPattern) || [];

    // Specific Sanskrit markers, particles, and verse endings
    const sanskritPattern = /(॥|[\u093D]|[\u0903]|\b(अथ|इति|उवाच|च|यथा|तथा|एव|अपि|तस्य|भगवन्|शास्त्रम्|श्लोक|नमः|स्वाहा|भवति|स्यात्)\b)/g;
    const sanskritMatches = lower.match(sanskritPattern) || [];

    // Visarga count
    const visargaMatches = text.match(/\u0903/g) || [];

    const sanskritScore = sanskritMatches.length + visargaMatches.length;
    const hindiScore = hindiMatches.length;

    if (sanskritScore > 0 && sanskritScore >= hindiScore) {
      return "sa";
    }

    if (hindiScore > 0) {
      return "hi";
    }

    // Default to Hindi for modern publications if no specific Sanskrit markers
    return "hi";
  }

  return "mixed";
}
