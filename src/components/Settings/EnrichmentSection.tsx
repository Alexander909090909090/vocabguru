
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Zap, 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause,
  BarChart3,
  Settings,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EnrichmentStats {
  totalWords: number;
  enrichedWords: number;
  pendingWords: number;
  averageQuality: number;
  completionRate: number;
}

interface EnrichmentProgress {
  isRunning: boolean;
  processed: number;
  total: number;
  currentWord?: string;
  estimatedTime?: number;
}

export function EnrichmentSection() {
  const [stats, setStats] = useState<EnrichmentStats>({
    totalWords: 0,
    enrichedWords: 0,
    pendingWords: 0,
    averageQuality: 0,
    completionRate: 0
  });
  const [progress, setProgress] = useState<EnrichmentProgress>({
    isRunning: false,
    processed: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [batchSize, setBatchSize] = useState(10);
  const [qualityThreshold, setQualityThreshold] = useState(70);

  useEffect(() => {
    loadEnrichmentStats();
    const interval = setInterval(loadEnrichmentStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadEnrichmentStats = async () => {
    try {
      const { data: wordProfiles, error } = await supabase
        .from('word_profiles')
        .select('quality_score, completeness_score, enrichment_status');

      if (error) throw error;

      const totalWords = wordProfiles?.length || 0;
      const enrichedWords = wordProfiles?.filter(w => 
        w.quality_score && w.quality_score >= qualityThreshold
      ).length || 0;
      const pendingWords = wordProfiles?.filter(w => 
        !w.quality_score || w.quality_score < qualityThreshold
      ).length || 0;
      
      const averageQuality = totalWords > 0 
        ? wordProfiles.reduce((sum, w) => sum + (w.quality_score || 0), 0) / totalWords
        : 0;

      setStats({
        totalWords,
        enrichedWords,
        pendingWords,
        averageQuality: Math.round(averageQuality),
        completionRate: totalWords > 0 ? (enrichedWords / totalWords) * 100 : 0
      });
    } catch (error) {
      console.error('Error loading enrichment stats:', error);
    }
  };

  const startBatchEnrichment = async () => {
    try {
      setIsLoading(true);
      setProgress({ isRunning: true, processed: 0, total: batchSize });

      const { data, error } = await supabase.functions.invoke('start-batch-enrichment', {
        body: { batchSize, qualityThreshold }
      });

      if (error) throw error;

      toast.success(data.message || 'Batch enrichment started successfully');
      await loadEnrichmentStats();
    } catch (error) {
      console.error('Error starting batch enrichment:', error);
      toast.error('Failed to start batch enrichment');
    } finally {
      setIsLoading(false);
      setProgress(prev => ({ ...prev, isRunning: false }));
    }
  };

  const analyzeWordQuality = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.functions.invoke('analyze-word-quality');

      if (error) throw error;

      toast.success(data.message || 'Word quality analysis completed');
      await loadEnrichmentStats();
    } catch (error) {
      console.error('Error analyzing word quality:', error);
      toast.error('Failed to analyze word quality');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.totalWords}</p>
                <p className="text-sm text-muted-foreground">Total Words</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.enrichedWords}</p>
                <p className="text-sm text-muted-foreground">Enriched</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pendingWords}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.averageQuality}%</p>
                <p className="text-sm text-muted-foreground">Avg Quality</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            enrichment Progress
          </CardTitle>
          <CardDescription>
            Overall completion status of word enrichment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Completion Rate</span>
                <span>{Math.round(stats.completionRate)}%</span>
              </div>
              <Progress value={stats.completionRate} className="h-2" />
            </div>
            
            {progress.isRunning && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Current Batch</span>
                  <span>{progress.processed}/{progress.total}</span>
                </div>
                <Progress value={(progress.processed / progress.total) * 100} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Controls */}
      <Tabs defaultValue="batch" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="batch">Batch Processing</TabsTrigger>
          <TabsTrigger value="quality">Quality Analysis</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Batch Enrichment
              </CardTitle>
              <CardDescription>
                Process multiple words simultaneously for comprehensive linguistic analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="batchSize">Batch Size</Label>
                  <Input
                    id="batchSize"
                    type="number"
                    min="1"
                    max="50"
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                    placeholder="Number of words to process"
                  />
                </div>
                <div>
                  <Label htmlFor="qualityThreshold">Quality Threshold (%)</Label>
                  <Input
                    id="qualityThreshold"
                    type="number"
                    min="0"
                    max="100"
                    value={qualityThreshold}
                    onChange={(e) => setQualityThreshold(Number(e.target.value))}
                    placeholder="Minimum quality score"
                  />
                </div>
              </div>

              <Button
                onClick={startBatchEnrichment}
                disabled={isLoading || progress.isRunning}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : progress.isRunning ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Processing Batch...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Batch Enrichment
                  </>
                )}
              </Button>

              {stats.pendingWords > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {stats.pendingWords} words are pending enrichment. 
                    Running batch enrichment will improve their linguistic analysis.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Quality Analysis
              </CardTitle>
              <CardDescription>
                Analyze and score the quality of word profiles based on linguistic completeness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Analysis Criteria</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Morphological breakdown completeness</li>
                    <li>• Etymology depth and accuracy</li>
                    <li>• Definition richness and variety</li>
                    <li>• Usage examples and collocations</li>
                    <li>• Phonetic and semantic analysis</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Quality Metrics</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Completeness Score (0-100%)</li>
                    <li>• Accuracy Rating</li>
                    <li>• Source Reliability</li>
                    <li>• Linguistic Depth</li>
                    <li>• Usage Authenticity</li>
                  </ul>
                </div>
              </div>

              <Button
                onClick={analyzeWordQuality}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Analyze Word Quality
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Enrichment Configuration
              </CardTitle>
              <CardDescription>
                Configure deep linguistic analysis parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Deep Linguistic Analysis Features:</strong>
                  <br />• Morphological decomposition with etymological origins
                  <br />• Phonological analysis with IPA transcription
                  <br />• Semantic field mapping and conceptual domains
                  <br />• Historical etymology with borrowing paths
                  <br />• Syntactic behavior and collocation patterns
                  <br />• Register analysis (formal, informal, technical, archaic)
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Morphological Analysis</h4>
                    <Badge variant="outline">Prefix Detection</Badge>
                    <Badge variant="outline" className="ml-2">Root Analysis</Badge>
                    <Badge variant="outline" className="ml-2">Suffix Mapping</Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Semantic Enhancement</h4>
                    <Badge variant="outline">Synonyms/Antonyms</Badge>
                    <Badge variant="outline" className="ml-2">Collocations</Badge>
                    <Badge variant="outline" className="ml-2">Usage Patterns</Badge>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
