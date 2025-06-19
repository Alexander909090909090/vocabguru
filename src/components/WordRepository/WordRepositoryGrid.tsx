
import { useState, useEffect } from "react";
import { WordRepositoryService, WordRepositoryEntry } from "@/services/wordRepositoryService";
import { WordRepositoryCard } from "./WordRepositoryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export function WordRepositoryGrid() {
  const [words, setWords] = useState<WordRepositoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const loadWords = async (pageNum: number = 0, query?: string) => {
    try {
      setIsLoading(pageNum === 0);
      
      const { words: newWords, hasMore: moreAvailable } = await WordRepositoryService.getWordsWithPagination(
        pageNum,
        20,
        query
      );
      
      if (pageNum === 0) {
        setWords(newWords);
      } else {
        setWords(prev => [...prev, ...newWords]);
      }
      
      setHasMore(moreAvailable);
      setPage(pageNum);
    } catch (error) {
      console.error("Error loading words:", error);
      toast({
        title: "Error loading words",
        description: "Failed to load words from repository. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    loadWords(0);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    await loadWords(0, searchQuery.trim() || undefined);
  };

  const handleLoadMore = () => {
    loadWords(page + 1, searchQuery.trim() || undefined);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    loadWords(0);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative max-w-md">
        <Input
          type="text"
          placeholder="Search repository..."
          className="w-full bg-secondary/50 border-none h-10 pl-10 pr-20 focus-visible:ring-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isSearching}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
          {searchQuery && (
            <Button 
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={handleClearSearch}
            >
              Clear
            </Button>
          )}
          <Button 
            type="submit" 
            size="sm"
            className="h-8"
            disabled={isSearching}
          >
            {isSearching ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </div>
      </form>

      {/* Results Info */}
      {searchQuery && (
        <p className="text-sm text-muted-foreground">
          {isSearching ? "Searching..." : `Results for "${searchQuery}"`}
        </p>
      )}

      {/* Words Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading word repository...</span>
        </div>
      ) : words.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? "No words found matching your search." : "No words in repository yet."}
          </p>
          {searchQuery && (
            <Button variant="outline" onClick={handleClearSearch} className="mt-4">
              View All Words
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {words.map((wordEntry, index) => (
              <WordRepositoryCard 
                key={wordEntry.id} 
                wordEntry={wordEntry}
                priority={index < 8}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && !isSearching && (
            <div className="flex justify-center">
              <Button
                onClick={handleLoadMore}
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More Words"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default WordRepositoryGrid;
