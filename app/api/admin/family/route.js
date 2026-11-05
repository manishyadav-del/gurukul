import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/server/admin/auth";
import { PERMISSIONS } from "@/server/admin/permissions";
import { logAdminActivity } from "@/server/admin/audit";

export async function GET(request) {
  const auth = await requireAdmin(request, PERMISSIONS.FAMILY_READ);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const tab = searchParams.get("tab") || "members"; // "members" | "invitations"
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = 20;
    const skip = (page - 1) * limit;

    // Aggregated stats
    const [
      totalMembers,
      totalLinked,
      totalPendingInvites,
      totalAcceptedInvites,
      totalRevokedInvites,
    ] = await Promise.all([
      prisma.familyMember.count({ where: { isArchived: false } }),
      prisma.familyMember.count({ where: { linkedUserId: { not: null } } }),
      prisma.familyInvitation.count({ where: { status: "PENDING" } }),
      prisma.familyInvitation.count({ where: { status: "ACCEPTED" } }),
      prisma.familyInvitation.count({ where: { status: "REVOKED" } }),
    ]);

    const stats = {
      totalMembers,
      totalLinked,
      totalPendingInvites,
      totalAcceptedInvites,
      totalRevokedInvites,
    };

    if (tab === "invitations") {
      const inviteWhere = {};
      if (search) {
        inviteWhere.OR = [
          { invitedEmail: { contains: search, mode: "insensitive" } },
          { inviter: { name: { contains: search, mode: "insensitive" } } },
          { inviter: { email: { contains: search, mode: "insensitive" } } },
        ];
      }

      const [invitations, total] = await Promise.all([
        prisma.familyInvitation.findMany({
          where: inviteWhere,
          include: {
            inviter: {
              select: { id: true, name: true, email: true },
            },
            familyMember: {
              select: { id: true, name: true, relationship: true },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.familyInvitation.count({ where: inviteWhere }),
      ]);

      return NextResponse.json({
        tab: "invitations",
        stats,
        invitations,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    }

    // Default: family members
    const memberWhere = { isArchived: false };
    if (search) {
      memberWhere.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { owner: { name: { contains: search, mode: "insensitive" } } },
        { owner: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [members, total] = await Promise.all([
      prisma.familyMember.findMany({
        where: memberWhere,
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          linkedUser: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.familyMember.count({ where: memberWhere }),
    ]);

    return NextResponse.json({
      tab: "members",
      stats,
      members,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET /api/admin/family error:", error);
    return NextResponse.json({ error: "Failed to load family data" }, { status: 500 });
  }
}
