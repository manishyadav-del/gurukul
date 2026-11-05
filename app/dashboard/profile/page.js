import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ProfileClient from "@/components/dashboard/ProfileClient";

export const metadata = {
  title: "My Profile | Gurukul",
  description: "View and edit your personal profile and astrology birth details.",
};

export default async function ProfilePage() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {}

  let user = null;
  if (session?.user?.id) {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        locale: true,
        timezone: true,
        avatarUrl: true,
        dateOfBirth: true,
        birthTime: true,
        birthPlace: true,
        gender: true,
        totalXp: true,
        level: true,
        currentStreak: true,
      },
    });
  }

  if (!user) {
    const firstUser = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        locale: true,
        timezone: true,
        avatarUrl: true,
        dateOfBirth: true,
        birthTime: true,
        birthPlace: true,
        gender: true,
        totalXp: true,
        level: true,
        currentStreak: true,
      },
    });
    user = firstUser;
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <ProfileClient initialUser={user} />
    </div>
  );
}
