
import { useEffect, useState } from "react";
import WordCard from "@/components/WordCard";
import { Button } from "@/components/ui/button";
import AirtableConnectForm from "@/components/AirtableConnectForm";
import { fetchWordsFromAirtable, isAirtableConnected } from "@/services/airtableService";
import { Word } from "@/data/words";
import { words as defaultWords } from "@/data/words";
import { toast } from "sonner";

export default function Index() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnectForm, setShowConnectForm] = useState(false);

  const fetchWords = async () => {
    setLoading(true);
    try {
      if (isAirtableConnected()) {
        // Fetch from Airtable
        const airtableWords = await fetchWordsFromAirtable();
        setWords(airtableWords);
      } else {
        // Use default words from the data file
        setWords(defaultWords);
      }
    } catch (error) {
      console.error("Error fetching words:", error);
      toast.error("Failed to fetch words. Using default data instead.");
      setWords(defaultWords);
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
            <Button variant="outline" onClick={fetchWords}>
              Refresh Words
            </Button>
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
    </div>
  );
}
