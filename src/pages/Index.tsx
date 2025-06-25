
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, BookOpen, Target, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WordGrid from '@/components/WordGrid';
import { EnhancedRecommendationEngine } from '@/components/Discovery/EnhancedRecommendationEngine';
import { PersonalizedDashboard } from '@/components/Dashboard/PersonalizedDashboard';
import { AdvancedSemanticSearch } from '@/components/Search/AdvancedSemanticSearch';
import { ContextualNavigation } from '@/components/Navigation/ContextualNavigation';
import { useWords } from '@/hooks/useWords';
import { useAuth } from '@/context/AuthContext';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const Index = () => {
  const { words, loading } = useWords();
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleSearch = (query: string, filters: any) => {
    setSearchQuery(query);
    console.log('Search:', query, filters);
  };

  const handleWordSelect = (word: string) => {
    window.location.href = `/word/${word}`;
  };

  const filterButtons = [
    { id: 'all', label: 'All Words', icon: BookOpen },
    { id: 'prefix', label: 'Prefixes', icon: Target },
    { id: 'suffix', label: 'Suffixes', icon: Target },
    { id: 'origin', label: 'Etymology', icon: TrendingUp },
    { id: 'dictionary', label: 'Dictionary', icon: Search },
  ];

  // Convert words to compatible format
  const filteredWords = words?.filter(word => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'prefix') return word.word.length > 4;
    if (selectedFilter === 'suffix') return word.word.endsWith('ing') || word.word.endsWith('tion');
    if (selectedFilter === 'origin') return word.word.length > 6;
    if (selectedFilter === 'dictionary') return true;
    return true;
  })?.map(word => ({
    ...word,
    etymology: {
      origin: word.etymology?.origin || word.etymology?.historical_origins || '',
      evolution: word.etymology?.evolution || word.etymology?.word_evolution || '',
      culturalVariations: word.etymology?.culturalVariations || word.etymology?.cultural_variations
    }
  })) || [];

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
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, Scholar! 👋
            </h1>
            <p className="text-muted-foreground">
              Continue your vocabulary journey with personalized AI recommendations
            </p>
          </motion.div>

          {/* Enhanced Search */}
          <Card>
            <CardContent className="p-6">
              <AdvancedSemanticSearch
                onSearch={handleSearch}
                onWordSelect={handleWordSelect}
                placeholder="Search words by meaning, concept, or usage..."
              />
            </CardContent>
          </Card>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="words" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Words
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                AI Picks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6 mt-6">
              <PersonalizedDashboard userId={user?.id} />
            </TabsContent>

            <TabsContent value="words" className="space-y-6 mt-6">
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {filterButtons.map(({ id, label, icon: Icon }) => (
                  <Button
                    key={id}
                    variant={selectedFilter === id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter(id)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Change View
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Word
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Quiz
                </Button>
              </div>

              {/* Word Grid */}
              <WordGrid words={filteredWords} isLoading={loading} />
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6 mt-6">
              <EnhancedRecommendationEngine
                userId={user?.id}
                onWordSelect={handleWordSelect}
                currentLevel={(user as any)?.learning_level || 'intermediate'}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ContextualNavigation currentContext="Dashboard" />
          
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">Words Learned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">7</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">89%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default Index;
