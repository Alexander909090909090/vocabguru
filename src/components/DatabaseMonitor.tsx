
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DictionaryApiService } from '@/services/dictionaryApiService';
import { supabase } from '@/integrations/supabase/client';
import { Database, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export function DatabaseMonitor() {
  const [wordCount, setWordCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [recentWords, setRecentWords] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('testing');

  const fetchStats = async () => {
    setIsLoading(true);
    setConnectionStatus('testing');
    
    try {
      // Test database connection
      const isConnected = await DictionaryApiService.testDatabaseConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');

      if (isConnected) {
        // Get word count
        const { count, error: countError } = await supabase
          .from('word_profiles')
          .select('*', { count: 'exact', head: true });

        if (!countError) {
          setWordCount(count || 0);
        }

        // Get recent words
        const { data: recentData, error: recentError } = await supabase
          .from('word_profiles')
          .select('word')
          .order('created_at', { ascending: false })
          .limit(10);

        if (!recentError && recentData) {
          setRecentWords(recentData.map(item => item.word));
        }
      }

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error fetching database stats:', error);
      setConnectionStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  };

  const testWordSave = async () => {
    setIsLoading(true);
    try {
      const testWord = 'test';
      const success = await DictionaryApiService.fetchAndStoreWord(testWord);
      if (success) {
        await fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error testing word save:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'default';
      case 'disconnected': return 'destructive';
      case 'testing': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'disconnected': return <AlertCircle className="h-4 w-4" />;
      case 'testing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Status
          </span>
          <Badge variant={getStatusColor()} className="flex items-center gap-1">
            {getStatusIcon()}
            {connectionStatus}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-white/70">Total Words:</span>
            <span className="font-medium text-white">{isLoading ? "..." : wordCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-white/70">Last Updated:</span>
            <span className="text-sm text-white/80">{lastUpdated || "Never"}</span>
          </div>
        </div>

        {recentWords.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm text-white/70">Recent Words:</span>
            <div className="flex flex-wrap gap-1">
              {recentWords.slice(0, 5).map(word => (
                <Badge key={word} variant="outline" className="text-xs border-white/30 text-white/80">
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
            className="border-white/30 text-white hover:bg-white/10"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
          <Button
            onClick={testWordSave}
            disabled={isLoading}
            size="sm"
            className="bg-primary hover:bg-primary/80"
          >
            Test Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
