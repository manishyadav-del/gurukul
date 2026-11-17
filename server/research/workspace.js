/**
 * Gurukul Research Workspace Service
 * 
 * Manages personal research collections, saved questions & answers with citations,
 * bookmarked passages, and study notes with full provenance back to original books.
 */

import prisma from "../../lib/prisma.js";

/**
 * Retrieves all research collections for a user, with item counts and tags.
 * 
 * @param {string} userId
 * @returns {Promise<Array<Object>>}
 */
export async function getUserResearchCollections(userId) {
  if (!userId) throw new Error("Authentication required.");

  const collections = await prisma.researchCollection.findMany({
    where: { userId },
    include: {
      _count: {
        select: { items: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return collections.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    tags: c.tags || [],
    itemCount: c._count.items,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
}

/**
 * Creates a new research collection.
 * 
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export async function createResearchCollection({
  userId,
  title,
  description = null,
  tags = [],
}) {
  if (!userId) throw new Error("Authentication required.");
  if (!title || !title.trim()) throw new Error("Collection title is required.");

  return await prisma.researchCollection.create({
    data: {
      userId,
      title: title.trim(),
      description: description ? description.trim() : null,
      tags: Array.isArray(tags) ? tags.map((t) => String(t).trim()).filter(Boolean) : [],
    },
  });
}

/**
 * Updates a research collection.
 * 
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export async function updateResearchCollection({
  userId,
  collectionId,
  title,
  description,
  tags,
}) {
  if (!userId || !collectionId) throw new Error("userId and collectionId required.");

  // Verify ownership
  const existing = await prisma.researchCollection.findFirst({
    where: { id: collectionId, userId },
  });

  if (!existing) throw new Error("Collection not found or access denied.");

  const data = {};
  if (typeof title === "string" && title.trim()) data.title = title.trim();
  if (description !== undefined) data.description = description;
  if (Array.isArray(tags)) data.tags = tags.map((t) => String(t).trim()).filter(Boolean);

  return await prisma.researchCollection.update({
    where: { id: collectionId },
    data,
  });
}

/**
 * Deletes a research collection.
 * 
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export async function deleteResearchCollection({ userId, collectionId }) {
  if (!userId || !collectionId) throw new Error("userId and collectionId required.");

  const existing = await prisma.researchCollection.findFirst({
    where: { id: collectionId, userId },
  });

  if (!existing) throw new Error("Collection not found or access denied.");

  return await prisma.researchCollection.delete({
    where: { id: collectionId },
  });
}

/**
 * Retrieves research items for a user, optionally filtered by collection or type.
 * 
 * @param {Object} params
 * @returns {Promise<Array<Object>>}
 */
export async function getResearchItems({
  userId,
  collectionId = null,
  itemType = null,
  search = null,
  limit = 50,
}) {
  if (!userId) throw new Error("Authentication required.");

  const where = { userId };

  if (collectionId) {
    where.collectionId = collectionId;
  }

  if (itemType && itemType !== "ALL") {
    where.itemType = itemType;
  }

  if (search && search.trim()) {
    where.OR = [
      { title: { contains: search.trim(), mode: "insensitive" } },
      { query: { contains: search.trim(), mode: "insensitive" } },
      { answer: { contains: search.trim(), mode: "insensitive" } },
      { notes: { contains: search.trim(), mode: "insensitive" } },
    ];
  }

  const items = await prisma.researchItem.findMany({
    where,
    include: {
      collection: { select: { id: true, title: true } },
      book: { select: { id: true, title: true, slug: true, author: true } },
      chapter: { select: { id: true, title: true, slug: true } },
      passage: { select: { id: true, text: true, sourcePage: true, ocrConfidence: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return items.map((item) => ({
    id: item.id,
    collectionId: item.collectionId,
    collectionTitle: item.collection?.title || null,
    itemType: item.itemType,
    title: item.title,
    query: item.query,
    answer: item.answer,
    notes: item.notes,
    bookId: item.bookId,
    bookTitle: item.book?.title || null,
    bookSlug: item.book?.slug || null,
    chapterTitle: item.chapter?.title || null,
    pageNumber: item.pageNumber || item.passage?.sourcePage || null,
    passageId: item.passageId,
    citations: item.citations || [],
    comparisonData: item.comparisonData || null,
    metadata: item.metadata || {},
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
}

/**
 * Saves a new research item (question/answer, bookmarked passage, research note, or comparison).
 * 
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export async function saveResearchItem({
  userId,
  collectionId = null,
  itemType = "QUERY_ANSWER",
  title,
  query = null,
  answer = null,
  notes = null,
  bookId = null,
  passageId = null,
  chapterId = null,
  pageNumber = null,
  citations = [],
  comparisonData = null,
  metadata = {},
}) {
  if (!userId) throw new Error("Authentication required.");
  if (!title || !title.trim()) throw new Error("Title is required for saving research item.");

  // If collectionId provided, verify it belongs to this user
  if (collectionId) {
    const col = await prisma.researchCollection.findFirst({
      where: { id: collectionId, userId },
    });
    if (!col) {
      throw new Error("Specified research collection was not found.");
    }
  }

  return await prisma.researchItem.create({
    data: {
      userId,
      collectionId: collectionId || null,
      itemType,
      title: title.trim(),
      query: query ? query.trim() : null,
      answer: answer ? answer.trim() : null,
      notes: notes ? notes.trim() : null,
      bookId: bookId || null,
      passageId: passageId || null,
      chapterId: chapterId || null,
      pageNumber: pageNumber ? parseInt(pageNumber, 10) : null,
      citations: Array.isArray(citations) ? citations : [],
      comparisonData: comparisonData || null,
      metadata: metadata || {},
    },
    include: {
      collection: { select: { id: true, title: true } },
      book: { select: { id: true, title: true, slug: true } },
    },
  });
}

/**
 * Deletes a research item.
 * 
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export async function deleteResearchItem({ userId, itemId }) {
  if (!userId || !itemId) throw new Error("userId and itemId required.");

  const item = await prisma.researchItem.findFirst({
    where: { id: itemId, userId },
  });

  if (!item) throw new Error("Research item not found or access denied.");

  return await prisma.researchItem.delete({
    where: { id: itemId },
  });
}

/**
 * Updates an existing research item (e.g. title, personal notes, collection assignment).
 * 
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export async function updateResearchItem({
  userId,
  itemId,
  title,
  notes,
  collectionId,
  metadata,
}) {
  if (!userId || !itemId) throw new Error("userId and itemId required.");

  const item = await prisma.researchItem.findFirst({
    where: { id: itemId, userId },
  });

  if (!item) throw new Error("Research item not found or access denied.");

  const data = {};
  if (typeof title === "string" && title.trim()) data.title = title.trim();
  if (notes !== undefined) data.notes = notes ? notes.trim() : null;
  if (collectionId !== undefined) {
    if (collectionId) {
      const col = await prisma.researchCollection.findFirst({
        where: { id: collectionId, userId },
      });
      if (!col) throw new Error("Target collection not found or access denied.");
      data.collectionId = collectionId;
    } else {
      data.collectionId = null;
    }
  }
  if (metadata !== undefined) data.metadata = metadata;

  return await prisma.researchItem.update({
    where: { id: itemId },
    data,
    include: {
      collection: { select: { id: true, title: true } },
      book: { select: { id: true, title: true, slug: true } },
      chapter: { select: { id: true, title: true, slug: true } },
      passage: { select: { id: true, text: true, sourcePage: true } },
    },
  });
}

/**
 * Exports a research collection and its citations in Markdown, BibTeX, or JSON format.
 * 
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.collectionId
 * @param {string} [params.format="markdown"] - "markdown" | "bibtex" | "json"
 * @returns {Promise<{ filename: string, contentType: string, content: string }>}
 */
export async function exportResearchCollection({ userId, collectionId, format = "markdown" }) {
  if (!userId || !collectionId) throw new Error("userId and collectionId required.");

  const collection = await prisma.researchCollection.findFirst({
    where: { id: collectionId, userId },
    include: {
      items: {
        include: {
          book: true,
          chapter: true,
          passage: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!collection) throw new Error("Research collection not found or access denied.");

  const cleanTitle = collection.title.replace(/[^a-zA-Z0-9_-]/g, "_");

  if (format === "json") {
    return {
      filename: `${cleanTitle}_research.json`,
      contentType: "application/json",
      content: JSON.stringify(collection, null, 2),
    };
  }

  if (format === "bibtex") {
    let bib = `% Gurukul Digital Library Research Export\n% Collection: ${collection.title}\n% Export Date: ${new Date().toISOString()}\n\n`;

    collection.items.forEach((item, idx) => {
      const citeKey = `gurukul_${(item.book?.slug || "treatise").replace(/-/g, "_")}_${idx + 1}`;
      bib += `@misc{${citeKey},\n`;
      bib += `  title = {${item.title}},\n`;
      if (item.book?.title) bib += `  booktitle = {${item.book.title}},\n`;
      if (item.book?.author) bib += `  author = {${item.book.author}},\n`;
      if (item.chapter?.title) bib += `  chapter = {${item.chapter.title}},\n`;
      if (item.pageNumber || item.passage?.sourcePage) {
        bib += `  pages = {${item.pageNumber || item.passage?.sourcePage}},\n`;
      }
      bib += `  year = {${new Date(item.createdAt).getFullYear()}},\n`;
      if (item.notes) bib += `  note = {${item.notes.replace(/[\n\r]/g, " ")}},\n`;
      bib += `  publisher = {Gurukul Digital Library}\n`;
      bib += `}\n\n`;
    });

    return {
      filename: `${cleanTitle}_citations.bib`,
      contentType: "application/x-bibtex",
      content: bib,
    };
  }

  // Default: Formatted Academic Markdown
  let md = `# ${collection.title}\n\n`;
  if (collection.description) {
    md += `> ${collection.description}\n\n`;
  }
  md += `**Exported from Gurukul Digital Library on:** ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}\n`;
  if (collection.tags && collection.tags.length > 0) {
    md += `**Tags:** ${collection.tags.map((t) => `\`#${t}\``).join(" ")}\n`;
  }
  md += `\n---\n\n## Saved Research References (${collection.items.length})\n\n`;

  collection.items.forEach((item, idx) => {
    md += `### ${idx + 1}. ${item.title}\n\n`;
    if (item.book?.title) {
      md += `- **Source Work:** *${item.book.title}* (${item.book.language || "Sanskrit"})\n`;
    }
    if (item.book?.author) {
      md += `- **Author / Traditional Lineage:** ${item.book.author}\n`;
    }
    if (item.chapter?.title) {
      md += `- **Chapter:** ${item.chapter.title} (Chapter ${item.chapter.chapterNumber || 1})\n`;
    }
    if (item.pageNumber || item.passage?.sourcePage) {
      md += `- **Page:** ${item.pageNumber || item.passage?.sourcePage}\n`;
    }
    md += `- **Item Type:** \`${item.itemType}\`\n\n`;

    if (item.passage?.text) {
      md += `**Original Manuscript Passage:**\n\n> "${item.passage.text.trim()}"\n\n`;
    }

    if (item.query && item.itemType === "QUERY_ANSWER") {
      md += `**Research Question:**\n${item.query}\n\n`;
    }

    if (item.answer) {
      md += `**Scholarly Commentary / Finding:**\n${item.answer}\n\n`;
    }

    if (item.notes) {
      md += `**Personal Research Notes:**\n${item.notes}\n\n`;
    }

    md += `---\n\n`;
  });

  return {
    filename: `${cleanTitle}_research.md`,
    contentType: "text/markdown; charset=utf-8",
    content: md,
  };
}

/**
 * Fetches a complete past research session for resumption.
 * 
 * @param {string} userId
 * @param {string} sessionId - ID of the research item representing the session
 * @returns {Promise<Object>}
 */
export async function getResearchSession(userId, sessionId) {
  if (!userId || !sessionId) throw new Error("userId and sessionId required.");

  const session = await prisma.researchItem.findFirst({
    where: { id: sessionId, userId },
    include: {
      collection: true,
      book: true,
      passage: true,
      chapter: true,
    },
  });

  if (!session) throw new Error("Research session not found.");

  return session;
}
