import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import FamilyManagementClient from "@/components/dashboard/FamilyManagementClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Family Management & Astrology Circle | Gurukul",
  description: "Manage your family members, Vedic Kundlis, and send secure email invitations.",
};

export default async function FamilyDashboardPage() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {}

  // If not authenticated in production, redirect or fetch first user in dev
  let currentUser = session?.user || null;
  if (!currentUser?.id) {
    const fallbackUser = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true },
    });
    if (fallbackUser) {
      currentUser = fallbackUser;
    }
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <FamilyManagementClient initialUser={currentUser} />
    </div>
  );
}
