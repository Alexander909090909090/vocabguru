
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useWords } from "./WordsContext";
import { toast } from "@/components/ui/use-toast";

// Quiz difficulty levels
export type QuizDifficulty = "easy" | "medium" | "hard";

// Question types
export type QuestionType = "multiple" | "trueFalse" | "matching" | "fillBlank";

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
}

// User stats
export interface UserStats {
  totalQuizzesTaken: number;
  totalCorrect: number;
  totalIncorrect: number;
  streakDays: number;
  lastQuizDate: string | null;
  pointsEarned: number;
  level: number;
  achievements: Achievement[];
}

// Quiz context type
interface QuizContextType {
  currentQuiz: QuizQuestion[] | null;
  currentQuestionIndex: number;
  userAnswers: (string | string[] | null)[];
  userStats: UserStats;
  isQuizActive: boolean;
  remainingTime: number | null;
  difficulty: QuizDifficulty;
  
  // Actions
  startQuiz: (difficulty: QuizDifficulty, categoryFilter?: string) => void;
  answerQuestion: (answer: string | string[]) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitQuiz: () => void;
  resetQuiz: () => void;
  checkAchievements: () => void;
}

// Default user stats
const defaultUserStats: UserStats = {
  totalQuizzesTaken: 0,
  totalCorrect: 0,
  totalIncorrect: 0,
  streakDays: 0,
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
    }
  ]
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
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("medium");
  
  // Load user stats from localStorage
  const [userStats, setUserStats] = useState<UserStats>(() => {
    const savedStats = localStorage.getItem("vocabguru-quiz-stats");
    return savedStats ? JSON.parse(savedStats) : defaultUserStats;
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
    
    if (isQuizActive && currentQuiz && currentQuiz[currentQuestionIndex].timeLimit) {
      const timeLimit = currentQuiz[currentQuestionIndex].timeLimit || 30;
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
  }, [isQuizActive, currentQuestionIndex, currentQuiz]);
  
  // Helper to update user stats
  const updateUserStats = (newStats: UserStats) => {
    setUserStats(newStats);
    localStorage.setItem("vocabguru-quiz-stats", JSON.stringify(newStats));
  };
  
  // Calculate level based on points
  const calculateLevel = (points: number) => {
    return Math.floor(points / 100) + 1;
  };
  
  // Generate questions from words
  const generateQuestions = (difficulty: QuizDifficulty, categoryFilter?: string): QuizQuestion[] => {
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
    
    // Generate different question types
    const questions: QuizQuestion[] = [];
    
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
            timeLimit: difficulty === "easy" ? 30 : difficulty === "medium" ? 25 : 20
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
            timeLimit: difficulty === "easy" ? 15 : difficulty === "medium" ? 12 : 10
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
                type: "multiple",
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
                timeLimit: difficulty === "easy" ? 25 : difficulty === "medium" ? 20 : 15
              };
              break;
            }
          }
          
          // Fallback to origin question if no morpheme breakdown
          question = {
            id: `q-${word.id}-${index}`,
            type: "multiple",
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
            timeLimit: difficulty === "easy" ? 20 : difficulty === "medium" ? 18 : 15
          };
          break;
          
        case "fillBlank":
          // Create a fill-in-the-blank using the word in context
          const sentence = `The ${word.partOfSpeech === 'adjective' ? word.word : 'use of the word "' + word.word + '"'} is essential to understanding this concept.`;
          const blankSentence = sentence.replace(word.word, "_____");
          
          question = {
            id: `q-${word.id}-${index}`,
            type: "multiple",
            question: `Fill in the blank: ${blankSentence}`,
            options: [word.word, ...incorrectOptions].sort(() => 0.5 - Math.random()),
            correctAnswer: word.word,
            explanation: `The correct word is "${word.word}": ${sentence}`,
            difficulty,
            points: difficulty === "easy" ? 8 : difficulty === "medium" ? 12 : 18,
            category: "usage",
            timeLimit: difficulty === "easy" ? 20 : difficulty === "medium" ? 18 : 15
          };
          break;
      }
      
      questions.push(question);
    });
    
    return questions;
  };
  
  // Start a new quiz
  const startQuiz = (difficulty: QuizDifficulty = "medium", categoryFilter?: string) => {
    const questions = generateQuestions(difficulty, categoryFilter);
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
    };
    
    // Update level based on points
    newStats.level = calculateLevel(newStats.pointsEarned);
    
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
    
    // Show results
    toast({
      title: "Quiz Completed!",
      description: `You scored ${correctCount}/${currentQuiz.length} and earned ${totalPoints} points!`,
      variant: "default"
    });
    
    // Reset quiz state
    setIsQuizActive(false);
    setCurrentQuiz(null);
  };
  
  // Reset the current quiz
  const resetQuiz = () => {
    setIsQuizActive(false);
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
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
        remainingTime,
        difficulty,
        startQuiz,
        answerQuestion,
        nextQuestion,
        previousQuestion,
        submitQuiz,
        resetQuiz,
        checkAchievements
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
