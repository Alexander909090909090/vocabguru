import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Database, Shield, Bell, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatabaseMonitor } from '@/components/DatabaseMonitor';
import { SeedingControl } from '@/components/DatabaseSeeding/SeedingControl';
import { WordEnrichmentControl } from '@/components/DatabaseSeeding/WordEnrichmentControl';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const SettingsPage: React.FC = () => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
      className="container mx-auto py-8 px-4"
    >
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-semibold">Settings</h1>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Manage your VocabGuru preferences, database, and account settings.
      </p>

      <Tabs defaultValue="database" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-6 mt-6">
          <div>
            <h2 className="text-2xl font-medium mb-4">Database Management</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Monitor database status, populate the word repository, and enrich words with AI-powered analysis.
            </p>
          </div>
          
          <div className="grid gap-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <DatabaseMonitor />
              <SeedingControl />
            </div>
            
            {/* Full-width LLM Enrichment Control */}
            <div className="w-full flex justify-center">
              <WordEnrichmentControl />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="account" className="space-y-6 mt-6">
          <div>
            <h2 className="text-2xl font-medium mb-4">Account Settings</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Manage your profile, learning preferences, and account details.
            </p>
            <div className="bg-secondary/20 p-6 rounded-lg">
              <p className="text-center text-muted-foreground">
                Account settings will be available in a future update.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 mt-6">
          <div>
            <h2 className="text-2xl font-medium mb-4">Notification Preferences</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Control how and when you receive notifications from VocabGuru.
            </p>
            <div className="bg-secondary/20 p-6 rounded-lg">
              <p className="text-center text-muted-foreground">
                Notification settings will be available in a future update.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6 mt-6">
          <div>
            <h2 className="text-2xl font-medium mb-4">Privacy & Security</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Manage your data privacy and security preferences.
            </p>
            <div className="bg-secondary/20 p-6 rounded-lg">
              <p className="text-center text-muted-foreground">
                Privacy settings will be available in a future update.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default SettingsPage;
