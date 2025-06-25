
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Search, BarChart3, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ComprehensiveAnalysisPanel } from '@/components/LinguisticAnalysis/ComprehensiveAnalysisPanel';
import { BatchAnalysisPanel } from '@/components/LinguisticAnalysis/BatchAnalysisPanel';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const LinguisticAnalysisPage: React.FC = () => {
  const [searchWord, setSearchWord] = useState('');
  const [activeWord, setActiveWord] = useState('');

  const handleWordSearch = () => {
    if (searchWord.trim()) {
      setActiveWord(searchWord.trim().toLowerCase());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleWordSearch();
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
      className="container mx-auto py-8 px-4"
    >
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-semibold">Comprehensive Linguistic Analysis</h1>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Advanced AI-powered linguistic analysis with morphological decomposition, etymology, phonetics, 
        semantic relationships, and usage patterns.
      </p>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Single Word Analysis
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Batch Analysis
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Analysis Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6 mt-6">
          <div className="flex gap-2 max-w-md">
            <Input
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter word to analyze..."
              className="flex-1"
            />
            <Button onClick={handleWordSearch} disabled={!searchWord.trim()}>
              <Search className="h-4 w-4 mr-2" />
              Analyze
            </Button>
          </div>

          {activeWord && (
            <ComprehensiveAnalysisPanel
              word={activeWord}
              onAnalysisComplete={(analysis) => {
                console.log('Analysis completed:', analysis);
              }}
            />
          )}

          {!activeWord && (
            <div className="text-center py-12 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Enter a word above to start comprehensive linguistic analysis</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="batch" className="space-y-6 mt-6">
          <BatchAnalysisPanel />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-6">
          <div className="bg-secondary/20 p-6 rounded-lg">
            <p className="text-center text-muted-foreground">
              Analysis settings and model configuration will be available in a future update.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default LinguisticAnalysisPage;
