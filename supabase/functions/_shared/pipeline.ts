// The Calvern pipeline: ground → generate → validate → save → illustrate.
// Shared by calvern-analyze (one word, on demand) and calvern-backfill (batches in the background),
// so every word in the database is produced by exactly the same path.

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CALVERN_JSON_SCHEMA,
  CALVERN_SCHEMA_VERSION,
  CALVERN_SYSTEM_PROMPT,
  type CalvernProfile,
  MIN_DEPTH,
  toLegacyColumns,
  validateProfile,
} from "./calvern.ts";

const AI_BASE_URL = (Deno.env.get("AI_BASE_URL") ?? "https://api.openai.com/v1").replace(/\/+$/, "");
const AI_API_KEY = Deno.env.get("AI_API_KEY") ?? Deno.env.get("OPENAI_API_KEY");
// AI_MODEL_PRIMARY lets us override a stale existing AI_MODEL secret without exposing or replacing credentials.
const AI_MODEL = Deno.env.get("AI_MODEL_PRIMARY") ?? Deno.env.get("AI_MODEL") ?? "gpt-4o-mini";
const AI_FALLBACK_MODEL = Deno.env.get("AI_FALLBACK_MODEL");
const MODELS = [AI_MODEL, ...(AI_FALLBACK_MODEL && AI_FALLBACK_MODEL !== AI_MODEL ? [AI_FALLBACK_MODEL] : [])];
const MAX_ATTEMPTS = 2;
// Edge functions have a wall-clock limit; a stalled model must hand over to the fallback in time.
const MODEL_TIMEOUT_MS = 35_000;

export const aiConfigured = () => Boolean(AI_API_KEY);

// --- Grounding: dictionary evidence handed to the model ----------------------

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

async function freeDictionary(word: string): Promise<string[]> {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (res.status === 404) return ["Free Dictionary API: no entry."];
    if (!res.ok) return [];
    const entries = (await res.json()) as {
      phonetic?: string;
      origin?: string;
      meanings?: { partOfSpeech: string; definitions: { definition: string }[] }[];
    }[];
    const origin = entries.map((e) => e.origin).find(Boolean);
    const phonetic = entries.map((e) => e.phonetic).find(Boolean);
    return [
      "Free Dictionary API:",
      ...(phonetic ? [`Phonetic: ${phonetic}`] : []),
      ...(origin ? [`Origin note: ${origin}`] : []),
      ...entries
        .flatMap((e) => e.meanings ?? [])
        .flatMap((m) => m.definitions.slice(0, 3).map((d) => `- (${m.partOfSpeech}) ${d.definition}`))
        .slice(0, 8),
    ];
  } catch {
    return [];
  }
}

async function wiktionary(word: string): Promise<string[]> {
  try {
    const res = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`, {
      signal: AbortSignal.timeout(4000),
      headers: { "User-Agent": "VocabGuru/1.0 (Calvern word profiles)" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { en?: { partOfSpeech: string; definitions: { definition: string }[] }[] };
    const senses = (data.en ?? [])
      .flatMap((p) => p.definitions.slice(0, 4).map((d) => `- (${p.partOfSpeech}) ${stripHtml(d.definition)}`))
      .filter((line) => line.length > 8)
      .slice(0, 12);
    return senses.length ? ["Wiktionary:", ...senses] : [];
  } catch {
    return [];
  }
}

// Grounding: real dictionary evidence handed to the model, from two independent free sources.
async function fetchEvidence(word: string): Promise<string> {
  const [fd, wk] = await Promise.all([freeDictionary(word), wiktionary(word)]);
  const lines = [...fd, ...wk];
  return lines.length
    ? ["Dictionary evidence (use it to stay accurate and to find senses; do not copy blindly):", ...lines].join("\n")
    : "";
}

// --- Generation ---------------------------------------------------------------

async function callModel(word: string, evidence: string, structured: boolean, model: string): Promise<Response> {
  const task = `Word: ${word}${evidence ? `\n\n${evidence}` : ""}`;
  return await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: "POST",
    signal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
    headers: { Authorization: `Bearer ${AI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: CALVERN_SYSTEM_PROMPT },
        {
          role: "user",
          content: structured
            ? task
            : `${task}\n\nReply with JSON only, matching this JSON Schema:\n${JSON.stringify(CALVERN_JSON_SCHEMA)}`,
        },
      ],
      response_format: structured
        ? { type: "json_schema", json_schema: { name: "calvern_profile", strict: true, schema: CALVERN_JSON_SCHEMA } }
        : { type: "json_object" },
    }),
  });
}

type Generated =
  | { ok: true; profile: CalvernProfile; model: string }
  | { ok: false; reason: "not_a_word" | "invalid"; errors: string[] };

