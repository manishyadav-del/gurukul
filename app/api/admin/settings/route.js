import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/server/admin/auth";
import { PERMISSIONS } from "@/server/admin/permissions";
import { logAdminActivity } from "@/server/admin/audit";

export async function GET(request) {
  const auth = await requireAdmin(request, PERMISSIONS.SETTINGS_READ);
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

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json({ error: "Failed to load platform settings" }, { status: 500 });
  }
}

export async function PATCH(request) {
  const auth = await requireAdmin(request, PERMISSIONS.SETTINGS_WRITE);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const {
      registrationEnabled,
      maintenanceMode,
      allowFamilySharing,
      ocrDefaultEngine,
      ocrLanguages,
      ocrDpi,
    } = body;

    const updated = await prisma.platformSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        registrationEnabled: registrationEnabled ?? true,
        maintenanceMode: maintenanceMode ?? false,
        allowFamilySharing: allowFamilySharing ?? true,
        ocrDefaultEngine: ocrDefaultEngine || "tesseract",
        ocrLanguages: ocrLanguages || "hin+san+eng",
        ocrDpi: ocrDpi ? parseInt(ocrDpi, 10) : 300,
        updatedBy: auth.admin.user.email,
      },
      update: {
        ...(typeof registrationEnabled === "boolean" ? { registrationEnabled } : {}),
        ...(typeof maintenanceMode === "boolean" ? { maintenanceMode } : {}),
        ...(typeof allowFamilySharing === "boolean" ? { allowFamilySharing } : {}),
        ...(ocrDefaultEngine ? { ocrDefaultEngine } : {}),
        ...(ocrLanguages ? { ocrLanguages } : {}),
        ...(ocrDpi ? { ocrDpi: parseInt(ocrDpi, 10) } : {}),
        updatedBy: auth.admin.user.email,
      },
    });

    await logAdminActivity({
      actorId: auth.admin.user.id,
      actorEmail: auth.admin.user.email,
      actorRole: auth.admin.role,
      action: "PLATFORM_SETTINGS_UPDATED",
      targetResource: "PlatformSettings",
      targetId: "default",
      status: "SUCCESS",
      details: { registrationEnabled, maintenanceMode, allowFamilySharing, ocrLanguages, ocrDpi },
    });

    return NextResponse.json({
      success: true,
      message: "Platform settings updated successfully",
      settings: updated,
    });
  } catch (error) {
    console.error("PATCH /api/admin/settings error:", error);
    return NextResponse.json({ error: "Failed to update platform settings" }, { status: 500 });
  }
}
