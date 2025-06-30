
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSmartDatabase } from '@/hooks/useSmartDatabase';
import { 
  Database, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Zap,
  BarChart3
} from 'lucide-react';

export function QualityDashboard() {
  const { 
    qualityStats, 
    enrichmentQueue, 
    loading, 
    isProcessing, 
    processQueue, 
    refreshData 
  } = useSmartDatabase();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const qualityPercentage = qualityStats.totalWords > 0 
    ? (qualityStats.highQuality / qualityStats.totalWords) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Quality Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Words</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qualityStats.totalWords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              In vocabulary database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Quality</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {qualityStats.highQuality.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {qualityPercentage.toFixed(1)}% of total words
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Quality</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {qualityStats.averageScore.toFixed(1)}%
            </div>
            <Progress value={qualityStats.averageScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Enrichment</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {(qualityStats.lowQuality + qualityStats.mediumQuality).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Queue: {enrichmentQueue.filter(item => item.status === 'pending').length} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quality Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Data Quality Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm">High Quality (80%+)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{qualityStats.highQuality}</span>
                <Badge variant="outline" className="text-green-600">
                  {qualityPercentage.toFixed(1)}%
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-sm">Medium Quality (50-79%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{qualityStats.mediumQuality}</span>
                <Badge variant="outline" className="text-yellow-600">
                  {qualityStats.totalWords > 0 ? ((qualityStats.mediumQuality / qualityStats.totalWords) * 100).toFixed(1) : 0}%
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-sm">Low Quality (&lt;50%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{qualityStats.lowQuality}</span>
                <Badge variant="outline" className="text-red-600">
                  {qualityStats.totalWords > 0 ? ((qualityStats.lowQuality / qualityStats.totalWords) * 100).toFixed(1) : 0}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrichment Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Smart Enrichment Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => processQueue(10)}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Process Queue (10 items)
            </Button>
            
            <Button 
              variant="outline"
              onClick={refreshData}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Stats
            </Button>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
          
          {enrichmentQueue.length > 0 && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>{enrichmentQueue.filter(item => item.status === 'pending').length}</strong> words 
                in enrichment queue, <strong>{enrichmentQueue.filter(item => item.status === 'processing').length}</strong> currently processing
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
