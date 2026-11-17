import { NextResponse } from "next/server.js";
import { verifyPassage } from "@/server/provenance/provenanceService.js";
import { requireReviewPermission } from "@/server/security/authGuard.js";
import { logAdminActivity } from "@/server/admin/audit.js";

/**
 * POST /api/provenance/passage/[id]/verify
 * Authorized scholars/reviewers verify, correct, or reject a passage.
 */
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const auth = await requireReviewPermission(request);
    if (auth.errorResponse) return auth.errorResponse;
    const user = auth.user;

    const body = await request.json();
    const {
      status,
      correctedText,
      reason,
      scholarlyNotes,
      transliteration,
      hindiTranslation,
      englishTranslation,
      translationSource,
      translator,
      commentary,
      commentarySource,
      anvaya,
      verseNumber,
    } = body;

    if (!status) {
      return NextResponse.json({ error: "Verification status is required" }, { status: 400 });
    }

    const updated = await verifyPassage({
      passageId: id,
      status,
      correctedText,
      reason,
      scholarlyNotes,
      transliteration,
      hindiTranslation,
      englishTranslation,
      translationSource,
      translator,
      commentary,
      commentarySource,
      anvaya,
      verseNumber,
      user,
    });

    await logAdminActivity({
      actorId: user.id,
      actorEmail: user.email || user.id,
      actorRole: user.role,
      action: "PASSAGE_SCHOLARLY_VERIFY",
      targetResource: "Passage",
      targetId: id,
      status: "SUCCESS",
      details: {
        verificationStatus: updated.verificationStatus,
        hadTextCorrection: Boolean(correctedText && correctedText.trim() !== ""),
        reason,
        verseNumber,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Passage marked as ${updated.verificationStatus}`,
      passage: updated,
    });
  } catch (error) {
    console.error("POST /api/provenance/passage/[id]/verify error:", error);
    return NextResponse.json(
      { error: "Verification failed", details: error.message },
      { status: 500 }
    );
  }
}
