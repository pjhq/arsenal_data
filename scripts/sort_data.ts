import { readdir, stat } from "node:fs/promises";
import * as path from "node:path";

const repoRoot = path.resolve(import.meta.dir, "..");
const dataArsenalDir = path.join(repoRoot, "data_arsenal");

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function findDuplicates(values: string[]): string[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([value]) => value)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

function sortAlphabetically(values: string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

async function getJsonFilesUnder(dir: string): Promise<string[]> {
  const result: string[] = [];

  const entries = await readdir(dir);
  for (const entry of entries) {
    const entryPath = path.join(dir, entry);
    const entryStat = await stat(entryPath);

    if (entryStat.isDirectory()) {
      const nestedEntries = await readdir(entryPath);
      for (const nestedEntry of nestedEntries) {
        if (!nestedEntry.toLowerCase().endsWith(".json")) continue;
        result.push(path.join(entryPath, nestedEntry));
      }
      continue;
    }

    if (entryStat.isFile() && entry.toLowerCase().endsWith(".json")) {
      result.push(entryPath);
    }
  }

  return result;
}

async function processJsonFile(filePath: string): Promise<{ changed: boolean } | { skipped: true } | { failed: true; reason: string }> {
  try {
    const exists = await Bun.file(filePath).exists();
    if (!exists) return { skipped: true };

    const originalText = await Bun.file(filePath).text();

    let parsed: unknown;
    try {
      parsed = JSON.parse(originalText);
    } catch (error) {
      return { failed: true, reason: `Invalid JSON: ${formatError(error)}` };
    }

    if (!Array.isArray(parsed)) {
      return { failed: true, reason: `Expected JSON array but got ${typeof parsed}` };
    }

    const asStrings = parsed.map((v) => String(v));
    const duplicates = findDuplicates(asStrings);
    if (duplicates.length > 0) {
      console.warn(`[duplicates] ${filePath}: ${duplicates.length} duplicate values found`);
      for (const dup of duplicates) {
        console.warn(`  - ${dup}`);
      }
    }

    const uniqueSorted = sortAlphabetically(Array.from(new Set(asStrings)));
    const nextText = JSON.stringify(uniqueSorted, null, 2) + "\n";

    if (nextText === originalText) {
      return { changed: false };
    }

    await Bun.write(filePath, nextText);
    return { changed: true };
  } catch (error) {
    return { failed: true, reason: formatError(error) };
  }
}

if (import.meta.main) {
  const started = Date.now();

  let processed = 0;
  let changed = 0;
  let skipped = 0;
  let failed = 0;

  try {
    const jsonFiles = await getJsonFilesUnder(dataArsenalDir);
    for (const filePath of jsonFiles) {
      const result = await processJsonFile(filePath);

      if ("skipped" in result) {
        skipped++;
        continue;
      }

      if ("failed" in result) {
        failed++;
        console.error(`[failed] ${filePath}: ${result.reason}`);
        continue;
      }

      processed++;
      if (result.changed) changed++;
    }
  } catch (error) {
    console.error(`Failed to scan ${dataArsenalDir}: ${formatError(error)}`);
    process.exit(1);
  }

  const durationMs = Date.now() - started;
  console.log(`Processed ${processed} files (${changed} updated, ${skipped} skipped, ${failed} failed) in ${durationMs}ms`);
}