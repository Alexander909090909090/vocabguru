import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, BookmarkCheck, BookmarkPlus, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalvernProfileView } from "@/components/Calvern/CalvernProfileView";
import { analyzeWord } from "@/services/calvernService";
import { UserWordLibraryService } from "@/services/userWordLibraryService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const WordProfile = () => {
  const { word = "" } = useParams<{ word: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [savingLibrary, setSavingLibrary] = useState(false);

  const analysis = useQuery({
    queryKey: ["calvern", word.toLowerCase()],
    queryFn: () => analyzeWord(word),
    retry: false,
    staleTime: Infinity,
  });
  const wordId = analysis.data?.id;

  const saved = useQuery({
    queryKey: ["library-entry", user?.id, wordId],
    enabled: Boolean(user && wordId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_word_library")
        .select("id")
        .eq("user_id", user!.id)
        .eq("word_id", wordId!)
        .maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },
  });

  const toggleLibrary = async () => {
    if (!wordId) return;
    setSavingLibrary(true);
    if (saved.data) await UserWordLibraryService.removeFromLibrary(wordId);
    else await UserWordLibraryService.addWordToLibrary(wordId);
    await saved.refetch();
    setSavingLibrary(false);
  };

  const regenerate = async () => {
    await queryClient.fetchQuery({
      queryKey: ["calvern", word.toLowerCase()],
      queryFn: () => analyzeWord(word, true),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="page-container pt-24 pb-16 max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Given word</p>
            <h1 className="text-4xl md:text-5xl font-bold">{analysis.data?.profile.word ?? word}</h1>
            {analysis.data && analysis.data.profile.word !== word.toLowerCase() && (
              <p className="text-sm text-muted-foreground">Showing results for “{analysis.data.profile.word}” (you typed “{word}”)</p>
            )}
            {analysis.data?.profile.analysis.pronunciation.ipa[0] && (
              <p className="text-muted-foreground mt-1">{analysis.data.profile.analysis.pronunciation.ipa[0]}</p>
            )}
          </div>
          {analysis.data && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={regenerate} disabled={analysis.isFetching}>
                <RefreshCw className={`h-4 w-4 ${analysis.isFetching ? "animate-spin" : ""}`} /> Regenerate
              </Button>
              <Button size="sm" className="gap-2" onClick={toggleLibrary} disabled={savingLibrary || saved.isLoading}>
                {saved.data ? <BookmarkCheck className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
                {saved.data ? "In your library" : "Save to library"}
              </Button>
            </div>
          )}
        </header>

        {analysis.isLoading && (
          <div className="space-y-4">
            <p className="text-muted-foreground">Calvern is breaking down “{word}”…</p>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        )}

        {analysis.error && (
          <div className="glass-card rounded-2xl p-6 space-y-3">
            <p className="font-semibold">Couldn't break down “{word}”.</p>
            <p className="text-muted-foreground">{(analysis.error as Error).message}</p>
            <Button variant="outline" size="sm" onClick={() => analysis.refetch()}>
              Try again
            </Button>
          </div>
        )}

        {analysis.data && <CalvernProfileView profile={analysis.data.profile} />}
      </main>
    </div>
  );
};

export default WordProfile;
