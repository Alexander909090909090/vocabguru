
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  BarChart3,
  Settings,
  Sparkles
} from 'lucide-react';
import { useSmartDatabase } from '@/hooks/useSmartDatabase';
import { QualityDashboard } from './QualityDashboard';
import { EnrichmentControls } from './EnrichmentControls';
import { DataQualityIndicator } from './DataQualityIndicator';

export function ComprehensiveDashboard() {
  const { 
    qualityStats, 
    enrichmentQueue, 
    loading, 
    isProcessing,
    processQueue,
    refreshData
  } = useSmartDatabase();

  const [activeTab, setActiveTab] = useState('overview');
  const [performanceMetrics, setPerformanceMetrics] = useState({
    cacheSize: 0,
    taskQueueLength: 0,
    isProcessing: false
  });

  useEffect(() => {
    // Load performance metrics
    const loadMetrics = async () => {
      try {
        const { PerformanceOptimizationService } = await import('@/services/performanceOptimizationService');
        const metrics = PerformanceOptimizationService.getPerformanceMetrics();
        setPerformanceMetrics(metrics);
      } catch (error) {
        console.error('Error loading performance metrics:', error);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getQualityBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-white/10 rounded-lg animate-pulse" />
        <div className="h-64 bg-white/10 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Smart Database Dashboard</h2>
          <p className="text-white/70 mt-1">AI-powered word analysis and optimization system</p>
        </div>
        <Button onClick={refreshData} disabled={isProcessing}>
          <TrendingUp className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total Words</p>
                <p className="text-2xl font-bold text-white">{qualityStats.totalWords}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Average Quality</p>
                <p className={`text-2xl font-bold ${getQualityColor(qualityStats.averageScore)}`}>
                  {qualityStats.averageScore.toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Queue Length</p>
                <p className="text-2xl font-bold text-white">{enrichmentQueue.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Processing</p>
                <p className="text-2xl font-bold text-white">
                  {isProcessing ? 'Active' : 'Idle'}
                </p>
              </div>
              <Zap className={`h-8 w-8 ${isProcessing ? 'text-yellow-400' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-white/10 backdrop-blur-md border-white/20">
          <TabsTrigger value="overview" className="text-white data-[state=active]:bg-primary">
            Overview
          </TabsTrigger>
          <TabsTrigger value="quality" className="text-white data-[state=active]:bg-primary">
            Quality
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-white data-[state=active]:bg-primary">
            AI Processing
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-white data-[state=active]:bg-primary">
            Performance
          </TabsTrigger>
          <TabsTrigger value="personalization" className="text-white data-[state=active]:bg-primary">
            Personalization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quality Distribution */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Quality Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-400">{qualityStats.highQuality}</p>
                  <p className="text-white/70 text-sm">High Quality (80%+)</p>
                  <Progress 
                    value={(qualityStats.highQuality / qualityStats.totalWords) * 100} 
                    className="mt-2 h-2"
                  />
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-400">{qualityStats.mediumQuality}</p>
                  <p className="text-white/70 text-sm">Medium Quality (50-79%)</p>
                  <Progress 
                    value={(qualityStats.mediumQuality / qualityStats.totalWords) * 100} 
                    className="mt-2 h-2"
                  />
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-400">{qualityStats.lowQuality}</p>
                  <p className="text-white/70 text-sm">Low Quality (&lt;50%)</p>
                  <Progress 
                    value={(qualityStats.lowQuality / qualityStats.totalWords) * 100} 
                    className="mt-2 h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Enrichment Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {enrichmentQueue.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={item.status === 'pending' ? 'secondary' : 'default'}>
                        {item.status}
                      </Badge>
                      <span className="text-white text-sm">Priority: {item.priority}</span>
                    </div>
                    <div className="text-white/70 text-sm">
                      Created: {new Date(item.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                {enrichmentQueue.length > 5 && (
                  <p className="text-white/70 text-sm text-center">
                    +{enrichmentQueue.length - 5} more items in queue
                  </p>
                )}
                {enrichmentQueue.length > 0 && (
                  <Button 
                    onClick={() => processQueue(10)} 
                    disabled={isProcessing}
                    className="w-full mt-4"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Process Queue
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <QualityDashboard />
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Enhancement Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Calvarn AI Integration</h3>
                    <p className="text-white/70 text-sm">Advanced morphological analysis</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Multi-Source Data</h3>
                    <p className="text-white/70 text-sm">Wiktionary, WordNet, Datamuse APIs</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Quality Assurance</h3>
                    <p className="text-white/70 text-sm">Automated validation and scoring</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Cache Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Cache Size</span>
                    <span className="text-white font-mono">{performanceMetrics.cacheSize}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Background Tasks</span>
                    <span className="text-white font-mono">{performanceMetrics.taskQueueLength}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Processing Status</span>
                    <Badge variant={performanceMetrics.isProcessing ? 'default' : 'secondary'}>
                      {performanceMetrics.isProcessing ? 'Active' : 'Idle'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Database</span>
                    <Badge variant="default">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">AI Services</span>
                    <Badge variant="default">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">External APIs</span>
                    <Badge variant="default">Online</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="personalization" className="space-y-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Experience Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Personalized Recommendations</h3>
                    <p className="text-white/70 text-sm">AI-driven word suggestions based on user profile</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Learning Paths</h3>
                    <p className="text-white/70 text-sm">Adaptive learning journeys</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">Progress Tracking</h3>
                    <p className="text-white/70 text-sm">Detailed analytics and insights</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ComprehensiveDashboard;
