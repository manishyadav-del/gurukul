import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
  const books = await prisma.book.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      _count: { select: { chapters: true, pages: true, passages: true } }
    }
  });
  console.table(
    books.map(b => ({
      title: b.title.slice(0, 30),
      status: b.status,
      chapters: b._count.chapters,
      pages: b._count.pages,
      passages: b._count.passages
    }))
  );
  await prisma.$disconnect();
}

check();
