
import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface PronunciationPlayerProps {
  word: string;
  size?: 'sm' | 'md' | 'lg';
}

const PronunciationPlayer: React.FC<PronunciationPlayerProps> = ({ 
  word,
  size = 'md'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Determine if speech synthesis is supported
  const isSpeechSupported = 'speechSynthesis' in window;
  
  const handlePlayPronunciation = () => {
    if (!isSpeechSupported) {
      toast({
        title: "Speech not supported",
        description: "Your browser doesn't support text-to-speech functionality.",
        variant: "destructive"
      });
      return;
    }
    
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(word);
    
    // Set up event handlers
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
      toast({
        title: "Pronunciation failed",
        description: "There was an issue playing the pronunciation.",
        variant: "destructive"
      });
    };
    
    // Speak the word
    window.speechSynthesis.speak(utterance);
  };
  
  // Size-based styling
  const sizeClasses = {
    sm: 'h-6 w-6 p-0',
    md: 'h-8 w-8 p-0',
    lg: 'h-10 w-10 p-0'
  };
  
  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 24
  };
  
  return (
    <Button
      onClick={handlePlayPronunciation}
      variant="ghost"
      size="icon"
      className={`rounded-full ${sizeClasses[size]} ${isPlaying ? 'bg-accent' : ''}`}
      aria-label={isPlaying ? "Stop pronunciation" : "Pronounce word"}
      title={isPlaying ? "Stop pronunciation" : "Pronounce word"}
    >
      {isPlaying ? (
        <VolumeX className="text-muted-foreground" size={iconSizes[size]} />
      ) : (
        <Volume2 className="text-muted-foreground" size={iconSizes[size]} />
      )}
    </Button>
  );
};

export default PronunciationPlayer;
