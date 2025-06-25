
import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, X, Sparkles, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { WordRepositoryEntry } from "@/services/wordRepositoryService";
import { toast } from "sonner";
import { debounce } from "lodash";

interface SearchFilters {
  etymology?: string;
  partOfSpeech?: string;
  difficulty?: string;
  prefix?: string;
  suffix?: string;
}

interface EnhancedSmartSearchProps {
  onResults: (results: WordRepositoryEntry[]) => void;
  onLoading?: (loading: boolean) => void;
}

export function EnhancedSmartSearch({ onResults, onLoading }: EnhancedSmartSearchProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [autocompleteResults, setAutocompleteResults] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("vocabguru-recent-searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load recent searches", e);
      }
    }
  }, []);

  const saveRecentSearch = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("vocabguru-recent-searches", JSON.stringify(updated));
  };

  const getAutocomplete = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setAutocompleteResults([]);
        setShowAutocomplete(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('word_profiles')
          .select('word')
          .ilike('word', `${searchQuery}%`)
          .limit(8);

        if (!error && data) {
          const words = data.map(item => item.word);
          setAutocompleteResults(words);
          setShowAutocomplete(words.length > 0);
        }
      } catch (error) {
        console.error('Autocomplete error:', error);
      }
    }, 300),
    []
  );

  const performSearch = async (searchQuery: string, searchFilters: SearchFilters) => {
    if (!searchQuery.trim() && Object.keys(searchFilters).length === 0) {
      onResults([]);
      return;
    }

    setIsSearching(true);
    onLoading?.(true);
    setShowAutocomplete(false);

    try {
      let query = supabase
        .from('word_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply search query
      if (searchQuery.trim()) {
        query = query.or(`word.ilike.%${searchQuery}%,definitions->>primary.ilike.%${searchQuery}%`);
      }

      // Apply filters
      if (searchFilters.etymology) {
        query = query.eq('etymology->>language_of_origin', searchFilters.etymology);
      }

      if (searchFilters.partOfSpeech) {
        query = query.ilike('analysis->>parts_of_speech', `%${searchFilters.partOfSpeech}%`);
      }

      if (searchFilters.difficulty) {
        query = query.eq('difficulty_level', searchFilters.difficulty);
      }

      if (searchFilters.prefix) {
        query = query.ilike('word', `${searchFilters.prefix}%`);
      }

      if (searchFilters.suffix) {
        query = query.ilike('word', `%${searchFilters.suffix}`);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      // Convert to WordRepositoryEntry format
      const results: WordRepositoryEntry[] = (data || []).map(profile => ({
        id: profile.id,
        word: profile.word,
        morpheme_breakdown: profile.morpheme_breakdown || { root: { text: profile.word, meaning: 'Root meaning to be analyzed' } },
        etymology: profile.etymology || {},
        definitions: {
          primary: profile.definitions?.primary,
          standard: profile.definitions?.standard || [],
          extended: profile.definitions?.extended || [],
          contextual: Array.isArray(profile.definitions?.contextual) ? 
            profile.definitions.contextual : 
            (profile.definitions?.contextual ? [profile.definitions.contextual] : []),
          specialized: Array.isArray(profile.definitions?.specialized) ?
            profile.definitions.specialized :
            (profile.definitions?.specialized ? [profile.definitions.specialized] : [])
        },
        word_forms: profile.word_forms || {},
        analysis: profile.analysis || {},
        source_apis: ['word_profiles'],
        frequency_score: 0,
        difficulty_level: 'medium',
        created_at: profile.created_at,
        updated_at: profile.updated_at
      }));

      onResults(results);
      
      if (searchQuery.trim()) {
        saveRecentSearch(searchQuery);
        generateAISuggestions(searchQuery);
      }

    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
      onResults([]);
    } finally {
      setIsSearching(false);
      onLoading?.(false);
    }
  };

  const generateAISuggestions = async (searchQuery: string) => {
    try {
      // Generate related word suggestions based on the search
      const relatedWords = [
        `${searchQuery}ing`,
        `${searchQuery}ed`,
        `un${searchQuery}`,
        `${searchQuery}ness`,
        `${searchQuery}ly`
      ].filter(word => word !== searchQuery);
      
      setSuggestions(relatedWords.slice(0, 4));
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    }
  };

  const debouncedSearch = useCallback(
    debounce((searchQuery: string, searchFilters: SearchFilters) => {
      performSearch(searchQuery, searchFilters);
    }, 500),
    []
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, filters);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    getAutocomplete(value);
    if (value.trim()) {
      debouncedSearch(value, filters);
    } else {
      onResults([]);
      setShowAutocomplete(false);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value === 'all' ? undefined : value };
    setFilters(newFilters);
    debouncedSearch(query, newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    debouncedSearch(query, {});
  };

  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setShowAutocomplete(false);
    performSearch(suggestion, filters);
  };

  const hasFilters = Object.keys(filters).some(key => filters[key as keyof SearchFilters]);

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search words, meanings, etymology..."
              className="pl-10 pr-4"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => setShowAutocomplete(autocompleteResults.length > 0)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}

            {/* Autocomplete Dropdown */}
            {showAutocomplete && autocompleteResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                {autocompleteResults.map((word, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-sm"
                    onClick={() => selectSuggestion(word)}
                  >
                    {word}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Filter className="h-4 w-4" />
                {hasFilters && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full"></div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Advanced Filters</h3>
                  {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Etymology</label>
                    <Select value={filters.etymology || 'all'} onValueChange={(value) => handleFilterChange('etymology', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any origin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any origin</SelectItem>
                        <SelectItem value="Latin">Latin</SelectItem>
                        <SelectItem value="Greek">Greek</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="German">German</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Part of Speech</label>
                    <Select value={filters.partOfSpeech || 'all'} onValueChange={(value) => handleFilterChange('partOfSpeech', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any type</SelectItem>
                        <SelectItem value="noun">Noun</SelectItem>
                        <SelectItem value="verb">Verb</SelectItem>
                        <SelectItem value="adjective">Adjective</SelectItem>
                        <SelectItem value="adverb">Adverb</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Prefix</label>
                    <Input 
                      placeholder="e.g., un-, re-, pre-"
                      value={filters.prefix || ''}
                      onChange={(e) => handleFilterChange('prefix', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Suffix</label>
                    <Input 
                      placeholder="e.g., -ing, -ed, -tion"
                      value={filters.suffix || ''}
                      onChange={(e) => handleFilterChange('suffix', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </form>

      {/* Active Filters */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            return (
              <Badge key={key} variant="secondary" className="gap-1">
                {key}: {value}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange(key as keyof SearchFilters, 'all')}
                />
              </Badge>
            );
          })}
        </div>
      )}

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Related Words</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => selectSuggestion(suggestion)}
                  className="h-7 text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Searches */}
      {recentSearches.length > 0 && !query && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Recent Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.slice(0, 5).map((search, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => selectSuggestion(search)}
                  className="h-7 text-xs"
                >
                  {search}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default EnhancedSmartSearch;
