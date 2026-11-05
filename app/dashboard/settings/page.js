import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import SettingsClient from "@/components/dashboard/SettingsClient";

export const metadata = {
  title: "Account Settings | Gurukul",
  description: "Configure your astrological ephemeris, privacy preferences, and security settings.",
};

export default async function SettingsPage() {
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
        isPublicLeaderboard: true,
      },
    });
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <SettingsClient initialUser={user} />
    </div>
  );
}
