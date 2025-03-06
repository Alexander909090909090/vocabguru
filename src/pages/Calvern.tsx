
import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import { Message } from "@/types/chat";
import { MessageSquare, Book, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import MessageList from "@/components/Chat/MessageList";
import MessageInput from "@/components/Chat/MessageInput";
import { generateResponseText, formatTimestamp } from "@/utils/chatUtils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useWords } from "@/context/WordsContext";

const Calvern = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I'm Calvern, your linguistics expert. I can help with word etymologies, morpheme breakdowns, and answer any language questions. Try asking for a \"comprehensive breakdown\" of a specific word for a detailed analysis. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { words } = useWords();

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
    
    // Try to identify if the user is asking about a specific word in our dictionary
    const wordQuery = inputValue.toLowerCase().match(/\b\w+\b/g);
    let targetWord = undefined;
    
    if (wordQuery) {
      // Find the longest matching word in our database (to prioritize more specific matches)
      let longestMatch = "";
      
      for (const word of words) {
        const wordLower = word.word.toLowerCase();
        if (wordQuery.includes(wordLower) && wordLower.length > longestMatch.length) {
          targetWord = word;
          longestMatch = wordLower;
        }
      }
    }
    
    // Generate AI response with simulated delay for realistic feel
    setTimeout(() => {
      // Use the enhanced generateResponseText function
      let responseText = generateResponseText(userMessage.text, targetWord);
      
      // Add linguistics insights for queries without specific word matches
      if (!targetWord) {
        const generalLinguisticInsights = [
          "\n\nDid you know? The English language has borrowed words from over 350 different languages throughout its history.",
          "\n\nInteresting fact: About 80% of the entries in any English dictionary are borrowed from other languages, primarily Latin, French, and Greek.",
          "\n\nLinguistics insight: Most English words can be traced back to Indo-European roots that are over 5,000 years old.",
          "\n\nLanguage fact: The average educated English speaker knows about 20,000-35,000 words, but actively uses only about 5,000 in daily speech."
        ];
        
        // Only add insights to general responses, not to comprehensive breakdowns
        if (!responseText.includes("## Comprehensive Breakdown") && Math.random() > 0.5) {
          responseText += generalLinguisticInsights[Math.floor(Math.random() * generalLinguisticInsights.length)];
        }
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
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">Speak to Calvern</h1>
                <Badge variant="outline" className="bg-primary/20 text-primary">AI Powered</Badge>
              </div>
              <p className="text-muted-foreground">Your AI linguistics expert</p>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Ask Calvern about word etymologies, morpheme breakdowns, language history,
            or any other linguistic question. Calvern can provide detailed analysis
            and help you understand language at a deeper level.
          </p>
          
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg">
              <Book className="h-4 w-4 text-primary" />
              <span>Try asking: "What is the etymology of superfluous?"</span>
            </div>
            <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span>Or say: "Give me a comprehensive breakdown of ephemeral"</span>
            </div>
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
