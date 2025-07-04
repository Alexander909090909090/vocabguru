
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Database, Shield, Bell, User, Plug } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatabaseMonitor } from '@/components/DatabaseMonitor';
import { SeedingControl } from '@/components/DatabaseSeeding/SeedingControl';
import { APIIntegrationsTab } from '@/components/Settings/APIIntegrationsTab';
import { EnrichmentSection } from '@/components/Settings/EnrichmentSection';
import { AICSVImporter } from '@/components/Settings/AICSVImporter';
import { RoleService } from '@/services/roleService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const SettingsPage: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const hasAdminRole = await RoleService.hasRole('admin');
        setIsAdmin(hasAdminRole);
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setIsCheckingRole(false);
      }
    };

    checkAdminRole();
  }, []);

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
        Manage your VocabGuru preferences, database, integrations, and account settings.
      </p>

      <Tabs defaultValue="enrichment" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1">
          <TabsTrigger value="enrichment" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <SettingsIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Enrichment</span>
            <span className="sm:hidden">Enrich</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Database className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Database</span>
            <span className="sm:hidden">DB</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Plug className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">API Integrations</span>
            <span className="sm:hidden">APIs</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <User className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Account</span>
            <span className="sm:hidden">User</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Notifications</span>
            <span className="sm:hidden">Notify</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Privacy</span>
            <span className="sm:hidden">Sec</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrichment" className="space-y-6 mt-6">
          <div>
            <h2 className="text-2xl font-medium mb-4">Word Repository Enrichment</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Enhance your word repository with AI-powered linguistic analysis, morphological breakdowns, and comprehensive language data.
            </p>
          </div>
          
          <EnrichmentSection />
        </TabsContent>

        <TabsContent value="database" className="space-y-6 mt-6">
          <div>
            <h2 className="text-2xl font-medium mb-4">Database Management</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Monitor database status and populate the word repository for optimal Discovery page performance.
            </p>
          </div>
          
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <div className="lg:col-span-1">
              <DatabaseMonitor />
            </div>
            <div className="lg:col-span-1">
              <SeedingControl />
            </div>
            <div className="lg:col-span-2 xl:col-span-1">
              <AICSVImporter />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6 mt-6">
          <div>
            <h2 className="text-2xl font-medium mb-4">API Integrations</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Configure open-source dictionary APIs and AI models for enhanced word analysis and enrichment.
            </p>
            
            {!isAdmin && !isCheckingRole && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Administrator access required to manage API integrations. Contact your system administrator for access.
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          {isCheckingRole ? (
            <div className="bg-secondary/20 p-6 rounded-lg">
              <p className="text-center text-muted-foreground">
                Checking permissions...
              </p>
            </div>
          ) : isAdmin ? (
            <APIIntegrationsTab />
          ) : (
            <div className="bg-secondary/20 p-6 rounded-lg">
              <p className="text-center text-muted-foreground">
                Administrator privileges required to access API integrations.
              </p>
            </div>
          )}
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
