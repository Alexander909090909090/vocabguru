
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DictionaryAPISection } from './DictionaryAPISection';
import { AIModelSection } from './AIModelSection';
import { ResourceLinksSection } from './ResourceLinksSection';
import { DatabaseInitSection } from './DatabaseInitSection';
import { Book, Brain, ExternalLink, Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface APIStatus {
  [key: string]: {
    connected: boolean;
    lastTested: string | null;
    error?: string;
  };
}

export function APIIntegrationsTab() {
  const [apiStatus, setApiStatus] = useState<APIStatus>({});
  const [isLoading, setIsLoading] = useState(false);

  const checkAPIStatus = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-api-status');
      
      if (error) {
        console.error('Error checking API status:', error);
        toast({
          title: "Error",
          description: "Failed to check API status",
          variant: "destructive",
        });
        return;
      }

      setApiStatus(data?.status || {});
    } catch (error) {
      console.error('Error checking API status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAPIStatus();
  }, []);

  const getStatusIcon = (status: any) => {
    if (!status) return <AlertCircle className="h-4 w-4 text-gray-400" />;
    if (status.connected) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (status: any) => {
    if (!status) return <Badge variant="secondary">Not Configured</Badge>;
    if (status.connected) return <Badge variant="default" className="bg-green-500">Connected</Badge>;
    return <Badge variant="destructive">Disconnected</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Integration Status
              </CardTitle>
              <CardDescription>
                Overview of all configured API integrations
              </CardDescription>
            </div>
            <Button 
              onClick={checkAPIStatus} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh Status"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: 'wiktionary', name: 'Wiktionary' },
              { key: 'wordnik', name: 'Wordnik' },
              { key: 'huggingface', name: 'Hugging Face' },
              { key: 'oxford', name: 'Oxford' }
            ].map(api => (
              <div key={api.key} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(apiStatus[api.key])}
                  <span className="text-sm font-medium">{api.name}</span>
                </div>
                {getStatusBadge(apiStatus[api.key])}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Configuration Tabs */}
      <Tabs defaultValue="dictionary" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dictionary" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Dictionary APIs
          </TabsTrigger>
          <TabsTrigger value="ai-models" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Models
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="initialize" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Initialize
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dictionary" className="space-y-6 mt-6">
          <DictionaryAPISection 
            apiStatus={apiStatus} 
            onStatusUpdate={checkAPIStatus}
          />
        </TabsContent>

        <TabsContent value="ai-models" className="space-y-6 mt-6">
          <AIModelSection 
            apiStatus={apiStatus} 
            onStatusUpdate={checkAPIStatus}
          />
        </TabsContent>

        <TabsContent value="resources" className="space-y-6 mt-6">
          <ResourceLinksSection />
        </TabsContent>

        <TabsContent value="initialize" className="space-y-6 mt-6">
          <DatabaseInitSection apiStatus={apiStatus} />
        </TabsContent>
      </Tabs>

      {/* Important Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <span className="font-semibold">Security Notice:</span> All API keys are stored securely using Supabase Edge Function secrets. 
          Keys are encrypted and never exposed in client-side code. Only administrators can view and modify these configurations.
        </AlertDescription>
      </Alert>
    </div>
  );
}
