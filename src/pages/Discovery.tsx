
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Sparkles, Database, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { WordRepositoryGrid } from '@/components/WordRepository/WordRepositoryGrid';
import { SmartDiscoveryAgent } from '@/components/Discovery/SmartDiscoveryAgent';
import { WordRepositoryEntry, WordRepositoryService } from '@/services/wordRepositoryService';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';

interface DatabaseStatus {
  wordCount: number;
  isInitialized: boolean;
  isPopulating: boolean;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const Discovery: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWords, setFilteredWords] = useState<WordRepositoryEntry[]>([]);
  const [allWords, setAllWords] = useState<WordRepositoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus>({
    wordCount: 0,
    isInitialized: false,
    isPopulating: false
  });

  useEffect(() => {
    checkDatabaseStatus();
    loadWords();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredWords(allWords);
    } else {
      const filtered = allWords.filter(word =>
        word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (word.definitions?.primary && 
         word.definitions.primary.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredWords(filtered);
    }
  }, [searchTerm, allWords]);

  const checkDatabaseStatus = async () => {
    try {
      const { count, error } = await supabase
        .from('word_profiles')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      const wordCount = count || 0;
      setDatabaseStatus({
        wordCount,
        isInitialized: wordCount > 0,
        isPopulating: false
      });

      // Auto-initialize if database is empty
      if (wordCount < 100) {
        await initializeDatabase();
      }
    } catch (error) {
      console.error('Database status check failed:', error);
    }
  };

  const initializeDatabase = async () => {
    setDatabaseStatus(prev => ({ ...prev, isPopulating: true }));
    
    try {
      console.log('Auto-initializing database with essential vocabulary...');
      
      const { data, error } = await supabase.functions.invoke('smart-word-population', {
        body: { 
          mode: 'initial',
          targetCount: 200,
          categories: ['academic', 'common', 'technical', 'literary']
        }
      });

      if (error) throw error;

      toast({
        title: "Database Initialized",
        description: `Added ${data.wordsAdded} essential vocabulary words. Discovery is ready!`,
      });

      await checkDatabaseStatus();
      await loadWords();
    } catch (error) {
      console.error('Database initialization failed:', error);
      toast({
        title: "Initialization Failed",
        description: "Some dictionary APIs may not be configured. Check API Management in Settings.",
        variant: "destructive"
      });
    } finally {
      setDatabaseStatus(prev => ({ ...prev, isPopulating: false }));
    }
  };

  const loadWords = async () => {
    setIsLoading(true);
    try {
      const { words } = await WordRepositoryService.getWordsWithPagination(0, 500);
      setAllWords(words);
      setFilteredWords(words);
    } catch (error) {
      console.error('Failed to load words:', error);
      toast({
        title: "Loading Failed",
        description: "Failed to load vocabulary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWordsDiscovered = (newWords: WordRepositoryEntry[]) => {
    setAllWords(prev => [...newWords, ...prev]);
    setFilteredWords(prev => [...newWords, ...prev]);
    setDatabaseStatus(prev => ({
      ...prev,
      wordCount: prev.wordCount + newWords.length
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by useEffect
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <motion.div
        initial="initial"
        animate="in"
        exit="exit"
        variants={{
          initial: { opacity: 0, y: 20 },
          in: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 }
        }}
        transition={{ duration: 0.3 }}
        className="container mx-auto py-24 px-4 space-y-8"
      >
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Discover Words
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Explore our intelligent vocabulary database powered by AI and multiple dictionary sources
          </p>
          
          {/* Database Status */}
          <div className="flex justify-center">
            <Badge variant={databaseStatus.isInitialized ? "default" : "secondary"} className="text-sm">
              {databaseStatus.isPopulating ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Initializing Database...
                </>
              ) : (
                <>
                  <Database className="h-3 w-3 mr-1" />
                  {databaseStatus.wordCount} words available
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Smart Discovery Agent */}
        <SmartDiscoveryAgent onWordsDiscovered={handleWordsDiscovered} />

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search vocabulary..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">
              {searchTerm ? `Search Results (${filteredWords.length})` : `Vocabulary Library (${allWords.length})`}
            </h2>
            <Button 
              onClick={loadWords} 
              variant="outline" 
              disabled={isLoading}
              className="text-white border-white/20 hover:bg-white/10"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-slate-300">Loading vocabulary...</p>
            </div>
          ) : filteredWords.length > 0 ? (
            <WordRepositoryGrid />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {searchTerm ? 'No words found' : 'No vocabulary available'}
                </h3>
                <p className="text-slate-400 mb-4">
                  {searchTerm 
                    ? `Try a different search term or use the Smart Discovery feature above`
                    : 'The vocabulary database is being initialized. Please wait...'
                  }
                </p>
                {!searchTerm && !databaseStatus.isInitialized && (
                  <Button 
                    onClick={initializeDatabase}
                    disabled={databaseStatus.isPopulating}
                    className="bg-primary hover:bg-primary/80"
                  >
                    {databaseStatus.isPopulating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Initialize Database
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Discovery;
