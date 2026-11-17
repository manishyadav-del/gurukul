import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import BookDetailClient from "@/components/library/BookDetailClient.jsx";
import { getGeneratedBookPdfUrl } from "@/lib/bookPdfHelper";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function BookDetailsPage({ params }) {
  const { book: bookSlug } = await params;
  const session = await getServerSession(authOptions).catch(() => null);
  const user = session?.user || null;

  const book = await prisma.book.findFirst({
    where: {
      OR: [{ id: bookSlug }, { slug: bookSlug }],
    },
    include: {
      chapters: {
        orderBy: { chapterNumber: "asc" },
        include: {
          _count: {
            select: { passages: true },
          },
        },
      },
      _count: {
        select: {
          passages: true,
          pages: true,
        },
      },
    },
  });

  if (!book) {
    notFound();
  }

  // Guard: Unpublished books only visible to reviewers/editors/admins
  if (book.status !== "PUBLISHED") {
    const { canReviewBooks } = await import("@/lib/permissions");
    if (!user || !canReviewBooks(user)) {
      notFound();
    }
  }

  // Fetch user reading progress if authenticated
  let readingProgress = null;
  if (user?.id) {
    readingProgress = await prisma.readingProgress.findUnique({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId: book.id,
        },
      },
      include: {
        chapter: true,
      },
    }).catch(() => null);
  }

  // Fetch 4 related published books (excluding current book)
  const relatedBooks = await prisma.book.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: book.id },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      author: true,
      language: true,
      script: true,
      coverUrl: true,
      coverImageUrl: true,
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  const generatedPdfUrl = getGeneratedBookPdfUrl(book.id, book.slug);

  return (
    <BookDetailClient
      book={book}
      readingProgress={readingProgress}
      relatedBooks={relatedBooks}
      generatedPdfUrl={generatedPdfUrl}
    />
  );
}
