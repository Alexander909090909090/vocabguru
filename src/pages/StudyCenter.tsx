
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Target, Users, TrendingUp, Play } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdvancedAITutor } from '@/components/AI/AdvancedAITutor';
import { AdvancedLearningAnalytics } from '@/components/Analytics/AdvancedLearningAnalytics';
import { ContextualNavigation } from '@/components/Navigation/ContextualNavigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const StudyCenter = () => {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<'vocabulary' | 'comprehension' | 'morphology' | 'etymology'>('vocabulary');

  const handleStartSession = (type: 'vocabulary' | 'comprehension' | 'morphology' | 'etymology') => {
    setSessionType(type);
    setActiveSession('ai-tutor');
    toast.success(`Starting ${type} session with AI tutor`);
  };

  const handleSessionComplete = (session: any) => {
    setActiveSession(null);
    toast.success(`Session completed! Score: ${session.score}`);
  };

  const studyModes = [
    {
      id: 'vocabulary',
      title: 'Vocabulary Building',
      description: 'Learn new words with AI-guided sessions',
      icon: BookOpen,
      color: 'bg-blue-500',
      difficulty: 'Adaptive'
    },
    {
      id: 'morphology',
      title: 'Morphology Analysis',
      description: 'Master word structure and components',
      icon: Brain,
      color: 'bg-purple-500',
      difficulty: 'Advanced'
    },
    {
      id: 'etymology',
      title: 'Etymology Exploration',
      description: 'Discover word origins and evolution',
      icon: Target,
      color: 'bg-green-500',
      difficulty: 'Intermediate'
    },
    {
      id: 'comprehension',
      title: 'Reading Comprehension',
      description: 'Improve understanding in context',
      icon: TrendingUp,
      color: 'bg-orange-500',
      difficulty: 'All Levels'
    }
  ];

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
      className="container mx-auto py-8 px-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-semibold">Advanced Study Center</h1>
              <p className="text-muted-foreground">
                AI-powered personalized learning with advanced analytics
              </p>
            </div>
          </motion.div>

          {/* Active Session or Mode Selection */}
          {activeSession === 'ai-tutor' ? (
            <AdvancedAITutor
              userId={user?.id || 'anonymous'}
              sessionType={sessionType}
              onSessionComplete={handleSessionComplete}
            />
          ) : (
            <Tabs defaultValue="modes" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="modes" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Study Modes
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="social" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Social
                </TabsTrigger>
              </TabsList>

              <TabsContent value="modes" className="space-y-6 mt-6">
                {/* Study Mode Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studyModes.map((mode, index) => {
                    const Icon = mode.icon;
                    return (
                      <motion.div
                        key={mode.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-lg ${mode.color} text-white`}>
                                <Icon className="h-6 w-6" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-2">{mode.title}</h3>
                                <p className="text-muted-foreground text-sm mb-4">
                                  {mode.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs bg-muted px-2 py-1 rounded">
                                    {mode.difficulty}
                                  </span>
                                  <Button
                                    onClick={() => handleStartSession(mode.id as any)}
                                    size="sm"
                                  >
                                    Start Session
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                        <Brain className="h-6 w-6" />
                        <span>Continue Last Session</span>
                      </Button>
                      <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                        <Target className="h-6 w-6" />
                        <span>Practice Weak Areas</span>
                      </Button>
                      <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                        <TrendingUp className="h-6 w-6" />
                        <span>Challenge Mode</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6 mt-6">
                <AdvancedLearningAnalytics 
                  userId={user?.id || 'anonymous'} 
                  timeRange="month" 
                />
              </TabsContent>

              <TabsContent value="social" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Social Learning Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Social learning features coming soon!</p>
                      <p className="text-sm">Study with friends, join group sessions, and compete in challenges.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ContextualNavigation 
            currentContext="Study Center"
            nextSteps={[
              {
                icon: <Brain className="h-4 w-4" />,
                label: 'AI Recommendations',
                href: '/discovery',
                description: 'Get personalized word suggestions',
                primary: true
              },
              {
                icon: <TrendingUp className="h-4 w-4" />,
                label: 'View Analytics',
                href: '/profile',
                description: 'Track your learning progress'
              }
            ]}
          />

          {/* Study Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold">18</div>
                <div className="text-sm text-muted-foreground">Minutes Studied</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">7</div>
                <div className="text-sm text-muted-foreground">Words Practiced</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">94%</div>
                <div className="text-sm text-muted-foreground">Session Accuracy</div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <span className="text-sm">Perfect Session</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  <span className="text-sm">7-Day Streak</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📚</span>
                  <span className="text-sm">Scholar Badge</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default StudyCenter;
