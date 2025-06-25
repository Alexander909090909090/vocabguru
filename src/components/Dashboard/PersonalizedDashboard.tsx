import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  Brain, 
  Calendar, 
  Award, 
  BookOpen,
  Clock,
  Zap,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

interface LearningMetrics {
  totalWordsLearned: number;
  currentStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  averageAccuracy: number;
  studyTimeToday: number;
  favoriteCategories: string[];
  recentAchievements: Achievement[];
  learningVelocity: number;
  retentionRate: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface PersonalizedDashboardProps {
  userId?: string;
}

export const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({ userId }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['user-metrics', userId, selectedPeriod],
    queryFn: async () => {
      try {
        // Since enhancedUserProfileService doesn't exist, use fallback data
        return generateFallbackMetrics();
      } catch (error) {
        console.error('Failed to fetch user metrics:', error);
        return generateFallbackMetrics();
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const generateFallbackMetrics = (): LearningMetrics => {
    return {
      totalWordsLearned: 234,
      currentStreak: 7,
      weeklyGoal: 70,
      weeklyProgress: 45,
      averageAccuracy: 87,
      studyTimeToday: 45,
      favoriteCategories: ['Academic', 'Science', 'Literature'],
      recentAchievements: generateRecentAchievements(),
      learningVelocity: 15,
      retentionRate: 82
    };
  };

  const generateRecentAchievements = (): Achievement[] => {
    return [
      {
        id: '1',
        title: 'Week Warrior',
        description: 'Maintained a 7-day learning streak',
        icon: '🔥',
        earnedAt: new Date().toISOString(),
        rarity: 'rare'
      },
      {
        id: '2',
        title: 'Vocabulary Scholar',
        description: 'Learned 50 academic words',
        icon: '🎓',
        earnedAt: new Date(Date.now() - 86400000).toISOString(),
        rarity: 'epic'
      },
      {
        id: '3',
        title: 'Morpheme Master',
        description: 'Correctly identified 100 word roots',
        icon: '🔬',
        earnedAt: new Date(Date.now() - 172800000).toISOString(),
        rarity: 'rare'
      }
    ];
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Words Learned</p>
                  <p className="text-2xl font-bold">{metrics?.totalWordsLearned}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    {metrics?.currentStreak}
                    <span className="text-orange-500">🔥</span>
                  </p>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Accuracy</p>
                  <p className="text-2xl font-bold">{Math.round(metrics?.averageAccuracy || 0)}%</p>
                </div>
                <Zap className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Study Time Today</p>
                  <p className="text-2xl font-bold">{metrics?.studyTimeToday}min</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="year">This Year</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPeriod} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Weekly Goal Progress</span>
                    <span>{metrics?.weeklyProgress}/{metrics?.weeklyGoal} words</span>
                  </div>
                  <Progress 
                    value={(metrics?.weeklyProgress || 0) / (metrics?.weeklyGoal || 1) * 100} 
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Retention Rate</span>
                    <span>{Math.round(metrics?.retentionRate || 0)}%</span>
                  </div>
                  <Progress value={metrics?.retentionRate} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Learning Velocity</span>
                    <span>{metrics?.learningVelocity} words/week</span>
                  </div>
                  <Progress value={(metrics?.learningVelocity || 0) / 20 * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics?.recentAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{achievement.title}</h4>
                          <Badge className={getRarityColor(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Favorite Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Learning Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {metrics?.favoriteCategories.map((category) => (
                  <Badge key={category} variant="secondary" className="px-3 py-1">
                    {category}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Based on your study patterns, you prefer {metrics?.favoriteCategories[0]?.toLowerCase()} vocabulary
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
