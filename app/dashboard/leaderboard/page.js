import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getLeaderboard } from "@/server/gamification/engine";
import LeaderboardClient from "./LeaderboardClient";

export default async function LeaderboardPage() {
  let userId = null;
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) userId = session.user.id;
  } catch {}

  if (!userId) {
    const firstUser = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
    });
    if (firstUser) userId = firstUser.id;
  }

  const initialData = await getLeaderboard({
    type: "all-time",
    page: 1,
    limit: 20,
    currentUserId: userId,
  });

  return (
    <LeaderboardClient
      initialType="all-time"
      initialData={initialData}
      currentUserId={userId}
    />
  );
}
