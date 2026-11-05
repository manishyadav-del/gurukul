import prisma from "@/lib/prisma";
import UserManagementClient from "@/components/admin/UserManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams?.page || "1", 10));
  const limit = 20;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        totalXp: true,
        level: true,
        currentStreak: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            readingProgress: true,
            quizAttempts: true,
            bookmarks: true,
            notes: true,
            ownedFamilyMembers: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count(),
  ]);

  return (
    <UserManagementClient
      initialUsers={users}
      initialPagination={{
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }}
    />
  );
}
