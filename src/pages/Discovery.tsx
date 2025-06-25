
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Brain, Sparkles, Filter, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedRecommendationEngine } from '@/components/Discovery/EnhancedRecommendationEngine';
import { AdvancedSemanticSearch } from '@/components/Search/AdvancedSemanticSearch';
import { ContextualNavigation } from '@/components/Navigation/ContextualNavigation';
import { BrowseMode } from '@/components/Discovery/BrowseMode';
import { SmartSearchMode } from '@/components/Discovery/SmartSearchMode';
import { useAuth } from '@/context/AuthContext';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const Discovery = () => {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState<'browse' | 'smart' | 'ai'>('ai');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (query: string, filters: any) => {
    console.log('Discovery search:', query, filters);
    // Implement search logic
  };

  const handleWordSelect = (word: string) => {
    window.location.href = `/word/${word}`;
  };

  const discoveryModes = [
    { 
      id: 'ai', 
      label: 'AI Recommendations', 
      icon: Brain,
      description: 'Personalized word suggestions powered by AI'
    },
    { 
      id: 'smart', 
      label: 'Smart Search', 
      icon: Sparkles,
      description: 'Semantic search with advanced filtering'
    },
    { 
      id: 'browse', 
      label: 'Browse Library', 
      icon: Globe,
      description: 'Explore our comprehensive word collection'
    }
  ];

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
      className="container mx-auto py-8 px-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <Globe className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-semibold">Discovery Center</h1>
              <p className="text-muted-foreground">
                Explore new vocabulary with AI-powered recommendations and advanced search
              </p>
            </div>
          </motion.div>

          {/* Mode Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Discovery Modes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {discoveryModes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <Button
                      key={mode.id}
                      variant={activeMode === mode.id ? 'default' : 'outline'}
                      className="h-auto p-4 flex flex-col items-start gap-2"
                      onClick={() => setActiveMode(mode.id as any)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{mode.label}</span>
                      </div>
                      <p className="text-xs text-left opacity-75">
                        {mode.description}
                      </p>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Content based on selected mode */}
          <div className="space-y-6">
            {activeMode === 'ai' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key="ai-mode"
              >
                <EnhancedRecommendationEngine
                  userId={user?.id}
                  onWordSelect={handleWordSelect}
                  currentLevel={user?.learning_level || 'intermediate'}
                />
              </motion.div>
            )}

            {activeMode === 'smart' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key="smart-mode"
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Smart Semantic Search
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AdvancedSemanticSearch
                      onSearch={handleSearch}
                      onWordSelect={handleWordSelect}
                      placeholder="Search by meaning, concept, usage context..."
                      showFilters={true}
                    />
                  </CardContent>
                </Card>
                <SmartSearchMode />
              </motion.div>
            )}

            {activeMode === 'browse' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key="browse-mode"
              >
                <BrowseMode />
              </motion.div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ContextualNavigation 
            currentContext="Discovery"
            nextSteps={[
              {
                icon: <Brain className="h-4 w-4" />,
                label: 'Study Selected Words',
                href: '/study-center',
                description: 'Create a study session with discovered words',
                primary: true
              },
              {
                icon: <TrendingUp className="h-4 w-4" />,
                label: 'Deep Analysis',
                href: '/linguistic-analysis',
                description: 'Analyze word morphology and etymology'
              }
            ]}
          />

          {/* Discovery Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Discovery Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Words Discovered Today</span>
                <Badge variant="secondary">12</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">AI Accuracy</span>
                <Badge variant="default">94%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Favorite Category</span>
                <Badge variant="outline">Academic</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Discoveries */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Discoveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {['perspicacious', 'ubiquitous', 'serendipity', 'ephemeral'].map((word) => (
                  <Button
                    key={word}
                    variant="ghost"
                    className="w-full justify-start h-auto p-2"
                    onClick={() => handleWordSelect(word)}
                  >
                    <span className="font-medium">{word}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default Discovery;
