
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import originalWords, { Word } from "@/data/words";

interface WordsContextType {
  words: Word[];
  addWord: (word: Word) => void;
  getWord: (id: string) => Word | undefined;
  allWords: Word[];
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
        setDictionaryWords(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading dictionary words from localStorage:", error);
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
  
  const addWord = (word: Word) => {
    // Check if word already exists (either in original or dictionary words)
    const exists = allWords.some(w => w.id === word.id);
    
    if (!exists) {
      setDictionaryWords(prev => [word, ...prev]);
    }
  };
  
  const getWord = (id: string) => {
    return allWords.find(w => w.id === id);
  };
  
  return (
    <WordsContext.Provider value={{ 
      words: allWords,
      addWord,
      getWord,
      allWords
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
