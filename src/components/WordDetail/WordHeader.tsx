
import { Word } from "@/data/words";
import { Badge } from "@/components/ui/badge";
import { VoicePronounciation } from "./VoicePronounciation";

interface WordHeaderProps {
  word: Word;
  getGradient: (id: string) => string;
  isLoading: boolean;
}

const WordHeader = ({ word, getGradient, isLoading }: WordHeaderProps) => {

  return (
    <div 
      className={`rounded-xl p-4 sm:p-6 mb-8 ${isLoading ? 'opacity-0' : 'opacity-100 animate-scale-in'}`}
      style={{ 
        background: getGradient(word.id),
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <Badge variant="outline" className="bg-black/30 backdrop-blur-sm text-white mb-2 border-none text-xs sm:text-sm">
            {word.partOfSpeech}
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 break-words">
            {word.word}
          </h1>
          
          <div className="mb-3">
            <VoicePronounciation 
              word={word.word}
              pronunciation={word.pronunciation}
              morphemeBreakdown={word.morphemeBreakdown}
            />
          </div>
        </div>
        
        <Badge variant="outline" className="bg-white/20 backdrop-blur-sm text-white border-none text-xs sm:text-sm self-start md:self-end">
          {word.languageOrigin || "Unknown Origin"}
        </Badge>
      </div>
      
      <p className="text-white/90 mt-4 max-w-3xl text-sm sm:text-base leading-relaxed">
        {word.description}
      </p>
    </div>
  );
};

export default WordHeader;
