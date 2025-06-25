
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  Filter, 
  Brain, 
  Tag, 
  Clock, 
  TrendingUp,
  X,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { semanticSearchService } from '@/services/semanticSearchService';
import { debounce } from 'lodash';

interface SearchFilters {
  difficulty: string[];
  category: string[];
  origin: string[];
  frequency: 'high' | 'medium' | 'low' | null;
  semantic: boolean;
}

interface SearchSuggestion {
  word: string;
  definition: string;
  category: string;
  confidence: number;
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
  placeholder = "Search words by meaning, concept, or usage...",
  showFilters = true
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    difficulty: [],
    category: [],
    origin: [],
    frequency: null,
    semantic: true
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Debounced search for suggestions
  const debouncedGetSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length >= 2) {
        setShowSuggestions(true);
        refetchSuggestions();
      } else {
        setShowSuggestions(false);
      }
    }, 300),
    []
  );

  const { data: suggestions, refetch: refetchSuggestions } = useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: async () => {
      if (query.length < 2) return [];
      
      try {
        const results = await semanticSearchService.getSearchSuggestions(query, {
          semantic: filters.semantic,
          maxResults: 8
        });
        return results;
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        return generateFallbackSuggestions(query);
      }
    },
    enabled: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const generateFallbackSuggestions = (searchQuery: string): SearchSuggestion[] => {
    const fallbackWords = [
      { word: 'ambitious', definition: 'having strong desire for success', category: 'personality', confidence: 0.9 },
      { word: 'benevolent', definition: 'well-meaning and kindly', category: 'personality', confidence: 0.8 },
      { word: 'comprehensive', definition: 'complete and including everything', category: 'academic', confidence: 0.85 },
      { word: 'diligent', definition: 'showing care in work or duties', category: 'personality', confidence: 0.87 }
    ];

    return fallbackWords
      .filter(word => 
        word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.definition.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 6);
  };

  useEffect(() => {
    debouncedGetSuggestions(query);
  }, [query, debouncedGetSuggestions]);

  useEffect(() => {
    // Load recent searches from localStorage
    const stored = localStorage.getItem('vocabguru-recent-searches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      // Add to recent searches
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('vocabguru-recent-searches', JSON.stringify(updated));
      
      onSearch(query, filters);
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (word: string) => {
    setQuery(word);
    setShowSuggestions(false);
    onWordSelect(word);
  };

  const addFilter = (type: keyof SearchFilters, value: string) => {
    if (type === 'frequency') {
      setFilters(prev => ({ ...prev, frequency: value as any }));
    } else if (Array.isArray(filters[type])) {
      const currentValues = filters[type] as string[];
      if (!currentValues.includes(value)) {
        setFilters(prev => ({
          ...prev,
          [type]: [...currentValues, value]
        }));
      }
    }
  };

  const removeFilter = (type: keyof SearchFilters, value?: string) => {
    if (type === 'frequency') {
      setFilters(prev => ({ ...prev, frequency: null }));
    } else if (Array.isArray(filters[type])) {
      setFilters(prev => ({
        ...prev,
        [type]: (prev[type] as string[]).filter(v => v !== value)
      }));
    }
  };

  const toggleSemantic = () => {
    setFilters(prev => ({ ...prev, semantic: !prev.semantic }));
  };

  const clearAllFilters = () => {
    setFilters({
      difficulty: [],
      category: [],
      origin: [],
      frequency: null,
      semantic: true
    });
  };

  const getActiveFilterCount = () => {
    return filters.difficulty.length + 
           filters.category.length + 
           filters.origin.length + 
           (filters.frequency ? 1 : 0);
  };

  const filterOptions = {
    difficulty: ['beginner', 'intermediate', 'advanced'],
    category: ['academic', 'science', 'literature', 'business', 'philosophy', 'arts'],
    origin: ['latin', 'greek', 'french', 'german', 'old english', 'arabic'],
    frequency: ['high', 'medium', 'low']
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <div className="relative flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => query.length >= 2 && setShowSuggestions(true)}
              placeholder={placeholder}
              className="pl-10 pr-4 h-12"
            />
            {filters.semantic && (
              <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary" />
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            {showFilters && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="h-12 w-12 relative">
                    <Filter className="h-4 w-4" />
                    {getActiveFilterCount() > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {getActiveFilterCount()}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Search Filters</h4>
                      {getActiveFilterCount() > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFilters}
                          className="h-8 px-2"
                        >
                          Clear All
                        </Button>
                      )}
                    </div>

                    {/* Semantic Search Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        <span className="text-sm">AI Semantic Search</span>
                      </div>
                      <Button
                        variant={filters.semantic ? "default" : "outline"}
                        size="sm"
                        onClick={toggleSemantic}
                      >
                        {filters.semantic ? "On" : "Off"}
                      </Button>
                    </div>

                    {/* Filter Categories */}
                    {Object.entries(filterOptions).map(([key, options]) => (
                      <div key={key}>
                        <label className="text-sm font-medium capitalize mb-2 block">
                          {key}
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {options.map((option) => {
                            const isActive = key === 'frequency' 
                              ? filters.frequency === option
                              : (filters[key as keyof SearchFilters] as string[]).includes(option);
                            
                            return (
                              <Button
                                key={option}
                                variant={isActive ? "default" : "outline"}
                                size="sm"
                                onClick={() => 
                                  isActive 
                                    ? removeFilter(key as keyof SearchFilters, option)
                                    : addFilter(key as keyof SearchFilters, option)
                                }
                                className="h-7 text-xs capitalize"
                              >
                                {option}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
            
            <Button onClick={handleSearch} className="h-12 px-6">
              Search
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {getActiveFilterCount() > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.difficulty.map(filter => (
              <Badge key={`difficulty-${filter}`} variant="secondary" className="gap-1">
                {filter}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('difficulty', filter)}
                />
              </Badge>
            ))}
            {filters.category.map(filter => (
              <Badge key={`category-${filter}`} variant="secondary" className="gap-1">
                {filter}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('category', filter)}
                />
              </Badge>
            ))}
            {filters.origin.map(filter => (
              <Badge key={`origin-${filter}`} variant="secondary" className="gap-1">
                {filter}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('origin', filter)}
                />
              </Badge>
            ))}
            {filters.frequency && (
              <Badge variant="secondary" className="gap-1">
                {filters.frequency} frequency
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('frequency')}
                />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && (query.length >= 2 || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 z-50 mt-1"
          >
            <Card>
              <CardContent className="p-0">
                {/* Recent searches */}
                {query.length < 2 && recentSearches.length > 0 && (
                  <div className="p-3 border-b">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Recent</span>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                          onClick={() => handleSuggestionClick(search)}
                        >
                          <span className="text-sm">{search}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Suggestions */}
                {suggestions && suggestions.length > 0 && (
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">AI Suggestions</span>
                    </div>
                    <div className="space-y-1">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                          onClick={() => handleSuggestionClick(suggestion.word)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{suggestion.word}</span>
                              <Badge variant="outline" className="text-xs">
                                {suggestion.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {suggestion.definition}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <TrendingUp className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {Math.round(suggestion.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
