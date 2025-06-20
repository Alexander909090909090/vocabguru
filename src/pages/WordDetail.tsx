
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
import WordMainContent from "@/components/WordDetail/WordMainContent";
import AIAssistantTab from "@/components/WordDetail/AIAssistantTab";
import { Skeleton } from "@/components/ui/skeleton";
import { WordRepositoryService, WordRepositoryEntry } from "@/services/wordRepositoryService";
import { toast } from "@/components/ui/use-toast";

const WordDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [repositoryWord, setRepositoryWord] = useState<WordRepositoryEntry | null>(null);
  const { getWord } = useWords();
  
  // Get word data from context (fallback for existing words)
  const contextWord = id ? getWord(id) : undefined;

  useEffect(() => {
    const loadWordData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // First try to get from repository
        const repoWord = await WordRepositoryService.getWordByName(id);
        if (repoWord) {
          setRepositoryWord(repoWord);
        } else {
          // Try to get by ID from repository
          try {
            const repoWordById = await WordRepositoryService.getWordById?.(id);
            if (repoWordById) {
              setRepositoryWord(repoWordById);
            }
          } catch (e) {
            // Fallback to context word if repository doesn't have it
            console.log("Word not found in repository, using context data");
          }
        }
      } catch (error) {
        console.error("Error loading word data:", error);
        toast({
          title: "Error loading word",
          description: "Failed to load word details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadWordData();
  }, [id]);

  // Convert repository entry to Word format for existing components
  const getWordForDisplay = () => {
    if (repositoryWord) {
      return {
        id: repositoryWord.id,
        word: repositoryWord.word,
        description: repositoryWord.definitions_data.primary || "No description available",
        pronunciation: repositoryWord.phonetic || "",
        partOfSpeech: repositoryWord.analysis_data.parts_of_speech || "unknown",
        languageOrigin: repositoryWord.etymology_data.language_of_origin || "Unknown",
        featured: false,
        images: [], // Add missing images property
        definitions: [
          {
            type: "primary" as const,
            text: repositoryWord.definitions_data.primary || "No definition available"
          },
          ...(repositoryWord.definitions_data.standard || []).map((def: string) => ({
            type: "standard" as const,
            text: def
          }))
        ],
        morphemeBreakdown: {
          prefix: repositoryWord.morpheme_data.prefix || undefined,
          root: repositoryWord.morpheme_data.root,
          suffix: repositoryWord.morpheme_data.suffix || undefined
        },
        etymology: {
          origin: repositoryWord.etymology_data.historical_origins || "",
          evolution: repositoryWord.etymology_data.word_evolution || "",
          culturalVariations: repositoryWord.etymology_data.cultural_variations || ""
        },
        forms: {
          noun: repositoryWord.word_forms_data.noun_forms?.singular,
          verb: repositoryWord.word_forms_data.base_form,
          adjective: repositoryWord.word_forms_data.adjective_forms?.positive,
          adverb: repositoryWord.word_forms_data.adverb_form
        },
        usage: {
          contextualUsage: repositoryWord.analysis_data.example_sentence || "",
          commonCollocations: repositoryWord.analysis_data.collocations || [],
          exampleSentence: repositoryWord.analysis_data.usage_examples?.[0] || ""
        },
        synonymsAntonyms: {
          synonyms: repositoryWord.analysis_data.synonyms || [],
          antonyms: repositoryWord.analysis_data.antonyms || []
        }
      };
    }
    return contextWord;
  };

  const word = getWordForDisplay();

  // Handle word not found
  if (!isLoading && !word) {
    return <WordNotFound />;
  }

  // Create color gradient based on word id for consistent colors
  const getGradient = (id: string) => {
    // Simple hash function for the word id
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Use the hash to generate hue values
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
            
            {/* Loading skeleton for morpheme breakdown */}
            <div className="mb-8">
              <Skeleton className="h-40 w-full" />
            </div>
            
            {/* Loading skeleton for tabs */}
            <div className="mb-8">
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-64 w-full" />
            </div>
          </>
        ) : word ? (
          <>
            {/* Word Header */}
            <WordHeader 
              word={word} 
              getGradient={getGradient} 
              isLoading={isLoading} 
            />
            
            {/* Morpheme Breakdown */}
            <MorphemeBreakdown breakdown={word.morphemeBreakdown} />
            
            {/* Main Word Content */}
            <div className="mt-8">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Word Details</TabsTrigger>
                  <TabsTrigger value="ai-assist">AI Assistant</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details">
                  <WordMainContent word={word} />
                </TabsContent>
                
                <TabsContent value="ai-assist">
                  <AIAssistantTab word={word} />
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
