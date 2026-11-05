import prisma from "@/lib/prisma";
import DigitalLibraryView from "@/components/library/DigitalLibraryView";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Suspense } from "react";

export const metadata = {
  title: "Digital Library - Gurukul",
  description:
    "Explore authentic sacred Vedic manuscripts, Jyotisha shastras, Upanishads, and classical commentaries in Hindi, Sanskrit, and English.",
};

export const dynamic = "force-dynamic";

function LibraryFallback() {
  return (
    <div className="bg-[#fcfaf5] min-h-screen py-8 text-stone-900 animate-pulse">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="h-48 rounded-3xl bg-stone-200" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 h-96 rounded-2xl bg-stone-200" />
          <div className="lg:col-span-9 h-96 rounded-2xl bg-stone-200" />
        </div>
      </div>
    </div>
  );
}

export default async function LibraryPage() {
  const session = await getServerSession(authOptions).catch(() => null);
  const userId = session?.user?.id || null;

  // 1. Fetch all real published books from database
  const books = await prisma.book
    .findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        slug: true,
        language: true,
        script: true,
        author: true,
        publisher: true,
        coverUrl: true,
        coverImageUrl: true,
        pageCount: true,
        description: true,
        createdAt: true,
        _count: {
          select: {
            chapters: true,
            passages: true,
            pages: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    .catch((err) => {
      console.error("Failed to fetch library books from DB:", err);
      return [];
    });

  // 2. Fetch authenticated user's reading progress for "Continue Reading"
  let continueReading = [];
  if (userId) {
    continueReading = await prisma.readingProgress
      .findMany({
        where: { userId },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              slug: true,
              language: true,
              script: true,
              author: true,
              coverUrl: true,
              coverImageUrl: true,
              pageCount: true,
            },
          },
          chapter: {
            select: {
              id: true,
              title: true,
              slug: true,
              chapterNumber: true,
              startPage: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 6,
      })
      .catch((err) => {
        console.warn("Failed to fetch reading progress:", err);
        return [];
      });
  }

  return (
    <Suspense fallback={<LibraryFallback />}>
      <DigitalLibraryView
        initialBooks={books}
        initialProgress={continueReading}
        isAuthenticated={!!userId}
      />
    </Suspense>
  );
}
