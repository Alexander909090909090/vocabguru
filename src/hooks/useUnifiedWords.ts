
import { useState, useEffect } from "react";
import { Word } from "@/data/words";
import words from "@/data/words";
import { UnifiedWordService } from "@/services/unifiedWordService";
import { toast } from "@/components/ui/use-toast";

interface UnifiedWord extends Word {
  source: 'legacy' | 'database';
  quality_score?: number;
  completeness_score?: number;
  enrichment_status?: string;
}

export function useUnifiedWords() {
  const [unifiedWords, setUnifiedWords] = useState<UnifiedWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUnifiedWords = async () => {
    try {
      setLoading(true);
      
      // Initialize the unified service
      await UnifiedWordService.initialize();
      
      // Get database words and convert to unified format
      const databaseWords = await UnifiedWordService.searchWords("", { limit: 1000 });
      const convertedDbWords: UnifiedWord[] = databaseWords.map(dbWord => ({
        id: dbWord.id,
        word: dbWord.word,
        pronunciation: dbWord.phonetic || '',
        partOfSpeech: dbWord.analysis.parts_of_speech || 'noun',
        languageOrigin: dbWord.etymology.language_of_origin || 'Unknown',
        description: dbWord.definitions.primary || 'No description available',
        featured: false,
        images: [], // Add empty images array to satisfy Word interface
        morphemeBreakdown: {
          prefix: dbWord.morpheme_breakdown.prefix,
          root: dbWord.morpheme_breakdown.root,
          suffix: dbWord.morpheme_breakdown.suffix
        },
        etymology: {
          origin: dbWord.etymology.historical_origins || '',
          evolution: dbWord.etymology.word_evolution || '',
          culturalVariations: dbWord.etymology.cultural_variations || ''
        },
        definitions: [
          { type: 'primary' as const, text: dbWord.definitions.primary || '' },
          ...dbWord.definitions.standard?.map(def => ({ type: 'standard' as const, text: def })) || [],
          ...dbWord.definitions.extended?.map(def => ({ type: 'extended' as const, text: def })) || [],
          ...dbWord.definitions.contextual?.map(def => ({ type: 'contextual' as const, text: def })) || []
        ],
        synonymsAntonyms: {
          synonyms: dbWord.analysis.synonyms || [],
          antonyms: dbWord.analysis.antonyms || []
        },
        usage: {
          contextualUsage: dbWord.analysis.usage_examples?.join(', ') || '',
          sentenceStructure: '',
          commonCollocations: dbWord.analysis.collocations || [],
          exampleSentence: dbWord.analysis.example_sentence || ''
        },
        forms: {
          noun: dbWord.word_forms.noun_forms?.singular,
          verb: dbWord.word_forms.verb_tenses?.present,
          adjective: dbWord.word_forms.adjective_forms?.positive,
          adverb: dbWord.word_forms.adverb_form
        },
        source: 'database' as const,
        quality_score: 85, // Default high quality for database words
        completeness_score: 90,
        enrichment_status: 'completed'
      }));

      // Add legacy words with source indicator
      const legacyWords: UnifiedWord[] = words.map(word => ({
        ...word,
        source: 'legacy' as const,
        quality_score: 60, // Legacy words have lower quality
        completeness_score: 70,
        enrichment_status: 'pending'
      }));

      // Combine and deduplicate (prioritize database words)
      const wordMap = new Map<string, UnifiedWord>();
      
      // Add legacy words first
      legacyWords.forEach(word => {
        wordMap.set(word.word.toLowerCase(), word);
      });
      
      // Add/override with database words
      convertedDbWords.forEach(word => {
        wordMap.set(word.word.toLowerCase(), word);
      });

      const combined = Array.from(wordMap.values());
      setUnifiedWords(combined);
      setError(null);
    } catch (err) {
      console.error('Error loading unified words:', err);
      setError('Failed to load words');
      
      // Fallback to legacy words only
      const legacyWords: UnifiedWord[] = words.map(word => ({
        ...word,
        source: 'legacy' as const,
        quality_score: 60,
        completeness_score: 70,
        enrichment_status: 'pending'
      }));
      setUnifiedWords(legacyWords);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnifiedWords();
  }, []);

  const refreshWords = () => {
    loadUnifiedWords();
  };

  const getWord = (id: string): UnifiedWord | undefined => {
    return unifiedWords.find(w => w.id === id);
  };

  const searchWords = (query: string): UnifiedWord[] => {
    if (!query.trim()) return unifiedWords;
    
    const lowercaseQuery = query.toLowerCase();
    return unifiedWords.filter(word => 
      word.word.toLowerCase().includes(lowercaseQuery) ||
      word.description.toLowerCase().includes(lowercaseQuery) ||
      word.partOfSpeech.toLowerCase().includes(lowercaseQuery) ||
      word.languageOrigin.toLowerCase().includes(lowercaseQuery)
    );
  };

  const addWord = async (wordData: Partial<Word>) => {
    try {
      // For now, we'll add to localStorage as before
      // In the future, this could be enhanced to add to database
      const newWord: UnifiedWord = {
        id: crypto.randomUUID(),
        word: wordData.word || '',
        pronunciation: wordData.pronunciation || '',
        partOfSpeech: wordData.partOfSpeech || 'noun',
        languageOrigin: wordData.languageOrigin || 'Unknown',
        description: wordData.description || '',
        featured: false,
        images: [], // Add empty images array
        morphemeBreakdown: wordData.morphemeBreakdown || { root: { text: wordData.word || '', meaning: '' } },
        etymology: wordData.etymology || { origin: '', evolution: '', culturalVariations: '' },
        definitions: wordData.definitions || [{ type: 'primary', text: wordData.description || '' }],
        synonymsAntonyms: wordData.synonymsAntonyms || { synonyms: [], antonyms: [] },
        usage: wordData.usage || { contextualUsage: '', sentenceStructure: '', commonCollocations: [], exampleSentence: '' },
        forms: wordData.forms || {},
        source: 'legacy',
        quality_score: 50,
        completeness_score: 60,
        enrichment_status: 'pending'
      };
      
      setUnifiedWords(prev => [newWord, ...prev]);
      
      toast({
        title: "Word added",
        description: `"${newWord.word}" has been added to your collection.`,
      });
    } catch (error) {
      console.error('Error adding word:', error);
      toast({
        title: "Error adding word",
        description: "Failed to add word to collection",
        variant: "destructive",
      });
    }
  };

  return {
    words: unifiedWords,
    loading,
    error,
    refreshWords,
    getWord,
    searchWords,
    addWord,
    // Legacy compatibility
    allWords: unifiedWords,
    dictionaryWords: unifiedWords.filter(w => w.source === 'database')
  };
}