async function generate(word: string): Promise<Generated> {
  const evidence = await fetchEvidence(word);
  let lastErrors: string[] = [];
  let best: { profile: CalvernProfile; model: string } | null = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let res: Response | undefined;
    let used = AI_MODEL;
    for (const model of MODELS) {
      used = model;
      try {
        res = await callModel(word, evidence, true, model);
        // Providers without json_schema support reject it with 400; fall back to plain JSON mode.
        if (res.status === 400) res = await callModel(word, evidence, false, model);
      } catch (e) {
        console.warn(`calvern: ${model} timed out or failed (${e}), trying next model`);
        res = undefined;
        continue;
      }
      // Overloaded or rate-limited: try the next model.
      if (res.status !== 429 && res.status < 500) break;
      console.warn(`calvern: ${model} returned ${res.status}, trying next model`);
    }
    if (!res || !res.ok) throw new Error(`model request failed: ${res?.status} ${await res?.text()}`);

    const data = await res.json();
    let parsed: unknown;
    try {
      parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "");
    } catch {
      lastErrors = ["model returned invalid JSON"];
      continue;
    }
    const result = validateProfile(parsed, word);
    if (result.ok) {
      if (!best || result.profile.quality.depth > best.profile.quality.depth) best = { profile: result.profile, model: used };
      // Quality gate: below the minimum depth, try once more and keep the deeper profile.
      if (result.profile.quality.depth >= MIN_DEPTH) break;
      console.warn(`calvern: ${word} depth ${result.profile.quality.depth} < ${MIN_DEPTH}, regenerating`);
      continue;
    }
    if (result.reason === "not_a_word") return result;
    lastErrors = result.errors;
  }
  if (best) return { ok: true, ...best };
  return { ok: false, reason: "invalid", errors: lastErrors };
}

// Content fingerprint: SHA-256 over the profile (minus the fingerprint itself), so any change is detectable.
async function fingerprint(profile: CalvernProfile): Promise<string> {
  const { quality, ...content } = profile;
  const bytes = new TextEncoder().encode(JSON.stringify({ ...content, depth: quality.depth }));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// --- Illustration: free stock photo matched to Calvern's image scene -----------

// Openverse matches every query word, so search short phrases one at a time, most representative first.
async function searchOpenverse(query: string): Promise<{ url: string; credit: string } | null> {
  try {
    const res = await fetch(
      `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=5&mature=false&aspect_ratio=wide`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return null;
    const { results } = (await res.json()) as {
      results?: { url: string; creator?: string; license: string; foreign_landing_url?: string }[];
    };
    const hit = results?.find((r) => r.url?.startsWith("https://"));
    if (!hit) return null;
    const who = hit.creator ? `${hit.creator} · ` : "";
    return { url: hit.url, credit: `${who}CC ${hit.license.toUpperCase()} · ${hit.foreign_landing_url ?? hit.url}` };
  } catch {
    return null;
  }
}

async function findImage(profile: CalvernProfile): Promise<{ url: string; credit: string } | null> {
  for (const phrase of profile.image_keywords.slice(0, 4)) {
    const hit = await searchOpenverse(phrase);
    if (hit) return hit;
  }
  return null;
}

// --- Orchestration --------------------------------------------------------------

export type PipelineResult =
  | { ok: true; id: string; profile: CalvernProfile; cached: boolean }
  | { ok: false; status: number; error: string; details?: string[] };

export async function analyzeAndStore(
  db: SupabaseClient,
  word: string,
  opts: { refresh?: boolean } = {},
): Promise<PipelineResult> {
  const { data: existing, error: readError } = await db
    .from("word_profiles")
    .select("id, profile, schema_version, status, image_url")
    .ilike("word", word)
    .maybeSingle();
  if (readError) return { ok: false, status: 500, error: readError.message };

  if (existing?.profile && existing.schema_version >= CALVERN_SCHEMA_VERSION && !opts.refresh) {
    return { ok: true, id: existing.id, profile: existing.profile, cached: true };
  }
  if (!aiConfigured()) return { ok: false, status: 503, error: "Calvern is not configured (AI_API_KEY missing)" };

  let generated: Generated;
  try {
    generated = await generate(word);
  } catch (e) {
    console.error("calvern: model error", word, e);
    return { ok: false, status: 502, error: "Calvern could not be reached. Try again shortly." };
  }

  if (!generated.ok) {
    // Only a definitive "not a word" sets a stored row aside; validation failures are retried later.
    if (existing && generated.reason === "not_a_word") {
      await db.rpc("quarantine_word", { p_word: word, p_reason: "not a recognised English word" });
    }
    return generated.reason === "not_a_word"
      ? { ok: false, status: 404, error: `"${word}" is not a recognised English word` }
      : { ok: false, status: 422, error: "Calvern's breakdown did not pass validation", details: generated.errors };
  }

  const { profile, model } = generated;
  profile.quality.fingerprint = await fingerprint(profile);
  const { data: id, error: saveError } = await db.rpc("save_calvern_profile", {
    p_word: profile.word, // may be a spelling correction of `word`
    p_profile: profile,
    p_legacy: toLegacyColumns(profile),
    p_schema_version: CALVERN_SCHEMA_VERSION,
    p_source: `calvern:${model}`,
  });
  if (saveError) return { ok: false, status: 500, error: saveError.message };

  // Existing pictures are kept; only words without one get a stock photo.
  if (!existing?.image_url && profile.image_keywords.length > 0) {
    const image = await findImage(profile);
    if (image) await db.from("word_profiles").update({ image_url: image.url, image_credit: image.credit }).eq("id", id);
  }

  return { ok: true, id, profile, cached: false };
}
