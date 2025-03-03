
import { useState, useEffect } from "react";
import { Word } from "@/data/words";
import WordCard from "@/components/WordCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Trophy, Lightbulb, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import PronunciationPlayer from "@/components/PronunciationPlayer";

interface DailyWordProps {
  words: Word[];
}

export function DailyWord({ words }: DailyWordProps) {
  const [dailyWord, setDailyWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (words.length > 0) {
      selectDailyWord();
      loadStreak();
      setLoading(false);
    }
  }, [words]);

  const selectDailyWord = () => {
    // Use the current date to seed our random selection
    // so it's consistent throughout the day
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    
    // Simple hash function to convert dateString to a number
    const hash = dateString.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + acc;
    }, 0);
    
    // Use the hash to select a word from the array
    const index = hash % words.length;
    setDailyWord(words[index]);
    
    // Check if this is a new day and update streak
    updateStreak(dateString);
  };
  
  const loadStreak = () => {
    const streakInfo = JSON.parse(localStorage.getItem('streakInfo') || '{"streak": 0, "lastDate": ""}');
    setStreak(streakInfo.streak);
  };
  
  const updateStreak = (currentDateString: string) => {
    const streakInfo = JSON.parse(localStorage.getItem('streakInfo') || '{"streak": 0, "lastDate": ""}');
    
    // If this is a new day (not the same as lastDate), increment streak
    if (streakInfo.lastDate !== currentDateString) {
      // Check if this is the next consecutive day
      const lastDate = streakInfo.lastDate ? new Date(streakInfo.lastDate) : null;
      const currentDate = new Date(currentDateString);
      
      if (lastDate) {
        // Calculate the difference in days
        const timeDiff = currentDate.getTime() - lastDate.getTime();
        const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        if (dayDiff === 1) {
          // Consecutive day, increment streak
          streakInfo.streak += 1;
        } else if (dayDiff > 1) {
          // Missed days, reset streak
          streakInfo.streak = 1;
        }
        // If dayDiff is 0 (same day), don't change streak
      } else {
        // First time, set streak to 1
        streakInfo.streak = 1;
      }
      
      streakInfo.lastDate = currentDateString;
      localStorage.setItem('streakInfo', JSON.stringify(streakInfo));
      setStreak(streakInfo.streak);
    }
  };

  if (loading) {
    return <div className="h-64 w-full rounded-xl bg-gray-200 animate-pulse"></div>;
  }

  if (!dailyWord) {
    return (
      <div className="text-center p-8 bg-muted rounded-xl">
        <p>No words available for today. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Word of the Day</h2>
        </div>
        <div className="flex items-center">
          <Trophy className="text-amber-500 h-5 w-5 mr-1" />
          <span className="text-sm font-medium">{streak} Day Streak</span>
        </div>
      </div>
      
      <Card className="overflow-hidden border-2 border-primary/20">
        <CardHeader className="bg-primary/10 pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="bg-primary text-primary-foreground">
              Today's Word
            </Badge>
            <PronunciationPlayer 
              word={dailyWord.word} 
              pronunciation={dailyWord.pronunciation} 
            />
          </div>
          <CardTitle className="text-3xl mt-2">
            {dailyWord.word}
          </CardTitle>
          <CardDescription>
            {dailyWord.partOfSpeech} • {dailyWord.languageOrigin} Origin
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            {dailyWord.definitions && dailyWord.definitions.length > 0 && (
              <div>
                <h4 className="text-sm text-muted-foreground mb-1">Definition</h4>
                <p className="text-lg">{dailyWord.definitions[0].text}</p>
              </div>
            )}
            
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Morpheme Breakdown</h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {dailyWord.morphemeBreakdown.prefix && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                    <h5 className="text-xs text-muted-foreground">Prefix</h5>
                    <p className="font-medium text-blue-700 dark:text-blue-300">
                      {dailyWord.morphemeBreakdown.prefix.text}
                    </p>
                    <p className="text-sm">{dailyWord.morphemeBreakdown.prefix.meaning}</p>
                  </div>
                )}
                
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                  <h5 className="text-xs text-muted-foreground">Root</h5>
                  <p className="font-medium text-green-700 dark:text-green-300">
                    {dailyWord.morphemeBreakdown.root.text}
                  </p>
                  <p className="text-sm">{dailyWord.morphemeBreakdown.root.meaning}</p>
                </div>
                
                {dailyWord.morphemeBreakdown.suffix && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
                    <h5 className="text-xs text-muted-foreground">Suffix</h5>
                    <p className="font-medium text-amber-700 dark:text-amber-300">
                      {dailyWord.morphemeBreakdown.suffix.text}
                    </p>
                    <p className="text-sm">{dailyWord.morphemeBreakdown.suffix.meaning}</p>
                  </div>
                )}
              </div>
            </div>
            
            {dailyWord.usage && dailyWord.usage.exampleSentence && (
              <div>
                <h4 className="text-sm text-muted-foreground mb-1">Example</h4>
                <p className="italic">"{dailyWord.usage.exampleSentence}"</p>
              </div>
            )}
            
            <Button asChild className="w-full">
              <Link to={`/word/${dailyWord.id}`} className="flex items-center justify-center gap-1">
                Study in Detail
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DailyWord;
