/**
 * Phase 3: Master Digital Book Structuring Service
 * 
 * Orchestrates:
 * 1. Evidence-based running header and footer detection across multi-page books.
 * 2. Conservative text normalization preserving rawText and Sanskrit/Devanagari script.
 * 3. Chapter and Passage segmentation with confidence and review status tracking.
 * 4. Idempotent persistence in Prisma preserving manual proofreading and audit history.
 */

import prisma from "../../lib/prisma.js";
import { normalizeText } from "../text/normalizeText.js";
import { detectRepeatedHeadersFooters } from "../text/headerFooterDetector.js";
import { segmentBookContent } from "../text/segmentation.js";
import { slugify } from "./registerBook.js";

/**
 * Normalizes and structures an entire book into Chapters and Passages.
 * 
 * @param {string} bookId - Book UUID
 * @param {Object} [options] - Options (forceReprocess, etc.)
 * @returns {Promise<{
 *   success: boolean,
 *   bookId: string,
 *   chaptersCount: number,
 *   passagesCount: number,
 *   pagesCount: number,
 *   needsReviewCount: number
 * }>}
 */
export async function structureBook(bookId, options = {}) {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      pages: {
        orderBy: { pageNumber: "asc" },
      },
      chapters: true,
    },
  });

  if (!book) {
    throw new Error(`Book ${bookId} not found`);
  }

  const pages = book.pages;
  if (pages.length === 0) {
    throw new Error(`Book ${bookId} has no pages to structure`);
  }

  // 1. Evidence-based Header & Footer Detection across the book
  const { headersToRemove, footersToRemove, evidence } = detectRepeatedHeadersFooters(
    pages,
    { title: book.title, author: book.author }
  );

  const linesToStrip = [...headersToRemove, ...footersToRemove];

  // 2. Normalize text page by page (strictly preserving rawText)
  const normalizedPages = [];
  for (const page of pages) {
    const raw = page.rawText || "";
    // Only strip headers/footers if there was cross-page evidence
    const cleaned = normalizeText(raw, { removeLines: linesToStrip });

    // Update page cleanedText in database if changed
    if (cleaned !== page.cleanedText) {
      await prisma.bookPage.update({
        where: { id: page.id },
        data: { cleanedText: cleaned },
      });
    }

    normalizedPages.push({
      id: page.id,
      pageNumber: page.pageNumber,
      rawText: raw,
      cleanedText: cleaned,
    });
  }

  // 3. Segment into Chapters and Passages
  const { chapters: detectedChapters, passages: detectedPassages } = segmentBookContent(
    normalizedPages,
    { title: book.title, author: book.author }
  );

  // 4. Idempotently Persist Chapters
  // Upsert chapters while preserving admin overrides (isPublished, custom descriptions)
  const persistedChapters = [];
  for (let i = 0; i < detectedChapters.length; i++) {
    const dCh = detectedChapters[i];
    const slug = slugify(`chapter-${dCh.chapterNumber}-${dCh.title.slice(0, 40)}`);

    // Check if an existing chapter matches this number or slug
    const existing = book.chapters.find(
      (c) => c.chapterNumber === dCh.chapterNumber || c.slug === slug
    );

    let chapterRecord;
    if (existing) {
      chapterRecord = await prisma.chapter.update({
        where: { id: existing.id },
        data: {
          title: existing.status === "APPROVED" ? existing.title : dCh.title,
          startPage: dCh.startPage,
          endPage: dCh.endPage,
          sortOrder: dCh.chapterNumber,
          confidence: dCh.confidence,
          needsReview: dCh.needsReview,
        },
      });
    } else {
      chapterRecord = await prisma.chapter.create({
        data: {
          bookId,
          number: dCh.chapterNumber,
          chapterNumber: dCh.chapterNumber,
          title: dCh.title,
          slug,
          startPage: dCh.startPage,
          endPage: dCh.endPage,
          sortOrder: dCh.chapterNumber,
          status: "DRAFT",
          confidence: dCh.confidence,
          needsReview: dCh.needsReview,
          isPublished: false,
        },
      });
    }

    persistedChapters.push(chapterRecord);
  }

  // 5. Idempotently Persist Passages
  // Preserve any passages that were manually proofread or marked as APPROVED
  const existingApproved = await prisma.passage.findMany({
    where: {
      bookId,
      OR: [
        { status: "APPROVED" },
        { proofreadText: { not: null } },
      ],
    },
  });

  const approvedIds = new Set(existingApproved.map((p) => p.id));

  // Remove existing DRAFT / unapproved passages to allow clean idempotent re-structuring
  await prisma.passage.deleteMany({
    where: {
      bookId,
      id: { notIn: Array.from(approvedIds) },
    },
  });

  let needsReviewCount = 0;
  const createdPassages = [];

  for (let pIdx = 0; pIdx < detectedPassages.length; pIdx++) {
    const dPass = detectedPassages[pIdx];
    const targetChapter = persistedChapters[dPass.chapterIndex] || persistedChapters[0] || null;

    if (dPass.needsReview) {
      needsReviewCount++;
    }

    // Normalized search text: lowercase, punctuation-neutral
    const searchText = dPass.text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

    const created = await prisma.passage.create({
      data: {
        bookId,
        chapterId: targetChapter ? targetChapter.id : null,
        pageId: dPass.pageId,
        passageNumber: pIdx + 1,
        number: pIdx + 1,
        sortOrder: dPass.sortOrder,
        passageType: dPass.passageType,
        status: "DRAFT",
        needsReview: dPass.needsReview,
        confidence: dPass.confidence,
        text: dPass.text,
        rawText: dPass.rawText,
        cleanedText: dPass.text,
        searchText,
        sourcePage: dPass.sourcePage,
        endPage: dPass.endPage,
      },
    });

    createdPassages.push(created);
  }

  // 6. Update Book Status: Set to PROOFREAD (never auto-PUBLISHED)
  await prisma.book.update({
    where: { id: bookId },
    data: {
      status: "PROOFREAD",
      processingStatus: "COMPLETED",
      pageCount: pages.length,
    },
  });

  return {
    success: true,
    bookId,
    chaptersCount: persistedChapters.length,
    passagesCount: createdPassages.length + existingApproved.length,
    pagesCount: pages.length,
    needsReviewCount,
  };
}
