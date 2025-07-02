
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Book, Brain, Globe, Download, Key, FileText } from 'lucide-react';

interface ResourceLink {
  title: string;
  description: string;
  url: string;
  category: 'dictionary' | 'ai' | 'documentation' | 'tutorial';
  free: boolean;
  icon: React.ReactNode;
}

export function ResourceLinksSection() {
  const resources: ResourceLink[] = [
    // Dictionary API Resources
    {
      title: 'Wiktionary API Documentation',
      description: 'Complete guide to accessing Wiktionary data programmatically',
      url: 'https://en.wiktionary.org/w/api.php',
      category: 'dictionary',
      free: true,
      icon: <Globe className="h-4 w-4" />
    },
    {
      title: 'Wordnik API Registration',
      description: 'Sign up for free Wordnik API access with generous rate limits',
      url: 'https://developer.wordnik.com/',
      category: 'dictionary',
      free: true,
      icon: <Key className="h-4 w-4" />
    },
    {
      title: 'Free Dictionary API',
      description: 'Open-source dictionary API with no authentication required',
      url: 'https://dictionaryapi.dev/',
      category: 'dictionary',
      free: true,
      icon: <Book className="h-4 w-4" />
    },
    {
      title: 'Oxford Dictionaries API',
      description: 'Get started with Oxford\'s authoritative dictionary data',
      url: 'https://developer.oxforddictionaries.com/',
      category: 'dictionary',
      free: true,
      icon: <Book className="h-4 w-4" />
    },
    {
      title: 'Merriam-Webster API',
      description: 'Access trusted dictionary and thesaurus data',
      url: 'https://dictionaryapi.com/',
      category: 'dictionary',
      free: true,
      icon: <Book className="h-4 w-4" />
    },

    // AI Model Resources
    {
      title: 'Hugging Face Hub',
      description: 'Explore thousands of open-source language models and datasets',
      url: 'https://huggingface.co/',
      category: 'ai',
      free: true,
      icon: <Brain className="h-4 w-4" />
    },
    {
      title: 'Hugging Face API Tokens',
      description: 'Create API tokens for accessing Hugging Face models',
      url: 'https://huggingface.co/settings/tokens',
      category: 'ai',
      free: true,
      icon: <Key className="h-4 w-4" />
    },
    {
      title: 'spaCy Documentation',
      description: 'Industrial-strength NLP library installation and usage guide',
      url: 'https://spacy.io/',
      category: 'ai',
      free: true,
      icon: <FileText className="h-4 w-4" />
    },
    {
      title: 'NLTK Installation Guide',
      description: 'Set up the Natural Language Toolkit for Python',
      url: 'https://www.nltk.org/install.html',
      category: 'ai',
      free: true,
      icon: <Download className="h-4 w-4" />
    },
    {
      title: 'Stanford NLP Software',
      description: 'Download and setup Stanford NLP tools and models',
      url: 'https://nlp.stanford.edu/software/',
      category: 'ai',
      free: true,
      icon: <Download className="h-4 w-4" />
    },
    {
      title: 'Ollama Installation',
      description: 'Run large language models locally with Ollama',
      url: 'https://ollama.ai/',
      category: 'ai',
      free: true,
      icon: <Download className="h-4 w-4" />
    },

    // Documentation Resources
    {
      title: 'VocabGuru API Integration Guide',
      description: 'Complete guide to integrating external APIs with VocabGuru',
      url: '#', // This would be internal documentation
      category: 'documentation',
      free: true,
      icon: <FileText className="h-4 w-4" />
    },
    {
      title: 'Morphological Analysis Best Practices',
      description: 'Learn how to implement effective word analysis pipelines',
      url: '#', // This would be internal documentation
      category: 'tutorial',
      free: true,
      icon: <FileText className="h-4 w-4" />
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'dictionary':
        return <Book className="h-5 w-5" />;
      case 'ai':
        return <Brain className="h-5 w-5" />;
      case 'documentation':
        return <FileText className="h-5 w-5" />;
      case 'tutorial':
        return <FileText className="h-5 w-5" />;
      default:
        return <ExternalLink className="h-5 w-5" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'dictionary':
        return 'Dictionary API Resources';
      case 'ai':
        return 'AI Model Resources';
      case 'documentation':
        return 'Documentation';
      case 'tutorial':
        return 'Tutorials & Guides';
      default:
        return 'Resources';
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'dictionary':
        return 'Links to register for dictionary APIs and access their documentation';
      case 'ai':
        return 'Resources for setting up and using open-source AI models';
      case 'documentation':
        return 'Technical documentation and API references';
      case 'tutorial':
        return 'Step-by-step guides and best practices';
      default:
        return 'Helpful resources and links';
    }
  };

  const categories = ['dictionary', 'ai', 'documentation', 'tutorial'];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Resource Links & Documentation</h3>
        <p className="text-sm text-muted-foreground">
          Access comprehensive documentation, registration links, and setup guides for all supported APIs and AI models.
        </p>
      </div>

      {categories.map((category) => {
        const categoryResources = resources.filter(r => r.category === category);
        
        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getCategoryIcon(category)}
                {getCategoryTitle(category)}
              </CardTitle>
              <CardDescription>
                {getCategoryDescription(category)}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {categoryResources.map((resource, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {resource.icon}
                        <h4 className="font-medium text-sm">{resource.title}</h4>
                      </div>
                      {resource.free && (
                        <Badge variant="outline" className="text-green-600 text-xs">
                          Free
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3">
                      {resource.description}
                    </p>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        if (resource.url !== '#') {
                          window.open(resource.url, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      disabled={resource.url === '#'}
                    >
                      <ExternalLink className="h-3 w-3 mr-2" />
                      {resource.url === '#' ? 'Coming Soon' : 'Open Resource'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Quick Setup Guide */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quick Setup Guide
          </CardTitle>
          <CardDescription>
            Follow these steps to get started with API integrations
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                1
              </span>
              <div>
                <strong>Register for API Keys:</strong> Visit the registration links above to sign up for free API access where required.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                2
              </span>
              <div>
                <strong>Configure APIs:</strong> Add your API keys in the Dictionary APIs and AI Models tabs above.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                3
              </span>
              <div>
                <strong>Test Connections:</strong> Use the "Test Connection" buttons to verify your API configurations.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                4
              </span>
              <div>
                <strong>Initialize Database:</strong> Go to the Initialize tab to populate your word repository with data from the configured APIs.
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
