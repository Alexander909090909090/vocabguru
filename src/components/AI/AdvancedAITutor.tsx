import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  MessageSquare, 
  Target, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
  Lightbulb,
  BookOpen,
  Zap,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PersonalizedAIService } from '@/services/personalizedAIService';
import { toast } from 'sonner';

interface TutorSession {
  id: string;
  userId: string;
  sessionType: 'vocabulary' | 'comprehension' | 'morphology' | 'etymology';
  currentWord?: string;
  progress: number;
  questions: TutorQuestion[];
  currentQuestionIndex: number;
  score: number;
  feedback: SessionFeedback[];
  adaptiveLevel: 'beginner' | 'intermediate' | 'advanced';
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
}

interface TutorQuestion {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'definition' | 'usage' | 'morphology';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: number;
  hints: string[];
  context?: string;
}

interface SessionFeedback {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  hintsUsed: number;
  feedback: string;
  improvement: string;
}

interface AdvancedAITutorProps {
  userId: string;
  sessionType?: 'vocabulary' | 'comprehension' | 'morphology' | 'etymology';
  targetWords?: string[];
  onSessionComplete: (session: TutorSession) => void;
}

export const AdvancedAITutor: React.FC<AdvancedAITutorProps> = ({
  userId,
  sessionType = 'vocabulary',
  targetWords = [],
  onSessionComplete
}) => {
  const [session, setSession] = useState<TutorSession | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [streakCount, setStreakCount] = useState(0);

  // Initialize tutoring session
  const { data: initialSession, isLoading: sessionLoading } = useQuery({
    queryKey: ['tutor-session', userId, sessionType, targetWords],
    queryFn: async () => {
      try {
        return await PersonalizedAIService.createTutorSession(userId, {
          sessionType,
          targetWords,
          adaptiveLevel: 'intermediate', // Will be determined by AI
          questionCount: 10
        });
      } catch (error) {
        console.error('Failed to create tutor session:', error);
        return generateFallbackSession();
      }
    },
    staleTime: 0,
  });

  // Submit answer mutation
  const answerMutation = useMutation({
    mutationFn: async (answerData: { questionId: string; answer: string; timeSpent: number; hintsUsed: number }) => {
      try {
        return await PersonalizedAIService.submitTutorAnswer(session!.id, answerData);
      } catch (error) {
        console.error('Failed to submit answer:', error);
        return generateFallbackFeedback(answerData);
      }
    },
    onSuccess: (feedback) => {
      handleAnswerFeedback(feedback);
    }
  });

  const generateFallbackSession = (): TutorSession => {
    const fallbackQuestions: TutorQuestion[] = [
      {
        id: '1',
        type: 'multiple_choice',
        question: 'What does the prefix "pre-" mean?',
        options: ['Before', 'After', 'During', 'Against'],
        correctAnswer: 'Before',
        explanation: 'The prefix "pre-" comes from Latin and means "before" or "in advance".',
        difficulty: 0.3,
        hints: ['Think of "preview" or "predict"', 'It relates to time order'],
        context: 'Used in words like prevent, prepare, precede'
      },
      {
        id: '2',
        type: 'definition',
        question: 'Define the word "ubiquitous"',
        correctAnswer: 'present everywhere or very common',
        explanation: 'Ubiquitous means existing or being everywhere at the same time; omnipresent.',
        difficulty: 0.7,
        hints: ['Think about something you see everywhere', 'Relates to presence or occurrence'],
        context: 'Example: Smartphones are ubiquitous in modern society'
      }
    ];

    return {
      id: 'fallback-session',
      userId,
      sessionType,
      progress: 0,
      questions: fallbackQuestions,
      currentQuestionIndex: 0,
      score: 0,
      feedback: [],
      adaptiveLevel: 'intermediate',
      learningStyle: 'mixed'
    };
  };

  const generateFallbackFeedback = (answerData: any) => ({
    isCorrect: answerData.answer.toLowerCase().includes('before'),
    feedback: 'Good attempt! Remember to consider the etymology of prefixes.',
    improvement: 'Try to think about word origins and common usage patterns.',
    nextDifficulty: 0.5,
    streakBonus: false
  });

  useEffect(() => {
    if (initialSession) {
      setSession(initialSession);
      setQuestionStartTime(Date.now());
    }
  }, [initialSession]);

  const handleAnswerFeedback = (feedback: any) => {
    if (!session) return;

    const timeSpent = Date.now() - questionStartTime;
    const hintsUsed = showHint ? 1 : 0;

    const newFeedback: SessionFeedback = {
      questionId: session.questions[session.currentQuestionIndex].id,
      userAnswer,
      isCorrect: feedback.isCorrect,
      timeSpent,
      hintsUsed,
      feedback: feedback.feedback,
      improvement: feedback.improvement
    };

    // Update session state
    const updatedSession = {
      ...session,
      feedback: [...session.feedback, newFeedback],
      score: session.score + (feedback.isCorrect ? 10 : 0),
      progress: ((session.currentQuestionIndex + 1) / session.questions.length) * 100
    };

    // Update streak
    if (feedback.isCorrect) {
      setStreakCount(prev => prev + 1);
      if (streakCount >= 2) {
        toast.success(`🔥 ${streakCount + 1} question streak!`);
      }
    } else {
      setStreakCount(0);
    }

    setSession(updatedSession);

    // Move to next question or complete session
    setTimeout(() => {
      if (session.currentQuestionIndex < session.questions.length - 1) {
        setSession(prev => prev ? {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1
        } : null);
        setUserAnswer('');
        setShowHint(false);
        setQuestionStartTime(Date.now());
      } else {
        onSessionComplete(updatedSession);
      }
    }, 2000);
  };

  const handleSubmitAnswer = () => {
    if (!session || !userAnswer.trim()) return;

    const timeSpent = Date.now() - questionStartTime;
    const hintsUsed = showHint ? 1 : 0;

    answerMutation.mutate({
      questionId: session.questions[session.currentQuestionIndex].id,
      answer: userAnswer,
      timeSpent,
      hintsUsed
    });
  };

  const currentQuestion = session?.questions[session.currentQuestionIndex];
  const isLastQuestion = session ? session.currentQuestionIndex === session.questions.length - 1 : false;

  if (sessionLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">AI Tutor is preparing your personalized session...</p>
        </CardContent>
      </Card>
    );
  }

  if (!session || !currentQuestion) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Unable to load tutoring session</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Tutor Session
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                {session.currentQuestionIndex + 1} / {session.questions.length}
              </Badge>
              <Badge variant="outline">
                Score: {session.score}
              </Badge>
              {streakCount > 0 && (
                <Badge variant="default" className="bg-orange-500">
                  🔥 {streakCount} streak
                </Badge>
              )}
            </div>
          </div>
          <Progress value={session.progress} className="mt-2" />
        </CardHeader>
      </Card>

      {/* Current Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={session.currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Question {session.currentQuestionIndex + 1}
                </CardTitle>
                <Badge variant="outline">
                  {Math.round(currentQuestion.difficulty * 100)}% difficulty
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-lg font-medium">
                {currentQuestion.question}
              </div>

              {currentQuestion.context && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4 inline mr-1" />
                    Context: {currentQuestion.context}
                  </p>
                </div>
              )}

              {currentQuestion.type === 'multiple_choice' && currentQuestion.options ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      variant={userAnswer === option ? 'default' : 'outline'}
                      className="justify-start h-auto p-3"
                      onClick={() => setUserAnswer(option)}
                    >
                      <span className="font-medium mr-2">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </Button>
                  ))}
                </div>
              ) : (
                <Textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={3}
                />
              )}

              {showHint && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-600">Hint</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {currentQuestion.hints[0]}
                  </p>
                </motion.div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer.trim() || answerMutation.isPending}
                  className="flex-1"
                >
                  {answerMutation.isPending ? (
                    'Checking...'
                  ) : isLastQuestion ? (
                    'Complete Session'
                  ) : (
                    'Submit Answer'
                  )}
                </Button>
                
                {!showHint && (
                  <Button
                    variant="outline"
                    onClick={() => setShowHint(true)}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Hint
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Recent Feedback */}
      {session.feedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {session.feedback.slice(-3).map((feedback, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    feedback.isCorrect 
                      ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
                  }`}
                >
                  {feedback.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {feedback.isCorrect ? 'Correct!' : 'Keep learning!'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {feedback.feedback}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {(feedback.timeSpent / 1000).toFixed(1)}s
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
