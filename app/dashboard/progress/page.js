import Link from "next/link";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TrendingUp, ArrowLeft, BookOpen, Lock } from "lucide-react";

export default async function ProgressPage() {
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
          <h1 className="text-2xl font-bold text-stone-900 font-serif">Reading Progress</h1>
          <p className="text-xs text-stone-500">Overview of your personalized study across classical manuscripts.</p>
        </div>

        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-stone-900 font-serif">Student Sign-in Required</h2>
          <p className="text-xs text-stone-600 max-w-md mx-auto">
            Sign in to track your personal reading positions, chapter completions, and scripture mastery.
          </p>
          <div className="pt-2 flex justify-center gap-3">
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

  const progresses = await prisma.readingProgress.findMany({
    where: { userId },
    include: {
      book: {
        include: {
          _count: {
            select: { chapters: true, passages: true },
          },
        },
      },
      chapter: {
        select: { id: true, title: true, slug: true, chapterNumber: true },
      },
      passage: {
        select: { id: true, sourcePage: true, passageNumber: true },
      },
    },
    orderBy: { updatedAt: "desc" },
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
        <h1 className="text-2xl font-bold text-stone-900 font-serif">Your Reading Progress</h1>
        <p className="text-xs text-stone-500">Your persisted study positions and manuscript completions.</p>
      </div>

      {progresses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <TrendingUp className="w-10 h-10 text-stone-300 mx-auto" />
          <h2 className="text-base font-bold text-stone-900 font-serif">No Reading Progress Yet</h2>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Open any manuscript in the Digital Library to begin tracking your study progress and resume positions.
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
          {progresses.map((p) => {
            const lastPage = p.pageNumber || p.passage?.sourcePage || 1;
            const resumeUrl = `/library/${p.book.slug}/${p.chapter?.slug || ""}${lastPage ? `?page=${lastPage}` : ""}`;

            return (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                      {p.book.language}
                    </span>
                    {p.isCompleted && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-stone-900">{p.book.title}</h2>
                  <p className="text-xs text-stone-500">
                    {p.chapter ? `Chapter: ${p.chapter.title}` : `${p.book._count.chapters} chapters`} • Page {lastPage}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-36 bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, p.progress)}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-stone-700 min-w-12">
                    {p.progress.toFixed(0)}%
                  </span>
                  <Link
                    href={resumeUrl}
                    className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition"
                  >
                    Resume
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
