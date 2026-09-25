// calvern-analyze: the one entry point for looking a word up.
// Returns the stored profile when it is current; otherwise runs the shared pipeline
// (ground → generate → validate → save → illustrate). Every lookup counts toward popularity.
//
// Secrets (Supabase → Edge Functions → Secrets), any OpenAI-compatible provider:
//   AI_BASE_URL, AI_API_KEY, AI_MODEL, AI_FALLBACK_MODEL (optional)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { normalizeWord } from "../_shared/calvern.ts";
import { analyzeAndStore } from "../_shared/pipeline.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

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
  const result = await analyzeAndStore(db, word, { refresh: body.refresh === true });

  if (!result.ok) return json({ error: result.error, details: result.details }, result.status);

  await db.rpc("record_word_lookup", { p_id: result.id });
  return json({ id: result.id, profile: result.profile, cached: result.cached });
});
