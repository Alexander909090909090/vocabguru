import { useState, useEffect } from "react";
import { useQuiz, QuizDifficulty, QuizType } from "@/context/QuizContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Award, Trophy, Star, Medal, Check, Clock, 
  ChevronLeft, ChevronRight, XCircle, CheckCircle,
  Zap, Lightbulb, BookOpen, Brain, Dices, Puzzle,
  GitBranch, Shuffle, Languages, FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const iconMap: Record<string, React.ReactNode> = {
  "award": <Award className="h-4 w-4" />,
  "trophy": <Trophy className="h-4 w-4" />,
  "star": <Star className="h-4 w-4" />,
  "medal": <Medal className="h-4 w-4" />,
  "check": <Check className="h-4 w-4" />,
  "zap": <Zap className="h-4 w-4" />,
  "clock": <Clock className="h-4 w-4" />
};

const quizTypeIcons: Record<QuizType, React.ReactNode> = {
  "standard": <BookOpen className="h-5 w-5" />,
  "wordBuilder": <Puzzle className="h-5 w-5" />,
  "synonymAntonym": <Shuffle className="h-5 w-5" />,
  "etymology": <Languages className="h-5 w-5" />,
  "contextual": <FileText className="h-5 w-5" />,
  "transformation": <GitBranch className="h-5 w-5" />
};

const quizTypeLabels: Record<QuizType, string> = {
  "standard": "Standard Quiz",
  "wordBuilder": "Word Builder",
  "synonymAntonym": "Synonym/Antonym",
  "etymology": "Etymology Explorer",
  "contextual": "Contextual Usage",
  "transformation": "Word Transformation"
};

