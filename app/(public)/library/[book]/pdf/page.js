import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ArrowLeft, BookOpen, Download } from "lucide-react";
import BookPdfViewer from "@/components/reader/BookPdfViewer.jsx";
import { getGeneratedBookPdfUrl } from "@/lib/bookPdfHelper";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function BookPdfReaderPage({ params }) {
  const { book: bookSlug } = await params;
  const session = await getServerSession(authOptions).catch(() => null);
  const user = session?.user || null;

  const book = await prisma.book.findFirst({
    where: {
      OR: [{ id: bookSlug }, { slug: bookSlug }],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      author: true,
      language: true,
      script: true,
      pageCount: true,
      processingStatus: true,
      ingestJobs: {
        select: { id: true, status: true, progress: true, currentStep: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      ocrErrors: {
        where: { resolved: false },
        select: { id: true, pageId: true, errorType: true, message: true },
        take: 20,
      },
      chapters: {
        select: {
          id: true,
          title: true,
          slug: true,
          chapterNumber: true,
          number: true,
          startPage: true,
          endPage: true,
        },
        orderBy: { chapterNumber: "asc" },
      },
      pages: {
        select: {
          id: true,
          pageNumber: true,
          pdfPageIndex: true,
          rawText: true,
          cleanedText: true,
          proofreadText: true,
          ocrConfidence: true,
          ocrCompleted: true,
          proofread: true,
          processingMethod: true,
          ocrEngine: true,
          qualityIssues: true,
          language: true,
        },
        orderBy: { pageNumber: "asc" },
      },
      passages: {
        select: {
          id: true,
          passageNumber: true,
          chapterId: true,
          sourcePage: true,
          text: true,
          rawText: true,
          passageType: true,
        },
        orderBy: { sortOrder: "asc" },
        take: 300,
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

  // Authorized same-origin streaming & download endpoints
  const securePdfUrl = `/api/books/${book.id}/pdf`;
  const downloadPdfUrl = `/api/books/${book.id}/pdf?download=true`;

  const firstChapterSlug = book.chapters[0]?.slug;

  return (
    <div className="max-w-[1760px] w-full mx-auto px-2 sm:px-4 lg:px-6 py-4 space-y-3">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-3">
          <Link
            href={`/library/${book.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Book Overview</span>
          </Link>
          <span className="text-stone-300">•</span>
          <span className="text-xs font-semibold text-amber-800 font-serif">
            {book.title} (Digital Book PDF Edition)
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {firstChapterSlug && (
            <Link
              href={`/library/${book.slug}/${firstChapterSlug}`}
              className="px-3 py-1.5 rounded-xl border border-stone-200 hover:border-amber-600 hover:text-amber-800 text-stone-600 transition flex items-center gap-1.5 bg-white shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Chapter Reader</span>
            </Link>
          )}

          <a
            href={downloadPdfUrl}
            download={`${book.slug}-digitized-edition.pdf`}
            className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold transition flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </a>
        </div>
      </div>

      {/* Book PDF Viewer Component */}
      <BookPdfViewer
        pdfUrl={securePdfUrl}
        title={book.title}
        author={book.author}
        bookId={book.id}
        bookSlug={book.slug}
        pageCount={book.pageCount}
        processingStatus={book.processingStatus}
        ingestJobs={book.ingestJobs || []}
        ocrErrors={book.ocrErrors || []}
        chapters={book.chapters || []}
        initialPages={book.pages || []}
        initialPassages={book.passages || []}
        user={user}
      />
    </div>
  );
}
