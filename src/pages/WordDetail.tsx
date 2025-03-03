
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Bookmark, Share2, BookOpen } from "lucide-react";
import { Word } from "@/data/words";
import { words as defaultWords } from "@/data/words";
import { fetchWordsFromAirtable, isAirtableConnected } from "@/services/airtableService";
import { toast } from "sonner";
import ImageGallery from "@/components/ImageGallery";
import MorphemeBreakdown from "@/components/MorphemeBreakdown";
import EtymologyAnalysis from "@/components/EtymologyAnalysis";
import UsageAnalysis from "@/components/UsageAnalysis";
import FormsAndRelations from "@/components/FormsAndRelations";
import DefinitionsExplorer from "@/components/DefinitionsExplorer";
import AIChatInterface from "@/components/AIChatInterface";
import PronunciationPlayer from "@/components/PronunciationPlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WordDetail() {
  const { id } = useParams<{ id: string }>();
  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
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
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/" className="flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Back to Words
        </Link>
      </Button>
      
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            {word.word}
            <PronunciationPlayer word={word.word} pronunciation={word.pronunciation} />
          </h1>
          <p className="text-muted-foreground mt-2">{word.description}</p>
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="analysis" className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                Word Analysis
              </TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
                Images
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="analysis" className="mt-6 space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <MorphemeBreakdown breakdown={word.morphemeBreakdown} />
                </CardContent>
              </Card>
              
              <DefinitionsExplorer word={word} />
              <EtymologyAnalysis word={word} />
              <UsageAnalysis word={word} />
              <FormsAndRelations word={word} />
            </TabsContent>
            
            <TabsContent value="images" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <ImageGallery images={word.images} word={word.word} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <AIChatInterface currentWord={word} />
        </div>
      </div>
    </div>
  );
}
