
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import MorphemeBreakdown from "@/components/MorphemeBreakdown";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWords } from "@/context/WordsContext"; 
import WordHeader from "@/components/WordDetail/WordHeader";
import WordNotFound from "@/components/WordDetail/WordNotFound";
import EnhancedWordContent from "@/components/WordDetail/EnhancedWordContent";
import AIAssistantTab from "@/components/WordDetail/AIAssistantTab";
import { Skeleton } from "@/components/ui/skeleton";
import { UnifiedWordService } from "@/services/unifiedWordService";
import { EnhancedWordProfile } from "@/types/enhancedWordProfile";

const WordDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [enhancedWordProfile, setEnhancedWordProfile] = useState<EnhancedWordProfile | null>(null);
  const { getWord } = useWords();
  
  // Get word data from context for fallback
  const legacyWord = id ? getWord(id) : undefined;

  useEffect(() => {
    const loadWordProfile = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      try {
        // Try to get enhanced word profile from unified service first
        let profile = await UnifiedWordService.getWordById(id);
        
        // Fallback to legacy word conversion if needed
        if (!profile && legacyWord) {
          // Convert legacy word to enhanced profile format
          profile = {
            id: legacyWord.id,
            word: legacyWord.word,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            pronunciation: legacyWord.pronunciation,
            partOfSpeech: legacyWord.partOfSpeech,
            languageOrigin: legacyWord.languageOrigin || 'Unknown', // Ensure required property
            description: legacyWord.description,
            featured: legacyWord.featured,
            morpheme_breakdown: legacyWord.morphemeBreakdown,
            morphemeBreakdown: legacyWord.morphemeBreakdown,
            etymology: {
              historical_origins: legacyWord.etymology?.origin,
              language_of_origin: legacyWord.languageOrigin || 'Unknown',
              word_evolution: legacyWord.etymology?.evolution,
              cultural_regional_variations: legacyWord.etymology?.culturalVariations,
              origin: legacyWord.etymology?.origin,
              evolution: legacyWord.etymology?.evolution,
              culturalVariations: legacyWord.etymology?.culturalVariations
            },
            definitions: {
              primary: legacyWord.description,
              standard: [],
              extended: [],
              contextual: [],
              specialized: []
            },
            word_forms: {
              base_form: legacyWord.word,
              other_inflections: []
            },
            analysis: {
              parts_of_speech: legacyWord.partOfSpeech,
              example: legacyWord.usage?.exampleSentence
            },
            images: legacyWord.images || [],
            synonymsAntonyms: legacyWord.synonymsAntonyms || { synonyms: [], antonyms: [] },
            usage: legacyWord.usage || {
              commonCollocations: [],
              contextualUsage: '',
              sentenceStructure: '',
              exampleSentence: ''
            },
            forms: legacyWord.forms || {}
          };
        }
        
        setEnhancedWordProfile(profile);
      } catch (error) {
        console.error("Error loading word profile:", error);
        
        // Final fallback to legacy word with required properties
        if (legacyWord) {
          const profile: EnhancedWordProfile = {
            id: legacyWord.id,
            word: legacyWord.word,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            pronunciation: legacyWord.pronunciation,
            partOfSpeech: legacyWord.partOfSpeech,
            languageOrigin: legacyWord.languageOrigin || 'Unknown', // Ensure required property
            description: legacyWord.description,
            featured: legacyWord.featured,
            morpheme_breakdown: legacyWord.morphemeBreakdown,
            morphemeBreakdown: legacyWord.morphemeBreakdown,
            etymology: {
              historical_origins: legacyWord.etymology?.origin,
              language_of_origin: legacyWord.languageOrigin || 'Unknown',
              word_evolution: legacyWord.etymology?.evolution,
              cultural_regional_variations: legacyWord.etymology?.culturalVariations,
              origin: legacyWord.etymology?.origin,
              evolution: legacyWord.etymology?.evolution,
              culturalVariations: legacyWord.etymology?.culturalVariations
            },
            definitions: {
              primary: legacyWord.description,
              standard: [],
              extended: [],
              contextual: [],
              specialized: []
            },
            word_forms: {
              base_form: legacyWord.word,
              other_inflections: []
            },
            analysis: {
              parts_of_speech: legacyWord.partOfSpeech,
              example: legacyWord.usage?.exampleSentence
            },
            images: legacyWord.images || [],
            synonymsAntonyms: legacyWord.synonymsAntonyms || { synonyms: [], antonyms: [] },
            usage: legacyWord.usage || {
              commonCollocations: [],
              contextualUsage: '',
              sentenceStructure: '',
              exampleSentence: ''
            },
            forms: legacyWord.forms || {}
          };
          setEnhancedWordProfile(profile);
        }
      } finally {
        // Simulate loading for smooth transitions
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
      }
    };

    loadWordProfile();
  }, [id, legacyWord]);

  // Handle word not found
  if (!isLoading && !enhancedWordProfile) {
    return <WordNotFound />;
  }

  // Create color gradient based on word id for consistent colors
  const getGradient = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue1 = hash % 360;
    const hue2 = (hash * 7) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 80%, 70%), hsl(${hue2}, 80%, 60%))`;
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
        
        {isLoading ? (
          <>
            {/* Loading skeleton for word header */}
            <div className="rounded-xl p-6 mb-8 bg-secondary/50 animate-pulse">
              <div className="h-8 w-32 bg-white/20 rounded mb-4"></div>
              <div className="h-12 w-64 bg-white/20 rounded mb-2"></div>
              <div className="h-6 w-48 bg-white/20 rounded mb-6"></div>
              <div className="h-4 w-full bg-white/20 rounded"></div>
            </div>
            
            <div className="mb-8">
              <Skeleton className="h-40 w-full" />
            </div>
            
            <div className="mb-8">
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-64 w-full" />
            </div>
          </>
        ) : enhancedWordProfile ? (
          <>
            {/* Word Header */}
            <WordHeader 
              word={enhancedWordProfile} 
              getGradient={getGradient} 
              isLoading={isLoading} 
            />
            
            {/* Morpheme Breakdown */}
            <MorphemeBreakdown breakdown={enhancedWordProfile.morpheme_breakdown} />
            
            {/* Main Word Content */}
            <div className="mt-8">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Word Analysis</TabsTrigger>
                  <TabsTrigger value="ai-assist">AI Assistant</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details">
                  <EnhancedWordContent wordProfile={enhancedWordProfile} />
                </TabsContent>
                
                <TabsContent value="ai-assist">
                  <AIAssistantTab word={enhancedWordProfile} />
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : null}
      </main>
      
      <footer className="border-t border-white/10 mt-12 py-6">
        <div className="container-inner text-center text-sm text-muted-foreground">
          <p>© 2024 VocabGuru. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default WordDetail;
