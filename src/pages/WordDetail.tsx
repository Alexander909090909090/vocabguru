
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Bookmark, Share2, ChevronRight, Home, Book } from "lucide-react";
import { Word } from "@/data/words";
import { words as defaultWords } from "@/data/words";
import { fetchWordsFromAirtable, isAirtableConnected } from "@/services/airtableService";
import { toast } from "sonner";
import ImageGallery from "@/components/ImageGallery";
import PronunciationPlayer from "@/components/PronunciationPlayer";
import { Badge } from "@/components/ui/badge";

export default function WordDetail() {
  const { id } = useParams<{ id: string }>();
  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  useEffect(() => {
    const fetchWord = async () => {
      setLoading(true);
      try {
        let foundWord: Word | undefined;
        
        // Try to fetch from Airtable if connected
        if (isAirtableConnected()) {
          try {
            const airtableWords = await fetchWordsFromAirtable();
            foundWord = airtableWords.find(w => w.id === id);
            
            if (!foundWord) {
              foundWord = defaultWords.find(w => w.id === id);
            }
          } catch (error) {
            console.error("Error fetching word from Airtable:", error);
            foundWord = defaultWords.find(w => w.id === id);
          }
        } else {
          // Use default words
          foundWord = defaultWords.find(w => w.id === id);
        }
        
        if (foundWord) {
          setWord(foundWord);
          // Check if word is bookmarked
          const bookmarks = JSON.parse(localStorage.getItem('bookmarkedWords') || '[]');
          setIsBookmarked(bookmarks.includes(foundWord.id));
        } else {
          toast.error("Word not found");
        }
      } catch (error) {
        console.error("Error fetching word:", error);
        toast.error("Error fetching word details");
      } finally {
        setLoading(false);
      }
    };
    
    // Load view mode preference
    const savedViewMode = localStorage.getItem('viewMode');
    if (savedViewMode === 'list' || savedViewMode === 'grid') {
      setViewMode(savedViewMode);
    }

    fetchWord();
  }, [id]);

  const toggleBookmark = () => {
    if (!word) return;
    
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedWords') || '[]');
    let newBookmarks;
    
    if (isBookmarked) {
      newBookmarks = bookmarks.filter((bookmarkId: string) => bookmarkId !== word.id);
      toast.success(`Removed ${word.word} from bookmarks`);
    } else {
      newBookmarks = [...bookmarks, word.id];
      toast.success(`Added ${word.word} to bookmarks`);
    }
    
    localStorage.setItem('bookmarkedWords', JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
  };

  const shareWord = () => {
    if (!word) return;
    
    if (navigator.share) {
      navigator.share({
        title: `VocabGuru: ${word.word}`,
        text: `Learn about the word "${word.word}" - ${word.description}`,
        url: window.location.href,
      }).catch((error) => {
        console.error('Error sharing:', error);
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    if (!word) return;
    
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success("Link copied to clipboard"))
      .catch(() => toast.error("Failed to copy link"));
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 animate-pulse">
        <div className="h-8 w-24 bg-gray-200 rounded mb-6"></div>
        <div className="h-12 w-3/4 bg-gray-200 rounded mb-4"></div>
        <div className="h-6 w-1/2 bg-gray-200 rounded mb-8"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!word) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Word Not Found</h1>
        <p className="mb-6">Sorry, we couldn't find the word you're looking for.</p>
        <Button asChild>
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" asChild className="gap-1">
          <Link to="/" className="flex items-center">
            <ChevronLeft className="h-4 w-4" />
            Back to Words
          </Link>
        </Button>
        
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/word/analysis" state={{ word: word }} className="flex items-center gap-1">
              <Book className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced Analysis</span>
            </Link>
          </Button>
          
          <Button variant="ghost" size="icon" className="sm:hidden">
            <Link to="/">
              <Home className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
            {word.word}
            <PronunciationPlayer word={word.word} pronunciation={word.pronunciation} />
          </h1>
          <div className="flex items-center gap-2 mb-2">
            <Badge>{word.partOfSpeech}</Badge>
            <Badge variant="outline">{word.languageOrigin}</Badge>
          </div>
          <p className="text-muted-foreground">{word.description}</p>
        </div>
        
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button 
            variant="outline" 
            size="icon"
            onClick={toggleBookmark}
            className={isBookmarked ? "text-yellow-500" : ""}
          >
            <Bookmark className="h-5 w-5" fill={isBookmarked ? "currentColor" : "none"} />
          </Button>
          <Button variant="outline" size="icon" onClick={shareWord}>
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Definition</CardTitle>
            <CardDescription>Primary meaning of this word</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{word.definitions && word.definitions[0] ? word.definitions[0].text : "No definition available"}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Example Usage</CardTitle>
            <CardDescription>How to use in a sentence</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="italic">"{word.usage.exampleSentence || "No example available"}"</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <h4 className="text-xl font-bold mb-4">Images</h4>
        <ImageGallery images={word.images} word={word.word} />
      </div>
      
      <div className="mt-8 text-center">
        <Button asChild variant="default">
          <Link to={`/analysis/${id}`} className="flex items-center gap-2">
            Deep Word Analysis
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
