
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { fetchWordById } from "@/lib/airtable";
import { useAppContext } from "@/contexts/AppContext";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import LearnedButton from "@/components/LearnedButton";
import PronunciationPlayer from "@/components/PronunciationPlayer";
import SimpleWordBreakdown from "@/components/SimpleWordBreakdown";

const WordDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch the word data from Airtable
  const { data: word, isError } = useQuery({
    queryKey: ['word', id],
    queryFn: () => fetchWordById(id || ''),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    // Simulate loading to show nice transitions
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [id]);

  if (isError || (!isLoading && !word)) {
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

  // While loading or if word is undefined, show a loading state
  if (isLoading || !word) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="page-container pt-24">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-40 bg-muted rounded"></div>
            <div className="h-12 w-3/4 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  // Create a color theme based on word id for consistent colors
  const getThemeColor = (id: string) => {
    // Simple hash function for the word id
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Use the hash to generate a hue value
    const hue = hash % 360;
    
    return `hsl(${hue}, 70%, 55%)`;
  };

  const themeColor = getThemeColor(word.id);

  // Parse synonyms and antonyms
  const synonymsAntonyms = word.synonymsAntonyms || { synonyms: [], antonyms: [] };
  
  // Get all definitions
  const definitions = word.definitions || [];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="page-container pt-20 page-transition">
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl md:text-4xl font-bold">{word.word}</h1>
              <PronunciationPlayer word={word.word} />
            </div>
            
            <LearnedButton wordId={word.id} />
          </div>
          
          {word.languageOrigin && (
            <div className="mt-2">
              <span className="chip bg-secondary/50 text-secondary-foreground">
                {word.languageOrigin}
              </span>
            </div>
          )}
        </div>
        
        {/* Word Overview Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: themeColor }}>
            Word Overview
          </h2>
          
          <div className="glass-card p-5 space-y-4">
            {definitions.map((def, index) => (
              <div key={index}>
                <h3 className="font-medium mb-1">
                  {def.type === 'primary' ? 'Primary Definition' : 
                   def.type === 'standard' ? 'Standard Definition' : 
                   def.type === 'contextual' ? 'Contextual Definition' : 
                   'Definition'}
                </h3>
                <p>{def.text}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Morphological Breakdown Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: themeColor }}>
            Morphological Breakdown
          </h2>
          
          <div className="glass-card p-5">
            <SimpleWordBreakdown 
              prefix={word.morphemeBreakdown.prefix?.text}
              root={word.morphemeBreakdown.root.text}
              suffix={word.morphemeBreakdown.suffix?.text}
              className="text-base"
            />
          </div>
        </section>
        
        {/* Etymology Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: themeColor }}>
            Etymology
          </h2>
          
          <div className="glass-card p-5 space-y-4">
            {word.etymology.origin && (
              <div>
                <h3 className="font-medium mb-1">Historical Origins</h3>
                <p>{word.etymology.origin}</p>
              </div>
            )}
            
            {word.languageOrigin && (
              <div>
                <h3 className="font-medium mb-1">Language of Origin</h3>
                <p>{word.languageOrigin}</p>
              </div>
            )}
            
            {word.etymology.evolution && (
              <div>
                <h3 className="font-medium mb-1">Word Evolution</h3>
                <p>{word.etymology.evolution}</p>
              </div>
            )}
            
            {word.etymology.culturalVariations && (
              <div>
                <h3 className="font-medium mb-1">Cultural and Regional Variations</h3>
                <p>{word.etymology.culturalVariations}</p>
              </div>
            )}
          </div>
        </section>
        
        {/* Usage Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: themeColor }}>
            Usage
          </h2>
          
          <div className="glass-card p-5 space-y-4">
            {word.usage.sentenceStructure && (
              <div>
                <h3 className="font-medium mb-1">Sentence Structure</h3>
                <p>{word.usage.sentenceStructure}</p>
              </div>
            )}
            
            {word.usage.commonCollocations.length > 0 && (
              <div>
                <h3 className="font-medium mb-1">Common Collocations</h3>
                <p>{word.usage.commonCollocations.join(", ")}</p>
              </div>
            )}
            
            {word.usage.exampleSentence && (
              <div>
                <h3 className="font-medium mb-1">Example Sentence</h3>
                <p className="italic">"{word.usage.exampleSentence}"</p>
              </div>
            )}
            
            {word.usage.contextualUsage && (
              <div>
                <h3 className="font-medium mb-1">Contextual Usage</h3>
                <p>{word.usage.contextualUsage}</p>
              </div>
            )}
            
            {Object.keys(word.forms).length > 0 && (
              <div>
                <h3 className="font-medium mb-1">Tense Variations</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {word.forms.noun && <li><span className="font-medium">Noun:</span> {word.forms.noun}</li>}
                  {word.forms.verb && <li><span className="font-medium">Verb:</span> {word.forms.verb}</li>}
                  {word.forms.adjective && <li><span className="font-medium">Adjective:</span> {word.forms.adjective}</li>}
                  {word.forms.adverb && <li><span className="font-medium">Adverb:</span> {word.forms.adverb}</li>}
                </ul>
              </div>
            )}
          </div>
        </section>
        
        {/* Related Words Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: themeColor }}>
            Related Words
          </h2>
          
          <div className="glass-card p-5 space-y-4">
            {synonymsAntonyms.synonyms.length > 0 && (
              <div>
                <h3 className="font-medium mb-1">Synonyms</h3>
                <div className="flex flex-wrap gap-2">
                  {synonymsAntonyms.synonyms.map((synonym, index) => (
                    <span key={index} className="chip bg-secondary/50 text-secondary-foreground">
                      {synonym}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {synonymsAntonyms.antonyms.length > 0 && (
              <div>
                <h3 className="font-medium mb-1">Antonyms</h3>
                <div className="flex flex-wrap gap-2">
                  {synonymsAntonyms.antonyms.map((antonym, index) => (
                    <span key={index} className="chip bg-secondary/50 text-secondary-foreground">
                      {antonym}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <footer className="border-t border-border mt-12 py-6">
        <div className="container-inner text-center text-sm text-muted-foreground">
          <p>© 2024 VocabGuru. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default WordDetail;
