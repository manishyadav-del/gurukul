import { NextResponse } from "next/server";
import { retryPage } from "@/server/jobs/retryPage";
import { requireOcrPermission } from "@/server/security/authGuard";
import { logAdminActivity } from "@/server/admin/audit";
import prisma from "@/lib/prisma";

/**
 * POST /api/pages/[pageId]/retry
 * Retries OCR recognition on a single page independently.
 * Supports configurable retry options (forceOcr, forceOverwriteProofread, dpi).
 * Strictly guards approved human proofreading from accidental overwrite.
 */
export async function POST(request, { params }) {
  try {
    const { pageId } = await params;
    const auth = await requireOcrPermission(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;

    const existingPage = await prisma.bookPage.findUnique({
      where: { id: pageId },
      select: {
        id: true,
        pageNumber: true,
        bookId: true,
        proofread: true,
        proofreadText: true,
      },
    });

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));

    // DPI validation (150 - 600)
    let dpi = 300;
    if (body.dpi !== undefined) {
      const parsedDpi = parseInt(body.dpi, 10);
      if (isNaN(parsedDpi) || parsedDpi < 150 || parsedDpi > 600) {
        return NextResponse.json(
          { error: "Invalid DPI parameter. Expected integer between 150 and 600." },
          { status: 400 }
        );
      }
      dpi = parsedDpi;
    }

    // Guard human proofreading
    const isProofread = existingPage.proofread || Boolean(existingPage.proofreadText);
    const forceOverwriteProofread = Boolean(body.forceOverwriteProofread);

    if (isProofread && forceOverwriteProofread) {
      // Overwriting human corrections is strictly exceptional: must be confirmed and admin
      const isSuperAdminOrAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "OCR_MANAGER";
      if (!isSuperAdminOrAdmin) {
        return NextResponse.json(
          { error: "Forbidden: Only Administrators or OCR Managers can force overwrite proofread text." },
          { status: 403 }
        );
      }
      if (body.confirmOverwrite !== true) {
        return NextResponse.json(
          {
            error: "Confirmation required: Overwriting human-proofread text requires explicit confirmOverwrite: true.",
            requiresConfirmation: true,
          },
          { status: 400 }
        );
      }

      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email || user.id,
        actorRole: user.role,
        action: "OCR_FORCED_OVERWRITE_CONFIRMED",
        targetResource: "BookPage",
        targetId: pageId,
        status: "WARNING",
        details: {
          pageNumber: existingPage.pageNumber,
          bookId: existingPage.bookId,
          reason: body.overwriteReason || "Administrative override",
        },
      });
    }

    const result = await retryPage(pageId, {
      forceOcr: body.forceOcr ?? true,
      forceOverwriteProofread: isProofread ? forceOverwriteProofread : false,
      dpi,
      qualityPipeline: body.qualityPipeline !== false,
      ocrProfile: body.ocrProfile,
      engine: body.engine,
    });

    await logAdminActivity({
      actorId: user.id,
      actorEmail: user.email || user.id,
      actorRole: user.role,
      action: "OCR_PAGE_RETRY",
      targetResource: "BookPage",
      targetId: pageId,
      status: "SUCCESS",
      details: {
        pageNumber: existingPage.pageNumber,
        bookId: existingPage.bookId,
        dpi,
        forceOcr: body.forceOcr ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Page ${result.page.pageNumber} OCR re-processed successfully.`,
      page: result.page,
      skipped: result.skipped,
    });
  } catch (error) {
    console.error(`POST /api/pages/${params?.pageId}/retry error:`, error);
    return NextResponse.json(
      { error: "Failed to retry page OCR", details: error.message },
      { status: 500 }
    );
  }
}
