import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canManageBooks } from "@/lib/permissions";
import BookReader from "@/components/reader/BookReader";
import { getGeneratedBookPdfUrl } from "@/lib/bookPdfHelper";

export const dynamic = "force-dynamic";

export default async function ChapterReaderPage({ params }) {
  const { book: bookSlug, chapter: chapterSlug } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user || null;
  const isPrivileged = user && canManageBooks(user);

  // 1. Fetch Book
  const book = await prisma.book.findFirst({
    where: {
      OR: [{ id: bookSlug }, { slug: bookSlug }],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      author: true,
      publisher: true,
      language: true,
      script: true,
      pageCount: true,
      status: true,
    },
  });

  if (!book) notFound();

  book.generatedPdfUrl = getGeneratedBookPdfUrl(book.id, book.slug);

  // Guard: Unpublished books only visible to editors/admins
  if (book.status !== "PUBLISHED" && !isPrivileged) {
    // If book is in proofread or approved state, let readers read if it's the primary content
    if (book.status !== "APPROVED" && book.status !== "PROOFREAD") {
      notFound();
    }
  }

  // 2. Fetch Chapters for Table of Contents
  const chapters = await prisma.chapter.findMany({
    where: {
      bookId: book.id,
      // If not privileged, only show chapters that are published or approved or draft if no others exist
      ...(isPrivileged ? {} : {}),
    },
    select: {
      id: true,
      title: true,
      subheading: true,
      slug: true,
      number: true,
      chapterNumber: true,
      startPage: true,
      endPage: true,
      isPublished: true,
      status: true,
    },
    orderBy: { chapterNumber: "asc" },
  });

  if (chapters.length === 0) notFound();

  // 3. Locate Current Chapter
  const currentChapter = chapters.find((c) => c.slug === chapterSlug) || chapters[0];
  if (!currentChapter) notFound();

  // 4. Fetch Passages for Chapter
  const passages = await prisma.passage.findMany({
    where: {
      bookId: book.id,
      chapterId: currentChapter.id,
    },
    select: {
      id: true,
      passageNumber: true,
      number: true,
      sortOrder: true,
      passageType: true,
      sourcePage: true,
      text: true,
      rawText: true,
      status: true,
    },
    orderBy: { sortOrder: "asc" },
  });

  // 5. Fetch User Bookmarks if Authenticated
  let initialBookmarks = [];
  if (user?.id && passages.length > 0) {
    const passageIds = passages.map((p) => p.id);
    const userBookmarks = await prisma.bookmark.findMany({
      where: {
        userId: user.id,
        passageId: { in: passageIds },
      },
      select: { passageId: true },
    });
    initialBookmarks = userBookmarks.map((b) => b.passageId);
  }

  // 6. Fetch Book Pages (for scan images and magazine layout)
  let bookPages = [];
  try {
    const startPg = currentChapter.startPage || 1;
    const endPg = currentChapter.endPage || startPg + 50;
    bookPages = await prisma.bookPage.findMany({
      where: {
        bookId: book.id,
        pageNumber: {
          gte: startPg,
          lte: endPg,
        },
      },
      select: {
        id: true,
        pageNumber: true,
        imageUrl: true,
        rawText: true,
        cleanedText: true,
        width: true,
        height: true,
      },
      orderBy: { pageNumber: "asc" },
    });
  } catch (err) {
    // Graceful fallback
    bookPages = [];
  }

  return (
    <BookReader
      book={book}
      chapter={currentChapter}
      chapters={chapters}
      passages={passages}
      pages={bookPages}
      initialBookmarks={initialBookmarks}
      user={user}
    />
  );
}
