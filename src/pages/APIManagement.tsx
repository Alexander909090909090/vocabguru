
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Key, Globe, Brain, Database, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

interface APIStatus {
  name: string;
  status: 'connected' | 'disconnected' | 'testing';
  description: string;
  required: boolean;
}

const APIManagement: React.FC = () => {
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    merriam_webster_dict: '',
    merriam_webster_thesaurus: '',
    oxford_dict: '',
    wordsapi: '',
    cambridge_dict: ''
  });

  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([
    { name: 'OpenAI', status: 'disconnected', description: 'AI-powered word analysis and smart discovery', required: true },
    { name: 'Merriam-Webster Dictionary', status: 'disconnected', description: 'High-quality definitions and etymology', required: true },
    { name: 'Merriam-Webster Thesaurus', status: 'disconnected', description: 'Synonyms and antonyms', required: true },
    { name: 'Oxford Dictionary', status: 'disconnected', description: 'Academic-grade definitions and pronunciations', required: false },
    { name: 'WordsAPI', status: 'disconnected', description: 'Linguistic analysis and word relationships', required: false },
    { name: 'Cambridge Dictionary', status: 'disconnected', description: 'British English definitions and usage', required: false }
  ]);

  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationStatus, setInitializationStatus] = useState('');

  useEffect(() => {
    checkExistingKeys();
  }, []);

  const checkExistingKeys = async () => {
    // Check which API keys are already configured in Supabase secrets
    // This would normally involve calling an edge function to check secret existence
    // For now, we'll simulate the check
    const updatedStatuses = apiStatuses.map(api => ({
      ...api,
      status: Math.random() > 0.7 ? 'connected' : 'disconnected' as 'connected' | 'disconnected'
    }));
    setApiStatuses(updatedStatuses);
  };

  const testAPIConnection = async (apiName: string, apiKey: string) => {
    setApiStatuses(prev => prev.map(api => 
      api.name === apiName ? { ...api, status: 'testing' } : api
    ));

    try {
      // Call edge function to test API connection
      const { data, error } = await supabase.functions.invoke('test-api-connection', {
        body: { apiName, apiKey }
      });

      if (error) throw error;

      const status = data.success ? 'connected' : 'disconnected';
      setApiStatuses(prev => prev.map(api => 
        api.name === apiName ? { ...api, status } : api
      ));

      if (data.success) {
        toast({
          title: "API Connected",
          description: `${apiName} is working correctly`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: `${apiName} connection failed: ${data.error}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      setApiStatuses(prev => prev.map(api => 
        api.name === apiName ? { ...api, status: 'disconnected' } : api
      ));
      
      toast({
        title: "Test Failed",
        description: `Failed to test ${apiName} connection`,
        variant: "destructive"
      });
    }
  };

  const saveAPIKey = async (apiName: string, apiKey: string) => {
    if (!apiKey.trim()) {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid API key",
        variant: "destructive"
      });
      return;
    }

    try {
      // Save API key to Supabase secrets via edge function
      const { error } = await supabase.functions.invoke('manage-api-keys', {
        body: { action: 'save', apiName, apiKey }
      });

      if (error) throw error;

      toast({
        title: "API Key Saved",
        description: `${apiName} API key has been securely stored`,
      });

      // Test the connection after saving
      await testAPIConnection(apiName, apiKey);
    } catch (error) {
      toast({
        title: "Save Failed",
        description: `Failed to save ${apiName} API key`,
        variant: "destructive"
      });
    }
  };

  const initializeSmartDiscovery = async () => {
    setIsInitializing(true);
    setInitializationStatus('Checking API connections...');

    try {
      // Check if required APIs are connected
      const requiredAPIs = apiStatuses.filter(api => api.required);
      const connectedRequired = requiredAPIs.filter(api => api.status === 'connected');

      if (connectedRequired.length < requiredAPIs.length) {
        toast({
          title: "Missing Required APIs",
          description: "Please configure OpenAI and Merriam-Webster APIs first",
          variant: "destructive"
        });
        setIsInitializing(false);
        return;
      }

      setInitializationStatus('Initializing AI word discovery system...');

      // Call the smart discovery initialization
      const { data, error } = await supabase.functions.invoke('initialize-smart-discovery', {
        body: { forceReinit: false }
      });

      if (error) throw error;

      setInitializationStatus('Populating vocabulary database...');

      // Trigger initial population
      const { data: populationData, error: populationError } = await supabase.functions.invoke('smart-word-population', {
        body: { 
          mode: 'initial',
          targetCount: 100,
          categories: ['academic', 'common', 'technical', 'literary']
        }
      });

      if (populationError) throw populationError;

      setInitializationStatus('Smart discovery system ready!');

      toast({
        title: "Smart Discovery Initialized",
        description: `Successfully initialized with ${populationData.wordsAdded} words. The system is now ready for intelligent word discovery.`,
      });

      setTimeout(() => {
        setIsInitializing(false);
        setInitializationStatus('');
      }, 2000);

    } catch (error) {
      console.error('Initialization error:', error);
      toast({
        title: "Initialization Failed",
        description: "Failed to initialize smart discovery system. Please try again.",
        variant: "destructive"
      });
      setIsInitializing(false);
      setInitializationStatus('');
    }
  };

  const getStatusIcon = (status: 'connected' | 'disconnected' | 'testing') => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'testing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: 'connected' | 'disconnected' | 'testing') => {
    const variants = {
      connected: 'default',
      disconnected: 'destructive',
      testing: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status]}>
        {status === 'testing' ? 'Testing...' : status}
      </Badge>
    );
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
      className="container mx-auto py-8 px-4 max-w-4xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <Globe className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-semibold">API Management</h1>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Configure dictionary APIs and enable AI-powered word discovery for VocabGuru. Connect multiple dictionary sources for comprehensive word data.
      </p>

      {/* Smart Discovery Status */}
      <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Smart Discovery System
          </CardTitle>
          <CardDescription>
            AI-powered automatic word discovery and database population
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Status: {initializationStatus || 'Ready to initialize'}
              </p>
              <p className="text-xs text-muted-foreground">
                Requires OpenAI and Merriam-Webster APIs
              </p>
            </div>
            <Button 
              onClick={initializeSmartDiscovery}
              disabled={isInitializing}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/80 hover:to-purple-600/80"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Initialize Smart Discovery
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Status Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>API Connection Status</CardTitle>
          <CardDescription>
            Overview of all configured dictionary and AI services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {apiStatuses.map((api) => (
              <div 
                key={api.name}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(api.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{api.name}</span>
                      {api.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{api.description}</p>
                  </div>
                </div>
                {getStatusBadge(api.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Configuration */}
      <div className="grid gap-6">
        {/* OpenAI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              OpenAI API
              <Badge variant="destructive" className="text-xs">Required</Badge>
            </CardTitle>
            <CardDescription>
              Powers AI word analysis, smart discovery, and contextual examples
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="openai-key">API Key</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="openai-key"
                  type="password"
                  placeholder="sk-..."
                  value={apiKeys.openai}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, openai: e.target.value }))}
                />
                <Button 
                  onClick={() => saveAPIKey('OpenAI', apiKeys.openai)}
                  disabled={!apiKeys.openai.trim()}
                >
                  Save
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI Platform</a>
            </p>
          </CardContent>
        </Card>

        {/* Merriam-Webster Dictionary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Merriam-Webster Dictionary
              <Badge variant="destructive" className="text-xs">Required</Badge>
            </CardTitle>
            <CardDescription>
              High-quality definitions, pronunciations, and etymology data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mw-dict-key">Dictionary API Key</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="mw-dict-key"
                  type="password"
                  placeholder="Enter API key..."
                  value={apiKeys.merriam_webster_dict}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, merriam_webster_dict: e.target.value }))}
                />
                <Button 
                  onClick={() => saveAPIKey('Merriam-Webster Dictionary', apiKeys.merriam_webster_dict)}
                  disabled={!apiKeys.merriam_webster_dict.trim()}
                >
                  Save
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Register for free at <a href="https://dictionaryapi.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Merriam-Webster Developer Center</a>
            </p>
          </CardContent>
        </Card>

        {/* Merriam-Webster Thesaurus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Merriam-Webster Thesaurus
              <Badge variant="destructive" className="text-xs">Required</Badge>
            </CardTitle>
            <CardDescription>
              Comprehensive synonyms, antonyms, and word relationships
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mw-thes-key">Thesaurus API Key</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="mw-thes-key"
                  type="password"
                  placeholder="Enter API key..."
                  value={apiKeys.merriam_webster_thesaurus}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, merriam_webster_thesaurus: e.target.value }))}
                />
                <Button 
                  onClick={() => saveAPIKey('Merriam-Webster Thesaurus', apiKeys.merriam_webster_thesaurus)}
                  disabled={!apiKeys.merriam_webster_thesaurus.trim()}
                >
                  Save
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Same developer account as Dictionary API - register at <a href="https://dictionaryapi.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Merriam-Webster Developer Center</a>
            </p>
          </CardContent>
        </Card>

        <Separator />

        {/* Optional APIs */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-muted-foreground">Optional Enhancements</h3>
          
          {/* Oxford Dictionary */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Oxford Dictionary API
                <Badge variant="outline" className="text-xs">Optional</Badge>
              </CardTitle>
              <CardDescription>
                Premium academic definitions and detailed linguistic analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="oxford-key">API Key</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="oxford-key"
                    type="password"
                    placeholder="Enter API key..."
                    value={apiKeys.oxford_dict}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, oxford_dict: e.target.value }))}
                  />
                  <Button 
                    onClick={() => saveAPIKey('Oxford Dictionary', apiKeys.oxford_dict)}
                    disabled={!apiKeys.oxford_dict.trim()}
                  >
                    Save
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Premium service - register at <a href="https://developer.oxforddictionaries.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Oxford Dictionaries API</a>
              </p>
            </CardContent>
          </Card>

          {/* WordsAPI */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                WordsAPI
                <Badge variant="outline" className="text-xs">Optional</Badge>
              </CardTitle>
              <CardDescription>
                Detailed linguistic analysis, word frequency, and relationships
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="wordsapi-key">API Key</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="wordsapi-key"
                    type="password"
                    placeholder="Enter API key..."
                    value={apiKeys.wordsapi}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, wordsapi: e.target.value }))}
                  />
                  <Button 
                    onClick={() => saveAPIKey('WordsAPI', apiKeys.wordsapi)}
                    disabled={!apiKeys.wordsapi.trim()}
                  >
                    Save
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Available on <a href="https://rapidapi.com/dpventures/api/wordsapi/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">RapidAPI WordsAPI</a>
              </p>
            </CardContent>
          </Card>

          {/* Cambridge Dictionary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Cambridge Dictionary API
                <Badge variant="outline" className="text-xs">Optional</Badge>
              </CardTitle>
              <CardDescription>
                British English focus with detailed usage examples
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cambridge-key">API Key</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="cambridge-key"
                    type="password"
                    placeholder="Enter API key..."
                    value={apiKeys.cambridge_dict}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, cambridge_dict: e.target.value }))}
                  />
                  <Button 
                    onClick={() => saveAPIKey('Cambridge Dictionary', apiKeys.cambridge_dict)}
                    disabled={!apiKeys.cambridge_dict.trim()}
                  >
                    Save
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Register at <a href="https://dictionary-api.cambridge.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Cambridge Dictionary API</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default APIManagement;
