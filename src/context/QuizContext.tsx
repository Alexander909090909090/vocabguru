import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useWords } from "./WordsContext";
import { toast } from "@/components/ui/use-toast";

// Quiz difficulty levels
export type QuizDifficulty = "easy" | "medium" | "hard";

// Question types
export type QuestionType = 
  | "multiple" 
  | "trueFalse" 
  | "matching" 
  | "fillBlank" 
  | "wordBuilder" 
  | "synonymAntonym" 
  | "etymology" 
  | "contextual" 
  | "transformation"
  | "brainTeaser"
  | "randomChallenge"
  | "speedDrill"
  | "mnemonicMaster";

// Achievement types
export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  total?: number;
};

// Quiz question structure
export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswer: string | string[];
  explanation?: string;
  difficulty: QuizDifficulty;
  points: number;
  category: string;
  timeLimit?: number; // in seconds
  hint?: string; // Added hint field
}

// Quiz type for different styles of quizzes
export type QuizType = 
  | "standard" 
  | "wordBuilder" 
  | "synonymAntonym" 
  | "etymology" 
  | "contextual" 
  | "transformation"
  | "brainTeaser"
  | "randomChallenge"
  | "speedDrill"
  | "mnemonicMaster";

// User stats
export interface UserStats {
  totalQuizzesTaken: number;
  totalCorrect: number;
  totalIncorrect: number;
  streakDays: number;
  currentStreak: number; // Added for streak tracking
  lastQuizDate: string | null;
  pointsEarned: number;
  level: number;
  achievements: Achievement[];
  highScores: {
    [quizType: string]: {
      easy: number;
      medium: number;
      hard: number;
    };
  };
}

// Quiz context type
interface QuizContextType {
  currentQuiz: QuizQuestion[] | null;
  currentQuestionIndex: number;
  userAnswers: (string | string[] | null)[];
  userStats: UserStats;
  isQuizActive: boolean;
  showResults: boolean;
  remainingTime: number | null;
  difficulty: QuizDifficulty;
  quizType: QuizType;
  timedMode: boolean;
  hintsRemaining: number;
  currentStreak: number;
  
  // Actions
  startQuiz: (difficulty: QuizDifficulty, quizType: QuizType, categoryFilter?: string, timedMode?: boolean) => void;
  answerQuestion: (answer: string | string[]) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitQuiz: () => void;
  resetQuiz: () => void;
  checkAchievements: () => boolean;
  useHint: () => string | undefined;
  toggleTimedMode: () => void;
}

// Default user stats
const defaultUserStats: UserStats = {
  totalQuizzesTaken: 0,
  totalCorrect: 0,
  totalIncorrect: 0,
  streakDays: 0,
  currentStreak: 0,
  lastQuizDate: null,
  pointsEarned: 0,
  level: 1,
  achievements: [
    {
      id: "first_quiz",
      title: "First Steps",
      description: "Complete your first quiz",
      icon: "award",
      unlocked: false
    },
    {
      id: "perfect_score",
      title: "Perfect Scholar",
      description: "Get a perfect score on any quiz",
      icon: "trophy",
      unlocked: false
    },
    {
      id: "streak_3",
      title: "Dedicated Learner",
      description: "Complete quizzes 3 days in a row",
      icon: "star",
      unlocked: false,
      progress: 0,
      total: 3
    },
    {
      id: "word_master",
      title: "Word Master",
      description: "Learn 50 words",
      icon: "medal",
      unlocked: false,
      progress: 0,
      total: 50
    },
    {
      id: "etymology_expert",
      title: "Etymology Expert",
      description: "Answer 20 questions about word origins correctly",
      icon: "check",
      unlocked: false,
      progress: 0,
      total: 20
    },
    {
      id: "streak_5",
      title: "Streak Master",
      description: "Answer 5 questions correctly in a row",
      icon: "zap",
      unlocked: false,
      progress: 0,
      total: 5
    },
    {
      id: "time_wizard",
      title: "Time Wizard",
      description: "Complete a timed quiz with 90% accuracy",
      icon: "clock",
      unlocked: false
    }
  ],
  highScores: {
    standard: { easy: 0, medium: 0, hard: 0 },
    wordBuilder: { easy: 0, medium: 0, hard: 0 },
    synonymAntonym: { easy: 0, medium: 0, hard: 0 },
    etymology: { easy: 0, medium: 0, hard: 0 },
    contextual: { easy: 0, medium: 0, hard: 0 },
    transformation: { easy: 0, medium: 0, hard: 0 },
    brainTeaser: { easy: 0, medium: 0, hard: 0 },
    randomChallenge: { easy: 0, medium: 0, hard: 0 },
    speedDrill: { easy: 0, medium: 0, hard: 0 },
    mnemonicMaster: { easy: 0, medium: 0, hard: 0 }
  }
};

