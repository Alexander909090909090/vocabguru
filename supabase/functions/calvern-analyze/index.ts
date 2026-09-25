// calvern-analyze: the one entry point for breaking a word down.
// Returns the stored profile when one exists at the current schema version;
// otherwise asks the model, validates the answer, and saves it atomically.
//
// Model provider is any OpenAI-compatible chat-completions API:
//   AI_BASE_URL  default https://api.openai.com/v1   (Groq, OpenRouter, Together… also work)
//   AI_API_KEY   falls back to OPENAI_API_KEY
//   AI_MODEL     default gpt-4o-mini

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CALVERN_JSON_SCHEMA,
  CALVERN_SCHEMA_VERSION,
  CALVERN_SYSTEM_PROMPT,
  normalizeWord,
  toLegacyColumns,
  validateProfile,
} from "../_shared/calvern.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const AI_BASE_URL = (Deno.env.get("AI_BASE_URL") ?? "https://api.openai.com/v1").replace(/\/+$/, "");
const AI_API_KEY = Deno.env.get("AI_API_KEY") ?? Deno.env.get("LOVABLE_API_KEY") ?? Deno.env.get("OPENAI_API_KEY");
const AI_MODEL = Deno.env.get("AI_MODEL") ?? "gpt-4o-mini";
const MAX_ATTEMPTS = 2;

async function callModel(word: string, structured: boolean): Promise<Response> {
  return await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${AI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: AI_MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: CALVERN_SYSTEM_PROMPT },
        {
          role: "user",
          content: structured
            ? `Word: ${word}`
            : `Word: ${word}\nReply with JSON only, matching this JSON Schema:\n${JSON.stringify(CALVERN_JSON_SCHEMA)}`,
        },
      ],
      response_format: structured
        ? { type: "json_schema", json_schema: { name: "calvern_profile", strict: true, schema: CALVERN_JSON_SCHEMA } }
        : { type: "json_object" },
    }),
  });
}

async function generateProfile(word: string) {
  let lastErrors: string[] = [];
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let res = await callModel(word, true);
    // Providers without json_schema support reject it with 400; fall back to plain JSON mode.
    if (res.status === 400) res = await callModel(word, false);
    if (!res.ok) throw new Error(`model request failed: ${res.status} ${await res.text()}`);

    const data = await res.json();
    let parsed: unknown;
    try {
      parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "");
    } catch {
      lastErrors = ["model returned invalid JSON"];
      continue;
    }
    const result = validateProfile(parsed, word);
    if (result.ok || result.reason === "not_a_word") return result;
    lastErrors = result.errors;
  }
  return { ok: false as const, reason: "invalid" as const, errors: lastErrors };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  let body: { word?: unknown; refresh?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "body must be JSON: { word }" }, 400);
  }

  const word = typeof body.word === "string" ? normalizeWord(body.word) : null;
  if (!word) return json({ error: "enter a single English word or short phrase" }, 400);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: existing, error: readError } = await db
    .from("word_profiles")
    .select("id, word, profile, schema_version")
    .ilike("word", word)
    .maybeSingle();
  if (readError) return json({ error: readError.message }, 500);

  if (existing?.profile && existing.schema_version >= CALVERN_SCHEMA_VERSION && body.refresh !== true) {
    return json({ id: existing.id, profile: existing.profile, cached: true });
  }

  if (!AI_API_KEY) return json({ error: "Calvern is not configured (AI_API_KEY missing)" }, 503);

  let result;
  try {
    result = await generateProfile(word);
  } catch (e) {
    console.error("calvern-analyze model error:", e);
    return json({ error: "Calvern could not be reached. Try again shortly." }, 502);
  }

  if (!result.ok) {
    if (result.reason === "not_a_word") return json({ error: `"${word}" is not a recognised English word` }, 404);
    console.error("calvern-analyze validation failed:", word, result.errors);
    return json({ error: "Calvern's breakdown did not pass validation", details: result.errors }, 422);
  }

  const { data: id, error: saveError } = await db.rpc("save_calvern_profile", {
    p_word: result.profile.word, // may be a spelling correction of `word`
    p_profile: result.profile,
    p_legacy: toLegacyColumns(result.profile),
    p_schema_version: CALVERN_SCHEMA_VERSION,
    p_source: `calvern:${AI_MODEL}`,
  });
  if (saveError) return json({ error: saveError.message }, 500);

  return json({ id, profile: result.profile, cached: false });
});
