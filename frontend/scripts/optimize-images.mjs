/**
 * Image optimization stub (Phase 2).
 *
 * Does NOT rewrite assets. Lists the largest images under public/ and
 * recommends AVIF (or WebP) conversion when `sharp` is available.
 *
 * Usage: node scripts/optimize-images.mjs
 *
 * Follow-up: install sharp and convert the top offenders, e.g.
 *   npx sharp-cli -i public/Images/Projects/foo.jpg -o public/Images/Projects/foo.avif
 */

import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

async function walk(dir, files = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    console.error(`Cannot read ${dir}:`, error.message);
    return files;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, files);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXT.has(ext)) continue;
    const info = await stat(full);
    files.push({
      path: path.relative(ROOT, full).replaceAll("\\", "/"),
      bytes: info.size,
      ext,
    });
  }
  return files;
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

async function main() {
  let sharpAvailable = false;
  try {
    await import("sharp");
    sharpAvailable = true;
  } catch {
    sharpAvailable = false;
  }

  const images = await walk(PUBLIC_DIR);
  images.sort((a, b) => b.bytes - a.bytes);

  const top = images.slice(0, 15);
  const totalBytes = images.reduce((sum, img) => sum + img.bytes, 0);

  console.log("\nPortfolio image audit (stub — no files rewritten)\n");
  console.log(`Found ${images.length} images under public/ (${formatBytes(totalBytes)} total)`);
  console.log(`sharp available: ${sharpAvailable ? "yes" : "no — install to enable conversion"}`);
  console.log("\nLargest images:");
  for (const img of top) {
    const hint = img.ext === ".avif" ? "" : "  → recommend AVIF";
    console.log(`  ${formatBytes(img.bytes).padStart(10)}  ${img.path}${hint}`);
  }

  console.log(`
Recommendations:
  1. Convert JPEG/PNG heroes and project covers to AVIF (keep originals as fallback).
  2. Cap display sizes via ProgressiveImage width/height + sizes attributes.
  3. Re-run this script after conversion to confirm size wins.
  4. When ready for automated conversion, extend this script with sharp — do not
     mass-rewrite until sharp is a project dependency and output paths are reviewed.
`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
