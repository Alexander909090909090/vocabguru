
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Star, Plus, Loader2 } from "lucide-react";
import { WordRepositoryEntry } from "@/services/wordRepositoryService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIRecommendationsProps {
  onWordSelect?: (word: WordRepositoryEntry) => void;
  onAddToCollection?: (word: WordRepositoryEntry) => void;
}

export function AIRecommendations({ onWordSelect, onAddToCollection }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<WordRepositoryEntry[]>([]);
  const [trending, setTrending] = useState<WordRepositoryEntry[]>([]);
  const [featured, setFeatured] = useState<WordRepositoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      // Get AI-powered recommendations (simulate with random selection for now)
      const { data: aiWords, error: aiError } = await supabase
        .from('word_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);

      if (aiError) throw aiError;

      // Get trending words (most recently added)
      const { data: trendingWords, error: trendingError } = await supabase
        .from('word_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range(4, 8);

      if (trendingError) throw trendingError;

      // Get featured words (simulate with different query)
      const { data: featuredWords, error: featuredError } = await supabase
        .from('word_profiles')
        .select('*')
        .order('word', { ascending: true })
        .limit(3);

      if (featuredError) throw featuredError;

      // Convert to WordRepositoryEntry format
      const convertToEntry = (profile: any): WordRepositoryEntry => ({
        id: profile.id,
        word: profile.word,
        morpheme_breakdown: profile.morpheme_breakdown || { root: { text: profile.word, meaning: 'Root meaning to be analyzed' } },
        etymology: profile.etymology || {},
        definitions: {
          primary: profile.definitions?.primary || 'Definition to be analyzed',
          standard: profile.definitions?.standard || [],
          extended: profile.definitions?.extended || [],
          contextual: Array.isArray(profile.definitions?.contextual) ? 
            profile.definitions.contextual : 
            (profile.definitions?.contextual ? [profile.definitions.contextual] : []),
          specialized: Array.isArray(profile.definitions?.specialized) ?
            profile.definitions.specialized :
            (profile.definitions?.specialized ? [profile.definitions.specialized] : [])
        },
        word_forms: profile.word_forms || {},
        analysis: profile.analysis || {},
        source_apis: ['word_profiles'],
        frequency_score: Math.floor(Math.random() * 100),
        difficulty_level: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
        created_at: profile.created_at,
        updated_at: profile.updated_at
      });

      setRecommendations((aiWords || []).map(convertToEntry));
      setTrending((trendingWords || []).map(convertToEntry));
      setFeatured((featuredWords || []).map(convertToEntry));

    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const WordCard = ({ word, type }: { word: WordRepositoryEntry; type: 'ai' | 'trending' | 'featured' }) => {
    const getTypeIcon = () => {
      switch (type) {
        case 'ai':
          return <Sparkles className="h-4 w-4 text-primary" />;
        case 'trending':
          return <TrendingUp className="h-4 w-4 text-green-500" />;
        case 'featured':
          return <Star className="h-4 w-4 text-yellow-500" />;
        default:
          return null;
      }
    };

    const getTypeLabel = () => {
      switch (type) {
        case 'ai':
          return 'AI Pick';
        case 'trending':
          return 'Trending';
        case 'featured':
          return 'Featured';
        default:
          return '';
      }
    };

    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer group h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {getTypeIcon()}
              <Badge variant="outline" className="text-xs">
                {getTypeLabel()}
              </Badge>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCollection?.(word);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <div onClick={() => onWordSelect?.(word)}>
            <h3 className="text-lg font-semibold mb-1 capitalize">{word.word}</h3>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {word.definitions.primary}
            </p>
            
            <div className="flex flex-wrap gap-1 mb-2">
              {word.analysis?.parts_of_speech && (
                <Badge variant="secondary" className="text-xs">
                  {word.analysis.parts_of_speech}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {word.difficulty_level}
              </Badge>
            </div>

            {word.etymology?.language_of_origin && (
              <p className="text-xs text-muted-foreground">
                Origin: {word.etymology.language_of_origin}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading recommendations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Recommended for You</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {recommendations.map((word) => (
              <WordCard key={word.id} word={word} type="ai" />
            ))}
          </div>
        </div>
      )}

      {/* Trending Words */}
      {trending.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <h2 className="text-xl font-semibold">Trending Now</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {trending.map((word) => (
              <WordCard key={word.id} word={word} type="trending" />
            ))}
          </div>
        </div>
      )}

      {/* Featured Words */}
      {featured.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-semibold">Featured</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featured.map((word) => (
              <WordCard key={word.id} word={word} type="featured" />
            ))}
          </div>
        </div>
      )}

      {recommendations.length === 0 && trending.length === 0 && featured.length === 0 && (
        <div className="text-center py-8">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">No recommendations yet</h3>
          <p className="text-gray-400">
            Start exploring words to get personalized recommendations!
          </p>
        </div>
      )}
    </div>
  );
}

export default AIRecommendations;
