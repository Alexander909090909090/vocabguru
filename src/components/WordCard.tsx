
import { Word } from "@/data/words";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { UnifiedWord } from "@/hooks/useUnifiedWords";
// Removed UnsplashImageService import - using gradients only

interface WordCardProps {
  word: UnifiedWord;
  priority?: boolean;
}

export function WordCard({ word, priority = false }: WordCardProps) {
  // Removed image loading state - using gradients only
  
  // Create a gradient background based on the word id to ensure consistent colors per word
  const getGradient = (id: string) => {
    // Simple hash function for the word id
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Use the hash to generate hue values
    const hue1 = hash % 360;
    const hue2 = (hash * 7) % 360;
    
    return `linear-gradient(135deg, hsl(${hue1}, 80%, 60%), hsl(${hue2}, 80%, 50%))`;
  };

  // Always use gradient background (no images)
  const thumbnailImage = null;

  return (
    <Link 
      to={`/word/${word.id}`}
      className="block"
    >
      <div className="glass-card overflow-hidden rounded-xl hover-card">
        <div 
          className="h-40 relative overflow-hidden"
          style={{ background: getGradient(word.id) }}
        >
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-2xl font-bold mb-1">{word.word}</h3>
              <p className="text-sm opacity-90">{word.description?.slice(0, 50)}...</p>
            </div>
          </div>
          {word.featured && (
            <div className="absolute top-3 right-3">
              <span className="chip bg-primary/90 text-white backdrop-blur-sm">
                Featured
              </span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-medium">{word.word}</h3>
            {word.source && (
              <Badge variant={word.source === 'database' ? 'default' : word.source === 'dictionary' ? 'secondary' : 'outline'} className="text-xs">
                {word.source === 'database' ? 'Enhanced' : word.source === 'dictionary' ? 'Personal' : 'Legacy'}
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {word.description}
          </p>
          
          {/* Morpheme Breakdown Preview */}
          {word.morphemeBreakdown && (
            <div className="mt-2 flex items-center gap-1 text-xs">
              {word.morphemeBreakdown.prefix && (
                <span className="bg-primary/10 text-primary px-2 py-1 rounded border">
                  {word.morphemeBreakdown.prefix.text}
                </span>
              )}
              <span className="bg-primary/20 text-primary px-2 py-1 rounded border font-medium">
                {word.morphemeBreakdown.root.text}
              </span>
              {word.morphemeBreakdown.suffix && (
                <span className="bg-primary/10 text-primary px-2 py-1 rounded border">
                  {word.morphemeBreakdown.suffix.text}
                </span>
              )}
            </div>
          )}
          
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="chip bg-secondary text-secondary-foreground">
              {word.languageOrigin}
            </span>
            <span className="chip bg-accent text-accent-foreground">
              {word.partOfSpeech}
            </span>
            {word.quality_score && word.quality_score > 70 && (
              <span className="chip bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                Quality: {word.quality_score}%
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default WordCard;
