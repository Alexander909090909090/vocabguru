
import { useState, useCallback, useEffect } from 'react';
import { UnifiedWord } from '@/types/unifiedWord';
import { UnifiedWordService } from '@/services/unifiedWordService';
import { UserWordLibraryService } from '@/services/userWordLibraryService';
import { toast } from '@/hooks/use-toast';

interface DictionaryEntry {
  word: string;
  phonetic?: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }>;
  }>;
  origin?: string;
}

export const useDiscoveryData = () => {
  const [searchResults, setSearchResults] = useState<DictionaryEntry[]>([]);
  const [enhancedWords, setEnhancedWords] = useState<UnifiedWord[]>([]);
  const [filteredWords, setFilteredWords] = useState<UnifiedWord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Initialize database on first load
  useEffect(() => {
    UnifiedWordService.initializeDatabase();
  }, []);

  // Load words with pagination
  const loadEnhancedWords = useCallback(async (pageNum: number = 0, reset: boolean = true) => {
    setIsLoadingMore(true);
    
    try {
      const { words: newWords, hasMore: moreAvailable } = await UnifiedWordService.getWords(
        pageNum,
        20
      );
      
      if (reset) {
        setEnhancedWords(newWords);
      } else {
        setEnhancedWords(prev => [...prev, ...newWords]);
      }
      
      setHasMore(moreAvailable);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading enhanced words:', error);
      toast({
        title: "Error loading words",
        description: "Failed to load word profiles. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, []);

  const addWordToCollection = async (entry: DictionaryEntry | UnifiedWord) => {
    const wordToAdd = entry.word;
    setIsAdding(wordToAdd);
    
    try {
      // Check if word already exists in our database
      const existingWord = await UnifiedWordService.getWordByName(wordToAdd);
      
      let wordToAddToLibrary: UnifiedWord;
      
      if (existingWord) {
        wordToAddToLibrary = existingWord;
      } else {
        // Create new word profile
        if ('morpheme_breakdown' in entry) {
          // It's already a UnifiedWord
          const newWord = await UnifiedWordService.createWord(entry);
          if (!newWord) {
            throw new Error('Failed to create word profile');
          }
          wordToAddToLibrary = newWord;
        } else {
          // It's a DictionaryEntry, convert it
          const primaryMeaning = entry.meanings[0]?.definitions[0];
          const newWordData: Partial<UnifiedWord> = {
            word: entry.word,
            morpheme_breakdown: {
              root: {
                text: entry.word,
                meaning: primaryMeaning?.definition || 'Definition not available'
              }
            },
            etymology: {
              language_of_origin: 'English',
              historical_origins: entry.origin || 'Etymology not available'
            },
            definitions: {
              primary: primaryMeaning?.definition || 'Definition not available',
              standard: entry.meanings.slice(0, 3).map(m => 
                m.definitions[0]?.definition || ''
              ).filter(Boolean)
            },
            word_forms: {
              base_form: entry.word
            },
            analysis: {
              parts_of_speech: entry.meanings[0]?.partOfSpeech || 'unknown',
              synonyms: primaryMeaning?.synonyms || [],
              antonyms: primaryMeaning?.antonyms || [],
              example_sentence: primaryMeaning?.example || 'No example available'
            }
          };

          const newWord = await UnifiedWordService.createWord(newWordData);
          if (!newWord) {
            throw new Error('Failed to create word profile');
          }
          wordToAddToLibrary = newWord;
        }
      }

      // Add to user's personal library
      await UserWordLibraryService.addWordToLibrary(wordToAddToLibrary.id);
      
      toast({
        title: "Word added successfully",
        description: `"${wordToAdd}" has been added to your collection.`
      });
    } catch (error) {
      console.error('Error adding word:', error);
      toast({
        title: "Failed to add word",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsAdding(null);
    }
  };

  return {
    searchResults,
    setSearchResults,
    enhancedWords,
    setEnhancedWords,
    filteredWords,
    setFilteredWords,
    isSearching,
    setIsSearching,
    isLoadingMore,
    setIsLoadingMore,
    isAdding,
    setIsAdding,
    page,
    setPage,
    hasMore,
    setHasMore,
    loadEnhancedWords,
    addWordToCollection
  };
};
