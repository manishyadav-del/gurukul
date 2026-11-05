# Gurukul Astrology

Gurukul Astrology is a scalable web application and digital knowledge repository for Vedic astrology (Jyotish Shastra), classical digital books, e-book reading, interactive quizzes, and scriptural learning.

---

## 1. Requirements

- **Node.js**: v18.17+ or v20+ (tested on Node.js v24.21.0)
- **npm**: v9+ (or v10+)
- **PostgreSQL**: v14+ (running locally on port 5432 or via cloud provider)

---

## 2. Tech Stack

- **Framework**: Next.js 15+ (App Router, JavaScript)
- **Language**: JavaScript (`.js` and `.jsx`), **no TypeScript**
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma ORM (v6.5.0)
- **Validation**: Zod
- **Auth**: NextAuth.js / Auth.js prepared
- **Icons**: Lucide React

---

## 3. Installation

Clone or navigate into the project directory and install dependencies:

```bash
npm install
```

---

## 4. Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Set the database connection string and secrets in `.env`:

```env
DATABASE_URL="postgresql://postgres:1234@localhost:5432/astrology_gurukul"
AUTH_SECRET="gurukul-astrology-development-secret-key-32charsmin"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 5. Database Setup & Migration

Ensure your PostgreSQL instance is running and the target database exists (e.g. `astrology_gurukul`).

Format and validate the Prisma schema:

```bash
npx prisma format
npx prisma validate
```

Run database migrations:

```bash
npx prisma migrate dev --name initial_schema
npx prisma generate
```

---

## 6. Seed Data

Seed the database with sample development records (Admin user, classical book *Gurukul Astrology*, chapters, passages, quiz questions, and reading progress):

```bash
npm run seed
```

---

## 7. Running the Application

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## 8. Available Routes

### Public Pages
- `/` — Homepage with learning pillars and search quick-links
- `/library` — Digital book catalog
- `/library/[book]` — Book overview, metadata, table of contents
- `/library/[book]/[chapter]` — Chapter reader with passage-by-passage view & bookmark controls
- `/search` — Scripture text and passage search
- `/astrology` — Astrology & Kundli portal overview
- `/ai/chat` — Gurukul AI knowledge assistant interface
- `/quiz` — Interactive astrology quizzes

### Dashboard Pages
- `/dashboard` — User reading progress, bookmarks, notes, and quiz metrics
- `/dashboard/bookmarks` — Saved scriptural passages
- `/dashboard/notes` — Annotations and study notes
- `/dashboard/progress` — Reading completion percentages

### Admin Portal
- `/admin` — Admin console metrics & pipeline queues
- `/admin/books` — Book catalog management
- `/admin/quizzes` — Quiz administration
- `/admin/users` — User roles & permissions
- `/admin/audit` — System audit & OCR logging

### API Endpoints
- `GET /api/health` — Service and database connection health probe
- `GET /api/books` — Fetch published books with pagination (`?page=1&limit=20`)
- `POST /api/books` — Create book metadata (validated with Zod, role-protected)
- `GET /api/search?q=query` — Search passages in published books
- `GET /api/user?email=admin@example.com` — Fetch reader metrics, bookmarks, and progress

---

## 9. Architecture & Future Roadmap

For deep dives into the database models, permission structures, future AI RAG architecture, Kundli engine, and PDF-to-eBook OCR pipeline, see [docs/architecture.md](docs/architecture.md).
