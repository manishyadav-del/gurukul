# Digital Book Ingestion & OCR Pipeline Architecture

> **Gurukul Astrology Platform**  
> Complete, pure Next.js + JavaScript/Node.js digital book ingestion, OCR, and proofreading system.  
> **Strict Environment Standard:** 100% JavaScript runtime. No Python, microservices, or external native services.

---

## 1. System Architecture

The digital book ingestion pipeline transforms classical astrology manuscripts and modern PDFs into structured, traceable digital knowledge without Python or third-party cloud microservices.

```text
              ASTROLOGY BOOK PDF
                      │
                      ▼
               NEXT.JS UPLOAD
                      │
                      ▼
                 PDF ANALYSIS
                      │
             ┌────────┴────────┐
             │                 │
        DIGITAL PAGE       SCANNED PAGE
             │                 │
             ▼                 ▼
       PDF TEXT PARSER     PDF RENDERER
      (pdfjs-dist legacy) (@napi-rs/canvas)
             │                 │
             │                 ▼
             │            JS OCR ENGINE
             │            (Tesseract.js)
             │                 │
             └────────┬────────┘
                      ▼
             NORMALIZED OCR RESULT
                      │
                      ▼
                CONFIDENCE & STATS
                      │
                      ▼
                 TEXT CLEANING
             (Devanagari Preserved)
                      │
                      ▼
              LANGUAGE DETECTION
              (hi / sa / en / mixed)
                      │
                      ▼
              CHAPTER DETECTION
                      │
                      ▼
              PASSAGE CREATION
                      │
                      ▼
                  POSTGRESQL
                      │
                      ▼
             ADMIN PROOFREADING
          (Side-by-Side Verification)
                      │
                      ▼
               EXPERT APPROVAL
                      │
                      ▼
                   PUBLISH
```

---

## 2. PDF Upload

- **Endpoint:** `POST /api/books`
- **Supported Encodings:** `multipart/form-data` (direct file upload) and `application/json` (metadata registration).
- **Validation Rules:**
  - File MIME type must be `application/pdf` or `application/x-pdf`.
  - Extension must strictly be `.pdf`.
  - Maximum upload size: 100MB.
  - Safe sanitized basename to prevent directory traversal attacks.
- **Workflow:**
  1. The administrator uploads a PDF from `/admin/books`.
  2. The book is registered in PostgreSQL with `status: RECEIVED`, `processingStatus: QUEUED`.
  3. The PDF is stored under `books/{bookId}/original/{filename}`.
  4. If selected, background processing starts asynchronously via `POST /api/books/[id]/process`.

---

## 3. PDF Analysis

- **Location:** `server/ingest/analyzePdf.js`
- **Methodology:** The system does **NOT** classify the entire book uniformly. Instead, every page is individually inspected:
  - **Selectable Characters:** Extracted via `pdfjs-dist/legacy/build/pdf.mjs`.
  - **Image Operations:** Scanned from PDF operator lists (`OPS.paintImageXObject`, `paintInlineImage`, `paintImageMaskXObject`).
  - **Metrics:** `textDensity` (characters per unit area) and `imageDensity`.
- **Classifications:**
  - `DIGITAL` (`TEXT_EXTRACTION`): Page contains `>= 40` characters and no background scanned image operators.
  - `SCANNED` (`OCR`): Page has minimal or no selectable text and contains image operators.
  - `MIXED` (`MIXED`): Page contains both selectable text and substantial image layers.

---

## 4. Text Extraction

- **Location:** `server/ingest/extractText.js`
- **Engine:** Pure JavaScript `pdfjs-dist` legacy Node build.
- **Processing:**
  - Converts PDF viewport to top-left coordinate origin.
  - Groups glyphs and string items by Y-coordinate proximity into lines.
  - Reconstructs layout blocks with exact bounding boxes (`x`, `y`, `width`, `height`).
  - Preserves exact source text and spacing into `BookPage.rawText`.

---

## 5. Page Rendering

