
import { useState, useEffect } from "react";
import { WordProfile } from "@/types/wordProfile";
import { WordProfileService } from "@/services/wordProfileService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useWordProfiles() {
  const [wordProfiles, setWordProfiles] = useState<WordProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWordProfiles();
    setupRealtimeSubscription();
  }, []);

  const loadWordProfiles = async () => {
    try {
      setLoading(true);
      const profiles = await WordProfileService.getAllWordProfiles();
      setWordProfiles(profiles);
      setError(null);
    } catch (err) {
      console.error('Error loading word profiles:', err);
      setError('Failed to load word profiles');
      toast.error('Failed to load word profiles');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('word-profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'word_profiles'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setWordProfiles(prev => [payload.new as WordProfile, ...prev]);
            toast.success(`New word added: ${(payload.new as WordProfile).word}`);
          } else if (payload.eventType === 'UPDATE') {
            setWordProfiles(prev => 
              prev.map(profile => 
                profile.id === payload.new.id ? payload.new as WordProfile : profile
              )
            );
            toast.success(`Word updated: ${(payload.new as WordProfile).word}`);
          } else if (payload.eventType === 'DELETE') {
            setWordProfiles(prev => 
              prev.filter(profile => profile.id !== payload.old.id)
            );
            toast.success('Word deleted');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const refreshWordProfiles = () => {
    loadWordProfiles();
  };

  return {
    wordProfiles,
    loading,
    error,
    refreshWordProfiles
  };
}

export function useWordProfile(wordId: string) {
  const [wordProfile, setWordProfile] = useState<WordProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (wordId) {
      loadWordProfile(wordId);
    }
  }, [wordId]);

  const loadWordProfile = async (id: string) => {
    try {
      setLoading(true);
      const profile = await WordProfileService.getWordProfileById(id);
      setWordProfile(profile);
      setError(null);
    } catch (err) {
      console.error('Error loading word profile:', err);
      setError('Failed to load word profile');
      toast.error('Failed to load word profile');
    } finally {
      setLoading(false);
    }
  };

  return {
    wordProfile,
    loading,
    error,
    refreshWordProfile: () => loadWordProfile(wordId)
  };
}
