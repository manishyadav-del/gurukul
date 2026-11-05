import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { BookOpen, Layers, ArrowRight, ArrowLeft } from "lucide-react";
import { getGeneratedBookPdfUrl } from "@/lib/bookPdfHelper";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function BookDetailsPage({ params }) {
  const { book: bookSlug } = await params;
  const session = await getServerSession(authOptions);
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
    });
  }

  const firstChapter = book.chapters[0];
  const targetChapter = readingProgress?.chapter || firstChapter;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          href="/library"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 mb-4 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Library</span>
        </Link>

        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-700">
            <span className="bg-amber-100/70 px-2.5 py-1 rounded-md">{book.language}</span>
            <span className="bg-stone-100 px-2.5 py-1 rounded-md text-stone-700">{book.script}</span>
            {book.pageCount && (
              <span className="bg-stone-100 px-2.5 py-1 rounded-md text-stone-700">{book.pageCount} Pages</span>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 font-serif">
              {book.title}
            </h1>
            {book.author && (
              <p className="text-sm font-medium text-stone-600">Author: {book.author}</p>
            )}
          </div>

          <p className="text-stone-700 text-base leading-relaxed border-t border-stone-100 pt-4">
            {book.description || "Classical manuscript on Vedic astrology principles."}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {targetChapter ? (
              <Link
                href={`/library/${book.slug || book.id}/${targetChapter.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#13382c] hover:bg-[#1a4a3b] text-white font-medium shadow-sm transition"
              >
                <BookOpen className="w-4 h-4" />
                <span>
                  {readingProgress ? `Continue Reading (Chapter ${targetChapter.chapterNumber || targetChapter.number || 1})` : "Start Reading"}
                </span>
              </Link>
            ) : (
              <Link
                href={`/library/${book.slug || book.id}/pdf`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#13382c] hover:bg-[#1a4a3b] text-white font-medium shadow-sm transition"
              >
                <BookOpen className="w-4 h-4" />
                <span>Read Digitized Manuscript</span>
              </Link>
            )}

            <Link
              href={`/library/${book.slug || book.id}/pdf`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium border border-stone-200 transition"
            >
              <span className="text-amber-600 font-bold">📄</span>
              <span>Open Dual-Page Reader</span>
            </Link>

            {getGeneratedBookPdfUrl(book.id, book.slug) && (
              <a
                href={getGeneratedBookPdfUrl(book.id, book.slug)}
                download={`${book.slug || book.id}-digitized-edition.pdf`}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-stone-600 hover:text-amber-800 hover:bg-amber-50 text-xs font-semibold transition"
                title="Download Digitized Book PDF"
              >
                <span>⬇ Download PDF</span>
              </a>
            )}

            {readingProgress && (
              <div className="flex items-center gap-2 text-xs text-stone-500 font-mono ml-auto">
                <div className="w-24 bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200">
                  <div
                    className="bg-[#13382c] h-2 rounded-full"
                    style={{ width: `${Math.min(100, readingProgress.progress || 0)}%` }}
                  />
                </div>
                <span>{Math.round(readingProgress.progress || 0)}% Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-stone-900 font-serif flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-700" />
            <span>Table of Contents</span>
          </h2>
          <span className="text-xs text-stone-500 font-medium">
            {book.chapters.length} Chapters
          </span>
        </div>

        {book.chapters.length > 0 ? (
          <div className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
            {book.chapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/library/${book.slug || book.id}/${chapter.slug}`}
                className="flex items-center justify-between p-5 hover:bg-stone-50/80 transition group"
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-amber-100 text-stone-600 group-hover:text-amber-800 flex items-center justify-center text-xs font-bold transition">
                    {chapter.number || chapter.chapterNumber || 1}
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-stone-900 group-hover:text-amber-800 transition">
                      {chapter.title}
                    </h3>
                    <div className="text-xs text-stone-500 mt-0.5">
                      {chapter._count?.passages ?? 0} passages
                      {chapter.startPage && ` • Pages ${chapter.startPage}–${chapter.endPage || chapter.startPage}`}
                    </div>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-700 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center space-y-3 shadow-xs">
            <p className="text-sm text-stone-600 max-w-md mx-auto">
              This classical manuscript is structured as a continuous digitized Shastra. You can navigate all {book.pageCount || 1} pages with synchronized Sanskrit OCR in the dual-page reader.
            </p>
            <Link
              href={`/library/${book.slug || book.id}/pdf`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#13382c] hover:bg-[#1a4a3b] text-white text-xs font-semibold transition"
            >
              <BookOpen className="w-4 h-4" />
              <span>Launch Reader Now</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
