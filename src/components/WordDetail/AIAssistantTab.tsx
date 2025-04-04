
import AIChatInterface from "@/components/AIChatInterface";
import WordSection from "@/components/WordSection";
import { Word } from "@/data/words";
import { MessageSquare, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AIAssistantTabProps {
  word: Word;
}

const AIAssistantTab = ({ word }: AIAssistantTabProps) => {
  // Create a targeted prompt based on the word's morphological structure
  const getMorphemePrompt = () => {
    const parts = [];
    if (word.morphemeBreakdown.prefix) {
      parts.push(`the prefix "${word.morphemeBreakdown.prefix.text}" (meaning: ${word.morphemeBreakdown.prefix.meaning})`);
    }
    
    parts.push(`the root "${word.morphemeBreakdown.root.text}" (meaning: ${word.morphemeBreakdown.root.meaning})`);
    
    if (word.morphemeBreakdown.suffix) {
      parts.push(`the suffix "${word.morphemeBreakdown.suffix.text}" (meaning: ${word.morphemeBreakdown.suffix.meaning})`);
    }
    
    return parts.length > 1 
      ? `How do ${parts.join(', ')} combine to form the meaning of "${word.word}"?` 
      : `What does the root "${word.morphemeBreakdown.root.text}" tell us about the word "${word.word}"?`;
  };

  return (
    <div className="mt-6">
      <WordSection title="AI Language Assistant" className="mb-0">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <Badge variant="outline" className="bg-primary/10">
            Morphological Analysis
          </Badge>
        </div>
        
        <p className="mb-4 text-sm text-muted-foreground">
          Ask questions about {word.word}'s etymology, usage, or morphological structure. 
          Try asking "What is the meaning of the {word.morphemeBreakdown.root.text} root?" for targeted analysis.
        </p>
        
        <div className="flex items-center gap-2 mb-4 text-xs bg-secondary/50 p-2 rounded-lg">
          <MessageSquare className="h-3 w-3 text-primary" />
          <span>Quick prompt: "{getMorphemePrompt()}"</span>
        </div>
        
        <AIChatInterface currentWord={word} />
      </WordSection>
    </div>
  );
};

export default AIAssistantTab;
