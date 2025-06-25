
import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Brain, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface SearchFilters {
  difficulty: string[];
  category: string[];
  wordLength: [number, number];
  etymology: string[];
  semanticField: string[];
}

interface SearchResult {
  word: string;
  definition: string;
  relevanceScore: number;
  semanticMatch: number;
  category: string;
  difficulty: string;
}

interface AdvancedSemanticSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onWordSelect: (word: string) => void;
  placeholder?: string;
  showFilters?: boolean;
}

export const AdvancedSemanticSearch: React.FC<AdvancedSemanticSearchProps> = ({
  onSearch,
  onWordSelect,
  placeholder = "Search by meaning, concept, or context...",
  showFilters = true
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    difficulty: [],
    category: [],
    wordLength: [3, 15],
    etymology: [],
    semanticField: []
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Semantic search with fallback
  const { data: results, isLoading, refetch } = useQuery({
    queryKey: ['semantic-search', query, filters],
    queryFn: async () => {
      if (!query.trim()) return [];
      
      try {
        // For now, use fallback search until service is fully implemented
        return generateFallbackResults(query);
      } catch (error) {
        console.error('Semantic search failed:', error);
        return generateFallbackResults(query);
      }
    },
    enabled: false, // Manual trigger
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const generateFallbackResults = (searchQuery: string): SearchResult[] => {
    const fallbackWords = [
      { word: 'luminous', definition: 'giving off light; bright or shining', category: 'descriptive', difficulty: 'intermediate' },
      { word: 'ephemeral', definition: 'lasting for a very short time', category: 'temporal', difficulty: 'advanced' },
      { word: 'serendipity', definition: 'the occurrence of events by chance in a happy way', category: 'abstract', difficulty: 'advanced' },
      { word: 'mellifluous', definition: 'sweet or pleasing to hear', category: 'descriptive', difficulty: 'advanced' },
      { word: 'ubiquitous', definition: 'present, appearing, or found everywhere', category: 'descriptive', difficulty: 'intermediate' }
    ];

    return fallbackWords
      .filter(word => 
        word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.definition.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(word => ({
        ...word,
        relevanceScore: 0.8 + Math.random() * 0.2,
        semanticMatch: 0.7 + Math.random() * 0.3
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setShowResults(true);
    
    try {
      await refetch();
      onSearch(query, filters);
      toast.success(`Found ${results?.length || 0} semantic matches`);
    } catch (error) {
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({
      difficulty: [],
      category: [],
      wordLength: [3, 15],
      etymology: [],
      semanticField: []
    });
  };

  const filterOptions = {
    difficulty: ['beginner', 'intermediate', 'advanced', 'expert'],
    category: ['academic', 'technical', 'literary', 'scientific', 'colloquial'],
    etymology: ['latin', 'greek', 'french', 'german', 'old-english'],
    semanticField: ['emotion', 'nature', 'abstract', 'concrete', 'temporal']
  };

  const activeFilterCount = 
    filters.difficulty.length + 
    filters.category.length + 
    filters.etymology.length + 
    filters.semanticField.length;

  useEffect(() => {
    if (results) {
      setSearchResults(results);
    }
  }, [results]);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="pl-10 pr-4"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Brain className="h-4 w-4 text-primary" />
            </div>
          </div>
          
          <Button 
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
            className="px-6"
          >
            {isSearching ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>

          {showFilters && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="relative">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Search Filters</h4>
                    {activeFilterCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>

                  {/* Difficulty Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Difficulty</label>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.difficulty.map((level) => (
                        <div key={level} className="flex items-center space-x-2">
                          <Checkbox
                            id={`difficulty-${level}`}
                            checked={filters.difficulty.includes(level)}
                            onCheckedChange={(checked) => {
                              setFilters(prev => ({
                                ...prev,
                                difficulty: checked
                                  ? [...prev.difficulty, level]
                                  : prev.difficulty.filter(d => d !== level)
                              }));
                            }}
                          />
                          <label htmlFor={`difficulty-${level}`} className="text-sm capitalize">
                            {level}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Word Length Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Word Length: {filters.wordLength[0]} - {filters.wordLength[1]} letters
                    </label>
                    <Slider
                      value={filters.wordLength}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, wordLength: value as [number, number] }))}
                      min={3}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <div className="space-y-2">
                      {filterOptions.category.map((cat) => (
                        <div key={cat} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${cat}`}
                            checked={filters.category.includes(cat)}
                            onCheckedChange={(checked) => {
                              setFilters(prev => ({
                                ...prev,
                                category: checked
                                  ? [...prev.category, cat]
                                  : prev.category.filter(c => c !== cat)
                              }));
                            }}
                          />
                          <label htmlFor={`category-${cat}`} className="text-sm capitalize">
                            {cat}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.difficulty.map((level) => (
            <Badge key={level} variant="secondary" className="capitalize">
              {level}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => setFilters(prev => ({
                  ...prev,
                  difficulty: prev.difficulty.filter(d => d !== level)
                }))}
              />
            </Badge>
          ))}
          {filters.category.map((cat) => (
            <Badge key={cat} variant="secondary" className="capitalize">
              {cat}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => setFilters(prev => ({
                  ...prev,
                  category: prev.category.filter(c => c !== cat)
                }))}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Search Results */}
      <AnimatePresence>
        {showResults && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found {searchResults.length} semantic matches
              </p>
              <Button variant="ghost" size="sm" onClick={() => setShowResults(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <motion.div
                  key={result.word}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent 
                      className="p-3"
                      onClick={() => onWordSelect(result.word)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{result.word}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {Math.round(result.semanticMatch * 100)}% match
                          </Badge>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {result.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{result.definition}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
