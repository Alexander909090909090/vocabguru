
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, Plus, LayoutGrid, List, Filter } from "lucide-react";

import { fetchWordsFromAirtable } from "@/lib/airtable";
import { Word } from "@/data/words";
import { useAppContext } from "@/contexts/AppContext";

import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LearningProgress from "@/components/LearningProgress";
import SimpleWordBreakdown from "@/components/SimpleWordBreakdown";
import LearnedButton from "@/components/LearnedButton";
import { Separator } from "@/components/ui/separator";

// Define filter categories
type FilterCategory = "all" | "prefix" | "root" | "suffix" | "origin";
type ViewMode = "cards" | "list";

const Index = () => {
  const { setTotalWordsCount } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  
  // Fetch words from Airtable
  const {
    data: words = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['words'],
    queryFn: fetchWordsFromAirtable,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Update total words count for progress tracking
  useEffect(() => {
    if (words.length > 0) {
      setTotalWordsCount(words.length);
    }
  }, [words.length, setTotalWordsCount]);
  
  // Filter words based on search query
  const filteredWords = words.filter(word => 
    word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get words filtered by category
  const getFilteredWordsByCategory = () => {
    if (activeFilter === "all") return filteredWords;
    if (activeFilter === "origin") {
      // Filter by language origin
      return filteredWords;
    }
    if (activeFilter === "prefix") {
      return filteredWords.filter(word => word.morphemeBreakdown.prefix);
    }
    if (activeFilter === "suffix") {
      return filteredWords.filter(word => word.morphemeBreakdown.suffix);
    }
    if (activeFilter === "root") {
      return filteredWords.filter(word => word.morphemeBreakdown.root);
    }
    return filteredWords;
  };

  const displayWords = getFilteredWordsByCategory();
  
  // Toggle between list and grid view
  const toggleViewMode = () => {
    setViewMode(prev => prev === "list" ? "cards" : "list");
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="page-container pt-20">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative mb-4">
            <Input
              type="text"
              placeholder="Search for a word..."
              className="w-full pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute top-1/2 right-3 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={activeFilter === "all" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveFilter("all")}
                className="rounded-full"
              >
                All
              </Button>
              <Button 
                variant={activeFilter === "prefix" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveFilter("prefix")}
                className="rounded-full"
              >
                Prefix
              </Button>
              <Button 
                variant={activeFilter === "suffix" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveFilter("suffix")}
                className="rounded-full"
              >
                Suffix
              </Button>
              <Button 
                variant={activeFilter === "origin" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveFilter("origin")}
                className="rounded-full"
              >
                Origin
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={toggleViewMode}
                className="gap-2"
              >
                {viewMode === "list" ? (
                  <>
                    <LayoutGrid className="h-4 w-4" />
                    <span className="hidden sm:inline">Grid View</span>
                  </>
                ) : (
                  <>
                    <List className="h-4 w-4" />
                    <span className="hidden sm:inline">List View</span>
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
              
              <Button
                variant="default"
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Word</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main Content Tabs */}
        <Tabs defaultValue="all-words">
          <TabsList className="mb-4">
            <TabsTrigger value="all-words">Words</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all-words" className="animate-fade-in">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-pulse text-center">
                  <p className="text-muted-foreground">Loading vocabulary...</p>
                </div>
              </div>
            ) : isError ? (
              <div className="glass-card p-6 text-center">
                <p className="text-destructive mb-2">Error loading words</p>
                <p className="text-muted-foreground text-sm">
                  {(error as Error)?.message || "Please try again later"}
                </p>
              </div>
            ) : displayWords.length === 0 ? (
              <div className="glass-card p-6 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? `No words found matching '${searchQuery}'` : "No words available"}
                </p>
              </div>
            ) : viewMode === "list" ? (
              <div className="space-y-4 animate-fade-in">
                {displayWords.map((word) => (
                  <WordListItem key={word.id} word={word} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
                {displayWords.map((word) => (
                  <WordCard key={word.id} word={word} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="progress" className="animate-fade-in">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Your Learning Progress</h2>
              <LearningProgress />
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="border-t border-border mt-12 py-6">
        <div className="container-inner text-center text-sm text-muted-foreground">
          <p>© 2024 VocabGuru. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

// Word List Item Component
const WordListItem: React.FC<{ word: Word }> = ({ word }) => {
  return (
    <div className="glass-card p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Link to={`/word/${word.id}`} className="text-lg font-bold hover:text-primary transition-colors">
              {word.word}
            </Link>
            {word.featured && (
              <span className="chip bg-primary/10 text-primary text-xs">Featured</span>
            )}
          </div>
          
          <SimpleWordBreakdown 
            prefix={word.morphemeBreakdown.prefix?.text}
            root={word.morphemeBreakdown.root.text}
            suffix={word.morphemeBreakdown.suffix?.text}
            className="mb-2"
          />
          
          <Separator className="my-2" />
          
          <p className="text-sm mt-1">{word.description}</p>
          
          {word.usage.exampleSentence && (
            <p className="text-sm text-muted-foreground mt-2 italic">
              "{word.usage.exampleSentence}"
            </p>
          )}
        </div>
        
        <LearnedButton wordId={word.id} />
      </div>
    </div>
  );
};

// Word Card Component
const WordCard: React.FC<{ word: Word }> = ({ word }) => {
  // Create color gradient based on word id for consistent colors
  const getGradient = (id: string) => {
    // Simple hash function for the word id
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Use the hash to generate hue values
    const hue1 = hash % 360;
    const hue2 = (hash * 7) % 360;
    
    return `linear-gradient(135deg, hsl(${hue1}, 70%, 65%), hsl(${hue2}, 70%, 55%))`;
  };

  return (
    <div className="glass-card overflow-hidden rounded-xl hover-card">
      <div 
        className="h-24 relative overflow-hidden flex items-center justify-center"
        style={{ background: getGradient(word.id) }}
      >
        <h3 className="text-2xl font-bold text-white">{word.word}</h3>
        
        {word.featured && (
          <div className="absolute top-2 right-2">
            <span className="chip bg-black/30 backdrop-blur-sm text-white text-xs">
              Featured
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <SimpleWordBreakdown 
          prefix={word.morphemeBreakdown.prefix?.text}
          root={word.morphemeBreakdown.root.text}
          suffix={word.morphemeBreakdown.suffix?.text}
          className="mb-2"
        />
        
        <p className="text-sm line-clamp-2 mb-3">{word.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="chip bg-secondary text-secondary-foreground text-xs">
            {word.languageOrigin}
          </span>
          
          <div className="flex gap-2">
            <LearnedButton wordId={word.id} showText={false} size="sm" />
            <Link to={`/word/${word.id}`}>
              <Button variant="default" size="sm">View</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
