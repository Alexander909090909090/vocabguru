
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
import { WordSeedingService } from "@/services/wordSeedingService";

interface DictionarySearchProps {
  onWordAdded?: () => void;
  useMerriamWebster?: boolean;
}

export function DictionarySearch({ onWordAdded, useMerriamWebster = false }: DictionarySearchProps) {
  const [searchWord, setSearchWord] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [recents, setRecents] = useState<string[]>(() => {
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

  const initializeDatabase = async () => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    try {
      console.log('Initializing database with essential words...');
      toast({
        title: "Initializing Vocabulary Database",
        description: "Adding essential words to get you started...",
      });
      
      await WordSeedingService.initializeIfEmpty();
      
      toast({
        title: "Database Initialized",
        description: "Essential vocabulary words have been added to your database.",
      });
    } catch (error) {
      console.error('Failed to initialize database:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize the vocabulary database. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
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
      console.log(`=== Starting search for: "${normalizedWord}" ===`);
      
      // First, check if the word exists in our repository
      let wordEntry = await WordRepositoryService.getWordByName(normalizedWord);
      
      if (!wordEntry) {
        console.log(`Word "${normalizedWord}" not found in repository, fetching from API...`);
        
        const success = await DictionaryApiService.fetchAndStoreWord(normalizedWord);
        
        if (success) {
          // Try to get the word again after storing
          wordEntry = await WordRepositoryService.getWordByName(normalizedWord);
          
          if (wordEntry) {
            toast({
              title: "Word found and added!",
              description: `"${normalizedWord}" has been added to the vocabulary database.`,
            });
          }
        } else {
          toast({
            title: "Word not found",
            description: "This word couldn't be found in our dictionary sources. Try a different word or check the spelling.",
            variant: "destructive",
          });
          setIsSearching(false);
          return;
        }
      } else {
        console.log(`Word "${normalizedWord}" found in repository`);
      }
      
      if (wordEntry) {
        // Convert repository entry to Word format for existing context
        const contextWord = {
          id: wordEntry.id,
          word: wordEntry.word,
          description: wordEntry.definitions.primary || "No description available",
          pronunciation: wordEntry.phonetic || "",
          partOfSpeech: wordEntry.analysis.parts_of_speech || "unknown",
          languageOrigin: wordEntry.etymology.language_of_origin || "Unknown",
          featured: false,
          definitions: [
            {
              type: "primary" as const,
              text: wordEntry.definitions.primary || "No definition available"
            },
            ...(wordEntry.definitions.standard || []).map((def: string, index: number) => ({
              type: "standard" as const,
              text: def
            }))
          ],
          morphemeBreakdown: {
            prefix: wordEntry.morpheme_breakdown.prefix || undefined,
            root: wordEntry.morpheme_breakdown.root,
            suffix: wordEntry.morpheme_breakdown.suffix || undefined
          },
          etymology: {
            origin: wordEntry.etymology.historical_origins || "",
            evolution: wordEntry.etymology.word_evolution || "",
            culturalVariations: wordEntry.etymology.cultural_variations || ""
          },
          forms: {
            noun: wordEntry.word_forms.noun_forms?.singular,
            verb: wordEntry.word_forms.base_form,
            adjective: wordEntry.word_forms.adjective_forms?.positive,
            adverb: wordEntry.word_forms.adverb_form
          },
          usage: {
            contextualUsage: wordEntry.analysis.example_sentence || "",
            commonCollocations: wordEntry.analysis.collocations || [],
            exampleSentence: wordEntry.analysis.usage_examples?.[0] || ""
          },
          synonymsAntonyms: {
            synonyms: wordEntry.analysis.synonyms || [],
            antonyms: wordEntry.analysis.antonyms || []
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
        
        console.log(`=== Successfully processed search for: "${normalizedWord}" ===`);
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
          disabled={isSearching || isInitializing}
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Button 
          type="submit" 
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10"
          disabled={isSearching || isInitializing}
        >
          {isSearching ? (
            <span className="flex items-center">
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Searching
            </span>
          ) : "Search"}
        </Button>
      </form>

      {/* Initialize Database Button */}
      <div className="flex justify-center">
        <Button 
          onClick={initializeDatabase}
          disabled={isInitializing || isSearching}
          variant="outline"
          size="sm"
        >
          {isInitializing ? (
            <span className="flex items-center">
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Initializing Database
            </span>
          ) : "Initialize Database with Essential Words"}
        </Button>
      </div>
      
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
                disabled={isSearching || isInitializing}
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
