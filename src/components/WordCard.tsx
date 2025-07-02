
import { Word } from "@/data/words";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface UnifiedWord extends Word {
  source?: 'legacy' | 'database';
  quality_score?: number;
  completeness_score?: number;
  enrichment_status?: string;
}

interface WordCardProps {
  word: UnifiedWord;
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

  // Enhanced display for word profiles
  const morphemeDisplay = word.morphemeBreakdown && (
    word.morphemeBreakdown.prefix || word.morphemeBreakdown.suffix
  );

  const qualityScore = word.quality_score || 0;
  const completenessScore = word.completeness_score || 0;
  
  const getQualityColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getSourceBadgeColor = (source?: string) => {
    if (source === 'database') return "bg-blue-500/90";
    return "bg-gray-500/90";
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
          
          <div className="absolute top-3 right-3 flex gap-2">
            {word.featured && (
              <span className="chip bg-primary/90 text-white backdrop-blur-sm">
                Featured
              </span>
            )}
            {word.source && (
              <span className={`chip ${getSourceBadgeColor(word.source)} text-white backdrop-blur-sm text-xs`}>
                {word.source === 'database' ? 'Enhanced' : 'Legacy'}
              </span>
            )}
          </div>

          {/* Quality indicators for database words */}
          {word.source === 'database' && qualityScore > 0 && (
            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-lg p-2">
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-white mb-1">
                    <span>Quality</span>
                    <span className={getQualityColor(qualityScore)}>{qualityScore}%</span>
                  </div>
                  <Progress value={qualityScore} className="h-1 bg-white/20" />
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-medium">{word.word}</h3>
            {word.enrichment_status === 'completed' && (
              <Badge variant="default" className="bg-green-500 text-xs">
                Enriched
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {word.description}
          </p>
          
          {/* Enhanced morphological breakdown display */}
          {morphemeDisplay && (
            <div className="mt-2 p-2 bg-secondary/30 rounded-lg">
              <div className="text-xs font-medium text-muted-foreground mb-1">
                Morphological Structure
              </div>
              <div className="flex items-center gap-1 text-sm">
                {word.morphemeBreakdown.prefix && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {word.morphemeBreakdown.prefix.text}
                  </span>
                )}
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                  {word.morphemeBreakdown.root.text}
                </span>
                {word.morphemeBreakdown.suffix && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                    {word.morphemeBreakdown.suffix.text}
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-3 flex gap-2">
            <span className="chip bg-secondary text-secondary-foreground">
              {word.languageOrigin}
            </span>
            <span className="chip bg-accent text-accent-foreground">
              {word.partOfSpeech}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default WordCard;
