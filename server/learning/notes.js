/**
 * Notes and Highlights Management Service
 * 
 * Provides robust CRUD operations for user notes and text highlights,
 * linking them to books, chapters, passages, and source pages with
 * server-side user-isolation guardrails and passage-resilience checks.
 */

import prisma from "../../lib/prisma.js";

/**
 * Creates a private study note or highlight.
 * 
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.passageId
 * @param {string} [params.bookId]
 * @param {string} [params.chapterId]
 * @param {string} [params.body]
 * @param {string} [params.selectedText]
 * @param {string} [params.color="amber"]
 * @param {boolean} [params.isHighlight=false]
 * @param {number} [params.startOffset]
 * @param {number} [params.endOffset]
 * @param {number} [params.sourcePage]
 * @returns {Promise<Object>} Created note record
 */
export async function createNote({
  userId,
  passageId,
  bookId,
  chapterId,
  body = "",
  selectedText = "",
  color = "amber",
  isHighlight = false,
  startOffset = null,
  endOffset = null,
  sourcePage = null,
}) {
  if (!userId) {
    const err = new Error("Authentication required to create notes");
    err.statusCode = 401;
    throw err;
  }

  if (!passageId) {
    const err = new Error("passageId is required");
    err.statusCode = 400;
    throw err;
  }

  // Fetch passage to verify existence and extract relations
  const passage = await prisma.passage.findUnique({
    where: { id: passageId },
    include: {
      chapter: { select: { id: true, title: true, slug: true } },
      book: { select: { id: true, title: true, slug: true } },
    },
  });

  if (!passage) {
    const err = new Error("Passage not found");
    err.statusCode = 404;
    throw err;
  }

  const resolvedBookId = bookId || passage.bookId;
  const resolvedChapterId = chapterId || passage.chapterId;
  const resolvedSourcePage = sourcePage !== null ? sourcePage : passage.sourcePage;

  const note = await prisma.note.create({
    data: {
      userId,
      passageId,
      bookId: resolvedBookId,
      chapterId: resolvedChapterId,
      body: body ? body.trim() : "",
      selectedText: selectedText ? selectedText.trim() : "",
      color: color || "amber",
      isHighlight: Boolean(isHighlight),
      startOffset: startOffset !== null ? Number(startOffset) : null,
      endOffset: endOffset !== null ? Number(endOffset) : null,
      sourcePage: resolvedSourcePage,
    },
    include: {
      passage: {
        select: {
          id: true,
          text: true,
          passageNumber: true,
          sourcePage: true,
          passageType: true,
        },
      },
      chapter: {
        select: { id: true, title: true, slug: true, chapterNumber: true },
      },
      book: {
        select: { id: true, title: true, slug: true, author: true },
      },
    },
  });

  return formatNoteWithReaderUrl(note);
}

/**
 * Updates an existing note or highlight with server-side authorization.
 */
export async function updateNote({ noteId, userId, body, color, selectedText }) {
  if (!userId || !noteId) {
    const err = new Error("User ID and Note ID are required");
    err.statusCode = 400;
    throw err;
  }

  const existing = await prisma.note.findUnique({
    where: { id: noteId },
  });

  if (!existing) {
    const err = new Error("Note not found");
    err.statusCode = 404;
    throw err;
  }

  if (existing.userId !== userId) {
    const err = new Error("Forbidden: You can only edit your own notes");
    err.statusCode = 403;
    throw err;
  }

  const data = {};
  if (typeof body === "string") data.body = body.trim();
  if (typeof color === "string") data.color = color.trim();
  if (typeof selectedText === "string") data.selectedText = selectedText.trim();

  const updated = await prisma.note.update({
    where: { id: noteId },
    data,
    include: {
      passage: true,
      chapter: true,
      book: true,
    },
  });

  return formatNoteWithReaderUrl(updated);
}

/**
 * Deletes a note or highlight with server-side authorization.
 */
export async function deleteNote({ noteId, userId }) {
  if (!userId || !noteId) {
    const err = new Error("User ID and Note ID are required");
    err.statusCode = 400;
    throw err;
  }

  const existing = await prisma.note.findUnique({
    where: { id: noteId },
  });

  if (!existing) {
    const err = new Error("Note not found");
    err.statusCode = 404;
    throw err;
  }

  if (existing.userId !== userId) {
    const err = new Error("Forbidden: You can only delete your own notes");
    err.statusCode = 403;
    throw err;
  }

  await prisma.note.delete({
    where: { id: noteId },
  });

  return { success: true, deletedId: noteId };
}

/**
 * Retrieves notes for a user with optional filters and match verification.
 */
export async function getUserNotes({
  userId,
  bookId = null,
  chapterId = null,
  passageId = null,
  isHighlight = null,
  page = 1,
  limit = 50,
}) {
  if (!userId) {
    return { notes: [], total: 0 };
  }

  const where = { userId };
  if (bookId) where.bookId = bookId;
  if (chapterId) where.chapterId = chapterId;
  if (passageId) where.passageId = passageId;
  if (isHighlight !== null) where.isHighlight = Boolean(isHighlight);

  const [notes, total] = await Promise.all([
    prisma.note.findMany({
      where,
      include: {
        passage: {
          select: {
            id: true,
            text: true,
            passageNumber: true,
            sourcePage: true,
            passageType: true,
          },
        },
        chapter: {
          select: { id: true, title: true, slug: true, chapterNumber: true },
        },
        book: {
          select: { id: true, title: true, slug: true, author: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.note.count({ where }),
  ]);

  return {
    notes: notes.map(formatNoteWithReaderUrl),
    total,
    page,
    limit,
  };
}

/**
 * Formats note record with deep reader navigation URL and match resilience check.
 */
function formatNoteWithReaderUrl(note) {
  const bookSlug = note.book?.slug || note.bookId;
  const chapterSlug = note.chapter?.slug || "general";
  const readerUrl = `/library/${bookSlug}/${chapterSlug}#passage-${note.passageId}`;

  // Match resilience: verify if selectedText is still present in passage
  let reliableMatch = true;
  if (note.selectedText && note.passage?.text) {
    reliableMatch = note.passage.text.includes(note.selectedText);
  }

  return {
    ...note,
    readerUrl,
    reliableMatch,
  };
}
