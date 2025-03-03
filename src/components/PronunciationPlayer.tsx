
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Pause } from "lucide-react";

interface PronunciationPlayerProps {
  word: string;
  pronunciation?: string;
}

export function PronunciationPlayer({ word, pronunciation }: PronunciationPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    // Initialize speech synthesis
    const utterance = new SpeechSynthesisUtterance(word);
    setAudio(utterance);
    
    // Get available voices
    const voicesAvailable = window.speechSynthesis.getVoices();
    setVoices(voicesAvailable);
    
    // Handle voice change event
    const voiceChangedHandler = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    
    window.speechSynthesis.onvoiceschanged = voiceChangedHandler;
    
    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [word]);

  useEffect(() => {
    if (!audio) return;
    
    // Try to find a good quality English voice
    const preferredVoices = voices.filter(
      voice => voice.lang.includes('en') && (voice.name.includes('Enhanced') || voice.name.includes('Premium'))
    );
    
    if (preferredVoices.length > 0) {
      audio.voice = preferredVoices[0];
    } else {
      // Fallback to any English voice
      const englishVoices = voices.filter(voice => voice.lang.includes('en'));
      if (englishVoices.length > 0) {
        audio.voice = englishVoices[0];
      }
    }
    
    // Set rate and pitch
    audio.rate = 0.9; // Slightly slower for clarity
    audio.pitch = 1;
    
    // Handle speech end event
    audio.onend = () => {
      setIsPlaying(false);
    };
    
    audio.onerror = () => {
      setIsPlaying(false);
      console.error("Error playing pronunciation");
    };
  }, [audio, voices]);

  const togglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      if (audio) {
        window.speechSynthesis.speak(audio);
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="rounded-full h-8 w-8 p-0" 
        onClick={togglePlay}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>
      {pronunciation && (
        <span className="text-sm text-muted-foreground">{pronunciation}</span>
      )}
    </div>
  );
}

export default PronunciationPlayer;
