import prisma from "../../lib/prisma.js";
import { detectPageStructure } from "./detectStructure.js";
import { createPassagesForPage } from "./createPassages.js";
import { slugify } from "./registerBook.js";

/**
 * Finalizes book structure and creates traceable Chapters and Passages.
 * 
 * @param {string} bookId - ID of the processed book
 * @returns {Promise<{ chaptersCount: number, passagesCount: number, pagesCount: number }>}
 */
export async function importBook(bookId) {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      pages: {
        orderBy: { pageNumber: "asc" },
      },
    },
  });

  if (!book) {
    throw new Error(`Book ${bookId} not found`);
  }

  const pages = book.pages;
  if (pages.length === 0) {
    throw new Error(`Book ${bookId} has no processed pages`);
  }

  // 1. Detect chapters across pages
  const detectedChapters = [];
  for (const page of pages) {
    const textToAnalyze = page.cleanedText || page.rawText || "";
    const structure = detectPageStructure(textToAnalyze, page.pageNumber);
    for (const ch of structure.chapters) {
      detectedChapters.push({
        title: ch.title,
        pageNumber: ch.pageNumber,
      });
    }
  }

  // If no chapters detected, generate a default Chapter 1
  if (detectedChapters.length === 0) {
    detectedChapters.push({
      title: "अध्याय १ / Chapter 1",
      pageNumber: pages[0].pageNumber,
    });
  }

  // Determine chapter start and end page bounds
  const chapterDefinitions = [];
  for (let i = 0; i < detectedChapters.length; i++) {
    const current = detectedChapters[i];
    const next = detectedChapters[i + 1];
    const startPage = current.pageNumber;
    const endPage = next ? next.pageNumber - 1 : pages[pages.length - 1].pageNumber;

    chapterDefinitions.push({
      chapterNumber: i + 1,
      title: current.title,
      slug: slugify(`chapter-${i + 1}-${current.title}`),
      startPage,
      endPage: Math.max(startPage, endPage),
    });
  }

  // 2. Persist chapters (upsert)
  const createdChapters = [];
  for (const chDef of chapterDefinitions) {
    const chapter = await prisma.chapter.upsert({
      where: {
        bookId_slug: {
          bookId,
          slug: chDef.slug,
        },
      },
      update: {
        number: chDef.chapterNumber,
        chapterNumber: chDef.chapterNumber,
        title: chDef.title,
        startPage: chDef.startPage,
        endPage: chDef.endPage,
      },
      create: {
        bookId,
        number: chDef.chapterNumber,
        chapterNumber: chDef.chapterNumber,
        title: chDef.title,
        slug: chDef.slug,
        startPage: chDef.startPage,
        endPage: chDef.endPage,
        isPublished: false,
      },
    });
    createdChapters.push(chapter);
  }

  // Helper to find which chapter a page belongs to
  function findChapterForPage(pageNumber) {
    const matched = createdChapters.find(
      (c) => pageNumber >= (c.startPage ?? 1) && pageNumber <= (c.endPage ?? Infinity)
    );
    return matched || createdChapters[0] || null;
  }

  // 3. Create Passages for each page linked to Book -> Chapter -> Page
  let totalPassages = 0;
  let globalPassageCounter = 1;

  for (const page of pages) {
    const chapter = findChapterForPage(page.pageNumber);
    const cleanedText = page.cleanedText || page.rawText || "";

    const passages = await createPassagesForPage({
      bookId,
      pageId: page.id,
      pageNumber: page.pageNumber,
      chapterId: chapter ? chapter.id : null,
      cleanedText,
      startingPassageNumber: globalPassageCounter,
    });

    globalPassageCounter += passages.length;
    totalPassages += passages.length;
  }

  // 4. Update book status to PROOFREAD (ready for admin review, never auto-publish)
  await prisma.book.update({
    where: { id: bookId },
    data: {
      status: "PROOFREAD",
      processingStatus: "COMPLETED",
      pageCount: pages.length,
    },
  });

  return {
    chaptersCount: createdChapters.length,
    passagesCount: totalPassages,
    pagesCount: pages.length,
  };
}
