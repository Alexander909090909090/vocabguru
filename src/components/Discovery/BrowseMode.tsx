
import { useEffect } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { UnifiedWord } from '@/types/unifiedWord';
import { AIRecommendations } from './AIRecommendations';
import EnhancedWordCard from './EnhancedWordCard';

interface BrowseModeProps {
  enhancedWords: UnifiedWord[];
  isLoadingMore: boolean;
  hasMore: boolean;
  page: number;
  loadEnhancedWords: (pageNum?: number, reset?: boolean) => Promise<void>;
  onWordSelect: (word: UnifiedWord) => void;
  onAddToCollection: (word: UnifiedWord) => void;
}

export function BrowseMode({
  enhancedWords,
  isLoadingMore,
  hasMore,
  page,
  loadEnhancedWords,
  onWordSelect,
  onAddToCollection
}: BrowseModeProps) {
  // Load initial words
  useEffect(() => {
    loadEnhancedWords(0, true);
  }, [loadEnhancedWords]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
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
  }, [hasMore, isLoadingMore, page, loadEnhancedWords]);

  return (
    <div className="space-y-6">
      <AIRecommendations 
        onWordSelect={onWordSelect}
        onAddToCollection={onAddToCollection}
      />
      
      <div>
        <h2 className="text-2xl font-medium mb-4">All Words</h2>
        
        {enhancedWords.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              {enhancedWords.map((word, index) => (
                <EnhancedWordCard 
                  key={word.id} 
                  wordProfile={word}
                  onAddToCollection={onAddToCollection}
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
  );
}

export default BrowseMode;
