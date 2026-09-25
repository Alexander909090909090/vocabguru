import { useState, useCallback } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

interface VoicePronunciationProps {
  word: string;
  pronunciation?: string;
  phonetic?: string;
  morphemeBreakdown?: {
    prefix?: { text: string; meaning: string };
    root: { text: string; meaning: string };
    suffix?: { text: string; meaning: string };
  };
}

export function VoicePronounciation({ 
  word, 
  pronunciation, 
  phonetic,
  morphemeBreakdown 
}: VoicePronunciationProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSupported] = useState(() => 'speechSynthesis' in window);

  const speakText = useCallback((text: string, rate: number = 1) => {
    if (!speechSupported) {
      toast({
        title: "Speech not supported",
        description: "Your browser doesn't support text-to-speech",
        variant: "destructive"
      });
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => {
      setIsPlaying(false);
      toast({
        title: "Speech error",
        description: "Failed to pronounce the word",
        variant: "destructive"
      });
    };

    window.speechSynthesis.speak(utterance);
  }, [speechSupported]);

  const stopSpeech = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  const speakWord = () => speakText(word, 0.8);
  const speakMorphemes = () => {
    if (!morphemeBreakdown) return;
    
    let morphemeText = '';
    if (morphemeBreakdown.prefix) {
      morphemeText += `Prefix: ${morphemeBreakdown.prefix.text}, meaning ${morphemeBreakdown.prefix.meaning}. `;
    }
    morphemeText += `Root: ${morphemeBreakdown.root.text}, meaning ${morphemeBreakdown.root.meaning}. `;
    if (morphemeBreakdown.suffix) {
      morphemeText += `Suffix: ${morphemeBreakdown.suffix.text}, meaning ${morphemeBreakdown.suffix.meaning}.`;
    }
    
    speakText(morphemeText, 0.9);
  };

  if (!speechSupported) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <VolumeX size={16} />
        <span className="text-sm">Voice not available</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main word pronunciation */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={isPlaying ? stopSpeech : speakWord}
          className="flex items-center gap-2"
        >
          {isPlaying ? <Pause size={16} /> : <Volume2 size={16} />}
          {isPlaying ? 'Stop' : 'Pronounce'}
        </Button>
        
        {pronunciation && (
          <Badge variant="secondary" className="font-mono text-sm">
            {pronunciation}
          </Badge>
        )}
        
        {phonetic && (
          <Badge variant="outline" className="font-mono text-sm">
            /{phonetic}/
          </Badge>
        )}
      </div>

      {/* Morpheme pronunciation */}
      {morphemeBreakdown && (
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={speakMorphemes}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Play size={14} />
            <span className="text-sm">Explain Morphemes</span>
          </Button>
        </div>
      )}

      {/* Individual morpheme pronunciation */}
      {morphemeBreakdown && (
        <div className="flex flex-wrap gap-2">
          {morphemeBreakdown.prefix && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => speakText(`${morphemeBreakdown.prefix!.text}, meaning ${morphemeBreakdown.prefix!.meaning}`)}
              className="text-xs px-2 py-1 h-auto"
            >
              🔊 {morphemeBreakdown.prefix.text}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => speakText(`${morphemeBreakdown.root.text}, meaning ${morphemeBreakdown.root.meaning}`)}
            className="text-xs px-2 py-1 h-auto font-medium"
          >
            🔊 {morphemeBreakdown.root.text}
          </Button>
          
          {morphemeBreakdown.suffix && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => speakText(`${morphemeBreakdown.suffix!.text}, meaning ${morphemeBreakdown.suffix!.meaning}`)}
              className="text-xs px-2 py-1 h-auto"
            >
              🔊 {morphemeBreakdown.suffix.text}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}