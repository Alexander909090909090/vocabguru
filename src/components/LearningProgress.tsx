
import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Progress } from '@/components/ui/progress';

const LearningProgress: React.FC = () => {
  const { getLearnedWordsCount, totalWordsCount } = useAppContext();
  
  const learnedCount = getLearnedWordsCount();
  const percentage = totalWordsCount > 0 
    ? Math.round((learnedCount / totalWordsCount) * 100) 
    : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">
          You've learned {learnedCount} out of {totalWordsCount} words ({percentage}%)
        </p>
      </div>
      
      <Progress value={percentage} className="h-2" />
      
      {learnedCount === 0 && totalWordsCount > 0 && (
        <p className="text-xs text-muted-foreground italic">
          Mark words as learned to track your progress
        </p>
      )}
      
      {learnedCount === totalWordsCount && totalWordsCount > 0 && (
        <p className="text-xs text-accent-foreground font-medium">
          Congratulations! You've learned all available words.
        </p>
      )}
    </div>
  );
};

export default LearningProgress;
