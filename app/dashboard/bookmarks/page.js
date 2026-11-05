import Link from "next/link";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Bookmark, ArrowLeft, ArrowRight, Lock, BookOpen } from "lucide-react";

export default async function BookmarksPage() {
  let userId = null;
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) userId = session.user.id;
  } catch {}

  if (!userId) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold text-stone-900 font-serif">Saved Bookmarks</h1>
          <p className="text-xs text-stone-500">Quickly revisit marked verses and classical commentaries.</p>
        </div>

        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-stone-900 font-serif">Student Sign-in Required</h2>
          <p className="text-xs text-stone-600 max-w-md mx-auto">
            Sign in to bookmark sacred verses, save commentary notes, and resume reading instantly.
          </p>
          <div className="pt-2">
            <Link
              href="/library"
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition"
            >
              Browse Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    include: {
      passage: {
        include: {
          book: true,
          chapter: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-2xl font-bold text-stone-900 font-serif">Saved Bookmarks</h1>
        <p className="text-xs text-stone-500">Quickly revisit marked verses and classical commentaries.</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <Bookmark className="w-10 h-10 text-stone-300 mx-auto" />
          <h2 className="text-base font-bold text-stone-900 font-serif">No Bookmarks Saved Yet</h2>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Click the bookmark icon while reading any manuscript to save inspiring passages for study and contemplation.
          </p>
          <div className="pt-2">
            <Link
              href="/library"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Explore Library</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((bm) => (
            <div
              key={bm.id}
              className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-2 hover:border-amber-200 transition"
            >
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="font-semibold text-amber-800">
                  {bm.passage.book.title} • {bm.passage.chapter?.title || "General"}
                </span>
                {bm.passage.sourcePage && <span>Page {bm.passage.sourcePage}</span>}
              </div>

              <p className="text-stone-800 text-base font-serif leading-relaxed">
                {bm.passage.text}
              </p>

              {bm.note && (
                <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/60 text-xs text-amber-900">
                  <span className="font-semibold text-amber-800">Note: </span>
                  {bm.note}
                </div>
              )}

              {bm.passage.chapter?.slug && (
                <div className="pt-2 flex justify-end">
                  <Link
                    href={`/library/${bm.passage.book.slug}/${bm.passage.chapter.slug}#passage-${bm.passageId}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 transition"
                  >
                    <span>Read in Context</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
