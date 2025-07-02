
import { useState, useEffect } from 'react';
import { UnifiedWordService } from '@/services/unifiedWordService';
import { EnhancedWordProfile } from '@/types/enhancedWordProfile';
import { WordRepositoryEntry } from '@/services/wordRepositoryService';

export function useUnifiedWords() {
  const [words, setWords] = useState<WordRepositoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      setLoading(true);
      const wordsData = await UnifiedWordService.searchWords('', { limit: 100 });
      setWords(wordsData);
      setError(null);
    } catch (err) {
      console.error('Error loading unified words:', err);
      setError('Failed to load words');
    } finally {
      setLoading(false);
    }
  };

  const getWordById = async (id: string): Promise<EnhancedWordProfile | null> => {
    try {
      return await UnifiedWordService.getWordById(id);
    } catch (error) {
      console.error('Error getting word by ID:', error);
      return null;
    }
  };

  const searchWords = async (query: string): Promise<WordRepositoryEntry[]> => {
    try {
      return await UnifiedWordService.searchWords(query);
    } catch (error) {
      console.error('Error searching words:', error);
      return [];
    }
  };

  return {
    words,
    loading,
    error,
    getWordById,
    searchWords,
    refreshWords: loadWords
  };
}
