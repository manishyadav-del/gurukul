import Link from "next/link";
import { BookOpen, FileCheck, Target, Award, ChevronRight } from "lucide-react";

export default function LearningJourneyCard({
  progressPercent = 42,
  booksInProgress = 3,
  chaptersCompleted = 8,
  quizzesCompleted = 5,
  badgesEarned = 6,
}) {
  // SVG circular progress calculation
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <h3 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
          My Learning Journey
        </h3>
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-amber-800 hover:text-amber-900 transition flex items-center"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Progress Circle & Metrics Grid */}
      <div className="flex items-center gap-5 pt-3">
        {/* Circular Progress Gauge */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="text-stone-100"
                strokeWidth="7"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="text-teal-600 transition-all duration-1000 ease-out"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-bold text-stone-900 font-serif">
                {progressPercent}%
              </span>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mt-1 text-center">
            Overall Progress
          </span>
        </div>

        {/* 4 Metrics Rows */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-stone-900">{booksInProgress}</span>
            <span className="text-stone-500 text-[11px] truncate">Books In Progress</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <FileCheck className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-stone-900">{chaptersCompleted}</span>
            <span className="text-stone-500 text-[11px] truncate">Chapters Completed</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Target className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-stone-900">{quizzesCompleted}</span>
            <span className="text-stone-500 text-[11px] truncate">Quizzes Completed</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Award className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-stone-900">{badgesEarned}</span>
            <span className="text-stone-500 text-[11px] truncate">Badges Earned</span>
          </div>
        </div>
      </div>
    </div>
  );
}
