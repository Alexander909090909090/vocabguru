
import { useState, useRef, useEffect } from "react";
import { Message } from "@/types/chat";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import MessageList from "@/components/Chat/MessageList";
import MessageInput from "@/components/Chat/MessageInput";
import { generateResponseText, formatTimestamp } from "@/utils/chatUtils";
import { searchDictionaryWord } from "@/lib/dictionaryApi";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useWords } from "@/context/WordsContext";

const CalvernPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I'm Calvern, your linguistics expert. I can analyze words for their morphological structure, etymology, and meaning. What word would you like to explore today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { addWord } = useWords();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractWordFromInput = (input: string): string | null => {
    // Simple extraction of potential word from input
    // This could be enhanced with NLP techniques for better extraction
    
    // Look for phrases like "analyze [word]" or "what is [word]"
    const analyzeMatch = input.match(/analyze\s+([a-zA-Z]+)/i);
    if (analyzeMatch && analyzeMatch[1]) return analyzeMatch[1];
    
    const whatIsMatch = input.match(/what\s+is\s+([a-zA-Z]+)/i);
    if (whatIsMatch && whatIsMatch[1]) return whatIsMatch[1];

    // Look for phrases like "etymology of [word]"
    const ofMatch = input.match(/(?:etymology|meaning|definition|origin)\s+of\s+([a-zA-Z]+)/i);
    if (ofMatch && ofMatch[1]) return ofMatch[1];
    
    // If no patterns match, just take the first word that's at least 3 chars
    const words = input.split(/\s+/).filter(word => word.length >= 3);
    if (words.length > 0) {
      // Remove punctuation and return the longest word (likely to be the subject)
      return words.sort((a, b) => b.length - a.length)[0].replace(/[^\w]/g, '');
    }
    
    return null;
  };

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
    
    // Extract potential word from the input
    const extractedWord = extractWordFromInput(userMessage.text);
    
    try {
      if (extractedWord) {
        // Search for the word in the dictionary API
        const wordData = await searchDictionaryWord(extractedWord);
        
        if (wordData) {
          // Add the word to our collection if found
          addWord(wordData);
          
          // Create a response with structured data
          const responseText = generateResponseText(userMessage.text, wordData);
          
          const aiMessage: Message = {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: responseText,
            timestamp: new Date(),
            structuredData: {
              morphemeBreakdown: wordData.morphemeBreakdown,
              etymology: wordData.etymology,
              definitions: wordData.definitions
            }
          };
          
          setMessages(prev => [...prev, aiMessage]);
          
          // Suggest viewing the word detail page
          setTimeout(() => {
            const followupMessage: Message = {
              id: `ai-followup-${Date.now()}`,
              sender: "ai",
              text: `Would you like to see the full detail page for "${wordData.word}"? You can click [here](/word/${wordData.id}) to view it.`,
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, followupMessage]);
          }, 1000);
        } else {
          // Word not found
          const aiMessage: Message = {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: `I couldn't find detailed information about "${extractedWord}". Could you try another word or rephrase your question?`,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, aiMessage]);
        }
      } else {
        // No specific word detected, provide a general response
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: "I'd be happy to analyze a specific word for you. Please mention the word you'd like to explore, or ask something like 'What is the etymology of [word]?' or 'Analyze [word]'.",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("Error generating response:", error);
      toast.error("There was an error processing your request. Please try again.");
      
      const errorMessage: Message = {
        id: `ai-error-${Date.now()}`,
        sender: "ai",
        text: "I encountered an error while processing your request. Please try again or try with a different word.",
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
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Calvern: The Linguistics Expert</h1>
          <p className="text-muted-foreground">
            Ask Calvern about any word's etymology, morpheme breakdown, or meaning.
            Try questions like "What is the etymology of 'superfluous'?" or "Analyze the word 'ephemeral'".
          </p>
        </div>
        
        <div className="flex flex-col border border-white/10 rounded-lg overflow-hidden bg-background h-[600px]">
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

export default CalvernPage;
