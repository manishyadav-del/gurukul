"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import AdminTopNav from "./AdminTopNav";

export default function AdminLayoutClient({ children, initialAdmin }) {
  const pathname = usePathname();
  const router = useRouter();

  const [adminUser, setAdminUser] = useState(initialAdmin || null);
  const [loading, setLoading] = useState(!initialAdmin);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      if (isLoginPage) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/admin/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setAdminUser(data.user);
            setUnreadCount(data.unreadNotificationsCount || 0);
          }
        } else {
          if (isMounted) {
            router.push(`/admin/login?next=${encodeURIComponent(pathname)}`);
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        if (isMounted) {
          router.push(`/admin/login?next=${encodeURIComponent(pathname)}`);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {}
    setAdminUser(null);
    router.push("/admin/login");
    router.refresh();
  };

  // If on login page, render clean container without sidebar/topnav
  if (isLoginPage) {
    return <main className="min-h-screen bg-[#f8f4eb]">{children}</main>;
  }

  // Loading skeleton state
  if (loading && !adminUser) {
    return (
      <div className="min-h-screen bg-[#f8f4eb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#13382c] text-[#d4a359] flex items-center justify-center font-serif text-2xl font-bold animate-pulse shadow-md">
            ग
          </div>
          <p className="text-xs font-semibold text-stone-600">Verifying administrator clearance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f4eb] flex">
      {/* Persistent Sidebar */}
      <AdminSidebar
        user={adminUser}
        onLogout={handleLogout}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? "pl-20" : "pl-64"
        }`}
      >
        <AdminTopNav
          user={adminUser}
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          unreadCount={unreadCount}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
