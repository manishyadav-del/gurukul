/**
 * Production Database & Media Asset Backup Script for Gurukul
 * 
 * Features:
 * - Dumps all relational database tables preserving relations and UUID keys
 * - Copies all uploaded manuscripts and PDFs from public/uploads
 * - Generates cryptographic SHA-256 manifest for restoration verification
 * - Rotates historical backups (configurable retention, default: 7 days)
 * 
 * Usage:
 *   node scripts/backup.js [--out-dir ./backups] [--retention 7]
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import prisma from "../lib/prisma.js";

const DEFAULT_BACKUP_ROOT = path.join(process.cwd(), "backups");
const RETENTION_COUNT = parseInt(process.env.BACKUP_RETENTION_COUNT || "7", 10);

function computeFileHash(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export async function runDatabaseBackup(outputDirectory = DEFAULT_BACKUP_ROOT) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFolder = path.join(outputDirectory, `backup-${timestamp}`);
  const dataFolder = path.join(backupFolder, "data");
  const assetsFolder = path.join(backupFolder, "assets");

  fs.mkdirSync(dataFolder, { recursive: true });
  fs.mkdirSync(assetsFolder, { recursive: true });

  console.log(`[Backup] Initiating Gurukul production backup at: ${backupFolder}`);

  const manifest = {
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    tables: {},
    assets: [],
    hashes: {},
  };

  // 1. Snapshot Core Database Tables
  const tablesToDump = [
    { name: "users", fetch: () => prisma.user.findMany() },
    { name: "books", fetch: () => prisma.book.findMany() },
    { name: "book_pages", fetch: () => prisma.bookPage.findMany() },
    { name: "chapters", fetch: () => prisma.chapter.findMany() },
    { name: "passages", fetch: () => prisma.passage.findMany() },
    { name: "passage_embeddings", fetch: () => prisma.passageEmbedding.findMany() },
    { name: "reading_progress", fetch: () => prisma.readingProgress.findMany() },
    { name: "bookmarks", fetch: () => prisma.bookmark.findMany() },
    { name: "notes", fetch: () => prisma.note.findMany() },
    { name: "quizzes", fetch: () => prisma.quiz.findMany() },
    { name: "quiz_questions", fetch: () => prisma.quizQuestion.findMany() },
    { name: "quiz_options", fetch: () => prisma.quizOption.findMany() },
    { name: "quiz_attempts", fetch: () => prisma.quizAttempt.findMany() },
    { name: "quiz_answers", fetch: () => prisma.quizAnswer.findMany() },
    { name: "xp_transactions", fetch: () => prisma.xPTransaction.findMany() },
    { name: "user_achievements", fetch: () => prisma.userAchievement.findMany() },
    { name: "correction_history", fetch: () => prisma.correctionHistory.findMany() },
    { name: "birth_profiles", fetch: () => prisma.birthProfile.findMany() },
    { name: "birth_charts", fetch: () => prisma.birthChart.findMany() },
    { name: "planet_positions", fetch: () => prisma.planetPosition.findMany() },
    { name: "ai_conversations", fetch: () => prisma.aIConversation.findMany() },
    { name: "ai_messages", fetch: () => prisma.aIMessage.findMany() },
    { name: "ai_sources", fetch: () => prisma.aISource.findMany() },
    { name: "admin_audit_logs", fetch: () => prisma.adminAuditLog.findMany() },
  ];

  for (const table of tablesToDump) {
    try {
      const records = await table.fetch();
      const filePath = path.join(dataFolder, `${table.name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(records, null, 2), "utf8");
      const hash = computeFileHash(filePath);

      manifest.tables[table.name] = records.length;
      manifest.hashes[`data/${table.name}.json`] = hash;
      console.log(`  ✓ Dumped ${records.length.toString().padStart(5)} records -> ${table.name}`);
    } catch (err) {
      console.error(`  ✗ Error dumping table ${table.name}:`, err.message);
      manifest.tables[table.name] = `ERROR: ${err.message}`;
    }
  }

  // 2. Backup Uploaded Original PDFs & Media Assets (Public & Private Roots)
  const assetDirectories = [
    { dir: path.join(process.cwd(), "public", "uploads"), prefix: "public" },
    { dir: path.join(process.cwd(), "storage", "private"), prefix: "private" },
  ];

  function copyDirectoryRecursive(src, dest, prefix, assetList, hashes) {
    if (!fs.existsSync(src)) return;
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyDirectoryRecursive(srcPath, destPath, `${prefix}/${entry.name}`, assetList, hashes);
      } else if (entry.isFile()) {
        fs.copyFileSync(srcPath, destPath);
        const fileHash = computeFileHash(destPath);
        const rel = `${prefix}/${entry.name}`;
        assetList.push(rel);
        hashes[`assets/${rel}`] = fileHash;
      }
    }
  }

  for (const { dir, prefix } of assetDirectories) {
    if (fs.existsSync(dir)) {
      const targetDir = path.join(assetsFolder, prefix);
      fs.mkdirSync(targetDir, { recursive: true });
      copyDirectoryRecursive(dir, targetDir, prefix, manifest.assets, manifest.hashes);
    }
  }
  console.log(`  ✓ Backed up ${manifest.assets.length} file assets from public and private storage`);

  // 3. Write Manifest
  const manifestPath = path.join(backupFolder, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

  // 4. Rotate Historical Backups
  rotateBackups(outputDirectory, RETENTION_COUNT);

  const durationMs = Date.now() - startTime;
  console.log(`[Backup] Completed successfully in ${durationMs}ms`);
  console.log(`[Backup] Manifest written to: ${manifestPath}\n`);

  return {
    backupFolder,
    manifest,
    durationMs,
  };
}

function rotateBackups(rootDir, maxKeep) {
  if (!fs.existsSync(rootDir)) return;
  const entries = fs.readdirSync(rootDir)
    .filter((name) => name.startsWith("backup-"))
    .map((name) => ({
      name,
      path: path.join(rootDir, name),
      ctime: fs.statSync(path.join(rootDir, name)).ctimeMs,
    }))
    .sort((a, b) => b.ctime - a.ctime);

  if (entries.length > maxKeep) {
    const toDelete = entries.slice(maxKeep);
    for (const item of toDelete) {
      try {
        fs.rmSync(item.path, { recursive: true, force: true });
        console.log(`  [Rotation] Removed old backup: ${item.name}`);
      } catch (err) {
        console.warn(`  [Rotation] Failed to remove ${item.name}:`, err.message);
      }
    }
  }
}

// Allow direct CLI execution
if (process.argv[1] && process.argv[1].endsWith("backup.js")) {
  runDatabaseBackup()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[Backup] FATAL ERROR:", err);
      process.exit(1);
    });
}
