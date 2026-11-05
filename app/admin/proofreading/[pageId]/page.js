import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { notFound } from "next/navigation";
import ProofreadingEditor from "@/components/admin/ProofreadingEditor.jsx";

export const dynamic = "force-dynamic";

export default async function ProofreadingPageDetail({ params }) {
  const { pageId } = await params;

  const page = await prisma.bookPage.findUnique({
    where: { id: pageId },
    include: {
      ocrBlocks: { orderBy: { blockOrder: "asc" } },
      ocrErrors: { orderBy: { createdAt: "desc" } },
      book: {
        select: {
          id: true,
          title: true,
          slug: true,
          language: true,
          pageCount: true,
        },
      },
      passages: {
        orderBy: { passageNumber: "asc" },
        select: {
          id: true,
          passageNumber: true,
          text: true,
          rawText: true,
          cleanedText: true,
          proofreadText: true,
        },
      },
      correctionHistory: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!page) {
    notFound();
  }

  const [prevPage, nextPage] = await Promise.all([
    prisma.bookPage.findFirst({
      where: { bookId: page.bookId, pageNumber: { lt: page.pageNumber } },
      orderBy: { pageNumber: "desc" },
      select: { id: true, pageNumber: true, proofread: true },
    }),
    prisma.bookPage.findFirst({
      where: { bookId: page.bookId, pageNumber: { gt: page.pageNumber } },
      orderBy: { pageNumber: "asc" },
      select: { id: true, pageNumber: true, proofread: true },
    }),
  ]);

  const navigation = {
    prevPageId: prevPage?.id || null,
    prevPageNumber: prevPage?.pageNumber || null,
    nextPageId: nextPage?.id || null,
    nextPageNumber: nextPage?.pageNumber || null,
  };

  const correctionHistory = page.correctionHistory || [];

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/proofreading"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Proofreading List</span>
          </Link>
          <h1 className="text-2xl font-bold text-stone-900 font-serif">
            Page #{page.pageNumber} — {page.book?.title}
          </h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-stone-500 flex items-center gap-1">
              <BookOpen className="inline w-3.5 h-3.5" />
              {page.processingMethod} · {page.language || page.book?.language} · Confidence:{" "}
              {Math.round((page.ocrConfidence || 0) * 100)}%
            </span>
            {page.proofread ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                ✓ Approved
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                ⏳ Pending Review
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {navigation.prevPageId && (
            <Link
              href={`/admin/proofreading/${navigation.prevPageId}`}
              className="px-3 py-1.5 border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Page {navigation.prevPageNumber}</span>
            </Link>
          )}
          <span className="text-xs text-stone-400 font-mono">
            {page.pageNumber} / {page.book?.pageCount || "?"}
          </span>
          {navigation.nextPageId && (
            <Link
              href={`/admin/proofreading/${navigation.nextPageId}`}
              className="px-3 py-1.5 border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-xl transition flex items-center gap-1"
            >
              <span>Page {navigation.nextPageNumber}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Main Proofreading Editor Component (Client) */}
      <ProofreadingEditor
        page={{
          id: page.id,
          pageNumber: page.pageNumber,
          imageUrl: page.imageUrl,
          rawText: page.rawText,
          cleanedText: page.cleanedText,
          proofreadText: page.proofreadText,
          ocrConfidence: page.ocrConfidence,
          language: page.language,
          proofread: page.proofread,
          processingMethod: page.processingMethod,
          ocrBlocks: page.ocrBlocks,
          ocrErrors: page.ocrErrors,
          passages: page.passages,
          bookId: page.bookId,
          width: page.width,
          height: page.height,
        }}
        navigation={navigation}
        correctionHistory={correctionHistory}
      />

      {/* Correction History */}
      {correctionHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-stone-900 font-serif mb-4">
            Correction History ({correctionHistory.length})
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {correctionHistory.map((entry) => (
              <div key={entry.id} className="text-xs border-b border-stone-100 pb-3 last:border-0">
                <div className="flex items-center justify-between text-stone-400 mb-1">
                  <span className="font-semibold text-stone-600">{entry.correctedBy}</span>
                  <span>{new Date(entry.createdAt).toLocaleString("en-IN")}</span>
                </div>
                <p className="text-stone-700 font-serif line-clamp-2 leading-relaxed">
                  {entry.correctedText}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
