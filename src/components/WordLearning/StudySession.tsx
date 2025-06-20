
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, RotateCcw, Volume2, BookOpen } from "lucide-react";
import { WordRepositoryEntry } from "@/services/wordRepositoryService";
import { toast } from "sonner";

interface StudySessionProps {
  words: WordRepositoryEntry[];
  onComplete: (results: StudyResults) => void;
  onExit: () => void;
}

interface StudyResults {
  totalWords: number;
  correctAnswers: number;
  timeSpent: number;
  wordsStudied: string[];
  difficultyAreas: string[];
}

type StudyMode = 'definition' | 'etymology' | 'usage' | 'morphemes';

export function StudySession({ words, onComplete, onExit }: StudySessionProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [studyMode, setStudyMode] = useState<StudyMode>('definition');
  const [showAnswer, setShowAnswer] = useState(false);
  const [userResponses, setUserResponses] = useState<('correct' | 'incorrect' | null)[]>(new Array(words.length).fill(null));
  const [startTime] = useState(Date.now());
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    skipped: 0
  });

  const currentWord = words[currentWordIndex];
  const progress = ((currentWordIndex + 1) / words.length) * 100;

  const studyModes = [
    { key: 'definition' as const, label: 'Definition', icon: BookOpen },
    { key: 'etymology' as const, label: 'Etymology', icon: RotateCcw },
    { key: 'usage' as const, label: 'Usage', icon: Volume2 },
    { key: 'morphemes' as const, label: 'Word Parts', icon: CheckCircle },
  ];

  const playAudio = (audioUrl: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(e => console.log('Audio playback failed:', e));
    }
  };

  const handleResponse = (isCorrect: boolean) => {
    const newResponses = [...userResponses];
    newResponses[currentWordIndex] = isCorrect ? 'correct' : 'incorrect';
    setUserResponses(newResponses);

    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1)
    }));

    setShowAnswer(true);
    
    setTimeout(() => {
      nextWord();
    }, 2000);
  };

  const nextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      completeSession();
    }
  };

  const completeSession = () => {
    const timeSpent = Date.now() - startTime;
    const results: StudyResults = {
      totalWords: words.length,
      correctAnswers: sessionStats.correct,
      timeSpent: Math.floor(timeSpent / 1000),
      wordsStudied: words.map(w => w.word),
      difficultyAreas: words
        .filter((_, index) => userResponses[index] === 'incorrect')
        .map(w => w.word)
    };

    onComplete(results);
  };

  const getStudyContent = () => {
    switch (studyMode) {
      case 'definition':
        return {
          question: `What does "${currentWord.word}" mean?`,
          answer: currentWord.definitions_data.primary || 'No definition available',
          hint: `Part of speech: ${currentWord.analysis_data.parts_of_speech || 'Unknown'}`
        };
      case 'etymology':
        return {
          question: `What is the origin of "${currentWord.word}"?`,
          answer: currentWord.etymology_data.historical_origins || 'Origin unknown',
          hint: `Language of origin: ${currentWord.etymology_data.language_of_origin || 'Unknown'}`
        };
      case 'usage':
        return {
          question: `How would you use "${currentWord.word}" in a sentence?`,
          answer: currentWord.analysis_data.usage_examples?.[0] || currentWord.analysis_data.example_sentence || 'No example available',
          hint: `Context: ${currentWord.definitions_data.contextual || 'General usage'}`
        };
      case 'morphemes':
        return {
          question: `Break down the word parts of "${currentWord.word}"`,
          answer: `Root: ${currentWord.morpheme_data.root.text} (${currentWord.morpheme_data.root.meaning})${
            currentWord.morpheme_data.prefix ? `\nPrefix: ${currentWord.morpheme_data.prefix.text} (${currentWord.morpheme_data.prefix.meaning})` : ''
          }${
            currentWord.morpheme_data.suffix ? `\nSuffix: ${currentWord.morpheme_data.suffix.text} (${currentWord.morpheme_data.suffix.meaning})` : ''
          }`,
          hint: 'Think about prefixes, roots, and suffixes'
        };
      default:
        return { question: '', answer: '', hint: '' };
    }
  };

  const studyContent = getStudyContent();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Session Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Study Session</CardTitle>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {currentWordIndex + 1} of {words.length}
              </div>
              <Button variant="outline" size="sm" onClick={onExit}>
                Exit Session
              </Button>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
      </Card>

      {/* Study Mode Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {studyModes.map(mode => {
              const Icon = mode.icon;
              return (
                <Button
                  key={mode.key}
                  variant={studyMode === mode.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStudyMode(mode.key)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {mode.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Study Card */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{currentWord.word}</h2>
              {currentWord.phonetic && (
                <Badge variant="secondary">{currentWord.phonetic}</Badge>
              )}
              {currentWord.audio_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => playAudio(currentWord.audio_url!)}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex gap-2 text-sm">
              <Badge variant="outline" className="text-green-600">
                ✓ {sessionStats.correct}
              </Badge>
              <Badge variant="outline" className="text-red-600">
                ✗ {sessionStats.incorrect}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">{studyContent.question}</h3>
            
            {!showAnswer && (
              <div className="space-y-4">
                <p className="text-muted-foreground italic">
                  {studyContent.hint}
                </p>
                <div className="flex justify-center gap-4">
                  <Button onClick={() => setShowAnswer(true)}>
                    Show Answer
                  </Button>
                </div>
              </div>
            )}

            {showAnswer && (
              <div className="space-y-4">
                <Card className="bg-secondary/50">
                  <CardContent className="p-4">
                    <p className="whitespace-pre-line">{studyContent.answer}</p>
                  </CardContent>
                </Card>
                
                <div className="space-y-3">
                  <p className="text-sm font-medium">How well did you know this?</p>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => handleResponse(false)}
                      className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Need Practice
                    </Button>
                    <Button
                      onClick={() => handleResponse(true)}
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Got It!
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      {showAnswer && (
        <div className="flex justify-center">
          <Button onClick={nextWord} size="lg">
            {currentWordIndex < words.length - 1 ? 'Next Word' : 'Complete Session'}
          </Button>
        </div>
      )}
    </div>
  );
}

export default StudySession;
