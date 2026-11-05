import prisma from "@/lib/prisma";
import FamilyManagementAdminClient from "@/components/admin/FamilyManagementAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminFamilyPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const tab = resolvedParams?.tab || "members";
  const limit = 20;

  const [
    totalMembers,
    totalLinked,
    totalPendingInvites,
    totalAcceptedInvites,
    totalRevokedInvites,
    initialMembers,
    initialInvitations,
    totalCount,
  ] = await Promise.all([
    prisma.familyMember.count({ where: { isArchived: false } }),
    prisma.familyMember.count({ where: { linkedUserId: { not: null } } }),
    prisma.familyInvitation.count({ where: { status: "PENDING" } }),
    prisma.familyInvitation.count({ where: { status: "ACCEPTED" } }),
    prisma.familyInvitation.count({ where: { status: "REVOKED" } }),
    tab === "members"
      ? prisma.familyMember.findMany({
          where: { isArchived: false },
          include: {
            owner: { select: { id: true, name: true, email: true } },
            linkedUser: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
          take: limit,
        })
      : Promise.resolve([]),
    tab === "invitations"
      ? prisma.familyInvitation.findMany({
          include: {
            inviter: { select: { id: true, name: true, email: true } },
            familyMember: { select: { id: true, name: true, relationship: true } },
          },
          orderBy: { createdAt: "desc" },
          take: limit,
        })
      : Promise.resolve([]),
    tab === "members"
      ? prisma.familyMember.count({ where: { isArchived: false } })
      : prisma.familyInvitation.count(),
  ]);

  const initialData = {
    tab,
    stats: {
      totalMembers,
      totalLinked,
      totalPendingInvites,
      totalAcceptedInvites,
      totalRevokedInvites,
    },
    members: initialMembers,
    invitations: initialInvitations,
    pagination: {
      total: totalCount,
      page: 1,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  };

  return <FamilyManagementAdminClient initialData={initialData} />;
}
