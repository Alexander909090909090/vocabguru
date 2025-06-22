
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
import { WordRepositoryService } from '@/services/wordRepositoryService';
import { EnhancedWordProfileService } from '@/services/enhancedWordProfileService';
import EnhancedWordCard from '@/components/Discovery/EnhancedWordCard';

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
  const [isSearching, setIsSearching] = useState(false);
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'dictionary' | 'semantic' | 'browse'>('browse');
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
            contextual: Array.isArray(word.definitions?.contextual) ? word.definitions.contextual[0] : word.definitions?.contextual || '',
            specialized: Array.isArray(word.definitions?.specialized) ? word.definitions.specialized[0] : word.definitions?.specialized || ''
          },
          word_forms: {
            ...word.word_forms,
            other_inflections: Array.isArray(word.word_forms?.other_inflections) ? word.word_forms.other_inflections[0] : word.word_forms?.other_inflections || ''
          },
          analysis: {
            ...word.analysis,
            common_collocations: Array.isArray(word.analysis?.collocations) ? word.analysis.collocations.join(', ') : word.analysis?.collocations || ''
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

  const searchDictionary = useCallback(async (word: string) => {
    if (!word.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.trim()}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Word not found",
            description: `No definition found for "${word}"`,
            variant: "destructive"
          });
          setSearchResults([]);
          return;
        }
        throw new Error('Failed to fetch dictionary data');
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Dictionary search error:', error);
      toast({
        title: "Search failed",
        description: "Failed to search dictionary. Please try again.",
        variant: "destructive"
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const searchByMeaning = useCallback(async (meaning: string) => {
    if (!meaning.trim()) return;

    setIsSemanticSearching(true);
    try {
      const results = await SemanticSearchService.enhancedSemanticSearch(meaning.trim());
      
      // Convert to semantic results format
      const semanticData: SemanticSearchResult[] = results.map((word, index) => ({
        word,
        score: 100 - (index * 3), // Decreasing score based on position
        tags: [],
        defs: []
      }));
      
      setSemanticResults(semanticData);
      
      if (semanticData.length === 0) {
        toast({
          title: "No words found",
          description: `No words found related to "${meaning}"`,
        });
      }
    } catch (error) {
      console.error('Semantic search error:', error);
      toast({
        title: "Search failed",
        description: "Failed to search for related words. Please try again.",
        variant: "destructive"
      });
      setSemanticResults([]);
    } finally {
      setIsSemanticSearching(false);
    }
  }, []);

  const handleDictionarySearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchDictionary(searchTerm);
  };

  const handleSemanticSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchByMeaning(meaningSearch);
  };

  const addWordToCollection = async (entry: DictionaryEntry | SemanticSearchResult | EnhancedWordProfile) => {
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

      // Handle enhanced word profile
      if ('morpheme_breakdown' in entry) {
        const basicProfile: Partial<WordProfile> = {
          word: entry.word,
          morpheme_breakdown: entry.morpheme_breakdown,
          etymology: entry.etymology,
          definitions: {
            primary: entry.definitions.primary,
            standard: entry.definitions.standard,
            extended: entry.definitions.extended,
            contextual: Array.isArray(entry.definitions.contextual) ? entry.definitions.contextual[0] : entry.definitions.contextual || '',
            specialized: Array.isArray(entry.definitions.specialized) ? entry.definitions.specialized[0] : entry.definitions.specialized || ''
          },
          word_forms: entry.word_forms,
          analysis: entry.analysis
        };
        await WordProfileService.createWordProfile(basicProfile);
      }
      // If it's a semantic result, fetch full definition first
      else if ('score' in entry) {
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
      } else {
        await addDictionaryEntry(entry as DictionaryEntry);
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
        Discover new words using dictionary search, semantic search, or browse our comprehensive word repository.
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
          variant={searchMode === 'dictionary' ? 'default' : 'outline'}
          onClick={() => setSearchMode('dictionary')}
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          Dictionary Search
        </Button>
        <Button
          variant={searchMode === 'semantic' ? 'default' : 'outline'}
          onClick={() => setSearchMode('semantic')}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Search by Meaning
        </Button>
      </div>

      {/* Dictionary Search */}
      {searchMode === 'dictionary' && (
        <form onSubmit={handleDictionarySearch} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search for a specific word..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-lg"
                disabled={isSearching}
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSearching || !searchTerm.trim()}
              className="px-8"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </div>
        </form>
      )}

      {/* Semantic Search */}
      {searchMode === 'semantic' && (
        <form onSubmit={handleSemanticSearch} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Describe the meaning you're looking for (e.g., 'fast', 'abundant', 'beautiful')..."
                value={meaningSearch}
                onChange={(e) => setMeaningSearch(e.target.value)}
                className="text-lg"
                disabled={isSemanticSearching}
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSemanticSearching || !meaningSearch.trim()}
              className="px-8"
            >
              {isSemanticSearching ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Find Words
            </Button>
          </div>
        </form>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Browse Enhanced Words */}
          {searchMode === 'browse' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-medium">Word Repository</h2>
              
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
                    Check back later as we continue to expand our word repository.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Dictionary Search Results */}
          {searchMode === 'dictionary' && searchResults.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-medium">Dictionary Results</h2>
              
              {searchResults.map((entry, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">{entry.word}</CardTitle>
                        {entry.phonetic && (
                          <p className="text-sm text-gray-500 mt-1">{entry.phonetic}</p>
                        )}
                      </div>
                      <Button
                        onClick={() => addWordToCollection(entry)}
                        disabled={isAdding === entry.word}
                        className="flex items-center gap-2"
                      >
                        {isAdding === entry.word ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                        Add to Collection
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {entry.origin && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-500 mb-1">Etymology</h4>
                        <p className="text-sm">{entry.origin}</p>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      {entry.meanings.map((meaning, meaningIndex) => (
                        <div key={meaningIndex} className="border-l-4 border-primary/20 pl-4">
                          <Badge variant="outline" className="mb-2">
                            {meaning.partOfSpeech}
                          </Badge>
                          
                          <div className="space-y-2">
                            {meaning.definitions.slice(0, 3).map((def, defIndex) => (
                              <div key={defIndex} className="space-y-1">
                                <p className="text-sm">{def.definition}</p>
                                {def.example && (
                                  <p className="text-xs text-gray-500 italic">
                                    Example: "{def.example}"
                                  </p>
                                )}
                                {def.synonyms && def.synonyms.length > 0 && (
                                  <p className="text-xs text-gray-500">
                                    Synonyms: {def.synonyms.slice(0, 3).join(', ')}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Semantic Search Results */}
          {searchMode === 'semantic' && semanticResults.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-medium">Words Related to "{meaningSearch}"</h2>
              
              <div className="grid gap-4">
                {semanticResults.map((result, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-medium">{result.word}</h3>
                          <Badge variant="outline" className="text-xs">
                            Score: {Math.round(result.score)}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addWordToCollection(result)}
                          disabled={isAdding === result.word}
                          className="flex items-center gap-2"
                        >
                          {isAdding === result.word ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                          Add
                        </Button>
                      </div>
                      {result.defs && result.defs.length > 0 && (
                        <p className="text-sm text-gray-600 mt-2">{result.defs[0]}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Results States */}
          {searchMode === 'dictionary' && searchTerm && searchResults.length === 0 && !isSearching && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No results found</h3>
              <p className="text-gray-400">
                Try searching for a different word or check your spelling.
              </p>
            </div>
          )}

          {searchMode === 'semantic' && meaningSearch && semanticResults.length === 0 && !isSemanticSearching && (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No related words found</h3>
              <p className="text-gray-400">
                Try describing the meaning differently or using simpler terms.
              </p>
            </div>
          )}

          {searchMode !== 'browse' && !searchTerm && !meaningSearch && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">Discover New Words</h3>
              <p className="text-gray-400">
                Search for specific words or find words by their meaning using our semantic search.
              </p>
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
  );
};

export default DiscoveryPage;
