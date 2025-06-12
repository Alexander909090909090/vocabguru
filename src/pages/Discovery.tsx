
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, BookOpen, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { WordProfileService } from '@/services/wordProfileService';
import { WordProfile } from '@/types/wordProfile';

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
  const [searchResults, setSearchResults] = useState<DictionaryEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);

  const searchDictionary = useCallback(async (word: string) => {
    if (!word.trim()) return;

    setIsSearching(true);
    try {
      // Using Free Dictionary API
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchDictionary(searchTerm);
  };

  const addWordToCollection = async (entry: DictionaryEntry) => {
    setIsAdding(entry.word);
    try {
      // Check if word already exists
      const existingWord = await WordProfileService.getWordProfile(entry.word);
      if (existingWord) {
        toast({
          title: "Word already exists",
          description: `"${entry.word}" is already in your collection.`,
        });
        return;
      }

      // Convert dictionary entry to WordProfile format
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
      
      toast({
        title: "Word added successfully",
        description: `"${entry.word}" has been added to your collection.`
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
        Discover new words using open source dictionary APIs and add them to your collection.
      </p>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search for a word to discover..."
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

      {searchResults.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-medium">Search Results</h2>
          
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

      {searchTerm && searchResults.length === 0 && !isSearching && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">No results found</h3>
          <p className="text-gray-400">
            Try searching for a different word or check your spelling.
          </p>
        </div>
      )}

      {!searchTerm && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">Discover New Words</h3>
          <p className="text-gray-400">
            Enter a word above to search the dictionary and discover new vocabulary.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default DiscoveryPage;
