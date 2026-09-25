// calvern-backfill: background worker that closes the growth and quality loops.
// Each run processes a small batch through the same pipeline as a live lookup:
//   1. stored words below the current schema version (legacy / thin profiles), most looked-up first
//   2. then pending words in word_queue (imports, and later: neighbours of saved words)
// Scheduled by pg_cron; safe to run repeatedly. Service role only.
//
// Body (optional): { "limit": 5 }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CALVERN_SCHEMA_VERSION, normalizeWord } from "../_shared/calvern.ts";
import { aiConfigured, analyzeAndStore } from "../_shared/pipeline.ts";

const MAX_LIMIT = 20;
const MAX_ATTEMPTS = 3;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

serve(async (req) => {
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (req.headers.get("Authorization") !== `Bearer ${serviceKey}`) return json({ error: "forbidden" }, 403);
  if (!aiConfigured()) return json({ error: "AI not configured" }, 503);

  const body = await req.json().catch(() => ({}));
  const limit = Math.min(Math.max(Number(body.limit) || 5, 1), MAX_LIMIT);
  const db = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);
  const report: { word: string; outcome: string }[] = [];

  // 1. Stale stored words.
  const { data: stale } = await db
    .from("word_profiles")
    .select("word")
    .eq("status", "active")
    .lt("schema_version", CALVERN_SCHEMA_VERSION)
    .lt("regen_attempts", MAX_ATTEMPTS)
    .order("lookup_count", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(limit);

  for (const row of stale ?? []) {
    const word = normalizeWord(row.word);
    if (!word) {
      await db.rpc("quarantine_word", { p_word: row.word, p_reason: "not a valid word form" });
      report.push({ word: row.word, outcome: "quarantined: invalid form" });
      continue;
    }
    const r = await analyzeAndStore(db, word, { refresh: true });
    if (r.ok && r.profile.word !== word) {
      // Stored under a misspelling; the corrected word now has its own row.
      await db.rpc("quarantine_word", { p_word: word, p_reason: `misspelling of "${r.profile.word}"` });
      report.push({ word, outcome: `corrected to ${r.profile.word}` });
    } else if (r.ok) {
      report.push({ word, outcome: "regenerated" });
    } else {
      // Counts toward MAX_ATTEMPTS; quarantined when exhausted so it stops blocking the batch.
      await db.rpc("note_regen_failure", { p_word: word, p_error: r.error, p_max_attempts: MAX_ATTEMPTS });
      report.push({ word, outcome: `${r.status} ${r.error}` });
    }
  }

  // 2. Queue, with whatever budget is left.
  const remaining = limit - (stale?.length ?? 0);
  if (remaining > 0) {
    const { data: queued } = await db
      .from("word_queue")
      .select("word, attempts")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(remaining);

    for (const q of queued ?? []) {
      const r = await analyzeAndStore(db, q.word);
      const attempts = q.attempts + 1;
      const status = r.ok
        ? "done"
        : r.status === 404
          ? "rejected"
          : attempts >= MAX_ATTEMPTS
            ? "failed"
            : "pending";
      await db
        .from("word_queue")
        .update({ status, attempts, last_error: r.ok ? null : r.error, processed_at: new Date().toISOString() })
        .eq("word", q.word);
      report.push({ word: q.word, outcome: r.ok ? (r.cached ? "already stored" : "created") : `${status}: ${r.error}` });
    }
  }

  return json({ processed: report.length, report });
});
