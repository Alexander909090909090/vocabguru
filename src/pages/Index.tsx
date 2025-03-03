
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

export default function Index() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [dataSource, setDataSource] = useState<'airtable' | 'default'>('default');
  const [activeTab, setActiveTab] = useState("all");

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
  }, []);

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
                Refresh Words
              </Button>
              <Button variant="secondary" onClick={() => setShowConnectForm(true)}>
                Manage Connection
              </Button>
            </>
          ) : (
            <Button onClick={() => setShowConnectForm(true)}>
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
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="all">All Words</TabsTrigger>
          <TabsTrigger value="daily">Daily Word</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded-xl bg-gray-200 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {words.map((word) => (
                <WordCard key={word.id} word={word} />
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
