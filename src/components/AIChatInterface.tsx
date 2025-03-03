
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Word } from "@/data/words";
import { toast } from "sonner";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  liked?: boolean;
  disliked?: boolean;
}

interface AIChatInterfaceProps {
  currentWord?: Word;
}

export function AIChatInterface({ currentWord }: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! How can I assist you today? If you have any questions or need help with vocabulary, language insights, or linguistic analysis, feel free to ask!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      let responseText = "";
      
      // Check if the message is asking about etymology or morphological breakdown
      const lowerCaseInput = inputValue.toLowerCase();
      if ((lowerCaseInput.includes("etymology") || 
           lowerCaseInput.includes("morpheme") || 
           lowerCaseInput.includes("breakdown") || 
           lowerCaseInput.includes("analyze") || 
           lowerCaseInput.includes("analyse")) && 
          currentWord) {
        responseText = `Certainly! Let's break down the word "${currentWord.word.toLowerCase()}" according to its morphological components:\n\n${generateMorphemeBreakdownText(currentWord)}`;
      } else if (lowerCaseInput.includes("meaning") || lowerCaseInput.includes("definition")) {
        responseText = `The word "${currentWord?.word || "this word"}" means:\n\n${currentWord?.definitions.map(def => `• ${def.text}`).join('\n\n') || "I don't have the definition for this word."}`;
      } else if (lowerCaseInput.includes("origin") || lowerCaseInput.includes("history")) {
        responseText = `The origin of "${currentWord?.word || "this word"}" is:\n\n${currentWord?.etymology.origin || "I don't have the origin information for this word."}\n\n${currentWord?.etymology.evolution || ""}`;
      } else if (lowerCaseInput.includes("example") || lowerCaseInput.includes("sentence") || lowerCaseInput.includes("usage")) {
        responseText = `Here's an example of how to use "${currentWord?.word || "this word"}" in a sentence:\n\n"${currentWord?.usage.exampleSentence || "I don't have an example sentence for this word."}"`;
      } else {
        responseText = `I'd be happy to help with that! What specific aspect of "${currentWord?.word || "this word"}" would you like to explore further? You can ask about:\n\n• Etymology and origin\n• Morphological breakdown\n• Definitions and meanings\n• Example sentences\n• Synonyms and antonyms`;
      }
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateMorphemeBreakdownText = (word: Word): string => {
    let text = "";
    
    if (word.morphemeBreakdown.prefix) {
      text += `• Prefix: ${word.morphemeBreakdown.prefix.text} - ${word.morphemeBreakdown.prefix.meaning}\n\n`;
    }
    
    text += `• Root Word: ${word.morphemeBreakdown.root.text} - ${word.morphemeBreakdown.root.meaning}\n\n`;
    
    if (word.morphemeBreakdown.suffix) {
      text += `• Suffix: ${word.morphemeBreakdown.suffix.text} - ${word.morphemeBreakdown.suffix.meaning}`;
    }
    
    return text;
  };

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const handleFeedback = (messageId: string, type: 'like' | 'dislike') => {
    setMessages(prev => prev.map(message => {
      if (message.id === messageId) {
        const newMessage = { ...message };
        
        if (type === 'like') {
          newMessage.liked = !message.liked;
          if (newMessage.liked && message.disliked) {
            newMessage.disliked = false;
          }
          if (newMessage.liked) {
            toast.success("Thank you for your feedback!");
          }
        } else {
          newMessage.disliked = !message.disliked;
          if (newMessage.disliked && message.liked) {
            newMessage.liked = false;
          }
          if (newMessage.disliked) {
            toast.success("Thank you for your feedback!");
          }
        }
        
        return newMessage;
      }
      return message;
    }));
  };

  return (
    <div className="flex flex-col h-[500px] border border-white/10 rounded-lg overflow-hidden bg-background">
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="font-medium">VocabGuru Assistant</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div 
            key={message.id}
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
        ))}
        
        {isLoading && (
          <div className="flex items-start">
            <div className="bg-card/90 backdrop-blur-sm border border-white/10 p-3 rounded-lg">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-white/70 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-white/70 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 rounded-full bg-white/70 animate-pulse" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about this word..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AIChatInterface;
