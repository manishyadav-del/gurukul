import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin/auth";
import { PERMISSIONS } from "@/server/admin/permissions";
import {
  getSearchFreshnessReport,
  reindexBookSearch,
  reindexOutdatedEmbeddings,
  syncPassageFreshness,
} from "@/server/search/freshness";
import { logAdminActivity } from "@/server/admin/audit";

// GET /api/admin/search-index
export async function GET(request) {
  const auth = await requireAdmin(request, PERMISSIONS.BOOKS_READ);
  if (!auth.authorized) return auth.response;

  try {
    const report = await getSearchFreshnessReport();
    return NextResponse.json(report);
  } catch (error) {
    console.error("GET /api/admin/search-index error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve search freshness report", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/search-index
export async function POST(request) {
  const auth = await requireAdmin(request, PERMISSIONS.BOOKS_WRITE);
  if (!auth.authorized) return auth.response;
  const user = auth.admin.user;

  try {
    const body = await request.json();
    const action = body.action;

    if (action === "reindex_book") {
      if (!body.bookId) {
        return NextResponse.json({ error: "Missing required bookId" }, { status: 400 });
      }
      const result = await reindexBookSearch(body.bookId);

      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: "SEARCH_REINDEX_BOOK",
        targetResource: "Book",
        targetId: body.bookId,
        status: "SUCCESS",
        details: result,
      });

      return NextResponse.json(result);
    }

    if (action === "reindex_outdated_embeddings") {
      const result = await reindexOutdatedEmbeddings(body.limit || 50);

      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: "SEARCH_REINDEX_EMBEDDINGS",
        targetResource: "PassageEmbedding",
        status: "SUCCESS",
        details: result,
      });

      return NextResponse.json(result);
    }

    if (action === "sync_passage") {
      if (!body.passageId) {
        return NextResponse.json({ error: "Missing required passageId" }, { status: 400 });
      }
      const result = await syncPassageFreshness(body.passageId);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error("POST /api/admin/search-index error:", error);
    return NextResponse.json(
      { error: "Search reindex operation failed", details: error.message },
      { status: 500 }
    );
  }
}
