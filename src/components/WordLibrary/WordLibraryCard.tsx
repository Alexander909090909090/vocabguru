
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, BookOpen, Star, Trash2 } from 'lucide-react';
import { UserWordLibraryEntry } from '@/services/userWordLibraryService';
import { useState } from 'react';

interface WordLibraryCardProps {
  entry: UserWordLibraryEntry;
  onUpdateProgress: (wordId: string, updates: {
    mastery_level?: number;
    notes?: string;
    is_favorite?: boolean;
  }) => Promise<boolean>;
  onRemove: (wordId: string) => Promise<boolean>;
}

export function WordLibraryCard({ entry, onUpdateProgress, onRemove }: WordLibraryCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleMasteryUpdate = async (level: number) => {
    setIsUpdating(true);
    await onUpdateProgress(entry.word_id, { mastery_level: level });
    setIsUpdating(false);
  };

  const handleFavoriteToggle = async () => {
    setIsUpdating(true);
    await onUpdateProgress(entry.word_id, { is_favorite: !entry.is_favorite });
    setIsUpdating(false);
  };

  const handleRemove = async () => {
    if (confirm('Are you sure you want to remove this word from your library?')) {
      await onRemove(entry.word_id);
    }
  };

  const getMasteryLabel = (level: number) => {
    switch (level) {
      case 0: return 'New';
      case 1: return 'Learning';
      case 2: return 'Familiar';
      case 3: return 'Known';
      case 4: return 'Mastered';
      case 5: return 'Expert';
      default: return 'Unknown';
    }
  };

  const getMasteryColor = (level: number) => {
    if (level >= 4) return 'text-green-500';
    if (level >= 3) return 'text-blue-500';
    if (level >= 2) return 'text-yellow-500';
    if (level >= 1) return 'text-orange-500';
    return 'text-gray-500';
  };

  return (
    <Card className="relative group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{entry.word?.word || 'Unknown Word'}</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteToggle}
              disabled={isUpdating}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Heart 
                className={`h-4 w-4 ${entry.is_favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isUpdating}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="outline" className={getMasteryColor(entry.mastery_level)}>
            {getMasteryLabel(entry.mastery_level)}
          </Badge>
          <Badge variant="secondary">
            <BookOpen className="h-3 w-3 mr-1" />
            {entry.study_count} studies
          </Badge>
          {entry.is_favorite && (
            <Badge variant="destructive">
              <Star className="h-3 w-3 mr-1" />
              Favorite
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Mastery Progress</span>
            <span>{entry.mastery_level}/5</span>
          </div>
          <Progress value={(entry.mastery_level / 5) * 100} className="h-2" />
        </div>

        {entry.word?.definitions?.primary && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {entry.word.definitions.primary}
          </p>
        )}

        {entry.notes && (
          <div className="text-sm">
            <strong>Notes:</strong> {entry.notes}
          </div>
        )}

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <Button
              key={level}
              variant={entry.mastery_level >= level ? "default" : "outline"}
              size="sm"
              onClick={() => handleMasteryUpdate(level)}
              disabled={isUpdating}
              className="flex-1 text-xs"
            >
              {level}
            </Button>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">
          Added: {new Date(entry.added_at).toLocaleDateString()}
          {entry.last_studied && (
            <span className="ml-2">
              Last studied: {new Date(entry.last_studied).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
