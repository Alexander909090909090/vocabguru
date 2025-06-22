
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, BookOpen, Zap, History, TreePine } from "lucide-react";
import { toast } from "sonner";

interface MorphemeAnalysis {
  prefix?: {
    text: string;
    meaning: string;
    origin: string;
    examples: string[];
  };
  root: {
    text: string;
    meaning: string;
    origin: string;
    examples: string[];
  };
  suffix?: {
    text: string;
    meaning: string;
    origin: string;
    examples: string[];
  };
}

interface EtymologyAnalysis {
  originalForm: string;
  language: string;
  timelineEntries: Array<{
    period: string;
    form: string;
    meaning: string;
    context: string;
  }>;
  cognates: Array<{
    language: string;
    word: string;
    meaning: string;
  }>;
}

interface DeepWordAnalysis {
  word: string;
  morphemes: MorphemeAnalysis;
  etymology: EtymologyAnalysis;
  semanticEvolution: string[];
  linguisticInsights: string[];
  relatedWords: string[];
}

const WordAnalysis = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialWord = searchParams.get('word') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialWord);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DeepWordAnalysis | null>(null);

  const analyzeWord = async (word: string) => {
    if (!word.trim()) {
      toast.error("Please enter a word to analyze");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simulate deep AI analysis (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock analysis data (replace with real AI response)
      const mockAnalysis: DeepWordAnalysis = {
        word: word,
        morphemes: {
          prefix: word.length > 6 ? {
            text: word.slice(0, 2),
            meaning: "before, in front of",
            origin: "Latin",
            examples: ["prefix", "prepare", "prevent"]
          } : undefined,
          root: {
            text: word.slice(word.length > 6 ? 2 : 0, -2),
            meaning: "core meaning",
            origin: "Indo-European",
            examples: [word, "related1", "related2"]
          },
          suffix: word.length > 4 ? {
            text: word.slice(-2),
            meaning: "forming adjective/noun",
            origin: "Old English",
            examples: ["suffix1", "suffix2", "suffix3"]
          } : undefined
        },
        etymology: {
          originalForm: `*${word}os`,
          language: "Proto-Indo-European",
          timelineEntries: [
            {
              period: "3000 BCE",
              form: `*${word}os`,
              meaning: "original meaning",
              context: "Proto-Indo-European root"
            },
            {
              period: "500 BCE",
              form: `${word}um`,
              meaning: "evolved meaning",
              context: "Latin adaptation"
            },
            {
              period: "1200 CE",
              form: `${word}e`,
              meaning: "medieval meaning",
              context: "Old French influence"
            },
            {
              period: "1500 CE",
              form: word,
              meaning: "modern meaning",
              context: "Middle English standardization"
            }
          ],
          cognates: [
            { language: "German", word: `${word}heit`, meaning: "German cognate" },
            { language: "Spanish", word: `${word}dad`, meaning: "Spanish cognate" },
            { language: "French", word: `${word}té`, meaning: "French cognate" }
          ]
        },
        semanticEvolution: [
          "Original meaning focused on physical properties",
          "Expanded to include abstract concepts",
          "Modern usage encompasses metaphorical applications",
          "Contemporary meaning includes digital/technological contexts"
        ],
        linguisticInsights: [
          "This word follows typical Germanic sound shift patterns",
          "The morphological structure suggests early borrowing from Latin",
          "Phonetic changes reflect historical language contact",
          "Semantic broadening occurred during the Renaissance period"
        ],
        relatedWords: [`${word}ly`, `${word}ness`, `${word}ing`, `${word}ed`, `un${word}`]
      };
      
      setAnalysis(mockAnalysis);
      toast.success(`Deep analysis complete for "${word}"`);
      
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze word. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    analyzeWord(searchTerm);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="page-container pt-24 page-transition">
        {/* Back button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6 group" 
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Words
        </Button>

        {/* Page Header */}
        <div className="glass-card rounded-xl p-6 mb-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center bg-primary/80 w-12 h-12 rounded-full">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Deep Word Analysis</h1>
              <p className="text-muted-foreground">Comprehensive morphological and etymological breakdown</p>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-6">
            Explore the linguistic history, morphological components, and semantic evolution of any word. 
            Our AI provides detailed analysis of prefixes, roots, suffixes, and etymological development.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <Input
              placeholder="Enter a word to analyze (e.g., 'psychology', 'unforgettable')"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isAnalyzing}>
              {isAnalyzing ? (
                <Zap className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </Button>
          </form>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Word Header */}
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-4xl font-bold text-primary">{analysis.word}</h2>
                <Badge variant="outline" className="bg-primary/10">
                  Complete Analysis
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Comprehensive linguistic breakdown of "{analysis.word}" including morphological structure, 
                etymological development, and semantic evolution.
              </p>
            </Card>

            {/* Analysis Tabs */}
            <Tabs defaultValue="morphemes" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="morphemes">Morphemes</TabsTrigger>
                <TabsTrigger value="etymology">Etymology</TabsTrigger>
                <TabsTrigger value="evolution">Semantic Evolution</TabsTrigger>
                <TabsTrigger value="insights">Linguistic Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="morphemes" className="mt-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <TreePine className="h-5 w-5 text-primary" />
                    Morphological Breakdown
                  </h3>
                  <div className="grid gap-6 md:grid-cols-3">
                    {analysis.morphemes.prefix && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-primary">Prefix</h4>
                        <div className="bg-secondary/50 p-4 rounded-lg">
                          <p className="font-mono text-lg mb-2">{analysis.morphemes.prefix.text}</p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Meaning: {analysis.morphemes.prefix.meaning}
                          </p>
                          <p className="text-xs text-muted-foreground mb-3">
                            Origin: {analysis.morphemes.prefix.origin}
                          </p>
                          <div>
                            <p className="text-xs font-medium mb-1">Examples:</p>
                            <div className="flex flex-wrap gap-1">
                              {analysis.morphemes.prefix.examples.map((ex, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {ex}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <h4 className="font-medium text-primary">Root</h4>
                      <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary/20">
                        <p className="font-mono text-lg mb-2">{analysis.morphemes.root.text}</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          Meaning: {analysis.morphemes.root.meaning}
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                          Origin: {analysis.morphemes.root.origin}
                        </p>
                        <div>
                          <p className="text-xs font-medium mb-1">Examples:</p>
                          <div className="flex flex-wrap gap-1">
                            {analysis.morphemes.root.examples.map((ex, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {ex}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {analysis.morphemes.suffix && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-primary">Suffix</h4>
                        <div className="bg-secondary/50 p-4 rounded-lg">
                          <p className="font-mono text-lg mb-2">{analysis.morphemes.suffix.text}</p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Meaning: {analysis.morphemes.suffix.meaning}
                          </p>
                          <p className="text-xs text-muted-foreground mb-3">
                            Origin: {analysis.morphemes.suffix.origin}
                          </p>
                          <div>
                            <p className="text-xs font-medium mb-1">Examples:</p>
                            <div className="flex flex-wrap gap-1">
                              {analysis.morphemes.suffix.examples.map((ex, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {ex}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="etymology" className="mt-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Etymological Development
                  </h3>
                  
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Original Form</h4>
                    <p className="text-lg font-mono bg-secondary/50 p-3 rounded-lg inline-block">
                      {analysis.etymology.originalForm} ({analysis.etymology.language})
                    </p>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium mb-4">Historical Timeline</h4>
                    <div className="space-y-4">
                      {analysis.etymology.timelineEntries.map((entry, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-secondary/30 rounded-lg">
                          <div className="text-sm font-medium text-primary min-w-20">
                            {entry.period}
                          </div>
                          <div className="flex-1">
                            <p className="font-mono text-lg mb-1">{entry.form}</p>
                            <p className="text-sm text-muted-foreground mb-2">{entry.meaning}</p>
                            <p className="text-xs text-muted-foreground">{entry.context}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">Language Cognates</h4>
                    <div className="grid gap-3 md:grid-cols-3">
                      {analysis.etymology.cognates.map((cognate, i) => (
                        <div key={i} className="p-3 bg-secondary/50 rounded-lg">
                          <p className="font-medium text-primary">{cognate.language}</p>
                          <p className="font-mono">{cognate.word}</p>
                          <p className="text-sm text-muted-foreground">{cognate.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="evolution" className="mt-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Semantic Evolution</h3>
                  <div className="space-y-4">
                    {analysis.semanticEvolution.map((stage, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-medium">
                          {i + 1}
                        </div>
                        <p className="text-sm">{stage}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="mt-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Linguistic Insights</h3>
                  <div className="space-y-4">
                    {analysis.linguisticInsights.map((insight, i) => (
                      <div key={i} className="p-4 bg-secondary/30 rounded-lg">
                        <p className="text-sm">{insight}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Related Words</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.relatedWords.map((word, i) => (
                        <Badge key={i} variant="outline" className="cursor-pointer hover:bg-primary/10">
                          {word}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <Card className="p-8 text-center">
            <Zap className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
            <h3 className="text-lg font-semibold mb-2">Analyzing "{searchTerm}"</h3>
            <p className="text-muted-foreground">
              Performing deep morphological and etymological analysis...
            </p>
          </Card>
        )}
      </main>

      <footer className="border-t border-white/10 mt-12 py-6">
        <div className="container-inner text-center text-sm text-muted-foreground">
          <p>© 2024 VocabGuru. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default WordAnalysis;
