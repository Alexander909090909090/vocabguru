
import AIChatInterface from "@/components/AIChatInterface";
import WordSection from "@/components/WordSection";
import { Word } from "@/data/words";
import { MessageSquare, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
  
  // Create a comprehensive morpheme analysis prompt
  const getComprehensivePrompt = () => {
    return `Please provide a comprehensive morphological analysis of the word "${word.word}" including:
1. Complete breakdown of its prefix, root, and suffix
2. The etymology and historical origins from ${word.languageOrigin || "its origin language"}
3. How the morphemes combine to create the current meaning
4. Examples of other words that share these morphemes
`;
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
          Try asking for a "comprehensive breakdown" to see detailed morphological analysis.
        </p>
        
        <Card className="p-3 mb-4 bg-secondary/30 border-none">
          <h4 className="text-sm font-medium mb-2">Suggested Prompts:</h4>
          <div className="space-y-2">
            <div 
              className="text-xs bg-primary/10 p-2 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
              onClick={() => document.getElementById('message-input')?.setAttribute('value', getMorphemePrompt())}
            >
              <MessageSquare className="h-3 w-3 text-primary inline mr-1" />
              <span>"{getMorphemePrompt()}"</span>
            </div>
            
            <div 
              className="text-xs bg-primary/10 p-2 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
              onClick={() => document.getElementById('message-input')?.setAttribute('value', getComprehensivePrompt())}
            >
              <MessageSquare className="h-3 w-3 text-primary inline mr-1" />
              <span>"Give me a comprehensive morphological analysis of this word"</span>
            </div>
            
            <div 
              className="text-xs bg-primary/10 p-2 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors"
              onClick={() => document.getElementById('message-input')?.setAttribute('value', `What other words contain the root "${word.morphemeBreakdown.root.text}"?`)}
            >
              <MessageSquare className="h-3 w-3 text-primary inline mr-1" />
              <span>"What other words contain the root "${word.morphemeBreakdown.root.text}"?"</span>
            </div>
          </div>
        </Card>
        
        <AIChatInterface currentWord={word} />
      </WordSection>
    </div>
  );
};

export default AIAssistantTab;
