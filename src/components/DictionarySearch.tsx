
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchDictionaryWord } from "@/lib/dictionaryApi";
import { searchMerriamWebsterWord } from "@/lib/merriamWebsterApi";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useWords } from "@/context/WordsContext";
import { isNonsenseWord, hasMinimumWordDetails } from "@/utils/wordValidation";

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
    
    // Check if word already exists
    const existingWord = getWord(normalizedWord);
    
    if (existingWord) {
      // Word exists, navigate directly to it
      navigate(`/word/${existingWord.id}`);
      setSearchWord("");
      saveRecent(normalizedWord);
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Use Merriam-Webster API if specified, otherwise use the default dictionary API
      const word = useMerriamWebster 
        ? await searchMerriamWebsterWord(normalizedWord)
        : await searchDictionaryWord(normalizedWord);
      
      if (word) {
        // Check if the definition is substantial enough
        if (!hasMinimumWordDetails(word.description)) {
          toast({
            title: "Limited information",
            description: "This word doesn't have enough detailed information to add to your collection.",
            variant: "destructive",
          });
          setIsSearching(false);
          return;
        }
        
        // Add word to context
        addWord(word);
        
        // Save to recent searches
        saveRecent(normalizedWord);
        
        // Navigate to the word detail page
        navigate(`/word/${word.id}`);
        
        // Call the callback if provided
        if (onWordAdded) {
          onWordAdded();
        }
        
        toast({
          title: "Word found!",
          description: `"${word.word}" has been added to your vocabulary.`,
        });
        
        // Reset search
        setSearchWord("");
      } else {
        // Handle case when no word is returned
        toast({
          title: "Word not found",
          description: "Sorry, we couldn't find that word in our dictionary.",
          variant: "destructive",
        });
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
          placeholder={`Search any word in the ${useMerriamWebster ? "Merriam-Webster" : ""} dictionary...`}
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
