// Runs every word in a list through the calvern-analyze edge function, so each one is
// generated, validated and stored exactly like a live search. Safe to re-run: words
// already stored at the current schema version come back from the cache.
//
// Usage:
//   SUPABASE_URL=https://<ref>.supabase.co SUPABASE_SERVICE_ROLE_KEY=... \
//     node scripts/seed-calvern.mjs supabase/seed/legacy_words.txt
//
// DELAY_MS (default 2500) spaces requests out to stay inside free-tier model rate limits.

import { readFileSync } from "node:fs";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const file = process.argv[2];
const delayMs = Number(process.env.DELAY_MS ?? 2500);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !file) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, and pass a word-list file.");
  process.exit(1);
}

const words = readFileSync(file, "utf8")
  .split("\n")
  .map((w) => w.trim())
  .filter(Boolean);

const tally = { stored: 0, cached: 0, corrected: 0, rejected: 0, failed: 0 };

for (const [i, word] of words.entries()) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/calvern-analyze`, {
    method: "POST",
    headers: { Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ word }),
  });
  const body = await res.json().catch(() => ({}));
  const tag = `[${i + 1}/${words.length}] ${word}`;

  if (res.ok) {
    const stored = body.profile.word;
    if (body.cached) tally.cached++;
    else tally.stored++;
    if (stored !== word.toLowerCase()) {
      tally.corrected++;
      console.log(`${tag} → corrected to "${stored}"`);
    } else {
      console.log(`${tag} ✓${body.cached ? " (cached)" : ""}`);
    }
  } else if (res.status === 404) {
    tally.rejected++;
    console.log(`${tag} ✗ not an English word`);
  } else {
    tally.failed++;
    console.log(`${tag} ✗ ${res.status} ${body.error ?? ""} ${(body.details ?? []).join("; ")}`);
  }

  if (!body.cached) await new Promise((r) => setTimeout(r, delayMs));
}

console.log("\nDone:", tally);
