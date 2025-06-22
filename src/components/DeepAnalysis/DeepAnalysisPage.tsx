
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Brain, Network, BookOpen, Lightbulb, Loader2 } from "lucide-react";
import { AIWordAnalysisService, AIWordAnalysis } from "@/services/aiWordAnalysisService";
import { toast } from "sonner";
import Header from "@/components/Header";

export function DeepAnalysisPage() {
  const { word } = useParams<{ word: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AIWordAnalysis | null>(null);
  const [semanticMap, setSemanticMap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('morphology');

  useEffect(() => {
    if (word) {
      loadDeepAnalysis(word);
    }
  }, [word]);

  const loadDeepAnalysis = async (targetWord: string) => {
    setLoading(true);
    try {
      // Load AI analysis and semantic map in parallel
      const [analysisResult, semanticResult] = await Promise.all([
        AIWordAnalysisService.analyzeWord(targetWord),
        AIWordAnalysisService.generateSemanticMap(targetWord)
      ]);

      setAnalysis(analysisResult);
      setSemanticMap(semanticResult);
      
      toast.success(`Deep analysis complete for "${targetWord}"`);
    } catch (error) {
      console.error('Error loading deep analysis:', error);
      toast.error('Failed to load deep analysis');
    } finally {
      setLoading(false);
    }
  };

  if (!word) {
    return <div>Word not specified</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <main className="page-container pt-24">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6 group text-white/80 hover:text-white hover:bg-white/10" 
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Words
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-white">Deep Analysis</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
              AI-Powered Insights
            </Badge>
            <Badge variant="outline" className="bg-white/10 text-white border-white/20">
              Morphological Analysis
            </Badge>
          </div>
        </div>

        {loading ? (
          <Card className="mb-8 bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-white/80">Calvarn is analyzing "{word}"...</p>
              <p className="text-white/60 text-sm mt-2">Generating deep linguistic insights</p>
            </CardContent>
          </Card>
        ) : analysis ? (
          <>
            <Card className="mb-8 bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <span className="text-primary">{analysis.word}</span>
                  <Badge variant="secondary" className="text-xs">
                    {analysis.semantic_analysis.semantic_field}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90 text-lg leading-relaxed">
                  {analysis.semantic_analysis.core_meaning}
                </p>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
              <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-md border-white/20">
                <TabsTrigger value="morphology" className="text-white data-[state=active]:bg-primary data-[state=active]:text-white">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Morphology
                </TabsTrigger>
                <TabsTrigger value="etymology" className="text-white data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Network className="h-4 w-4 mr-2" />
                  Etymology
                </TabsTrigger>
                <TabsTrigger value="semantic" className="text-white data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Brain className="h-4 w-4 mr-2" />
                  Semantic Map
                </TabsTrigger>
                <TabsTrigger value="learning" className="text-white data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Learning
                </TabsTrigger>
              </TabsList>

              <TabsContent value="morphology" className="mt-6">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Morphological Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4">
                      {analysis.morphological_breakdown.prefix && (
                        <div className="flex items-center gap-4 p-4 bg-blue-500/20 rounded-lg">
                          <Badge variant="outline" className="bg-blue-500/30 text-blue-100 border-blue-400">
                            Prefix
                          </Badge>
                          <div className="flex-1">
                            <p className="text-white font-medium">{analysis.morphological_breakdown.prefix.text}</p>
                            <p className="text-white/70 text-sm">{analysis.morphological_breakdown.prefix.meaning}</p>
                            <p className="text-white/50 text-xs">Origin: {analysis.morphological_breakdown.prefix.origin}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 p-4 bg-green-500/20 rounded-lg">
                        <Badge variant="outline" className="bg-green-500/30 text-green-100 border-green-400">
                          Root
                        </Badge>
                        <div className="flex-1">
                          <p className="text-white font-medium">{analysis.morphological_breakdown.root.text}</p>
                          <p className="text-white/70 text-sm">{analysis.morphological_breakdown.root.meaning}</p>
                          <p className="text-white/50 text-xs">Origin: {analysis.morphological_breakdown.root.origin}</p>
                        </div>
                      </div>

                      {analysis.morphological_breakdown.suffix && (
                        <div className="flex items-center gap-4 p-4 bg-purple-500/20 rounded-lg">
                          <Badge variant="outline" className="bg-purple-500/30 text-purple-100 border-purple-400">
                            Suffix
                          </Badge>
                          <div className="flex-1">
                            <p className="text-white font-medium">{analysis.morphological_breakdown.suffix.text}</p>
                            <p className="text-white/70 text-sm">{analysis.morphological_breakdown.suffix.meaning}</p>
                            <p className="text-white/50 text-xs">Origin: {analysis.morphological_breakdown.suffix.origin}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="etymology" className="mt-6">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Etymology Deep Dive</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-white font-semibold mb-2">Historical Development</h3>
                      <p className="text-white/80">{analysis.etymology_deep_dive.historical_development}</p>
                    </div>
                    
                    <Separator className="bg-white/20" />
                    
                    <div>
                      <h3 className="text-white font-semibold mb-2">Language Family</h3>
                      <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                        {analysis.etymology_deep_dive.language_family}
                      </Badge>
                    </div>

                    <Separator className="bg-white/20" />

                    <div>
                      <h3 className="text-white font-semibold mb-2">Semantic Evolution</h3>
                      <p className="text-white/80">{analysis.etymology_deep_dive.semantic_evolution}</p>
                    </div>

                    {analysis.etymology_deep_dive.cognates.length > 0 && (
                      <>
                        <Separator className="bg-white/20" />
                        <div>
                          <h3 className="text-white font-semibold mb-3">Cognates</h3>
                          <div className="grid gap-2">
                            {analysis.etymology_deep_dive.cognates.map((cognate, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                                  {cognate.language}
                                </Badge>
                                <span className="text-white font-medium">{cognate.word}</span>
                                <span className="text-white/70 text-sm">— {cognate.meaning}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="semantic" className="mt-6">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Semantic Relationships</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {semanticMap && (
                      <>
                        <div className="text-center p-6 bg-primary/20 rounded-lg">
                          <h3 className="text-2xl font-bold text-white mb-2">{semanticMap.central_concept}</h3>
                          <p className="text-white/70">Central Concept</p>
                        </div>

                        <div>
                          <h3 className="text-white font-semibold mb-3">Related Words</h3>
                          <div className="grid gap-2">
                            {semanticMap.related_words.map((relation: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <span className="text-white font-medium">{relation.word}</span>
                                  <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-xs">
                                    {relation.relationship}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-primary transition-all duration-300"
                                      style={{ width: `${relation.strength * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-white/60 text-xs">{Math.round(relation.strength * 100)}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {semanticMap.conceptual_domains.length > 0 && (
                          <div>
                            <h3 className="text-white font-semibold mb-3">Conceptual Domains</h3>
                            <div className="flex flex-wrap gap-2">
                              {semanticMap.conceptual_domains.map((domain: string, index: number) => (
                                <Badge key={index} variant="outline" className="bg-white/10 text-white border-white/20">
                                  {domain}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="learning" className="mt-6">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Learning Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-white font-semibold mb-3">Memory Anchors</h3>
                      <div className="grid gap-2">
                        {analysis.learning_insights.memory_anchors.map((anchor, index) => (
                          <div key={index} className="p-3 bg-green-500/20 rounded-lg">
                            <p className="text-white/90">{anchor}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-white/20" />

                    <div>
                      <h3 className="text-white font-semibold mb-3">Learning Strategies</h3>
                      <div className="grid gap-2">
                        {analysis.learning_insights.learning_strategies.map((strategy, index) => (
                          <div key={index} className="p-3 bg-blue-500/20 rounded-lg">
                            <p className="text-white/90">{strategy}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {analysis.learning_insights.difficulty_factors.length > 0 && (
                      <>
                        <Separator className="bg-white/20" />
                        <div>
                          <h3 className="text-white font-semibold mb-3">Difficulty Factors</h3>
                          <div className="grid gap-2">
                            {analysis.learning_insights.difficulty_factors.map((factor, index) => (
                              <div key={index} className="p-3 bg-yellow-500/20 rounded-lg">
                                <p className="text-white/90">{factor}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {analysis.learning_insights.common_errors.length > 0 && (
                      <>
                        <Separator className="bg-white/20" />
                        <div>
                          <h3 className="text-white font-semibold mb-3">Common Errors</h3>
                          <div className="grid gap-2">
                            {analysis.learning_insights.common_errors.map((error, index) => (
                              <div key={index} className="p-3 bg-red-500/20 rounded-lg">
                                <p className="text-white/90">{error}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-8 text-center">
              <p className="text-white/80">Failed to load analysis for "{word}"</p>
              <Button 
                onClick={() => word && loadDeepAnalysis(word)} 
                className="mt-4"
                variant="outline"
              >
                Retry Analysis
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default DeepAnalysisPage;
