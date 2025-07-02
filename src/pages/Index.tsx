import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, GraduationCap, Trophy, Sparkles, TrendingUp, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { WordCard } from '@/components/WordCard';
import { WordRepositoryCard } from '@/components/WordRepository/WordRepositoryCard';
import { WordRepositoryEntry, WordRepositoryService } from '@/services/wordRepositoryService';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

interface UserStats {
  wordsStudied: number;
  quizzesCompleted: number;
  currentStreak: number;
  totalScore: number;
  averageAccuracy: number;
  learningStreak: number;
}

interface LearningGoal {
  daily: number;
  weekly: number;
  monthly: number;
}

const Index: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredWords, setFeaturedWords] = useState<WordRepositoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats>({
    wordsStudied: 23,
    quizzesCompleted: 8,
    currentStreak: 5,
    totalScore: 1250,
    averageAccuracy: 87,
    learningStreak: 12
  });
  const [learningGoals, setLearningGoals] = useState<LearningGoal>({
    daily: 5,
    weekly: 25,
    monthly: 100
  });

  useEffect(() => {
    loadFeaturedWords();
    loadUserStats();
  }, []);

  const loadFeaturedWords = async () => {
    setIsLoading(true);
    try {
      const { words } = await WordRepositoryService.getWordsWithPagination(0, 8);
      setFeaturedWords(words);
    } catch (error) {
      console.error('Failed to load featured words:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load featured words. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserStats = async () => {
    // In a real app, this would fetch from the database
    // For now, we'll use mock data
    setUserStats({
      wordsStudied: Math.floor(Math.random() * 50) + 10,
      quizzesCompleted: Math.floor(Math.random() * 20) + 5,
      currentStreak: Math.floor(Math.random() * 10) + 1,
      totalScore: Math.floor(Math.random() * 2000) + 500,
      averageAccuracy: Math.floor(Math.random() * 20) + 75,
      learningStreak: Math.floor(Math.random() * 30) + 5
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to discovery page with search term as query parameter
      window.location.href = `/discovery?search=${encodeURIComponent(searchTerm.trim())}`;
    }
  };

  const dailyProgress = Math.min((userStats.wordsStudied % learningGoals.daily) / learningGoals.daily * 100, 100);
  const weeklyProgress = Math.min(userStats.wordsStudied / learningGoals.weekly * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <motion.div
        initial="initial"
        animate="in"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.3 }}
        className="container mx-auto py-24 px-4 space-y-8"
      >
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Master Vocabulary with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"> AI</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Discover, learn, and master new words with AI-powered morphological analysis and intelligent study tools.
            </p>
          </motion.div>

          {/* Quick Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-md mx-auto"
          >
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for a word..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        </div>

        {/* User Stats Dashboard */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm font-medium">Words Studied</p>
                    <p className="text-2xl font-bold text-white">{userStats.wordsStudied}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-400" />
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-blue-300 mb-1">
                    <span>Daily Goal</span>
                    <span>{Math.min(userStats.wordsStudied % learningGoals.daily, learningGoals.daily)}/{learningGoals.daily}</span>
                  </div>
                  <Progress value={dailyProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm font-medium">Current Streak</p>
                    <p className="text-2xl font-bold text-white">{userStats.currentStreak} days</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
                <div className="mt-4">
                  <Badge variant="outline" className="border-green-500/50 text-green-300">
                    <Clock className="h-3 w-3 mr-1" />
                    Keep it up!
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm font-medium">Quizzes Completed</p>
                    <p className="text-2xl font-bold text-white">{userStats.quizzesCompleted}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-purple-400" />
                </div>
                <div className="mt-4">
                  <p className="text-sm text-purple-300">
                    {userStats.averageAccuracy}% accuracy
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-300 text-sm font-medium">Total Score</p>
                    <p className="text-2xl font-bold text-white">{userStats.totalScore.toLocaleString()}</p>
                  </div>
                  <Target className="h-8 w-8 text-orange-400" />
                </div>
                <div className="mt-4">
                  <Badge variant="outline" className="border-orange-500/50 text-orange-300">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Rising!
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Link to="/discovery">
            <Card className="group hover:scale-105 transition-all duration-200 cursor-pointer bg-gradient-to-br from-slate-800/50 to-purple-800/30 border-purple-500/30">
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-purple-400 group-hover:text-purple-300" />
                <h3 className="text-lg font-semibold text-white mb-2">Discover Words</h3>
                <p className="text-slate-300 text-sm">
                  Explore our AI-powered vocabulary database with morphological analysis
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/quiz">
            <Card className="group hover:scale-105 transition-all duration-200 cursor-pointer bg-gradient-to-br from-slate-800/50 to-green-800/30 border-green-500/30">
              <CardContent className="p-6 text-center">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 text-green-400 group-hover:text-green-300" />
                <h3 className="text-lg font-semibold text-white mb-2">Take Quiz</h3>
                <p className="text-slate-300 text-sm">
                  Test your knowledge with adaptive quizzes tailored to your level
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/calvern">
            <Card className="group hover:scale-105 transition-all duration-200 cursor-pointer bg-gradient-to-br from-slate-800/50 to-pink-800/30 border-pink-500/30">
              <CardContent className="p-6 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-pink-400 group-hover:text-pink-300" />
                <h3 className="text-lg font-semibold text-white mb-2">Ask Calvern</h3>
                <p className="text-slate-300 text-sm">
                  Get AI-powered explanations and examples for any word
                </p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Featured Words */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Featured Words</h2>
            <Link to="/discovery">
              <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                View All
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-700 rounded w-full"></div>
                      <div className="h-3 bg-slate-700 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredWords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredWords.map((word) => (
                <WordRepositoryCard
                  key={word.id}
                  wordEntry={word}
                  onClick={() => {
                    window.location.href = `/word/${word.id}`;
                  }}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-semibold text-white mb-2">No featured words available</h3>
                <p className="text-slate-400 mb-4">
                  Start exploring our vocabulary database to discover amazing words!
                </p>
                <Link to="/discovery">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Explore Words
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
