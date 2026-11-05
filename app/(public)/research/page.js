import prisma from "@/lib/prisma";
import ResearchWorkspaceClient from "@/components/research/ResearchWorkspaceClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "AI Research Assistant & Comparative Study - Gurukul",
  description:
    "Conduct source-grounded academic inquiry, compare classical treatises side-by-side, understand archaic Sanskrit terminology, and preserve your findings in personal research collections.",
};

export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const session = await getServerSession(authOptions).catch(() => null);
  const user = session?.user || null;

  // Fetch verified published books for comparison and search
  const publishedBooks = await prisma.book
    .findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        slug: true,
        author: true,
        language: true,
        description: true,
        pageCount: true,
        coverUrl: true,
      },
      orderBy: { title: "asc" },
    })
    .catch((err) => {
      console.warn("Error fetching published books for research:", err.message);
      return [];
    });

  return (
    <ResearchWorkspaceClient
      publishedBooks={publishedBooks}
      user={user}
    />
  );
}
