import { supabase } from "@/integrations/supabase/client";
import type { CalvernProfile } from "../../supabase/functions/_shared/calvern";

export type { CalvernProfile, CalvernMorpheme } from "../../supabase/functions/_shared/calvern";

export interface CalvernResult {
  id: string;
  profile: CalvernProfile;
  cached: boolean;
}

async function getStoredProfile(word: string): Promise<CalvernResult | null> {
  const cleanWord = word.trim();
  if (!cleanWord) return null;

  const { data, error } = await supabase
    .from("word_profiles")
    .select("id, profile")
    .ilike("word", cleanWord)
    .eq("status", "active")
    .not("profile", "is", null)
    .maybeSingle();

  if (error || !data?.profile) return null;

  return {
    id: data.id,
    profile: data.profile as CalvernProfile,
    cached: true,
  };
}

// Breaks a word down via the calvern-analyze edge function (cached per word in word_profiles).
export async function analyzeWord(word: string, refresh = false): Promise<CalvernResult> {
  const { data, error } = await supabase.functions.invoke("calvern-analyze", { body: { word, refresh } });
  if (error) {
    // FunctionsHttpError carries the function's JSON body in `context`.
    const body = await (error as { context?: Response }).context?.json?.().catch(() => null);
    const stored = await getStoredProfile(word);
    if (stored) return stored;

    throw new Error(body?.error ?? "Calvern is temporarily busy. Try again shortly.");
  }
  return data as CalvernResult;
}
