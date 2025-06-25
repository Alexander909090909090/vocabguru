
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Brain, Search, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Calvern3Service } from "@/utils/calvern3Integration";
import { DictionaryApiService } from "@/services/dictionaryApiService";
import Header from "@/components/Header";

export function SimplifiedDeepAnalysis() {
  const navigate = useNavigate();
  const [searchWord, setSearchWord] = useState('');
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!searchWord.trim()) {
      toast.error('Please enter a word to analyze');
      return;
    }

    setLoading(true);
    console.log(`Starting comprehensive analysis for: "${searchWord}"`);
    
    try {
      // Get comprehensive breakdown from Calvern 3.0
      const comprehensiveBreakdown = await Calvern3Service.getComprehensiveBreakdown(searchWord.trim());
      setAnalysis(comprehensiveBreakdown);
      
      // Try to store word data in the background
      try {
        await DictionaryApiService.fetchAndStoreWord(searchWord.trim());
        console.log(`Word "${searchWord}" stored in database successfully`);
      } catch (dbError) {
        console.warn('Failed to store word in database:', dbError);
        // Don't show error to user as the analysis still worked
      }
      
      toast.success(`Comprehensive analysis complete for "${searchWord}"`);
    } catch (error) {
      console.error('Error analyzing word:', error);
      
      // Fallback to local analysis
      try {
        const fallbackAnalysis = Calvern3Service.createFallbackBreakdown(searchWord);
        setAnalysis(fallbackAnalysis);
        toast.error('Using fallback analysis - Calvern 3.0 unavailable');
      } catch (fallbackError) {
        toast.error('Failed to analyze word. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleAnalyze();
    }
  };

  // Function to render markdown-like content as HTML
  const renderAnalysis = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold text-white mb-4">{line.slice(2)}</h1>;
        } else if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-semibold text-white mb-3 mt-6">{line.slice(3)}</h2>;
        } else if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-semibold text-white mb-2 mt-4">{line.slice(4)}</h3>;
        } else if (line.startsWith('* **') && line.includes(':**')) {
          const [label, ...rest] = line.slice(4).split(':**');
          const content = rest.join(':**');
          return (
            <div key={index} className="mb-3">
              <span className="font-semibold text-blue-200">{label}:</span>
              <span className="text-white/80 ml-2">{content}</span>
            </div>
          );
        } else if (line.startsWith('* ')) {
          return <li key={index} className="text-white/80 mb-1 ml-4">{line.slice(2)}</li>;
        } else if (line.startsWith('---')) {
          return <hr key={index} className="border-white/20 my-6" />;
        } else if (line.trim() === '') {
          return <br key={index} />;
        } else {
          return <p key={index} className="text-white/80 mb-2">{line}</p>;
        }
      });
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
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-8">
              <div className="prose prose-invert max-w-none">
                {renderAnalysis(analysis)}
              </div>
            </CardContent>
          </Card>
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
