
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from "@/components/Header";
import WordSection from "@/components/WordSection";
import WordCard from "@/components/WordCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";
import { useWords } from "@/context/WordsContext";
import { DatabaseMonitor } from "@/components/DatabaseMonitor";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { words } = useWords();

  useEffect(() => {
    if (searchTerm) {
      const results = words.filter(word =>
        word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, words]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <main className="page-container pt-24 page-transition">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 text-center">
            Master Your <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Vocabulary</span>
          </h1>
          <p className="text-xl text-white/80 text-center max-w-2xl mx-auto">
            Unlock the power of language with AI-driven morphological analysis
          </p>
        </div>

        {/* Debug panel for testing */}
        <div className="mb-8 flex justify-center">
          <div className="max-w-md">
            <DatabaseMonitor />
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center max-w-lg mx-auto">
            <Input
              type="search"
              placeholder="Search for words..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button className="ml-2 bg-primary hover:bg-primary/80">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {searchTerm && searchResults.length > 0 && (
          <WordSection title={`Search Results for "${searchTerm}"`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((word, index) => (
                <WordCard key={word.id} word={word} priority={index < 3} />
              ))}
            </div>
          </WordSection>
        )}

        {!searchTerm && (
          <>
            <WordSection title="Featured Words">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {words.filter(word => word.featured).map((word, index) => (
                  <WordCard key={word.id} word={word} priority={index < 3} />
                ))}
              </div>
            </WordSection>

            <WordSection title="New & Noteworthy">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {words.slice(0, 5).map((word, index) => (
                  <WordCard key={word.id} word={word} priority={index < 3} />
                ))}
              </div>
            </WordSection>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
