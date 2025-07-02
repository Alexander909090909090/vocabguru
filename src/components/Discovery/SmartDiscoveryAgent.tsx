
import React, { useState } from 'react';
import { Search, Brain, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WordRepositoryEntry } from '@/services/wordRepositoryService';

interface SmartDiscoveryAgentProps {
  onWordsDiscovered: (words: WordRepositoryEntry[]) => void;
}

export const SmartDiscoveryAgent: React.FC<SmartDiscoveryAgentProps> = ({ onWordsDiscovered }) => {
  const [query, setQuery] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [lastDiscovery, setLastDiscovery] = useState<{
    query: string;
    wordsFound: number;
    timestamp: Date;
  } | null>(null);

  const handleSmartDiscovery = async () => {
    if (!query.trim()) {
      toast({
        title: "Enter a search term",
        description: "Please enter a word or topic to discover related vocabulary",
        variant: "destructive"
      });
      return;
    }

    setIsDiscovering(true);

    try {
      console.log(`Starting smart discovery for: "${query}"`);

      const { data, error } = await supabase.functions.invoke('ai-word-discovery', {
        body: { 
          query: query.trim(), 
          context: 'vocabulary_learning',
          limit: 10 
        }
      });

      if (error) {
        throw error;
      }

      if (data.success && data.discoveredWords.length > 0) {
        // Convert to WordRepositoryEntry format
        const discoveredWords: WordRepositoryEntry[] = data.discoveredWords.map((word: any) => ({
          id: word.id,
          word: word.word,
          morpheme_breakdown: word.morpheme_breakdown || {},
          etymology: word.etymology || {},
          definitions: word.definitions || {},
          word_forms: word.word_forms || {},
          analysis: word.analysis || {},
          source_apis: word.data_sources || ['ai-discovery'],
          frequency_score: 60,
          difficulty_level: 'intermediate',
          created_at: word.created_at,
          updated_at: word.updated_at
        }));

        onWordsDiscovered(discoveredWords);
        
        setLastDiscovery({
          query,
          wordsFound: data.discoveredWords.length,
          timestamp: new Date()
        });

        toast({
          title: "Words Discovered!",
          description: `Found and added ${data.discoveredWords.length} new words related to "${query}"`,
        });

        console.log(`Smart discovery completed: ${data.discoveredWords.length} words found`);
      } else {
        toast({
          title: "No New Words Found",
          description: "The AI couldn't find new words for this search. Try a different term or topic.",
        });
      }
    } catch (error) {
      console.error('Smart discovery error:', error);
      toast({
        title: "Discovery Failed",
        description: "Failed to discover new words. Please check your API configuration.",
        variant: "destructive"
      });
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isDiscovering) {
      handleSmartDiscovery();
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Smart Word Discovery
          <Badge variant="secondary" className="text-xs">AI-Powered</Badge>
        </CardTitle>
        <CardDescription>
          Let Calvarn discover new vocabulary words based on your interests and learning goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter a topic, theme, or word to discover related vocabulary..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
              disabled={isDiscovering}
            />
          </div>
          <Button 
            onClick={handleSmartDiscovery}
            disabled={!query.trim() || isDiscovering}
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/80 hover:to-purple-600/80"
          >
            {isDiscovering ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Discovering...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Discover Words
              </>
            )}
          </Button>
        </div>

        {lastDiscovery && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>
                Last discovery: Found <strong>{lastDiscovery.wordsFound}</strong> words for "{lastDiscovery.query}"
              </span>
            </div>
            <div className="text-xs mt-1">
              {lastDiscovery.timestamp.toLocaleString()}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setQuery('science')}
            disabled={isDiscovering}
          >
            Science
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setQuery('literature')}
            disabled={isDiscovering}
          >
            Literature
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setQuery('business')}
            disabled={isDiscovering}
          >
            Business
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setQuery('technology')}
            disabled={isDiscovering}
          >
            Technology
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
