
import { useEffect, useState } from "react";
import WordCard from "@/components/WordCard";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Search, Plus, LayoutGrid, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import WordGrid from "@/components/WordGrid";
import { useWords } from "@/context/WordsContext";
import DictionarySearch from "@/components/DictionarySearch";
import { searchDictionaryWord } from "@/lib/dictionaryApi";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

// Define filter categories
type FilterCategory = "all" | "prefix" | "root" | "suffix" | "origin" | "dictionary";
type ViewMode = "cards" | "grid";

const Index = () => {
  const { words, addWord, getWord, dictionaryWords } = useWords();
  const [searchQuery, setSearchQuery] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showDictionarySearch, setShowDictionarySearch] = useState(false);
  const [username, setUsername] = useState("Scholar");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  
  // Filter words based on search query
  const filteredWords = words.filter(word => 
    word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Featured words for the hero section
  const featuredWords = words.filter(word => word.featured);

  // Get unique language origins for filtering
  const uniqueOrigins = Array.from(new Set(words.map(word => word.languageOrigin)));

  useEffect(() => {
    // Set initial load to false after component mounts
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    
    // Check if user has saved name
    const savedName = localStorage.getItem("vocabguru-username");
    if (savedName) {
      setUsername(savedName);
    }
    
    // Add event listener for drawer toggle
    const handleToggleDrawer = () => {
      setIsDrawerOpen(!isDrawerOpen);
    };
    
    window.addEventListener('toggle-drawer', handleToggleDrawer);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('toggle-drawer', handleToggleDrawer);
    };
  }, [isDrawerOpen]);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "cards" ? "grid" : "cards");
  };
  
  const toggleDictionarySearch = () => {
    setShowDictionarySearch(!showDictionarySearch);
  };
  
  // Enhanced search function that checks local words first, then tries the dictionary API
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast({
        title: "Please enter a word",
        description: "Type a word to search",
        variant: "destructive",
      });
      return;
    }
    
    // Check if word already exists
    const normalizedWord = searchQuery.trim().toLowerCase();
    const existingWord = getWord(normalizedWord);
    
    if (existingWord) {
      // Word exists, navigate directly to it
      navigate(`/word/${existingWord.id}`);
      setSearchQuery("");
      return;
    }
    
    // If not found locally, search in the dictionary API
    setIsSearching(true);
    
    try {
      const word = await searchDictionaryWord(normalizedWord);
      
      if (word) {
        // Add word to context
        addWord(word);
        
        // Navigate to the word detail page
        navigate(`/word/${word.id}`);
        
        // Reset search
        setSearchQuery("");
      }
    } catch (error) {
      console.error("Error searching word:", error);
      toast({
        title: "Error",
        description: "Failed to search for word",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Get words filtered by category
  const getFilteredWordsByCategory = () => {
    if (activeFilter === "all") return filteredWords;
    if (activeFilter === "origin") {
      // This would typically filter by language origin
      return filteredWords;
    }
    if (activeFilter === "prefix") {
      return filteredWords.filter(word => word.morphemeBreakdown.prefix);
    }
    if (activeFilter === "suffix") {
      return filteredWords.filter(word => word.morphemeBreakdown.suffix);
    }
    // Filter for dictionary words (identified by being in the dictionaryWords array)
    if (activeFilter === "dictionary") {
      const dictionaryIds = dictionaryWords.map(w => w.id);
      return filteredWords.filter(word => dictionaryIds.includes(word.id));
    }
    return filteredWords;
  };

  const displayWords = getFilteredWordsByCategory();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Navigation Drawer - appears when menu is clicked */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-background/95 backdrop-blur-sm z-50 shadow-lg transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center justify-center bg-primary w-8 h-8 rounded-full">
              <span className="text-primary-foreground font-semibold">V</span>
            </div>
            <span className="font-semibold text-lg">VocabGuru</span>
          </div>
          
          <nav className="space-y-1">
            <a href="/" className="block py-2 px-3 rounded hover:bg-accent transition-colors">
              Words
            </a>
            <a href="#" className="block py-2 px-3 rounded hover:bg-accent transition-colors">
              Quizzes
            </a>
            <a href="#" className="block py-2 px-3 rounded hover:bg-accent transition-colors">
              DailyWords
            </a>
            <a href="#" className="block py-2 px-3 rounded hover:bg-accent transition-colors">
              ChatConversations
            </a>
          </nav>
          
          <div className="mt-6 space-y-2">
            <Button className="w-full justify-start gap-2" variant="outline">
              <Plus className="h-4 w-4" />
              Quizzes
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              Speak To Caivern
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main content with overlay when drawer is open */}
      <div 
        className={`transition-opacity duration-300 ${isDrawerOpen ? "opacity-50" : "opacity-100"}`}
        onClick={isDrawerOpen ? toggleDrawer : undefined}
      >
        <main className={`page-container ${viewMode === "grid" ? "pt-5 md:pt-6" : "pt-24"}`}>
          {/* Hero Section with personalized greeting - only shown in cards view */}
          {viewMode === "cards" && (
            <section className="mb-8">
              <div className="glass-card rounded-2xl p-8 md:p-12 text-center space-y-6 animate-scale-in">
                <h1 className="text-3xl md:text-4xl font-bold">
                  Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">{username}!</span>
                </h1>
                <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
                  Master language with interactive quizzes, etymology breakdowns, and daily word insights.
                </p>
                
                {showDictionarySearch ? (
                  <div className="max-w-md mx-auto">
                    <DictionarySearch />
                    <Button 
                      variant="link" 
                      className="mt-2 text-sm"
                      onClick={toggleDictionarySearch}
                    >
                      Cancel Dictionary Search
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <form className="relative max-w-md mx-auto w-full" onSubmit={handleSearch}>
                      <Input
                        type="text"
                        placeholder="Search any word..."
                        className="w-full bg-secondary/50 border-none h-12 pl-12 focus-visible:ring-primary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={isSearching}
                      />
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      {isSearching && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </form>
                    <Button 
                      variant="outline" 
                      onClick={toggleDictionarySearch}
                      className="gap-2"
                    >
                      <Search className="h-4 w-4" />
                      Advanced Dictionary Search
                    </Button>
                  </div>
                )}
              </div>
            </section>
          )}
          
          {/* Mini Header - only shown in grid view */}
          {viewMode === "grid" && (
            <div className="mb-6">
              <p className="text-muted-foreground text-sm text-center">
                Master language with interactive quizzes, etymology breakdowns, and daily word insights
              </p>
              
              <div className="mt-4 relative">
                <Input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-secondary/30 border-none h-10 pl-10 focus-visible:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleDictionarySearch}
                  className="w-full gap-2"
                >
                  <Search className="h-4 w-4" />
                  Search Dictionary
                </Button>
                
                {showDictionarySearch && (
                  <div className="mt-4">
                    <DictionarySearch />
                    <Button 
                      variant="link" 
                      className="mt-2 text-sm"
                      onClick={toggleDictionarySearch}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Filters and Add Word Button */}
          <section className="flex flex-wrap items-center justify-between gap-3 mb-6">
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
              <Button 
                variant={activeFilter === "dictionary" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveFilter("dictionary")}
                className="rounded-full"
              >
                Dictionary
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button 
                className="gap-2" 
                variant="secondary"
                onClick={toggleViewMode}
              >
                {viewMode === "cards" ? (
                  <>
                    <Grid3X3 className="h-4 w-4" />
                    Change View
                  </>
                ) : (
                  <>
                    <LayoutGrid className="h-4 w-4" />
                    Change View
                  </>
                )}
              </Button>
              <Button 
                className="gap-2"
                onClick={toggleDictionarySearch}
              >
                <Plus className="h-4 w-4" />
                Add Word
              </Button>
            </div>
          </section>
          
          {/* All Words or Search Results */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">
              {searchQuery ? "Search Results" : activeFilter !== "all" ? `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Filter` : "All Words"}
            </h2>
            
            {displayWords.length === 0 ? (
              <div className="glass-card rounded-lg p-8 text-center">
                <p className="text-muted-foreground">No words found matching '{searchQuery}'</p>
              </div>
            ) : viewMode === "cards" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayWords.map((word, index) => (
                  <div 
                    key={word.id}
                    className="transition-all duration-500"
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      opacity: isInitialLoad ? 0 : 1,
                      transform: isInitialLoad ? 'translateY(20px)' : 'translateY(0)'
                    }}
                  >
                    <WordCard word={word} />
                  </div>
                ))}
              </div>
            ) : (
              <WordGrid words={displayWords} />
            )}
          </section>
        </main>
      </div>
      
      <footer className="border-t border-white/10 mt-12 py-6">
        <div className="container-inner text-center text-sm text-muted-foreground">
          <p>© 2024 VocabGuru. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
