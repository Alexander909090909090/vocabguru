
import { ThumbsUp, ThumbsDown, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message } from "@/types/chat";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface MessageItemProps {
  message: Message;
  handleFeedback: (messageId: string, type: 'like' | 'dislike') => void;
  formatTimestamp: (date: Date) => string;
}

const MessageItem = ({ message, handleFeedback, formatTimestamp }: MessageItemProps) => {
  // Safe text formatting without HTML injection
  const formatText = (text: string) => {
    // Ensure text is a string and handle edge cases
    if (typeof text !== 'string' || !text) {
      return <div>No content available</div>;
    }

    // Split text into lines and format safely
    const lines = text.split('\n');
    const formattedElements: JSX.Element[] = [];

    lines.forEach((line, index) => {
      // Handle headers
      if (line.startsWith('# ')) {
        formattedElements.push(
          <h3 key={index} className="text-lg font-bold mt-3 mb-2">
            {line.substring(2)}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        formattedElements.push(
          <h4 key={index} className="text-base font-semibold mt-2 mb-1">
            {line.substring(3)}
          </h4>
        );
      } else if (line.startsWith('### ')) {
        formattedElements.push(
          <h5 key={index} className="text-sm font-medium mt-2 mb-1">
            {line.substring(4)}
          </h5>
        );
      } else if (line.trim().startsWith('- ')) {
        // Handle list items
        formattedElements.push(
          <li key={index} className="ml-4">
            {formatInlineText(line.substring(2))}
          </li>
        );
      } else if (line.trim() === '') {
        // Handle empty lines
        formattedElements.push(<br key={index} />);
      } else {
        // Handle regular text
        formattedElements.push(
          <p key={index} className="mb-1">
            {formatInlineText(line)}
          </p>
        );
      }
    });

    return <div>{formattedElements}</div>;
  };

  // Safe inline text formatting without HTML injection
  const formatInlineText = (text: string) => {
    // Handle bold text **text**
    const parts = text.split(/(\*\*.*?\*\*)/);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Ensure message.text is a string
  const messageText = typeof message.text === 'string' ? message.text : 'No content available';

  return (
    <div 
      className={`flex flex-col ${
        message.sender === "user" ? "items-end" : "items-start"
      }`}
    >
      <div className={`max-w-[80%] p-3 rounded-lg ${
        message.sender === "user" 
          ? "bg-primary text-primary-foreground" 
          : "bg-card/90 backdrop-blur-sm border border-white/10"
      }`}>
        <div className="whitespace-pre-line">
          {message.sender === "ai" ? formatText(messageText) : messageText}
        </div>
        
        {/* Dictionary information if available */}
        {message.dictionary && (
          <div className="mt-2 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4" />
              <Badge variant="outline" className="text-xs">
                {message.dictionary.source === "merriam-webster" ? "Merriam-Webster" : "Free Dictionary"}
              </Badge>
            </div>
            
            {message.dictionary.word && (
              <div className="font-semibold mt-1">{message.dictionary.word}</div>
            )}
            
            {message.dictionary.partOfSpeech && (
              <div className="text-sm italic">{message.dictionary.partOfSpeech}</div>
            )}
            
            {message.dictionary.definition && (
              <div className="mt-1">{message.dictionary.definition}</div>
            )}
            
            {message.dictionary.etymology && (
              <div className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium">Etymology:</span> {message.dictionary.etymology}
              </div>
            )}
          </div>
        )}
      </div>
      
      {message.sender === "ai" && message.id !== "welcome" && (
        <div className="flex items-center gap-2 mt-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-6 w-6 ${message.liked ? 'text-primary' : ''}`}
            onClick={() => handleFeedback(message.id, 'like')}
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-6 w-6 ${message.disliked ? 'text-primary' : ''}`}
            onClick={() => handleFeedback(message.id, 'dislike')}
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
      )}
      
      {message.sender === "user" && (
        <span className="text-xs text-muted-foreground mt-1">
          {formatTimestamp(message.timestamp)}
        </span>
      )}
    </div>
  );
};

export default MessageItem;
