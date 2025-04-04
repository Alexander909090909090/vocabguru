
import AIChatInterface from "@/components/AIChatInterface";
import WordSection from "@/components/WordSection";
import { Word } from "@/data/words";
import { MessageSquare, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AIAssistantTabProps {
  word: Word;
}

const AIAssistantTab = ({ word }: AIAssistantTabProps) => {
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
          <span>Quick prompt: "How do the morphemes in {word.word} contribute to its meaning?"</span>
        </div>
        
        <AIChatInterface currentWord={word} />
      </WordSection>
    </div>
  );
};

export default AIAssistantTab;
