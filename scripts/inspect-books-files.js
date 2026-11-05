const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function run() {
  const books = await prisma.book.findMany({
    select: { id: true, title: true, slug: true, status: true, originalFileUrl: true }
  });
  console.log('Total books in DB:', books.length);
  let published = 0;
  let fileExistsCount = 0;
  let missingFiles = [];

  for (const b of books) {
    if (b.status === 'PUBLISHED') published++;
    const relPath = b.originalFileUrl ? b.originalFileUrl.replace(/^\//, '') : '';
    const fullPath = path.join(process.cwd(), 'public', relPath);
    const exists = b.originalFileUrl && fs.existsSync(fullPath);
    if (exists) {
      fileExistsCount++;
    } else if (b.status === 'PUBLISHED') {
      missingFiles.push({ id: b.id, title: b.title, url: b.originalFileUrl, path: fullPath });
    }
  }

  console.log('Published books:', published);
  console.log('Books with existing originalFileUrl on disk:', fileExistsCount);
  console.log('Published books missing file on disk:', missingFiles.length);
  if (missingFiles.length > 0) {
    console.log('Sample missing:', JSON.stringify(missingFiles.slice(0, 5), null, 2));
  }
  await prisma.$disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
