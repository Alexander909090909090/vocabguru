
import { useEffect, useState } from "react";
import WordCard from "@/components/WordCard";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Search, Plus, LayoutGrid, Grid3X3, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import WordGrid from "@/components/WordGrid";
import { useUnifiedWords } from "@/hooks/useUnifiedWords";
import DictionarySearch from "@/components/DictionarySearch";
import { searchDictionaryWord } from "@/lib/dictionaryApi";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { QuickActions } from "@/components/Navigation/QuickActions";
import { NextSteps } from "@/components/Navigation/NextSteps";

type FilterCategory = "all" | "prefix" | "root" | "suffix" | "origin" | "dictionary" | "enhanced" | "legacy";
type ViewMode = "cards" | "grid";

const Index = () => {
  const { words, loading, addWord, getWord, searchWords } = useUnifiedWords();
  const [searchQuery, setSearchQuery] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showDictionarySearch, setShowDictionarySearch] = useState(false);
  const [username, setUsername] = useState("Scholar");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  
  const filteredWords = searchQuery ? searchWords(searchQuery) : words;
  
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
    if (activeFilter === "enhanced") {
      return filteredWords.filter(word => (word as any).source === 'database');
    }
    if (activeFilter === "legacy") {
      return filteredWords.filter(word => (word as any).source === 'legacy');
    }
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
      return filteredWords.filter(word => (word as any).source === 'database');
    }
    return filteredWords;
  };

  const displayWords = getFilteredWordsByCategory();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading comprehensive word collection...</p>
          <p className="text-sm text-muted-foreground">Integrating database and legacy words</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
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
            <Link to="/" className="block py-2 px-3 rounded hover:bg-accent transition-colors">
              Words
            </Link>
            <Link to="/quiz" className="block py-2 px-3 rounded hover:bg-accent transition-colors">
              Vocabulary Quiz
            </Link>
            <Link to="/calvern" className="block py-2 px-3 rounded hover:bg-accent transition-colors">
              Speak to Calvern
            </Link>
          </nav>
          
          <div className="mt-6 space-y-2">
            <Button 
              className="w-full justify-start gap-2" 
              variant="outline"
              onClick={toggleDictionarySearch}
            >
              <Search className="h-4 w-4" />
              Dictionary Search
            </Button>
            <Button 
              className="w-full justify-start gap-2" 
              variant="outline"
              onClick={() => navigate("/calvern")}
            >
              Speak To Calvern
            </Button>
          </div>
        </div>
      </div>
      
      <div 
        className={`transition-opacity duration-300 ${isDrawerOpen ? "opacity-50" : "opacity-100"}`}
        onClick={isDrawerOpen ? toggleDrawer : undefined}
      >
        <main className={`page-container ${viewMode === "grid" ? "pt-5 md:pt-6" : "pt-24"}`}>
          {viewMode === "cards" && (
            <section className="mb-8">
              <div className="glass-card rounded-2xl p-8 md:p-12 text-center space-y-6 animate-scale-in">
                <h1 className="text-3xl md:text-4xl font-bold">
                  Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">{username}!</span>
                </h1>
                <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
                  Master language with comprehensive word profiles, deep linguistic analysis, and interactive learning tools.
                </p>
                
                {/* Enhanced stats display */}
                <div className="flex justify-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{words.filter(w => (w as any).source === 'database').length}</div>
                    <div className="text-muted-foreground">Enhanced Words</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary-foreground">{words.filter(w => (w as any).source === 'legacy').length}</div>
                    <div className="text-muted-foreground">Legacy Words</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-foreground">{words.length}</div>
                    <div className="text-muted-foreground">Total Words</div>
                  </div>
                </div>
                
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
          
          {viewMode === "grid" && (
            <div className="mb-6">
              <p className="text-muted-foreground text-sm text-center">
                Master language with comprehensive word profiles, deep linguistic analysis, and interactive learning tools
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
          
          <section className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={activeFilter === "all" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveFilter("all")}
                className="rounded-full"
              >
                All ({words.length})
              </Button>
              <Button 
                variant={activeFilter === "enhanced" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveFilter("enhanced")}
                className="rounded-full"
              >
                Enhanced ({words.filter(w => (w as any).source === 'database').length})
              </Button>
              <Button 
                variant={activeFilter === "legacy" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveFilter("legacy")}
                className="rounded-full"
              >
                Legacy ({words.filter(w => (w as any).source === 'legacy').length})
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
              <Button 
                className="gap-2"
                variant="quiz"
                onClick={() => navigate("/quiz")}
              >
                <Trophy className="h-4 w-4" />
                Quiz
              </Button>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-6">
              {searchQuery ? `Search Results (${displayWords.length})` : 
               activeFilter !== "all" ? `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Words (${displayWords.length})` : 
               `All Words (${displayWords.length})`}
            </h2>
            
            {displayWords.length === 0 ? (
              <div className="glass-card rounded-lg p-8 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? `No words found matching '${searchQuery}'` : 'No words found for this filter'}
                </p>
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
                    <WordCard word={word as any} priority={index < 6} />
                  </div>
                ))}
              </div>
            ) : (
              <WordGrid words={displayWords} />
            )}
          </section>

          {displayWords.length > 0 && (
            <section className="mt-12">
              <NextSteps 
                context="discovery" 
                data={{ suggestedWords: displayWords.slice(0, 3).map(w => w.word) }}
              />
            </section>
          )}
        </main>
      </div>
      
      <QuickActions 
        currentPage="home"
        userProgress={{
          wordsStudied: words.length,
          quizzesCompleted: 0,
          currentStreak: 1
        }}
      />
      
      <footer className="border-t border-white/10 mt-12 py-6">
        <div className="container-inner text-center text-sm text-muted-foreground">
          <p>© 2024 VocabGuru. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
