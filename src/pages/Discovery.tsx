
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import AIChatInterface from '@/components/AIChatInterface';
import { UnifiedWord } from '@/types/unifiedWord';
import { FloatingActionButton } from '@/components/Discovery/FloatingActionButton';
import { WordDetailDialog } from '@/components/Discovery/WordDetailDialog';
import { SearchModeToggle } from '@/components/Discovery/SearchModeToggle';
import { BrowseMode } from '@/components/Discovery/BrowseMode';
import { SmartSearchMode } from '@/components/Discovery/SmartSearchMode';
import { useDiscoveryData } from '@/hooks/useDiscoveryData';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const DiscoveryPage: React.FC = () => {
  const [searchMode, setSearchMode] = useState<'smart' | 'browse'>('browse');
  const [selectedWord, setSelectedWord] = useState<UnifiedWord | null>(null);
  const [isWordDialogOpen, setIsWordDialogOpen] = useState(false);

  const {
    enhancedWords,
    filteredWords,
    isSearching,
    isLoadingMore,
    isAdding,
    page,
    hasMore,
    setFilteredWords,
    setIsSearching,
    loadEnhancedWords,
    addWordToCollection
  } = useDiscoveryData();

  const handleSmartSearchResults = (results: UnifiedWord[]) => {
    setFilteredWords(results);
  };

  const handleWordSelect = (word: UnifiedWord) => {
    setSelectedWord(word);
    setIsWordDialogOpen(true);
  };

  return (
    <>
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
          Discover new words with AI-powered search and recommendations.
        </p>

        {/* Search Mode Toggle */}
        <SearchModeToggle 
          searchMode={searchMode}
          onModeChange={setSearchMode}
        />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Smart Search Mode */}
            {searchMode === 'smart' && (
              <SmartSearchMode
                filteredWords={filteredWords}
                isSearching={isSearching}
                isAdding={isAdding}
                onResults={handleSmartSearchResults}
                onLoading={setIsSearching}
                onWordSelect={handleWordSelect}
                onAddToCollection={addWordToCollection}
              />
            )}

            {/* Browse Mode */}
            {searchMode === 'browse' && (
              <BrowseMode
                enhancedWords={enhancedWords}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                page={page}
                loadEnhancedWords={loadEnhancedWords}
                onWordSelect={handleWordSelect}
                onAddToCollection={addWordToCollection}
              />
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

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Word Detail Dialog */}
      <WordDetailDialog
        word={selectedWord}
        isOpen={isWordDialogOpen}
        onClose={() => setIsWordDialogOpen(false)}
        onAddToCollection={addWordToCollection}
      />
    </>
  );
};

export default DiscoveryPage;
