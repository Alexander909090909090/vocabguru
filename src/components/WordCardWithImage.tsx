
import React from 'react';
import { Link } from 'react-router-dom';
import { Word } from '@/data/words';
import SimpleWordBreakdown from '@/components/SimpleWordBreakdown';
import LearnedButton from '@/components/LearnedButton';
import { Button } from '@/components/ui/button';

interface WordCardWithImageProps {
  word: Word;
}

const WordCardWithImage: React.FC<WordCardWithImageProps> = ({ word }) => {
  // Create color gradient based on word id for consistent colors
  const getGradient = (id: string) => {
    // Simple hash function for the word id
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Use the hash to generate hue values
    const hue1 = hash % 360;
    const hue2 = (hash * 7) % 360;
    
    return `linear-gradient(135deg, hsl(${hue1}, 70%, 65%), hsl(${hue2}, 70%, 55%))`;
  };

  // Check if the word has images
  const hasImage = word.images && word.images.length > 0;

  return (
    <div className="glass-card overflow-hidden rounded-xl hover-card">
      <div 
        className="h-32 relative overflow-hidden flex items-center justify-center"
        style={{ 
          background: hasImage ? 'none' : getGradient(word.id),
          padding: 0
        }}
      >
        {hasImage ? (
          <img 
            src={word.images[0].url} 
            alt={word.images[0].alt || `Image for ${word.word}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <h3 className="text-2xl font-bold text-white">{word.word}</h3>
        )}
        
        {word.featured && (
          <div className="absolute top-2 right-2">
            <span className="chip bg-black/30 backdrop-blur-sm text-white text-xs">
              Featured
            </span>
          </div>
        )}
        
        {hasImage && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <h3 className="text-2xl font-bold text-white p-3">{word.word}</h3>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <SimpleWordBreakdown 
          prefix={word.morphemeBreakdown.prefix?.text}
          root={word.morphemeBreakdown.root.text}
          suffix={word.morphemeBreakdown.suffix?.text}
          className="mb-2"
        />
        
        <p className="text-sm line-clamp-2 mb-3">{word.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="chip bg-secondary text-secondary-foreground text-xs">
            {word.languageOrigin}
          </span>
          
          <div className="flex gap-2">
            <LearnedButton wordId={word.id} showText={false} size="sm" />
            <Link to={`/word/${word.id}`}>
              <Button variant="default" size="sm">View</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordCardWithImage;
