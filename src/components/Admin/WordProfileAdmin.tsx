
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { WordProfileService } from "@/services/wordProfileService";
import { WebhookLog } from "@/types/wordProfile";
import { migrateToDatabase } from "@/data/wordProfiles";
import { useWordProfiles } from "@/hooks/useWordProfiles";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { RefreshCw, Database, Webhook, TrendingUp, Shield } from "lucide-react";

export function WordProfileAdmin() {
  const { wordProfiles, loading, refreshWordProfiles } = useWordProfiles();
  const { isAdmin, loading: authLoading } = useSecureAuth();
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadWebhookLogs();
    }
  }, [isAdmin]);

  const loadWebhookLogs = async () => {
    try {
      const logs = await WordProfileService.getWebhookLogs();
      setWebhookLogs(logs);
    } catch (error) {
      console.error('Error loading webhook logs:', error);
    }
  };

  const handleMigration = async () => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    setMigrating(true);
    try {
      await migrateToDatabase();
      toast.success('Migration completed successfully!');
      refreshWordProfiles();
    } catch (error) {
      toast.error('Migration failed. Check console for details.');
      console.error('Migration error:', error);
    } finally {
      setMigrating(false);
    }
  };

  const testWebhook = async () => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    try {
      const testPayload = {
        word: "testword",
        morpheme_breakdown: {
          root: { text: "test", meaning: "to examine" }
        },
        definitions: {
          primary: "A test word for webhook testing"
        },
        etymology: {
          language_of_origin: "English"
        },
        analysis: {
          parts_of_speech: "noun"
        }
      };

      await WordProfileService.processWebhook('test', testPayload);
      toast.success('Test webhook processed successfully!');
      refreshWordProfiles();
      loadWebhookLogs();
    } catch (error) {
      toast.error('Test webhook failed');
      console.error('Test webhook error:', error);
    }
  };

  if (authLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You need administrator privileges to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper function to get language origin from etymology
  const getLanguageOrigin = (profile: any) => {
    return profile.etymology?.language_of_origin || 'Unknown';
  };

  // Helper function to get parts of speech from analysis
  const getPartsOfSpeech = (profile: any) => {
    return profile.analysis?.parts_of_speech || 'Unknown';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Word Profile Administration</h1>
        <Button onClick={refreshWordProfiles} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Words</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wordProfiles.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Definitions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wordProfiles.filter(w => w.definitions?.primary).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhook Logs</CardTitle>
            <Webhook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webhookLogs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {webhookLogs.filter(log => {
                const today = new Date().toDateString();
                return new Date(log.processed_at).toDateString() === today;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="words">Word Profiles</TabsTrigger>
          <TabsTrigger value="webhooks">Webhook Logs</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {webhookLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex justify-between items-center">
                      <span className="text-sm">{log.source}</span>
                      <Badge variant={log.status === 'processed' ? 'default' : 'destructive'}>
                        {log.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Language Origins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from(new Set(wordProfiles.map(w => getLanguageOrigin(w))))
                    .slice(0, 5)
                    .map((origin) => (
                      <div key={origin} className="flex justify-between items-center">
                        <span className="text-sm">{origin}</span>
                        <Badge variant="outline">
                          {wordProfiles.filter(w => getLanguageOrigin(w) === origin).length}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="words" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Word Profiles ({wordProfiles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div>Loading word profiles...</div>
                ) : (
                  <div className="grid gap-4">
                    {wordProfiles.slice(0, 10).map((profile) => (
                      <div key={profile.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{profile.word}</h3>
                          <p className="text-sm text-muted-foreground">
                            {getLanguageOrigin(profile)} • {getPartsOfSpeech(profile)}
                          </p>
                          {profile.definitions?.primary && (
                            <p className="text-sm text-gray-600 mt-1 truncate">
                              {profile.definitions.primary}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">{getPartsOfSpeech(profile)}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhookLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{log.source}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.processed_at).toLocaleString()}
                        </span>
                      </div>
                      {log.error_message && (
                        <p className="text-sm text-red-600 mt-1">{log.error_message}</p>
                      )}
                    </div>
                    <Badge variant={log.status === 'processed' ? 'default' : 'destructive'}>
                      {log.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Migration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Migrate existing word data from the legacy format to the new database schema.
                </p>
                <Button onClick={handleMigration} disabled={migrating}>
                  {migrating ? 'Migrating...' : 'Migrate Legacy Data'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Webhook Testing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Test the webhook processing system with a sample payload.
                </p>
                <Button onClick={testWebhook}>
                  Send Test Webhook
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default WordProfileAdmin;
