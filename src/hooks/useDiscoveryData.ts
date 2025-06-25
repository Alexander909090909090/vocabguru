
import { useState, useCallback, useEffect } from 'react';
import { WordProfileService } from '@/services/wordProfileService';
import { WordProfile } from '@/types/wordProfile';
import { SemanticSearchResult } from '@/services/semanticSearchService';
import { EnhancedWordProfile } from '@/types/enhancedWordProfile';
import { WordRepositoryEntry, WordRepositoryService } from '@/services/wordRepositoryService';
import { EnhancedWordProfileService } from '@/services/enhancedWordProfileService';
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
  const [semanticResults, setSemanticResults] = useState<SemanticSearchResult[]>([]);
  const [enhancedWords, setEnhancedWords] = useState<EnhancedWordProfile[]>([]);
  const [filteredWords, setFilteredWords] = useState<WordRepositoryEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Load enhanced word profiles with pagination
  const loadEnhancedWords = useCallback(async (pageNum: number = 0, reset: boolean = true) => {
    setIsLoadingMore(true);
    
    try {
      const { words: newWords, hasMore: moreAvailable } = await WordRepositoryService.getWordsWithPagination(
        pageNum,
        20
      );
      
      // Convert to enhanced word profiles
      const enhancedProfiles = newWords.map(word => 
        EnhancedWordProfileService.convertWordProfile({
          id: word.id,
          word: word.word,
          created_at: word.created_at,
          updated_at: word.updated_at,
          morpheme_breakdown: word.morpheme_breakdown || { root: { text: word.word, meaning: 'Root meaning to be analyzed' } },
          etymology: word.etymology || {},
          definitions: {
            primary: word.definitions?.primary,
            standard: word.definitions?.standard || [],
            extended: word.definitions?.extended || [],
            contextual: word.definitions?.contextual?.[0] || '',
            specialized: word.definitions?.specialized?.[0] || ''
          },
          word_forms: {
            ...word.word_forms,
            other_inflections: Array.isArray(word.word_forms?.other_inflections) ? 
              word.word_forms.other_inflections[0] || '' : 
              word.word_forms?.other_inflections || ''
          },
          analysis: {
            ...word.analysis,
            common_collocations: Array.isArray(word.analysis?.collocations) ? 
              word.analysis.collocations.join(', ') : 
              (typeof word.analysis?.collocations === 'string' ? word.analysis.collocations : '')
          }
        })
      );
      
      if (reset) {
        setEnhancedWords(enhancedProfiles);
      } else {
        setEnhancedWords(prev => [...prev, ...enhancedProfiles]);
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

  const addWordToCollection = async (entry: DictionaryEntry | SemanticSearchResult | EnhancedWordProfile | WordRepositoryEntry) => {
    const wordToAdd = entry.word;
    setIsAdding(wordToAdd);
    
    try {
      const existingWord = await WordProfileService.getWordProfile(wordToAdd);
      if (existingWord) {
        toast({
          title: "Word already exists",
          description: `"${wordToAdd}" is already in your collection.`,
        });
        return;
      }

      // Handle enhanced word profile or word repository entry
      if ('morpheme_breakdown' in entry && entry.morpheme_breakdown) {
        const basicProfile: Partial<WordProfile> = {
          word: entry.word,
          morpheme_breakdown: entry.morpheme_breakdown,
          etymology: entry.etymology,
          definitions: {
            primary: entry.definitions.primary,
            standard: entry.definitions.standard,
            extended: entry.definitions.extended,
            contextual: Array.isArray(entry.definitions.contextual) ? 
              entry.definitions.contextual[0] : 
              entry.definitions.contextual || '',
            specialized: Array.isArray(entry.definitions.specialized) ? 
              entry.definitions.specialized[0] : 
              entry.definitions.specialized || ''
          },
          word_forms: {
            ...entry.word_forms,
            other_inflections: Array.isArray(entry.word_forms?.other_inflections) ? 
              entry.word_forms.other_inflections[0] || '' : 
              entry.word_forms?.other_inflections || ''
          },
          analysis: {
            ...entry.analysis,
            common_collocations: entry.analysis?.common_collocations && Array.isArray(entry.analysis.common_collocations) ? 
              entry.analysis.common_collocations.join(', ') : 
              (typeof entry.analysis?.common_collocations === 'string' ? entry.analysis.common_collocations : '')
          }
        };
        await WordProfileService.createWordProfile(basicProfile);
      }
      // Handle semantic results and dictionary entries
      else if ('score' in entry || 'meanings' in entry) {
        try {
          const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${wordToAdd}`);
          if (response.ok) {
            const dictData = await response.json();
            await addDictionaryEntry(dictData[0]);
            return;
          }
        } catch (error) {
          console.log('Dictionary lookup failed, creating basic entry');
        }
        
        // Create basic entry if dictionary lookup fails
        const basicProfile: Partial<WordProfile> = {
          word: wordToAdd,
          morpheme_breakdown: {
            root: {
              text: wordToAdd,
              meaning: 'Meaning to be analyzed'
            }
          },
          etymology: {
            language_of_origin: 'English',
            historical_origins: 'Etymology to be researched'
          },
          definitions: {
            primary: 'Definition to be researched',
            standard: []
          },
          word_forms: {
            base_form: wordToAdd
          },
          analysis: {
            parts_of_speech: 'unknown',
            synonyms_antonyms: JSON.stringify({ synonyms: [], antonyms: [] }),
            example: 'Example usage to be added'
          }
        };

        await WordProfileService.createWordProfile(basicProfile);
      }
      
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

  const addDictionaryEntry = async (entry: DictionaryEntry) => {
    const primaryMeaning = entry.meanings[0]?.definitions[0];
    const wordProfile: Partial<WordProfile> = {
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
        synonyms_antonyms: JSON.stringify({
          synonyms: primaryMeaning?.synonyms || [],
          antonyms: primaryMeaning?.antonyms || []
        }),
        example: primaryMeaning?.example || 'No example available'
      }
    };

    await WordProfileService.createWordProfile(wordProfile);
  };

  return {
    searchResults,
    setSearchResults,
    semanticResults,
    setSemanticResults,
    enhancedWords,
    setEnhancedWords,
    filteredWords,
    setFilteredWords,
    isSearching,
    setIsSearching,
    isSemanticSearching,
    setIsSemanticSearching,
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
