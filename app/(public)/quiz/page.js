import Link from "next/link";
import prisma from "@/lib/prisma";
import { HelpCircle, Award, CheckCircle2, ArrowRight, BookOpen, Sparkles } from "lucide-react";

export default async function QuizPage() {
  const quizzes = await prisma.quiz.findMany({
    where: { isPublished: true },
    include: {
      book: {
        select: { title: true, slug: true, language: true },
      },
      chapter: {
        select: { title: true, slug: true, chapterNumber: true },
      },
      _count: {
        select: { questions: true, attempts: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Vedic Knowledge Assessments</span>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 font-serif">Astrology & Scripture Quizzes</h1>
          <p className="text-stone-600 text-sm mt-1">
            Evaluate and deepen your understanding of classical Jyotish, planetary yogas, and Sanskrit texts.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition shadow-xs self-start sm:self-auto"
        >
          <span>My Learning Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Quizzes List */}
      {quizzes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <HelpCircle className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-lg font-semibold text-stone-800 font-serif">No quizzes published yet</h3>
          <p className="text-stone-500 text-xs max-w-sm mx-auto">
            Interactive quizzes created from classical astrology manuscripts will appear here once approved by our scholars.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs hover:border-amber-400 hover:shadow-sm transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                  <span
                    className={`px-2.5 py-0.5 rounded-md ${
                      quiz.difficulty === "EASY"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : quiz.difficulty === "HARD"
                        ? "bg-rose-50 text-rose-800 border border-rose-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {quiz.difficulty}
                  </span>

                  {quiz.book && (
                    <span className="text-stone-500 text-[11px] truncate max-w-[200px]" title={quiz.book.title}>
                      Ref: {quiz.book.title}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-stone-900 font-serif leading-snug">
                  {quiz.title}
                </h2>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {quiz.description || "Interactive quiz for testing comprehension of astrological sutras."}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-stone-500">
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-700" />
                    {quiz._count.questions} Questions
                  </span>
                  <span>•</span>
                  <span>{quiz._count.attempts} Attempts</span>
                </div>

                <Link
                  href={`/quiz/${quiz.slug || quiz.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs transition"
                >
                  <span>Start Quiz</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
