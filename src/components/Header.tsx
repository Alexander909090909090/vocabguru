
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>

          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold">VocabGuru</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/" className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Home">
              <Home size={20} />
            </Button>
          </Link>
          
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border animate-fade-in z-10">
          <nav className="container mx-auto px-4 py-3">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="block py-2 hover:bg-accent rounded-md px-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="block py-2 hover:bg-accent rounded-md px-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Progress
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
