import { PrismaClient } from "@prisma/client";
import { generateBookPdf } from "../server/pdf/generateBookPdf.js";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function testAll() {
  const books = await prisma.book.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true, slug: true, _count: { select: { chapters: true, pages: true, passages: true } } }
  });

  console.log(`Checking ${books.length} published books...`);
  let successCount = 0;
  let failCount = 0;

  for (const b of books) {
    try {
      const res = await generateBookPdf(b.id);
      if (res?.absolutePath && fs.existsSync(res.absolutePath)) {
        successCount++;
        console.log(`[OK] ${b.title} (${res.totalPages} pages, ${res.fileSize} bytes)`);
      } else {
        failCount++;
        console.log(`[FAIL] ${b.title}: absolutePath missing or doesn't exist`);
      }
    } catch (err) {
      failCount++;
      console.log(`[ERR] ${b.title}: ${err.message}`);
    }
  }

  console.log(`Summary: ${successCount} succeeded, ${failCount} failed.`);
  await prisma.$disconnect();
}

testAll().catch(console.error);
