"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Search,
  Bell,
  Menu,
  X,
  Sparkles,
  Users,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  LogIn,
  UserPlus,
  Compass,
  Bot,
  Feather,
} from "lucide-react";

function NavbarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Auth modal state for logged-out users
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const dropdownRef = useRef(null);

  // Fetch session profile on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { authenticated: false, user: null }))
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  async function handleLogout() {
    setProfileDropdownOpen(false);
    try {
      await signOut({ redirect: false });
    } catch {}
    setUser(null);
    router.push("/");
    router.refresh();
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authTab === "register") {
        const regRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: authName.trim() || "Gurukul Seeker",
            email: authEmail.trim(),
            password: authPassword,
          }),
        });

        const regData = await regRes.json();
        if (!regRes.ok) throw new Error(regData.error || "Registration failed");
      }

      // NextAuth Credentials login
      const { signIn } = await import("next-auth/react");
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: authEmail.trim(),
        password: authPassword,
      });

      if (signInRes?.error) {
        throw new Error(signInRes.error || "Invalid email or password");
      }

      setAuthModalOpen(false);
      setAuthPassword("");

      // Refresh me
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (meData.authenticated && meData.user) {
        setUser(meData.user);
      }
      router.refresh();
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Astro AI", href: "/ai/chat" },
    { name: "Explorer", href: "/explore" },
    { name: "Library", href: "/library" },
    { name: "Learn", href: "/dashboard" },
    { name: "Quizzes", href: "/quiz" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#13382c] border-b border-[#0f2e24] text-white shadow-xs">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            {/* Golden Vedic Lotus / Sun Icon */}
            <div className="w-8 h-8 rounded-full bg-[#d4a359] flex items-center justify-center text-[#13382c] shadow-xs group-hover:scale-105 transition-transform">
              <svg
                className="w-5 h-5 text-[#13382c]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L13.8 7.2H19.2L14.8 10.4L16.5 15.6L12 12.4L7.5 15.6L9.2 10.4L4.8 7.2H10.2L12 2Z" />
                <circle cx="12" r="2.5" cy="18" />
                <path
                  d="M7 21C9 19 15 19 17 21"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
                Gurukul
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (EXACTLY FIVE ITEMS) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              let isActive = false;
              if (link.href === "/") {
                isActive = pathname === "/";
              } else {
                isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              }

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition ${
                    isActive
                      ? "text-[#f3caa1] font-semibold border-b-2 border-[#d4a359] rounded-b-none"
                      : "text-stone-200 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Area: Search Bar, Notifications, User Profile Dropdown */}
          <div className="flex items-center gap-3">
            {/* Search Input Pill */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden lg:flex items-center relative w-56 xl:w-64"
            >
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search books, topics..."
                className="w-full bg-white text-stone-800 placeholder-stone-400 text-xs pl-8 pr-3 py-1.5 rounded-full border-none shadow-inner focus:outline-none focus:ring-2 focus:ring-[#d4a359]"
              />
            </form>

            {/* Notification Bell */}
            <button
              aria-label="Notifications"
              className="w-8 h-8 rounded-full flex items-center justify-center text-stone-200 hover:text-white transition relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-[#d4a359] absolute top-1.5 right-1.5" />
            </button>

            {/* User Profile Dropdown or Login / Sign Up */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
                  title="Open user profile menu"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#d4a359] text-[#13382c] font-bold text-xs shadow-xs border border-white/20">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <ChevronDown className="w-3 h-3 text-stone-300 hidden sm:block" />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200/90 py-2 z-50 text-stone-800 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User info banner */}
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {user.name || "Student"}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                    </div>

                    {/* Navigation Items (PER SPECIFICATION) */}
                    <div className="py-1 text-xs">
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-stone-50 text-stone-700 hover:text-[#13382c] transition font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4 text-stone-500" />
                        <span>My Dashboard</span>
                      </Link>

                      <Link
                        href="/astrology/my-dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-stone-50 text-stone-700 hover:text-[#13382c] transition font-medium"
                      >
                        <Sparkles className="w-4 h-4 text-[#d4a359]" />
                        <span>Personal Astrology</span>
                      </Link>

                      <Link
                        href="/astrology/ai-assistant"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-stone-50 text-stone-700 hover:text-[#13382c] transition font-medium"
                      >
                        <Bot className="w-4 h-4 text-[#d4a359]" />
                        <span>AI Jyotish Assistant</span>
                      </Link>

                      <Link
                        href="/explore"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-stone-50 text-stone-700 hover:text-[#13382c] transition font-medium"
                      >
                        <Compass className="w-4 h-4 text-[#d4a359]" />
                        <span>Knowledge Explorer</span>
                      </Link>

                      <Link
                        href="/sanskrit"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-stone-50 text-stone-700 hover:text-[#13382c] transition font-medium"
                      >
                        <Feather className="w-4 h-4 text-[#d4a359]" />
                        <span>Sanskrit Shastra Studio</span>
                      </Link>

                      <Link
                        href="/dashboard/family"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-stone-50 text-stone-700 hover:text-[#13382c] transition font-medium"
                      >
                        <Users className="w-4 h-4 text-[#d4a359]" />
                        <span>My Family</span>
                      </Link>

                      <Link
                        href="/dashboard/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-stone-50 text-stone-700 hover:text-[#13382c] transition font-medium"
                      >
                        <User className="w-4 h-4 text-stone-500" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        href="/dashboard/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-stone-50 text-stone-700 hover:text-[#13382c] transition font-medium"
                      >
                        <Settings className="w-4 h-4 text-stone-500" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    {/* Logout Option */}
                    <div className="pt-1 border-t border-stone-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Logged Out Actions */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthTab("login");
                    setAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-stone-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setAuthTab("register");
                    setAuthModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#d4a359] text-[#13382c] hover:bg-[#dfb16b] shadow-xs transition cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-stone-200 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#1b4d3d] space-y-3">
            <form onSubmit={handleSearchSubmit} className="px-1">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search books, topics..."
                  className="w-full bg-white text-stone-800 text-xs pl-9 pr-3 py-2 rounded-full"
                />
              </div>
            </form>

            {/* 5 Main Nav Items */}
            <div className="grid grid-cols-2 gap-1.5 px-1">
              {navLinks.map((link) => {
                const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium ${
                      isActive
                        ? "bg-[#d4a359] text-[#13382c] font-bold"
                        : "text-stone-200 hover:bg-white/10"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Mobile User Section */}
            {user ? (
              <div className="pt-2 border-t border-[#1b4d3d] px-1 space-y-1">
                <div className="px-3 py-1.5 text-xs text-[#f3caa1] font-bold">
                  Account: {user.name}
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-1.5 rounded-lg text-xs text-stone-200 hover:bg-white/10"
                >
                  My Dashboard
                </Link>
                <Link
                  href="/astrology/my-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-1.5 rounded-lg text-xs text-[#f3caa1] hover:bg-white/10 font-medium"
                >
                  Personal Astrology
                </Link>
                <Link
                  href="/dashboard/family"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-1.5 rounded-lg text-xs text-stone-200 hover:bg-white/10"
                >
                  My Family
                </Link>
                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-1.5 rounded-lg text-xs text-stone-200 hover:bg-white/10"
                >
                  My Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-1.5 rounded-lg text-xs text-stone-200 hover:bg-white/10"
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-rose-300 hover:bg-white/10 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-[#1b4d3d] px-1 flex gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthTab("login");
                    setAuthModalOpen(true);
                  }}
                  className="flex-1 py-2 text-center rounded-lg text-xs font-bold text-stone-200 bg-white/10"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthTab("register");
                    setAuthModalOpen(true);
                  }}
                  className="flex-1 py-2 text-center rounded-lg text-xs font-bold bg-[#d4a359] text-[#13382c]"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Auth Modal for Login / Sign Up */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-5 text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-bold font-serif text-[#13382c]">
                {authTab === "login" ? "Sign In to Gurukul" : "Create Gurukul Account"}
              </h3>
              <button
                onClick={() => setAuthModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm p-1"
              >
                ✕
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {authError}
              </div>
            )}

            <div className="flex border-b border-stone-200 pb-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAuthTab("login")}
                className={`flex-1 pb-1 text-center transition ${
                  authTab === "login"
                    ? "text-[#13382c] border-b-2 border-[#13382c] font-bold"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthTab("register")}
                className={`flex-1 pb-1 text-center transition ${
                  authTab === "register"
                    ? "text-[#13382c] border-b-2 border-[#13382c] font-bold"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-xs">
              {authTab === "register" && (
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Manish Kumar"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#d4a359] outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#d4a359] outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#d4a359] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 rounded-xl bg-[#13382c] hover:bg-[#194939] text-white font-semibold transition disabled:opacity-50"
              >
                {authLoading ? "Processing..." : authTab === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<header className="h-16 bg-[#13382c]" />}>
      <NavbarContent />
    </Suspense>
  );
}
