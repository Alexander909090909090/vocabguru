
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Target, TrendingUp, BookOpen, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { personalizedAIService } from '@/services/personalizedAIService';
import { toast } from 'sonner';

interface RecommendationCard {
  id: string;
  word: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  reason: string;
  confidence: number;
  learningValue: number;
  category: string;
}

interface EnhancedRecommendationEngineProps {
  userId?: string;
  onWordSelect: (word: string) => void;
  currentLevel: string;
}

export const EnhancedRecommendationEngine: React.FC<EnhancedRecommendationEngineProps> = ({
  userId,
  onWordSelect,
  currentLevel = 'intermediate'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [recommendationCount, setRecommendationCount] = useState(6);

  const { data: recommendations, isLoading, error, refetch } = useQuery({
    queryKey: ['enhanced-recommendations', userId, currentLevel, selectedCategory],
    queryFn: async () => {
      try {
        const response = await personalizedAIService.getPersonalizedRecommendations(
          userId || 'anonymous',
          {
            level: currentLevel,
            category: selectedCategory === 'all' ? undefined : selectedCategory,
            count: recommendationCount,
            includeReasons: true
          }
        );
        return response.recommendations || [];
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        return generateFallbackRecommendations();
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const generateFallbackRecommendations = (): RecommendationCard[] => {
    const fallbackWords = [
      { word: 'ambiguous', difficulty: 'intermediate', category: 'academic', reason: 'Essential for critical thinking' },
      { word: 'synthesis', difficulty: 'advanced', category: 'academic', reason: 'Key concept in analysis' },
      { word: 'pragmatic', difficulty: 'intermediate', category: 'philosophy', reason: 'Practical decision-making' },
      { word: 'empirical', difficulty: 'advanced', category: 'science', reason: 'Scientific methodology' },
      { word: 'vernacular', difficulty: 'intermediate', category: 'linguistics', reason: 'Language variation' },
      { word: 'epitome', difficulty: 'intermediate', category: 'literature', reason: 'Perfect representation' }
    ];

    return fallbackWords.map((word, index) => ({
      id: `fallback-${index}`,
      word: word.word,
      difficulty: word.difficulty as 'beginner' | 'intermediate' | 'advanced',
      reason: word.reason,
      confidence: 0.75 + Math.random() * 0.2,
      learningValue: 0.8 + Math.random() * 0.2,
      category: word.category
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = ['all', 'academic', 'science', 'literature', 'philosophy', 'linguistics', 'business'];

  const handleWordSelect = (word: string) => {
    onWordSelect(word);
    toast.success(`Selected "${word}" for detailed analysis`);
  };

  const refreshRecommendations = () => {
    refetch();
    toast.success('Recommendations refreshed!');
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">Unable to load personalized recommendations</p>
          <Button onClick={refreshRecommendations} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Recommendations
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              Personalized for your {currentLevel} level
            </p>
            <Button
              onClick={refreshRecommendations}
              variant="ghost"
              size="sm"
              disabled={isLoading}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations?.map((rec, index) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-4 h-full flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{rec.word}</h3>
                        <Badge className={getDifficultyColor(rec.difficulty)}>
                          {rec.difficulty}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 flex-grow">
                        {rec.reason}
                      </p>

                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-xs">
                          <span>Confidence</span>
                          <span>{Math.round(rec.confidence * 100)}%</span>
                        </div>
                        <Progress value={rec.confidence * 100} className="h-1" />

                        <div className="flex justify-between text-xs">
                          <span>Learning Value</span>
                          <span>{Math.round(rec.learningValue * 100)}%</span>
                        </div>
                        <Progress value={rec.learningValue * 100} className="h-1" />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleWordSelect(rec.word)}
                          className="flex-1"
                          size="sm"
                        >
                          <BookOpen className="h-4 w-4 mr-1" />
                          Study
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.success('Added to favorites!')}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
