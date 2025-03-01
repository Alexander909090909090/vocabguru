
import { useEffect, useState } from "react";
import words from "@/data/words";
import WordCard from "@/components/WordCard";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Filter words based on search query
  const filteredWords = words.filter(word => 
    word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Featured words for the hero section
  const featuredWords = words.filter(word => word.featured);

  useEffect(() => {
    // Set initial load to false after component mounts
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="page-container pt-24">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="glass-card rounded-2xl p-8 md:p-12 text-center space-y-6 animate-scale-in">
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              VocabGuru
            </h1>
            <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
              Explore words in depth with comprehensive breakdowns of etymology, 
              morphology, usage, and more.
            </p>
            
            <form className="relative max-w-md mx-auto">
              <Input
                type="text"
                placeholder="Search for a word..."
                className="w-full bg-secondary/50 border-none h-12 pl-12 focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </form>
          </div>
        </section>
        
        {/* Featured Words */}
        {featuredWords.length > 0 && searchQuery === "" && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Featured Words</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredWords.map((word, index) => (
                <div 
                  key={word.id}
                  className="transition-all duration-500"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    opacity: isInitialLoad ? 0 : 1,
                    transform: isInitialLoad ? 'translateY(20px)' : 'translateY(0)'
                  }}
                >
                  <WordCard word={word} priority={index < 3} />
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* All Words or Search Results */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">
            {searchQuery ? "Search Results" : "All Words"}
          </h2>
          
          {filteredWords.length === 0 ? (
            <div className="glass-card rounded-lg p-8 text-center">
              <p className="text-muted-foreground">No words found matching '{searchQuery}'</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWords.map((word, index) => (
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
          )}
        </section>
      </main>
      
      <footer className="border-t border-white/10 mt-12 py-6">
        <div className="container-inner text-center text-sm text-muted-foreground">
          <p>© 2024 VocabGuru. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
