import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/server/admin/auth";
import { PERMISSIONS } from "@/server/admin/permissions";
import { logAdminActivity } from "@/server/admin/audit";

export async function GET(request) {
  const auth = await requireAdmin(request, PERMISSIONS.AI_READ);
  if (!auth.authorized) return auth.response;

  try {
    let settings = await prisma.platformSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: { id: "default" },
      });
    }

    const [
      totalConversations,
      totalMessages,
      totalEmbeddedPassages,
      totalPassages,
      sourcesCount,
      recentBatchJobs,
    ] = await Promise.all([
      prisma.aIConversation.count(),
      prisma.aIMessage.count(),
      prisma.passageEmbedding.count({ where: { status: "COMPLETED" } }),
      prisma.passage.count(),
      prisma.aISource.count(),
      prisma.embeddingBatchJob.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const coveragePct =
      totalPassages > 0
        ? Math.round((totalEmbeddedPassages / totalPassages) * 100)
        : 100;

    return NextResponse.json({
      settings,
      stats: {
        totalConversations,
        totalMessages,
        totalEmbeddedPassages,
        totalPassages,
        coveragePct,
        sourcesCount,
      },
      batchJobs: recentBatchJobs,
    });
  } catch (error) {
    console.error("GET /api/admin/astro-ai error:", error);
    return NextResponse.json({ error: "Failed to load Astro AI config" }, { status: 500 });
  }
}

export async function PATCH(request) {
  const auth = await requireAdmin(request, PERMISSIONS.AI_WRITE);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { astroAiModel, astroAiTemperature, astroAiMaxTokens, astroAiSystemPrompt } = body;

    const updated = await prisma.platformSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        astroAiModel: astroAiModel || "gemini-1.5-flash",
        astroAiTemperature: astroAiTemperature !== undefined ? parseFloat(astroAiTemperature) : 0.7,
        astroAiMaxTokens: astroAiMaxTokens ? parseInt(astroAiMaxTokens, 10) : 1024,
        astroAiSystemPrompt: astroAiSystemPrompt || null,
        updatedBy: auth.admin.user.email,
      },
      update: {
        ...(astroAiModel ? { astroAiModel } : {}),
        ...(astroAiTemperature !== undefined ? { astroAiTemperature: parseFloat(astroAiTemperature) } : {}),
        ...(astroAiMaxTokens ? { astroAiMaxTokens: parseInt(astroAiMaxTokens, 10) } : {}),
        ...(astroAiSystemPrompt !== undefined ? { astroAiSystemPrompt } : {}),
        updatedBy: auth.admin.user.email,
      },
    });

    await logAdminActivity({
      actorId: auth.admin.user.id,
      actorEmail: auth.admin.user.email,
      actorRole: auth.admin.role,
      action: "AI_SETTINGS_UPDATED",
      targetResource: "PlatformSettings",
      targetId: "default",
      status: "SUCCESS",
      details: { astroAiModel, astroAiTemperature, astroAiMaxTokens },
    });

    return NextResponse.json({
      success: true,
      message: "Astro AI parameters updated",
      settings: updated,
    });
  } catch (error) {
    console.error("PATCH /api/admin/astro-ai error:", error);
    return NextResponse.json({ error: "Failed to update AI settings" }, { status: 500 });
  }
}
