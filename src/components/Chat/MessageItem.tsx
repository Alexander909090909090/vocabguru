
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
        <div className="whitespace-pre-line">{message.text}</div>
        
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
