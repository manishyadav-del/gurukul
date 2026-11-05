import { GET } from "../app/api/books/[id]/pdf/route.js";
import { PrismaClient } from "@prisma/client";
import assert from "node:assert/strict";

const prisma = new PrismaClient();

async function testPdfEndpoint() {
  console.log("=== Testing Secure PDF Endpoint ===");

  const book = await prisma.book.findFirst({
    where: { status: "PUBLISHED" }
  });
  assert(book, "Must have a published book");

  // 1. Test Info Request (?info=true)
  {
    const req = new Request(`http://localhost:3000/api/books/${book.id}/pdf?info=true`);
    const res = await GET(req, { params: Promise.resolve({ id: book.id }) });
    assert.equal(res.status, 200, "Info request should return 200");
    const json = await res.json();
    assert.equal(json.exists, true, "Info should report exists=true");
    assert.equal(json.bookId, book.id);
    assert(json.size > 0, "Size must be > 0");
    console.log(`[PASS] Info request for ${book.title}: size=${json.size} bytes`);
  }

  // 2. Test Full Stream Request
  {
    const req = new Request(`http://localhost:3000/api/books/${book.id}/pdf`);
    const res = await GET(req, { params: Promise.resolve({ id: book.id }) });
    assert.equal(res.status, 200, "Full stream request should return 200");
    assert.equal(res.headers.get("content-type"), "application/pdf");
    assert.equal(res.headers.get("accept-ranges"), "bytes");
    const arrayBuf = await res.arrayBuffer();
    assert(arrayBuf.byteLength > 1000, "PDF buffer must be > 1000 bytes");
    console.log(`[PASS] Full PDF stream returned ${arrayBuf.byteLength} bytes with application/pdf`);
  }

  // 3. Test RFC 7233 Range Request (first 1024 bytes)
  {
    const req = new Request(`http://localhost:3000/api/books/${book.id}/pdf`, {
      headers: { range: "bytes=0-1023" }
    });
    const res = await GET(req, { params: Promise.resolve({ id: book.id }) });
    assert.equal(res.status, 206, "Range request should return 206 Partial Content");
    assert.equal(res.headers.get("content-type"), "application/pdf");
    const contentRange = res.headers.get("content-range");
    assert(contentRange && contentRange.startsWith("bytes 0-1023/"), `Expected Content-Range starting with bytes 0-1023/, got ${contentRange}`);
    const chunk = await res.arrayBuffer();
    assert.equal(chunk.byteLength, 1024, `Expected 1024 bytes chunk, got ${chunk.byteLength}`);
    console.log(`[PASS] HTTP 206 Range request (0-1023) returned exactly 1024 bytes with Content-Range: ${contentRange}`);
  }

  // 4. Test Download Header (?download=true)
  {
    const req = new Request(`http://localhost:3000/api/books/${book.id}/pdf?download=true`);
    const res = await GET(req, { params: Promise.resolve({ id: book.id }) });
    assert.equal(res.status, 200);
    const disposition = res.headers.get("content-disposition");
    assert(disposition && disposition.startsWith("attachment"), `Expected attachment disposition, got ${disposition}`);
    console.log(`[PASS] Download parameter sets Content-Disposition: ${disposition}`);
  }

  // 5. Test Non-Existent Book
  {
    const req = new Request(`http://localhost:3000/api/books/00000000-0000-0000-0000-000000000000/pdf`);
    const res = await GET(req, { params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000000" }) });
    assert.equal(res.status, 404, "Unknown book must return 404");
    console.log(`[PASS] Non-existent book returned 404`);
  }

  await prisma.$disconnect();
  console.log("\nAll Secure PDF Endpoint tests passed successfully!");
}

testPdfEndpoint().catch(err => {
  console.error("Endpoint test failed:", err);
  process.exit(1);
});
