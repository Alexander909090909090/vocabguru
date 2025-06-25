
import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import { Message } from "@/types/chat";
import { MessageSquare, Book, ArrowLeft, Sparkles, Search, Zap } from "lucide-react";
import { toast } from "sonner";
import MessageList from "@/components/Chat/MessageList";
import MessageInput from "@/components/Chat/MessageInput";
import { generateResponseText, formatTimestamp } from "@/utils/chatUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useWords } from "@/context/WordsContext";
import { Calvern3Service } from "@/utils/calvern3Integration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Calvern = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I'm Calvern, your advanced AI linguistics expert. I can provide comprehensive word breakdowns, chat about language concepts, and help you understand vocabulary at a deeper level. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quickAnalysisWord, setQuickAnalysisWord] = useState("");
  const [quickAnalysisResult, setQuickAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { words } = useWords();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAnalysisWord.trim()) return;

    setIsAnalyzing(true);
    setQuickAnalysisResult(null);
    
    try {
      console.log(`[Calvern] Starting quick analysis for: "${quickAnalysisWord}"`);
      const result = await Calvern3Service.getComprehensiveBreakdown(quickAnalysisWord.trim());
      setQuickAnalysisResult(result);
      toast.success(`Analysis complete for "${quickAnalysisWord}"`);
    } catch (error) {
      console.error('[Calvern] Quick analysis error:', error);
      const fallback = Calvern3Service.createFallbackBreakdown(quickAnalysisWord);
      setQuickAnalysisResult(fallback);
      toast.error("Analysis failed, showing fallback breakdown");
    } finally {
      setIsAnalyzing(false);
    }
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
    
    try {
      // Use the enhanced generateResponseText function
      let responseText = await generateResponseText(userMessage.text, targetWord);
      
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
      toast.success("Calvern responded to your query");
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

  // Convert markdown-style headers to HTML for quick analysis
  const formatMarkdown = (text: string) => {
    if (typeof text !== 'string' || !text) {
      return <div>No content available</div>;
    }

    // Format headers
    let formattedText = text
      .replace(/^# (.*$)/gm, '<h3 class="text-xl font-bold mt-4 mb-3 text-primary">$1</h3>')
      .replace(/^## (.*$)/gm, '<h4 class="text-lg font-semibold mt-3 mb-2">$1</h4>')
      .replace(/^### (.*$)/gm, '<h5 class="text-base font-medium mt-2 mb-1">$1</h5>');
    
    // Format bold text
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    
    // Format lists
    formattedText = formattedText.replace(/^\s*\*\s+(.*$)/gm, '<li class="ml-4 mb-1">• $1</li>');
    formattedText = formattedText.replace(/^\s*-\s+(.*$)/gm, '<li class="ml-4 mb-1">• $1</li>');
    
    // Add line breaks
    formattedText = formattedText.replace(/\n\n/g, '<br><br>');
    
    return <div dangerouslySetInnerHTML={{ __html: formattedText }} className="prose prose-sm max-w-none" />;
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
        
        {/* Enhanced header */}
        <div className="glass-card rounded-xl p-6 mb-8 bg-gradient-to-br from-indigo-600/20 to-purple-600/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center bg-primary/80 w-12 h-12 rounded-full">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">Calvern AI</h1>
                <Badge variant="outline" className="bg-primary/20 text-primary">Advanced Linguistics</Badge>
              </div>
              <p className="text-muted-foreground">Your AI-powered language expert</p>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Get instant word breakdowns, comprehensive etymological analysis, and have intelligent
            conversations about language. Powered by Calvern 3.0 for deep linguistic insights.
          </p>
        </div>

        {/* Unified interface with tabs */}
        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Instant Analysis
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              AI Chat
            </TabsTrigger>
          </TabsList>

          {/* Quick Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Quick Word Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleQuickAnalysis} className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter a word for comprehensive breakdown..."
                      value={quickAnalysisWord}
                      onChange={(e) => setQuickAnalysisWord(e.target.value)}
                      className="flex-1"
                      disabled={isAnalyzing}
                    />
                    <Button type="submit" disabled={isAnalyzing || !quickAnalysisWord.trim()}>
                      {isAnalyzing ? "Analyzing..." : "Analyze"}
                    </Button>
                  </div>
                </form>

                {/* Quick analysis result */}
                {quickAnalysisResult && (
                  <div className="mt-6 p-4 bg-secondary/20 rounded-lg border">
                    {formatMarkdown(quickAnalysisResult)}
                  </div>
                )}

                {/* Sample queries */}
                <div className="mt-6 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Try these examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {["superfluous", "ephemeral", "serendipity", "ubiquitous"].map((word) => (
                      <Button
                        key={word}
                        variant="outline"
                        size="sm"
                        onClick={() => setQuickAnalysisWord(word)}
                        disabled={isAnalyzing}
                      >
                        {word}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 bg-secondary/50 p-3 rounded-lg">
                  <Book className="h-4 w-4 text-primary" />
                  <span>Try asking: "What is the etymology of superfluous?"</span>
                </div>
                <div className="flex items-center gap-2 bg-secondary/50 p-3 rounded-lg">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span>Or say: "Give me a comprehensive breakdown of ephemeral"</span>
                </div>
              </div>
              
              <div className="flex flex-col h-[600px] border border-white/10 rounded-lg overflow-hidden bg-background">
                <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Chat with Calvern</h3>
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
            </div>
          </TabsContent>
        </Tabs>
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
