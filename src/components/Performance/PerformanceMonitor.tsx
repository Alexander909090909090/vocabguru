
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UnifiedWordService } from '@/services/unifiedWordService';
import { Activity, Zap, Database, Clock } from 'lucide-react';

interface PerformanceMetrics {
  cacheHitRate: number;
  averageLoadTime: number;
  totalRequests: number;
  errorRate: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cacheHitRate: 0,
    averageLoadTime: 0,
    totalRequests: 0,
    errorRate: 0
  });
  const [cacheStats, setCacheStats] = useState({ size: 0, keys: [] as string[] });

  useEffect(() => {
    const updateStats = () => {
      const stats = UnifiedWordService.getCacheStats();
      setCacheStats(stats);

      // Simulate performance metrics (in a real app, these would come from actual monitoring)
      setMetrics({
        cacheHitRate: Math.min(95, 60 + (stats.size * 2)),
        averageLoadTime: Math.max(50, 200 - (stats.size * 3)),
        totalRequests: stats.size * 5,
        errorRate: Math.max(0, 5 - stats.size * 0.1)
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, []);

  const clearCache = () => {
    UnifiedWordService.clearCache();
    setCacheStats({ size: 0, keys: [] });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            Cache Hit Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.cacheHitRate.toFixed(1)}%</div>
          <Badge variant={metrics.cacheHitRate > 80 ? "default" : "secondary"} className="mt-2">
            {metrics.cacheHitRate > 80 ? "Excellent" : "Good"}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            Avg Load Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.averageLoadTime}ms</div>
          <Badge variant={metrics.averageLoadTime < 100 ? "default" : "secondary"} className="mt-2">
            {metrics.averageLoadTime < 100 ? "Fast" : "Normal"}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="h-4 w-4 text-green-500" />
            Cache Size
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{cacheStats.size}</div>
          <button 
            onClick={clearCache}
            className="text-xs text-muted-foreground hover:text-foreground mt-2"
          >
            Clear Cache
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-red-500" />
            Error Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.errorRate.toFixed(1)}%</div>
          <Badge variant={metrics.errorRate < 2 ? "default" : "destructive"} className="mt-2">
            {metrics.errorRate < 2 ? "Healthy" : "Warning"}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
