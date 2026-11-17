import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin/auth";
import { PERMISSIONS } from "@/server/admin/permissions";
import { getBookPageAudit } from "@/server/admin/ocrAnalytics";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const auth = await requireAdmin(request, PERMISSIONS.OCR_READ);
  if (!auth.authorized) return auth.response;

  try {
    const { bookId } = await params;
    if (!bookId) {
      return NextResponse.json({ error: "bookId is required" }, { status: 400 });
    }

    const audit = await getBookPageAudit(bookId);
    if (!audit) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: audit,
    });
  } catch (error) {
    console.error("GET /api/admin/ocr/books/[bookId] error:", error);
    return NextResponse.json(
      { error: "Failed to load book page audit", details: error.message },
      { status: 500 }
    );
  }
}