- **Location:** `server/ingest/renderPage.js`
- **Engine:** `pdfjs-dist` + `@napi-rs/canvas` (Rust N-API prebuilt binary for Node.js, 0% Python dependency).
- **Output:** WebP (lossless/near-lossless format).
- **Resolution:** Configurable DPI (default: `300 DPI`, scale factor `~3.0` for high-resolution OCR).
- **Dual Outputs:**
  - Full-resolution page image: `books/{bookId}/pages/{pageNumber}.webp`
  - Lightweight preview thumbnail: `books/{bookId}/previews/{pageNumber}.webp`
- **Guarantee:** Page images are **always** rendered for every page (both digital and scanned) so human reviewers in `/admin/proofreading` can always visually compare the original manuscript.

---

## 6. OCR Adapter

- **Location:** `server/ocr/adapter.js`
- **Abstraction Pattern:**
  ```text
  OCR Engine (Tesseract.js)
       ↓
  OCR Adapter (server/ocr/adapter.js)
       ↓
  Normalized OCR Result (server/ocr/normalize.js)
       ↓
  Database (PostgreSQL / Prisma)
  ```
- **Engine Swappability:** Application code only interacts via:
  ```javascript
  import { recognizeImage } from "@/server/ocr";
  const result = await recognizeImage(imageBufferOrPath, options);
  ```
  Future replacement (e.g. cloud vision API or upgraded Node OCR) requires modifying only the adapter without touching UI or ingest pipelines.

---

## 7. OCR Result Format

All OCR engines normalize output into this contract:

```javascript
{
  pageNumber: 143,
  blocks: [
    {
      text: "Jupiter",
      confidence: 0.96,
      bbox: {
        x: 100,
        y: 250,
        width: 300,
        height: 50
      },
      order: 1,
      language: "en"
    }
  ],
  fullText: "Jupiter...",
  stats: {
    pageConfidence: 0.96,
    averageBlockConfidence: 0.96,
    minBlockConfidence: 0.96,
    level: "HIGH",
    requiresProofreading: false
  }
}
```

---

## 8. Text Cleaning

- **Location:** `server/ingest/cleanText.js`
- **Sanitization:**
  - Strips non-printable ASCII control characters.
  - Removes standalone page number noise on the first or last line.
  - Cleans broken English hyphenation across linebreaks (`sig-\nnificant` -> `significant`).
  - Removes stray ASCII noise characters (`~`, `^`, `_`).
- **Devanagari Preservation (Strict Rules):**
  - **Never normalizes sacred terms into English** (`गुरु` is never converted to `Jupiter`, `शनि` remains `शनि`, `राहु-केतु` remain intact).
  - Preserves Sanskrit punctuation: Single danda (`।`, U+0964) and Double danda (`॥`, U+0965).
  - Preserves Avagraha (`ऽ`, U+093D) and Visarga (`ः`, U+0903).
  - Separate fields: `rawText` is **never overwritten**; cleaning produces `cleanedText`, and reviewer edits produce `proofreadText`.

---

## 9. Chapter Detection

- **Location:** `server/ingest/detectStructure.js`
- **Deterministic Heuristics:**
  - Hindi / Sanskrit patterns: `अध्याय \d+`, `प्रकरण`, `खण्ड`, `सर्ग`, `उल्लास`, `प्रथम अध्याय`...
  - English patterns: `Chapter \d+`, `Book \d+`.
  - Verses / Shlokas: lines with `॥`, `। \d+ ।`, or `श्लोक \d+`.
  - Footnotes: lines with `*`, `†`, `[1]`, `(1)`.
- **Bounding Pages:** Chapters calculate `startPage` and `endPage` across the ingested page sequence.

---

## 10. Passage Creation

- **Location:** `server/ingest/createPassages.js`
- **Traceability Chain:**
  ```text
  Book
   └── Chapter
        └── BookPage
             └── Passage (with sourcePage, startOffset, endOffset, searchText)
  ```
- **Purpose:** Prepares granular citations for future AI/RAG query responses:
  > *"According to Brihat Parashara Hora Shastra, Chapter 1, Page 12, Passage 3..."*

---

## 11. Database Structure

