"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  BookOpen,
  ScanText,
  Compass,
  Award,
  HeartHandshake,
  Bot,
  Layers,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  FileCheck,
  Calendar,
  Shield,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { formatTime } from "@/lib/utils";

export default function AdminOverviewClient({ stats, recentLogs, currentRange }) {
  const router = useRouter();
  const [range, setRange] = useState(currentRange || "30d");

  const handleRangeChange = (newRange) => {
    setRange(newRange);
    router.push(`/admin?range=${newRange}`);
  };

  const metricCards = [
    {
      title: "Registered Users",
      value: stats.userCount.toLocaleString(),
      subtext: `+${stats.newUsersCount} in selected period`,
      href: "/admin/users",
      icon: Users,
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      title: "Published Manuscripts",
      value: `${stats.publishedBookCount} / ${stats.bookCount}`,
      subtext: `${stats.chapterCount} chapters, ${stats.passageCount} verses`,
      href: "/admin/books",
      icon: BookOpen,
      color: "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      title: "OCR Ingestion Queue",
      value: stats.ocrQueuedCount > 0 ? `${stats.ocrQueuedCount} Active` : "Idle",
      subtext: `${stats.pendingProofreadCount} pages awaiting proofreading`,
      href: "/admin/ocr",
      icon: ScanText,
      color: stats.ocrQueuedCount > 0 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      title: "Family Network",
      value: stats.familyCount.toLocaleString(),
      subtext: `${stats.pendingInvitesCount} pending email invites`,
      href: "/admin/family",
      icon: HeartHandshake,
      color: "bg-rose-50 text-rose-700 border-rose-200",
    },
    {
      title: "Astro AI & RAG",
      value: stats.aiConversationsCount.toLocaleString(),
      subtext: "Vedic source citations active",
      href: "/admin/astro-ai",
      icon: Bot,
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      title: "Quiz Attempts",
      value: stats.quizAttemptCount.toLocaleString(),
      subtext: `${stats.quizzesTotal} live interactive quizzes`,
      href: "/admin/quizzes",
      icon: Award,
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner & Date Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#13382c] text-[#d4a359] text-xs font-semibold tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gurukul Central Administration</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-stone-900">Platform Overview</h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time analytics and management operations directly backed by PostgreSQL.
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="inline-flex p-1 rounded-2xl bg-stone-200/70 border border-stone-300/80 text-xs font-semibold">
          {[
            { id: "today", label: "Today" },
            { id: "7d", label: "Last 7 Days" },
            { id: "30d", label: "Last 30 Days" },
            { id: "all", label: "All Time" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleRangeChange(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                range === tab.id
                  ? "bg-white text-stone-900 shadow-xs font-bold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs hover:shadow-md hover:border-[#d4a359] transition flex flex-col justify-between space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl border ${card.color} transition-transform group-hover:scale-105`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-3xl font-black font-serif text-stone-900">
                  {card.value}
                </span>
                <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                  <span>{card.subtext}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-[#13382c] group-hover:text-amber-800">
                <span>Manage {card.title}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#d4a359]" />
          <span>Quick Administrative Actions</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          <Link
            href="/admin/action-center"
            className="p-3.5 rounded-2xl border border-stone-200 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50 transition flex flex-col items-center justify-center text-center gap-2"
          >
            <AlertTriangle className="w-5 h-5 text-amber-700" />
            <span className="text-xs font-semibold text-stone-800">Action Center</span>
          </Link>

          <Link
            href="/admin/system-health"
            className="p-3.5 rounded-2xl border border-stone-200 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50 transition flex flex-col items-center justify-center text-center gap-2"
          >
            <Activity className="w-5 h-5 text-emerald-700" />
            <span className="text-xs font-semibold text-stone-800">System Health</span>
          </Link>

          <Link
            href="/admin/books"
            className="p-3.5 rounded-2xl border border-stone-200 hover:border-[#d4a359] bg-stone-50/60 hover:bg-stone-50 transition flex flex-col items-center justify-center text-center gap-2"
          >
            <BookOpen className="w-5 h-5 text-amber-700" />
            <span className="text-xs font-semibold text-stone-800">Upload Book</span>
          </Link>

          <Link
            href="/admin/ocr"
            className="p-3.5 rounded-2xl border border-stone-200 hover:border-[#d4a359] bg-stone-50/60 hover:bg-stone-50 transition flex flex-col items-center justify-center text-center gap-2"
          >
            <ScanText className="w-5 h-5 text-emerald-700" />
            <span className="text-xs font-semibold text-stone-800">OCR Review</span>
          </Link>

          <Link
            href="/admin/users"
            className="p-3.5 rounded-2xl border border-stone-200 hover:border-[#d4a359] bg-stone-50/60 hover:bg-stone-50 transition flex flex-col items-center justify-center text-center gap-2"
          >
            <Users className="w-5 h-5 text-blue-700" />
            <span className="text-xs font-semibold text-stone-800">Manage Roles</span>
          </Link>

          <Link
            href="/admin/quizzes"
            className="p-3.5 rounded-2xl border border-stone-200 hover:border-[#d4a359] bg-stone-50/60 hover:bg-stone-50 transition flex flex-col items-center justify-center text-center gap-2"
          >
            <Award className="w-5 h-5 text-purple-700" />
            <span className="text-xs font-semibold text-stone-800">New Quiz</span>
          </Link>

          <Link
            href="/admin/astrology"
            className="p-3.5 rounded-2xl border border-stone-200 hover:border-[#d4a359] bg-stone-50/60 hover:bg-stone-50 transition flex flex-col items-center justify-center text-center gap-2"
          >
            <Compass className="w-5 h-5 text-rose-700" />
            <span className="text-xs font-semibold text-stone-800">Panchang</span>
          </Link>

          <Link
            href="/admin/settings"
            className="p-3.5 rounded-2xl border border-stone-200 hover:border-[#d4a359] bg-stone-50/60 hover:bg-stone-50 transition flex flex-col items-center justify-center text-center gap-2"
          >
            <Shield className="w-5 h-5 text-stone-700" />
            <span className="text-xs font-semibold text-stone-800">Platform Config</span>
          </Link>
        </div>
      </div>

      {/* Real Audit Activity Stream */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h2 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-700" />
              <span>Recent Administrative Audit Events</span>
            </h2>
            <p className="text-xs text-stone-500">Live immutable activity logged to database</p>
          </div>
          <Link
            href="/admin/audit-logs"
            className="text-xs font-semibold text-[#13382c] hover:underline flex items-center gap-1"
          >
            <span>View All Logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400">
            No administrative events recorded yet in this timeframe.
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {recentLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold shrink-0 ${
                      log.status === "SUCCESS"
                        ? "bg-emerald-100 text-emerald-800"
                        : log.status === "FAILED"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {log.action}
                  </span>
                  <div className="truncate">
                    <span className="font-semibold text-stone-900">{log.actorEmail}</span>
                    <span className="text-stone-400 ml-2">({log.targetResource} {log.targetId ? `ID: ${log.targetId.slice(0, 8)}...` : ""})</span>
                  </div>
                </div>

                <div className="text-stone-400 font-mono text-[11px] shrink-0" suppressHydrationWarning>
                  {formatTime(log.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
