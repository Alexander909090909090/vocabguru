
import { useState, useEffect } from 'react';
import { UserWordLibraryService, type UserWordLibraryEntry, type UserStudyStats } from '@/services/userWordLibraryService';
import { useAuth } from '@/context/AuthContext';

export function useUserWordLibrary() {
  const { user } = useAuth();
  const [library, setLibrary] = useState<UserWordLibraryEntry[]>([]);
  const [stats, setStats] = useState<UserStudyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLibrary = async (filters?: {
    mastery_level?: number;
    is_favorite?: boolean;
    limit?: number;
    offset?: number;
  }) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const data = await UserWordLibraryService.getUserWordLibrary(filters);
      setLibrary(data);
    } catch (err) {
      setError('Failed to load word library');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      const data = await UserWordLibraryService.getUserStudyStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const addToLibrary = async (wordId: string, notes?: string) => {
    const result = await UserWordLibraryService.addWordToLibrary(wordId, notes);
    if (result) {
      await loadLibrary();
      await loadStats();
    }
    return result;
  };

  const updateProgress = async (wordId: string, updates: {
    mastery_level?: number;
    notes?: string;
    is_favorite?: boolean;
  }) => {
    const success = await UserWordLibraryService.updateWordProgress(wordId, updates);
    if (success) {
      await loadLibrary();
      await loadStats();
    }
    return success;
  };

  const removeFromLibrary = async (wordId: string) => {
    const success = await UserWordLibraryService.removeFromLibrary(wordId);
    if (success) {
      await loadLibrary();
      await loadStats();
    }
    return success;
  };

  const isWordInLibrary = (wordId: string): boolean => {
    return library.some(entry => entry.word_id === wordId);
  };

  const getWordProgress = (wordId: string): UserWordLibraryEntry | null => {
    return library.find(entry => entry.word_id === wordId) || null;
  };

  useEffect(() => {
    if (user) {
      loadLibrary();
      loadStats();
    }
  }, [user]);

  return {
    library,
    stats,
    loading,
    error,
    loadLibrary,
    loadStats,
    addToLibrary,
    updateProgress,
    removeFromLibrary,
    isWordInLibrary,
    getWordProgress,
    refresh: () => {
      loadLibrary();
      loadStats();
    }
  };
}
