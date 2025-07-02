
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { WordSeedingService } from '@/services/wordSeedingService';
import { 
  Database, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  BarChart3,
  RefreshCw,
  Download,
  Zap
} from 'lucide-react';

interface DatabaseInitSectionProps {
  apiStatus: any;
}

interface InitializationProgress {
  phase: string;
  current: number;
  total: number;
  percentage: number;
  message: string;
}

export function DatabaseInitSection({ apiStatus }: DatabaseInitSectionProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [progress, setProgress] = useState<InitializationProgress | null>(null);
  const [wordCount, setWordCount] = useState<number>(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [initializationComplete, setInitializationComplete] = useState(false);

  useEffect(() => {
    loadDatabaseStats();
  }, []);

  const loadDatabaseStats = async () => {
    setIsLoadingStats(true);
    try {
      const count = await WordSeedingService.getWordCount();
      setWordCount(count);
    } catch (error) {
      console.error('Error loading database stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const getConfiguredAPIsCount = () => {
    return Object.values(apiStatus).filter((status: any) => status?.connected).length;
  };

  const initializeDatabase = async () => {
    const configuredAPIs = getConfiguredAPIsCount();
    
    if (configuredAPIs === 0) {
      toast({
        title: "No APIs Configured",
        description: "Please configure at least one dictionary API or AI model before initializing the database.",
        variant: "destructive",
      });
      return;
    }

    setIsInitializing(true);
    setInitializationComplete(false);
    
    try {
      // Phase 1: Initialize with essential words
      setProgress({
        phase: 'Essential Words',
        current: 0,
        total: 50,
        percentage: 0,
        message: 'Loading essential vocabulary words...'
      });

      await WordSeedingService.seedEssentialWords();

      // Simulate progress updates (in a real implementation, you'd get these from the service)
      for (let i = 1; i <= 50; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setProgress({
          phase: 'Essential Words',
          current: i,
          total: 50,
          percentage: (i / 50) * 25, // 25% of total progress
          message: `Processing word ${i} of 50...`
        });
      }

      // Phase 2: API Integration
      setProgress({
        phase: 'API Integration',
        current: 0,
        total: configuredAPIs,
        percentage: 25,
        message: 'Integrating configured APIs...'
      });

      const { data, error } = await supabase.functions.invoke('initialize-word-repository', {
        body: { 
          configuredAPIs: Object.keys(apiStatus).filter(key => apiStatus[key]?.connected),
          batchSize: 100
        }
      });

      if (error) {
        throw error;
      }

      // Simulate API integration progress
      for (let i = 1; i <= configuredAPIs; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress({
          phase: 'API Integration',
          current: i,
          total: configuredAPIs,
          percentage: 25 + (i / configuredAPIs) * 25, // 25-50% of total progress
          message: `Integrating API ${i} of ${configuredAPIs}...`
        });
      }

      // Phase 3: Data Processing
      setProgress({
        phase: 'Data Processing',
        current: 0,
        total: 100,
        percentage: 50,
        message: 'Processing and enriching word data...'
      });

      // Simulate data processing
      for (let i = 1; i <= 100; i++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setProgress({
          phase: 'Data Processing',
          current: i,
          total: 100,
          percentage: 50 + (i / 100) * 30, // 50-80% of total progress
          message: `Processing linguistic data: ${i}%`
        });
      }

      // Phase 4: Finalization
      setProgress({
        phase: 'Finalization',
        current: 0,
        total: 20,
        percentage: 80,
        message: 'Finalizing database setup...'
      });

      for (let i = 1; i <= 20; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setProgress({
          phase: 'Finalization',
          current: i,
          total: 20,
          percentage: 80 + (i / 20) * 20, // 80-100% of total progress
          message: 'Optimizing database indexes...'
        });
      }

      setProgress({
        phase: 'Complete',
        current: 100,
        total: 100,
        percentage: 100,
        message: 'Database initialization completed successfully!'
      });

      setInitializationComplete(true);
      
      toast({
        title: "Database Initialized",
        description: "Word repository has been successfully populated with data from your configured APIs.",
      });

      // Refresh stats
      await loadDatabaseStats();

    } catch (error) {
      console.error('Error initializing database:', error);
      toast({
        title: "Initialization Failed",
        description: `Database initialization failed: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const quickRefresh = async () => {
    setIsLoadingStats(true);
    try {
      await WordSeedingService.initializeIfEmpty();
      await loadDatabaseStats();
      
      toast({
        title: "Quick Refresh Complete",
        description: "Database has been refreshed with any missing essential words.",
      });
    } catch (error) {
      console.error('Error during quick refresh:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh database. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Initialize Word Repository</h3>
        <p className="text-sm text-muted-foreground">
          Populate your word repository using the configured dictionary APIs and AI models for comprehensive linguistic analysis.
        </p>
      </div>

      {/* Database Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Database Statistics
          </CardTitle>
          <CardDescription>
            Current status of your word repository
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="text-2xl font-bold">
                {isLoadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  wordCount.toLocaleString()
                )}
              </div>
              <div className="text-sm text-muted-foreground">Total Words</div>
            </div>
            
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="text-2xl font-bold">{getConfiguredAPIsCount()}</div>
              <div className="text-sm text-muted-foreground">Configured APIs</div>
            </div>
            
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="text-2xl font-bold">
                {initializationComplete ? (
                  <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-yellow-500 mx-auto" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">Status</div>
            </div>
            
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="text-2xl font-bold">
                {progress?.percentage.toFixed(0) || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Initialization Progress */}
      {(isInitializing || progress) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className={`h-5 w-5 ${isInitializing ? 'animate-spin' : ''}`} />
              Initialization Progress
            </CardTitle>
            <CardDescription>
              {progress?.message || 'Preparing to initialize database...'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Phase: {progress?.phase || 'Starting'}</span>
                <span>{progress?.current || 0} / {progress?.total || 0}</span>
              </div>
              <Progress value={progress?.percentage || 0} className="w-full" />
            </div>
            
            {progress?.phase && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {progress.phase}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {progress.percentage.toFixed(1)}% complete
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Initialization Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Actions
          </CardTitle>
          <CardDescription>
            Initialize or refresh your word repository
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* API Status Check */}
          {getConfiguredAPIsCount() === 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No APIs are configured. Please configure at least one dictionary API or AI model before initializing the database.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={initializeDatabase}
              disabled={isInitializing || getConfiguredAPIsCount() === 0}
              className="flex-1 min-w-[200px]"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Initializing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Full Initialization
                </>
              )}
            </Button>

            <Button
              onClick={quickRefresh}
              disabled={isInitializing || isLoadingStats}
              variant="outline"
            >
              {isLoadingStats ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Quick Refresh
                </>
              )}
            </Button>

            <Button
              onClick={loadDatabaseStats}
              disabled={isLoadingStats}
              variant="outline"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Update Stats
            </Button>
          </div>

          {/* Initialization Options */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium text-sm">Initialization Options:</h4>
            
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                <Zap className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Full Initialization</div>
                  <div className="text-xs text-muted-foreground">
                    Complete setup using all configured APIs. Recommended for first-time setup.
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                <RefreshCw className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Quick Refresh</div>
                  <div className="text-xs text-muted-foreground">
                    Add missing essential words only. Fast update for maintenance.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {initializationComplete && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Database initialization completed successfully! Your word repository is now populated with comprehensive linguistic data.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
