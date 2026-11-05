import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/server/admin/auth";
import { PERMISSIONS } from "@/server/admin/permissions";
import { logAdminActivity } from "@/server/admin/audit";

export async function GET(request) {
  const auth = await requireAdmin(request, PERMISSIONS.LEARNING_READ);
  if (!auth.authorized) return auth.response;

  try {
    const modules = await prisma.learningModule.findMany({
      include: {
        _count: {
          select: { lessons: true },
        },
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ modules });
  } catch (error) {
    console.error("GET /api/admin/learn error:", error);
    return NextResponse.json({ error: "Failed to fetch learning modules" }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdmin(request, PERMISSIONS.LEARNING_WRITE);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { title, slug, description, category, difficulty, isPublished } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-");

    const newModule = await prisma.learningModule.create({
      data: {
        title,
        slug: cleanSlug,
        description: description || null,
        category: category || "ASTROLOGY_FOUNDATIONS",
        difficulty: difficulty || "BEGINNER",
        isPublished: Boolean(isPublished),
      },
    });

    await logAdminActivity({
      actorId: auth.admin.user.id,
      actorEmail: auth.admin.user.email,
      actorRole: auth.admin.role,
      action: "LEARNING_MODULE_CREATED",
      targetResource: "LearningModule",
      targetId: newModule.id,
      status: "SUCCESS",
      details: { title, slug: cleanSlug },
    });

    return NextResponse.json({ success: true, module: newModule });
  } catch (error) {
    console.error("POST /api/admin/learn error:", error);
    return NextResponse.json({ error: "Failed to create learning module" }, { status: 500 });
  }
}
