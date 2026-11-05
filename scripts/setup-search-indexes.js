/**
 * Sets up PostgreSQL Trigram and Text Search Indexes for Phase 5.
 */

import prisma from "../lib/prisma.js";

export async function setupSearchIndexes() {
  console.log("Setting up PostgreSQL Trigram Indexes for search...");

  try {
    // 1. Ensure pg_trgm extension is active
    await prisma.$queryRawUnsafe("CREATE EXTENSION IF NOT EXISTS pg_trgm;");
    console.log("  ✓ pg_trgm extension verified");

    // 2. Create GIN trigram indexes on Passages (text, rawText, cleanedText)
    await prisma.$queryRawUnsafe(
      "CREATE INDEX IF NOT EXISTS passages_text_trgm_idx ON passages USING gin (text gin_trgm_ops);"
    );
    await prisma.$queryRawUnsafe(
      "CREATE INDEX IF NOT EXISTS passages_rawtext_trgm_idx ON passages USING gin (\"rawText\" gin_trgm_ops);"
    );
    await prisma.$queryRawUnsafe(
      "CREATE INDEX IF NOT EXISTS passages_cleanedtext_trgm_idx ON passages USING gin (\"cleanedText\" gin_trgm_ops);"
    );
    console.log("  ✓ passages trigram indexes verified");

    // 3. Create GIN trigram index on Chapters (title)
    await prisma.$queryRawUnsafe(
      "CREATE INDEX IF NOT EXISTS chapters_title_trgm_idx ON chapters USING gin (title gin_trgm_ops);"
    );
    console.log("  ✓ chapters trigram index verified");

    // 4. Create GIN trigram index on Books (title)
    await prisma.$queryRawUnsafe(
      "CREATE INDEX IF NOT EXISTS books_title_trgm_idx ON books USING gin (title gin_trgm_ops);"
    );
    console.log("  ✓ books trigram index verified");

    return true;
  } catch (err) {
    console.error("  Warning: could not create some trigram indexes:", err.message);
    return false;
  }
}

// If executed directly
if (process.argv[1]?.endsWith("setup-search-indexes.js")) {
  setupSearchIndexes().finally(() => prisma.$disconnect());
}
