
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Brain, Search, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";

interface ComprehensiveBreakdown {
  word: string;
  morpheme_breakdown: {
    prefix?: { text: string; meaning: string; origin: string };
    root: { text: string; meaning: string; origin: string };
    suffix?: { text: string; meaning: string; origin: string };
  };
  etymology: {
    historical_origins: string;
    language_of_origin: string;
    word_evolution: string;
    cultural_variations?: string;
  };
  definitions: {
    primary: string;
    standard: string[];
    extended: string[];
    contextual: string[];
    specialized: string[];
  };
  word_forms: {
    noun_forms?: { singular?: string; plural?: string };
    verb_tenses?: { base?: string; past?: string; present?: string };
    adjective_forms?: { positive?: string; comparative?: string; superlative?: string };
    adverb_form?: string;
  };
  analysis: {
    parts_of_speech: string;
    contextual_usage: string;
    synonyms_antonyms: {
      synonyms: string[];
      antonyms: string[];
    };
    common_collocations: string[];
    cultural_significance?: string;
    example: string;
  };
}

export function SimplifiedDeepAnalysis() {
  const navigate = useNavigate();
  const [searchWord, setSearchWord] = useState('');
  const [analysis, setAnalysis] = useState<ComprehensiveBreakdown | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!searchWord.trim()) {
      toast.error('Please enter a word to analyze');
      return;
    }

    setLoading(true);
    try {
      // Call Calvern 3.0 API for comprehensive breakdown
      const response = await fetch('https://calvern-codex.zapier.app/calvern-3-0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: searchWord.trim(),
          analysis_type: 'comprehensive_breakdown'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze word');
      }

      const result = await response.json();
      setAnalysis(result);
      toast.success(`Comprehensive analysis complete for "${searchWord}"`);
    } catch (error) {
      console.error('Error analyzing word:', error);
      toast.error('Failed to analyze word. Please try again.');
      
      // Fallback to mock data for demonstration
      setAnalysis(createMockAnalysis(searchWord));
    } finally {
      setLoading(false);
    }
  };

  const createMockAnalysis = (word: string): ComprehensiveBreakdown => ({
    word: word,
    morpheme_breakdown: {
      root: { text: word, meaning: "Core meaning", origin: "Latin" }
    },
    etymology: {
      historical_origins: `The word "${word}" has ancient linguistic roots.`,
      language_of_origin: "Latin",
      word_evolution: "Evolved through various linguistic stages.",
      cultural_variations: "Used across different cultures and contexts."
    },
    definitions: {
      primary: `Primary definition of ${word}`,
      standard: [`Standard definition 1`, `Standard definition 2`],
      extended: [`Extended definition 1`],
      contextual: [`Contextual usage definition`],
      specialized: [`Specialized technical definition`]
    },
    word_forms: {
      noun_forms: { singular: word, plural: `${word}s` }
    },
    analysis: {
      parts_of_speech: "Noun, Adjective",
      contextual_usage: `${word} is commonly used in formal and academic contexts.`,
      synonyms_antonyms: {
        synonyms: ["similar", "alike", "comparable"],
        antonyms: ["different", "unlike", "dissimilar"]
      },
      common_collocations: [`common ${word}`, `${word} example`, `typical ${word}`],
      cultural_significance: `${word} holds significance in various cultural contexts.`,
      example: `This is an example sentence using the word ${word}.`
    }
  });

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

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
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <p className="text-white/70">Powered by Calvern 3.0 - Advanced Linguistic Intelligence</p>
          </div>

          {/* Search Interface */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-8">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter any word for comprehensive analysis..."
                  value={searchWord}
                  onChange={(e) => setSearchWord(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-lg h-14"
                  disabled={loading}
                />
                <Button 
                  onClick={handleAnalyze} 
                  disabled={loading || !searchWord.trim()}
                  className="h-14 px-8 bg-primary hover:bg-primary/80"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading && (
          <Card className="mb-8 bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-white/80">Calvern is analyzing "{searchWord}"...</p>
              <p className="text-white/60 text-sm mt-2">Generating comprehensive linguistic breakdown</p>
            </CardContent>
          </Card>
        )}

        {analysis && !loading && (
          <div className="space-y-6">
            {/* Word Header */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-3xl text-white text-center">
                  {analysis.word}
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Morpheme Breakdown */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl">Morpheme Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.morpheme_breakdown.prefix && (
                  <div className="p-4 bg-blue-500/20 rounded-lg">
                    <h4 className="text-blue-100 font-semibold">Prefix: {analysis.morpheme_breakdown.prefix.text}</h4>
                    <p className="text-white/80">{analysis.morpheme_breakdown.prefix.meaning}</p>
                    <p className="text-white/60 text-sm">Origin: {analysis.morpheme_breakdown.prefix.origin}</p>
                  </div>
                )}
                
                <div className="p-4 bg-green-500/20 rounded-lg">
                  <h4 className="text-green-100 font-semibold">Root Word: {analysis.morpheme_breakdown.root.text}</h4>
                  <p className="text-white/80">{analysis.morpheme_breakdown.root.meaning}</p>
                  <p className="text-white/60 text-sm">Origin: {analysis.morpheme_breakdown.root.origin}</p>
                </div>

                {analysis.morpheme_breakdown.suffix && (
                  <div className="p-4 bg-purple-500/20 rounded-lg">
                    <h4 className="text-purple-100 font-semibold">Suffix: {analysis.morpheme_breakdown.suffix.text}</h4>
                    <p className="text-white/80">{analysis.morpheme_breakdown.suffix.meaning}</p>
                    <p className="text-white/60 text-sm">Origin: {analysis.morpheme_breakdown.suffix.origin}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Etymology */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl">Etymology</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-white/90 font-semibold mb-2">Historical Origins</h4>
                  <p className="text-white/80">{analysis.etymology.historical_origins}</p>
                </div>
                <div>
                  <h4 className="text-white/90 font-semibold mb-2">Language of Origin</h4>
                  <p className="text-white/80">{analysis.etymology.language_of_origin}</p>
                </div>
                <div>
                  <h4 className="text-white/90 font-semibold mb-2">Word Evolution</h4>
                  <p className="text-white/80">{analysis.etymology.word_evolution}</p>
                </div>
                {analysis.etymology.cultural_variations && (
                  <div>
                    <h4 className="text-white/90 font-semibold mb-2">Cultural & Regional Variations</h4>
                    <p className="text-white/80">{analysis.etymology.cultural_variations}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Definitions */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl">Definitions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-white/90 font-semibold mb-2">Primary Definition</h4>
                  <p className="text-white/80">{analysis.definitions.primary}</p>
                </div>
                
                {analysis.definitions.standard.length > 0 && (
                  <div>
                    <h4 className="text-white/90 font-semibold mb-2">Standard Definitions</h4>
                    <ul className="space-y-1">
                      {analysis.definitions.standard.map((def, index) => (
                        <li key={index} className="text-white/80">• {def}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.definitions.extended.length > 0 && (
                  <div>
                    <h4 className="text-white/90 font-semibold mb-2">Extended Definitions</h4>
                    <ul className="space-y-1">
                      {analysis.definitions.extended.map((def, index) => (
                        <li key={index} className="text-white/80">• {def}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Word Forms */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl">Word Forms & Inflections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.word_forms.noun_forms && (
                  <div>
                    <h4 className="text-white/90 font-semibold mb-2">Noun Forms</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {analysis.word_forms.noun_forms.singular && (
                        <p className="text-white/80">Singular: {analysis.word_forms.noun_forms.singular}</p>
                      )}
                      {analysis.word_forms.noun_forms.plural && (
                        <p className="text-white/80">Plural: {analysis.word_forms.noun_forms.plural}</p>
                      )}
                    </div>
                  </div>
                )}
                {analysis.word_forms.adverb_form && (
                  <div>
                    <h4 className="text-white/90 font-semibold mb-2">Adverb Form</h4>
                    <p className="text-white/80">{analysis.word_forms.adverb_form}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl">Analysis of the Word</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-white/90 font-semibold mb-2">Parts of Speech</h4>
                  <p className="text-white/80">{analysis.analysis.parts_of_speech}</p>
                </div>
                
                <div>
                  <h4 className="text-white/90 font-semibold mb-2">Contextual Usage</h4>
                  <p className="text-white/80">{analysis.analysis.contextual_usage}</p>
                </div>

                <div>
                  <h4 className="text-white/90 font-semibold mb-2">Synonyms & Antonyms</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/70 text-sm mb-1">Synonyms:</p>
                      <p className="text-white/80">{analysis.analysis.synonyms_antonyms.synonyms.join(", ")}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm mb-1">Antonyms:</p>
                      <p className="text-white/80">{analysis.analysis.synonyms_antonyms.antonyms.join(", ")}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-white/90 font-semibold mb-2">Common Collocations</h4>
                  <p className="text-white/80">{analysis.analysis.common_collocations.join(", ")}</p>
                </div>

                {analysis.analysis.cultural_significance && (
                  <div>
                    <h4 className="text-white/90 font-semibold mb-2">Cultural & Historical Significance</h4>
                    <p className="text-white/80">{analysis.analysis.cultural_significance}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-white/90 font-semibold mb-2">Example</h4>
                  <p className="text-white/80 italic">"{analysis.analysis.example}"</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!analysis && !loading && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-8 text-center">
              <Brain className="h-16 w-16 text-primary/60 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Ready for Deep Analysis</h3>
              <p className="text-white/70 mb-4">
                Enter any word above to get a comprehensive linguistic breakdown powered by Calvern 3.0
              </p>
              <div className="text-white/60 text-sm">
                <p>✓ Morphological Analysis</p>
                <p>✓ Etymology & Historical Origins</p>
                <p>✓ Comprehensive Definitions</p>
                <p>✓ Word Forms & Usage Patterns</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default SimplifiedDeepAnalysis;
