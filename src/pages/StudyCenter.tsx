import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SmartSearch from "@/components/SmartSearch/SmartSearch";
import StudySession from "@/components/WordLearning/StudySession";
import { WordRepositoryEntry, WordRepositoryService } from "@/services/wordRepositoryService";
import { BookOpen, Brain, Target, Trophy, Play, Settings } from "lucide-react";
import { toast } from "sonner";

interface StudyResults {
  totalWords: number;
  correctAnswers: number;
  timeSpent: number;
  wordsStudied: string[];
  difficultyAreas: string[];
}

const StudyCenter = () => {
  const [isInSession, setIsInSession] = useState(false);
  const [sessionWords, setSessionWords] = useState<WordRepositoryEntry[]>([]);
  const [searchResults, setSearchResults] = useState<WordRepositoryEntry[]>([]);
  const [recentWords, setRecentWords] = useState<WordRepositoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecentWords();
  }, []);

  const loadRecentWords = async () => {
    try {
      const { words } = await WordRepositoryService.getWordsWithPagination(0, 10);
      setRecentWords(words);
    } catch (error) {
      console.error('Error loading recent words:', error);
    }
  };

  const startStudySession = (words: WordRepositoryEntry[]) => {
    if (words.length === 0) {
      toast.error('Please select some words to study');
      return;
    }
    
    setSessionWords(words);
    setIsInSession(true);
  };

  const handleSessionComplete = (results: StudyResults) => {
    setIsInSession(false);
    
    toast.success(
      `Session complete! You got ${results.correctAnswers}/${results.totalWords} correct in ${Math.floor(results.timeSpent / 60)}:${(results.timeSpent % 60).toString().padStart(2, '0')}`
    );

    // Save session results (in a real app, this would go to the database)
    const sessionData = {
      date: new Date().toISOString(),
      results
    };
    
    const savedSessions = JSON.parse(localStorage.getItem('vocabguru-study-sessions') || '[]');
    savedSessions.unshift(sessionData);
    localStorage.setItem('vocabguru-study-sessions', JSON.stringify(savedSessions.slice(0, 20)));
  };

  const studyModes = [
    {
      title: "Quick Review",
      description: "Study 10 random words",
      icon: BookOpen,
      action: () => startStudySession(recentWords.slice(0, 10)),
      color: "bg-blue-500"
    },
    {
      title: "Focused Study",
      description: "Study words from search results",
      icon: Brain,
      action: () => startStudySession(searchResults),
      color: "bg-purple-500",
      disabled: searchResults.length === 0
    },
    {
      title: "Challenge Mode",
      description: "Advanced vocabulary challenge",
      icon: Target,
      action: () => {
        const challengeWords = recentWords.filter(w => w.difficulty_level === 'advanced' || w.difficulty_level === 'expert');
        startStudySession(challengeWords.length ? challengeWords : recentWords.slice(0, 15));
      },
      color: "bg-red-500"
    },
    {
      title: "Achievement Hunt",
      description: "Work towards new achievements",
      icon: Trophy,
      action: () => startStudySession(recentWords.slice(0, 20)),
      color: "bg-yellow-500"
    }
  ];

  if (isInSession) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="page-container pt-24">
          <StudySession
            words={sessionWords}
            onComplete={handleSessionComplete}
            onExit={() => setIsInSession(false)}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="page-container pt-24">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Study Center
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Master vocabulary with AI-powered study sessions, personalized learning paths, and intelligent spaced repetition.
            </p>
          </div>

          {/* Study Modes */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Choose Your Study Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {studyModes.map((mode, index) => {
                const Icon = mode.icon;
                return (
                  <Card 
                    key={index} 
                    className={`hover-card cursor-pointer transition-all ${mode.disabled ? 'opacity-50' : ''}`}
                    onClick={mode.disabled ? undefined : mode.action}
                  >
                    <CardHeader className="pb-3">
                      <div className={`w-12 h-12 rounded-lg ${mode.color} flex items-center justify-center mb-3`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{mode.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm mb-4">
                        {mode.description}
                      </p>
                      <Button 
                        size="sm" 
                        className="w-full gap-2"
                        disabled={mode.disabled}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!mode.disabled) mode.action();
                        }}
                      >
                        <Play className="h-4 w-4" />
                        Start
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Smart Search */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Find Words to Study</h2>
            <Card>
              <CardContent className="p-6">
                <SmartSearch
                  onResults={setSearchResults}
                  onLoading={setLoading}
                />
                
                {searchResults.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Search Results ({searchResults.length} words)</h3>
                      <Button onClick={() => startStudySession(searchResults)} size="sm">
                        Study These Words
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                      {searchResults.map((word) => (
                        <Card key={word.id} className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{word.word}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {word.difficulty_level}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {word.definitions.primary}
                            </p>
                            <div className="flex gap-1">
                              <Badge variant="outline" className="text-xs">
                                {word.analysis.parts_of_speech}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {word.etymology.language_of_origin}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Recent Progress */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Your Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    Words Studied
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-500">247</div>
                  <p className="text-sm text-muted-foreground">+12 this week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    Accuracy Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-500">87%</div>
                  <p className="text-sm text-muted-foreground">+5% improvement</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Study Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-500">12</div>
                  <p className="text-sm text-muted-foreground">days in a row</p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
      
      <footer className="border-t border-white/10 mt-12 py-6">
        <div className="container-inner text-center text-sm text-muted-foreground">
          <p>© 2024 VocabGuru. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default StudyCenter;
