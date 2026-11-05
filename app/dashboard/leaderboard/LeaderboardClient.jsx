"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Flame,
  Award,
  Shield,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Medal,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

export default function LeaderboardClient({
  initialType = "all-time",
  initialData = {},
  currentUserId = null,
}) {
  const [type, setType] = useState(initialType);
  const [page, setPage] = useState(initialData.page || 1);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(
    initialData.currentUserRank?.isPublicLeaderboard !== false
  );
  const [togglingPrivacy, setTogglingPrivacy] = useState(false);

  async function fetchLeaderboard(targetType, targetPage) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/gamification/leaderboard?type=${targetType}&page=${targetPage}&limit=20`
      );
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setType(targetType);
        setPage(targetPage);
        if (json.currentUserRank) {
          setIsPublic(json.currentUserRank.isPublicLeaderboard !== false);
        }
      }
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTogglePrivacy() {
    setTogglingPrivacy(true);
    const newSetting = !isPublic;
    try {
      const res = await fetch("/api/gamification/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublicLeaderboard: newSetting }),
      });
      if (res.ok) {
        setIsPublic(newSetting);
        // Refresh leaderboard
        fetchLeaderboard(type, page);
      }
    } catch (err) {
      console.error("Failed to update privacy:", err);
    } finally {
      setTogglingPrivacy(false);
    }
  }

  const { leaderboard = [], currentUserRank = null, totalPages = 1 } = data;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back to Dashboard */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Learning Dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-700" />
            <span>Gurukul Leaderboard</span>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 font-serif">
            Scriptural Scholar Rankings
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Celebrating dedicated manuscript readers, active astrologers, and quiz masters.
          </p>
        </div>

        {/* Privacy Toggle */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-stone-900">Leaderboard Visibility</span>
            <span className="text-[11px] text-stone-500">
              {isPublic ? "Visible in public rankings" : "Hidden from public rankings"}
            </span>
          </div>
          <button
            onClick={handleTogglePrivacy}
            disabled={togglingPrivacy}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              isPublic
                ? "bg-stone-100 hover:bg-stone-200 text-stone-700"
                : "bg-amber-100 hover:bg-amber-200 text-amber-900"
            }`}
          >
            {isPublic ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-stone-600" />
                <span>Go Private</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-amber-700" />
                <span>Go Public</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Current User Standing Card */}
      {currentUserRank && (
        <div
          className={`rounded-2xl border p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            currentUserRank.optedOut
              ? "bg-stone-50 border-stone-300"
              : "bg-linear-to-r from-amber-500/10 via-amber-50 to-white border-amber-200"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg font-serif shrink-0 shadow-xs">
              {currentUserRank.optedOut ? "—" : `#${currentUserRank.rank}`}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900 text-base">Your Standing</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-600 text-white">
                  Level {currentUserRank.level}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                {currentUserRank.optedOut
                  ? "Your profile is private. You can earn XP and badges, but are not ranked publicly."
                  : `Ranked #${currentUserRank.rank} with ${currentUserRank.totalXp} XP, ${currentUserRank.currentStreak} day streak.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
            <div className="text-right">
              <span className="text-stone-500 block text-[10px] uppercase">Total XP</span>
              <span className="text-base font-bold text-amber-800 font-serif">
                {currentUserRank.totalXp}
              </span>
            </div>
            <div className="text-right border-l border-stone-200 pl-4">
              <span className="text-stone-500 block text-[10px] uppercase">Streak</span>
              <span className="text-base font-bold text-orange-600 flex items-center gap-1 justify-end">
                <Flame className="w-4 h-4 fill-orange-500 text-orange-600" />
                {currentUserRank.currentStreak}d
              </span>
            </div>
            <div className="text-right border-l border-stone-200 pl-4">
              <span className="text-stone-500 block text-[10px] uppercase">Badges</span>
              <span className="text-base font-bold text-stone-800 font-serif">
                {currentUserRank.badgesCount}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLeaderboard("all-time", 1)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              type === "all-time"
                ? "bg-amber-700 text-white shadow-xs"
                : "bg-white text-stone-600 hover:bg-stone-100"
            }`}
          >
            All-Time Scholars
          </button>
          <button
            onClick={() => fetchLeaderboard("weekly", 1)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              type === "weekly"
                ? "bg-amber-700 text-white shadow-xs"
                : "bg-white text-stone-600 hover:bg-stone-100"
            }`}
          >
            Weekly Champions
          </button>
        </div>

        <span className="text-xs text-stone-500">
          Showing Page {page} of {Math.max(1, totalPages)}
        </span>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-stone-500 text-sm">
            Updating rankings...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-16 text-center text-stone-400 text-sm">
            No public scholars recorded in this leaderboard yet.
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {leaderboard.map((scholar) => {
              const isCurrentUser = scholar.userId === currentUserId;
              const isTop3 = scholar.rank <= 3;

              return (
                <div
                  key={scholar.userId}
                  className={`px-6 py-4 flex items-center justify-between gap-4 transition ${
                    isCurrentUser ? "bg-amber-50/60" : "hover:bg-stone-50/70"
                  }`}
                >
                  {/* Left: Rank & Scholar Info */}
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div className="w-10 text-center shrink-0">
                      {scholar.rank === 1 ? (
                        <div className="w-8 h-8 mx-auto rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-sm shadow-xs">
                          🥇
                        </div>
                      ) : scholar.rank === 2 ? (
                        <div className="w-8 h-8 mx-auto rounded-full bg-stone-300 text-stone-900 flex items-center justify-center font-bold text-sm shadow-xs">
                          🥈
                        </div>
                      ) : scholar.rank === 3 ? (
                        <div className="w-8 h-8 mx-auto rounded-full bg-amber-700/70 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          🥉
                        </div>
                      ) : (
                        <span className="text-stone-500 font-bold text-sm">
                          #{scholar.rank}
                        </span>
                      )}
                    </div>

                    {/* Name & Title */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">
                          {scholar.name}
                        </span>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-200 text-amber-900 font-bold">
                            You
                          </span>
                        )}
                        <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-stone-100 text-stone-700">
                          Level {scholar.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-0.5">
                        <span className="flex items-center gap-1 text-orange-600">
                          <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                          {scholar.currentStreak} day streak
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-stone-600">
                          <Award className="w-3 h-3 text-amber-600" />
                          {scholar.badgesCount} badges
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: XP Score */}
                  <div className="text-right shrink-0">
                    <span className="text-lg font-bold text-stone-900 font-serif">
                      {scholar.totalXp}
                    </span>
                    <span className="text-xs text-stone-400 ml-1">XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => fetchLeaderboard(type, Math.max(1, page - 1))}
            disabled={page <= 1 || loading}
            className="px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 disabled:opacity-50 transition flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          <span className="text-xs text-stone-500 font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => fetchLeaderboard(type, Math.min(totalPages, page + 1))}
            disabled={page >= totalPages || loading}
            className="px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 disabled:opacity-50 transition flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
