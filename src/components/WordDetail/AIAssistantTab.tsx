
import AIChatInterface from "@/components/AIChatInterface";
import WordSection from "@/components/WordSection";
import { Word } from "@/data/words";

interface AIAssistantTabProps {
  word: Word;
}

const AIAssistantTab = ({ word }: AIAssistantTabProps) => {
  return (
    <div className="mt-6">
      <WordSection title="AI Language Assistant" className="mb-0">
        <p className="mb-4 text-sm text-muted-foreground">
          Ask questions about this word's etymology, usage, or morphological structure. 
          Try asking "What is the etymology of {word.word}?" to see a detailed breakdown.
        </p>
        <AIChatInterface currentWord={word} />
      </WordSection>
    </div>
  );
};

export default AIAssistantTab;
