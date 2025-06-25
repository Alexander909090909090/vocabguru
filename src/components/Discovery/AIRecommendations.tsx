
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Plus, Loader2 } from 'lucide-react';
import { Word } from '@/types/word';
import { WordService } from '@/services/wordService';

interface AIRecommendationsProps {
  onWordSelect: (word: Word) => void;
  onAddToCollection: (word: Word) => void;
}

export function AIRecommendations({ onWordSelect, onAddToCollection }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const { words } = await WordService.getWords(0, 6);
      setRecommendations(words);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCollection = async (word: Word) => {
    setIsAdding(word.id);
    try {
      await onAddToCollection(word);
    } finally {
      setIsAdding(null);
    }
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">AI Recommendations</h2>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">AI Recommendations</h2>
        <Badge variant="secondary" className="text-xs">Personalized for you</Badge>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((word) => (
          <Card 
            key={word.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onWordSelect(word)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg capitalize">{word.word}</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCollection(word);
                  }}
                  disabled={isAdding === word.id}
                >
                  {isAdding === word.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {word.definitions.primary}
              </p>
              <div className="flex flex-wrap gap-1">
                {word.analysis?.parts_of_speech && (
                  <Badge variant="secondary" className="text-xs">
                    {word.analysis.parts_of_speech}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {word.difficulty_level}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default AIRecommendations;
