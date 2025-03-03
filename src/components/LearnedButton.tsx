
import React from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';

interface LearnedButtonProps {
  wordId: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const LearnedButton: React.FC<LearnedButtonProps> = ({ 
  wordId,
  size = 'md',
  showText = true
}) => {
  const { isWordLearned, markWordAsLearned } = useAppContext();
  const isLearned = isWordLearned(wordId);
  
  const handleToggleLearnedStatus = () => {
    markWordAsLearned(wordId);
  };
  
  // Size-based styling
  const sizeClasses = {
    sm: showText ? 'text-xs px-2 py-1' : 'h-6 w-6 p-0',
    md: showText ? 'text-sm px-3 py-1.5' : 'h-8 w-8 p-0',
    lg: showText ? 'text-base px-4 py-2' : 'h-10 w-10 p-0'
  };
  
  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };
  
  return (
    <Button
      onClick={handleToggleLearnedStatus}
      variant={isLearned ? "secondary" : "outline"}
      size={showText ? "sm" : "icon"}
      className={`${sizeClasses[size]} ${isLearned ? 'bg-secondary/50 dark:bg-secondary/30' : ''}`}
      aria-label={isLearned ? "Mark as not learned" : "Mark as learned"}
      title={isLearned ? "Mark as not learned" : "Mark as learned"}
    >
      {isLearned ? (
        <>
          <Check size={iconSizes[size]} />
          {showText && <span>Learned</span>}
        </>
      ) : (
        <>
          <X size={iconSizes[size]} className="opacity-50" />
          {showText && <span>Mark as Learned</span>}
        </>
      )}
    </Button>
  );
};

export default LearnedButton;
