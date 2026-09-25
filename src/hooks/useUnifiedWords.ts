import { useState, useEffect, useCallback } from 'react';
import { Word } from '@/data/words';
import { WordRepositoryEntry } from '@/services/wordRepositoryService';
import { EnhancedWordProfile } from '@/types/enhancedWordProfile';
import { supabase } from '@/integrations/supabase/client';
import originalWords from '@/data/words';

// Unified hook that combines all word sources for the homepage
export interface UnifiedWord extends Word {
  // Additional database fields
  quality_score?: number;
  completeness_score?: number;
  enrichment_status?: string;
  source?: 'legacy' | 'database' | 'dictionary';
}

export function useUnifiedWords() {
  const [allWords, setAllWords] = useState<UnifiedWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAllWords = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Load database word profiles
      const { data: dbWords, error: dbError } = await supabase
        .from('word_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      let combinedWords: UnifiedWord[] = [];

      // Convert database words to UnifiedWord format
      if (dbWords && dbWords.length > 0) {
        const dbUnifiedWords = dbWords.map(dbWord => convertDbWordToUnified(dbWord));
        combinedWords = [...dbUnifiedWords];
      }

      // Add original words that aren't in database
      const dbWordTexts = new Set(combinedWords.map(w => w.word.toLowerCase()));
      const uniqueOriginalWords = originalWords
        .filter(word => !dbWordTexts.has(word.word.toLowerCase()))
        .map(word => ({ ...word, source: 'legacy' as const }));
      
      combinedWords = [...combinedWords, ...uniqueOriginalWords];

      // Load dictionary words from localStorage
      try {
        const saved = localStorage.getItem("vocabguru-dictionary-words");
        if (saved) {
          const dictionaryWords: Word[] = JSON.parse(saved);
          const dictionaryWordTexts = new Set(combinedWords.map(w => w.word.toLowerCase()));
          
          const uniqueDictionaryWords = dictionaryWords
            .filter(word => !dictionaryWordTexts.has(word.word.toLowerCase()))
            .map(word => ({ ...word, source: 'dictionary' as const }));
          
          combinedWords = [...combinedWords, ...uniqueDictionaryWords];
        }
      } catch (localStorageError) {
        console.error('Error loading dictionary words:', localStorageError);
      }

      setAllWords(combinedWords);
      console.log(`Loaded ${combinedWords.length} total words: ${dbWords?.length || 0} from database, ${uniqueOriginalWords.length} legacy, dictionary words from localStorage`);
      
    } catch (err) {
      console.error('Error loading unified words:', err);
      setError(err instanceof Error ? err.message : 'Failed to load words');
      
      // Fallback to original words only
      setAllWords(originalWords.map(word => ({ ...word, source: 'legacy' as const })));
    } finally {
      setLoading(false);
    }
  }, []);

  // Convert database word profile to UnifiedWord format
  const convertDbWordToUnified = (dbWord: any): UnifiedWord => {
    return {
      id: dbWord.id,
      word: dbWord.word,
      pronunciation: extractPronunciation(dbWord),
      partOfSpeech: dbWord.analysis?.parts_of_speech || 'noun',
      languageOrigin: dbWord.etymology?.language_of_origin || 'Unknown',
      description: dbWord.definitions?.primary || 'No definition available',
      featured: false,
      images: [], // Empty array for compatibility
      morphemeBreakdown: {
        prefix: dbWord.morpheme_breakdown?.prefix ? {
          text: dbWord.morpheme_breakdown.prefix.text || '',
          meaning: dbWord.morpheme_breakdown.prefix.meaning || ''
        } : undefined,
        root: {
          text: dbWord.morpheme_breakdown?.root?.text || dbWord.word,
          meaning: dbWord.morpheme_breakdown?.root?.meaning || dbWord.definitions?.primary || ''
        },
        suffix: dbWord.morpheme_breakdown?.suffix ? {
          text: dbWord.morpheme_breakdown.suffix.text || '',
          meaning: dbWord.morpheme_breakdown.suffix.meaning || ''
        } : undefined
      },
      etymology: {
        origin: dbWord.etymology?.historical_origins || dbWord.etymology?.language_of_origin || 'Unknown origin',
        evolution: dbWord.etymology?.word_evolution || 'Evolution details not available',
        culturalVariations: dbWord.etymology?.cultural_variations || []
      },
      forms: extractWordForms(dbWord),
      definitions: extractDefinitions(dbWord),
      usage: {
        exampleSentence: dbWord.analysis?.example_sentence || `The word "${dbWord.word}" is used in various contexts.`,
        commonCollocations: dbWord.analysis?.collocations || [],
        contextualUsage: dbWord.analysis?.context || 'Used in formal and informal contexts.'
      },
      synonymsAntonyms: {
        synonyms: dbWord.analysis?.synonyms || [],
        antonyms: dbWord.analysis?.antonyms || []
      },
      quality_score: dbWord.quality_score,
      completeness_score: dbWord.completeness_score,
      enrichment_status: dbWord.enrichment_status,
      source: 'database' as const
    };
  };

  // Helper functions
  const extractPronunciation = (dbWord: any): string => {
    return dbWord.phonetic_data?.ipa_transcription || `/${dbWord.word}/`;
  };

  const extractWordForms = (dbWord: any) => {
    const forms = dbWord.word_forms || {};
    return {
      noun: forms.noun_forms?.singular,
      verb: forms.verb_tenses?.present,
      adjective: forms.adjective_forms?.positive,
      adverb: forms.adverb_form
    };
  };

  const extractDefinitions = (dbWord: any) => {
    const defs = dbWord.definitions || {};
    const definitions = [];
    
    if (defs.primary) {
      definitions.push({ type: 'standard', text: defs.primary });
    }
    
    if (defs.standard && Array.isArray(defs.standard)) {
      defs.standard.forEach((def: string) => {
        definitions.push({ type: 'standard', text: def });
      });
    }
    
    if (defs.extended && Array.isArray(defs.extended)) {
      defs.extended.forEach((def: string) => {
        definitions.push({ type: 'extended', text: def });
      });
    }
    
    return definitions;
  };

  const searchWords = useCallback((query: string) => {
    if (!query.trim()) return allWords;
    
    const lowerQuery = query.toLowerCase();
    return allWords.filter(word => 
      word.word.toLowerCase().includes(lowerQuery) ||
      word.description.toLowerCase().includes(lowerQuery) ||
      word.partOfSpeech.toLowerCase().includes(lowerQuery) ||
      word.languageOrigin.toLowerCase().includes(lowerQuery)
    );
  }, [allWords]);

  const getWordById = useCallback((id: string) => {
    return allWords.find(word => word.id === id);
  }, [allWords]);

  const addWord = useCallback((word: Partial<Word>) => {
    // Add to localStorage for dictionary words
    try {
      const saved = localStorage.getItem("vocabguru-dictionary-words");
      const dictionaryWords = saved ? JSON.parse(saved) : [];
      const newWord = {
        ...word,
        id: word.id || `dict-${Date.now()}`,
        source: 'dictionary' as const
      };
      
      const exists = dictionaryWords.some((w: Word) => w.id === newWord.id);
      if (!exists) {
        dictionaryWords.unshift(newWord);
        localStorage.setItem("vocabguru-dictionary-words", JSON.stringify(dictionaryWords));
        loadAllWords(); // Refresh the unified words list
      }
    } catch (error) {
      console.error('Error adding word:', error);
    }
  }, [loadAllWords]);

  useEffect(() => {
    loadAllWords();
  }, [loadAllWords]);

  return {
    words: allWords,
    loading,
    error,
    searchWords,
    getWordById,
    addWord,
    refresh: loadAllWords,
    totalCount: allWords.length,
    databaseCount: allWords.filter(w => w.source === 'database').length,
    legacyCount: allWords.filter(w => w.source === 'legacy').length,
    dictionaryCount: allWords.filter(w => w.source === 'dictionary').length
  };
}