// Create the context
const QuizContext = createContext<QuizContextType | undefined>(undefined);

// Context provider
export function QuizProvider({ children }: { children: ReactNode }) {
  const { words } = useWords();
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | string[] | null)[]>([]);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("medium");
  const [quizType, setQuizType] = useState<QuizType>("standard");
  const [timedMode, setTimedMode] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [currentStreak, setCurrentStreak] = useState(0);
  
  // Load user stats from localStorage
  const [userStats, setUserStats] = useState<UserStats>(() => {
    const savedStats = localStorage.getItem("vocabguru-quiz-stats");
    if (!savedStats) return defaultUserStats;
    
    try {
      const parsedStats = JSON.parse(savedStats);
      // Ensure we have the new fields for backward compatibility
      return {
        ...defaultUserStats,
        ...parsedStats,
        highScores: parsedStats.highScores || defaultUserStats.highScores,
        currentStreak: parsedStats.currentStreak || 0
      };
    } catch (e) {
      console.error("Error parsing quiz stats:", e);
      return defaultUserStats;
    }
  });
  
  // Save stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("vocabguru-quiz-stats", JSON.stringify(userStats));
  }, [userStats]);
  
  // Check streak logic
  useEffect(() => {
    const checkStreak = () => {
      const today = new Date().toISOString().split('T')[0];
      const lastQuizDate = userStats.lastQuizDate;
      
      if (!lastQuizDate) return;
      
      const lastDate = new Date(lastQuizDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // If user completed a quiz yesterday, increment streak
      if (lastQuizDate === yesterdayStr) {
        updateUserStats({
          ...userStats,
          streakDays: userStats.streakDays + 1,
          lastQuizDate: today
        });
      } 
      // If user skipped a day, reset streak
      else if (lastQuizDate !== today) {
        updateUserStats({
          ...userStats,
          streakDays: 1,
          lastQuizDate: today
        });
      }
    };
    
    checkStreak();
  }, [userStats.lastQuizDate]);
  
  // Timer logic for timed questions
  useEffect(() => {
    let timer: number | undefined;
    
    if (isQuizActive && currentQuiz) {
      const question = currentQuiz[currentQuestionIndex];
      let timeLimit = question.timeLimit || 30;
      
      // If timed mode is enabled, reduce the time available
      if (timedMode) {
        timeLimit = Math.max(10, timeLimit - 5);
      }
      
      setRemainingTime(timeLimit);
      
      timer = window.setInterval(() => {
        setRemainingTime(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            // Auto-submit current answer if time runs out
            nextQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isQuizActive, currentQuestionIndex, currentQuiz, timedMode]);
  
  // Helper to update user stats
  const updateUserStats = (newStats: UserStats) => {
    setUserStats(newStats);
    localStorage.setItem("vocabguru-quiz-stats", JSON.stringify(newStats));
  };
  
  // Calculate level based on points
  const calculateLevel = (points: number) => {
    return Math.floor(points / 100) + 1;
  };
  
  // Generate questions from words based on quiz type
  const generateQuestions = (difficulty: QuizDifficulty, quizType: QuizType, categoryFilter?: string): QuizQuestion[] => {
    // Filter words if category is specified
    let wordsPool = words;
    if (categoryFilter) {
      wordsPool = words.filter(word => {
        if (categoryFilter === "prefix" && word.morphemeBreakdown?.prefix) return true;
        if (categoryFilter === "suffix" && word.morphemeBreakdown?.suffix) return true;
        if (categoryFilter === "root" && word.morphemeBreakdown?.root) return true;
        if (categoryFilter === "origin" && word.languageOrigin) return true;
        return false;
      });
    }
    
    if (wordsPool.length < 4) {
      toast({
        title: "Not enough words",
        description: "Add more words to your collection to take this quiz",
        variant: "destructive"
      });
      return [];
    }
    
    // Shuffle and limit number of words based on difficulty
    const shuffled = [...wordsPool].sort(() => 0.5 - Math.random());
    
    const questionCount = difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 10;
    const selectedWords = shuffled.slice(0, Math.min(questionCount, wordsPool.length));
    
    // Generate different questions based on quiz type
    const questions: QuizQuestion[] = [];
    
    switch (quizType) {
      case "standard":
        // Standard quiz with multiple question types
        selectedWords.forEach((word, index) => {
          // Determine question type based on index to ensure variety
          const questionType: QuestionType = 
            index % 4 === 0 ? "trueFalse" : 
            index % 4 === 1 ? "multiple" : 
            index % 4 === 2 ? "matching" : "fillBlank";
          
          // Get incorrect options from other words
          const otherWords = words.filter(w => w.id !== word.id);
          const incorrectOptions = otherWords
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(w => w.word);
          
          let question: QuizQuestion;
          
          switch (questionType) {
            case "multiple":
              question = {
                id: `q-${word.id}-${index}`,
                type: "multiple",
                question: `What is the definition of "${word.word}"?`,
                options: [word.description, ...incorrectOptions.map(w => {
                  const matchingWord = words.find(word => word.word === w);
                  return matchingWord?.description || "Unknown definition";
                })].sort(() => 0.5 - Math.random()),
                correctAnswer: word.description,
                explanation: `${word.word} - ${word.description}. ${word.languageOrigin ? `It originated from ${word.languageOrigin}.` : ""}`,
                difficulty,
                points: difficulty === "easy" ? 10 : difficulty === "medium" ? 15 : 20,
                category: "definition",
                timeLimit: difficulty === "easy" ? 30 : difficulty === "medium" ? 25 : 20,
                hint: `This word relates to ${word.partOfSpeech === 'noun' ? 'a thing' : word.partOfSpeech === 'verb' ? 'an action' : 'a quality'}`
              };
              break;
              
            case "trueFalse":
              // Randomly decide if we'll show a true or false statement
              const isTrue = Math.random() > 0.5;
              const randomIncorrectWord = incorrectOptions[0];
              const incorrectWordObj = words.find(w => w.word === randomIncorrectWord);
              
              question = {
                id: `q-${word.id}-${index}`,
                type: "trueFalse",
                question: isTrue 
                  ? `True or False: The word "${word.word}" means "${word.description}".`
                  : `True or False: The word "${word.word}" means "${incorrectWordObj?.description || 'something else'}".`,
                options: ["True", "False"],
                correctAnswer: isTrue ? "True" : "False",
                explanation: `The correct definition of ${word.word} is: ${word.description}`,
                difficulty,
                points: difficulty === "easy" ? 5 : difficulty === "medium" ? 10 : 15,
                category: "definition",
                timeLimit: difficulty === "easy" ? 15 : difficulty === "medium" ? 12 : 10,
                hint: isTrue ? "Think about if this definition sounds right for this word." : "Consider whether this definition matches what you know about this word."
              };
              break;
              
            case "matching":
              // Create a matching question for morpheme breakdown
              if (word.morphemeBreakdown && Object.keys(word.morphemeBreakdown).length > 0) {
                const breakdown = word.morphemeBreakdown;
                const components = [];
                
                if (breakdown.prefix) components.push({ type: "prefix", value: breakdown.prefix.text });
                if (breakdown.root) components.push({ type: "root", value: breakdown.root.text });
                if (breakdown.suffix) components.push({ type: "suffix", value: breakdown.suffix.text });
                
                if (components.length > 0) {
                  const randomComponent = components[Math.floor(Math.random() * components.length)];
                  
                  question = {
                    id: `q-${word.id}-${index}`,
                    type: "matching",
                    question: `What is the ${randomComponent.type} in the word "${word.word}"?`,
                    options: [
                      randomComponent.value,
                      ...otherWords
                        .filter(w => 
                          w.morphemeBreakdown && 
                          w.morphemeBreakdown[randomComponent.type as keyof typeof w.morphemeBreakdown]
                        )
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 3)
                        .map(w => {
                          const component = w.morphemeBreakdown[randomComponent.type as keyof typeof w.morphemeBreakdown];
                          return component ? (typeof component === 'string' ? component : component.text) : '';
                        })
                    ].filter(Boolean).sort(() => 0.5 - Math.random()),
                    correctAnswer: randomComponent.value,
                    explanation: `The ${randomComponent.type} in "${word.word}" is "${randomComponent.value}".`,
                    difficulty,
                    points: difficulty === "easy" ? 15 : difficulty === "medium" ? 20 : 25,
                    category: "morpheme",
                    timeLimit: difficulty === "easy" ? 25 : difficulty === "medium" ? 20 : 15,
                    hint: `This ${randomComponent.type} often means "${randomComponent.type === 'prefix' ? 'before' : randomComponent.type === 'suffix' ? 'after' : 'core meaning'}"`
                  };
                  break;
                }
              }
              
              // Fallback to origin question if no morpheme breakdown
              question = {
                id: `q-${word.id}-${index}`,
                type: "matching",
                question: `What is the language origin of the word "${word.word}"?`,
                options: [
                  word.languageOrigin || "Unknown",
                  ...["Latin", "Greek", "French", "Germanic", "Old English", "Sanskrit", "Arabic", "Spanish", "Italian", "Japanese"]
                    .filter(origin => origin !== word.languageOrigin)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3)
                ].filter(Boolean).sort(() => 0.5 - Math.random()),
                correctAnswer: word.languageOrigin || "Unknown",
                explanation: `The word "${word.word}" originated from ${word.languageOrigin || "an unknown origin"}.`,
                difficulty,
                points: difficulty === "easy" ? 10 : difficulty === "medium" ? 15 : 20,
                category: "origin",
                timeLimit: difficulty === "easy" ? 20 : difficulty === "medium" ? 18 : 15,
                hint: `This word has characteristics typical of ${word.languageOrigin || "various"} language patterns.`
              };
              break;
              
            case "fillBlank":
              // Create a fill-in-the-blank using the word in context
              const sentence = `The ${word.partOfSpeech === 'adjective' ? word.word : 'use of the word "' + word.word + '"'} is essential to understanding this concept.`;
              const blankSentence = sentence.replace(word.word, "_____");
              
              question = {
                id: `q-${word.id}-${index}`,
                type: "fillBlank",
                question: `Fill in the blank: ${blankSentence}`,
                options: [word.word, ...incorrectOptions].sort(() => 0.5 - Math.random()),
                correctAnswer: word.word,
                explanation: `The correct word is "${word.word}": ${sentence}`,
                difficulty,
                points: difficulty === "easy" ? 8 : difficulty === "medium" ? 12 : 18,
                category: "usage",
                timeLimit: difficulty === "easy" ? 20 : difficulty === "medium" ? 18 : 15,
                hint: `This word is a ${word.partOfSpeech}.`
              };
              break;
              
            default:
              question = {
                id: `q-${word.id}-${index}`,
                type: "multiple",
                question: `What is the definition of "${word.word}"?`,
                options: [word.description, ...incorrectOptions.map(w => {
                  const matchingWord = words.find(word => word.word === w);
                  return matchingWord?.description || "Unknown definition";
                })].sort(() => 0.5 - Math.random()),
                correctAnswer: word.description,
                explanation: `${word.word} - ${word.description}`,
                difficulty,
                points: difficulty === "easy" ? 10 : difficulty === "medium" ? 15 : 20,
                category: "definition",
                timeLimit: difficulty === "easy" ? 30 : difficulty === "medium" ? 25 : 20,
                hint: `Think about what this word means in everyday usage.`
              };
          }
          
          questions.push(question);
        });
        break;
        
      case "wordBuilder":
        // Quiz focused on building words from prefixes, roots, and suffixes
        selectedWords.forEach((word, index) => {
          if (word.morphemeBreakdown) {
            const { prefix, root, suffix } = word.morphemeBreakdown;
            
            // Only use words with at least one morpheme component
            if (prefix || root || suffix) {
              const parts = [];
              if (prefix) parts.push(prefix.text);
              if (root) parts.push(root.text);
              if (suffix) parts.push(suffix.text);
              
              const options = [...parts];
              // Add some incorrect options
              const morphemeParts = words
                .filter(w => w.id !== word.id && w.morphemeBreakdown)
                .flatMap(w => {
                  const parts = [];
                  if (w.morphemeBreakdown?.prefix) parts.push(w.morphemeBreakdown.prefix.text);
                  if (w.morphemeBreakdown?.root) parts.push(w.morphemeBreakdown.root.text);
                  if (w.morphemeBreakdown?.suffix) parts.push(w.morphemeBreakdown.suffix.text);
                  return parts;
                })
                .filter(Boolean)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);
              
              options.push(...morphemeParts);
              
              const question: QuizQuestion = {
                id: `q-${word.id}-${index}`,
                type: "wordBuilder",
                question: `Build the word "${word.word}" by selecting the correct morphemes`,
                options: options.sort(() => 0.5 - Math.random()),
                correctAnswer: parts,
                explanation: `The word "${word.word}" is built from: ${parts.join(" + ")}`,
                difficulty,
                points: difficulty === "easy" ? 15 : difficulty === "medium" ? 20 : 30,
                category: "morpheme",
                timeLimit: difficulty === "easy" ? 40 : difficulty === "medium" ? 35 : 30,
                hint: `This word has ${parts.length} component parts.`
              };
              
              questions.push(question);
            }
          }
        });
        break;
        
      case "synonymAntonym":
        // Quiz focused on synonym and antonym matching
        selectedWords.forEach((word, index) => {
          if (word.synonymsAntonyms) {
            const { synonyms, antonyms } = word.synonymsAntonyms;
            
            // Only create questions for words with synonyms or antonyms
            if ((synonyms && synonyms.length > 0) || (antonyms && antonyms.length > 0)) {
              const isSynonymQuestion = Math.random() > 0.5 && synonyms && synonyms.length > 0;
              const wordList = isSynonymQuestion ? synonyms : antonyms;
              
              // Only proceed if we have synonyms/antonyms to work with
              if (wordList && wordList.length > 0) {
                const correctAnswer = wordList[0];
                
                // Get incorrect options from other words
                const otherWords = words
                  .filter(w => w.id !== word.id)
                  .sort(() => 0.5 - Math.random())
                  .slice(0, 3)
                  .map(w => w.word);
                
                const question: QuizQuestion = {
                  id: `q-${word.id}-${index}`,
                  type: "synonymAntonym",
                  question: `What is a ${isSynonymQuestion ? 'synonym' : 'antonym'} for "${word.word}"?`,
                  options: [correctAnswer, ...otherWords].sort(() => 0.5 - Math.random()),
                  correctAnswer: correctAnswer,
                  explanation: `"${correctAnswer}" is a ${isSynonymQuestion ? 'synonym' : 'antonym'} for "${word.word}"`,
                  difficulty,
                  points: difficulty === "easy" ? 10 : difficulty === "medium" ? 15 : 25,
                  category: isSynonymQuestion ? "synonym" : "antonym",
                  timeLimit: difficulty === "easy" ? 20 : difficulty === "medium" ? 18 : 15,
                  hint: `Think of a word that means ${isSynonymQuestion ? 'the same as' : 'the opposite of'} "${word.word}".`
                };
                
                questions.push(question);
              }
            }
          }
        });
        break;
        
      case "etymology":
        // Quiz focused on word origins and etymology
        selectedWords.forEach((word, index) => {
          if (word.languageOrigin || word.etymology) {
            // Create a question about word origin
            const originOptions = ["Latin", "Greek", "French", "Germanic", "Old English", "Sanskrit", "Arabic", "Spanish", "Italian", "Japanese"];
            const correctOrigin = word.languageOrigin || "Unknown";
            
            // Filter out the correct answer to avoid duplicates
            const incorrectOrigins = originOptions
              .filter(origin => origin !== correctOrigin)
              .sort(() => 0.5 - Math.random())
              .slice(0, 3);
            
            const question: QuizQuestion = {
              id: `q-${word.id}-${index}`,
              type: "etymology",
              question: `What is the language origin of the word "${word.word}"?`,
              options: [correctOrigin, ...incorrectOrigins].sort(() => 0.5 - Math.random()),
              correctAnswer: correctOrigin,
              explanation: `The word "${word.word}" comes from ${word.languageOrigin || "an unknown origin"}. ${word.etymology || ""}`,
              difficulty,
              points: difficulty === "easy" ? 12 : difficulty === "medium" ? 18 : 25,
              category: "origin",
              timeLimit: difficulty === "easy" ? 25 : difficulty === "medium" ? 20 : 18,
              hint: `This word has characteristics common in ${correctOrigin === "Unknown" ? "various languages" : correctOrigin} vocabulary.`
            };
            
            questions.push(question);
          }
        });
        break;
        
      case "contextual":
        // Quiz focused on using words in context
        selectedWords.forEach((word, index) => {
          if (word.usage) {
            // Use the exampleSentence property
            const example = word.usage.exampleSentence;
            // Create a sentence with the target word removed
            const blankSentence = example.replace(new RegExp(`\\b${word.word}\\b`, 'i'), "_____");
            
            // Get incorrect options from other words
            const otherWords = words
              .filter(w => w.id !== word.id && w.partOfSpeech === word.partOfSpeech)
              .sort(() => 0.5 - Math.random())
              .slice(0, 3)
              .map(w => w.word);
            
            const question: QuizQuestion = {
              id: `q-${word.id}-${index}`,
              type: "contextual",
              question: `Fill in the blank with the most appropriate word: ${blankSentence}`,
              options: [word.word, ...otherWords].sort(() => 0.5 - Math.random()),
              correctAnswer: word.word,
              explanation: `"${word.word}" fits best in this context: "${example}"`,
              difficulty,
              points: difficulty === "easy" ? 10 : difficulty === "medium" ? 15 : 20,
              category: "usage",
              timeLimit: difficulty === "easy" ? 30 : difficulty === "medium" ? 25 : 20,
              hint: `Look for a ${word.partOfSpeech} that makes sense in this context.`
            };
            
            questions.push(question);
          }
        });
        break;
        
      case "transformation":
        // Quiz focused on word transformations (e.g., verb to noun, singular to plural)
        selectedWords.forEach((word, index) => {
          // Only use suitable words that can be transformed
          if (word.partOfSpeech === "verb" || word.partOfSpeech === "noun" || word.partOfSpeech === "adjective") {
            let transformedWord = "";
            let transformationType = "";
            
            // Generate transformation based on part of speech
            if (word.partOfSpeech === "verb") {
              // Verb to noun (e.g., "run" to "runner")
              transformedWord = word.word + "er";
              transformationType = "verb to noun";
            } else if (word.partOfSpeech === "noun") {
              // Singular to plural (basic rule: add "s")
              transformedWord = word.word + "s";
              transformationType = "singular to plural";
            } else if (word.partOfSpeech === "adjective") {
              // Adjective to adverb (e.g., "quick" to "quickly")
              transformedWord = word.word + "ly";
              transformationType = "adjective to adverb";
            }
            
            // Create incorrect options
            const incorrectOptions = [
              word.word + "ing",
              word.word + "ed",
              word.word + "ment"
            ];
            
            const question: QuizQuestion = {
              id: `q-${word.id}-${index}`,
              type: "transformation",
              question: `Transform the ${word.partOfSpeech} "${word.word}" to a ${transformationType}:`,
              options: [transformedWord, ...incorrectOptions].sort(() => 0.5 - Math.random()),
              correctAnswer: transformedWord,
              explanation: `The ${transformationType} of "${word.word}" is "${transformedWord}"`,
              difficulty,
              points: difficulty === "easy" ? 8 : difficulty === "medium" ? 12 : 20,
              category: "transformation",
              timeLimit: difficulty === "easy" ? 20 : difficulty === "medium" ? 18 : 15,
              hint: `Think about how ${word.partOfSpeech}s typically change when transformed to ${transformationType.split(" to ")[1]}s.`
            };
            
            questions.push(question);
          }
        });
        break;
        
      case "brainTeaser":
        // Brain teaser quiz
        selectedWords.forEach((word, index) => {
          const question: QuizQuestion = {
            id: `q-${word.id}-${index}`,
            type: "brainTeaser",
            question: `What is the answer to the brain teaser "${word.word}"?`,
            options: ["A", "B", "C", "D"],
            correctAnswer: "A",
            explanation: `The answer to the brain teaser "${word.word}" is "A".`,
            difficulty,
            points: difficulty === "easy" ? 10 : difficulty === "medium" ? 15 : 20,
            category: "brainTeaser",
            timeLimit: difficulty === "easy" ? 30 : difficulty === "medium" ? 25 : 20,
            hint: `Think about the answer to the brain teaser "${word.word}".`
          };
          
          questions.push(question);
        });
        break;
        
      case "randomChallenge":
        // Random challenge quiz
        selectedWords.forEach((word, index) => {
          const question: QuizQuestion = {
            id: `q-${word.id}-${index}`,
            type: "randomChallenge",
            question: `What is the answer to the random challenge "${word.word}"?`,
            options: ["A", "B", "C", "D"],
            correctAnswer: "A",
            explanation: `The answer to the random challenge "${word.word}" is "A".`,
            difficulty,
            points: difficulty === "easy" ? 10 : difficulty === "medium" ? 15 : 20,
            category: "randomChallenge",
            timeLimit: difficulty === "easy" ? 30 : difficulty === "medium" ? 25 : 20,
            hint: `Think about the answer to the random challenge "${word.word}".`
          };
          
          questions.push(question);
        });
        break;
        
      case "speedDrill":
        // Speed drill quiz
        selectedWords.forEach((word, index) => {
          const question: QuizQuestion = {
            id: `q-${word.id}-${index}`,
            type: "speedDrill",
            question: `What is the definition of "${word.word}"?`,
            options: [word.description],
            correctAnswer: word.description,
            explanation: `${word.word} - ${word.description}`,
            difficulty,
            points: difficulty === "easy" ? 10 : difficulty === "medium" ? 15 : 20,
            category: "definition",
            timeLimit: difficulty === "easy" ? 30 : difficulty === "medium" ? 25 : 20,
            hint: `Think about what this word means in everyday usage.`
          };
          
          questions.push(question);
        });
        break;
        
      case "mnemonicMaster":
        // Mnemonic master quiz
        selectedWords.forEach((word, index) => {
          const question: QuizQuestion = {
            id: `q-${word.id}-${index}`,
            type: "mnemonicMaster",
            question: `What is the mnemonic for "${word.word}"?`,
            options: ["A", "B", "C", "D"],
            correctAnswer: "A",
            explanation: `The mnemonic for "${word.word}" is "A".`,
            difficulty,
            points: difficulty === "easy" ? 10 : difficulty === "medium" ? 15 : 20,
            category: "mnemonicMaster",
            timeLimit: difficulty === "easy" ? 30 : difficulty === "medium" ? 25 : 20,
            hint: `Think about the mnemonic for "${word.word}".`
          };
          
          questions.push(question);
        });
        break;
    }
    
    // If we don't have enough questions, fallback to standard quiz
    if (questions.length < 3 && quizType !== "standard") {
      toast({
        title: "Not enough data for this quiz type",
        description: "Falling back to standard quiz format",
      });
      return generateQuestions(difficulty, "standard", categoryFilter);
    }
    
    return questions.slice(0, questionCount);
  };
  
  // Start a new quiz
  const startQuiz = (difficulty: QuizDifficulty = "medium", quizType: QuizType = "standard", categoryFilter?: string, timedMode: boolean = false) => {
    setQuizType(quizType);
    setTimedMode(timedMode);
    setHintsRemaining(3);
    setCurrentStreak(0);
    setShowResults(false);
    
    const questions = generateQuestions(difficulty, quizType, categoryFilter);
    if (questions.length === 0) return;
    
    setDifficulty(difficulty);
    setCurrentQuiz(questions);
    setCurrentQuestionIndex(0);
    setUserAnswers(new Array(questions.length).fill(null));
    setIsQuizActive(true);
    
    // Update last quiz date for streak tracking
    const today = new Date().toISOString().split('T')[0];
    updateUserStats({
      ...userStats,
      lastQuizDate: today
    });
  };
  
  // Answer the current question
  const answerQuestion = (answer: string | string[]) => {
    if (!currentQuiz) return;
    
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
    
    // Check if the answer is correct
    const currentQuestion = currentQuiz[currentQuestionIndex];
    const isCorrect = Array.isArray(currentQuestion.correctAnswer) 
      ? Array.isArray(answer) && currentQuestion.correctAnswer.every(a => answer.includes(a))
      : answer === currentQuestion.correctAnswer;
    
    // Update streak counter
    if (isCorrect) {
      setCurrentStreak(prev => prev + 1);
      
      // Check for streak achievement
      if (currentStreak + 1 >= 5) {
        const streakAchievement = userStats.achievements.find(a => a.id === "streak_5");
        if (streakAchievement && !streakAchievement.unlocked) {
          const updatedAchievements = userStats.achievements.map(a => 
            a.id === "streak_5" ? { ...a, unlocked: true } : a
          );
          
          updateUserStats({
            ...userStats,
            achievements: updatedAchievements
          });
          
          toast({
            title: "Achievement Unlocked!",
            description: `${streakAchievement.title}: ${streakAchievement.description}`,
            variant: "default"
          });
        }
      }
    } else {
      setCurrentStreak(0);
    }
  };
  
  // Use a hint for the current question
  const useHint = () => {
    if (!currentQuiz || hintsRemaining <= 0) return;
    
    const currentQuestion = currentQuiz[currentQuestionIndex];
    if (currentQuestion.hint) {
      setHintsRemaining(prev => prev - 1);
      toast({
        title: "Hint",
        description: currentQuestion.hint,
        variant: "default"
      });
      return currentQuestion.hint;
    }
    
    return;
  };
  
  // Toggle timed mode
  const toggleTimedMode = () => {
    setTimedMode(prev => !prev);
  };
  
  // Move to the next question
  const nextQuestion = () => {
    if (!currentQuiz) return;
    
    if (currentQuestionIndex < currentQuiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  // Move to the previous question
  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Submit the quiz and calculate results
  const submitQuiz = () => {
    if (!currentQuiz) return;
    
    let correctCount = 0;
    let incorrectCount = 0;
    let totalPoints = 0;
    let etymologyCorrect = 0;
    
    // Calculate results
    currentQuiz.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      const isCorrect = Array.isArray(question.correctAnswer) 
        ? Array.isArray(userAnswer) && question.correctAnswer.every(a => userAnswer.includes(a))
        : userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctCount++;
        totalPoints += question.points;
        
        // Apply bonus for timed mode
        if (timedMode) {
          totalPoints += Math.round(question.points * 0.25); // 25% bonus for timed mode
        }
        
        // Track etymology questions for achievement
        if (question.category === "origin") {
          etymologyCorrect++;
        }
      } else {
        incorrectCount++;
      }
    });
    
    // Update user stats
    const newStats = {
      ...userStats,
      totalQuizzesTaken: userStats.totalQuizzesTaken + 1,
      totalCorrect: userStats.totalCorrect + correctCount,
      totalIncorrect: userStats.totalIncorrect + incorrectCount,
      pointsEarned: userStats.pointsEarned + totalPoints,
      currentStreak: currentStreak
    };
    
    // Update high scores
    const scorePercentage = (correctCount / currentQuiz.length) * 100;
    const currentHighScore = newStats.highScores[quizType]?.[difficulty] || 0;
    
    if (scorePercentage > currentHighScore) {
      newStats.highScores = {
        ...newStats.highScores,
        [quizType]: {
          ...newStats.highScores[quizType],
          [difficulty]: scorePercentage
        }
      };
    }
    
    // Update level based on points
    newStats.level = Math.floor(newStats.pointsEarned / 100) + 1;
    
    // Update achievements progress
    const updatedAchievements = [...newStats.achievements];
    
    // First quiz achievement
    const firstQuizAchievement = updatedAchievements.find(a => a.id === "first_quiz");
    if (firstQuizAchievement && !firstQuizAchievement.unlocked) {
      firstQuizAchievement.unlocked = true;
      toast({
        title: "Achievement Unlocked!",
        description: `${firstQuizAchievement.title}: ${firstQuizAchievement.description}`,
        variant: "default"
      });
    }
    
    // Perfect score achievement
    const perfectScoreAchievement = updatedAchievements.find(a => a.id === "perfect_score");
    if (perfectScoreAchievement && !perfectScoreAchievement.unlocked && correctCount === currentQuiz.length) {
      perfectScoreAchievement.unlocked = true;
      toast({
        title: "Achievement Unlocked!",
        description: `${perfectScoreAchievement.title}: ${perfectScoreAchievement.description}`,
        variant: "default"
      });
    }
    
    // Time wizard achievement (timed mode with 90% accuracy)
    if (timedMode && (correctCount / currentQuiz.length) >= 0.9) {
      const timeWizardAchievement = updatedAchievements.find(a => a.id === "time_wizard");
      if (timeWizardAchievement && !timeWizardAchievement.unlocked) {
        timeWizardAchievement.unlocked = true;
        toast({
          title: "Achievement Unlocked!",
          description: `${timeWizardAchievement.title}: ${timeWizardAchievement.description}`,
          variant: "default"
        });
      }
    }
    
    // Etymology expert achievement
    const etymologyAchievement = updatedAchievements.find(a => a.id === "etymology_expert");
    if (etymologyAchievement && !etymologyAchievement.unlocked && etymologyCorrect > 0) {
      etymologyAchievement.progress = (etymologyAchievement.progress || 0) + etymologyCorrect;
      
      if ((etymologyAchievement.progress || 0) >= (etymologyAchievement.total || 20)) {
        etymologyAchievement.unlocked = true;
        toast({
          title: "Achievement Unlocked!",
          description: `${etymologyAchievement.title}: ${etymologyAchievement.description}`,
          variant: "default"
        });
      } else {
        toast({
          title: "Achievement Progress",
          description: `${etymologyAchievement.title}: ${etymologyAchievement.progress}/${etymologyAchievement.total}`,
          variant: "default"
        });
      }
    }
    
    // Word master achievement - based on unique words learned
    const wordMasterAchievement = updatedAchievements.find(a => a.id === "word_master");
    if (wordMasterAchievement && !wordMasterAchievement.unlocked) {
      // Consider a word "learned" if it was answered correctly in this quiz
      const learnedWordsCount = words.length;
      wordMasterAchievement.progress = Math.min(learnedWordsCount, wordMasterAchievement.total || 50);
      
      if ((wordMasterAchievement.progress || 0) >= (wordMasterAchievement.total || 50)) {
        wordMasterAchievement.unlocked = true;
        toast({
          title: "Achievement Unlocked!",
          description: `${wordMasterAchievement.title}: ${wordMasterAchievement.description}`,
          variant: "default"
        });
      }
    }
    
    // Update stats with new achievements
    newStats.achievements = updatedAchievements;
    updateUserStats(newStats);
    
    // Show results screen
    setShowResults(true);
    setIsQuizActive(false);
  };
  
  // Reset the current quiz
  const resetQuiz = () => {
    setIsQuizActive(false);
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowResults(false);
  };
  
  // Check for achievements
  const checkAchievements = () => {
    const updatedAchievements = [...userStats.achievements];
    let achievementsUnlocked = false;
    
    // Streak achievement
    const streakAchievement = updatedAchievements.find(a => a.id === "streak_3");
    if (streakAchievement && !streakAchievement.unlocked) {
      streakAchievement.progress = userStats.streakDays;
      
      if (userStats.streakDays >= (streakAchievement.total || 3)) {
        streakAchievement.unlocked = true;
        achievementsUnlocked = true;
        toast({
          title: "Achievement Unlocked!",
          description: `${streakAchievement.title}: ${streakAchievement.description}`,
          variant: "default"
        });
      }
    }
    
    if (achievementsUnlocked) {
      updateUserStats({
        ...userStats,
        achievements: updatedAchievements
      });
    }
    
    return achievementsUnlocked;
  };
  
  return (
    <QuizContext.Provider
      value={{
        currentQuiz,
        currentQuestionIndex,
        userAnswers,
        userStats,
        isQuizActive,
        showResults,
        remainingTime,
        difficulty,
        quizType,
        timedMode,
        hintsRemaining,
        currentStreak,
        startQuiz,
        answerQuestion,
        nextQuestion,
        previousQuestion,
        submitQuiz,
        resetQuiz,
        checkAchievements,
        useHint,
        toggleTimedMode
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

// Hook to use Quiz context
export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
};
