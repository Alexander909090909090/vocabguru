import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen, Compass, MessageSquare, Trophy, Settings, User, Brain, Sparkles } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  const navigationItems = [
    { href: "/", label: "Words", icon: BookOpen },
    { href: "/discovery", label: "Discovery", icon: Compass },
    { href: "/study", label: "Study Center", icon: Brain },
    { href: "/calvern", label: "Calvern AI", icon: MessageSquare },
    { href: "/quiz", label: "Quiz", icon: Trophy },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/integrations", label: "Settings", icon: Settings },
  ];

  const NavItems = ({ mobile = false, onItemClick }: { mobile?: boolean; onItemClick?: () => void }) => (
    <>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        
        return (
          <Link
            key={item.href}
            to={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              mobile ? 'w-full justify-start' : ''
            } ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
            onClick={onItemClick}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="page-container py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              VocabGuru
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/discovery" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Discovery
            </Link>
            <Link 
              to="/quiz" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Quiz
            </Link>
            <Link 
              to="/calvern" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Calvern AI
            </Link>
            <Link 
              to="/study" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Study
            </Link>
            <Link 
              to="/settings" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Settings
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
