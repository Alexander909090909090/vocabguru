
import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, BookOpen, Globe, Loader2, Sparkles, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { WordProfileService } from '@/services/wordProfileService';
import { WordProfile } from '@/types/wordProfile';
import { SemanticSearchService, SemanticSearchResult } from '@/services/semanticSearchService';
import AIChatInterface from '@/components/AIChatInterface';
import { EnhancedWordProfile } from '@/types/enhancedWordProfile';
import { WordRepositoryService, WordRepositoryEntry } from '@/services/wordRepositoryService';
import { EnhancedWordProfileService } from '@/services/enhancedWordProfileService';
import EnhancedWordCard from '@/components/Discovery/EnhancedWordCard';
import { EnhancedSmartSearch } from '@/components/SmartSearch/EnhancedSmartSearch';
import { AIRecommendations } from '@/components/Discovery/AIRecommendations';
import { FloatingActionButton } from '@/components/Discovery/FloatingActionButton';
import { WordDetailDialog } from '@/components/Discovery/WordDetailDialog';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

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

const DiscoveryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [meaningSearch, setMeaningSearch] = useState('');
  const [searchResults, setSearchResults] = useState<DictionaryEntry[]>([]);
  const [semanticResults, setSemanticResults] = useState<SemanticSearchResult[]>([]);
  const [enhancedWords, setEnhancedWords] = useState<EnhancedWordProfile[]>([]);
  const [filteredWords, setFilteredWords] = useState<WordRepositoryEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'smart' | 'browse'>('browse');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedWord, setSelectedWord] = useState<WordRepositoryEntry | null>(null);
  const [isWordDialogOpen, setIsWordDialogOpen] = useState(false);

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
              word.analysis?.collocations?.join(', ') || ''
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

  // Load initial words
  useEffect(() => {
    if (searchMode === 'browse') {
      loadEnhancedWords(0, true);
    }
  }, [searchMode, loadEnhancedWords]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        searchMode === 'browse' &&
        hasMore &&
        !isLoadingMore &&
        window.innerHeight + document.documentElement.scrollTop >= 
        document.documentElement.offsetHeight - 1000
      ) {
        loadEnhancedWords(page + 1, false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [searchMode, hasMore, isLoadingMore, page, loadEnhancedWords]);

  const handleSmartSearchResults = (results: WordRepositoryEntry[]) => {
    setFilteredWords(results);
  };

  const handleWordSelect = (word: WordRepositoryEntry | EnhancedWordProfile) => {
    // Convert EnhancedWordProfile to WordRepositoryEntry if needed
    let wordEntry: WordRepositoryEntry;
    
    if ('morpheme_breakdown' in word && word.morpheme_breakdown) {
      wordEntry = {
        id: word.id,
        word: word.word,
        morpheme_breakdown: word.morpheme_breakdown,
        etymology: word.etymology,
        definitions: word.definitions,
        word_forms: word.word_forms,
        analysis: word.analysis,
        source_apis: ['word_profiles'],
        frequency_score: 75,
        difficulty_level: 'intermediate',
        created_at: word.created_at || new Date().toISOString(),
        updated_at: word.updated_at || new Date().toISOString()
      };
    } else {
      wordEntry = word as WordRepositoryEntry;
    }

    setSelectedWord(wordEntry);
    setIsWordDialogOpen(true);
  };

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
            common_collocations: Array.isArray(entry.analysis?.common_collocations) ? 
              entry.analysis.common_collocations.join(', ') : 
              entry.analysis?.common_collocations || ''
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

  return (
    <>
      <motion.div
        initial="initial"
        animate="in"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.3 }}
        className="container mx-auto py-8 px-4"
      >
        <div className="flex items-center gap-3 mb-6">
          <Globe className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-semibold">Word Discovery</h1>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Discover new words with AI-powered search and recommendations.
        </p>

        {/* Search Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={searchMode === 'browse' ? 'default' : 'outline'}
            onClick={() => setSearchMode('browse')}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Browse Words
          </Button>
          <Button
            variant={searchMode === 'smart' ? 'default' : 'outline'}
            onClick={() => setSearchMode('smart')}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Smart Search
          </Button>
        </div>

        {/* Smart Search Mode */}
        {searchMode === 'smart' && (
          <div className="mb-8">
            <EnhancedSmartSearch 
              onResults={handleSmartSearchResults}
              onLoading={setIsSearching}
            />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Smart Search Results */}
            {searchMode === 'smart' && (
              <div className="space-y-6">
                {filteredWords.length > 0 ? (
                  <>
                    <h2 className="text-2xl font-medium">Search Results</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                      {filteredWords.map((word) => (
                        <Card 
                          key={word.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleWordSelect(word)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-lg font-semibold capitalize">{word.word}</h3>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addWordToCollection(word);
                                }}
                                disabled={isAdding === word.word}
                              >
                                {isAdding === word.word ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Plus className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {word.definitions.primary}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {word.analysis?.parts_of_speech && (
                                <Badge variant="secondary" className="text-xs">
                                  {word.analysis.parts_of_speech}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {word.difficulty_level}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : !isSearching && (
                  <div className="space-y-6">
                    <AIRecommendations 
                      onWordSelect={handleWordSelect}
                      onAddToCollection={addWordToCollection}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Browse Mode */}
            {searchMode === 'browse' && (
              <div className="space-y-6">
                <AIRecommendations 
                  onWordSelect={handleWordSelect}
                  onAddToCollection={addWordToCollection}
                />
                
                <div>
                  <h2 className="text-2xl font-medium mb-4">All Words</h2>
                  
                  {enhancedWords.length > 0 ? (
                    <>
                      <div className="grid gap-6 md:grid-cols-2">
                        {enhancedWords.map((wordProfile, index) => (
                          <EnhancedWordCard 
                            key={wordProfile.id} 
                            wordProfile={wordProfile}
                            onAddToCollection={addWordToCollection}
                            showAddButton={true}
                          />
                        ))}
                      </div>
                      
                      {/* Loading more indicator */}
                      {isLoadingMore && (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin" />
                          <span className="ml-2">Loading more words...</span>
                        </div>
                      )}
                      
                      {!hasMore && enhancedWords.length > 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>You've reached the end of our word repository!</p>
                        </div>
                      )}
                    </>
                  ) : isLoadingMore ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="ml-2">Loading word repository...</span>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-500 mb-2">No words available</h3>
                      <p className="text-gray-400">
                        The word repository is empty. Visit Settings to populate it with words.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* AI Chat Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <AIChatInterface />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Word Detail Dialog */}
      <WordDetailDialog
        word={selectedWord}
        isOpen={isWordDialogOpen}
        onClose={() => setIsWordDialogOpen(false)}
        onAddToCollection={addWordToCollection}
      />
    </>
  );
};

export default DiscoveryPage;
