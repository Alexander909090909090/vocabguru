
import { EnhancedWordProfile } from "@/types/enhancedWordProfile";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";

interface EnhancedWordCardProps {
  wordProfile: EnhancedWordProfile;
  onAddToCollection?: (word: EnhancedWordProfile) => void;
  showAddButton?: boolean;
}

export function EnhancedWordCard({ 
  wordProfile, 
  onAddToCollection, 
  showAddButton = false 
}: EnhancedWordCardProps) {
  
  const getGradient = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue1 = hash % 360;
    const hue2 = (hash * 7) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 80%, 60%), hsl(${hue2}, 80%, 50%))`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <div 
        className="h-32 relative"
        style={{ background: getGradient(wordProfile.id) }}
      >
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <BookOpen className="h-8 w-8 text-white/80" />
        </div>
        {wordProfile.featured && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-white/20 text-white border-none">
              Featured
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold">{wordProfile.word}</CardTitle>
            {wordProfile.pronunciation && (
              <p className="text-sm text-muted-foreground mt-1">
                {wordProfile.pronunciation}
              </p>
            )}
          </div>
          {showAddButton && onAddToCollection && (
            <Button
              size="sm"
              onClick={() => onAddToCollection(wordProfile)}
              className="ml-2"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Morpheme Preview */}
          <div className="text-sm">
            <p className="font-medium text-muted-foreground mb-1">Morpheme Breakdown:</p>
            <div className="flex flex-wrap gap-1">
              {wordProfile.morpheme_breakdown.prefix && (
                <Badge variant="outline" className="text-xs">
                  {wordProfile.morpheme_breakdown.prefix.text}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs bg-primary/10">
                {wordProfile.morpheme_breakdown.root.text}
              </Badge>
              {wordProfile.morpheme_breakdown.suffix && (
                <Badge variant="outline" className="text-xs">
                  {wordProfile.morpheme_breakdown.suffix.text}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Primary Definition */}
          <div className="text-sm">
            <p className="font-medium text-muted-foreground mb-1">Definition:</p>
            <p className="text-sm line-clamp-2">
              {wordProfile.definitions.primary || wordProfile.description}
            </p>
          </div>
          
          {/* Etymology Preview */}
          {wordProfile.etymology.language_of_origin && (
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs">
                {wordProfile.etymology.language_of_origin}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {wordProfile.partOfSpeech}
              </Badge>
            </div>
          )}
          
          {/* View Details Link */}
          <Link 
            to={`/word/${wordProfile.id}`}
            className="block"
          >
            <Button variant="outline" size="sm" className="w-full mt-3">
              View Full Analysis
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default EnhancedWordCard;
