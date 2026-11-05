import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/server/admin/auth";
import { PERMISSIONS } from "@/server/admin/permissions";
import { logAdminActivity } from "@/server/admin/audit";

export async function PATCH(request, { params }) {
  const auth = await requireAdmin(request, PERMISSIONS.AUDIT_READ);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, assignedTo } = body;

    const existing = await prisma.adminActionItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Action item not found" }, { status: 404 });
    }

    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === "RESOLVED") {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = auth.admin.user.email;
      }
    }
    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo;
    }

    const updated = await prisma.adminActionItem.update({
      where: { id },
      data: updateData,
    });

    await logAdminActivity({
      actorId: auth.admin.user.id,
      actorEmail: auth.admin.user.email,
      actorRole: auth.admin.role,
      action: "ACTION_ITEM_UPDATED",
      targetResource: "AdminActionItem",
      targetId: id,
      status: "SUCCESS",
      details: { previousStatus: existing.status, newStatus: updated.status },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("PATCH /api/admin/action-center/[id] error:", error);
    return NextResponse.json({ error: "Failed to update action item" }, { status: 500 });
  }
}
