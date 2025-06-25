
import { useState, useCallback, useEffect } from 'react';
import { Word } from '@/types/word';
import { WordService } from '@/services/wordService';
import { UserWordLibraryService } from '@/services/userWordLibraryService';
import { toast } from '@/hooks/use-toast';

export const useDiscoveryData = () => {
  const [enhancedWords, setEnhancedWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Initialize database on first load
  useEffect(() => {
    WordService.initializeDatabase();
  }, []);

  // Load words with pagination
  const loadEnhancedWords = useCallback(async (pageNum: number = 0, reset: boolean = true) => {
    setIsLoadingMore(true);
    
    try {
      const { words: newWords, hasMore: moreAvailable } = await WordService.getWords(
        pageNum,
        20
      );
      
      if (reset) {
        setEnhancedWords(newWords);
      } else {
        setEnhancedWords(prev => [...prev, ...newWords]);
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

  const addWordToCollection = async (word: Word) => {
    const wordToAdd = word.word;
    setIsAdding(wordToAdd);
    
    try {
      // Add to user's personal library
      await UserWordLibraryService.addWordToLibrary(word.id);
      
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

  return {
    enhancedWords,
    setEnhancedWords,
    filteredWords,
    setFilteredWords,
    isSearching,
    setIsSearching,
    isLoadingMore,
    setIsLoadingMore,
    isAdding,
    setIsAdding,
    page,
    setPage,
    hasMore,
    setHasMore,
    loadEnhancedWords,
    addWordToCollection
  };
};
