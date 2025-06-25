
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, TrendingUp, Award, BookOpen, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonalizedDashboard } from '@/components/Dashboard/PersonalizedDashboard';
import { AdvancedLearningAnalytics } from '@/components/Analytics/AdvancedLearningAnalytics';
import { SocialLearningHub } from '@/components/Community/SocialLearningHub';
import { ContextualNavigation } from '@/components/Navigation/ContextualNavigation';
import { useAuth } from '@/context/AuthContext';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

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
            <User className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-semibold">Profile & Analytics</h1>
              <p className="text-muted-foreground">
                Track your progress and connect with the learning community
              </p>
            </div>
          </motion.div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Community
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6 mt-6">
              <PersonalizedDashboard userId={user?.id} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6 mt-6">
              <AdvancedLearningAnalytics 
                userId={user?.id || 'anonymous'} 
                timeRange="month" 
              />
            </TabsContent>

            <TabsContent value="social" className="space-y-6 mt-6">
              <SocialLearningHub userId={user?.id || 'anonymous'} />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Advanced settings panel coming soon!</p>
                    <p className="text-sm">Customize your learning experience and preferences.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ContextualNavigation 
            currentContext="Profile"
            nextSteps={[
              {
                icon: <BookOpen className="h-4 w-4" />,
                label: 'Continue Learning',
                href: '/study-center',
                description: 'Resume your study session',
                primary: true
              },
              {
                icon: <Award className="h-4 w-4" />,
                label: 'View Achievements',
                href: '/profile',
                description: 'See all earned badges'
              }
            ]}
            quickActions={[
              {
                icon: <Users className="h-4 w-4" />,
                label: 'Community',
                href: '/discovery',
                description: 'Connect with learners'
              }
            ]}
          />

          {/* Profile Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold">Scholar</div>
                <div className="text-sm text-muted-foreground">Current Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">342</div>
                <div className="text-sm text-muted-foreground">Total Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">89%</div>
                <div className="text-sm text-muted-foreground">Overall Accuracy</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
