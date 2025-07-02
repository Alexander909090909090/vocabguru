import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SecureInput } from '@/components/Security/SecureInput';
import { ValidationResult } from '@/services/inputValidationService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Key, 
  TestTube,
  Brain,
  Cpu,
  Globe,
  Download
} from 'lucide-react';

interface AIModelSectionProps {
  apiStatus: any;
  onStatusUpdate: () => void;
}

interface AIModelConfig {
  key: string;
  name: string;
  description: string;
  capabilities: string[];
  requiresAuth: boolean;
  freeAccess: boolean;
  localInstallation: boolean;
  icon: React.ReactNode;
}

export function AIModelSection({ apiStatus, onStatusUpdate }: AIModelSectionProps) {
  const [apiKeys, setApiKeys] = useState<{ [key: string]: string }>({});
  const [isTestingConnection, setIsTestingConnection] = useState<{ [key: string]: boolean }>({});
  const [isSaving, setIsSaving] = useState<{ [key: string]: boolean }>({});

  const aiModels: AIModelConfig[] = [
    {
      key: 'huggingface',
      name: 'Hugging Face',
      description: 'Access to thousands of open-source language models for text analysis, generation, and linguistic processing.',
      capabilities: ['Text Analysis', 'Language Generation', 'Morphological Analysis', 'Semantic Understanding', 'Model Fine-tuning'],
      requiresAuth: true,
      freeAccess: true,
      localInstallation: false,
      icon: <Brain className="h-5 w-5" />
    },
    {
      key: 'spacy',
      name: 'spaCy',
      description: 'Industrial-strength natural language processing for morphological analysis and linguistic parsing.',
      capabilities: ['Morphological Analysis', 'POS Tagging', 'Dependency Parsing', 'Named Entity Recognition', 'Tokenization'],
      requiresAuth: false,
      freeAccess: true,
      localInstallation: true,
      icon: <Cpu className="h-5 w-5" />
    },
    {
      key: 'nltk',
      name: 'NLTK',
      description: 'Natural Language Toolkit for supplementary parsing and linguistic analysis tasks.',
      capabilities: ['Tokenization', 'Stemming', 'WordNet Integration', 'Part-of-Speech Tagging', 'Corpus Analysis'],
      requiresAuth: false,
      freeAccess: true,
      localInstallation: true,
      icon: <Cpu className="h-5 w-5" />
    },
    {
      key: 'stanford_nlp',
      name: 'Stanford NLP',
      description: 'Advanced linguistic analysis with high-accuracy syntactic understanding and dependency parsing.',
      capabilities: ['Dependency Parsing', 'Named Entity Recognition', 'Sentiment Analysis', 'Syntactic Analysis', 'Coreference Resolution'],
      requiresAuth: false,
      freeAccess: true,
      localInstallation: true,
      icon: <Brain className="h-5 w-5" />
    },
    {
      key: 'ollama',
      name: 'Ollama',
      description: 'Run large language models locally for private, secure linguistic analysis and text generation.',
      capabilities: ['Local LLMs', 'Text Generation', 'Contextual Analysis', 'Privacy-First', 'Offline Processing'],
      requiresAuth: false,
      freeAccess: true,
      localInstallation: true,
      icon: <Download className="h-5 w-5" />
    }
  ];

  const handleAPIKeyChange = (modelKey: string, value: string, validation: ValidationResult) => {
    if (validation.isValid) {
      setApiKeys(prev => ({ ...prev, [modelKey]: value }));
    }
  };

  const testConnection = async (modelKey: string) => {
    setIsTestingConnection(prev => ({ ...prev, [modelKey]: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke('test-ai-model-connection', {
        body: { 
          modelType: modelKey,
          apiKey: apiKeys[modelKey]
        }
      });

      if (error) {
        toast({
          title: "Connection Test Failed",
          description: `Failed to test ${modelKey} connection: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      if (data.success) {
        toast({
          title: "Connection Successful",
          description: `${modelKey} connection is working properly.`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: data.error || `Failed to connect to ${modelKey}.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Test Error",
        description: `Error testing ${modelKey} connection.`,
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(prev => ({ ...prev, [modelKey]: false }));
    }
  };

  const saveConfiguration = async (modelKey: string) => {
    setIsSaving(prev => ({ ...prev, [modelKey]: true }));

    try {
      const { data, error } = await supabase.functions.invoke('save-ai-model-config', {
        body: {
          modelType: modelKey,
          apiKey: apiKeys[modelKey] || null,
          enabled: true
        }
      });

      if (error) {
        toast({
          title: "Save Failed",
          description: `Failed to save ${modelKey} configuration: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Configuration Saved",
        description: `${modelKey} configuration has been saved successfully.`,
      });

      // Clear the input field if there was an API key
      if (apiKeys[modelKey]) {
        setApiKeys(prev => ({ ...prev, [modelKey]: '' }));
      }
      
      // Refresh status
      onStatusUpdate();
    } catch (error) {
      toast({
        title: "Save Error",
        description: `Error saving ${modelKey} configuration.`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(prev => ({ ...prev, [modelKey]: false }));
    }
  };

  const getStatusIcon = (modelKey: string) => {
    const status = apiStatus[modelKey];
    if (!status) return <AlertCircle className="h-4 w-4 text-gray-400" />;
    if (status.connected) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (modelKey: string) => {
    const status = apiStatus[modelKey];
    if (!status) return <Badge variant="secondary">Not Configured</Badge>;
    if (status.connected) return <Badge variant="default" className="bg-green-500">Ready</Badge>;
    return <Badge variant="destructive">Error</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Open-Source AI Models</h3>
        <p className="text-sm text-muted-foreground">
          Configure open-source AI models for advanced linguistic analysis, morphological breakdowns, and text processing.
        </p>
      </div>

      <div className="grid gap-6">
        {aiModels.map((model) => (
          <Card key={model.key} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {model.icon}
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {model.name}
                      <div className="flex gap-1">
                        {model.freeAccess && <Badge variant="outline" className="text-green-600">Free</Badge>}
                        {model.localInstallation && <Badge variant="outline" className="text-blue-600">Local</Badge>}
                      </div>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {model.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(model.key)}
                  {getStatusBadge(model.key)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Capabilities */}
              <div>
                <h4 className="text-sm font-medium mb-2">Capabilities:</h4>
                <div className="flex flex-wrap gap-2">
                  {model.capabilities.map((capability) => (
                    <Badge key={capability} variant="secondary" className="text-xs">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Configuration Section */}
              <div className="space-y-3">
                {/* API Key Input - Only for models that require authentication */}
                {model.requiresAuth && (
                  <>
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      <label className="text-sm font-medium">API Key</label>
                    </div>
                    
                    <SecureInput
                      type="apikey"
                      value={apiKeys[model.key] || ''}
                      onChange={(value, validation) => handleAPIKeyChange(model.key, value, validation)}
                      placeholder={`Enter your ${model.name} API key`}
                    />
                  </>
                )}

                {/* Local Installation Info */}
                {model.localInstallation && !model.requiresAuth && (
                  <Alert>
                    <Download className="h-4 w-4" />
                    <AlertDescription>
                      This model runs locally and doesn't require an API key. Ensure the required libraries are installed in your environment.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {model.requiresAuth && (
                    <Button
                      onClick={() => testConnection(model.key)}
                      disabled={!apiKeys[model.key] || isTestingConnection[model.key]}
                      variant="outline"
                      size="sm"
                    >
                      {isTestingConnection[model.key] ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <TestTube className="h-4 w-4 mr-2" />
                          Test Connection
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    onClick={() => saveConfiguration(model.key)}
                    disabled={isSaving[model.key] || (model.requiresAuth && !apiKeys[model.key])}
                    size="sm"
                  >
                    {isSaving[model.key] ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Configuration'
                    )}
                  </Button>
                </div>
              </div>

              {/* Status Error */}
              {apiStatus[model.key]?.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Error:</strong> {apiStatus[model.key].error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
