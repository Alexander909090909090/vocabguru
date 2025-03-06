
import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import { Message } from "@/types/chat";
import { MessageSquare, Book, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import MessageList from "@/components/Chat/MessageList";
import MessageInput from "@/components/Chat/MessageInput";
import { generateResponseText, formatTimestamp } from "@/utils/chatUtils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Calvern = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I'm Calvern, your linguistics expert. I can help with etymologies, morpheme breakdowns, and answer any language questions. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
    
    // Generate AI response with simulated delay for realistic feel
    setTimeout(() => {
      // Use the existing generateResponseText function with a more scholarly tone
      let responseText = generateResponseText(userMessage.text);
      
      // Add more linguistic depth to responses
      if (userMessage.text.toLowerCase().includes("etymology")) {
        responseText += "\n\nEtymology is fascinating because it reveals the historical journey of words across languages and cultures.";
      } else if (userMessage.text.toLowerCase().includes("morpheme")) {
        responseText += "\n\nMorphemes are the smallest meaningful units in language. Understanding them helps decode unfamiliar words.";
      }
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
      
      toast.success("Calvern responded to your query");
    }, 1500);
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
    <div className="min-h-screen">
      <Header />
      
      <main className="page-container pt-24 page-transition">
        {/* Back button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6 group" 
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Words
        </Button>
        
        <div className="glass-card rounded-xl p-6 mb-8 bg-gradient-to-br from-indigo-600/20 to-purple-600/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center bg-primary/80 w-10 h-10 rounded-full">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Speak to Calvern</h1>
              <p className="text-muted-foreground">Your AI linguistics expert</p>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Ask Calvern about word etymologies, morpheme breakdowns, language history,
            or any other linguistic question. Calvern can provide detailed analysis
            and help you understand language at a deeper level.
          </p>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 p-2 rounded-lg">
            <Book className="h-4 w-4 text-primary" />
            <span>Example questions: "What is the etymology of democracy?", "Break down the morphemes in photosynthesis"</span>
          </div>
        </div>
        
        <div className="flex flex-col h-[600px] border border-white/10 rounded-lg overflow-hidden bg-background">
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Calvern - Linguistics Assistant</h3>
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
      </main>
      
      <footer className="border-t border-white/10 mt-12 py-6">
        <div className="container-inner text-center text-sm text-muted-foreground">
          <p>© 2024 VocabGuru. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Calvern;
