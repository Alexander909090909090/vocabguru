
import { useEffect, useState } from "react";
import WordCard from "@/components/WordCard";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Search, Plus, LayoutGrid, Grid3X3, Trophy, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import WordGrid from "@/components/WordGrid";
import { useWords } from "@/context/WordsContext";
import DictionarySearch from "@/components/DictionarySearch";
import { searchDictionaryWord } from "@/lib/dictionaryApi";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

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
  
  const filteredWords = words.filter(word => 
    word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const featuredWords = words.filter(word => word.featured);

  const uniqueOrigins = Array.from(new Set(words.map(word => word.languageOrigin)));

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    
    const savedName = localStorage.getItem("vocabguru-username");
    if (savedName) {
      setUsername(savedName);
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "cards" ? "grid" : "cards");
  };
  
  const toggleDictionarySearch = () => {
    setShowDictionarySearch(!showDictionarySearch);
  };
  
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
    
    const normalizedWord = searchQuery.trim().toLowerCase();
    const existingWord = getWord(normalizedWord);
    
    if (existingWord) {
      navigate(`/word/${existingWord.id}`);
      setSearchQuery("");
      return;
    }
    
    setIsSearching(true);
    
    try {
      const word = await searchDictionaryWord(normalizedWord);
      
      if (word) {
        addWord(word);
        navigate(`/word/${word.id}`);
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

  const getFilteredWordsByCategory = () => {
    if (activeFilter === "all") return filteredWords;
    if (activeFilter === "origin") {
      return filteredWords;
    }
    if (activeFilter === "prefix") {
      return filteredWords.filter(word => word.morphemeBreakdown.prefix);
    }
    if (activeFilter === "suffix") {
      return filteredWords.filter(word => word.morphemeBreakdown.suffix);
    }
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
      
      {/* Mobile Navigation Drawer with Glass Effect */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleDrawer}
      />
      
      <div 
        className={`fixed top-0 left-0 h-full w-72 glass-card z-50 transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">V</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              VocabGuru
            </span>
          </div>
          
          <nav className="space-y-2">
            <Link to="/" className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-primary/10 transition-colors group">
              <LayoutGrid className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-medium">Words</span>
            </Link>
            <Link to="/analysis" className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-primary/10 transition-colors group">
              <Search className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-medium">Deep Analysis</span>
            </Link>
            <Link to="/quiz" className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-primary/10 transition-colors group">
              <Trophy className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-medium">Quiz</span>
            </Link>
            <Link to="/calvern" className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-primary/10 transition-colors group">
              <div className="w-5 h-5 bg-gradient-to-br from-primary to-purple-600 rounded-full" />
              <span className="font-medium">Calvern AI</span>
            </Link>
          </nav>
          
          <div className="mt-8 space-y-3">
            <Button 
              className="w-full justify-start gap-3 bg-gradient-to-r from-primary/10 to-purple-600/10 hover:from-primary/20 hover:to-purple-600/20 border border-primary/20" 
              variant="outline"
              onClick={toggleDictionarySearch}
            >
              <Search className="h-4 w-4" />
              Dictionary Search
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-30 md:hidden glass-card"
        onClick={toggleDrawer}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <main className={`page-container ${viewMode === "grid" ? "pt-5 md:pt-6" : "pt-24"}`}>
        {viewMode === "cards" && (
          <section className="mb-8">
            <div className="glass-card rounded-2xl p-8 md:p-12 text-center space-y-6 animate-scale-in bg-gradient-to-br from-primary/5 to-purple-600/5">
              <h1 className="text-3xl md:text-4xl font-bold">
                Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">{username}!</span>
              </h1>
              <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
                Master language with interactive quizzes, etymology breakdowns, and deep morphological analysis.
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
                      className="w-full glass-card border-primary/20 h-12 pl-12 focus-visible:ring-primary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={isSearching}
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary" />
                    {isSearching && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </form>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={toggleDictionarySearch}
                      className="gap-2 glass-card border-primary/20 hover:bg-primary/10"
                    >
                      <Search className="h-4 w-4" />
                      Advanced Search
                    </Button>
                    <Button 
                      onClick={() => navigate("/analysis")}
                      className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                    >
                      <Search className="h-4 w-4" />
                      Deep Analysis
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
        
        {viewMode === "grid" && (
          <div className="mb-6">
            <p className="text-muted-foreground text-sm text-center">
              Master language with interactive quizzes, etymology breakdowns, and deep morphological analysis
            </p>
            
            <div className="mt-4 relative">
              <Input
                type="text"
                placeholder="Search..."
                className="w-full glass-card border-primary/20 h-10 pl-10 focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary" />
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleDictionarySearch}
                className="flex-1 gap-2 glass-card border-primary/20"
              >
                <Search className="h-4 w-4" />
                Dictionary
              </Button>
              <Button 
                size="sm" 
                onClick={() => navigate("/analysis")}
                className="flex-1 gap-2 bg-gradient-to-r from-primary to-purple-600"
              >
                <Search className="h-4 w-4" />
                Analysis
              </Button>
            </div>
            
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
        )}
        
        <section className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap gap-2">
            {["all", "prefix", "suffix", "origin", "dictionary"].map((filter) => (
              <Button 
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveFilter(filter as FilterCategory)}
                className={`rounded-full ${
                  activeFilter === filter 
                    ? "bg-gradient-to-r from-primary to-purple-600" 
                    : "glass-card border-primary/20 hover:bg-primary/10"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button 
              className="gap-2 glass-card border-primary/20 hover:bg-primary/10" 
              variant="outline"
              onClick={toggleViewMode}
            >
              {viewMode === "cards" ? (
                <>
                  <Grid3X3 className="h-4 w-4" />
                  Grid View
                </>
              ) : (
                <>
                  <LayoutGrid className="h-4 w-4" />
                  Card View
                </>
              )}
            </Button>
            <Button 
              className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              onClick={toggleDictionarySearch}
            >
              <Plus className="h-4 w-4" />
              Add Word
            </Button>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-6">
            {searchQuery ? "Search Results" : activeFilter !== "all" ? `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Filter` : "All Words"}
          </h2>
          
          {displayWords.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center bg-gradient-to-br from-primary/5 to-purple-600/5">
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
      
      <footer className="border-t border-primary/10 mt-12 py-6">
        <div className="container-inner text-center text-sm text-muted-foreground">
          <p>© 2024 VocabGuru. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
