
import { useState, useEffect } from "react";
import { Word } from "@/data/words";
import { Button } from "@/components/ui/button";
import { Shuffle, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface WordQuizProps {
  words: Word[];
}

type QuizQuestion = {
  id: string;
  word: string;
  options: { text: string; correct: boolean }[];
  questionType: 'meaning' | 'origin' | 'morpheme';
}

export function WordQuiz({ words }: WordQuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (words.length > 3) {
      generateQuiz();
      setLoading(false);
    }
  }, [words]);

  const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const generateQuiz = () => {
    if (words.length < 4) {
      toast.error("Not enough words to create a quiz. Add more words first.");
      return;
    }

    // Select 5 random words from the array
    const selectedWords = shuffleArray(words).slice(0, 5);
    
    const quizQuestions: QuizQuestion[] = selectedWords.map(word => {
      // Choose question type randomly
      const questionTypes: ('meaning' | 'origin' | 'morpheme')[] = ['meaning', 'origin', 'morpheme'];
      const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      
      // Create options (one correct, three incorrect)
      let correctOption: string;
      let incorrectOptions: string[] = [];
      
      if (questionType === 'meaning') {
        correctOption = word.definitions[0]?.text || word.description;
        incorrectOptions = words
          .filter(w => w.id !== word.id)
          .map(w => w.definitions[0]?.text || w.description)
          .filter(Boolean);
      } else if (questionType === 'origin') {
        correctOption = word.languageOrigin;
        incorrectOptions = words
          .filter(w => w.id !== word.id && w.languageOrigin !== word.languageOrigin)
          .map(w => w.languageOrigin)
          .filter(Boolean);
      } else {
        correctOption = word.morphemeBreakdown.root.meaning;
        incorrectOptions = words
          .filter(w => w.id !== word.id)
          .map(w => w.morphemeBreakdown.root.meaning)
          .filter(Boolean);
      }
      
      // Ensure uniqueness
      incorrectOptions = [...new Set(incorrectOptions)];
      
      // Take only three incorrect options
      incorrectOptions = shuffleArray(incorrectOptions).slice(0, 3);
      
      // Combine and shuffle all options
      const options = shuffleArray([
        { text: correctOption, correct: true },
        ...incorrectOptions.map(opt => ({ text: opt, correct: false }))
      ]);
      
      return {
        id: word.id,
        word: word.word,
        options,
        questionType
      };
    });
    
    setQuestions(quizQuestions);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedOption(null);
    setQuizCompleted(false);
  };

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
    
    // Update score if correct
    if (questions[currentQuestion]?.options[index].correct) {
      setScore(prevScore => prevScore + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(current => current + 1);
      setSelectedOption(null);
    } else {
      setQuizCompleted(true);
    }
  };

  const startQuiz = () => {
    generateQuiz();
    setQuizStarted(true);
  };

  const restartQuiz = () => {
    generateQuiz();
    setQuizCompleted(false);
  };

  if (loading) {
    return <div className="h-64 w-full rounded-xl bg-gray-200 animate-pulse"></div>;
  }

  const getQuestionText = (questionType: string, word: string) => {
    switch (questionType) {
      case 'meaning':
        return `What is the meaning of "${word}"?`;
      case 'origin':
        return `What is the language origin of "${word}"?`;
      case 'morpheme':
        return `What does the root of "${word}" mean?`;
      default:
        return `Question about "${word}"`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Vocabulary Quiz</h2>
        {quizStarted && !quizCompleted && (
          <div className="text-sm font-medium">
            Question {currentQuestion + 1} of {questions.length}
          </div>
        )}
      </div>
      
      {!quizStarted ? (
        <div className="bg-card p-6 rounded-xl text-center space-y-4">
          <h3 className="text-xl font-medium">Test your vocabulary knowledge</h3>
          <p className="text-muted-foreground">
            Take a short quiz to test your understanding of the vocabulary words in your collection.
          </p>
          <Button onClick={startQuiz} className="mt-4">
            <Shuffle className="mr-2 h-4 w-4" />
            Start Quiz
          </Button>
        </div>
      ) : quizCompleted ? (
        <div className="bg-card p-6 rounded-xl text-center space-y-4">
          <h3 className="text-xl font-medium">Quiz Completed!</h3>
          <div className="text-4xl font-bold text-primary">
            {score} / {questions.length}
          </div>
          <p className="text-muted-foreground">
            {score === questions.length 
              ? "Perfect score! You've mastered these words." 
              : `Good effort! Keep studying to improve your score.`}
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Button onClick={restartQuiz} variant="outline">
              <Shuffle className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button asChild>
              <a href="/">
                View All Words
              </a>
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-card p-6 rounded-xl space-y-4">
          <h3 className="text-lg font-medium">
            {getQuestionText(
              questions[currentQuestion]?.questionType,
              questions[currentQuestion]?.word
            )}
          </h3>
          
          <div className="space-y-3 mt-4">
            {questions[currentQuestion]?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={selectedOption !== null}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedOption === index
                    ? option.correct
                      ? "bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                      : "bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center">
                  {selectedOption === index && (
                    <>
                      {option.correct ? (
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                      )}
                    </>
                  )}
                  <span>{option.text}</span>
                </div>
              </button>
            ))}
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              onClick={handleNextQuestion}
              disabled={selectedOption === null}
            >
              {currentQuestion < questions.length - 1 ? "Next Question" : "Complete Quiz"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WordQuiz;
