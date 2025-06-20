
import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, X, Sparkles } from "lucide-react";
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
}

interface SmartSearchProps {
  onResults: (results: WordRepositoryEntry[]) => void;
  onLoading?: (loading: boolean) => void;
}

export function SmartSearch({ onResults, onLoading }: SmartSearchProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem("vocabguru-recent-smart-searches");
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
    localStorage.setItem("vocabguru-recent-smart-searches", JSON.stringify(updated));
  };

  const performSearch = async (searchQuery: string, searchFilters: SearchFilters) => {
    if (!searchQuery.trim() && Object.keys(searchFilters).length === 0) {
      onResults([]);
      return;
    }

    setIsSearching(true);
    onLoading?.(true);

    try {
      const { data, error } = await supabase.functions.invoke('smart-search', {
        body: { query: searchQuery, filters: searchFilters, limit: 30 }
      });

      if (error) throw error;

      onResults(data.results || []);
      
      if (searchQuery.trim()) {
        saveRecentSearch(searchQuery);
      }

      // Generate AI-powered suggestions
      if (searchQuery.trim()) {
        generateSuggestions(searchQuery);
      }
    } catch (error) {
      console.error('Smart search error:', error);
      toast.error('Search failed. Please try again.');
      onResults([]);
    } finally {
      setIsSearching(false);
      onLoading?.(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((searchQuery: string, searchFilters: SearchFilters) => {
      performSearch(searchQuery, searchFilters);
    }, 500),
    []
  );

  const generateSuggestions = async (searchQuery: string) => {
    try {
      const response = await fetch('https://api.datamuse.com/words', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        const suggestionWords = data.slice(0, 5).map((item: any) => item.word);
        setSuggestions(suggestionWords);
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, filters);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    debouncedSearch(value, filters);
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
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
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
                  <h3 className="font-semibold">Search Filters</h3>
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
                        <SelectItem value="Spanish">Spanish</SelectItem>
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
                        <SelectItem value="preposition">Preposition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Difficulty</label>
                    <Select value={filters.difficulty || 'all'} onValueChange={(value) => handleFilterChange('difficulty', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any level</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
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
              <span className="text-sm font-medium">AI Suggestions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQueryChange(suggestion)}
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
            <div className="text-sm font-medium mb-2">Recent Searches</div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.slice(0, 5).map((search, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQueryChange(search)}
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

export default SmartSearch;
