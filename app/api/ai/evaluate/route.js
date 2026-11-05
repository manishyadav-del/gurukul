import { NextResponse } from "next/server";
import { runRetrievalEvaluation } from "@/server/ai/evaluation";
import { requireRole } from "@/server/security/authGuard";

// GET /api/ai/evaluate - Runs retrieval evaluation benchmark
export async function GET(request) {
  try {
    const auth = await requireRole(request, ["ADMIN", "EDITOR"]);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const { searchParams } = new URL(request.url);
    const k = parseInt(searchParams.get("k") || "3", 10);

    const report = await runRetrievalEvaluation({ k });

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("GET /api/ai/evaluate error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute retrieval evaluation" },
      { status: 500 }
    );
  }
}
