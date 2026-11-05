import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { canReviewBooks, canManageBooks } from "@/lib/permissions";

// GET /api/ingest?bookId=...&page=1&limit=20
export async function GET(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || !canReviewBooks(user)) {
      return NextResponse.json(
        { error: "Forbidden: Ingestion job oversight requires reviewer or administrative privileges" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const where = {};
    if (bookId) {
      where.bookId = bookId;
    }

    const [jobs, total] = await Promise.all([
      prisma.ingestJob.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          book: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
            },
          },
        },
      }),
      prisma.ingestJob.count({ where }),
    ]);

    // Sanitize internal details for reviewers without management rights
    const isManager = canManageBooks(user);
    const sanitizedJobs = jobs.map((j) => {
      if (!isManager) {
        const { workerId, options, ...rest } = j;
        return rest;
      }
      return j;
    });

    return NextResponse.json({
      jobs: sanitizedJobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/ingest error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ingest jobs", details: error.message },
      { status: 500 }
    );
  }
}
