
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, TrendingUp, Star } from "lucide-react";
import { NextSteps } from "@/components/Navigation/NextSteps";
import { motion } from "framer-motion";

interface QuizCompleteProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  onNewQuiz: () => void;
  missedWords?: string[];
}

export function QuizComplete({ 
  score, 
  totalQuestions, 
  onRestart, 
  onNewQuiz,
  missedWords = []
}: QuizCompleteProps) {
  const percentage = Math.round((score / totalQuestions) * 100);
  const isExcellent = percentage >= 90;
  const isGood = percentage >= 70;
  
  const getScoreColor = () => {
    if (isExcellent) return "text-green-400";
    if (isGood) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreMessage = () => {
    if (isExcellent) return "Excellent work! You're mastering these words!";
    if (isGood) return "Good job! Keep practicing to perfect your skills.";
    return "Keep studying! Practice makes perfect.";
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-center">
          <CardHeader>
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              {isExcellent ? (
                <div className="p-4 bg-green-500/20 rounded-full">
                  <Trophy className="h-12 w-12 text-green-400" />
                </div>
              ) : isGood ? (
                <div className="p-4 bg-yellow-500/20 rounded-full">
                  <Star className="h-12 w-12 text-yellow-400" />
                </div>
              ) : (
                <div className="p-4 bg-blue-500/20 rounded-full">
                  <Target className="h-12 w-12 text-blue-400" />
                </div>
              )}
            </motion.div>
            
            <CardTitle className="text-2xl text-white">Quiz Complete!</CardTitle>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className={`text-4xl font-bold ${getScoreColor()}`}
            >
              {percentage}%
            </motion.div>
            
            <p className="text-white/80">{getScoreMessage()}</p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{score}</div>
                <div className="text-sm text-white/70">Correct</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-red-400">{totalQuestions - score}</div>
                <div className="text-sm text-white/70">Missed</div>
              </div>
            </div>

            {missedWords.length > 0 && (
              <div className="text-left">
                <h4 className="text-white font-medium mb-2">Words to Review:</h4>
                <div className="flex flex-wrap gap-1">
                  {missedWords.slice(0, 5).map((word, index) => (
                    <Badge key={index} variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">
                      {word}
                    </Badge>
                  ))}
                  {missedWords.length > 5 && (
                    <Badge variant="outline" className="bg-white/10 text-white/70 border-white/20">
                      +{missedWords.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={onRestart} variant="outline" className="flex-1">
                Retry Quiz
              </Button>
              <Button onClick={onNewQuiz} className="flex-1">
                New Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <NextSteps 
        context="quiz-complete" 
        data={{ 
          quizScore: percentage,
          suggestedWords: missedWords.slice(0, 3)
        }}
      />
    </div>
  );
}
