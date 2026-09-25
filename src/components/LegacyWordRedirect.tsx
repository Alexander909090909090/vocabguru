import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import staticWords from "@/data/words";

// Old links (/word/:id) now resolve to the single word page (/w/:word).
export function LegacyWordRedirect() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const go = (word: string) => navigate(`/w/${encodeURIComponent(word.toLowerCase())}`, { replace: true });
    const local = staticWords.find((w) => w.id === id);
    if (local) return go(local.word);
    supabase
      .from("word_profiles")
      .select("word")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => (data ? go(data.word) : navigate("/", { replace: true })));
  }, [id, navigate]);

  return null;
}
