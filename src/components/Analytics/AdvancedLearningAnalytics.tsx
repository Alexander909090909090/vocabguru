
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Brain, 
  Clock, 
  Target, 
  Award,
  BookOpen,
  Zap,
  Calendar,
  PieChart as PieChartIcon,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

interface LearningMetrics {
  overallProgress: {
    wordsLearned: number;
    averageRetention: number;
    studyTime: number;
    accuracy: number;
    streak: number;
  };
  learningPatterns: {
    peakHours: number[];
    preferredCategories: string[];
    learningVelocity: number;
    consistencyScore: number;
  };
  performanceData: {
    daily: Array<{ date: string; words: number; accuracy: number; time: number }>;
    weekly: Array<{ week: string; progress: number; retention: number }>;
    categoryBreakdown: Array<{ category: string; words: number; accuracy: number }>;
  };
  predictions: {
    nextMilestone: { target: number; estimatedDays: number };
    recommendedStudyTime: number;
    optimalDifficulty: string;
    suggestedFocus: string[];
  };
}

interface AdvancedLearningAnalyticsProps {
  userId: string;
  timeRange: 'week' | 'month' | 'year';
}

export const AdvancedLearningAnalytics: React.FC<AdvancedLearningAnalyticsProps> = ({
  userId,
  timeRange = 'month'
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'progress' | 'patterns' | 'predictions'>('progress');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['learning-analytics', userId, timeRange],
    queryFn: async (): Promise<LearningMetrics> => {
      // Simulate analytics API call
      return generateAnalyticsData();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const generateAnalyticsData = (): LearningMetrics => {
    // Generate realistic analytics data
    const now = new Date();
    const dailyData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        words: Math.floor(Math.random() * 20) + 5,
        accuracy: 70 + Math.random() * 25,
        time: Math.floor(Math.random() * 60) + 15
      };
    });

    const weeklyData = Array.from({ length: 12 }, (_, i) => ({
      week: `Week ${i + 1}`,
      progress: 20 + Math.random() * 60,
      retention: 75 + Math.random() * 20
    }));

    const categoryData = [
      { category: 'Academic', words: 156, accuracy: 85 },
      { category: 'Science', words: 98, accuracy: 78 },
      { category: 'Literature', words: 67, accuracy: 92 },
      { category: 'Business', words: 45, accuracy: 88 },
      { category: 'Philosophy', words: 34, accuracy: 76 }
    ];

    return {
      overallProgress: {
        wordsLearned: 400,
        averageRetention: 82,
        studyTime: 1250, // minutes
        accuracy: 86,
        streak: 12
      },
      learningPatterns: {
        peakHours: [19, 20, 21], // 7-9 PM
        preferredCategories: ['Academic', 'Science', 'Literature'],
        learningVelocity: 15.2,
        consistencyScore: 78
      },
      performanceData: {
        daily: dailyData,
        weekly: weeklyData,
        categoryBreakdown: categoryData
      },
      predictions: {
        nextMilestone: { target: 500, estimatedDays: 18 },
        recommendedStudyTime: 25,
        optimalDifficulty: 'intermediate',
        suggestedFocus: ['Etymology', 'Academic Vocabulary']
      }
    };
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Analytics data unavailable</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={chartVariants}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{analytics.overallProgress.wordsLearned}</div>
              <div className="text-sm text-muted-foreground">Words Learned</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={chartVariants}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <Brain className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{analytics.overallProgress.averageRetention}%</div>
              <div className="text-sm text-muted-foreground">Retention Rate</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={chartVariants}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{Math.round(analytics.overallProgress.studyTime / 60)}h</div>
              <div className="text-sm text-muted-foreground">Study Time</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={chartVariants}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">{analytics.overallProgress.accuracy}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={chartVariants}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold flex items-center justify-center gap-1">
                {analytics.overallProgress.streak}
                <span className="text-orange-500">🔥</span>
              </div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Patterns
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Predictions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6 mt-6">
          {/* Daily Progress Chart */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={chartVariants}
          >
            <Card>
              <CardHeader>
                <CardTitle>Daily Learning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.performanceData.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value, name) => [
                        name === 'words' ? `${value} words` : 
                        name === 'accuracy' ? `${Math.round(value as number)}%` : 
                        `${value} min`,
                        name === 'words' ? 'Words Learned' :
                        name === 'accuracy' ? 'Accuracy' : 'Study Time'
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="words" 
                      stackId="1" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={chartVariants}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Learning by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={analytics.performanceData.categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="words"
                        label={({ category, words }) => `${category}: ${words}`}
                      >
                        {analytics.performanceData.categoryBreakdown.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} words`, 'Words Learned']} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-3">
                    {analytics.performanceData.categoryBreakdown.map((category, index) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{category.category}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{category.words} words</div>
                          <div className="text-xs text-muted-foreground">{category.accuracy}% accuracy</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6 mt-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={chartVariants}
          >
            <Card>
              <CardHeader>
                <CardTitle>Learning Patterns Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Peak Hours */}
                <div>
                  <h4 className="font-medium mb-3">Peak Learning Hours</h4>
                  <div className="flex gap-2">
                    {analytics.learningPatterns.peakHours.map((hour) => (
                      <Badge key={hour} variant="secondary">
                        {hour}:00 - {hour + 1}:00
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Learning Velocity */}
                <div>
                  <h4 className="font-medium mb-3">Learning Velocity</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{analytics.learningPatterns.learningVelocity}</span>
                    <span className="text-muted-foreground">words per week</span>
                  </div>
                  <Progress value={analytics.learningPatterns.learningVelocity / 20 * 100} className="mt-2" />
                </div>

                {/* Consistency Score */}
                <div>
                  <h4 className="font-medium mb-3">Consistency Score</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{analytics.learningPatterns.consistencyScore}%</span>
                    <span className="text-muted-foreground">study regularity</span>
                  </div>
                  <Progress value={analytics.learningPatterns.consistencyScore} className="mt-2" />
                </div>

                {/* Preferred Categories */}
                <div>
                  <h4 className="font-medium mb-3">Preferred Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {analytics.learningPatterns.preferredCategories.map((category) => (
                      <Badge key={category} variant="default">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6 mt-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={chartVariants}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI-Powered Predictions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Next Milestone */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
                  <h4 className="font-medium mb-2">Next Milestone</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    You're on track to reach {analytics.predictions.nextMilestone.target} words learned
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">
                      {analytics.predictions.nextMilestone.estimatedDays} days remaining
                    </span>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Recommended Study Time</h4>
                    <div className="text-2xl font-bold">{analytics.predictions.recommendedStudyTime} min/day</div>
                    <p className="text-sm text-muted-foreground">
                      Optimal for your learning pace
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Optimal Difficulty</h4>
                    <Badge variant="secondary" className="text-base">
                      {analytics.predictions.optimalDifficulty}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      Based on your performance
                    </p>
                  </div>
                </div>

                {/* Suggested Focus Areas */}
                <div>
                  <h4 className="font-medium mb-3">Suggested Focus Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {analytics.predictions.suggestedFocus.map((area) => (
                      <Badge key={area} variant="outline" className="gap-1">
                        <Target className="h-3 w-3" />
                        {area}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    AI recommends focusing on these areas for maximum learning efficiency
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
