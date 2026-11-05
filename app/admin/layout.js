import { getAuthenticatedAdmin } from "@/server/admin/auth";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Console | Gurukul Astrology",
  description: "Administrative control center for Gurukul Astrology, digital manuscripts, OCR, and user management.",
};

export default async function AdminLayout({ children }) {
  let initialAdmin = null;
  try {
    const adminContext = await getAuthenticatedAdmin();
    if (adminContext) {
      initialAdmin = {
        id: adminContext.user.id,
        name: adminContext.user.name,
        email: adminContext.user.email,
        role: adminContext.role,
        avatarUrl: adminContext.user.avatarUrl,
        permissions: adminContext.permissions,
      };
    }
  } catch {}

  return (
    <AdminLayoutClient initialAdmin={initialAdmin}>
      {children}
    </AdminLayoutClient>
  );
}
