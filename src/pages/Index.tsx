
import { useEffect, useState } from "react";
import WordCard from "@/components/WordCard";
import { Button } from "@/components/ui/button";
import AirtableConnectForm from "@/components/AirtableConnectForm";
import { fetchWordsFromAirtable, isAirtableConnected, disconnectAirtable } from "@/services/airtableService";
import { Word } from "@/data/words";
import { words as defaultWords } from "@/data/words";
import { toast } from "sonner";
import DailyWord from "@/components/DailyWord";
import WordQuiz from "@/components/WordQuiz";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid2X2, List, Database, RefreshCw } from "lucide-react";

export default function Index() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [dataSource, setDataSource] = useState<'airtable' | 'default'>('default');
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const fetchWords = async () => {
    setLoading(true);
    try {
      if (isAirtableConnected()) {
        // Fetch from Airtable
        try {
          const airtableWords = await fetchWordsFromAirtable();
          setWords(airtableWords);
          setDataSource('airtable');
          toast.success(`Loaded ${airtableWords.length} words from Airtable`);
        } catch (error) {
          console.error("Error fetching words from Airtable:", error);
          toast.error("Failed to fetch words from Airtable. Falling back to default data.");
          disconnectAirtable(); // Disconnect if there's an issue
          setWords(defaultWords);
          setDataSource('default');
        }
      } else {
        // Use default words from the data file
        setWords(defaultWords);
        setDataSource('default');
      }
    } catch (error) {
      console.error("Error fetching words:", error);
      toast.error("Failed to fetch words. Using default data instead.");
      setWords(defaultWords);
      setDataSource('default');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWords();
    
    // Load view mode preference
    const savedViewMode = localStorage.getItem('viewMode');
    if (savedViewMode === 'list' || savedViewMode === 'grid') {
      setViewMode(savedViewMode);
    }
  }, []);

  const toggleViewMode = () => {
    const newMode = viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(newMode);
    localStorage.setItem('viewMode', newMode);
  };

  const handleConnected = () => {
    setShowConnectForm(false);
    fetchWords();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">VocabGuru</h1>
          <p className="text-muted-foreground max-w-xl">
            Explore words with AI-powered morphological breakdowns to understand their origins and meanings more deeply.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isAirtableConnected() ? (
            <>
              <div className="text-sm text-muted-foreground mr-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                Connected to Airtable
              </div>
              <Button variant="outline" onClick={fetchWords}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="secondary" onClick={() => setShowConnectForm(true)}>
                <Database className="h-4 w-4 mr-2" />
                Manage
              </Button>
            </>
          ) : (
            <Button onClick={() => setShowConnectForm(true)}>
              <Database className="h-4 w-4 mr-2" />
              Connect to Airtable
            </Button>
          )}
        </div>
      </div>

      {showConnectForm && (
        <div className="mb-8">
          <AirtableConnectForm onConnect={handleConnected} />
        </div>
      )}

      {dataSource === 'default' && !loading && !showConnectForm && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md">
          <p className="text-amber-800 dark:text-amber-300 text-sm">
            Showing demo words. Connect to Airtable to manage your own vocabulary.
          </p>
        </div>
      )}

      <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
            <TabsTrigger value="all">All Words</TabsTrigger>
            <TabsTrigger value="daily">Daily Word</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
          </TabsList>
          
          {activeTab === 'all' && (
            <Button variant="outline" size="sm" onClick={toggleViewMode}>
              {viewMode === 'grid' ? (
                <>
                  <List className="h-4 w-4 mr-2" />
                  List View
                </>
              ) : (
                <>
                  <Grid2X2 className="h-4 w-4 mr-2" />
                  Grid View
                </>
              )}
            </Button>
          )}
        </div>
        
        <TabsContent value="all" className="mt-6">
          {loading ? (
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`${viewMode === 'grid' ? 'h-64' : 'h-24'} rounded-xl bg-gray-200 animate-pulse`}></div>
              ))}
            </div>
          ) : (
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
              {words.map((word) => (
                <WordCard key={word.id} word={word} viewMode={viewMode} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="daily" className="mt-6">
          <DailyWord words={words} />
        </TabsContent>
        
        <TabsContent value="quiz" className="mt-6">
          <WordQuiz words={words} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
