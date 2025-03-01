
import { Word } from "@/data/words";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface WordCardProps {
  word: Word;
  priority?: boolean;
}

export function WordCard({ word, priority = false }: WordCardProps) {
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

  // For the thumbnail image
  const thumbnailImage = word.images?.[0];
  
  useEffect(() => {
    if (!priority && thumbnailImage) {
      const img = new Image();
      img.src = thumbnailImage.url;
      img.onload = () => setIsImageLoaded(true);
    }
  }, [thumbnailImage, priority]);

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
          {thumbnailImage && (
            <img
              src={thumbnailImage.url}
              alt={thumbnailImage.alt}
              className={cn(
                "w-full h-full object-cover object-center transition-all duration-500",
                isImageLoaded ? "image-loaded" : "image-loading"
              )}
              loading={priority ? "eager" : "lazy"}
            />
          )}
          {word.featured && (
            <div className="absolute top-3 right-3">
              <span className="chip bg-primary/90 text-white backdrop-blur-sm">
                Featured
              </span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-xl font-medium">{word.word}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {word.description}
          </p>
          
          <div className="mt-3 flex gap-2">
            <span className="chip bg-secondary text-secondary-foreground">
              {word.languageOrigin}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default WordCard;
