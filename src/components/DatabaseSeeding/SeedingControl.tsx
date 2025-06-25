
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EnhancedDatabaseSeeding } from '@/services/enhancedDatabaseSeeding';
import { Loader2, Database, Zap, Rocket, Target } from 'lucide-react';
import { toast } from 'sonner';

export function SeedingControl() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [wordCount, setWordCount] = useState<number>(0);
  const [seedingStats, setSeedingStats] = useState<{
    essential: { success: number; failed: number };
    advanced: { success: number; failed: number };
    total: number;
  } | null>(null);

  const fetchWordCount = async () => {
    try {
      const count = await EnhancedDatabaseSeeding.getComprehensiveWordCount();
      setWordCount(count);
    } catch (error) {
      console.error('Error fetching word count:', error);
    }
  };

  const handleQuickSeed = async () => {
    setIsSeeding(true);
    setProgress(0);
    
    try {
      toast.info('Starting quick seed (50 words)...');
      
      const results = await EnhancedDatabaseSeeding.quickSeed();
      
      setSeedingStats({
        essential: results,
        advanced: { success: 0, failed: 0 },
        total: results.success
      });
      
      toast.success(`Quick seed complete: ${results.success} words added`);
      await fetchWordCount();
    } catch (error) {
      console.error('Quick seed error:', error);
      toast.error('Quick seed failed');
    } finally {
      setIsSeeding(false);
      setProgress(100);
    }
  };

  const handleEssentialSeed = async () => {
    setIsSeeding(true);
    setProgress(0);
    
    try {
      toast.info('Starting essential seed (300 words)...');
      
      const results = await EnhancedDatabaseSeeding.seedEssentialDatabase();
      
      setSeedingStats({
        essential: results,
        advanced: { success: 0, failed: 0 },
        total: results.success
      });
      
      toast.success(`Essential seed complete: ${results.success} words added`);
      await fetchWordCount();
    } catch (error) {
      console.error('Essential seed error:', error);
      toast.error('Essential seed failed');
    } finally {
      setIsSeeding(false);
      setProgress(100);
    }
  };

  const handleProgressiveSeed = async () => {
    setIsSeeding(true);
    setProgress(0);
    
    try {
      toast.info('Starting progressive seed (450+ words)...');
      
      const results = await EnhancedDatabaseSeeding.seedProgressively();
      
      setSeedingStats(results);
      
      toast.success(`Progressive seed complete: ${results.total} total words added`);
      await fetchWordCount();
    } catch (error) {
      console.error('Progressive seed error:', error);
      toast.error('Progressive seed failed');
    } finally {
      setIsSeeding(false);
      setProgress(100);
    }
  };

  const handleAutoInitialize = async () => {
    setIsSeeding(true);
    
    try {
      toast.info('Auto-initializing database...');
      
      await EnhancedDatabaseSeeding.autoInitialize();
      
      toast.success('Database auto-initialization complete');
      await fetchWordCount();
    } catch (error) {
      console.error('Auto-initialize error:', error);
      toast.error('Auto-initialization failed');
    } finally {
      setIsSeeding(false);
    }
  };

  // Fetch initial count
  useState(() => {
    fetchWordCount();
  });

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Seeding Control
          <Badge variant={wordCount > 0 ? "default" : "secondary"}>
            {wordCount} words
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-secondary rounded-lg">
            <div className="text-2xl font-bold">{wordCount}</div>
            <div className="text-sm text-muted-foreground">Total Words</div>
          </div>
          <div className="text-center p-4 bg-secondary rounded-lg">
            <div className="text-2xl font-bold">
              {wordCount < 50 ? 'Empty' : wordCount < 300 ? 'Basic' : 'Full'}
            </div>
            <div className="text-sm text-muted-foreground">Database State</div>
          </div>
        </div>

        {/* Progress Bar */}
        {isSeeding && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Seeding Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Seeding Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handleAutoInitialize}
            disabled={isSeeding}
            className="flex items-center gap-2"
            variant="outline"
          >
            {isSeeding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Target className="h-4 w-4" />
            )}
            Auto Initialize
          </Button>

          <Button
            onClick={handleQuickSeed}
            disabled={isSeeding}
            className="flex items-center gap-2"
            variant="outline"
          >
            {isSeeding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Quick Seed (50)
          </Button>

          <Button
            onClick={handleEssentialSeed}
            disabled={isSeeding}
            className="flex items-center gap-2"
          >
            {isSeeding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            Essential (300)
          </Button>

          <Button
            onClick={handleProgressiveSeed}
            disabled={isSeeding}
            className="flex items-center gap-2"
            variant="default"
          >
            {isSeeding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="h-4 w-4" />
            )}
            Progressive (450+)
          </Button>
        </div>

        {/* Seeding Results */}
        {seedingStats && (
          <div className="space-y-3">
            <h4 className="font-medium">Last Seeding Results</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {seedingStats.essential.success}
                </div>
                <div className="text-xs text-green-600">Essential Success</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {seedingStats.advanced.success}
                </div>
                <div className="text-xs text-blue-600">Advanced Success</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {seedingStats.total}
                </div>
                <div className="text-xs text-purple-600">Total Added</div>
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <Button
          onClick={fetchWordCount}
          variant="ghost"
          className="w-full"
          disabled={isSeeding}
        >
          Refresh Count
        </Button>
      </CardContent>
    </Card>
  );
}
