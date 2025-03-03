
import { Menu, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="lg:hidden flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="relative z-20"
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/')}
      >
        <Home className="h-5 w-5" />
      </Button>
      
      {isMenuOpen && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-10 animate-in fade-in">
          <div className="container h-full flex flex-col items-center justify-center gap-6">
            <Button 
              variant="ghost" 
              className="text-lg"
              onClick={() => {
                navigate('/');
                setIsMenuOpen(false);
              }}
            >
              Home
            </Button>
            <Button 
              variant="ghost" 
              className="text-lg"
              onClick={() => {
                navigate('/word/abundant');
                setIsMenuOpen(false);
              }}
            >
              Words
            </Button>
            <Button 
              variant="ghost" 
              className="text-lg"
              onClick={() => {
                navigate('/daily');
                setIsMenuOpen(false);
              }}
            >
              Daily Word
            </Button>
            <Button 
              variant="ghost" 
              className="text-lg"
              onClick={() => {
                navigate('/quiz');
                setIsMenuOpen(false);
              }}
            >
              Quiz
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsMenuOpen(false)}
              className="mt-4"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MobileNav;
