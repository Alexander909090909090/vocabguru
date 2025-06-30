
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSmartDatabase } from '@/hooks/useSmartDatabase';
import { 
  Brain, 
  Zap, 
  Database, 
  RefreshCw, 
  Target,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export function EnrichmentControls() {
  const { 
    isProcessing, 
    processQueue, 
    enrichWithCalvarn,
    getWordsNeedingEnrichment 
  } = useSmartDatabase();
  
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [loadingWords, setLoadingWords] = useState(false);

  const handleLoadWordsNeedingEnrichment = async () => {
    setLoadingWords(true);
    try {
      const words = await getWordsNeedingEnrichment(20);
      setSelectedWords(words.map(w => w.id));
    } catch (error) {
      console.error('Error loading words:', error);
    } finally {
      setLoadingWords(false);
    }
  };

  const handleCalvarnEnrichment = async () => {
    if (selectedWords.length === 0) {
      await handleLoadWordsNeedingEnrichment();
      return;
    }

    for (const wordId of selectedWords.slice(0, 5)) { // Limit to 5 words at a time
      try {
        await enrichWithCalvarn(wordId);
        // Small delay between enrichments
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Error in Calvarn enrichment:', error);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Advanced Enrichment Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Calvarn AI Enrichment */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <h3 className="font-medium">Calvarn AI Enhancement</h3>
              <Badge variant="secondary" className="text-xs">Premium</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Use your external Calvarn LLM for highest quality enrichment
            </p>
            <Button 
              onClick={handleCalvarnEnrichment}
              disabled={isProcessing || loadingWords}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {isProcessing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              {selectedWords.length === 0 ? 'Load & Enrich with Calvarn' : `Enrich ${Math.min(selectedWords.length, 5)} Words`}
            </Button>
          </div>

          {/* Multi-Source Enrichment */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              <h3 className="font-medium">Multi-Source Enhancement</h3>
              <Badge variant="outline" className="text-xs">Auto</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Aggregate from Wiktionary, WordNet, Datamuse and more
            </p>
            <Button 
              onClick={() => processQueue(10)}
              disabled={isProcessing}
              variant="outline"
              className="w-full"
            >
              {isProcessing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Process Queue (10 items)
            </Button>
          </div>

          {/* Smart Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <h3 className="font-medium">Smart Word Selection</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Automatically identify words needing enrichment
            </p>
            <Button 
              onClick={handleLoadWordsNeedingEnrichment}
              disabled={loadingWords}
              variant="outline"
              className="w-full"
            >
              {loadingWords ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Target className="h-4 w-4 mr-2" />
              )}
              Find Words to Enrich
            </Button>
          </div>

          {/* Status Display */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <h3 className="font-medium">Enrichment Status</h3>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {selectedWords.length > 0 ? (
                <>
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span>{selectedWords.length} words selected for enrichment</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Ready for enrichment</span>
                </>
              )}
            </div>
            {isProcessing && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Processing enrichment...</span>
              </div>
            )}
          </div>
        </div>

        {selectedWords.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Selected Words for Enrichment:</p>
            <p className="text-xs text-muted-foreground">
              {selectedWords.length} words queued. Click "Enrich with Calvarn" to process the first 5 words.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
