
import { useState, useEffect } from "react";
import { Word } from "@/data/words";
import WordCard from "@/components/WordCard";
import { Button } from "@/components/ui/button";
import { CalendarDays, Trophy } from "lucide-react";

interface DailyWordProps {
  words: Word[];
}

export function DailyWord({ words }: DailyWordProps) {
  const [dailyWord, setDailyWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (words.length > 0) {
      selectDailyWord();
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Word of the Day</h2>
        </div>
        <div className="flex items-center">
          <Trophy className="text-amber-500 h-5 w-5 mr-1" />
          <span className="text-sm font-medium">Learn daily to earn streaks</span>
        </div>
      </div>
      
      <div className="relative">
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
            Today's Word
          </span>
        </div>
        <WordCard word={dailyWord} priority={true} />
      </div>
      
      <div className="flex justify-center">
        <Button asChild>
          <a href={`/word/${dailyWord.id}`}>
            Study Today's Word
          </a>
        </Button>
      </div>
    </div>
  );
}

export default DailyWord;
