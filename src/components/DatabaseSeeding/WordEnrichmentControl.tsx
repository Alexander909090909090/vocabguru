
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  WordEnrichmentService, 
  EnrichmentOptions, 
  BatchEnrichmentProgress 
} from '@/services/wordEnrichmentService';
import { 
  Loader2, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  BarChart3, 
  Wand2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export function WordEnrichmentControl() {
  const [isEnriching, setIsEnriching] = useState(false);
  const [progress, setProgress] = useState<BatchEnrichmentProgress | null>(null);
  const [enrichmentStats, setEnrichmentStats] = useState<{
    totalWords: number;
    lowQualityWords: number;
    averageQuality: number;
  } | null>(null);
  
  const [options, setOptions] = useState<EnrichmentOptions>({
    cleanData: true,
    fillMissingFields: true,
    enhanceDefinitions: true,
    improveEtymology: true,
    addUsageExamples: true,
    generateSynonyms: true
  });

  const fetchStats = async () => {
    try {
      const wordsNeedingEnrichment = await WordEnrichmentService.getWordsNeedingEnrichment(1000);
      const totalWords = wordsNeedingEnrichment.length;
      
      if (totalWords === 0) {
        setEnrichmentStats({
          totalWords: 0,
          lowQualityWords: 0,
          averageQuality: 100
        });
        return;
      }
      
      const qualityScores = wordsNeedingEnrichment.map(word => 
        WordEnrichmentService.assessWordQuality(word)
      );
      
      const averageQuality = Math.round(
        qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
      );
      
      const lowQualityWords = qualityScores.filter(score => score < 50).length;
      
      setEnrichmentStats({
        totalWords,
        lowQualityWords,
        averageQuality
      });
    } catch (error) {
      console.error('Error fetching enrichment stats:', error);
    }
  };

  const handleQuickEnrich = async () => {
    setIsEnriching(true);
    setProgress(null);
    
    try {
      toast.info('Starting quick enrichment (20 words)...');
      
      const wordsToEnrich = await WordEnrichmentService.getWordsNeedingEnrichment(20);
      
      if (wordsToEnrich.length === 0) {
        toast.success('No words need enrichment!');
        setIsEnriching(false);
        return;
      }
      
      const wordIds = wordsToEnrich.map(word => word.id);
      
      const results = await WordEnrichmentService.enrichWordsBatch(
        wordIds,
        options,
        (progressUpdate) => {
          setProgress(progressUpdate);
        }
      );
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      toast.success(`Quick enrichment complete: ${successCount} successful, ${failureCount} failed`);
      await fetchStats();
    } catch (error) {
      console.error('Quick enrichment error:', error);
      toast.error('Quick enrichment failed');
    } finally {
      setIsEnriching(false);
      setProgress(null);
    }
  };

  const handleBatchEnrich = async () => {
    setIsEnriching(true);
    setProgress(null);
    
    try {
      toast.info('Starting batch enrichment (all words)...');
      
      const wordsToEnrich = await WordEnrichmentService.getWordsNeedingEnrichment(1000);
      
      if (wordsToEnrich.length === 0) {
        toast.success('No words need enrichment!');
        setIsEnriching(false);
        return;
      }
      
      const wordIds = wordsToEnrich.map(word => word.id);
      
      const results = await WordEnrichmentService.enrichWordsBatch(
        wordIds,
        options,
        (progressUpdate) => {
          setProgress(progressUpdate);
        }
      );
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      toast.success(`Batch enrichment complete: ${successCount} successful, ${failureCount} failed`);
      await fetchStats();
    } catch (error) {
      console.error('Batch enrichment error:', error);
      toast.error('Batch enrichment failed');
    } finally {
      setIsEnriching(false);
      setProgress(null);
    }
  };

  const handleAutoInitialize = async () => {
    setIsEnriching(true);
    
    try {
      toast.info('Auto-initializing word enrichment...');
      await WordEnrichmentService.initializeAutoEnrichment();
      await fetchStats();
    } catch (error) {
      console.error('Auto-initialization error:', error);
      toast.error('Auto-initialization failed');
    } finally {
      setIsEnriching(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getQualityColor = (quality: number) => {
    if (quality >= 80) return 'text-green-600';
    if (quality >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityBadgeVariant = (quality: number) => {
    if (quality >= 80) return 'default';
    if (quality >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          LLM Word Enrichment
          {enrichmentStats && (
            <Badge variant={getQualityBadgeVariant(enrichmentStats.averageQuality)}>
              Avg Quality: {enrichmentStats.averageQuality}%
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        {enrichmentStats && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">{enrichmentStats.totalWords}</div>
              <div className="text-sm text-muted-foreground">Words Need Enrichment</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {enrichmentStats.lowQualityWords}
              </div>
              <div className="text-sm text-muted-foreground">Low Quality (&lt;50%)</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className={`text-2xl font-bold ${getQualityColor(enrichmentStats.averageQuality)}`}>
                {enrichmentStats.averageQuality}%
              </div>
              <div className="text-sm text-muted-foreground">Average Quality</div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing: {progress.currentWord || 'Preparing...'}</span>
              <span>{progress.processed}/{progress.total}</span>
            </div>
            <Progress 
              value={(progress.processed / progress.total) * 100} 
              className="w-full" 
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>✅ {progress.successful} successful</span>
              <span>❌ {progress.failed} failed</span>
            </div>
          </div>
        )}

        {/* Enrichment Options */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Enrichment Options
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="cleanData"
                checked={options.cleanData}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, cleanData: checked }))
                }
                disabled={isEnriching}
              />
              <Label htmlFor="cleanData" className="text-sm">Clean Data</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="fillMissingFields"
                checked={options.fillMissingFields}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, fillMissingFields: checked }))
                }
                disabled={isEnriching}
              />
              <Label htmlFor="fillMissingFields" className="text-sm">Fill Missing Fields</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="enhanceDefinitions"
                checked={options.enhanceDefinitions}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, enhanceDefinitions: checked }))
                }
                disabled={isEnriching}
              />
              <Label htmlFor="enhanceDefinitions" className="text-sm">Enhance Definitions</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="improveEtymology"
                checked={options.improveEtymology}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, improveEtymology: checked }))
                }
                disabled={isEnriching}
              />
              <Label htmlFor="improveEtymology" className="text-sm">Improve Etymology</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="addUsageExamples"
                checked={options.addUsageExamples}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, addUsageExamples: checked }))
                }
                disabled={isEnriching}
              />
              <Label htmlFor="addUsageExamples" className="text-sm">Add Usage Examples</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="generateSynonyms"
                checked={options.generateSynonyms}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, generateSynonyms: checked }))
                }
                disabled={isEnriching}
              />
              <Label htmlFor="generateSynonyms" className="text-sm">Generate Synonyms</Label>
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={handleAutoInitialize}
            disabled={isEnriching}
            className="flex items-center gap-2"
            variant="outline"
          >
            {isEnriching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Auto Initialize
          </Button>

          <Button
            onClick={handleQuickEnrich}
            disabled={isEnriching}
            className="flex items-center gap-2"
          >
            {isEnriching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Quick Enrich (20)
          </Button>

          <Button
            onClick={handleBatchEnrich}
            disabled={isEnriching}
            className="flex items-center gap-2"
            variant="default"
          >
            {isEnriching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4" />
            )}
            Batch Enrich (All)
          </Button>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                LLM-Powered Enrichment
              </p>
              <p className="text-blue-700 dark:text-blue-200 mt-1">
                Uses open-source AI to clean, validate, and enhance word profiles with missing 
                etymology, morphemes, definitions, synonyms, and usage examples.
              </p>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <Button
          onClick={fetchStats}
          variant="ghost"
          className="w-full"
          disabled={isEnriching}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Stats
        </Button>
      </CardContent>
    </Card>
  );
}
