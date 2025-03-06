
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message } from "@/types/chat";
import { toast } from "sonner";

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
