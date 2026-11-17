import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canReviewBooks, canManageBooks } from "@/lib/permissions";
import ManuscriptStudioClient from "@/components/admin/ManuscriptStudioClient";

export const dynamic = "force-dynamic";

export default async function ManuscriptStudioPage({ params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user || (!canReviewBooks(user) && !canManageBooks(user))) {
    notFound();
  }

  const book = await prisma.book.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    select: {
      id: true,
      title: true,
      slug: true,
      author: true,
      pageCount: true,
      status: true,
      language: true,
      tradition: true,
      publishedVersion: true,
    },
  });

  if (!book) {
    notFound();
  }

  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ManuscriptStudioClient bookId={book.id} initialBook={book} />
    </div>
  );
}
