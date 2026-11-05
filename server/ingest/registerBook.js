import prisma from "../../lib/prisma.js";

/**
 * Generate a URL-friendly slug from title
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Register a new book record in the database.
 * 
 * @param {Object} data - Book metadata
 * @returns {Promise<Book>} Created book record
 */
export async function registerBook(data) {
  let baseSlug = data.slug ? slugify(data.slug) : slugify(data.title || "untitled-book");
  if (!baseSlug) baseSlug = "astrology-book";

  // Ensure unique slug
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.book.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing) break;
    slug = `${baseSlug}-${counter++}`;
  }

  const book = await prisma.book.create({
    data: {
      title: data.title || "Untitled Book",
      slug,
      description: data.description || null,
      author: data.author || null,
      publisher: data.publisher || null,
      edition: data.edition || null,
      isbn: data.isbn || null,
      language: data.language || "Hindi",
      script: data.script || (data.language === "English" ? "Latin" : "Devanagari"),
      originalFileName: data.originalFileName || null,
      originalFileUrl: data.originalFileUrl || null,
      coverImageUrl: data.coverImageUrl || null,
      coverUrl: data.coverImageUrl || null,
      sourcePdf: data.originalFileUrl || null,
      pageCount: data.pageCount || null,
      fileHash: data.fileHash || null,
      status: "RECEIVED",
      processingStatus: "QUEUED",
    },
  });

  return book;
}
