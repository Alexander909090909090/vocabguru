import { supabase } from "@/integrations/supabase/client";
import type { CalvernProfile } from "../../supabase/functions/_shared/calvern";

export type { CalvernProfile, CalvernMorpheme } from "../../supabase/functions/_shared/calvern";

export interface CalvernResult {
  id: string;
  profile: CalvernProfile;
  cached: boolean;
}

// Breaks a word down via the calvern-analyze edge function (cached per word in word_profiles).
export async function analyzeWord(word: string, refresh = false): Promise<CalvernResult> {
  const { data, error } = await supabase.functions.invoke("calvern-analyze", { body: { word, refresh } });
  if (error) {
    // FunctionsHttpError carries the function's JSON body in `context`.
    const body = await (error as { context?: Response }).context?.json?.().catch(() => null);
    throw new Error(body?.error ?? error.message);
  }
  return data as CalvernResult;
}
