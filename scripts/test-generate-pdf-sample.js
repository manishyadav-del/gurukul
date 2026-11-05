import { generateBookPdf } from "../server/pdf/generateBookPdf.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
  const book = await prisma.book.findFirst({
    where: { status: "PUBLISHED" }
  });
  console.log("Testing book:", book.title, book.id);
  const startTime = Date.now();
  const res = await generateBookPdf(book.id);
  console.log("Generated result in", Date.now() - startTime, "ms:", res);
  await prisma.$disconnect();
}

test().catch(err => {
  console.error("Error generating pdf:", err);
  process.exit(1);
});
