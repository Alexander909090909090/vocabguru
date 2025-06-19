
import { WordRepositoryEntry } from "@/services/wordRepositoryService";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface WordRepositoryCardProps {
  wordEntry: WordRepositoryEntry;
  priority?: boolean;
}

export function WordRepositoryCard({ wordEntry, priority = false }: WordRepositoryCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(priority);
  
  // Create a gradient background based on the word id to ensure consistent colors per word
  const getGradient = (id: string) => {
    // Simple hash function for the word id
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Use the hash to generate hue values
    const hue1 = hash % 360;
    const hue2 = (hash * 7) % 360;
    
    return `linear-gradient(135deg, hsl(${hue1}, 80%, 60%), hsl(${hue2}, 80%, 50%))`;
  };

  return (
    <Link 
      to={`/word/${wordEntry.id}`}
      className="block"
    >
      <div className="glass-card overflow-hidden rounded-xl hover-card">
        <div 
          className="h-40 relative overflow-hidden"
          style={{ background: getGradient(wordEntry.id) }}
        >
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-2xl font-bold mb-1">{wordEntry.word}</h3>
              <p className="text-sm opacity-90">{wordEntry.phonetic}</p>
            </div>
          </div>
          
          {wordEntry.difficulty_level && (
            <div className="absolute top-3 right-3">
              <span className="chip bg-primary/90 text-white backdrop-blur-sm">
                {wordEntry.difficulty_level}
              </span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-xl font-medium">{wordEntry.word}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {wordEntry.definitions_data.primary || "No definition available"}
          </p>
          
          <div className="mt-3 flex gap-2">
            <span className="chip bg-secondary text-secondary-foreground">
              {wordEntry.etymology_data.language_of_origin || "Unknown"}
            </span>
            {wordEntry.analysis_data.parts_of_speech && (
              <span className="chip bg-primary/20 text-primary">
                {wordEntry.analysis_data.parts_of_speech}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default WordRepositoryCard;
