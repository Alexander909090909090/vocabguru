
import { useState, useEffect, useCallback } from 'react';
import { UnifiedWordService } from '@/services/unifiedWordService';
import { WordRepositoryEntry } from '@/services/wordRepositoryService';
import { EnhancedWordProfile } from '@/types/enhancedWordProfile';

interface UseOptimizedWordsOptions {
  autoLoad?: boolean;
  cacheResults?: boolean;
  limit?: number;
}

export function useOptimizedWords(options: UseOptimizedWordsOptions = {}) {
  const [words, setWords] = useState<WordRepositoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { autoLoad = true, cacheResults = true, limit = 20 } = options;

  const loadWords = useCallback(async (searchQuery?: string) => {
    setLoading(true);
    setError(null);

    try {
      let results: WordRepositoryEntry[];
      
      if (searchQuery) {
        results = await UnifiedWordService.searchWords(searchQuery, { limit });
      } else {
        results = await UnifiedWordService.getWordsForStudy({ limit });
      }

      setWords(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load words');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const getWordById = useCallback(async (id: string): Promise<EnhancedWordProfile | null> => {
    try {
      return await UnifiedWordService.getWordById(id);
    } catch (err) {
      console.error('Error fetching word:', err);
      return null;
    }
  }, []);

  const searchWords = useCallback(async (query: string) => {
    await loadWords(query);
  }, [loadWords]);

  const getStudyWords = useCallback(async (criteria: {
    difficultyLevel?: string;
    partOfSpeech?: string;
    limit?: number;
  } = {}) => {
    setLoading(true);
    try {
      const results = await UnifiedWordService.getWordsForStudy(criteria);
      setWords(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load study words');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadWords();
    }
  }, [autoLoad, loadWords]);

  return {
    words,
    loading,
    error,
    loadWords,
    getWordById,
    searchWords,
    getStudyWords,
    refresh: () => loadWords()
  };
}
