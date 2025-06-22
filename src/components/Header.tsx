
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, BookOpen, Brain, Search, Users, BarChart3, Settings, MessageSquare } from "lucide-react";
import UserMenu from "./UserMenu";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Words", href: "/", icon: BookOpen },
    { name: "Discovery", href: "/discovery", icon: Search },
    { name: "Word Analysis", href: "/analysis", icon: Brain },
    { name: "Quiz", href: "/quiz", icon: Users },
    { name: "Study Center", href: "/study", icon: BarChart3 },
    { name: "Calvern AI", href: "/calvern", icon: MessageSquare },
    { name: "Integrations", href: "/integrations", icon: Settings },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="container-inner">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              VocabGuru
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link key={item.name} to={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={`flex items-center space-x-2 ${
                      isActive ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* User Menu & Mobile Navigation */}
          <div className="flex items-center space-x-2">
            <UserMenu />
            
            {/* Mobile Navigation */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-lg">VocabGuru</span>
                  </div>
                  
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    
                    return (
                      <Link key={item.name} to={item.href} onClick={() => setIsOpen(false)}>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className={`w-full justify-start ${
                            isActive ? "bg-primary/10 text-primary" : ""
                          }`}
                        >
                          <Icon className="h-4 w-4 mr-3" />
                          {item.name}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
