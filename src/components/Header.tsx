
import { Search, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import words from "@/data/words";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const foundWord = words.find(
      word => word.word.toLowerCase() === searchQuery.toLowerCase()
    );
    
    if (foundWord) {
      navigate(`/word/${foundWord.id}`);
      setSearchQuery("");
    }
  };

  const toggleDrawer = () => {
    // This will be connected to the drawer in the Index component
    const event = new CustomEvent('toggle-drawer');
    window.dispatchEvent(event);
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
              placeholder="Search words..."
              className="w-64 bg-secondary border-none focus-visible:ring-primary pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </form>
          
          <nav className="hidden md:flex items-center gap-4">
            <Button size="sm" variant="ghost" asChild>
              <Link to="/" className="hover:text-primary transition-colors">
                Words
              </Link>
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <Link to="#" className="hover:text-primary transition-colors">
                Quizzes
              </Link>
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <Link to="#" className="hover:text-primary transition-colors">
                Daily
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
