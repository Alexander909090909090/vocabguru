import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Sparkles, Search, BookOpenCheck, GraduationCap, MessageSquare, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useWords } from "@/context/WordsContext";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { words, loading } = useWords();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWords, setFilteredWords] = useState([]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = words.filter(word =>
        word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.definitions.primary.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredWords(filtered);
    } else {
      setFilteredWords(words);
    }
  }, [searchQuery, words]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="page-container pt-24 page-transition">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - User Profile and Quick Actions */}
          <div className="col-span-1">
            <Card className="bg-secondary/50 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {user ? `Welcome back, ${getUserDisplayName()}!` : "Welcome to VocabGuru!"}
                </CardTitle>
                <CardDescription>
                  {user ? "Your vocabulary journey awaits." : "Sign in to track your progress."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user ? (
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getUserAvatar()} alt={getUserDisplayName()} />
                      <AvatarFallback>{getUserDisplayName().charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{getUserDisplayName()}</p>
                      <Link to="/profile" className="text-muted-foreground hover:text-primary text-xs">
                        View Profile
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => navigate("/profile")}>Sign In to Get Started</Button>
                )}
                
                <div className="grid gap-2">
                  <Button variant="secondary" asChild>
                    <Link to="/discovery" className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Discover New Words</span>
                    </Link>
                  </Button>
                  <Button variant="secondary" asChild>
                    <Link to="/vocabulary-table" className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-2"><BookOpenCheck className="w-4 h-4" /> Vocabulary Table</span>
                    </Link>
                  </Button>
                  <Button variant="secondary" asChild>
                    <Link to="/study" className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Study Center</span>
                    </Link>
                  </Button>
                  <Button variant="secondary" asChild>
                    <Link to="/calvern" className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Calvern AI</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Search and Word List */}
          <div className="col-span-1 md:col-span-2">
            <Card className="bg-secondary/50 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Explore Words</CardTitle>
                <CardDescription>
                  Search for words or browse our curated list.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    type="search"
                    placeholder="Search for words..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="bg-background"
                  />
                </div>
                
                <ScrollArea className="h-[400px] rounded-md">
                  <div className="space-y-2">
                    {loading ? (
                      <>
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="flex items-center space-x-4 py-2">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        ))}
                      </>
                    ) : filteredWords.length > 0 ? (
                      filteredWords.map(word => (
                        <Link to={`/word/${word.id}`} key={word.id} className="block">
                          <Card variant="ghost" className="hover:bg-muted/50 transition-colors">
                            <CardContent className="flex items-center justify-between p-3">
                              <div>
                                <p className="font-medium">{word.word}</p>
                                <p className="text-sm text-muted-foreground">{word.definitions.primary.substring(0, 50)}...</p>
                              </div>
                              <Badge variant="secondary">{word.partOfSpeech}</Badge>
                            </CardContent>
                          </Card>
                        </Link>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        {searchQuery ? "No words found matching your search." : "No words available."}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
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
