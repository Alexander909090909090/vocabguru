
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AdvancedLinguisticProcessor } from '@/services/advancedLinguisticProcessor';
import { ComprehensiveLinguisticAnalysis, LinguisticAnalysisResult } from '@/types/linguisticAnalysis';
import { Brain, Clock, Target, Zap, BookOpen, Globe, Volume2, Link2, MessageSquare, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface ComprehensiveAnalysisPanelProps {
  word: string;
  onAnalysisComplete?: (analysis: ComprehensiveLinguisticAnalysis) => void;
}

export const ComprehensiveAnalysisPanel: React.FC<ComprehensiveAnalysisPanelProps> = ({
  word,
  onAnalysisComplete
}) => {
  const [analysis, setAnalysis] = useState<ComprehensiveLinguisticAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [metadata, setMetadata] = useState<any>(null);
  const [currentModel, setCurrentModel] = useState<string>('');

  useEffect(() => {
    if (word) {
      runComprehensiveAnalysis();
    }
  }, [word]);

  const runComprehensiveAnalysis = async () => {
    if (!word) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setCurrentModel('Initializing...');

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const result: LinguisticAnalysisResult = await AdvancedLinguisticProcessor.analyzeWord({
        word,
        options: {
          includeMorphological: true,
          includeEtymology: true,
          includePhonetic: true,
          includeSemantic: true,
          includeRelationships: true,
          includeUsageContexts: true
        }
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (result.success && result.analysis) {
        setAnalysis(result.analysis);
        setMetadata(result.metadata);
        onAnalysisComplete?.(result.analysis);
        toast.success('Comprehensive linguistic analysis completed!');
      } else {
        toast.error('Analysis failed: ' + (result.error || 'Unknown error'));
      }

    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to complete linguistic analysis');
    } finally {
      setIsAnalyzing(false);
      setCurrentModel('');
    }
  };

  const formatScore = (score?: number) => {
    if (!score) return 'N/A';
    return `${Math.round(score * 100)}%`;
  };

  const formatTime = (ms?: number) => {
    if (!ms) return 'N/A';
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (isAnalyzing) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 animate-pulse" />
            Analyzing "{word}"
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{analysisProgress}%</span>
            </div>
            <Progress value={analysisProgress} className="w-full" />
          </div>
          {currentModel && (
            <p className="text-sm text-muted-foreground">
              Current model: {currentModel}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">No analysis available</p>
          <Button onClick={runComprehensiveAnalysis}>
            Start Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Analysis Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Comprehensive Analysis: "{word}"
            </span>
            <Button size="sm" variant="outline" onClick={runComprehensiveAnalysis}>
              Re-analyze
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metadata && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <Clock className="h-4 w-4 mx-auto mb-1" />
                <p className="text-sm font-medium">{formatTime(metadata.processing_time_ms)}</p>
                <p className="text-xs text-muted-foreground">Processing Time</p>
              </div>
              <div className="text-center">
                <Target className="h-4 w-4 mx-auto mb-1" />
                <p className="text-sm font-medium">{formatScore(metadata.confidence_score)}</p>
                <p className="text-xs text-muted-foreground">Confidence</p>
              </div>
              <div className="text-center">
                <BarChart3 className="h-4 w-4 mx-auto mb-1" />
                <p className="text-sm font-medium">{formatScore(metadata.completeness_score / 100)}</p>
                <p className="text-xs text-muted-foreground">Completeness</p>
              </div>
              <div className="text-center">
                <Zap className="h-4 w-4 mx-auto mb-1" />
                <p className="text-sm font-medium">{metadata.models_used?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Models Used</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="morphology" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="morphology" className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span className="hidden sm:inline">Morphology</span>
          </TabsTrigger>
          <TabsTrigger value="etymology" className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            <span className="hidden sm:inline">Etymology</span>
          </TabsTrigger>
          <TabsTrigger value="phonetics" className="flex items-center gap-1">
            <Volume2 className="h-3 w-3" />
            <span className="hidden sm:inline">Phonetics</span>
          </TabsTrigger>
          <TabsTrigger value="semantics" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            <span className="hidden sm:inline">Semantics</span>
          </TabsTrigger>
          <TabsTrigger value="relationships" className="flex items-center gap-1">
            <Link2 className="h-3 w-3" />
            <span className="hidden sm:inline">Relations</span>
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            <span className="hidden sm:inline">Usage</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="morphology" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Morphological Components</CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.morphological_components?.length ? (
                <div className="space-y-3">
                  {analysis.morphological_components.map((component, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{component.component_type}</Badge>
                        <span className="font-medium">{component.text}</span>
                      </div>
                      {component.meaning && (
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Meaning:</strong> {component.meaning}
                        </p>
                      )}
                      {component.origin_language && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Origin:</strong> {component.origin_language}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No morphological data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="etymology" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Etymology & Historical Development</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.etymology_chain ? (
                <>
                  {analysis.etymology_chain.language_family && (
                    <div>
                      <strong>Language Family:</strong> {analysis.etymology_chain.language_family}
                    </div>
                  )}
                  {analysis.etymology_chain.source_language && (
                    <div>
                      <strong>Source Language:</strong> {analysis.etymology_chain.source_language}
                    </div>
                  )}
                  {analysis.etymology_chain.first_attestation_date && (
                    <div>
                      <strong>First Attestation:</strong> {analysis.etymology_chain.first_attestation_date}
                    </div>
                  )}
                  {analysis.etymology_chain.semantic_evolution && (
                    <div>
                      <strong>Semantic Evolution:</strong> 
                      <p className="mt-1 text-sm">{analysis.etymology_chain.semantic_evolution}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">No etymology data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phonetics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phonetic Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.phonetic_data ? (
                <>
                  {analysis.phonetic_data.ipa_transcription && (
                    <div>
                      <strong>IPA Transcription:</strong> /{analysis.phonetic_data.ipa_transcription}/
                    </div>
                  )}
                  {analysis.phonetic_data.syllable_structure && (
                    <div>
                      <strong>Syllable Structure:</strong> {analysis.phonetic_data.syllable_structure}
                    </div>
                  )}
                  {analysis.phonetic_data.stress_pattern && (
                    <div>
                      <strong>Stress Pattern:</strong> {analysis.phonetic_data.stress_pattern}
                    </div>
                  )}
                  {analysis.phonetic_data.syllable_count && (
                    <div>
                      <strong>Syllable Count:</strong> {analysis.phonetic_data.syllable_count}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">No phonetic data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="semantics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Semantic Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.semantic_relationships?.length ? (
                analysis.semantic_relationships.map((semantic, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    {semantic.semantic_field && (
                      <div>
                        <strong>Semantic Field:</strong> {semantic.semantic_field}
                      </div>
                    )}
                    {semantic.conceptual_domain && (
                      <div>
                        <strong>Conceptual Domain:</strong> {semantic.conceptual_domain}
                      </div>
                    )}
                    <div className="flex gap-2">
                      {semantic.connotation && (
                        <Badge variant={semantic.connotation === 'positive' ? 'default' : 
                                      semantic.connotation === 'negative' ? 'destructive' : 'secondary'}>
                          {semantic.connotation}
                        </Badge>
                      )}
                      {semantic.register_level && (
                        <Badge variant="outline">{semantic.register_level}</Badge>
                      )}
                      {semantic.difficulty_level && (
                        <Badge variant="outline">{semantic.difficulty_level}</Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No semantic data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relationships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Word Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.word_relationships?.length ? (
                <div className="space-y-3">
                  {Object.entries(
                    analysis.word_relationships.reduce((acc, rel) => {
                      if (!acc[rel.relationship_type]) acc[rel.relationship_type] = [];
                      acc[rel.relationship_type].push(rel);
                      return acc;
                    }, {} as Record<string, typeof analysis.word_relationships>)
                  ).map(([type, relationships]) => (
                    <div key={type} className="border rounded-lg p-3">
                      <h4 className="font-medium mb-2 capitalize">{type}s</h4>
                      <div className="flex flex-wrap gap-2">
                        {relationships.map((rel, index) => (
                          <Badge key={index} variant="outline">
                            {rel.target_word}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No relationship data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Contexts</CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.usage_contexts?.length ? (
                <div className="space-y-3">
                  {analysis.usage_contexts.map((context, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{context.context_type}</Badge>
                      </div>
                      <p className="text-sm mb-2 italic">"{context.example_sentence}"</p>
                      {context.explanation && (
                        <p className="text-xs text-muted-foreground">{context.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No usage context data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
