
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
import { WordRepositoryService, WordRepositoryEntry } from "@/services/wordRepositoryService";

const WordDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [word, setWord] = useState<Word | null>(null);
  const { getWord } = useWords();

  // Convert WordRepositoryEntry to Word
  const convertRepositoryEntryToWord = (entry: WordRepositoryEntry): Word => {
    return {
      id: entry.id,
      word: entry.word,
      pronunciation: entry.phonetic,
      description: entry.definitions.primary || 'No description available',
      languageOrigin: entry.etymology.language_of_origin || 'Unknown',
      partOfSpeech: entry.analysis.parts_of_speech || 'unknown',
      morphemeBreakdown: entry.morpheme_breakdown,
      etymology: {
        origin: entry.etymology.historical_origins || 'Unknown origin',
        evolution: entry.etymology.word_evolution || 'Evolution not available',
        culturalVariations: entry.etymology.cultural_variations
      },
      definitions: [
        ...(entry.definitions.primary ? [{ type: 'primary' as const, text: entry.definitions.primary }] : []),
        ...(entry.definitions.standard?.map(def => ({ type: 'standard' as const, text: def })) || []),
        ...(entry.definitions.extended?.map(def => ({ type: 'extended' as const, text: def })) || []),
        ...(entry.definitions.contextual?.map(def => ({ type: 'contextual' as const, text: def })) || [])
      ],
      forms: {
        noun: entry.word_forms.noun_forms?.singular,
        verb: entry.word_forms.verb_tenses?.present,
        adjective: entry.word_forms.adjective_forms?.positive,
        adverb: entry.word_forms.adverb_form
      },
      usage: {
        commonCollocations: entry.analysis.collocations || [],
        contextualUsage: entry.analysis.example_sentence || 'No contextual usage available',
        sentenceStructure: 'Standard sentence structure',
        exampleSentence: entry.analysis.example_sentence || 'No example sentence available'
      },
      synonymsAntonyms: {
        synonyms: entry.analysis.synonyms || [],
        antonyms: entry.analysis.antonyms || []
      },
      images: []
    };
  };

  // Convert Word to EnhancedWordProfile
  const convertToEnhancedProfile = (word: Word): EnhancedWordProfile => {
    return {
      id: word.id,
      word: word.word,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      pronunciation: word.pronunciation,
      partOfSpeech: word.partOfSpeech,
      languageOrigin: word.languageOrigin,
      description: word.description,
      featured: word.featured,
      morpheme_breakdown: word.morphemeBreakdown,
      morphemeBreakdown: word.morphemeBreakdown, // Legacy compatibility
      etymology: {
        historical_origins: word.etymology.origin,
        language_of_origin: word.languageOrigin,
        word_evolution: word.etymology.evolution,
        cultural_regional_variations: word.etymology.culturalVariations,
        origin: word.etymology.origin,
        evolution: word.etymology.evolution,
        culturalVariations: word.etymology.culturalVariations
      },
      definitions: {
        primary: word.definitions.find(d => d.type === 'primary')?.text,
        standard: word.definitions.filter(d => d.type === 'standard').map(d => d.text),
        extended: word.definitions.filter(d => d.type === 'extended').map(d => d.text),
        contextual: word.definitions.filter(d => d.type === 'contextual').map(d => d.text),
        specialized: word.definitions.filter(d => d.type === 'specialized').map(d => d.text)
      },
      word_forms: {
        noun_forms: word.forms.noun ? { singular: word.forms.noun } : undefined,
        verb_tenses: word.forms.verb ? { present: word.forms.verb } : undefined,
        adjective_forms: word.forms.adjective ? { positive: word.forms.adjective } : undefined,
        adverb_form: word.forms.adverb,
        other_inflections: []
      },
      analysis: {
        parts_of_speech: word.partOfSpeech,
        contextual_usage: word.usage.contextualUsage,
        sentence_structure: word.usage.sentenceStructure,
        common_collocations: word.usage.commonCollocations,
        cultural_historical_significance: word.etymology.culturalVariations,
        example: word.usage.exampleSentence
      },
      images: word.images,
      synonymsAntonyms: word.synonymsAntonyms,
      usage: word.usage,
      forms: word.forms
    };
  };

  useEffect(() => {
    const loadWord = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      try {
        // First try to get from context
        const foundWord = getWord(id);
        if (foundWord) {
          const completeWord: Word = {
            ...foundWord,
            languageOrigin: foundWord.languageOrigin || 'Unknown'
          };
          setWord(completeWord);
        } else {
          // Try to get from word repository
          try {
            const repositoryEntry = await WordRepositoryService.getWordByName(id);
            if (repositoryEntry) {
              const convertedWord = convertRepositoryEntryToWord(repositoryEntry);
              setWord(convertedWord);
            }
          } catch (error) {
            console.error("Error loading word from repository:", error);
          }
        }
      } catch (error) {
        console.error("Error loading word:", error);
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
                  <EnhancedWordContent wordProfile={convertToEnhancedProfile(word)} />
                </TabsContent>
                
                <TabsContent value="ai-assist">
                  <AIAssistantTab word={word} />
                </TabsContent>
              </Tabs>
            </div>
            
            {word && (
              <>
                <div className="mt-8">
                  <NextSteps 
                    context="word-detail" 
                    data={{ wordId: word.id }}
                  />
                </div>
              </>
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
