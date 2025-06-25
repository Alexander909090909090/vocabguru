
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Get user display information
  const getUserDisplayName = () => {
    if (!user) return "User";
    return user.user_metadata?.full_name || 
           user.user_metadata?.name || 
           user.email?.split('@')[0] || 
           "User";
  };

  const getUserAvatar = () => {
    return user?.user_metadata?.avatar_url || 
           user?.user_metadata?.picture || 
           undefined;
  };

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              VocabGuru
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-purple-600 transition-colors">
              Home
            </Link>
            <Link to="/discovery" className="text-gray-600 hover:text-purple-600 transition-colors">
              Discovery
            </Link>
            <Link to="/vocabulary-table" className="text-gray-600 hover:text-purple-600 transition-colors">
              Vocabulary
            </Link>
            <Link to="/study" className="text-gray-600 hover:text-purple-600 transition-colors">
              Study
            </Link>
            <Link to="/quiz" className="text-gray-600 hover:text-purple-600 transition-colors">
              Quiz
            </Link>
            <Link to="/calvern" className="text-gray-600 hover:text-purple-600 transition-colors">
              Calvern AI
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getUserAvatar()} alt={getUserDisplayName()} />
                      <AvatarFallback>{getUserDisplayName().charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{getUserDisplayName()}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/integrations')}>Integrations</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/profile">
                <Button>Sign In</Button>
              </Link>
            )}

            <Button variant="ghost" className="md:hidden" onClick={toggleMobileMenu}>
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-2">
          <nav className="flex flex-col space-y-2">
            <Link to="/" className="text-gray-600 hover:text-purple-600 py-2 transition-colors">
              Home
            </Link>
            <Link to="/discovery" className="text-gray-600 hover:text-purple-600 py-2 transition-colors">
              Discovery
            </Link>
            <Link to="/vocabulary-table" className="text-gray-600 hover:text-purple-600 py-2 transition-colors">
              Vocabulary
            </Link>
            <Link to="/study" className="text-gray-600 hover:text-purple-600 py-2 transition-colors">
              Study
            </Link>
            <Link to="/quiz" className="text-gray-600 hover:text-purple-600 py-2 transition-colors">
              Quiz
            </Link>
            <Link to="/calvern" className="text-gray-600 hover:text-purple-600 py-2 transition-colors">
              Calvern AI
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export { Header };
