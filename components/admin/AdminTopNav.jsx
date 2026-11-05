"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Bell,
  Search,
  Shield,
  LogOut,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

export default function AdminTopNav({
  user,
  onLogout,
  onToggleSidebar,
  unreadCount = 0,
}) {
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Construct breadcrumbs
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const label =
      segment.charAt(0).toUpperCase() +
      segment.slice(1).replace(/-/g, " ");
    return { href, label };
  });

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#fdfbf7]/95 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-2xs">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition lg:hidden"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="hidden sm:flex items-center gap-1.5 text-xs text-stone-500 overflow-hidden truncate">
          <Link
            href="/admin"
            className="hover:text-stone-900 font-semibold transition"
          >
            Admin
          </Link>
          {breadcrumbs.slice(1).map((crumb, idx) => (
            <div key={crumb.href} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-stone-400" />
              <Link
                href={crumb.href}
                className={`truncate hover:text-stone-900 transition ${
                  idx === breadcrumbs.length - 2
                    ? "text-[#13382c] font-bold"
                    : "text-stone-600"
                }`}
              >
                {crumb.label}
              </Link>
            </div>
          ))}
        </nav>
      </div>

      {/* Global Admin Search Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (searchQuery.trim()) {
            window.location.href = `/admin/search?q=${encodeURIComponent(searchQuery.trim())}`;
          }
        }}
        className="hidden md:flex items-center flex-1 max-w-sm relative mx-4"
      >
        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Global Admin Search (Books, Users, Quizzes)..."
          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#13382c]"
        />
      </form>

      {/* Right Actions: Notifications & User profile */}
      <div className="flex items-center gap-3">
        {/* Action Center Shortcut */}
        <Link
          href="/admin/action-center"
          className="p-2 rounded-xl text-stone-600 hover:text-amber-800 hover:bg-stone-100 transition hidden sm:inline-flex items-center gap-1 text-xs font-semibold"
          title="Open Action Center"
        >
          <AlertTriangle className="w-4 h-4 text-amber-700" />
          <span className="hidden xl:inline">Action Center</span>
        </Link>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-stone-200 shadow-xl py-3 z-50 text-xs">
              <div className="px-4 pb-2 border-b border-stone-100 flex items-center justify-between">
                <span className="font-bold text-stone-900">System Notifications</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                  {unreadCount} unread
                </span>
              </div>

              <div className="divide-y divide-stone-100 max-h-64 overflow-y-auto">
                <div className="p-3 hover:bg-stone-50 transition flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-stone-900">OCR Engine Online</p>
                    <p className="text-stone-500 text-[11px] mt-0.5">
                      Devanagari model ready for high-resolution manuscript processing.
                    </p>
                  </div>
                </div>
                <div className="p-3 hover:bg-stone-50 transition flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-stone-900">Security Guard Active</p>
                    <p className="text-stone-500 text-[11px] mt-0.5">
                      Session tokens rotated and token reuse detection enabled.
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-4 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                <Link
                  href="/admin/action-center"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-amber-800 hover:underline font-semibold"
                >
                  Action Center →
                </Link>
                <Link
                  href="/admin/audit-logs"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-stone-500 hover:text-[#13382c] font-semibold"
                >
                  Audit Logs →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        {user && (
          <div className="flex items-center gap-2 pl-3 border-l border-stone-200">
            <div className="w-8 h-8 rounded-full bg-[#13382c] text-[#d4a359] flex items-center justify-center font-bold text-xs shadow-2xs">
              {user.name ? user.name[0].toUpperCase() : "A"}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-stone-900 leading-tight">
                {user.name || "Administrator"}
              </span>
              <span className="text-[10px] text-amber-700 font-mono font-semibold">
                {user.role}
              </span>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                title="Log out"
                className="p-1.5 ml-1 rounded-lg text-stone-400 hover:text-red-700 hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
