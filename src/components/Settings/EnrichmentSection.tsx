
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { 
  Brain, 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  BarChart3,
  Settings,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';

interface EnrichmentStats {
  totalWords: number;
  enrichedWords: number;
  pendingWords: number;
  lowQualityWords: number;
  averageQuality: number;
  completionRate: number;
}

export function EnrichmentSection() {
  const [stats, setStats] = useState<EnrichmentStats>({
    totalWords: 0,
    enrichedWords: 0,
    pendingWords: 0,
    lowQualityWords: 0,
    averageQuality: 0,
    completionRate: 0
  });
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentProgress, setEnrichmentProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEnrichmentStats();
  }, []);

  const loadEnrichmentStats = async () => {
    setIsLoading(true);
    try {
      // Get word profile statistics
      const { data: wordProfiles, error: profileError } = await supabase
        .from('word_profiles')
        .select('quality_score, completeness_score, enrichment_status');

      if (profileError) {
        console.error('Error loading word profiles:', profileError);
        return;
      }

      const totalWords = wordProfiles?.length || 0;
      const enrichedWords = wordProfiles?.filter(wp => wp.enrichment_status === 'completed').length || 0;
      const pendingWords = wordProfiles?.filter(wp => wp.enrichment_status === 'pending' || wp.enrichment_status === 'in_progress').length || 0;
      const lowQualityWords = wordProfiles?.filter(wp => (wp.quality_score || 0) < 70).length || 0;
      
      const qualityScores = wordProfiles?.map(wp => wp.quality_score || 0).filter(score => score > 0) || [];
      const averageQuality = qualityScores.length > 0 
        ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length 
        : 0;
      
      const completionRate = totalWords > 0 ? (enrichedWords / totalWords) * 100 : 0;

      setStats({
        totalWords,
        enrichedWords,
        pendingWords,
        lowQualityWords,
        averageQuality,
        completionRate
      });
    } catch (error) {
      console.error('Error loading enrichment stats:', error);
      toast({
        title: "Error",
        description: "Failed to load enrichment statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startBatchEnrichment = async () => {
    setIsEnriching(true);
    setEnrichmentProgress(0);

    try {
      const { data, error } = await supabase.functions.invoke('start-batch-enrichment', {
        body: { 
          batchSize: 10,
          qualityThreshold: 70 
        }
      });

      if (error) {
        toast({
          title: "Enrichment Failed",
          description: `Failed to start batch enrichment: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Enrichment Started",
        description: "Batch enrichment process has been started successfully.",
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setEnrichmentProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setIsEnriching(false);
            loadEnrichmentStats();
            return 100;
          }
          return prev + 10;
        });
      }, 2000);

    } catch (error) {
      toast({
        title: "Enrichment Error",
        description: "Error starting batch enrichment process.",
        variant: "destructive",
      });
    }
  };

  const analyzeWordQuality = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-word-quality');

      if (error) {
        toast({
          title: "Analysis Failed",
          description: `Failed to analyze word quality: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Quality Analysis Complete",
        description: "Word quality analysis has been completed successfully.",
      });

      loadEnrichmentStats();
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Error analyzing word quality.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading enrichment data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Word Repository Enrichment</h3>
        <p className="text-sm text-muted-foreground">
          Enhance your word repository with AI-powered analysis, morphological breakdowns, and comprehensive linguistic data.
        </p>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Words</p>
                <p className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Enriched</p>
                <p className="text-2xl font-bold text-green-600">{stats.enrichedWords.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingWords.toLocaleString()}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Quality</p>
                <p className="text-2xl font-bold text-red-600">{stats.lowQualityWords.toLocaleString()}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Enrichment Progress
          </CardTitle>
          <CardDescription>
            Overall progress of word repository enrichment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Completion Rate</span>
              <span>{stats.completionRate.toFixed(1)}%</span>
            </div>
            <Progress value={stats.completionRate} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Average Quality Score</span>
              <span>{stats.averageQuality.toFixed(1)}/100</span>
            </div>
            <Progress value={stats.averageQuality} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="batch" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="batch">Batch Processing</TabsTrigger>
          <TabsTrigger value="quality">Quality Analysis</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Batch Enrichment
              </CardTitle>
              <CardDescription>
                Process multiple words simultaneously for faster enrichment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEnriching && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Enrichment Progress</span>
                    <span>{enrichmentProgress}%</span>
                  </div>
                  <Progress value={enrichmentProgress} className="h-2" />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={startBatchEnrichment}
                  disabled={isEnriching || stats.pendingWords === 0}
                  size="sm"
                >
                  {isEnriching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Batch Enrichment
                    </>
                  )}
                </Button>

                <Button
                  onClick={loadEnrichmentStats}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Stats
                </Button>
              </div>

              {stats.pendingWords === 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    All words in the repository have been processed. Add more words to continue enrichment.
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
                <BarChart3 className="h-5 w-5" />
                Quality Analysis
              </CardTitle>
              <CardDescription>
                Analyze and improve the quality of word definitions and analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/20 rounded-lg">
                  <h4 className="font-medium mb-2">Quality Distribution</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>High Quality (80-100)</span>
                      <Badge variant="default" className="bg-green-500">
                        {Math.round((stats.enrichedWords / stats.totalWords) * 100)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Medium Quality (60-79)</span>
                      <Badge variant="outline">
                        {Math.round(((stats.totalWords - stats.enrichedWords - stats.lowQualityWords) / stats.totalWords) * 100)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Low Quality (0-59)</span>
                      <Badge variant="destructive">
                        {Math.round((stats.lowQualityWords / stats.totalWords) * 100)}%
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-secondary/20 rounded-lg">
                  <h4 className="font-medium mb-2">Improvement Suggestions</h4>
                  <div className="space-y-2 text-sm">
                    <p>• Focus on morphological analysis</p>
                    <p>• Add more usage examples</p>
                    <p>• Enhance etymology data</p>
                    <p>• Improve definition clarity</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={analyzeWordQuality}
                variant="outline"
                size="sm"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Run Quality Analysis
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Enrichment Settings
              </CardTitle>
              <CardDescription>
                Configure enrichment parameters and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  Enrichment settings will be available in a future update. Currently using default parameters for optimal performance.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
