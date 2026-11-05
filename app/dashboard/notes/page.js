import Link from "next/link";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FileText, ArrowLeft, Highlighter, ExternalLink, Lock, BookOpen } from "lucide-react";

export default async function NotesPage() {
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
          <h1 className="text-2xl font-bold text-stone-900 font-serif">Study Notes & Highlights</h1>
          <p className="text-xs text-stone-500">Your annotations, reflections, and highlighted astrological sutras.</p>
        </div>

        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-stone-900 font-serif">Student Sign-in Required</h2>
          <p className="text-xs text-stone-600 max-w-md mx-auto">
            Sign in to create personal study notes, highlight classical Devanagari verses, and organize your Jyotish reflections.
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

  const notes = await prisma.note.findMany({
    where: { userId },
    include: {
      passage: {
        include: {
          book: { select: { title: true, slug: true } },
          chapter: { select: { title: true, slug: true, chapterNumber: true } },
        },
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
        <h1 className="text-2xl font-bold text-stone-900 font-serif">Study Notes & Highlights</h1>
        <p className="text-xs text-stone-500">Your annotations, reflections, and highlighted astrological sutras.</p>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <FileText className="w-10 h-10 text-stone-300 mx-auto" />
          <h2 className="text-base font-bold text-stone-900 font-serif">No Study Notes Yet</h2>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Highlight text or write annotations while reading classical manuscripts in the Digital Library.
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
          {notes.map((note) => {
            const bookSlug = note.passage?.book?.slug || "book";
            const chapterSlug = note.passage?.chapter?.slug || "chapter";
            const readerUrl = `/library/${bookSlug}/${chapterSlug}#passage-${note.passageId}`;

            return (
              <div
                key={note.id}
                className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3 hover:border-amber-300 transition"
              >
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="font-semibold text-amber-900">
                    {note.passage?.book?.title} • Ch: {note.passage?.chapter?.title || "Overview"}
                  </span>
                  {note.sourcePage && <span>Page {note.sourcePage}</span>}
                </div>

                {note.selectedText && (
                  <div className="p-3 rounded-lg bg-amber-50/60 border-l-2 border-l-amber-600 text-xs font-serif text-stone-800 italic leading-relaxed">
                    "{note.selectedText}"
                  </div>
                )}

                {note.body && (
                  <p className="text-stone-800 text-sm leading-relaxed whitespace-pre-wrap">
                    {note.body}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-between text-xs border-t border-stone-100">
                  <div className="flex items-center gap-2">
                    {note.isHighlight && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-900 font-semibold flex items-center gap-1">
                        <Highlighter className="w-3 h-3 text-amber-700" />
                        Highlight
                      </span>
                    )}
                    <span className="text-[11px] text-stone-400">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <Link
                    href={readerUrl}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 transition"
                  >
                    <span>Read in context</span>
                    <ExternalLink className="w-3 h-3" />
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
