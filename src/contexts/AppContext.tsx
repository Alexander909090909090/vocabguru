
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  learnedWords: string[];
  markWordAsLearned: (wordId: string) => void;
  isWordLearned: (wordId: string) => boolean;
  getLearnedWordsCount: () => number;
  totalWordsCount: number;
  setTotalWordsCount: (count: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize theme from localStorage or default to light
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('vocabguru-theme');
    return (savedTheme === 'dark' ? 'dark' : 'light') as Theme;
  });

  // Initialize learned words from localStorage
  const [learnedWords, setLearnedWords] = useState<string[]>(() => {
    const savedWords = localStorage.getItem('vocabguru-learned-words');
    return savedWords ? JSON.parse(savedWords) : [];
  });

  // Track total words count for progress calculation
  const [totalWordsCount, setTotalWordsCount] = useState<number>(0);

  // Effect to update DOM with theme class
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Save theme preference to localStorage
    localStorage.setItem('vocabguru-theme', theme);
  }, [theme]);

  // Effect to save learned words to localStorage
  useEffect(() => {
    localStorage.setItem('vocabguru-learned-words', JSON.stringify(learnedWords));
  }, [learnedWords]);

  // Toggle between light and dark theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Mark a word as learned
  const markWordAsLearned = (wordId: string) => {
    setLearnedWords(prev => {
      if (prev.includes(wordId)) {
        return prev.filter(id => id !== wordId);
      } else {
        return [...prev, wordId];
      }
    });
  };

  // Check if a word is learned
  const isWordLearned = (wordId: string): boolean => {
    return learnedWords.includes(wordId);
  };

  // Get count of learned words
  const getLearnedWordsCount = (): number => {
    return learnedWords.length;
  };

  return (
    <AppContext.Provider 
      value={{ 
        theme, 
        toggleTheme, 
        learnedWords, 
        markWordAsLearned, 
        isWordLearned,
        getLearnedWordsCount,
        totalWordsCount,
        setTotalWordsCount
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
};
