import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useWords } from "@/context/WordsContext";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Calvern", href: "/calvern" },
];

const Header = () => {
  const { allWords, dictionaryWords } = useWords();
  const totalWords = allWords.length;
  const dictionaryCount = dictionaryWords.length;
  
  return (
    <header className="sticky top-0 bg-background/90 backdrop-blur-md z-50 border-b border-white/10">
      <div className="container-inner py-4 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg">
          VocabGuru
        </Link>
        
        <nav className="hidden md:flex items-center gap-4">
          {navigation.map((item) => (
            <Link key={item.name} to={item.href} className="text-sm hover:text-primary transition-colors">
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
          <span>{totalWords} words</span>
          {dictionaryCount > 0 && <span>+ {dictionaryCount} in your dictionary</span>}
        </div>

        <Sheet>
          <SheetTrigger className="md:hidden">
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="left" className="sm:w-64">
            <div className="flex flex-col h-full">
              <Link to="/" className="font-bold text-lg mb-6">
                VocabGuru
              </Link>
              
              <nav className="flex flex-col gap-4 mb-6">
                {navigation.map((item) => (
                  <Link key={item.name} to={item.href} className="text-sm hover:text-primary transition-colors">
                    {item.name}
                  </Link>
                ))}
              </nav>
              
              <div className="mt-auto text-sm text-muted-foreground">
                <span>{totalWords} words</span>
                {dictionaryCount > 0 && <span>+ {dictionaryCount} in your dictionary</span>}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
