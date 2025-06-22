
import { EnhancedWordProfile } from "@/types/enhancedWordProfile";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface WordHeaderProps {
  word: EnhancedWordProfile;
  getGradient: (id: string) => string;
  isLoading: boolean;
}

const WordHeader = ({ word, getGradient, isLoading }: WordHeaderProps) => {
  // Function to speak the word using the Web Speech API
  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
      
      toast({
        title: "Speaking",
        description: `Pronouncing: ${word.word}`,
      });
    } else {
      toast({
        title: "Speech Not Supported",
        description: "Your browser doesn't support speech synthesis",
        variant: "destructive",
      });
    }
  };

  return (
    <div 
      className={`rounded-xl p-6 mb-8 ${isLoading ? 'opacity-0' : 'opacity-100 animate-scale-in'}`}
      style={{ 
        background: getGradient(word.id),
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <Badge variant="outline" className="bg-black/30 backdrop-blur-sm text-white mb-2 border-none">
            {word.partOfSpeech}
          </Badge>
          <div className="flex items-center gap-2">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-1">
              {word.word}
            </h1>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={speakWord}
              aria-label="Pronounce word"
            >
              <Volume2 className="h-5 w-5" />
            </Button>
          </div>
          {word.pronunciation && (
            <p className="text-white/90 text-lg">
              {word.pronunciation}
            </p>
          )}
        </div>
        
        <Badge variant="outline" className="bg-white/20 backdrop-blur-sm text-white border-none">
          {word.languageOrigin || "Unknown Origin"}
        </Badge>
      </div>
      
      <p className="text-white/90 mt-4 max-w-3xl">
        {word.description}
      </p>
    </div>
  );
};

export default WordHeader;
