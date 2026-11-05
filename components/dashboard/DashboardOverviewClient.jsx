"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Mail,
  Sparkles,
  Edit,
  Shield,
  ArrowRight,
  Compass,
  BookOpen,
  Award,
} from "lucide-react";
import UserProfileModal from "./UserProfileModal";

export default function DashboardOverviewClient({
  initialUser,
  familyCount,
  pendingInvitesCount,
  kundliCount,
}) {
  const [user, setUser] = useState(initialUser);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  return (
    <>
      {/* Profile Overview & Family Circle Hero Card */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-100">
          {/* User Identity */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#13382c] text-[#d4a359] flex items-center justify-center font-bold text-2xl font-serif shadow-sm shrink-0 border-2 border-[#d4a359]/30">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                user?.name?.charAt(0).toUpperCase() || "U"
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold font-serif text-stone-900">
                  {user?.name || "Student"}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                  {user?.role || "USER"}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 mt-2">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  Timezone: {user?.timezone || "Asia/Kolkata"}
                </span>
                <span>•</span>
                <span>Language: {user?.locale?.toUpperCase() || "EN"}</span>
              </div>
            </div>
          </div>

          {/* Edit Profile Action */}
          <button
            onClick={() => setProfileModalOpen(true)}
            className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-2 transition cursor-pointer self-start md:self-auto"
          >
            <Edit className="w-3.5 h-3.5 text-[#d4a359]" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Quick Family & Astrology Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Family Circle Card */}
          <Link
            href="/dashboard/family"
            className="p-4 rounded-2xl bg-[#fdfbf7] border border-stone-200 hover:border-[#d4a359] hover:bg-[#faf6ec] transition group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#13382c]/10 text-[#13382c] flex items-center justify-center">
                <Users className="w-5 h-5 text-[#13382c]" />
              </div>
              <div>
                <span className="text-lg font-bold text-stone-900 block leading-tight">
                  {familyCount} Member{familyCount === 1 ? "" : "s"}
                </span>
                <span className="text-[11px] text-stone-500">Family Circle</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#13382c] group-hover:translate-x-0.5 transition" />
          </Link>

          {/* Pending Invitations Card */}
          <Link
            href="/dashboard/family"
            className="p-4 rounded-2xl bg-[#fdfbf7] border border-stone-200 hover:border-amber-400 hover:bg-[#faf6ec] transition group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Mail className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <span className="text-lg font-bold text-stone-900 block leading-tight">
                  {pendingInvitesCount} Pending
                </span>
                <span className="text-[11px] text-stone-500">Email Invitations</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-800 group-hover:translate-x-0.5 transition" />
          </Link>

          {/* Saved Kundlis Card */}
          <Link
            href="/astrology?tab=kundli"
            className="p-4 rounded-2xl bg-[#fdfbf7] border border-stone-200 hover:border-[#d4a359] hover:bg-[#faf6ec] transition group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <span className="text-lg font-bold text-stone-900 block leading-tight">
                  {kundliCount} Saved
                </span>
                <span className="text-[11px] text-stone-500">Vedic Kundlis</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-purple-800 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        {/* Quick Actions Strip */}
        <div className="pt-4 border-t border-stone-100">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-2.5">
            Quick Actions
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
            <Link
              href="/dashboard/family"
              className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-stone-100 hover:border-[#d4a359] text-stone-800 font-semibold transition text-center flex flex-col items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4 text-[#13382c]" />
              <span>Add Family</span>
            </Link>

            <Link
              href="/dashboard/family"
              className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-stone-100 hover:border-[#d4a359] text-stone-800 font-semibold transition text-center flex flex-col items-center justify-center gap-1.5"
            >
              <Mail className="w-4 h-4 text-amber-700" />
              <span>Invite Member</span>
            </Link>

            <Link
              href="/ai/chat"
              className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-stone-100 hover:border-[#d4a359] text-stone-800 font-semibold transition text-center flex flex-col items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-[#d4a359]" />
              <span>Astro AI</span>
            </Link>

            <Link
              href="/library"
              className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-stone-100 hover:border-[#d4a359] text-stone-800 font-semibold transition text-center flex flex-col items-center justify-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-blue-700" />
              <span>Library</span>
            </Link>

            <Link
              href="/dashboard/progress"
              className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-stone-100 hover:border-[#d4a359] text-stone-800 font-semibold transition text-center flex flex-col items-center justify-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-emerald-700" />
              <span>My Progress</span>
            </Link>

            <Link
              href="/quiz"
              className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-stone-100 hover:border-[#d4a359] text-stone-800 font-semibold transition text-center flex flex-col items-center justify-center gap-1.5"
            >
              <Award className="w-4 h-4 text-purple-700" />
              <span>Take Quiz</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
        onProfileUpdated={(updated) => setUser(updated)}
      />
    </>
  );
}
