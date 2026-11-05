"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  BookOpen,
  ScanText,
  Compass,
  Bot,
  GraduationCap,
  Award,
  BarChart3,
  FileCheck,
  Settings,
  ArrowLeft,
  LogOut,
  Shield,
  Layers,
  AlertTriangle,
  Activity,
  Network,
} from "lucide-react";

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/action-center", label: "Action Center", icon: AlertTriangle },
  { href: "/admin/users", label: "Users & Roles", icon: Users },
  { href: "/admin/family", label: "Family Circles", icon: HeartHandshake },
  { href: "/admin/books", label: "Books & Library", icon: BookOpen },
  { href: "/admin/content-quality", label: "Content Quality", icon: FileCheck },
  { href: "/admin/ocr", label: "OCR Operations", icon: ScanText },
  { href: "/admin/astrology", label: "Astrology & Panchang", icon: Compass },
  { href: "/admin/astro-ai", label: "Astro AI & RAG", icon: Bot },
  { href: "/admin/knowledge-graph", label: "Knowledge Graph", icon: Network },
  { href: "/admin/learn", label: "Learn Curriculum", icon: GraduationCap },
  { href: "/admin/quizzes", label: "Quizzes", icon: Award },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: FileCheck },
  { href: "/admin/system-health", label: "System Health", icon: Activity },
  { href: "/admin/settings", label: "Platform Settings", icon: Settings },
];

export default function AdminSidebar({ user, onLogout, isCollapsed, onToggleCollapse }) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 bg-[#13382c] text-white flex flex-col transition-all duration-300 border-r border-[#1a4a3a] shadow-xl ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header / Brand */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#1f5442] bg-[#0e2c22]">
        <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4a359] to-[#b3833b] flex items-center justify-center shrink-0 shadow-md text-stone-950 font-serif font-black text-xl">
            ग
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-serif font-bold text-base tracking-wide text-amber-100 truncate">
                Gurukul Admin
              </span>
              <span className="text-[10px] text-emerald-300/80 uppercase font-semibold tracking-wider">
                Control Console
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-emerald-900">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-[#d4a359] text-stone-950 font-semibold shadow-sm"
                  : "text-emerald-100/80 hover:bg-[#1b4b3c] hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-stone-950" : "text-amber-300/80"}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile & Exit */}
      <div className="p-3 border-t border-[#1f5442] bg-[#0e2c22]/80 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-emerald-200/70 hover:text-white hover:bg-[#1b4b3c] transition"
          title="Return to Student App"
        >
          <ArrowLeft className="w-4 h-4 shrink-0 text-amber-300" />
          {!isCollapsed && <span>View Main App</span>}
        </Link>

        {user && (
          <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 flex items-center justify-center text-xs font-bold shrink-0">
                {user.name ? user.name[0].toUpperCase() : "A"}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-stone-200 truncate">{user.name || "Admin"}</span>
                  <span className="text-[10px] text-amber-300/90 font-mono truncate">{user.role}</span>
                </div>
              )}
            </div>

            {!isCollapsed && onLogout && (
              <button
                onClick={onLogout}
                title="Log Out Admin"
                className="p-1.5 rounded-lg text-emerald-300 hover:text-red-300 hover:bg-red-950/40 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
