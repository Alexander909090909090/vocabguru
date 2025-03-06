
import { ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message } from "@/types/chat";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface MessageItemProps {
  message: Message;
  handleFeedback: (messageId: string, type: 'like' | 'dislike') => void;
  formatTimestamp: (date: Date) => string;
}

const MessageItem = ({ message, handleFeedback, formatTimestamp }: MessageItemProps) => {
  // Function to render links in message text
  const renderTextWithLinks = (text: string) => {
    // Match markdown-style links: [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    
    if (!linkRegex.test(text)) {
      return <div className="whitespace-pre-line">{text}</div>;
    }
    
    const parts = [];
    let lastIndex = 0;
    let match;
    
    // Reset regex
    linkRegex.lastIndex = 0;
    
    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Add the link
      const linkText = match[1];
      const linkUrl = match[2];
      
      parts.push(
        <Link 
          key={`link-${match.index}`}
          to={linkUrl}
          className="text-primary hover:underline inline-flex items-center gap-1"
        >
          {linkText}
          <ExternalLink className="h-3 w-3" />
        </Link>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return <div className="whitespace-pre-line">{parts}</div>;
  };

  // Function to render morpheme breakdown if available
  const renderMorphemeBreakdown = () => {
    const breakdown = message.structuredData?.morphemeBreakdown;
    if (!breakdown) return null;
    
    return (
      <div className="mt-3 p-3 bg-card/50 rounded-md border border-white/5">
        <h4 className="text-sm font-medium mb-2">Morpheme Breakdown:</h4>
        <div className="space-y-2 text-sm">
          {breakdown.prefix && (
            <div className="flex">
              <span className="font-medium min-w-20">• Prefix:</span>
              <span>
                <strong>{breakdown.prefix.text}</strong> - {breakdown.prefix.meaning}
              </span>
            </div>
          )}
          <div className="flex">
            <span className="font-medium min-w-20">• Root:</span>
            <span>
              <strong>{breakdown.root.text}</strong> - {breakdown.root.meaning}
            </span>
          </div>
          {breakdown.suffix && (
            <div className="flex">
              <span className="font-medium min-w-20">• Suffix:</span>
              <span>
                <strong>{breakdown.suffix.text}</strong> - {breakdown.suffix.meaning}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Function to render etymology if available
  const renderEtymology = () => {
    const etymology = message.structuredData?.etymology;
    if (!etymology) return null;
    
    return (
      <div className="mt-3 p-3 bg-card/50 rounded-md border border-white/5">
        <h4 className="text-sm font-medium mb-2">Etymology:</h4>
        <div className="space-y-2 text-sm">
          <p>{etymology.origin}</p>
          {etymology.evolution && <p>{etymology.evolution}</p>}
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`flex flex-col ${
        message.sender === "user" ? "items-end" : "items-start"
      }`}
    >
      <div className={`max-w-[85%] p-3 rounded-lg ${
        message.sender === "user" 
          ? "bg-primary text-primary-foreground" 
          : "bg-card/90 backdrop-blur-sm border border-white/10"
      }`}>
        {renderTextWithLinks(message.text)}
        {message.sender === "ai" && renderMorphemeBreakdown()}
        {message.sender === "ai" && renderEtymology()}
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
