/**
 * Admin API: /api/admin/kundalini
 * 
 * Manages Kundalini & Knowledge Educational Modules, classical references, 
 * review/approval states, and audit logging.
 * Strictly requires manage permission (Admin / Editor).
 */

import { NextResponse } from "next/server.js";
import prisma from "../../../../lib/prisma.js";
import { requireManagePermission } from "../../../../server/security/authGuard.js";
import { logAdminActivity } from "../../../../server/admin/audit.js";

export async function GET(request) {
  try {
    const auth = await requireManagePermission(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const modules = await prisma.kundaliniModule.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ success: true, modules, count: modules.length });
  } catch (error) {
    console.error("GET /api/admin/kundalini error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin Kundalini modules", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = await requireManagePermission(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;

    const body = await request.json();
    const {
      id,
      title,
      slug,
      subtitle,
      level,
      chakraAssociation,
      chakraElement,
      bijaMantra,
      historicalContext,
      practices,
      safetyGuidance,
      sourceReferences,
      order,
      status,
      action = "create",
    } = body;

    // Handle Delete Action
    if (action === "delete" && id) {
      const existing = await prisma.kundaliniModule.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: "Module not found" }, { status: 404 });
      }

      await prisma.kundaliniModule.delete({ where: { id } });

      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email || user.id,
        actorRole: user.role,
        action: "KUNDALINI_MODULE_DELETE",
        targetResource: "KundaliniModule",
        targetId: id,
        status: "SUCCESS",
        details: { title: existing.title },
      });

      return NextResponse.json({ success: true, message: `Module ${existing.title} deleted.` });
    }

    // Handle Update Action
    if (id || action === "update") {
      const existing = await prisma.kundaliniModule.findFirst({
        where: { OR: [{ id: id || undefined }, { slug: slug || undefined }] },
      });

      if (!existing) {
        return NextResponse.json({ error: "Module not found for update" }, { status: 404 });
      }

      const updated = await prisma.kundaliniModule.update({
        where: { id: existing.id },
        data: {
          title: title || existing.title,
          subtitle: subtitle !== undefined ? subtitle : existing.subtitle,
          level: level || existing.level,
          chakraAssociation: chakraAssociation || existing.chakraAssociation,
          chakraElement: chakraElement !== undefined ? chakraElement : existing.chakraElement,
          bijaMantra: bijaMantra !== undefined ? bijaMantra : existing.bijaMantra,
          historicalContext: historicalContext !== undefined ? historicalContext : existing.historicalContext,
          practices: practices !== undefined ? practices : existing.practices,
          safetyGuidance: safetyGuidance || existing.safetyGuidance,
          sourceReferences: sourceReferences !== undefined ? sourceReferences : existing.sourceReferences,
          order: order !== undefined ? parseInt(order, 10) : existing.order,
          status: status || existing.status,
        },
      });

      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email || user.id,
        actorRole: user.role,
        action: "KUNDALINI_MODULE_UPDATE",
        targetResource: "KundaliniModule",
        targetId: updated.id,
        status: "SUCCESS",
        details: { title: updated.title, newStatus: updated.status },
      });

      return NextResponse.json({ success: true, module: updated });
    }

    // Handle Create Action
    if (!title || !safetyGuidance) {
      return NextResponse.json(
        { error: "title and safetyGuidance are required" },
        { status: 400 }
      );
    }

    const cleanSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const newModule = await prisma.kundaliniModule.create({
      data: {
        title,
        slug: cleanSlug,
        subtitle: subtitle || null,
        level: level || "BEGINNER",
        chakraAssociation: chakraAssociation || "All",
        chakraElement: chakraElement || null,
        bijaMantra: bijaMantra || null,
        historicalContext: historicalContext || null,
        practices: practices || [],
        safetyGuidance,
        sourceReferences: sourceReferences || [],
        order: order !== undefined ? parseInt(order, 10) : 0,
        status: status || "PUBLISHED",
      },
    });

    await logAdminActivity({
      actorId: user.id,
      actorEmail: user.email || user.id,
      actorRole: user.role,
      action: "KUNDALINI_MODULE_CREATE",
      targetResource: "KundaliniModule",
      targetId: newModule.id,
      status: "SUCCESS",
      details: { title: newModule.title },
    });

    return NextResponse.json({ success: true, module: newModule }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/kundalini error:", error);
    return NextResponse.json(
      { error: "Failed to process admin Kundalini module", details: error.message },
      { status: 500 }
    );
  }
}
