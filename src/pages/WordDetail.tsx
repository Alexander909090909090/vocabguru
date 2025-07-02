import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Volume2, Share2, Bookmark, Brain } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { WordHeader } from '@/components/WordDetail/WordHeader';
import { WordMainContent } from '@/components/WordDetail/WordMainContent';
import { AIAssistantTab } from '@/components/WordDetail/AIAssistantTab';
import { WordNotFound } from '@/components/WordDetail/WordNotFound';
import { WordRepositoryEntry, wordRepositoryService } from '@/services/wordRepositoryService';
import { SimplifiedDeepAnalysis } from '@/components/DeepAnalysis/SimplifiedDeepAnalysis';
import Header from '@/components/Header';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const WordDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [word, setWord] = useState<WordRepositoryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (id) {
      loadWordDetails(id);
    }
  }, [id]);

  const loadWordDetails = async (wordId: string) => {
    setIsLoading(true);
    try {
      const wordData = await wordRepositoryService.getWordById(wordId);
      if (wordData) {
        setWord(wordData);
        // Check if word is bookmarked (mock for now)
        setIsBookmarked(Math.random() > 0.5);
      } else {
        setWord(null);
      }
    } catch (error) {
      console.error('Failed to load word details:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load word details. Please try again.",
        variant: "destructive"
      });
      setWord(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      description: `"${word?.word}" has been ${isBookmarked ? 'removed from' : 'added to'} your bookmarks.`,
    });
  };

  const handleShare = () => {
    if (navigator.share && word) {
      navigator.share({
        title: `${word.word} - VocabGuru`,
        text: `Check out this word: ${word.word}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Word link has been copied to clipboard.",
      });
    }
  };

  const pronounceWord = () => {
    if (word && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Speech not supported",
        description: "Your browser doesn't support text-to-speech.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="container mx-auto py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-slate-700 rounded w-1/4"></div>
              <div className="h-12 bg-slate-700 rounded w-1/2"></div>
              <div className="h-64 bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!word) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <WordNotFound />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <motion.div
        initial="initial"
        animate="in"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.3 }}
        className="container mx-auto py-24 px-4"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Link to="/discovery">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Discovery
              </Button>
            </Link>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={pronounceWord}
                className="text-white border-white/20 hover:bg-white/10"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBookmarkToggle}
                className={`border-white/20 hover:bg-white/10 ${
                  isBookmarked 
                    ? 'text-yellow-400 bg-yellow-400/10' 
                    : 'text-white'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="text-white border-white/20 hover:bg-white/10"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Word Header */}
          <WordHeader word={word} />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-primary">
                <BookOpen className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="analysis" className="text-white data-[state=active]:bg-primary">
                <Brain className="h-4 w-4 mr-2" />
                Deep Analysis
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-white data-[state=active]:bg-primary">
                <Brain className="h-4 w-4 mr-2" />
                AI Assistant
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <WordMainContent word={word} />
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <SimplifiedDeepAnalysis word={word.word} />
            </TabsContent>

            <TabsContent value="ai" className="space-y-6">
              <AIAssistantTab word={word.word} />
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
};

export default WordDetail;
