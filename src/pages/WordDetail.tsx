
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import MorphemeBreakdown from "@/components/MorphemeBreakdown";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWords } from "@/context/WordsContext"; 
import WordHeader from "@/components/WordDetail/WordHeader";
import WordNotFound from "@/components/WordDetail/WordNotFound";
import WordMainContent from "@/components/WordDetail/WordMainContent";
import AIAssistantTab from "@/components/WordDetail/AIAssistantTab";

const WordDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { getWord } = useWords();
  
  const word = getWord(id || "");

  useEffect(() => {
    // Simulate loading to show nice transitions
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [id]);

  if (!word) {
    return <WordNotFound />;
  }

  // Create color gradient based on word id for consistent colors
  const getGradient = (id: string) => {
    // Simple hash function for the word id
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Use the hash to generate hue values
    const hue1 = hash % 360;
    const hue2 = (hash * 7) % 360;
    
    return `linear-gradient(135deg, hsl(${hue1}, 80%, 70%), hsl(${hue2}, 80%, 60%))`;
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
        
        {/* Word Header */}
        <WordHeader 
          word={word} 
          getGradient={getGradient} 
          isLoading={isLoading} 
        />
        
        {/* Morpheme Breakdown */}
        <MorphemeBreakdown breakdown={word.morphemeBreakdown} />
        
        {/* Main Word Content */}
        <div className="mt-8">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Word Details</TabsTrigger>
              <TabsTrigger value="ai-assist">AI Assistant</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <WordMainContent word={word} />
            </TabsContent>
            
            <TabsContent value="ai-assist">
              <AIAssistantTab word={word} />
            </TabsContent>
          </Tabs>
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

export default WordDetail;
