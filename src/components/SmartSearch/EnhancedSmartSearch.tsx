
import React, { useState, useCallback, useEffect } from 'react';
import { Search, Filter, Sparkles, Loader2, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WordRepositoryEntry, WordRepositoryService } from '@/services/wordRepositoryService';
import { UnifiedWordService } from '@/services/unifiedWordService';
import { toast } from '@/components/ui/use-toast';
import { DatabaseMigrationService } from '@/services/databaseMigrationService';

interface EnhancedSmartSearchProps {
  onResults: (results: WordRepositoryEntry[]) => void;
  onLoading: (loading: boolean) => void;
}

export const EnhancedSmartSearch: React.FC<EnhancedSmartSearchProps> = ({
  onResults,
  onLoading
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    etymology: '',
    partOfSpeech: '',
    difficulty: ''
  });
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [databaseStats, setDatabaseStats] = useState({ totalWords: 0, isReady: false });

  // Check database status on component mount
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const stats = await DatabaseMigrationService.getMigrationStats();
        setDatabaseStats({ 
          totalWords: stats.totalWords, 
          isReady: stats.totalWords > 0 
        });
      } catch (error) {
        console.error('Error checking database status:', error);
        setDatabaseStats({ totalWords: 0, isReady: false });
      }
    };

    checkDatabase();
  }, []);

  // Generate search suggestions based on query
  const generateSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      // Get suggestions from database first
      const results = await UnifiedWordService.searchWords(searchQuery, { limit: 5 });
      const wordSuggestions = results.map(word => word.word);
      
      // Add some common search patterns if database is empty
      if (wordSuggestions.length === 0) {
        const commonPatterns = [
          `${searchQuery}*`,
          `*${searchQuery}`,
          `${searchQuery}ing`,
          `${searchQuery}ed`,
          `${searchQuery}ly`
        ].filter(pattern => pattern !== searchQuery);
        
        setSuggestions(commonPatterns.slice(0, 3));
      } else {
        setSuggestions(wordSuggestions);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setSuggestions([]);
    }
  }, []);

  // Debounced suggestion generation
  useEffect(() => {
    const timer = setTimeout(() => {
      generateSuggestions(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, generateSuggestions]);

  const handleSearch = async (searchQuery?: string) => {
    const actualQuery = searchQuery || query;
    
    if (!actualQuery.trim()) {
      toast({
        title: "Empty search",
        description: "Please enter a word to search for.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    onLoading(true);

    try {
      // Check if database needs initialization
      if (!databaseStats.isReady) {
        toast({
          title: "Initializing database",
          description: "Setting up your vocabulary collection...",
        });
        
        await DatabaseMigrationService.initializeDatabase();
        
        // Update database stats
        const newStats = await DatabaseMigrationService.getMigrationStats();
        setDatabaseStats({ 
          totalWords: newStats.totalWords, 
          isReady: newStats.totalWords > 0 
        });
      }

      // Perform search using UnifiedWordService
      const results = await UnifiedWordService.searchWords(actualQuery, {
        includeDefinitions: true,
        includeMorphemes: true,
        limit: 20
      });

      // Apply filters if set
      let filteredResults = results;
      
      if (filters.etymology) {
        filteredResults = filteredResults.filter(word => 
          word.etymology.language_of_origin?.toLowerCase().includes(filters.etymology.toLowerCase())
        );
      }
      
      if (filters.partOfSpeech) {
        filteredResults = filteredResults.filter(word => 
          word.analysis.parts_of_speech?.toLowerCase() === filters.partOfSpeech.toLowerCase()
        );
      }
      
      if (filters.difficulty) {
        filteredResults = filteredResults.filter(word => 
          word.difficulty_level === filters.difficulty
        );
      }

      onResults(filteredResults);
      setShowSuggestions(false);
      
      if (filteredResults.length === 0) {
        toast({
          title: "No results found",
          description: `No words found matching "${actualQuery}". Try a different search term.`,
        });
      } else {
        toast({
          title: "Search completed",
          description: `Found ${filteredResults.length} word${filteredResults.length === 1 ? '' : 's'} matching "${actualQuery}".`,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
      onLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      etymology: '',
      partOfSpeech: '',
      difficulty: ''
    });
    
    if (query) {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  return (
    <div className="space-y-4">
      {/* Database Status Indicator */}
      {!databaseStats.isReady && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-800 dark:text-amber-200">
                Database is being initialized. Search will use fallback data until ready.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for words, meanings, or concepts..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-10 pr-4"
            />
          </div>
          <Button 
            onClick={() => handleSearch()} 
            disabled={isSearching || !query.trim()}
            className="flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <Card className="absolute top-full left-0 right-16 mt-1 z-50 shadow-lg">
            <CardContent className="p-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  <span className="capitalize">{suggestion}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Select value={filters.etymology} onValueChange={(value) => setFilters(prev => ({ ...prev, etymology: value }))}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Etymology" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Origins</SelectItem>
            <SelectItem value="latin">Latin</SelectItem>
            <SelectItem value="greek">Greek</SelectItem>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="french">French</SelectItem>
            <SelectItem value="german">German</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.partOfSpeech} onValueChange={(value) => setFilters(prev => ({ ...prev, partOfSpeech: value }))}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Part of Speech" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="noun">Noun</SelectItem>
            <SelectItem value="verb">Verb</SelectItem>
            <SelectItem value="adjective">Adjective</SelectItem>
            <SelectItem value="adverb">Adverb</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.difficulty} onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>

        {(filters.etymology || filters.partOfSpeech || filters.difficulty) && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Database Stats */}
      {databaseStats.isReady && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <BookOpen className="h-4 w-4" />
          <span>{databaseStats.totalWords.toLocaleString()} words in database</span>
        </div>
      )}
    </div>
  );
};
