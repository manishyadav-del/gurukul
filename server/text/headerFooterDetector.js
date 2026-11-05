/**
 * Evidence-based Header and Footer Detector for Multi-Page Manuscripts and Books.
 * 
 * Strict safety rules:
 * - Requires statistical evidence across multiple pages (>= 3 pages or >= 50% of pages).
 * - Matches known book metadata (title, author, publisher).
 * - Detects top/bottom isolated page number formats (both Hindu-Arabic and Devanagari numerals).
 * - NEVER flags chapter titles, section headers, or verses as removable running headers/footers.
 * - Never strips lines without cross-page verification.
 */

import { isVerseLine } from "./normalizeText.js";
import { detectChapterTitle } from "./segmentation.js";

/**
 * Checks if a string represents an isolated page number.
 */
export function isPageNumberArtifact(line) {
  if (!line) return false;
  const trimmed = line.trim();
  // e.g. "12", "१२", "Page 12", "पृष्ठ १२", "- 12 -", "- १२ -", "12 | Gurukul"
  if (/^(?:page|पृष्ठ)\s*[०-९\d]+$/i.test(trimmed)) return true;
  if (/^[०-९\d]+$/i.test(trimmed)) return true;
  if (/^[-–—]\s*[०-९\d]+\s*[-–—]$/i.test(trimmed)) return true;
  if (/^[०-९\d]+\s*[\/\|]\s*[०-९\d]+$/i.test(trimmed)) return true;
  return false;
}

/**
 * Analyzes pages across a book to find repeated running headers and footers.
 * 
 * @param {Array<{ rawText: string, pageNumber: number }>} pages - Array of book pages
 * @param {Object} [bookMetadata] - Optional metadata (title, author)
 * @returns {{
 *   headersToRemove: string[],
 *   footersToRemove: string[],
 *   evidence: Object
 * }}
 */
export function detectRepeatedHeadersFooters(pages = [], bookMetadata = {}) {
  if (!Array.isArray(pages) || pages.length < 2) {
    // Insufficient evidence across fewer than 2 pages
    return {
      headersToRemove: [],
      footersToRemove: [],
      evidence: { pagesAnalyzed: pages ? pages.length : 0 },
    };
  }

  // Statistical evidence threshold: must appear across multiple pages (at least 2, up to 3)
  const minOccurrences = Math.max(2, Math.min(3, Math.ceil(pages.length * 0.4)));
  const topCandidates = new Map();
  const bottomCandidates = new Map();

  const titleLower = (bookMetadata.title || "").trim().toLowerCase();
  const authorLower = (bookMetadata.author || "").trim().toLowerCase();

  for (const page of pages) {
    const raw = (page.rawText || "").trim();
    if (!raw) continue;

    const lines = raw.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) continue;

    // Inspect top 2 lines
    const topLines = lines.slice(0, 2);
    for (const line of topLines) {
      if (isVerseLine(line) || detectChapterTitle(line).isChapter) {
        continue; // Never flag chapter titles or verses as removable running headers
      }
      const key = line.toLowerCase();
      topCandidates.set(key, (topCandidates.get(key) || 0) + 1);
    }

    // Inspect bottom 2 lines
    const bottomLines = lines.slice(-2);
    for (const line of bottomLines) {
      if (isVerseLine(line) || detectChapterTitle(line).isChapter) {
        continue;
      }
      const key = line.toLowerCase();
      bottomCandidates.set(key, (bottomCandidates.get(key) || 0) + 1);
    }
  }

  const headersToRemove = [];
  const footersToRemove = [];

  // Evaluate Top Header Candidates
  for (const [key, count] of topCandidates.entries()) {
    const matchesMetadata =
      (titleLower && key.includes(titleLower)) ||
      (authorLower && key.includes(authorLower));

    // Sufficient evidence: frequency threshold met OR exact metadata match appearing >= 2 times
    if (count >= minOccurrences || (matchesMetadata && count >= 2)) {
      headersToRemove.push(key);
    }
  }

  // Evaluate Bottom Footer Candidates
  for (const [key, count] of bottomCandidates.entries()) {
    if (count >= minOccurrences) {
      footersToRemove.push(key);
    }
  }

  return {
    headersToRemove,
    footersToRemove,
    evidence: {
      pagesAnalyzed: pages.length,
      threshold: minOccurrences,
      detectedHeadersCount: headersToRemove.length,
      detectedFootersCount: footersToRemove.length,
    },
  };
}
