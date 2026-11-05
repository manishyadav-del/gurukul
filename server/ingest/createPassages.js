import prisma from "../../lib/prisma.js";

/**
 * Creates standardized Passage records from cleaned page text.
 * Maintains full provenance: Book -> Chapter -> Page -> Passage.
 * 
 * @param {Object} params
 * @param {string} params.bookId
 * @param {string} params.pageId
 * @param {number} params.pageNumber
 * @param {string} [params.chapterId]
 * @param {string} params.cleanedText
 * @param {number} [params.startingPassageNumber=1]
 * @returns {Promise<Array<Passage>>} Created passage records
 */
export async function createPassagesForPage({
  bookId,
  pageId,
  pageNumber,
  chapterId = null,
  cleanedText,
  startingPassageNumber = 1,
}) {
  if (!cleanedText || !cleanedText.trim()) {
    return [];
  }

  // Split into logical paragraph blocks
  const paragraphs = cleanedText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (paragraphs.length === 0) {
    return [];
  }

  // Idempotency: Remove any existing passages previously generated for this specific pageId
  await prisma.passage.deleteMany({
    where: { pageId },
  });

  const passagesToCreate = [];
  let currentOffset = 0;
  let passageNum = startingPassageNumber;

  for (const para of paragraphs) {
    const startOffset = cleanedText.indexOf(para, currentOffset);
    const endOffset = startOffset >= 0 ? startOffset + para.length : currentOffset + para.length;
    currentOffset = endOffset;

    // Search text: normalized for case-insensitive and diacritic search
    const searchText = para.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();

    passagesToCreate.push({
      bookId,
      chapterId: chapterId || null,
      pageId,
      passageNumber: passageNum,
      number: passageNum,
      sortOrder: passageNum,
      sourcePage: pageNumber,
      text: para,
      rawText: para,
      cleanedText: para,
      proofreadText: null,
      startOffset: startOffset >= 0 ? startOffset : 0,
      endOffset,
      searchText,
    });

    passageNum++;
  }

  // Batch create
  const created = [];
  for (const p of passagesToCreate) {
    const item = await prisma.passage.create({
      data: p,
    });
    created.push(item);
  }

  return created;
}
