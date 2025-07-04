
import { EnhancedWordProfile } from "@/types/enhancedWordProfile";
import { ComprehensiveWordAnalysis } from "./ComprehensiveWordAnalysis";

interface EnhancedWordContentProps {
  wordProfile: EnhancedWordProfile;
}

const EnhancedWordContent = ({ wordProfile }: EnhancedWordContentProps) => {
  return (
    <div className="mt-6">
      <ComprehensiveWordAnalysis wordProfile={wordProfile} />
    </div>
  );
};

const getOrdinal = (num: number): string => {
  const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'];
  return ordinals[num - 1] || `${num}th`;
};

export default EnhancedWordContent;