Prisma models in `prisma/schema.prisma`:

| Model | Purpose |
|---|---|
| `Book` | Catalog metadata, processing status, and publication lifecycle. |
| `BookPage` | Stores `rawText`, `cleanedText`, `proofreadText`, `imageUrl`, `ocrConfidence`, `proofread`. |
| `OcrBlock` | Individual block bounding boxes (`x, y, width, height`), confidence, order, text. |
| `Chapter` | Chapter titles, slugs, and `startPage`/`endPage` bounds. |
| `Passage` | Granular paragraphs linked to Book, Chapter, and Page. |
| `IngestJob` | Tracks background status, progress percentage, total/processed/failed pages. |
| `OcrError` | Flags low confidence scans, empty pages, or rendering errors. |
| `CorrectionHistory` | Immutable audit trail of every reviewer text edit with `previousText`, `correctedText`, `correctedBy`, and `createdAt`. |

### Three-Tier Text Separation

Every `BookPage` stores three distinct text fields — never merged or overwritten:

| Field | Source | Can Be Overwritten |
|---|---|---|
| `rawText` | Direct PDF extraction or raw Tesseract.js OCR output | **Never** |
| `cleanedText` | Automated `cleanText.js` (Devanagari-safe cleaning) | No |
| `proofreadText` | Human reviewer edits in `/admin/proofreading/[pageId]` | Yes |

Each `Passage` also carries `rawText`, `cleanedText`, and `proofreadText` for the same traceability guarantee.

---

## 12. Proofreading Workspace

- **URL:** `/admin/proofreading` and `/admin/proofreading/[pageId]`
- **Layout:** Side-by-side comparison:
  - **Left Pane:** High-resolution page scan (`PagePreview.jsx`) with optional bounding box overlay and zoom/pan controls.
  - **Right Pane:** Editable proofreading text area with tabs for `Editable Proofread Text` vs `Original Raw OCR`, along with block-level confidence breakdown (`OCRReview.jsx`).
- **Actions:**
  - `[Save]`: Saves edited text to `BookPage.proofreadText`.
  - `[Approve Page]`: Sets `proofread: true` and updates related Passages.
  - `[Flag Issue]`: Records `OcrError` (e.g. `LOW_CONFIDENCE`, `EMPTY_PAGE`).
  - `[Previous]` / `[Next]`: One-click adjacent page navigation.

---

## 13. Error Handling

- Specific error categorization in `OcrError`:
  - `LOW_CONFIDENCE`: Page confidence below threshold.
  - `EMPTY_PAGE`: Page yielded no characters.
  - `OCR_FAILED`: Engine worker threw an unhandled error.
  - `IMAGE_RENDER_FAILED`: Canvas rendering failure.
  - `TEXT_EXTRACTION_FAILED`: Fallback to OCR triggered.
  - `LANGUAGE_DETECTION_FAILED`.

---

## 14. Retry & Idempotency Behavior

- Pipeline is **fully resumable**:
  - Re-running an ingestion job (`POST /api/books/[id]/process` with `{ forceRetry: false }`) will inspect `BookPage.ocrCompleted`.
  - Completed pages are **skipped** immediately without incurring rendering or OCR compute costs.
  - Failed pages are retried.
  - Re-running never produces duplicate pages, duplicate OCR blocks, or duplicate chapters.

---

## 15. Storage Structure

- Implemented in `server/storage/`:
  - `paths.js`: Computes predictable paths for assets.
  - `upload.js`: Writes to local filesystem (or S3/Cloudflare R2).
  - `download.js`: Reads stored buffers and JSON metadata.

```text
public/uploads/books/
  {bookId}/
    original/
      book.pdf
    pages/
      001.webp
      002.webp
    ocr/
      001.json
      002.json
    previews/
      001.webp
```

---

## 16. Security

- PDF MIME type and magic number validation.
- Path traversal protection on all file uploads (`path.basename`, `path.resolve` containment checks).
- Role-based authorization (`isAdmin`, `isEditor`, `isProofreader` from `lib/permissions.js`).
- Unapproved manuscripts cannot be published (`status: PUBLISHED` requires manual administrative or editor approval).
- Environment secrets (`DATABASE_URL`, `AUTH_SECRET`, storage keys) are kept strictly server-side.

