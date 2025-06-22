
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WordSeedingService } from '@/services/wordSeedingService';
import { supabase } from '@/integrations/supabase/client';

export function DatabaseMonitor() {
  const [wordCount, setWordCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [recentWords, setRecentWords] = useState<string[]>([]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Get word count
      const count = await WordSeedingService.getWordCount();
      setWordCount(count);

      // Get recent words
      const { data: recentData } = await supabase
        .from('word_profiles')
        .select('word')
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentData) {
        setRecentWords(recentData.map(item => item.word));
      }

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error fetching database stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialize = async () => {
    try {
      await WordSeedingService.initializeIfEmpty();
      await fetchStats();
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Database Status
          <Badge variant={wordCount > 0 ? "default" : "secondary"}>
            {wordCount > 0 ? "Active" : "Empty"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Words:</span>
            <span className="font-medium">{isLoading ? "..." : wordCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Last Updated:</span>
            <span className="text-sm">{lastUpdated || "Never"}</span>
          </div>
        </div>

        {recentWords.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Recent Words:</span>
            <div className="flex flex-wrap gap-1">
              {recentWords.slice(0, 5).map(word => (
                <Badge key={word} variant="outline" className="text-xs">
                  {word}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={fetchStats}
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
          {wordCount === 0 && (
            <Button
              onClick={handleInitialize}
              size="sm"
            >
              Initialize
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
