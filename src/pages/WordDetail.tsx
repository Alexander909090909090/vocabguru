
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import MorphemeBreakdown from "@/components/MorphemeBreakdown";
import { ArrowLeft, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWords } from "@/context/WordsContext"; 
import WordHeader from "@/components/WordDetail/WordHeader";
import WordNotFound from "@/components/WordDetail/WordNotFound";
import EnhancedWordContent from "@/components/WordDetail/EnhancedWordContent";
import AIAssistantTab from "@/components/WordDetail/AIAssistantTab";
import { Skeleton } from "@/components/ui/skeleton";
import { Word } from "@/data/words";
import { EnhancedWordProfile } from "@/types/enhancedWordProfile";
import { Breadcrumbs } from "@/components/Navigation/Breadcrumbs";
import { NextSteps } from "@/components/Navigation/NextSteps";
import { QuickActions } from "@/components/Navigation/QuickActions";
import { WordProfileService } from "@/services/wordProfileService";
import { EnhancedWordProfileService } from "@/services/enhancedWordProfileService";
import { DataQualityIndicator } from "@/components/SmartDatabase/DataQualityIndicator";
import { EnrichmentControls } from "@/components/SmartDatabase/EnrichmentControls";
import { UnifiedWordService } from "@/services/unifiedWordService";
import { toast } from "sonner";

const WordDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [word, setWord] = useState<Word | null>(null);
  const [wordProfile, setWordProfile] = useState<EnhancedWordProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { getWord } = useWords();

  useEffect(() => {
    const loadWord = async () => {
      if (!id) {
        setError("No word ID provided");
        setIsLoading(false);
        return;
      }
      
      console.log(`Loading word with ID: ${id}`);
      setIsLoading(true);
      setError(null);
      
      try {
        let dbProfile = null;
        let foundWord = null;
        
        // Check if ID is a UUID (word profile ID) or word name
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        
        if (isUUID) {
          console.log(`Searching by UUID: ${id}`);
          // Try to get by UUID from unified service
          const unifiedWord = await UnifiedWordService.getWordById(id);
          if (unifiedWord) {
            console.log(`Found unified word by ID:`, unifiedWord);
            dbProfile = await EnhancedWordProfileService.getEnhancedWordProfile(id);
          }
        } else {
          console.log(`Searching by word name: ${id}`);
          // Try to find by word name in database first
          const unifiedWord = await UnifiedWordService.getWordByName(id);
          if (unifiedWord) {
            console.log(`Found unified word by name:`, unifiedWord);
            dbProfile = await EnhancedWordProfileService.getEnhancedWordProfile(unifiedWord.id);
          }
        }

        if (dbProfile) {
          console.log(`Setting word profile:`, dbProfile);
          setWordProfile(dbProfile);
          // Convert to legacy Word format for compatibility
          const legacyWord: Word = {
            id: dbProfile.id,
            word: dbProfile.word,
            pronunciation: dbProfile.pronunciation,
            partOfSpeech: dbProfile.partOfSpeech || 'unknown',
            languageOrigin: dbProfile.languageOrigin || 'Unknown',
            description: dbProfile.description || '',
            featured: dbProfile.featured || false,
            morphemeBreakdown: dbProfile.morpheme_breakdown,
            etymology: {
              origin: dbProfile.etymology?.historical_origins || '',
              evolution: dbProfile.etymology?.word_evolution || '',
              culturalVariations: dbProfile.etymology?.cultural_regional_variations || ''
            },
            definitions: [
              { type: 'primary', text: dbProfile.definitions?.primary || '' },
              ...(dbProfile.definitions?.standard?.map(def => ({ type: 'standard' as const, text: def })) || [])
            ],
            synonymsAntonyms: dbProfile.synonymsAntonyms || { synonyms: [], antonyms: [] },
            usage: dbProfile.usage || {
              commonCollocations: [],
              contextualUsage: '',
              sentenceStructure: '',
              exampleSentence: ''
            },
            forms: dbProfile.forms || {},
            images: dbProfile.images || []
          };
          setWord(legacyWord);
          console.log(`Set legacy word:`, legacyWord);
        } else {
          console.log(`No database profile found, trying legacy data`);
          // Fallback to legacy word data
          const foundWord = getWord(id);
          if (foundWord) {
            console.log(`Found legacy word:`, foundWord);
            const completeWord: Word = {
              ...foundWord,
              languageOrigin: foundWord.languageOrigin || 'Unknown'
            };
            setWord(completeWord);
            setWordProfile(EnhancedWordProfileService.convertLegacyWord(completeWord));
          } else {
            console.log(`No word found with ID: ${id}`);
            setError(`Word not found: ${id}`);
          }
        }
      } catch (error) {
        console.error("Error loading word:", error);
        setError(`Failed to load word: ${error instanceof Error ? error.message : 'Unknown error'}`);
        toast.error("Failed to load word data");
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      }
    };

    loadWord();
  }, [id, getWord]);

  const handleDeepAnalysis = () => {
    if (word) {
      navigate(`/deep-analysis/${encodeURIComponent(word.word)}`);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <main className="page-container pt-24 page-transition">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Error Loading Word</h1>
            <p className="text-white/70 mb-4">{error}</p>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Words
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!isLoading && !word) {
    return <WordNotFound />;
  }

  const getGradient = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue1 = hash % 360;
    const hue2 = (hash * 7) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 80%, 70%), hsl(${hue2}, 80%, 60%))`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <main className="page-container pt-24 page-transition">
        <Breadcrumbs />
        
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="group text-white/80 hover:text-white hover:bg-white/10" 
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Words
          </Button>

          {word && (
            <Button 
              onClick={handleDeepAnalysis}
              className="bg-primary/20 border-primary/30 text-primary hover:bg-primary/30"
              variant="outline"
            >
              <Brain className="h-4 w-4 mr-2" />
              Deep Analysis
            </Button>
          )}
        </div>
        
        {isLoading ? (
          <>
            <div className="rounded-xl p-6 mb-8 bg-white/10 backdrop-blur-md animate-pulse">
              <div className="h-8 w-32 bg-white/20 rounded mb-4"></div>
              <div className="h-12 w-64 bg-white/20 rounded mb-2"></div>
              <div className="h-6 w-48 bg-white/20 rounded mb-6"></div>
              <div className="h-4 w-full bg-white/20 rounded"></div>
            </div>
            
            <div className="mb-8">
              <Skeleton className="h-40 w-full bg-white/10" />
            </div>
            
            <div className="mb-8">
              <Skeleton className="h-10 w-full mb-4 bg-white/10" />
              <Skeleton className="h-64 w-full bg-white/10" />
            </div>
          </>
        ) : word ? (
          <>
            <WordHeader 
              word={word} 
              getGradient={getGradient} 
              isLoading={isLoading} 
            />
            
            {/* Quality and Enrichment Controls */}
            {wordProfile && (
              <div className="mb-6 grid md:grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Data Quality</h3>
                  <DataQualityIndicator wordProfileId={wordProfile.id} showDetails={true} />
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">AI Enhancement</h3>
                  <EnrichmentControls wordProfileId={wordProfile.id} />
                </div>
              </div>
            )}
            
            <MorphemeBreakdown breakdown={word.morphemeBreakdown} />
            
            <div className="mt-8">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-md border-white/20">
                  <TabsTrigger value="details" className="text-white data-[state=active]:bg-primary data-[state=active]:text-white">
                    Word Analysis
                  </TabsTrigger>
                  <TabsTrigger value="ai-assist" className="text-white data-[state=active]:bg-primary data-[state=active]:text-white">
                    AI Assistant
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details">
                  {wordProfile && <EnhancedWordContent wordProfile={wordProfile} />}
                </TabsContent>
                
                <TabsContent value="ai-assist">
                  <AIAssistantTab word={word} />
                </TabsContent>
              </Tabs>
            </div>
            
            {word && (
              <div className="mt-8">
                <NextSteps 
                  context="word-detail" 
                  data={{ wordId: word.id }}
                />
              </div>
            )}
          </>
        ) : null}
      </main>
      
      <QuickActions currentPage="word-detail" />
      
      <footer className="border-t border-white/10 mt-12 py-6 bg-black/20 backdrop-blur-md">
        <div className="container-inner text-center text-sm text-white/60">
          <p>© 2024 VocabGuru. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default WordDetail;
