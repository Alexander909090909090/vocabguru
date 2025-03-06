
import { Search, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useWords } from "@/context/WordsContext";
import { searchDictionaryWord } from "@/lib/dictionaryApi";
import { searchMerriamWebsterWord } from "@/lib/merriamWebsterApi";
import { toast } from "@/components/ui/use-toast";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [useMerriamWebster, setUseMerriamWebster] = useState(false);
  const navigate = useNavigate();
  const { getWord, addWord } = useWords();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }
    
    const normalizedQuery = searchQuery.trim().toLowerCase();
    
    // First check if the word already exists in our collection
    const existingWord = getWord(normalizedQuery);
    
    if (existingWord) {
      navigate(`/word/${existingWord.id}`);
      setSearchQuery("");
      return;
    }
    
    // If not found locally, search in the dictionary API
    setIsSearching(true);
    
    try {
      // Use Merriam-Webster API if specified, otherwise use the default dictionary API
      const word = useMerriamWebster 
        ? await searchMerriamWebsterWord(normalizedQuery)
        : await searchDictionaryWord(normalizedQuery);
      
      if (word) {
        // Add word to context
        addWord(word);
        
        // Navigate to the word detail page
        navigate(`/word/${word.id}`);
        setSearchQuery("");
      } else {
        toast({
          title: "Word not found",
          description: "Try another word or check your spelling",
          variant: "destructive",
        });
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

  const toggleDrawer = () => {
    // This will be connected to the drawer in the Index component
    const event = new CustomEvent('toggle-drawer');
    window.dispatchEvent(event);
  };

  const toggleDictionarySource = () => {
    setUseMerriamWebster(!useMerriamWebster);
    toast({
      title: `Dictionary Source: ${!useMerriamWebster ? "Merriam-Webster" : "Free Dictionary"}`,
      description: `Now using ${!useMerriamWebster ? "Merriam-Webster" : "Free Dictionary"} API for word lookups`,
    });
  };

  return (
    <header className="w-full py-4 border-b border-white/10 backdrop-blur-sm fixed top-0 z-50 bg-background/80">
      <div className="container-inner flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDrawer}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link 
            to="/" 
            className="flex items-center gap-2 group"
          >
            <div className="flex items-center justify-center bg-primary w-8 h-8 rounded-full">
              <span className="text-primary-foreground font-semibold">V</span>
            </div>
            <span className="font-semibold text-lg group-hover:text-primary transition-colors">
              VocabGuru
            </span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <Input
              type="text"
              placeholder={`Search any word${useMerriamWebster ? " (MW)" : ""}...`}
              className="w-64 bg-secondary border-none focus-visible:ring-primary pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSearching}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
          </form>
          
          <nav className="hidden md:flex items-center gap-4">
            <Button size="sm" variant="ghost" asChild>
              <Link to="/" className="hover:text-primary transition-colors">
                Words
              </Link>
            </Button>
            <Button size="sm" variant="ghost" onClick={toggleDictionarySource}>
              {useMerriamWebster ? "Use Free Dictionary" : "Use Merriam-Webster"}
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <Link to="/calvern" className="hover:text-primary transition-colors">
                Speak to Calvern
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
