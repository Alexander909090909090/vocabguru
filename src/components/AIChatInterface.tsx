
import { useState, useRef, useEffect } from "react";
import { Word } from "@/data/words";
import { Message } from "@/types/chat";
import { MessageSquare, Sparkles } from "lucide-react";
import { toast } from "sonner";
import MessageList from "./Chat/MessageList";
import MessageInput from "./Chat/MessageInput";
import { generateResponseText, formatTimestamp } from "@/utils/chatUtils";

interface AIChatInterfaceProps {
  currentWord?: Word;
}

export function AIChatInterface({ currentWord }: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: currentWord 
        ? `Hello! I can provide insights about "${currentWord.word}" and its morphological structure. Try asking for a "comprehensive breakdown" for a detailed analysis of its prefix "${currentWord.morphemeBreakdown.prefix?.text || ''}", root "${currentWord.morphemeBreakdown.root.text}", and suffix "${currentWord.morphemeBreakdown.suffix?.text || ''}"!`
        : "Hello! I can provide insights about vocabulary and language. Try asking for a \"comprehensive breakdown\" for a detailed analysis, or ask specific questions about etymology, meaning, or usage.",
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

  const handleSendMessage = async (e: React.FormEvent) => {
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
    
    try {
      // Generate AI response using async function
      const responseText = await generateResponseText(userMessage.text, currentWord);
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: "I apologize, but I encountered an error while generating a response. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-medium">VocabGuru Assistant</h3>
      </div>
      
      <MessageList 
        messages={messages}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef}
        handleFeedback={handleFeedback}
        formatTimestamp={formatTimestamp}
      />
      
      <MessageInput 
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}

export default AIChatInterface;
