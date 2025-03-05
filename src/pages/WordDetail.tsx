
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import MorphemeBreakdown from "@/components/MorphemeBreakdown";
import WordSection from "@/components/WordSection";
import ImageGallery from "@/components/ImageGallery";
import AIChatInterface from "@/components/AIChatInterface";
import { ArrowLeft, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWords } from "@/context/WordsContext"; 
import { toast } from "@/components/ui/use-toast";

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
    return (
      <div className="min-h-screen">
        <Header />
        <main className="page-container pt-24">
          <div className="glass-card rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Word Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The word you're looking for doesn't exist in our database.
            </p>
            <Button onClick={() => navigate("/")}>
              Return to Home
            </Button>
          </div>
        </main>
      </div>
    );
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
  
  // Function to speak the word using the Web Speech API
  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
      
      toast({
        title: "Speaking",
        description: `Pronouncing: ${word.word}`,
      });
    } else {
      toast({
        title: "Speech Not Supported",
        description: "Your browser doesn't support speech synthesis",
        variant: "destructive",
      });
    }
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
        <div 
          className={`rounded-xl p-6 mb-8 ${isLoading ? 'opacity-0' : 'opacity-100 animate-scale-in'}`}
          style={{ 
            background: getGradient(word.id),
            transition: 'opacity 0.3s ease-in-out'
          }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <span className="chip bg-black/30 backdrop-blur-sm text-white mb-2">
                {word.partOfSpeech}
              </span>
              <div className="flex items-center gap-2">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-1">
                  {word.word}
                </h1>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white/80 hover:text-white hover:bg-white/10"
                  onClick={speakWord}
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
              </div>
              {word.pronunciation && (
                <p className="text-white/90 text-lg">
                  {word.pronunciation}
                </p>
              )}
            </div>
            
            <div className="chip bg-white/20 backdrop-blur-sm text-white">
              {word.languageOrigin}
            </div>
          </div>
          
          <p className="text-white/90 mt-4 max-w-3xl">
            {word.description}
          </p>
        </div>
        
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  {/* Primary Definition */}
                  <WordSection title="Primary Definition">
                    <p>{word!.definitions.find(d => d.type === 'primary')?.text}</p>
                  </WordSection>
                  
                  {/* Standard Definitions */}
                  {word!.definitions.filter(d => d.type === 'standard').length > 0 && (
                    <WordSection title="Standard Definitions">
                      <ul className="space-y-2">
                        {word!.definitions
                          .filter(d => d.type === 'standard')
                          .map((def, index) => (
                            <li key={index} className="flex gap-2">
                              <div className="chip bg-primary/20 h-6 w-6 flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {index + 1}
                                </span>
                              </div>
                              <span>{def.text}</span>
                            </li>
                          ))}
                      </ul>
                    </WordSection>
                  )}
                  
                  {/* Extended Definitions */}
                  {word!.definitions.filter(d => d.type === 'extended').length > 0 && (
                    <WordSection title="Extended Definitions">
                      <ul className="space-y-2">
                        {word!.definitions
                          .filter(d => d.type === 'extended')
                          .map((def, index) => (
                            <li key={index} className="flex gap-2">
                              <div className="chip bg-primary/20 h-6 w-6 flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {index + 1}
                                </span>
                              </div>
                              <span>{def.text}</span>
                            </li>
                          ))}
                      </ul>
                    </WordSection>
                  )}
                  
                  {/* Etymology */}
                  <WordSection title="Etymology">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium">Historical Origin</h4>
                        <p className="text-sm text-muted-foreground">{word!.etymology.origin}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium">Word Evolution</h4>
                        <p className="text-sm text-muted-foreground">{word!.etymology.evolution}</p>
                      </div>
                      
                      {word!.etymology.culturalVariations && (
                        <div>
                          <h4 className="text-sm font-medium">Cultural Variations</h4>
                          <p className="text-sm text-muted-foreground">{word!.etymology.culturalVariations}</p>
                        </div>
                      )}
                    </div>
                  </WordSection>
                  
                  {/* Word Forms */}
                  <WordSection title="Word Forms">
                    <div className="grid grid-cols-2 gap-3">
                      {word!.forms.noun && (
                        <div className="glass-card rounded-md p-3 bg-secondary/30">
                          <h4 className="text-xs font-medium text-muted-foreground">Noun</h4>
                          <p className="font-medium">{word!.forms.noun}</p>
                        </div>
                      )}
                      
                      {word!.forms.verb && (
                        <div className="glass-card rounded-md p-3 bg-secondary/30">
                          <h4 className="text-xs font-medium text-muted-foreground">Verb</h4>
                          <p className="font-medium">{word!.forms.verb}</p>
                        </div>
                      )}
                      
                      {word!.forms.adjective && (
                        <div className="glass-card rounded-md p-3 bg-secondary/30">
                          <h4 className="text-xs font-medium text-muted-foreground">Adjective</h4>
                          <p className="font-medium">{word!.forms.adjective}</p>
                        </div>
                      )}
                      
                      {word!.forms.adverb && (
                        <div className="glass-card rounded-md p-3 bg-secondary/30">
                          <h4 className="text-xs font-medium text-muted-foreground">Adverb</h4>
                          <p className="font-medium">{word!.forms.adverb}</p>
                        </div>
                      )}
                    </div>
                  </WordSection>
                </div>
                
                <div>
                  {/* Usage */}
                  <WordSection title="Common Collocations">
                    <div className="flex flex-wrap gap-2">
                      {word!.usage.commonCollocations.map((collocation, index) => (
                        <span key={index} className="chip bg-secondary text-secondary-foreground">
                          {collocation}
                        </span>
                      ))}
                    </div>
                  </WordSection>
                  
                  {/* Contextual Usage */}
                  <WordSection title="Contextual Usage">
                    <p>{word!.usage.contextualUsage}</p>
                  </WordSection>
                  
                  {/* Sentence Structure */}
                  {word!.usage.sentenceStructure && (
                    <WordSection title="Sentence Structure">
                      <p>{word!.usage.sentenceStructure}</p>
                    </WordSection>
                  )}
                  
                  {/* Example Sentence */}
                  <WordSection title="Example Sentence">
                    <p className="italic">{word!.usage.exampleSentence}</p>
                  </WordSection>
                  
                  {/* Synonyms & Antonyms */}
                  <WordSection title="Synonyms & Antonyms">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Synonyms</h4>
                        <div className="flex flex-wrap gap-2">
                          {word!.synonymsAntonyms.synonyms.map((synonym, index) => (
                            <span key={index} className="chip bg-primary/20 text-primary-foreground">
                              {synonym}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <Separator className="bg-white/5" />
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Antonyms</h4>
                        <div className="flex flex-wrap gap-2">
                          {word!.synonymsAntonyms.antonyms.map((antonym, index) => (
                            <span key={index} className="chip bg-secondary text-secondary-foreground">
                              {antonym}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </WordSection>
                  
                  {/* Image Gallery */}
                  {word!.images.length > 0 && (
                    <WordSection title="Image Gallery">
                      <ImageGallery images={word!.images} />
                    </WordSection>
                  )}
                  
                  {/* Contextual Definitions */}
                  {word!.definitions.filter(d => d.type === 'contextual').length > 0 && (
                    <WordSection title="Contextual Definitions">
                      <ul className="space-y-2">
                        {word!.definitions
                          .filter(d => d.type === 'contextual')
                          .map((def, index) => (
                            <li key={index}>{def.text}</li>
                          ))}
                      </ul>
                    </WordSection>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="ai-assist">
              <div className="mt-6">
                <WordSection title="AI Language Assistant" className="mb-0">
                  <p className="mb-4 text-sm text-muted-foreground">
                    Ask questions about this word's etymology, usage, or morphological structure. 
                    Try asking "What is the etymology of {word.word}?" to see a detailed breakdown.
                  </p>
                  <AIChatInterface currentWord={word} />
                </WordSection>
              </div>
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
