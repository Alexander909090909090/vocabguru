
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Monitor, Zap, Clock, Database } from "lucide-react";
import { PerformanceOptimizer } from "@/utils/performanceOptimizer";

interface PerformanceMetrics {
  memoryUsage: { used: number; total: number } | null;
  renderTime: number;
  apiCalls: number;
  cacheHitRate: number;
  loadTime: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: null,
    renderTime: 0,
    apiCalls: 0,
    cacheHitRate: 0,
    loadTime: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or when explicitly enabled
    const showMonitor = process.env.NODE_ENV === 'development' || 
                       localStorage.getItem('vocabguru-show-performance') === 'true';
    setIsVisible(showMonitor);

    if (!showMonitor) return;

    const updateMetrics = () => {
      const memory = PerformanceOptimizer.getMemoryUsage();
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory,
        loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
        renderTime: performance.now()
      }));
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, []);

  const getPerformanceColor = (value: number, type: 'memory' | 'time' | 'rate') => {
    switch (type) {
      case 'memory':
        return value > 80 ? 'destructive' : value > 60 ? 'secondary' : 'default';
      case 'time':
        return value > 3000 ? 'destructive' : value > 1000 ? 'secondary' : 'default';
      case 'rate':
        return value < 60 ? 'destructive' : value < 80 ? 'secondary' : 'default';
      default:
        return 'default';
    }
  };

  if (!isVisible) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-background/95 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Monitor className="h-4 w-4" />
          Performance Monitor
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Memory Usage */}
        {metrics.memoryUsage && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <Database className="h-3 w-3" />
                Memory
              </span>
              <Badge 
                variant={getPerformanceColor(
                  (metrics.memoryUsage.used / metrics.memoryUsage.total) * 100, 
                  'memory'
                )}
                className="text-xs"
              >
                {metrics.memoryUsage.used}MB
              </Badge>
            </div>
            <Progress 
              value={(metrics.memoryUsage.used / metrics.memoryUsage.total) * 100} 
              className="h-1"
            />
          </div>
        )}

        {/* Load Time */}
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Load Time
          </span>
          <Badge 
            variant={getPerformanceColor(metrics.loadTime, 'time')}
            className="text-xs"
          >
            {Math.round(metrics.loadTime)}ms
          </Badge>
        </div>

        {/* Render Performance */}
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Render Time
          </span>
          <Badge 
            variant={getPerformanceColor(metrics.renderTime, 'time')}
            className="text-xs"
          >
            {Math.round(metrics.renderTime)}ms
          </Badge>
        </div>

        {/* API Calls */}
        <div className="flex items-center justify-between text-xs">
          <span>API Calls</span>
          <Badge variant="outline" className="text-xs">
            {metrics.apiCalls}
          </Badge>
        </div>

        {/* Cache Hit Rate */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span>Cache Hit Rate</span>
            <Badge 
              variant={getPerformanceColor(metrics.cacheHitRate, 'rate')}
              className="text-xs"
            >
              {metrics.cacheHitRate}%
            </Badge>
          </div>
          <Progress value={metrics.cacheHitRate} className="h-1" />
        </div>
      </CardContent>
    </Card>
  );
}

export default PerformanceMonitor;
