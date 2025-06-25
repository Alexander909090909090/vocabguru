import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, BookOpen, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Header } from '@/components/Header';

interface DeepAnalysisPageParams {
  word: string;
}

const DeepAnalysisPage: React.FC = () => {
  const { word } = useParams<DeepAnalysisPageParams>();
  const navigate = useNavigate();
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    if (word) {
      performDeepAnalysis(word);
    }
  }, [word]);

  const performDeepAnalysis = async (word: string) => {
    setAnalysisLoading(true);
    // Simulate an API call to a deep analysis service
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockAnalysisResult = {
      word: word,
      etymology: {
        origin: "From Latin 'superfluus'",
        evolution: "Evolved to mean 'more than sufficient'",
        culturalSignificance: "Often used in academic contexts"
      },
      morphemes: {
        prefix: "super-",
        root: "fluere",
        suffix: "-ous"
      },
      usage: {
        frequency: "Common in formal writing",
        examples: [
          "The report contained superfluous details.",
          "Eliminate superfluous words from your essay."
        ]
      },
      relatedWords: ["redundant", "excessive", "unnecessary"]
    };

    setAnalysisResult(mockAnalysisResult);
    setAnalysisLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="page-container pt-24 page-transition">
        <div className="container-inner">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 group"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Words
          </Button>

          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Brain className="h-5 w-5 mr-2" />
                  Deep Analysis: {word}
                </CardTitle>
                <Badge variant="secondary">AI Powered</Badge>
              </div>
              <CardDescription>
                Comprehensive linguistic analysis powered by advanced algorithms.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {analysisLoading ? (
                <div className="text-center">
                  <p>Analyzing "{word}"...</p>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mt-4 mx-auto"></div>
                </div>
              ) : analysisResult ? (
                <Tabs defaultValue="etymology" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="etymology">Etymology</TabsTrigger>
                    <TabsTrigger value="morphemes">Morphemes</TabsTrigger>
                    <TabsTrigger value="usage">Usage</TabsTrigger>
                  </TabsList>
                  <TabsContent value="etymology" className="space-y-4">
                    <h3 className="text-xl font-semibold">Etymological Breakdown</h3>
                    <p>Origin: {analysisResult.etymology.origin}</p>
                    <p>Evolution: {analysisResult.etymology.evolution}</p>
                    <p>Cultural Significance: {analysisResult.etymology.culturalSignificance}</p>
                  </TabsContent>
                  <TabsContent value="morphemes" className="space-y-4">
                    <h3 className="text-xl font-semibold">Morphemic Analysis</h3>
                    <p>Prefix: {analysisResult.morphemes.prefix}</p>
                    <p>Root: {analysisResult.morphemes.root}</p>
                    <p>Suffix: {analysisResult.morphemes.suffix}</p>
                  </TabsContent>
                  <TabsContent value="usage" className="space-y-4">
                    <h3 className="text-xl font-semibold">Word Usage</h3>
                    <p>Frequency: {analysisResult.usage.frequency}</p>
                    <h4 className="font-semibold">Examples:</h4>
                    <ul>
                      {analysisResult.usage.examples.map((example: string, index: number) => (
                        <li key={index}>{example}</li>
                      ))}
                    </ul>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center">
                  <p>No analysis available for "{word}".</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="border-t border-white/10 mt-12 py-6">
        <div className="container-inner text-center text-sm text-muted-foreground">
          © 2024 VocabGuru. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default DeepAnalysisPage;
