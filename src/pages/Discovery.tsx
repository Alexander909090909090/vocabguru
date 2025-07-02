
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, Database, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { SmartDiscoveryAgent } from '@/components/Discovery/SmartDiscoveryAgent';
import { EnhancedWordCard } from '@/components/Discovery/EnhancedWordCard';
import { useOptimizedWords } from '@/hooks/useOptimizedWords';
import { Link } from 'react-router-dom';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const Discovery: React.FC = () => {
  const { words, loading, error, loadWords, searchWords } = useOptimizedWords({ 
    autoLoad: false, 
    limit: 50 
  });
  
  const [databaseStatus, setDatabaseStatus] = useState<{
    wordCount: number;
    isInitialized: boolean;
    isInitializing: boolean;
  }>({
    wordCount: 0,
    isInitialized: false,
    isInitializing: false
  });

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    try {
      const { count } = await supabase
        .from('word_profiles')
        .select('*', { count: 'exact', head: true });

      const wordCount = count || 0;
      const isInitialized = wordCount >= 50;

      setDatabaseStatus({
        wordCount,
        isInitialized,
        isInitializing: false
      });

      if (isInitialized) {
        // Load words if database is ready
        loadWords();
      } else {
        // Auto-initialize if not enough words
        await autoInitializeDatabase();
      }
    } catch (error) {
      console.error('Error checking database status:', error);
      toast({
        title: "Database Check Failed",
        description: "Unable to check vocabulary database status",
        variant: "destructive"
      });
    }
  };

  const autoInitializeDatabase = async () => {
    if (databaseStatus.isInitializing) return;

    setDatabaseStatus(prev => ({ ...prev, isInitializing: true }));

    try {
      console.log('Auto-initializing vocabulary database...');
      
      toast({
        title: "Initializing Vocabulary Database",
        description: "Setting up your personalized word collection. This may take a moment...",
      });

      // Trigger smart population
      const { data, error } = await supabase.functions.invoke('smart-word-population', {
        body: { 
          mode: 'initial',
          targetCount: 100,
          categories: ['academic', 'common', 'technical', 'literary', 'business']
        }
      });

      if (error) {
        throw error;
      }

      const newWordCount = data.currentTotal || 0;
      
      setDatabaseStatus({
        wordCount: newWordCount,
        isInitialized: newWordCount >= 50,
        isInitializing: false
      });

      toast({
        title: "Database Initialized Successfully",
        description: `Added ${data.wordsAdded} words to your vocabulary collection. Ready to discover!`,
      });

      // Load the newly populated words
      loadWords();

    } catch (error) {
      console.error('Auto-initialization error:', error);
      setDatabaseStatus(prev => ({ ...prev, isInitializing: false }));
      
      toast({
        title: "Initialization Failed",
        description: "Failed to initialize vocabulary database. Please check your API configuration in Settings.",
        variant: "destructive"
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadWords();
      return;
    }

    try {
      await searchWords(searchQuery);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: "Unable to search words. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleWordsDiscovered = (discoveredWords: any[]) => {
    // Refresh the word list to include newly discovered words
    loadWords();
    
    // Update database status
    setDatabaseStatus(prev => ({
      ...prev,
      wordCount: prev.wordCount + discoveredWords.length
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!databaseStatus.isInitialized && databaseStatus.isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="container mx-auto py-16 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Database className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-white mb-4">
              Initializing Your Vocabulary Universe
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Calvarn is setting up your personalized word discovery system with AI-powered intelligence.
            </p>
            <div className="flex items-center justify-center gap-2 text-primary">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Building vocabulary database...</span>
            </div>
            <div className="mt-8 text-sm text-gray-400">
              <p>Current status: Adding high-value words from multiple categories</p>
              <p>This process will complete automatically</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <motion.div
        initial="initial"
        animate="in"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.3 }}
        className="container mx-auto py-8 px-4"
      >
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              Discover New Words
            </h1>
            <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
              Explore vocabulary with AI-powered discovery. Find words that match your interests, 
              expand your knowledge, and master the English language.
            </p>
            
            {/* Database Status */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Badge variant="outline" className="text-white border-primary">
                <Database className="h-4 w-4 mr-2" />
                {databaseStatus.wordCount} words available
              </Badge>
              {databaseStatus.isInitialized && (
                <Badge className="bg-green-500 text-white">
                  <Brain className="h-4 w-4 mr-2" />
                  Smart Discovery Ready
                </Badge>
              )}
            </div>
          </motion.div>
        </div>

        {/* Smart Discovery Agent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <SmartDiscoveryAgent onWordsDiscovered={handleWordsDiscovered} />
        </motion.div>

        <Separator className="my-8" />

        {/* Traditional Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Existing Vocabulary
              </CardTitle>
              <CardDescription>
                Browse and search through your current vocabulary collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search existing words..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Search'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* API Configuration Notice */}
        {!databaseStatus.isInitialized && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card className="border-yellow-500/50 bg-yellow-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-400">
                  <Settings className="h-5 w-5" />
                  Configure APIs for Full Experience
                </CardTitle>
                <CardDescription>
                  To enable AI-powered word discovery and automatic population, configure your API keys.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/api-management">
                  <Button variant="outline" className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/20">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure APIs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Word Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-gray-400">Loading vocabulary...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">Error loading words: {error}</p>
              <Button onClick={() => loadWords()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : words.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Words Found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery ? 
                  `No words found for "${searchQuery}". Try the Smart Discovery above to find new words.` :
                  'Use Smart Discovery above to populate your vocabulary database with AI-curated words.'
                }
              </p>
              <Button onClick={() => { setSearchQuery(''); loadWords(); }} variant="outline">
                Show All Words
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  {searchQuery ? `Search Results for "${searchQuery}"` : 'Vocabulary Collection'}
                </h2>
                <Badge variant="secondary">
                  {words.length} words
                </Badge>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {words.map((word) => (
                  <EnhancedWordCard key={word.id} word={word} />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Discovery;
