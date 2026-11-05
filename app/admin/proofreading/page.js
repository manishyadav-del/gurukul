import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, CheckSquare, AlertTriangle, Eye, ShieldCheck, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProofreadingHubPage({ searchParams }) {
  const params = await searchParams;
  const selectedBookId = params?.bookId;

  // Fetch books that have processed pages
  const books = await prisma.book.findMany({
    where: {
      pages: { some: {} },
    },
    include: {
      _count: {
        select: {
          pages: true,
          ocrErrors: true,
        },
      },
      pages: {
        select: {
          id: true,
          pageNumber: true,
          imageUrl: true,
          ocrConfidence: true,
          proofread: true,
          processingMethod: true,
        },
        orderBy: { pageNumber: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const activeBook = selectedBookId
    ? books.find((b) => b.id === selectedBookId) || books[0]
    : books[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/books"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Books</span>
          </Link>
          <h1 className="text-3xl font-bold text-stone-900 font-serif">
            Admin Proofreading & OCR Review Workspace
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Compare original scanned pages side-by-side with OCR text, correct transcription mistakes, and approve pages.
          </p>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-400">
          <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-30 text-amber-700" />
          <h3 className="text-base font-bold text-stone-700">No Pages Ready for Proofreading</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Upload a book PDF and run the OCR ingestion pipeline first to populate pages for review.
          </p>
          <Link
            href="/admin/books"
            className="inline-block mt-4 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold"
          >
            Go to Books Upload
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Books Selector Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 px-2">
              Select Book
            </h3>
            <div className="space-y-1.5">
              {books.map((b) => {
                const isSelected = activeBook?.id === b.id;
                const approvedCount = b.pages.filter((p) => p.proofread).length;
                const total = b.pages.length;

                return (
                  <Link
                    key={b.id}
                    href={`/admin/proofreading?bookId=${b.id}`}
                    className={`block p-3 rounded-xl border transition ${
                      isSelected
                        ? "bg-amber-50 border-amber-300 text-stone-900 shadow-xs"
                        : "bg-white border-stone-200 hover:bg-stone-50 text-stone-700"
                    }`}
                  >
                    <p className="font-semibold text-sm line-clamp-1">{b.title}</p>
                    <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1">
                      <span>{b.language}</span>
                      <span>
                        {approvedCount}/{total} approved
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Pages Grid for Selected Book */}
          <div className="lg:col-span-3 space-y-4">
            {activeBook && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900 font-serif">
                      {activeBook.title}
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {activeBook.pages.length} Pages Ingested • {activeBook.pages.filter((p) => p.proofread).length} Approved
                    </p>
                  </div>

                  {activeBook.pages.length > 0 && (
                    <Link
                      href={`/admin/proofreading/${activeBook.pages[0].id}`}
                      className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Start Proofreading (Page 1)</span>
                    </Link>
                  )}
                </div>

                {/* Grid of Pages */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {activeBook.pages.map((p) => {
                    const confScore = Math.round((p.ocrConfidence || 0) * 100);
                    return (
                      <Link
                        key={p.id}
                        href={`/admin/proofreading/${p.id}`}
                        className="group border border-stone-200 hover:border-amber-600 rounded-xl overflow-hidden bg-stone-50/50 hover:bg-white transition flex flex-col"
                      >
                        {/* Thumbnail */}
                        <div className="h-36 bg-stone-200/50 overflow-hidden relative flex items-center justify-center">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={`Page ${p.pageNumber}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                          ) : (
                            <span className="text-xs text-stone-400">No Image</span>
                          )}

                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-stone-900/80 text-white font-mono text-[10px] rounded-md">
                            #{p.pageNumber}
                          </span>

                          <span
                            className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-md ${
                              confScore >= 90
                                ? "bg-emerald-600 text-white"
                                : confScore >= 75
                                ? "bg-amber-600 text-white"
                                : "bg-rose-600 text-white"
                            }`}
                          >
                            {confScore}%
                          </span>
                        </div>

                        {/* Footer status */}
                        <div className="p-2 text-center text-[11px] font-semibold border-t border-stone-100">
                          {p.proofread ? (
                            <span className="text-emerald-700">✓ Approved</span>
                          ) : (
                            <span className="text-amber-700">Pending</span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
