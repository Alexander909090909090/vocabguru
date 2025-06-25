
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Brain, Target, Timer } from "lucide-react";
import { WordRepositoryEntry } from "@/services/wordRepositoryService";
import { UserWordLibraryService } from "@/services/userWordLibraryService";
import { toast } from "sonner";

interface StudyQuestion {
  id: string;
  type: 'definition' | 'morpheme' | 'usage' | 'etymology';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  word: WordRepositoryEntry;
}

interface OptimizedStudySessionProps {
  words: WordRepositoryEntry[];
  onComplete: (results: StudyResults) => void;
  adaptiveDifficulty?: boolean;
}

interface StudyResults {
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  wordsStudied: string[];
  difficultyProgression: number[];
}

export function OptimizedStudySession({ 
  words, 
  onComplete, 
  adaptiveDifficulty = true 
}: OptimizedStudySessionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<StudyQuestion[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [results, setResults] = useState<StudyResults>({
    totalQuestions: 0,
    correctAnswers: 0,
    timeSpent: 0,
    wordsStudied: [],
    difficultyProgression: []
  });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [difficulty, setDifficulty] = useState(1); // 1-3 scale

  useEffect(() => {
    initializeSession();
  }, [words]);

  const initializeSession = async () => {
    const id = await UserWordLibraryService.startStudySession('vocabulary');
    setSessionId(id);
    
    const generatedQuestions = generateQuestions(words, difficulty);
    setQuestions(generatedQuestions);
    setResults(prev => ({ ...prev, totalQuestions: generatedQuestions.length }));
    setQuestionStartTime(Date.now());
  };

  const generateQuestions = (wordList: WordRepositoryEntry[], difficultyLevel: number): StudyQuestion[] => {
    const questionTypes: StudyQuestion['type'][] = ['definition', 'morpheme', 'usage', 'etymology'];
    
    return wordList.slice(0, 10).map((word, index) => {
      const type = questionTypes[index % questionTypes.length];
      
      switch (type) {
        case 'definition':
          return generateDefinitionQuestion(word, wordList, difficultyLevel);
        case 'morpheme':
          return generateMorphemeQuestion(word, wordList, difficultyLevel);
        case 'usage':
          return generateUsageQuestion(word, wordList, difficultyLevel);
        case 'etymology':
          return generateEtymologyQuestion(word, wordList, difficultyLevel);
        default:
          return generateDefinitionQuestion(word, wordList, difficultyLevel);
      }
    });
  };

  const generateDefinitionQuestion = (
    word: WordRepositoryEntry, 
    allWords: WordRepositoryEntry[], 
    difficultyLevel: number
  ): StudyQuestion => {
    const correctDefinition = word.definitions.primary || word.definitions.standard?.[0] || "No definition available";
    const wrongOptions = allWords
      .filter(w => w.id !== word.id)
      .slice(0, 3)
      .map(w => w.definitions.primary || w.definitions.standard?.[0] || "Definition");

    const options = [correctDefinition, ...wrongOptions].sort(() => Math.random() - 0.5);
    const correctAnswer = options.indexOf(correctDefinition);

    return {
      id: `def-${word.id}`,
      type: 'definition',
      question: `What does "${word.word}" mean?`,
      options,
      correctAnswer,
      explanation: `"${word.word}" means: ${correctDefinition}`,
      word
    };
  };

  const generateMorphemeQuestion = (
    word: WordRepositoryEntry, 
    allWords: WordRepositoryEntry[], 
    difficultyLevel: number
  ): StudyQuestion => {
    const morpheme = word.morpheme_breakdown;
    const rootMeaning = morpheme.root.meaning || "root meaning";
    
    const wrongOptions = allWords
      .filter(w => w.id !== word.id && w.morpheme_breakdown.root.meaning)
      .slice(0, 3)
      .map(w => w.morpheme_breakdown.root.meaning);

    const options = [rootMeaning, ...wrongOptions].sort(() => Math.random() - 0.5);
    const correctAnswer = options.indexOf(rootMeaning);

    return {
      id: `morph-${word.id}`,
      type: 'morpheme',
      question: `What does the root "${morpheme.root.text}" in "${word.word}" mean?`,
      options,
      correctAnswer,
      explanation: `The root "${morpheme.root.text}" means: ${rootMeaning}`,
      word
    };
  };

  const generateUsageQuestion = (
    word: WordRepositoryEntry, 
    allWords: WordRepositoryEntry[], 
    difficultyLevel: number
  ): StudyQuestion => {
    const correctUsage = word.analysis.example_sentence || `The ${word.word} was impressive.`;
    const wrongOptions = allWords
      .filter(w => w.id !== word.id && w.analysis.example_sentence)
      .slice(0, 3)
      .map(w => w.analysis.example_sentence || `Example with ${w.word}`);

    const options = [correctUsage, ...wrongOptions].sort(() => Math.random() - 0.5);
    const correctAnswer = options.indexOf(correctUsage);

    return {
      id: `usage-${word.id}`,
      type: 'usage',
      question: `Which sentence correctly uses "${word.word}"?`,
      options,
      correctAnswer,
      explanation: `Correct usage: ${correctUsage}`,
      word
    };
  };

  const generateEtymologyQuestion = (
    word: WordRepositoryEntry, 
    allWords: WordRepositoryEntry[], 
    difficultyLevel: number
  ): StudyQuestion => {
    const correctOrigin = word.etymology.language_of_origin || "Unknown";
    const wrongOptions = ['Latin', 'Greek', 'French', 'German', 'Old English']
      .filter(lang => lang !== correctOrigin)
      .slice(0, 3);

    const options = [correctOrigin, ...wrongOptions].sort(() => Math.random() - 0.5);
    const correctAnswer = options.indexOf(correctOrigin);

    return {
      id: `etym-${word.id}`,
      type: 'etymology',
      question: `What is the language of origin for "${word.word}"?`,
      options,
      correctAnswer,
      explanation: `"${word.word}" originates from ${correctOrigin}`,
      word
    };
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = useCallback(() => {
    if (selectedAnswer === null) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const questionTime = Date.now() - questionStartTime;

    // Update results
    setResults(prev => ({
      ...prev,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      timeSpent: prev.timeSpent + questionTime,
      wordsStudied: [...prev.wordsStudied, currentQuestion.word.id],
      difficultyProgression: [...prev.difficultyProgression, difficulty]
    }));

    // Adaptive difficulty adjustment
    if (adaptiveDifficulty) {
      if (isCorrect && questionTime < 5000) { // Quick correct answer
        setDifficulty(prev => Math.min(3, prev + 0.1));
      } else if (!isCorrect) {
        setDifficulty(prev => Math.max(1, prev - 0.2));
      }
    }

    // Progress tracking
    toast.success(isCorrect ? "Correct! Well done!" : "Keep learning!");

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setQuestionStartTime(Date.now());
    } else {
      completeSession();
    }
  }, [selectedAnswer, currentQuestionIndex, questions, difficulty, adaptiveDifficulty, questionStartTime]);

  const completeSession = async () => {
    const finalResults = {
      ...results,
      timeSpent: Date.now() - startTime
    };

    if (sessionId) {
      await UserWordLibraryService.completeStudySession(sessionId, {
        words_studied: finalResults.wordsStudied,
        correct_answers: finalResults.correctAnswers,
        total_questions: finalResults.totalQuestions
      });
    }

    onComplete(finalResults);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (!currentQuestion) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">Loading study session...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Study Session
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Level {Math.round(difficulty)}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Timer className="h-3 w-3" />
              {currentQuestionIndex + 1}/{questions.length}
            </Badge>
          </div>
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{currentQuestion.question}</h3>
          
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === index ? "default" : "outline"}
                className="w-full text-left justify-start h-auto p-4"
                onClick={() => handleAnswerSelect(index)}
                disabled={showExplanation}
              >
                <span className="mr-3 font-mono text-sm">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
                {showExplanation && index === currentQuestion.correctAnswer && (
                  <CheckCircle className="ml-auto h-4 w-4 text-green-500" />
                )}
                {showExplanation && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                  <XCircle className="ml-auto h-4 w-4 text-red-500" />
                )}
              </Button>
            ))}
          </div>
        </div>

        {showExplanation && (
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm">{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setShowExplanation(true)}
            disabled={selectedAnswer === null || showExplanation}
          >
            Show Explanation
          </Button>
          
          <Button 
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null}
          >
            {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Complete Session"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default OptimizedStudySession;
