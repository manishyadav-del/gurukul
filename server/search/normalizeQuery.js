/**
 * Phase 5: Query Normalization for Multilingual Astrology Search
 * 
 * Supports:
 * - Devanagari (Hindi, Sanskrit) and Latin (English) scripts.
 * - Unicode NFC normalization to reconcile combining marks, virama, and matras.
 * - Conservative cleaning without destructive stemming or transliteration alteration.
 * - Handles punctuation, quotes, and whitespace.
 */

/**
 * Normalizes a user search query.
 * 
 * @param {string} rawQuery - User search query
 * @returns {{
 *   raw: string,
 *   normalized: string,
 *   tokens: string[],
 *   isDevanagari: boolean,
 *   isLatin: boolean,
 *   isEmpty: boolean
 * }}
 */
export function normalizeSearchQuery(rawQuery) {
  if (!rawQuery || typeof rawQuery !== "string") {
    return {
      raw: "",
      normalized: "",
      tokens: [],
      isDevanagari: false,
      isLatin: false,
      isEmpty: true,
    };
  }

  // 1. Unicode NFC Canonical Composition
  let text = rawQuery.normalize("NFC");

  // 2. Remove non-printable control characters
  text = text.replace(/[\x00-\x1F\x7F]/g, "");

  // 3. Trim and collapse multiple whitespace
  text = text.trim().replace(/\s+/g, " ");

  if (text.length === 0) {
    return {
      raw: rawQuery,
      normalized: "",
      tokens: [],
      isDevanagari: false,
      isLatin: false,
      isEmpty: true,
    };
  }

  // 4. Strip surrounding quotation marks or external edge punctuation
  let cleaned = text.replace(/^["'“”‘’«»]+|["'“”‘’«»]+$/g, "").trim();
  // Strip trailing whitespace + isolated sentence punctuation (e.g. "term ।" -> "term")
  cleaned = cleaned.replace(/\s+[।॥?!.:;,]+$/g, "").trim();

  // 5. Script detection
  const isDevanagari = /[\u0900-\u097F]/.test(cleaned);
  const isLatin = /[a-zA-Z]/.test(cleaned);

  // 6. Tokenize for individual term searching
  // Remove danda punctuation and common delimiters for tokens
  const tokenCleaned = cleaned.replace(/[।,;:!?()\[\]{}]/g, " ");
  const tokens = tokenCleaned
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  return {
    raw: rawQuery,
    normalized: cleaned,
    tokens,
    isDevanagari,
    isLatin,
    isEmpty: cleaned.length === 0,
  };
}

/**
 * Generates an excerpt snippet centered on the search query.
 * 
 * @param {string} fullText - Passage or text block
 * @param {string} query - Target search term
 * @param {number} [contextLength=70] - Characters before and after match
 * @returns {string} Clean excerpt snippet
 */
export function generateContextSnippet(fullText, query, contextLength = 70) {
  if (!fullText) return "";
  if (!query || !query.trim()) {
    return fullText.slice(0, contextLength * 2) + (fullText.length > contextLength * 2 ? "..." : "");
  }

  const normalizedText = fullText.normalize("NFC");
  const normalizedQuery = query.trim().normalize("NFC");

  const lowerText = normalizedText.toLowerCase();
  const lowerQuery = normalizedQuery.toLowerCase();

  let idx = lowerText.indexOf(lowerQuery);

  // If exact query not found, search for first token
  if (idx === -1) {
    const tokens = normalizedQuery.split(/\s+/).filter((t) => t.length > 2);
    for (const token of tokens) {
      idx = lowerText.indexOf(token.toLowerCase());
      if (idx !== -1) break;
    }
  }

  if (idx === -1) {
    return normalizedText.slice(0, 160) + (normalizedText.length > 160 ? "..." : "");
  }

  // Calculate snippet boundaries avoiding slicing words awkwardly
  let start = Math.max(0, idx - contextLength);
  let end = Math.min(normalizedText.length, idx + normalizedQuery.length + contextLength);

  // Adjust start to beginning of a word if possible
  if (start > 0) {
    const spaceBefore = normalizedText.indexOf(" ", start);
    if (spaceBefore !== -1 && spaceBefore < idx) {
      start = spaceBefore + 1;
    }
  }

  // Adjust end to end of a word if possible
  if (end < normalizedText.length) {
    const spaceAfter = normalizedText.lastIndexOf(" ", end);
    if (spaceAfter > idx) {
      end = spaceAfter;
    }
  }

  const prefix = start > 0 ? "… " : "";
  const suffix = end < normalizedText.length ? " …" : "";

  return prefix + normalizedText.slice(start, end).trim() + suffix;
}
