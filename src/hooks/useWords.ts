
import { useState, useCallback, useEffect } from 'react';
import { WordService } from '@/services/wordService';
import { Word } from '@/types/word';

interface UseWordsOptions {
  autoLoad?: boolean;
  limit?: number;
}

export function useWords(options: UseWordsOptions = {}) {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { autoLoad = true, limit = 20 } = options;

  const loadWords = useCallback(async (searchQuery?: string) => {
    setLoading(true);
    setError(null);

    try {
      let results: Word[];
      
      if (searchQuery) {
        results = await WordService.searchWords(searchQuery, { limit });
      } else {
        const { words: fetchedWords } = await WordService.getWords(0, limit);
        results = fetchedWords;
      }

      setWords(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load words');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const getWordById = useCallback(async (id: string): Promise<Word | null> => {
    try {
      return await WordService.getWordById(id);
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
      const results = await WordService.getWordsForStudy(criteria);
      setWords(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load study words');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      // Initialize database first
      WordService.initializeDatabase().then(() => {
        loadWords();
      });
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
