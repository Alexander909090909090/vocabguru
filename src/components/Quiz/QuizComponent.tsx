
import { useState, useEffect } from "react";
import { useQuiz, QuizDifficulty } from "@/context/QuizContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Trophy, Star, Medal, Check, Clock, ChevronLeft, ChevronRight, XCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";

const iconMap: Record<string, React.ReactNode> = {
  "award": <Award className="h-4 w-4" />,
  "trophy": <Trophy className="h-4 w-4" />,
  "star": <Star className="h-4 w-4" />,
  "medal": <Medal className="h-4 w-4" />,
  "check": <Check className="h-4 w-4" />
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
    startQuiz,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    submitQuiz,
    resetQuiz
  } = useQuiz();
  
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty>("medium");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [resultsData, setResultsData] = useState<{
    correctCount: number;
    totalCount: number;
    pointsEarned: number;
  } | null>(null);
  
  // Set selected answer from user answers
  useEffect(() => {
    if (isQuizActive && currentQuiz && userAnswers[currentQuestionIndex]) {
      setSelectedAnswer(userAnswers[currentQuestionIndex] as string);
    } else {
      setSelectedAnswer(null);
    }
  }, [currentQuestionIndex, userAnswers, isQuizActive, currentQuiz]);
  
  const handleStartQuiz = () => {
    startQuiz(selectedDifficulty, selectedFilter !== "all" ? selectedFilter : undefined);
    setShowResults(false);
    setResultsData(null);
  };
  
  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    answerQuestion(answer);
  };
  
  const handleSubmitQuiz = () => {
    if (!currentQuiz) return;
    
    // Calculate results
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
      }
    });
    
    // Save results data for display
    setResultsData({
      correctCount,
      totalCount: currentQuiz.length,
      pointsEarned: totalPoints
    });
    
    // Show results
    setShowResults(true);
    
    // Submit to context
    submitQuiz();
  };
  
  const handleNextQuestion = () => {
    nextQuestion();
  };
  
  const handlePreviousQuestion = () => {
    previousQuestion();
  };
  
  const renderAchievements = () => {
    return (
      <div className="space-y-2 mt-6">
        <h3 className="text-lg font-semibold">Your Achievements</h3>
        <div className="flex flex-wrap gap-2">
          {userStats.achievements.map((achievement) => (
            <Badge
              key={achievement.id}
              variant={achievement.unlocked ? "achievement" : "outline"}
              className="flex items-center gap-1 py-1 px-3"
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
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">VocabGuru Quiz</h2>
          <p className="text-muted-foreground">Test your vocabulary knowledge with interactive quizzes!</p>
        </div>
        
        <div className="p-6 bg-card rounded-lg shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Your Stats</h3>
              <p className="text-sm text-muted-foreground">Level {userStats.level} Scholar</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{userStats.pointsEarned} Points</p>
              <p className="text-sm text-muted-foreground">{userStats.streakDays} Day Streak</p>
            </div>
          </div>
          
          <Progress value={userStats.pointsEarned % 100} className="h-2" />
          
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center p-2 bg-primary/10 rounded">
              <p className="text-2xl font-bold">{userStats.totalQuizzesTaken}</p>
              <p className="text-xs text-muted-foreground">Quizzes</p>
            </div>
            <div className="text-center p-2 bg-green-500/10 rounded">
              <p className="text-2xl font-bold">{userStats.totalCorrect}</p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
            <div className="text-center p-2 bg-red-500/10 rounded">
              <p className="text-2xl font-bold">{userStats.totalIncorrect}</p>
              <p className="text-xs text-muted-foreground">Incorrect</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Quiz Difficulty</h3>
            <div className="flex gap-2">
              <Button 
                variant={selectedDifficulty === "easy" ? "default" : "outline"}
                onClick={() => setSelectedDifficulty("easy")}
              >
                Easy
              </Button>
              <Button 
                variant={selectedDifficulty === "medium" ? "default" : "outline"}
                onClick={() => setSelectedDifficulty("medium")}
              >
                Medium
              </Button>
              <Button 
                variant={selectedDifficulty === "hard" ? "default" : "outline"}
                onClick={() => setSelectedDifficulty("hard")}
              >
                Hard
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Quiz Focus</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={selectedFilter === "all" ? "default" : "outline"}
                onClick={() => setSelectedFilter("all")}
                size="sm"
              >
                All Words
              </Button>
              <Button 
                variant={selectedFilter === "prefix" ? "default" : "outline"}
                onClick={() => setSelectedFilter("prefix")}
                size="sm"
              >
                Prefixes
              </Button>
              <Button 
                variant={selectedFilter === "suffix" ? "default" : "outline"}
                onClick={() => setSelectedFilter("suffix")}
                size="sm"
              >
                Suffixes
              </Button>
              <Button 
                variant={selectedFilter === "root" ? "default" : "outline"}
                onClick={() => setSelectedFilter("root")}
                size="sm"
              >
                Root Words
              </Button>
              <Button 
                variant={selectedFilter === "origin" ? "default" : "outline"}
                onClick={() => setSelectedFilter("origin")}
                size="sm"
              >
                Word Origins
              </Button>
            </div>
          </div>
        </div>
        
        <Button
          variant="quiz"
          size="lg"
          className="w-full"
          onClick={handleStartQuiz}
        >
          Start Quiz
        </Button>
        
        {renderAchievements()}
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
        <div className="flex justify-between items-center">
          <div>
            <Badge variant="secondary" className="mb-2">
              {`Question ${currentQuestionIndex + 1} of ${currentQuiz.length}`}
            </Badge>
            <h2 className="text-xl font-bold">{currentQuestion.question}</h2>
          </div>
          
          {remainingTime !== null && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{remainingTime}s</span>
            </div>
          )}
        </div>
        
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
                className="w-full justify-start text-left py-6 h-auto"
                onClick={() => handleSelectAnswer(option)}
              >
                <div className="flex items-center w-full">
                  <div className="w-6 h-6 rounded-full bg-background border flex items-center justify-center mr-3">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span>{option}</span>
                  {isAnswered && selectedAnswer === option && selectedAnswer === currentQuestion.correctAnswer && (
                    <CheckCircle className="ml-auto h-5 w-5 text-green-500" />
                  )}
                  {isAnswered && selectedAnswer === option && selectedAnswer !== currentQuestion.correctAnswer && (
                    <XCircle className="ml-auto h-5 w-5 text-red-500" />
                  )}
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
        
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          {isLastQuestion ? (
            <Button
              variant="quiz"
              onClick={handleSubmitQuiz}
              disabled={!isAnswered}
              className="flex items-center gap-1"
            >
              Finish Quiz
              <Trophy className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="quiz"
              onClick={handleNextQuestion}
              disabled={!isAnswered}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="mt-4">
          <Progress 
            value={(currentQuestionIndex + 1) / currentQuiz.length * 100} 
            className="h-2" 
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
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Quiz Results</h2>
          <p className="text-muted-foreground">{message}</p>
        </div>
        
        <div className="p-6 bg-card rounded-lg shadow-md space-y-4 text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          
          <div className="space-y-1">
            <p className="text-4xl font-bold">{percentage}%</p>
            <p className="text-muted-foreground">
              {correctCount} correct out of {totalCount} questions
            </p>
          </div>
          
          <div className="pt-4 border-t">
            <p className="font-semibold text-2xl">{pointsEarned} Points Earned</p>
            <p className="text-sm text-muted-foreground">
              You're now Level {userStats.level} with {userStats.pointsEarned} total points
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={resetQuiz}
            className="flex-1"
          >
            Back to Dashboard
          </Button>
          <Button
            variant="quiz"
            onClick={handleStartQuiz}
            className="flex-1"
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