const QuizComponent = () => {
  const {
    currentQuiz,
    currentQuestionIndex,
    userAnswers,
    userStats,
    isQuizActive,
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
    useHint,
    toggleTimedMode
  } = useQuiz();
  
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty>("medium");
  const [selectedQuizType, setSelectedQuizType] = useState<QuizType>("standard");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [resultsData, setResultsData] = useState<{
    correctCount: number;
    totalCount: number;
    pointsEarned: number;
  } | null>(null);
  const [isTimedMode, setIsTimedMode] = useState(false);
  
  useEffect(() => {
    if (isQuizActive && currentQuiz && userAnswers[currentQuestionIndex]) {
      const answer = userAnswers[currentQuestionIndex];
      if (Array.isArray(answer)) {
        setSelectedAnswers(answer);
        setSelectedAnswer(null);
      } else {
        setSelectedAnswer(answer as string);
        setSelectedAnswers([]);
      }
    } else {
      setSelectedAnswer(null);
      setSelectedAnswers([]);
    }
  }, [currentQuestionIndex, userAnswers, isQuizActive, currentQuiz]);
  
  const handleStartQuiz = () => {
    startQuiz(
      selectedDifficulty, 
      selectedQuizType, 
      selectedFilter !== "all" ? selectedFilter : undefined,
      isTimedMode
    );
    setShowResults(false);
    setResultsData(null);
  };
  
  const handleSelectAnswer = (answer: string) => {
    const currentQuestion = currentQuiz?.[currentQuestionIndex];
    
    if (!currentQuestion) return;
    
    if (currentQuestion.type === "wordBuilder") {
      if (selectedAnswers.includes(answer)) {
        const newAnswers = selectedAnswers.filter(a => a !== answer);
        setSelectedAnswers(newAnswers);
        answerQuestion(newAnswers);
      } else {
        const newAnswers = [...selectedAnswers, answer];
        setSelectedAnswers(newAnswers);
        answerQuestion(newAnswers);
      }
    } else {
      setSelectedAnswer(answer);
      answerQuestion(answer);
    }
  };
  
  const handleUseHint = () => {
    useHint();
  };
  
  const handleSubmitQuiz = () => {
    if (!currentQuiz) return;
    
    let correctCount = 0;
    let totalPoints = 0;
    
    currentQuiz.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      const isCorrect = Array.isArray(question.correctAnswer) 
        ? Array.isArray(userAnswer) && question.correctAnswer.every(a => userAnswer.includes(a))
        : userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctCount++;
        totalPoints += question.points;
        
        if (timedMode) {
          totalPoints += Math.round(question.points * 0.25);
        }
      }
    });
    
    setResultsData({
      correctCount,
      totalCount: currentQuiz.length,
      pointsEarned: totalPoints
    });
    
    setShowResults(true);
    
    submitQuiz();
  };
  
  const handleNextQuestion = () => {
    nextQuestion();
  };
  
  const handlePreviousQuestion = () => {
    previousQuestion();
  };
  
  const handleToggleTimedMode = () => {
    setIsTimedMode(!isTimedMode);
    toggleTimedMode();
  };
  
  const renderAchievements = () => {
    return (
      <div className="space-y-2 mt-6">
        <h3 className="text-lg font-semibold text-white">Your Achievements</h3>
        <div className="flex flex-wrap gap-2">
          {userStats.achievements.map((achievement) => (
            <Badge
              key={achievement.id}
              variant={achievement.unlocked ? "achievement" : "outline"}
              className={`flex items-center gap-1 py-1 px-3 ${achievement.unlocked ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gray-800/50 text-gray-300 backdrop-blur-md'}`}
            >
              {iconMap[achievement.icon] || <Award className="h-4 w-4" />}
              <span>{achievement.title}</span>
            </Badge>
          ))}
        </div>
      </div>
    );
  };
  
  const renderStartScreen = () => {
    const quizTypes: { id: QuizType; title: string; description: string; icon: React.ReactNode; gradient: string }[] = [
      { 
        id: "standard", 
        title: "Standard Quiz", 
        description: "Test your vocabulary knowledge with a variety of question types.", 
        icon: <BookOpen className="h-6 w-6" />,
        gradient: "from-indigo-500 to-purple-600"
      },
      { 
        id: "wordBuilder", 
        title: "Word Builder", 
        description: "Build words by selecting the correct morpheme components.", 
        icon: <Puzzle className="h-6 w-6" />,
        gradient: "from-purple-500 to-pink-600"
      },
      { 
        id: "synonymAntonym", 
        title: "Synonym & Antonym", 
        description: "Match words with their synonyms and antonyms.", 
        icon: <Shuffle className="h-6 w-6" />,
        gradient: "from-blue-500 to-teal-400"
      },
      { 
        id: "etymology", 
        title: "Etymology Explorer", 
        description: "Test your knowledge of word origins and history.", 
        icon: <Languages className="h-6 w-6" />,
        gradient: "from-amber-500 to-orange-600"
      },
      { 
        id: "contextual", 
        title: "Contextual Usage", 
        description: "Complete sentences with the appropriate vocabulary.", 
        icon: <FileText className="h-6 w-6" />,
        gradient: "from-green-500 to-teal-500"
      },
      { 
        id: "transformation", 
        title: "Word Transformation", 
        description: "Transform words from one form to another.", 
        icon: <GitBranch className="h-6 w-6" />,
        gradient: "from-cyan-500 to-blue-600"
      }
    ];
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-white">VocabGuru Quiz</h2>
          <p className="text-muted-foreground">Test your vocabulary knowledge with interactive quizzes!</p>
        </div>
        
        <div className="p-6 bg-gray-900/70 backdrop-blur-md rounded-lg shadow-md border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Your Stats</h3>
              <p className="text-sm text-muted-foreground">Level {userStats.level} Scholar</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-white">{userStats.pointsEarned} Points</p>
              <p className="text-sm text-muted-foreground">{userStats.streakDays} Day Streak</p>
            </div>
          </div>
          
          <Progress value={userStats.pointsEarned % 100} className="h-2 bg-gray-800" />
          
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center p-2 bg-indigo-500/20 rounded">
              <p className="text-2xl font-bold text-white">{userStats.totalQuizzesTaken}</p>
              <p className="text-xs text-muted-foreground">Quizzes</p>
            </div>
            <div className="text-center p-2 bg-green-500/20 rounded">
              <p className="text-2xl font-bold text-white">{userStats.totalCorrect}</p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
            <div className="text-center p-2 bg-red-500/20 rounded">
              <p className="text-2xl font-bold text-white">{userStats.totalIncorrect}</p>
              <p className="text-xs text-muted-foreground">Incorrect</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-white mb-2">Select Quiz Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {quizTypes.map((type) => (
              <motion.button
                key={type.id}
                className={`p-4 rounded-lg border text-left transition-all ${
                  selectedQuizType === type.id
                    ? `bg-gradient-to-br ${type.gradient} border-white/25 shadow-lg`
                    : 'bg-gray-800/50 border-white/10 hover:bg-gray-800/80'
                }`}
                onClick={() => setSelectedQuizType(type.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    selectedQuizType === type.id
                      ? 'bg-white/20'
                      : 'bg-gray-700/50'
                  }`}>
                    {type.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{type.title}</h4>
                    <p className="text-xs text-gray-300 line-clamp-1">{type.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-white mb-2">Quiz Difficulty</h3>
            <div className="flex gap-2">
              <Button 
                variant={selectedDifficulty === "easy" ? "default" : "outline"}
                onClick={() => setSelectedDifficulty("easy")}
                className={selectedDifficulty === "easy" 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "text-white border-white/20 bg-gray-800/50"
                }
              >
                Easy
              </Button>
              <Button 
                variant={selectedDifficulty === "medium" ? "default" : "outline"}
                onClick={() => setSelectedDifficulty("medium")}
                className={selectedDifficulty === "medium" 
                  ? "bg-amber-600 hover:bg-amber-700" 
                  : "text-white border-white/20 bg-gray-800/50"
                }
              >
                Medium
              </Button>
              <Button 
                variant={selectedDifficulty === "hard" ? "default" : "outline"}
                onClick={() => setSelectedDifficulty("hard")}
                className={selectedDifficulty === "hard" 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "text-white border-white/20 bg-gray-800/50"
                }
              >
                Hard
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-2">Quiz Focus</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={selectedFilter === "all" ? "default" : "outline"}
                onClick={() => setSelectedFilter("all")}
                size="sm"
                className={selectedFilter === "all" 
                  ? "bg-indigo-600 hover:bg-indigo-700" 
                  : "text-white border-white/20 bg-gray-800/50"
                }
              >
                All Words
              </Button>
              <Button 
                variant={selectedFilter === "prefix" ? "default" : "outline"}
                onClick={() => setSelectedFilter("prefix")}
                size="sm"
                className={selectedFilter === "prefix" 
                  ? "bg-indigo-600 hover:bg-indigo-700" 
                  : "text-white border-white/20 bg-gray-800/50"
                }
              >
                Prefixes
              </Button>
              <Button 
                variant={selectedFilter === "suffix" ? "default" : "outline"}
                onClick={() => setSelectedFilter("suffix")}
                size="sm"
                className={selectedFilter === "suffix" 
                  ? "bg-indigo-600 hover:bg-indigo-700" 
                  : "text-white border-white/20 bg-gray-800/50"
                }
              >
                Suffixes
              </Button>
              <Button 
                variant={selectedFilter === "root" ? "default" : "outline"}
                onClick={() => setSelectedFilter("root")}
                size="sm"
                className={selectedFilter === "root" 
                  ? "bg-indigo-600 hover:bg-indigo-700" 
                  : "text-white border-white/20 bg-gray-800/50"
                }
              >
                Root Words
              </Button>
              <Button 
                variant={selectedFilter === "origin" ? "default" : "outline"}
                onClick={() => setSelectedFilter("origin")}
                size="sm"
                className={selectedFilter === "origin" 
                  ? "bg-indigo-600 hover:bg-indigo-700" 
                  : "text-white border-white/20 bg-gray-800/50"
                }
              >
                Word Origins
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="timed-mode"
              checked={isTimedMode}
              onCheckedChange={handleToggleTimedMode}
              className="data-[state=checked]:bg-pink-500"
            />
            <Label htmlFor="timed-mode" className="text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-pink-400" />
              Timed Mode
              <span className="text-xs text-gray-400">(+25% points, less time per question)</span>
            </Label>
          </div>
        </div>
        
        <Button
          variant="quiz"
          size="lg"
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-[0_0_15px_rgba(139,92,246,0.5)] text-white font-semibold"
          onClick={handleStartQuiz}
        >
          Start Quiz
          {quizTypeIcons[selectedQuizType]}
        </Button>
        
        {renderAchievements()}
        
        <div className="p-4 bg-gray-900/70 backdrop-blur-md rounded-lg border border-white/10">
          <h3 className="font-semibold text-white mb-3">High Scores</h3>
          <div className="space-y-2">
            {Object.entries(userStats.highScores).map(([type, scores]) => {
              if (scores.easy === 0 && scores.medium === 0 && scores.hard === 0) return null;
              
              return (
                <div key={type} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {quizTypeIcons[type as QuizType]}
                    <span className="text-gray-200">{quizTypeLabels[type as QuizType]}</span>
                  </div>
                  <div className="flex gap-2">
                    {scores.easy > 0 && (
                      <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                        Easy: {Math.round(scores.easy)}%
                      </Badge>
                    )}
                    {scores.medium > 0 && (
                      <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                        Medium: {Math.round(scores.medium)}%
                      </Badge>
                    )}
                    {scores.hard > 0 && (
                      <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">
                        Hard: {Math.round(scores.hard)}%
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  
  const renderQuizQuestion = () => {
    if (!currentQuiz) return null;
    
    const currentQuestion = currentQuiz[currentQuestionIndex];
    const isAnswered = userAnswers[currentQuestionIndex] !== null;
    const isLastQuestion = currentQuestionIndex === currentQuiz.length - 1;
    
    return (
      <div className="space-y-6">
        {currentStreak > 0 && (
          <div className="bg-indigo-500/20 border border-indigo-500/40 text-white rounded-md p-2 flex items-center justify-center gap-2 animate-pulse">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="font-medium">{currentStreak} Correct in a Row!</span>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div>
            <div className="flex gap-2 mb-2">
              <Badge variant="secondary" className="bg-gray-800 text-white">
                {`Question ${currentQuestionIndex + 1} of ${currentQuiz.length}`}
              </Badge>
              <Badge variant="outline" className="bg-gray-800/80 text-white border-gray-700">
                {quizTypeLabels[quizType]}
              </Badge>
            </div>
            <h2 className="text-xl font-bold text-white">{currentQuestion.question}</h2>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            {remainingTime !== null && (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                remainingTime > 10 
                  ? 'bg-green-500/20 text-green-400' 
                  : remainingTime > 5 
                  ? 'bg-amber-500/20 text-amber-400' 
                  : 'bg-red-500/20 text-red-400 animate-pulse'
              }`}>
                <Clock className="h-4 w-4" />
                <span>{remainingTime}s</span>
              </div>
            )}
            
            {hintsRemaining > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30"
                onClick={handleUseHint}
              >
                <Lightbulb className="h-4 w-4 mr-1" />
                Hint ({hintsRemaining})
              </Button>
            )}
          </div>
        </div>
        
        {currentQuestion.type === "wordBuilder" ? (
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">Select all morphemes that make up this word:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    selectedAnswers.includes(option)
                      ? 'bg-gradient-to-br from-purple-600 to-pink-500 border-white/30'
                      : 'bg-gray-800/70 border-white/10 hover:bg-gray-700/50'
                  }`}
                  onClick={() => handleSelectAnswer(option)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="text-white font-medium">{option}</span>
                </motion.button>
              ))}
            </div>
            
            {selectedAnswers.length > 0 && (
              <div className="p-4 bg-gray-800/50 border border-white/10 rounded-lg mt-4">
                <p className="text-gray-300 text-sm mb-2">Your selected morphemes:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAnswers.map((answer, idx) => (
                    <Badge key={idx} className="bg-purple-500/30 text-purple-200 border-purple-500/40">
                      {answer}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant={
                    selectedAnswer === option
                      ? isAnswered && selectedAnswer === currentQuestion.correctAnswer
                        ? "correct"
                        : isAnswered && selectedAnswer !== currentQuestion.correctAnswer
                        ? "incorrect"
                        : "default"
                      : "outline"
                  }
                  className={`w-full justify-start text-left py-6 h-auto ${
                    selectedAnswer === option
                      ? isAnswered && selectedAnswer === currentQuestion.correctAnswer
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : isAnswered && selectedAnswer !== currentQuestion.correctAnswer
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-indigo-600 text-white"
                      : "bg-gray-800/50 text-white border-white/20 hover:bg-gray-700/70"
                  }`}
                  onClick={() => handleSelectAnswer(option)}
                >
                  <div className="flex items-center w-full">
                    <div className="w-6 h-6 rounded-full bg-gray-900/70 border border-gray-600 flex items-center justify-center mr-3">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                    {isAnswered && selectedAnswer === option && selectedAnswer === currentQuestion.correctAnswer && (
                      <CheckCircle className="ml-auto h-5 w-5 text-green-300" />
                    )}
                    {isAnswered && selectedAnswer === option && selectedAnswer !== currentQuestion.correctAnswer && (
                      <XCircle className="ml-auto h-5 w-5 text-red-300" />
                    )}
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        )}
        
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-1 bg-gray-800/70 text-white border-white/20 hover:bg-gray-700"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          {isLastQuestion ? (
            <Button
              variant="quiz"
              onClick={handleSubmitQuiz}
              disabled={!isAnswered}
              className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-pink-600 hover:from-amber-600 hover:to-pink-700 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
            >
              Finish Quiz
              <Trophy className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="quiz"
              onClick={handleNextQuestion}
              disabled={!isAnswered}
              className="flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="mt-4">
          <Progress 
            value={(currentQuestionIndex + 1) / currentQuiz.length * 100} 
            className="h-2 bg-gray-800" 
          />
        </div>
      </div>
    );
  };
  
  const renderResults = () => {
    if (!resultsData) return null;
    
    const { correctCount, totalCount, pointsEarned } = resultsData;
    const percentage = Math.round((correctCount / totalCount) * 100);
    
    let message = "";
    let variant: "default" | "destructive" | "secondary" = "default";
    
    if (percentage >= 90) {
      message = "Outstanding! You're a vocabulary master!";
      variant = "default";
    } else if (percentage >= 70) {
      message = "Great job! You have a strong vocabulary!";
      variant = "default";
    } else if (percentage >= 50) {
      message = "Good effort! Keep practicing to improve!";
      variant = "secondary";
    } else {
      message = "Need more practice! Keep learning!";
      variant = "destructive";
    }
    
    const confettiCount = 50;
    
    return (
      <div className="space-y-6">
        {percentage >= 70 && (
          <div className="absolute inset-0 z-0 overflow-hidden">
            {[...Array(confettiCount)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                initial={{ 
                  top: "-10%", 
                  left: `${Math.random() * 100}%`, 
                  backgroundColor: ["#ff0", "#f0f", "#0ff", "#0f0", "#00f"][Math.floor(Math.random() * 5)]
                }}
                animate={{
                  top: "100%",
                  left: [`${Math.random() * 100}%`, `${Math.random() * 100}%`, `${Math.random() * 100}%`],
                  rotate: [0, 360, 720],
                  opacity: [1, 1, 0]
                }}
                transition={{
                  duration: Math.random() * 2 + 1,
                  ease: "easeOut",
                  delay: Math.random() * 0.5
                }}
              />
            ))}
          </div>
        )}
        
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-white">Quiz Results</h2>
          <p className="text-muted-foreground">{message}</p>
        </div>
        
        <div className="p-6 bg-gray-900/70 backdrop-blur-md rounded-lg shadow-md border border-white/10 space-y-4 text-center">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          
          <div className="space-y-1">
            <p className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-pink-500 text-transparent bg-clip-text">{percentage}%</p>
            <p className="text-muted-foreground">
              {correctCount} correct out of {totalCount} questions
            </p>
          </div>
          
          <div className="pt-4 border-t border-white/10">
            <p className="font-semibold text-2xl text-white">{pointsEarned} Points Earned</p>
            <p className="text-sm text-muted-foreground">
              You're now Level {userStats.level} with {userStats.pointsEarned} total points
            </p>
          </div>
          
          {timedMode && (
            <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-none px-3 py-1 text-sm">
              <Clock className="h-4 w-4 mr-1" />
              Timed Mode Bonus Applied
            </Badge>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={resetQuiz}
            className="flex-1 bg-gray-800/70 text-white border-white/20 hover:bg-gray-700"
          >
            Back to Dashboard
          </Button>
          <Button
            variant="quiz"
            onClick={handleStartQuiz}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-[0_0_15px_rgba(139,92,246,0.5)]"
          >
            New Quiz
          </Button>
        </div>
        
        {renderAchievements()}
      </div>
    );
  };
  
  return (
    <div className="max-w-2xl mx-auto py-6">
      {!isQuizActive && !showResults && renderStartScreen()}
      {isQuizActive && currentQuiz && !showResults && renderQuizQuestion()}
      {showResults && renderResults()}
    </div>
  );
};

export default QuizComponent;
