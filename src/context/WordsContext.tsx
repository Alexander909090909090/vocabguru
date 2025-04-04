import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import originalWords, { Word } from "@/data/words";
import { isNonsenseWord, hasMinimumWordDetails } from "@/utils/wordValidation";
import { toast } from "@/components/ui/use-toast";
import { prepareWordForRepository } from "@/utils/wordDataCleaner";

interface WordsContextType {
  words: Word[];
  addWord: (word: Partial<Word>) => void;
  getWord: (id: string) => Word | undefined;
  allWords: Word[];
  dictionaryWords: Word[];
  removeWord: (id: string) => void;
  refreshWordData: (id: string) => Promise<boolean>;
}

const WordsContext = createContext<WordsContextType | undefined>(undefined);

export function WordsProvider({ children }: { children: ReactNode }) {
  // Combine original words with dictionary words
  const [dictionaryWords, setDictionaryWords] = useState<Word[]>([]);
  
  // Load dictionary words from localStorage on component mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vocabguru-dictionary-words");
      if (saved) {
        const parsedWords = JSON.parse(saved);
        
        // Filter out any potentially corrupted/nonsense entries
        const validWords = parsedWords.filter((word: Word) => {
          const isValid = word && 
                         word.id && 
                         word.word && 
                         !isNonsenseWord(word.word) &&
                         hasMinimumWordDetails(word.description);
          return isValid;
        });
        
        // If some words were filtered out, save the cleaned version
        if (validWords.length !== parsedWords.length) {
          localStorage.setItem("vocabguru-dictionary-words", JSON.stringify(validWords));
          toast({
            title: "Library cleaned",
            description: `Removed ${parsedWords.length - validWords.length} invalid word entries from your library.`,
          });
        }
        
        setDictionaryWords(validWords);
      }
    } catch (error) {
      console.error("Error loading dictionary words from localStorage:", error);
      // In case of corruption, reset
      setDictionaryWords([]);
    }
  }, []);
  
  // Save dictionary words to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem("vocabguru-dictionary-words", JSON.stringify(dictionaryWords));
    } catch (error) {
      console.error("Error saving dictionary words to localStorage:", error);
    }
  }, [dictionaryWords]);
  
  // Combine original words with dictionary words
  const allWords = [...originalWords, ...dictionaryWords];
  
  const addWord = (word: Partial<Word>) => {
    try {
      // Clean and standardize the word data
      const cleanedWord = prepareWordForRepository(word);
      
      // Check if word already exists (either in original or dictionary words)
      const exists = allWords.some(w => w.id === cleanedWord.id);
      
      if (!exists) {
        setDictionaryWords(prev => [cleanedWord, ...prev]);
        
        // Confirm word was added
        console.log(`Added word: ${cleanedWord.word} to dictionary collection`);
        toast({
          title: "Word added",
          description: `"${cleanedWord.word}" has been added to your collection.`,
        });
      } else {
        console.log(`Word ${cleanedWord.word} already exists in the collection`);
        toast({
          title: "Word already exists",
          description: `"${cleanedWord.word}" is already in your collection.`,
        });
      }
    } catch (error) {
      console.error("Error adding word:", error);
      toast({
        title: "Error adding word",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  const getWord = (id: string) => {
    return allWords.find(w => w.id === id);
  };
  
  const removeWord = (id: string) => {
    // Only allow removing words from the dictionary collection (not built-in words)
    const wordExists = dictionaryWords.some(w => w.id === id);
    
    if (wordExists) {
      setDictionaryWords(prev => prev.filter(w => w.id !== id));
      toast({
        title: "Word removed",
        description: "The word has been removed from your collection.",
      });
    } else if (originalWords.some(w => w.id === id)) {
      toast({
        title: "Cannot remove",
        description: "Built-in words cannot be removed from the collection.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Word not found",
        description: "The word you're trying to remove wasn't found in your collection.",
        variant: "destructive",
      });
    }
  };
  
  // Function to refresh word data from the API
  const refreshWordData = async (id: string): Promise<boolean> => {
    const word = getWord(id);
    if (!word) return false;
    
    try {
      // Import dynamically to avoid circular dependencies
      const { searchDictionaryWord } = await import("@/lib/dictionaryApi");
      
      const refreshedWord = await searchDictionaryWord(word.word);
      if (refreshedWord) {
        // Clean and standardize the refreshed word data
        const cleanedWord = prepareWordForRepository({
          ...refreshedWord,
          id // Preserve the original ID
        });
        
        // If it's a dictionary word, update it
        if (dictionaryWords.some(w => w.id === id)) {
          setDictionaryWords(prev => prev.map(w => 
            w.id === id ? cleanedWord : w
          ));
          
          toast({
            title: "Word updated",
            description: `"${word.word}" has been refreshed with the latest data.`,
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error refreshing word:", error);
      return false;
    }
  };
  
  return (
    <WordsContext.Provider value={{ 
      words: allWords,
      addWord,
      getWord,
      allWords,
      dictionaryWords,
      removeWord,
      refreshWordData
    }}>
      {children}
    </WordsContext.Provider>
  );
}

export const useWords = () => {
  const context = useContext(WordsContext);
  if (context === undefined) {
    throw new Error("useWords must be used within a WordsProvider");
  }
  return context;
};
