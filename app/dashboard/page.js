import Link from "next/link";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLearningDashboardData } from "@/server/learning/dashboard";
import DashboardOverviewClient from "@/components/dashboard/DashboardOverviewClient";
import PersonalizedLearningDashboardClient from "@/components/dashboard/PersonalizedLearningDashboardClient";
import {
  Users,
  Trophy,
  Award,
} from "lucide-react";

export const metadata = {
  title: "Learning Dashboard & Recommendations - Gurukul",
  description:
    "Personalized learning dashboard, structured paths, and explainable shastric recommendations.",
};

export default async function DashboardPage() {
  let userId = null;
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) userId = session.user.id;
  } catch {}

  const [
    dashboardData,
    familyCount,
    pendingInvitesCount,
    kundliCount,
    numerologyCount,
    readingCount,
  ] = await Promise.all([
    getLearningDashboardData(userId),
    userId
      ? prisma.familyMember.count({
          where: {
            OR: [{ ownerId: userId }, { linkedUserId: userId }],
            isArchived: false,
          },
        }).catch(() => 0)
      : 0,
    userId
      ? prisma.familyInvitation.count({
          where: {
            inviterId: userId,
            status: "PENDING",
            expiresAt: { gt: new Date() },
          },
        }).catch(() => 0)
      : 0,
    userId
      ? prisma.birthProfile.count({
          where: { userId },
        }).catch(() => 0)
      : 0,
    userId
      ? prisma.numerologyReport.count({
          where: { userId },
        }).catch(() => 0)
      : 0,
    userId
      ? prisma.readingProgress.count({
          where: { userId },
        }).catch(() => 0)
      : 0,
  ]);

  const { user, summary } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Student & Reader Hub</span>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 font-serif">
            User & Learning Dashboard
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Welcome back, {user?.name || "Student"}. Manage your profile, family circle, and personalized learning paths.
          </p>
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/family"
            className="px-3.5 py-1.5 rounded-lg border border-[#d4a359] bg-[#fdfbf7] hover:bg-[#faf6ec] text-xs font-semibold text-[#13382c] transition flex items-center gap-1.5 shadow-xs"
          >
            <Users className="w-3.5 h-3.5 text-[#d4a359]" />
            <span>Family Circle ({familyCount})</span>
          </Link>
          <Link
            href="/dashboard/leaderboard"
            className="px-3.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs font-semibold text-amber-900 transition flex items-center gap-1.5"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-700" />
            <span>Leaderboard</span>
          </Link>
          <Link
            href="/dashboard/bookmarks"
            className="px-3.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition"
          >
            Bookmarks ({summary?.totalBookmarks || 0})
          </Link>
          <Link
            href="/dashboard/notes"
            className="px-3.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition"
          >
            Notes & Highlights ({(summary?.totalNotes || 0) + (summary?.totalHighlights || 0)})
          </Link>
          <Link
            href="/quiz"
            className="px-3.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition flex items-center gap-1.5"
          >
            <Award className="w-3.5 h-3.5 text-stone-700" />
            <span>Quizzes</span>
          </Link>
        </div>
      </div>

      {/* User Profile & Family Circle Overview Banner */}
      <DashboardOverviewClient
        initialUser={user}
        familyCount={familyCount}
        pendingInvitesCount={pendingInvitesCount}
        kundliCount={kundliCount}
        numerologyCount={numerologyCount}
        readingCount={readingCount}
      />

      {/* Personalized Learning & Recommendation Engine Client */}
      <PersonalizedLearningDashboardClient initialData={dashboardData} />
    </div>
  );
}
