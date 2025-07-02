import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SecureInput } from '@/components/Security/SecureInput';
import { ValidationResult } from '@/services/secureInputValidationService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ExternalLink, 
  Key, 
  TestTube,
  Globe,
  Book
} from 'lucide-react';

interface DictionaryAPISectionProps {
  apiStatus: any;
  onStatusUpdate: () => void;
}

interface APIConfig {
  key: string;
  name: string;
  description: string;
  features: string[];
  requiresAuth: boolean;
  freeAccess: boolean;
  icon: React.ReactNode;
}

export function DictionaryAPISection({ apiStatus, onStatusUpdate }: DictionaryAPISectionProps) {
  const [apiKeys, setApiKeys] = useState<{ [key: string]: string }>({});
  const [isTestingConnection, setIsTestingConnection] = useState<{ [key: string]: boolean }>({});
  const [isSaving, setIsSaving] = useState<{ [key: string]: boolean }>({});

  const dictionaryAPIs: APIConfig[] = [
    {
      key: 'wiktionary',
      name: 'Wiktionary API',
      description: 'Comprehensive open-source dictionary with morphological breakdowns, etymology, and extensive linguistic data.',
      features: ['Morphological Analysis', 'Etymology', 'Multiple Definitions', 'Phonetic Transcriptions', 'Usage Examples'],
      requiresAuth: false,
      freeAccess: true,
      icon: <Globe className="h-5 w-5" />
    },
    {
      key: 'wordnik',
      name: 'Wordnik API',
      description: 'Rich dictionary data aggregated from multiple sources with collocations and extensive examples.',
      features: ['Multiple Sources', 'Collocations', 'Usage Examples', 'Word Relationships', 'Audio Pronunciations'],
      requiresAuth: true,
      freeAccess: true,
      icon: <Book className="h-5 w-5" />
    },
    {
      key: 'free_dictionary',
      name: 'Free Dictionary API',
      description: 'Simple, lightweight dictionary API with basic definitions and phonetic data.',
      features: ['Basic Definitions', 'Phonetic Data', 'Part of Speech', 'Audio Files', 'No Auth Required'],
      requiresAuth: false,
      freeAccess: true,
      icon: <Book className="h-5 w-5" />
    },
    {
      key: 'oxford',
      name: 'Oxford Dictionaries API',
      description: 'Authoritative dictionary data with high-quality definitions and linguistic analysis.',
      features: ['Authoritative Data', 'Advanced Linguistics', 'Multiple Languages', 'Etymology', 'Usage Context'],
      requiresAuth: true,
      freeAccess: true,
      icon: <Book className="h-5 w-5" />
    },
    {
      key: 'merriam_webster',
      name: 'Merriam-Webster API',
      description: 'Trusted dictionary source with reliable definitions and pronunciation guides.',
      features: ['Trusted Source', 'Clear Definitions', 'Pronunciation Guides', 'Word Games', 'Thesaurus Data'],
      requiresAuth: true,
      freeAccess: true,
      icon: <Book className="h-5 w-5" />
    }
  ];

  const handleAPIKeyChange = (apiKey: string, value: string, validation: ValidationResult) => {
    if (validation.isValid) {
      setApiKeys(prev => ({ ...prev, [apiKey]: value }));
    }
  };

  const testConnection = async (apiKey: string) => {
    setIsTestingConnection(prev => ({ ...prev, [apiKey]: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke('test-api-connection', {
        body: { 
          apiType: 'dictionary',
          apiKey: apiKey,
          apiKeyValue: apiKeys[apiKey]
        }
      });

      if (error) {
        toast({
          title: "Connection Test Failed",
          description: `Failed to test ${apiKey} connection: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      if (data.success) {
        toast({
          title: "Connection Successful",
          description: `${apiKey} API connection is working properly.`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: data.error || `Failed to connect to ${apiKey} API.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Test Error",
        description: `Error testing ${apiKey} connection.`,
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(prev => ({ ...prev, [apiKey]: false }));
    }
  };

  const saveAPIKey = async (apiKey: string) => {
    if (!apiKeys[apiKey]) {
      toast({
        title: "Missing API Key",
        description: "Please enter an API key before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(prev => ({ ...prev, [apiKey]: true }));

    try {
      const { data, error } = await supabase.functions.invoke('save-api-config', {
        body: {
          apiType: 'dictionary',
          apiKey: apiKey,
          apiKeyValue: apiKeys[apiKey]
        }
      });

      if (error) {
        toast({
          title: "Save Failed",
          description: `Failed to save ${apiKey} API key: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "API Key Saved",
        description: `${apiKey} API key has been saved securely.`,
      });

      // Clear the input field
      setApiKeys(prev => ({ ...prev, [apiKey]: '' }));
      
      // Refresh status
      onStatusUpdate();
    } catch (error) {
      toast({
        title: "Save Error",
        description: `Error saving ${apiKey} API key.`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(prev => ({ ...prev, [apiKey]: false }));
    }
  };

  const getStatusIcon = (apiKey: string) => {
    const status = apiStatus[apiKey];
    if (!status) return <AlertCircle className="h-4 w-4 text-gray-400" />;
    if (status.connected) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (apiKey: string) => {
    const status = apiStatus[apiKey];
    if (!status) return <Badge variant="secondary">Not Configured</Badge>;
    if (status.connected) return <Badge variant="default" className="bg-green-500">Connected</Badge>;
    return <Badge variant="destructive">Error</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Open-Source Dictionary APIs</h3>
        <p className="text-sm text-muted-foreground">
          Configure access to open-source dictionary APIs for comprehensive word analysis and linguistic data.
        </p>
      </div>

      <div className="grid gap-6">
        {dictionaryAPIs.map((api) => (
          <Card key={api.key} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {api.icon}
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {api.name}
                      {api.freeAccess && <Badge variant="outline" className="text-green-600">Free</Badge>}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {api.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(api.key)}
                  {getStatusBadge(api.key)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Features */}
              <div>
                <h4 className="text-sm font-medium mb-2">Features:</h4>
                <div className="flex flex-wrap gap-2">
                  {api.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* API Key Input - Only show for APIs that require authentication */}
              {api.requiresAuth && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    <label className="text-sm font-medium">API Key</label>
                  </div>
                  
                  <SecureInput
                    type="apikey"
                    value={apiKeys[api.key] || ''}
                    onChange={(value, validation) => handleAPIKeyChange(api.key, value, validation)}
                    placeholder={`Enter your ${api.name} API key`}
                  />

                  <div className="flex gap-2">
                    <Button
                      onClick={() => testConnection(api.key)}
                      disabled={!apiKeys[api.key] || isTestingConnection[api.key]}
                      variant="outline"
                      size="sm"
                    >
                      {isTestingConnection[api.key] ? (
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

                    <Button
                      onClick={() => saveAPIKey(api.key)}
                      disabled={!apiKeys[api.key] || isSaving[api.key]}
                      size="sm"
                    >
                      {isSaving[api.key] ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        'Save API Key'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* No Auth Required Message */}
              {!api.requiresAuth && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    This API doesn't require authentication. It's ready to use once you initialize the word repository.
                  </AlertDescription>
                </Alert>
              )}

              {/* Status Error */}
              {apiStatus[api.key]?.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Error:</strong> {apiStatus[api.key].error}
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
