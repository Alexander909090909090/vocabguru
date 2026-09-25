// The Calvern pipeline: ground → generate → validate → save → illustrate.
// Shared by calvern-analyze (one word, on demand) and calvern-backfill (batches in the background),
// so every word in the database is produced by exactly the same path.

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CALVERN_JSON_SCHEMA,
  CALVERN_SCHEMA_VERSION,
  CALVERN_SYSTEM_PROMPT,
  type CalvernProfile,
  toLegacyColumns,
  validateProfile,
} from "./calvern.ts";

const AI_BASE_URL = (Deno.env.get("AI_BASE_URL") ?? "https://api.openai.com/v1").replace(/\/+$/, "");
const AI_API_KEY = Deno.env.get("AI_API_KEY") ?? Deno.env.get("OPENAI_API_KEY");
const AI_MODEL = Deno.env.get("AI_MODEL") ?? "gpt-4o-mini";
const AI_FALLBACK_MODEL = Deno.env.get("AI_FALLBACK_MODEL");
const MODELS = [AI_MODEL, ...(AI_FALLBACK_MODEL && AI_FALLBACK_MODEL !== AI_MODEL ? [AI_FALLBACK_MODEL] : [])];
const MAX_ATTEMPTS = 2;

export const aiConfigured = () => Boolean(AI_API_KEY);

// --- Grounding: dictionary evidence handed to the model ----------------------

async function fetchEvidence(word: string): Promise<string> {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (res.status === 404) return "Dictionary evidence: no entry found in the Free Dictionary API.";
    if (!res.ok) return "";
    const entries = (await res.json()) as {
      phonetic?: string;
      origin?: string;
      meanings?: { partOfSpeech: string; definitions: { definition: string }[] }[];
    }[];
    const senses = entries
      .flatMap((e) => e.meanings ?? [])
      .flatMap((m) => m.definitions.slice(0, 3).map((d) => `(${m.partOfSpeech}) ${d.definition}`))
      .slice(0, 8);
    const origin = entries.map((e) => e.origin).find(Boolean);
    const phonetic = entries.map((e) => e.phonetic).find(Boolean);
    return [
      "Dictionary evidence (Free Dictionary API; use it to stay accurate, do not copy blindly):",
      phonetic && `Phonetic: ${phonetic}`,
      origin && `Origin note: ${origin}`,
      ...senses.map((s) => `- ${s}`),
    ]
      .filter(Boolean)
      .join("\n");
  } catch {
    return "";
  }
}

// --- Generation ---------------------------------------------------------------

async function callModel(word: string, evidence: string, structured: boolean, model: string): Promise<Response> {
  const task = `Word: ${word}${evidence ? `\n\n${evidence}` : ""}`;
  return await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: "POST",
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
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let res: Response | undefined;
    let used = AI_MODEL;
    for (const model of MODELS) {
      used = model;
      res = await callModel(word, evidence, true, model);
      // Providers without json_schema support reject it with 400; fall back to plain JSON mode.
      if (res.status === 400) res = await callModel(word, evidence, false, model);
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
    if (result.ok) return { ok: true, profile: result.profile, model: used };
    if (result.reason === "not_a_word") return result;
    lastErrors = result.errors;
  }
  return { ok: false, reason: "invalid", errors: lastErrors };
}

// --- Illustration: free stock photo matched to Calvern's image scene -----------

const STOPWORDS = new Set("a an the of in on at to with and or for by from into over under its their his her".split(" "));

async function findImage(scene: string): Promise<{ url: string; credit: string } | null> {
  const query = scene
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
    .slice(0, 6)
    .join(" ");
  if (!query) return null;
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
  const { data: id, error: saveError } = await db.rpc("save_calvern_profile", {
    p_word: profile.word, // may be a spelling correction of `word`
    p_profile: profile,
    p_legacy: toLegacyColumns(profile),
    p_schema_version: CALVERN_SCHEMA_VERSION,
    p_source: `calvern:${model}`,
  });
  if (saveError) return { ok: false, status: 500, error: saveError.message };

  // Existing pictures are kept; only words without one get a stock photo.
  if (!existing?.image_url && profile.image_scene) {
    const image = await findImage(profile.image_scene);
    if (image) await db.from("word_profiles").update({ image_url: image.url, image_credit: image.credit }).eq("id", id);
  }

  return { ok: true, id, profile, cached: false };
}
