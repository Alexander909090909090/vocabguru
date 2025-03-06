
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchDictionaryWord } from "@/lib/dictionaryApi";
import { searchMerriamWebsterWord } from "@/lib/merriamWebsterApi";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useWords } from "@/context/WordsContext";

interface DictionarySearchProps {
  onWordAdded?: () => void;
  useMerriamWebster?: boolean;
}

export function DictionarySearch({ onWordAdded, useMerriamWebster = false }: DictionarySearchProps) {
  const [searchWord, setSearchWord] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { addWord, getWord } = useWords();

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
    
    // Check if word already exists
    const normalizedWord = searchWord.trim().toLowerCase();
    const existingWord = getWord(normalizedWord);
    
    if (existingWord) {
      // Word exists, navigate directly to it
      navigate(`/word/${existingWord.id}`);
      setSearchWord("");
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Use Merriam-Webster API if specified, otherwise use the default dictionary API
      const word = useMerriamWebster 
        ? await searchMerriamWebsterWord(normalizedWord)
        : await searchDictionaryWord(normalizedWord);
      
      if (word) {
        // Add word to context
        addWord(word);
        
        // Navigate to the word detail page
        navigate(`/word/${word.id}`);
        
        // Call the callback if provided
        if (onWordAdded) {
          onWordAdded();
        }
        
        // Reset search
        setSearchWord("");
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
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
        {isSearching ? "Searching..." : "Search"}
      </Button>
    </form>
  );
}

export default DictionarySearch;
