import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/server/admin/auth";
import { PERMISSIONS } from "@/server/admin/permissions";
import { logAdminActivity } from "@/server/admin/audit";

export async function GET(request, { params }) {
  const auth = await requireAdmin(request, PERMISSIONS.LEARNING_READ);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    const learningModule = await prisma.learningModule.findUnique({
      where: { id },
      include: {
        lessons: { orderBy: { order: "asc" } },
      },
    });

    if (!learningModule) return NextResponse.json({ error: "Module not found" }, { status: 404 });
    return NextResponse.json({ module: learningModule });
  } catch (error) {
    console.error("GET /api/admin/learn/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch module" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const auth = await requireAdmin(request, PERMISSIONS.LEARNING_WRITE);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, category, difficulty, isPublished } = body;

    const updated = await prisma.learningModule.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(category ? { category } : {}),
        ...(difficulty ? { difficulty } : {}),
        ...(typeof isPublished === "boolean" ? { isPublished } : {}),
      },
    });

    await logAdminActivity({
      actorId: auth.admin.user.id,
      actorEmail: auth.admin.user.email,
      actorRole: auth.admin.role,
      action: "LEARNING_MODULE_UPDATED",
      targetResource: "LearningModule",
      targetId: id,
      status: "SUCCESS",
      details: { title: updated.title, isPublished: updated.isPublished },
    });

    return NextResponse.json({ success: true, module: updated });
  } catch (error) {
    console.error("PATCH /api/admin/learn/[id] error:", error);
    return NextResponse.json({ error: "Failed to update module" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin(request, PERMISSIONS.LEARNING_WRITE);
  if (!auth.authorized) return auth.response;

  try {
    const { id } = await params;
    await prisma.learningModule.delete({ where: { id } });

    await logAdminActivity({
      actorId: auth.admin.user.id,
      actorEmail: auth.admin.user.email,
      actorRole: auth.admin.role,
      action: "LEARNING_MODULE_DELETED",
      targetResource: "LearningModule",
      targetId: id,
      status: "SUCCESS",
    });

    return NextResponse.json({ success: true, message: "Module deleted" });
  } catch (error) {
    console.error("DELETE /api/admin/learn/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete module" }, { status: 500 });
  }
}
