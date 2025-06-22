
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen, Compass, MessageSquare, Trophy, Settings, User, Brain } from "lucide-react";
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-800/80 backdrop-blur-md border-b border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center bg-primary w-8 h-8 rounded-full">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg sm:text-xl text-white">VocabGuru</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <NavItems />
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden lg:flex items-center gap-2">
            <UserMenu />
          </div>

          {/* Mobile/Tablet Navigation */}
          {isMobile ? (
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-[280px] sm:w-[350px] bg-slate-800/95 backdrop-blur-md border-slate-700"
              >
                <SheetHeader>
                  <SheetTitle className="text-white text-left">Navigation</SheetTitle>
                </SheetHeader>
                
                <nav className="flex flex-col space-y-2 mt-6">
                  <NavItems mobile onItemClick={() => setIsMenuOpen(false)} />
                </nav>
                
                <div className="mt-8 pt-6 border-t border-slate-700">
                  <UserMenu />
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            // Tablet horizontal menu
            <div className="flex lg:hidden items-center gap-2">
              <nav className="flex items-center space-x-1 mr-4">
                {navigationItems.slice(0, 4).map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-slate-300 hover:text-white hover:bg-slate-700"
                      }`}
                      title={item.label}
                    >
                      <Icon className="h-4 w-4" />
                    </Link>
                  );
                })}
              </nav>
              <UserMenu />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