---

## 17. Local Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Copy `.env.example` to `.env` and configure your local PostgreSQL database:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/astrology_gurukul"
   AUTH_SECRET="your-32-char-secret-key"
   STORAGE_PROVIDER=local
   OCR_ENGINE=tesseract
   OCR_LANGUAGE=eng+hin+san
   OCR_MIN_CONFIDENCE=0.75
   OCR_DPI=300
   ```

3. **Synchronize database:**
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

4. **Run test suite:**
   ```bash
   npm run test:ingest
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

---

## 18. Production Considerations

### Background Worker (Required for Large PDFs)

The `scripts/worker.js` standalone Node.js worker polls PostgreSQL for queued jobs and processes them independently without blocking HTTP requests:

```bash
# Start the OCR worker (alongside Next.js dev server)
node scripts/worker.js

# Production: run with PM2 for automatic restart on failure
pm2 start scripts/worker.js --name ocr-worker
pm2 startup       # Auto-start on server reboot
pm2 save
```

The worker polls for `QUEUED` IngestJob records every `WORKER_POLL_INTERVAL_MS` (default 5000ms), processes one book at a time, and persists all state to PostgreSQL. A single crash does not lose processing progress.

### S3 / Cloudflare R2 Storage

Set `STORAGE_PROVIDER=s3` and configure `S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, and `S3_SECRET_ACCESS_KEY` to stream page WebP images directly from object storage CDN.

### Memory Considerations

Tesseract.js loads the `hin+eng+san` trained data into memory per worker process (~300-600MB). Run one worker per machine and monitor memory usage with `pm2 monit`.

---

## 19. API Reference

| Method | Endpoint | Auth Required | Purpose |
|---|---|---|---|
| `POST` | `/api/books` | Admin/Editor | Upload PDF + register book |
| `GET` | `/api/books` | Public | List all books with pagination |
| `GET` | `/api/books/[id]` | Public | Get book details with pages |
| `PATCH` | `/api/books/[id]` | Admin/Editor | Update book metadata |
| `DELETE` | `/api/books/[id]` | Admin/Editor | Delete book |
| `POST` | `/api/books/[id]/process` | Admin/Editor | Trigger OCR pipeline |
| `GET` | `/api/ingest/[jobId]` | Admin/Editor | Get job status |
| `POST` | `/api/ingest/[jobId]` | Admin/Editor | Retry failed job |
| `GET` | `/api/pages/[pageId]` | Admin/Reviewer | Get page with OCR data |
| `PATCH` | `/api/pages/[pageId]` | Admin/Reviewer | Save proofread text |
| `POST` | `/api/pages/[pageId]/approve` | Admin/Reviewer | Approve/reject page |

---

## 19. OCR Engine Limitations (Hindi & Sanskrit)

### Known Limitations in Pure JavaScript / Tesseract.js:
1. **Complex Devanagari Conjuncts (Samyuktaksharas):**
   - Classical Sanskrit texts frequently contain rare conjuncts (e.g. `ङ्क`, `ष्ट्र्य`, `ह्र`, `ह्म`). Tesseract.js may occasionally split conjuncts into separate base characters with halanta (`क + ् + ष` instead of `क्ष`).
2. **Devanagari Matra Misalignment in Low-Resolution Scans:**
   - Top matras (`ि`, `ी`, `े`, `ै`) and bindu / chandrabindu (`ं`, `ँ`) can be misread if scan resolution is under 200 DPI.
   - **Mitigation:** The ingestion engine defaults to `300 DPI` rendering to maximize OCR clarity.
3. **Manuscript Aging & Skew:**
   - Physical paper bleed-through, yellowing, or curved book spines degrade OCR confidence.
4. **Resolution via Side-by-Side Proofreading:**
   - The platform acknowledges these limitations by designing low-confidence automatic routing: any page with `< 75%` confidence automatically queues for human verification in `/admin/proofreading`.
