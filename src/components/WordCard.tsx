
import { Word } from "@/data/words";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EnhancedWordProfile } from "@/types/enhancedWordProfile";

interface WordCardProps {
  word: Word | EnhancedWordProfile;
  priority?: boolean;
}

// Type guard to check if word is EnhancedWordProfile
function isEnhancedWordProfile(word: Word | EnhancedWordProfile): word is EnhancedWordProfile {
  return 'morpheme_breakdown' in word;
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

  // For the thumbnail image - handle both word types
  const thumbnailImage = word.images?.[0];
  
  useEffect(() => {
    if (!priority && thumbnailImage) {
      const img = new Image();
      img.src = thumbnailImage.url;
      img.onload = () => setIsImageLoaded(true);
    }
  }, [thumbnailImage, priority]);

  // Extract data based on word type
  const wordData = {
    id: word.id,
    word: word.word,
    description: isEnhancedWordProfile(word) ? word.description : word.description,
    languageOrigin: isEnhancedWordProfile(word) 
      ? word.etymology?.language_of_origin || word.languageOrigin 
      : word.languageOrigin,
    partOfSpeech: isEnhancedWordProfile(word) ? word.partOfSpeech : word.partOfSpeech,
    featured: word.featured,
    morphemeBreakdown: isEnhancedWordProfile(word) 
      ? word.morpheme_breakdown 
      : word.morphemeBreakdown
  };

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
          {wordData.featured && (
            <div className="absolute top-3 right-3">
              <span className="chip bg-primary/90 text-white backdrop-blur-sm">
                Featured
              </span>
            </div>
          )}
          
          {/* Enhanced: Show morpheme breakdown preview */}
          {wordData.morphemeBreakdown && (
            <div className="absolute bottom-2 left-2 right-2">
              <div className="flex flex-wrap gap-1">
                {wordData.morphemeBreakdown.prefix && (
                  <Badge variant="secondary" className="text-xs bg-white/20 text-white border-none">
                    {wordData.morphemeBreakdown.prefix.text}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs bg-white/30 text-white border-none font-medium">
                  {wordData.morphemeBreakdown.root.text}
                </Badge>
                {wordData.morphemeBreakdown.suffix && (
                  <Badge variant="secondary" className="text-xs bg-white/20 text-white border-none">
                    {wordData.morphemeBreakdown.suffix.text}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-medium">{wordData.word}</h3>
            {/* Enhanced: Show quality indicator for enriched profiles */}
            {isEnhancedWordProfile(word) && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-muted-foreground">Enhanced</span>
              </div>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {wordData.description}
          </p>
          
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="chip bg-secondary text-secondary-foreground">
              {wordData.languageOrigin}
            </span>
            {wordData.partOfSpeech && (
              <span className="chip bg-primary/20 text-primary">
                {wordData.partOfSpeech}
              </span>
            )}
          </div>

          {/* Enhanced: Show additional insights for enriched profiles */}
          {isEnhancedWordProfile(word) && word.definitions?.standard && word.definitions.standard.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              +{word.definitions.standard.length} definitions
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default WordCard;
