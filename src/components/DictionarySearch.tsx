
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useWords } from "@/context/WordsContext";
import { isNonsenseWord, hasMinimumWordDetails } from "@/utils/wordValidation";
import { WordRepositoryService } from "@/services/wordRepositoryService";
import { DictionaryApiService } from "@/services/dictionaryApiService";

interface DictionarySearchProps {
  onWordAdded?: () => void;
  useMerriamWebster?: boolean;
}

export function DictionarySearch({ onWordAdded, useMerriamWebster = false }: DictionarySearchProps) {
  const [searchWord, setSearchWord] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recents, setRecents] = useState<string[]>(() => {
    // Load recent searches from localStorage
    try {
      const saved = localStorage.getItem("vocabguru-recent-searches");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const navigate = useNavigate();
  const { addWord, getWord } = useWords();

  const saveRecent = (word: string) => {
    const updatedRecents = [word, ...recents.filter(w => w !== word)].slice(0, 5);
    setRecents(updatedRecents);
    try {
      localStorage.setItem("vocabguru-recent-searches", JSON.stringify(updatedRecents));
    } catch (e) {
      console.error("Failed to save recent searches", e);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchWord.trim()) {
      toast({
        title: "Please enter a word",
        description: "Type a word to search in the dictionary",
        variant: "destructive",
      });
      return;
    }
    
    const normalizedWord = searchWord.trim().toLowerCase();
    
    // Check if the word looks like a nonsense entry
    if (isNonsenseWord(normalizedWord)) {
      toast({
        title: "Invalid word",
        description: "This doesn't appear to be a valid word. Please try a different search.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    
    try {
      // First, check if the word exists in our repository
      let wordEntry = await WordRepositoryService.getWordByName(normalizedWord);
      
      if (!wordEntry) {
        // Word doesn't exist in our repository, fetch from external API
        console.log(`Word "${normalizedWord}" not found in repository, fetching from API...`);
        
        const success = await DictionaryApiService.fetchAndStoreWord(normalizedWord);
        
        if (success) {
          // Try to get the word again after storing
          wordEntry = await WordRepositoryService.getWordByName(normalizedWord);
          
          if (wordEntry) {
            toast({
              title: "Word found and added!",
              description: `"${normalizedWord}" has been added to the repository.`,
            });
          }
        } else {
          toast({
            title: "Word not found",
            description: "Sorry, we couldn't find that word in our dictionary.",
            variant: "destructive",
          });
          setIsSearching(false);
          return;
        }
      }
      
      if (wordEntry) {
        // Convert repository entry to Word format for existing context
        const contextWord = {
          id: wordEntry.id,
          word: wordEntry.word,
          description: wordEntry.definitions_data.primary || "No description available",
          pronunciation: wordEntry.phonetic || "",
          partOfSpeech: wordEntry.analysis_data.parts_of_speech || "unknown",
          languageOrigin: wordEntry.etymology_data.language_of_origin || "Unknown",
          featured: false,
          definitions: [
            {
              type: "primary" as const,
              text: wordEntry.definitions_data.primary || "No definition available"
            },
            ...(wordEntry.definitions_data.standard || []).map((def: string, index: number) => ({
              type: "standard" as const,
              text: def
            }))
          ],
          morphemeBreakdown: {
            prefix: wordEntry.morpheme_data.prefix || undefined,
            root: wordEntry.morpheme_data.root,
            suffix: wordEntry.morpheme_data.suffix || undefined
          },
          etymology: {
            origin: wordEntry.etymology_data.historical_origins || "",
            evolution: wordEntry.etymology_data.word_evolution || "",
            culturalVariations: wordEntry.etymology_data.cultural_variations || ""
          },
          forms: {
            noun: wordEntry.word_forms_data.noun_forms?.singular,
            verb: wordEntry.word_forms_data.base_form,
            adjective: wordEntry.word_forms_data.adjective_forms?.positive,
            adverb: wordEntry.word_forms_data.adverb_form
          },
          usage: {
            contextualUsage: wordEntry.analysis_data.example_sentence || "",
            commonCollocations: wordEntry.analysis_data.collocations || [],
            exampleSentence: wordEntry.analysis_data.usage_examples?.[0] || ""
          },
          synonymsAntonyms: {
            synonyms: wordEntry.analysis_data.synonyms || [],
            antonyms: wordEntry.analysis_data.antonyms || []
          }
        };
        
        // Add to existing words context for compatibility
        addWord(contextWord);
        
        // Save to recent searches
        saveRecent(normalizedWord);
        
        // Navigate to the word detail page
        navigate(`/word/${wordEntry.id}`);
        
        // Call the callback if provided
        if (onWordAdded) {
          onWordAdded();
        }
        
        // Reset search
        setSearchWord("");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="relative">
        <Input
          type="text"
          placeholder="Search any word in the dictionary..."
          className="w-full bg-secondary/50 border-none h-12 pl-12 focus-visible:ring-primary"
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
          disabled={isSearching}
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Button 
          type="submit" 
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10"
          disabled={isSearching}
        >
          {isSearching ? (
            <span className="flex items-center">
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Searching
            </span>
          ) : "Search"}
        </Button>
      </form>
      
      {recents.length > 0 && (
        <div className="text-sm">
          <p className="text-muted-foreground mb-1">Recent searches:</p>
          <div className="flex flex-wrap gap-2">
            {recents.map(word => (
              <Button 
                key={word} 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => {
                  setSearchWord(word);
                  handleSearch(new Event('submit') as any);
                }}
              >
                {word}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DictionarySearch;
