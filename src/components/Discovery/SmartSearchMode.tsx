
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2 } from 'lucide-react';
import { UnifiedWord } from '@/types/unifiedWord';
import { EnhancedSmartSearch } from '@/components/SmartSearch/EnhancedSmartSearch';
import { AIRecommendations } from './AIRecommendations';

interface SmartSearchModeProps {
  filteredWords: UnifiedWord[];
  isSearching: boolean;
  isAdding: string | null;
  onResults: (results: UnifiedWord[]) => void;
  onLoading: (loading: boolean) => void;
  onWordSelect: (word: UnifiedWord) => void;
  onAddToCollection: (word: UnifiedWord) => void;
}

export function SmartSearchMode({
  filteredWords,
  isSearching,
  isAdding,
  onResults,
  onLoading,
  onWordSelect,
  onAddToCollection
}: SmartSearchModeProps) {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <EnhancedSmartSearch 
          onResults={onResults}
          onLoading={onLoading}
        />
      </div>

      {filteredWords.length > 0 ? (
        <>
          <h2 className="text-2xl font-medium">Search Results</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {filteredWords.map((word) => (
              <Card 
                key={word.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onWordSelect(word)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold capitalize">{word.word}</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCollection(word);
                      }}
                      disabled={isAdding === word.word}
                    >
                      {isAdding === word.word ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
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
        </>
      ) : !isSearching && (
        <AIRecommendations 
          onWordSelect={onWordSelect}
          onAddToCollection={onAddToCollection}
        />
      )}
    </div>
  );
}

export default SmartSearchMode;
