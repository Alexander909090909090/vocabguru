
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Trophy, 
  MessageSquare, 
  Heart, 
  Share2, 
  TrendingUp,
  Crown,
  Star,
  BookOpen,
  Target,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  wordDiscovered?: string;
  achievement?: string;
  likes: number;
  comments: number;
  timestamp: string;
  type: 'discovery' | 'achievement' | 'question' | 'tip';
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isJoined: boolean;
  recentActivity: string;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar: string;
  score: number;
  streak: number;
  badge: string;
  wordsLearned: number;
}

interface SocialLearningHubProps {
  userId: string;
}

export const SocialLearningHub: React.FC<SocialLearningHubProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: communityData } = useQuery({
    queryKey: ['community-data', userId],
    queryFn: async () => {
      // Simulate API call - replace with actual service
      return {
        posts: generateFallbackPosts(),
        studyGroups: generateFallbackStudyGroups(),
        leaderboard: generateFallbackLeaderboard()
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  const generateFallbackPosts = (): CommunityPost[] => [
    {
      id: '1',
      userId: 'user1',
      userName: 'Sarah Chen',
      userAvatar: '',
      content: 'Just discovered this amazing word! The etymology is fascinating.',
      wordDiscovered: 'perspicacious',
      likes: 12,
      comments: 3,
      timestamp: '2 hours ago',
      type: 'discovery'
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Alex Rodriguez',
      userAvatar: '',
      content: 'Achieved a 30-day learning streak! The key is consistency.',
      achievement: 'Streak Master',
      likes: 25,
      comments: 8,
      timestamp: '4 hours ago',
      type: 'achievement'
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Emma Johnson',
      userAvatar: '',
      content: 'Can anyone help explain the difference between "affect" and "effect"? I keep mixing them up!',
      likes: 5,
      comments: 12,
      timestamp: '6 hours ago',
      type: 'question'
    }
  ];

  const generateFallbackStudyGroups = (): StudyGroup[] => [
    {
      id: '1',
      name: 'Academic Vocabulary Masters',
      description: 'Focus on scholarly and academic terminology',
      memberCount: 234,
      category: 'Academic',
      difficulty: 'advanced',
      isJoined: false,
      recentActivity: 'New word challenge: "epistemology"'
    },
    {
      id: '2',
      name: 'Etymology Enthusiasts',
      description: 'Explore word origins and historical development',
      memberCount: 156,
      category: 'Etymology',
      difficulty: 'intermediate',
      isJoined: true,
      recentActivity: 'Discussion: Greek vs Latin roots'
    },
    {
      id: '3',
      name: 'Beginner\'s Circle',
      description: 'Supportive community for vocabulary beginners',
      memberCount: 89,
      category: 'General',
      difficulty: 'beginner',
      isJoined: false,
      recentActivity: 'Daily word: "serendipity"'
    }
  ];

  const generateFallbackLeaderboard = (): LeaderboardEntry[] => [
    {
      rank: 1,
      userId: 'user1',
      userName: 'VocabMaster2024',
      userAvatar: '',
      score: 2840,
      streak: 45,
      badge: 'Legend',
      wordsLearned: 1247
    },
    {
      rank: 2,
      userId: 'user2',
      userName: 'WordWizard',
      userAvatar: '',
      score: 2635,
      streak: 38,
      badge: 'Expert',
      wordsLearned: 1156
    },
    {
      rank: 3,
      userId: 'user3',
      userName: 'LexiconLover',
      userAvatar: '',
      score: 2489,
      streak: 32,
      badge: 'Scholar',
      wordsLearned: 1089
    }
  ];

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'discovery': return <BookOpen className="h-4 w-4" />;
      case 'achievement': return <Trophy className="h-4 w-4" />;
      case 'question': return <MessageSquare className="h-4 w-4" />;
      case 'tip': return <Star className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-5 w-5 text-orange-500" />;
    return <span className="text-lg font-bold">#{rank}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-semibold">Social Learning Hub</h1>
          <p className="text-muted-foreground">
            Connect, compete, and learn together with the VocabGuru community
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Study Groups
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Challenges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Community Feed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {communityData?.posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.userAvatar} />
                      <AvatarFallback>{post.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{post.userName}</span>
                        <Badge variant="outline" className="gap-1">
                          {getPostIcon(post.type)}
                          {post.type}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{post.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-sm">{post.content}</p>

                  {post.wordDiscovered && (
                    <div className="bg-primary/10 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="font-medium text-primary">Word Discovery</span>
                      </div>
                      <p className="text-lg font-semibold mt-1">{post.wordDiscovered}</p>
                    </div>
                  )}

                  {post.achievement && (
                    <div className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-600">Achievement Unlocked</span>
                      </div>
                      <p className="text-lg font-semibold mt-1">{post.achievement}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Heart className="h-4 w-4" />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4 mt-6">
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Search study groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button>Search</Button>
          </div>

          <div className="grid gap-4">
            {communityData?.studyGroups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{group.name}</h3>
                        <p className="text-sm text-muted-foreground">{group.description}</p>
                      </div>
                      <Badge className={getDifficultyColor(group.difficulty)}>
                        {group.difficulty}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {group.memberCount} members
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {group.category}
                      </span>
                    </div>

                    <div className="bg-muted rounded-lg p-2 mb-3">
                      <p className="text-xs text-muted-foreground">Recent Activity:</p>
                      <p className="text-sm">{group.recentActivity}</p>
                    </div>

                    <Button 
                      className="w-full" 
                      variant={group.isJoined ? 'secondary' : 'default'}
                    >
                      {group.isJoined ? 'Joined' : 'Join Group'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Global Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {communityData?.leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950' : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-center w-10">
                      {getRankIcon(entry.rank)}
                    </div>

                    <Avatar className="h-10 w-10">
                      <AvatarImage src={entry.userAvatar} />
                      <AvatarFallback>{entry.userName.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entry.userName}</span>
                        <Badge variant="secondary">{entry.badge}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{entry.wordsLearned} words</span>
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {entry.streak} streak
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold">{entry.score}</div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Weekly Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Community challenges coming soon!</p>
                <p className="text-sm">Compete with friends and earn exclusive rewards.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
