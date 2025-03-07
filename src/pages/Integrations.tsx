
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWords } from '@/context/WordsContext';
import { ArrowUpFromLine, ArrowDownToLine, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Word } from '@/data/words';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// Helper function to convert Word object to CSV row
const wordToCSV = (word: Word): string => {
  // Create header row if it's the first item
  const header = "id,word,pronunciation,description,languageOrigin,partOfSpeech";
  
  // Basic properties
  const csvRow = `${word.id},${word.word},${word.pronunciation || ''},${word.description.replace(/,/g, ';')},${word.languageOrigin},${word.partOfSpeech}`;
  
  return csvRow;
};

// Helper to convert CSV row to Word object
const csvToWord = (row: string, headers: string[]): Partial<Word> | null => {
  const values = row.split(',');
  
  // Skip rows with incorrect format
  if (values.length < headers.length) {
    return null;
  }
  
  // Create a partial Word object
  const wordData: Record<string, any> = {};
  
  headers.forEach((header, index) => {
    if (header && values[index]) {
      wordData[header] = values[index];
    }
  });
  
  // Validate minimum required fields
  if (!wordData.id || !wordData.word || !wordData.description) {
    return null;
  }
  
  // Create default values for required nested objects
  const partialWord: Partial<Word> = {
    ...wordData,
    morphemeBreakdown: {
      root: { text: wordData.word, meaning: "Not analyzed" }
    },
    etymology: {
      origin: wordData.languageOrigin || "Unknown",
      evolution: "Not provided"
    },
    definitions: [
      {
        type: "primary",
        text: wordData.description
      }
    ],
    forms: {},
    usage: {
      commonCollocations: [],
      contextualUsage: "Not provided",
      exampleSentence: "Not provided"
    },
    synonymsAntonyms: {
      synonyms: [],
      antonyms: []
    },
    images: []
  };
  
  return partialWord;
};

const IntegrationsPage: React.FC = () => {
  const { words, addWord } = useWords();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importStats, setImportStats] = useState({ total: 0, success: 0, failed: 0 });
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
      // Reset stats
      setImportProgress(0);
      setImportStats({ total: 0, success: 0, failed: 0 });
    }
  };
  
  const handleImport = async () => {
    if (!csvFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to import",
        variant: "destructive"
      });
      return;
    }
    
    setIsImporting(true);
    
    try {
      const text = await csvFile.text();
      const rows = text.split('\n');
      
      if (rows.length < 2) {
        throw new Error("CSV file must contain a header row and at least one data row");
      }
      
      // Extract headers from first row
      const headers = rows[0].split(',');
      const totalRows = rows.length - 1; // Excluding header
      
      let successCount = 0;
      let failedCount = 0;
      
      // Process each row (skip header)
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].trim()) {
          const wordData = csvToWord(rows[i], headers);
          
          if (wordData && wordData.id && wordData.word && wordData.description) {
            try {
              // Create a complete Word object with required fields
              const completeWord = wordData as Word;
              addWord(completeWord);
              successCount++;
            } catch (error) {
              console.error("Error adding word:", error);
              failedCount++;
            }
          } else {
            failedCount++;
          }
        }
        
        // Update progress
        const progress = Math.floor(((i) / totalRows) * 100);
        setImportProgress(progress);
        setImportStats({
          total: totalRows,
          success: successCount,
          failed: failedCount
        });
      }
      
      toast({
        title: "Import completed",
        description: `Successfully imported ${successCount} words. ${failedCount} entries were skipped.`
      });
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      setImportProgress(100);
    }
  };
  
  const handleExport = () => {
    setIsExporting(true);
    
    try {
      // Create CSV content
      let csvContent = "id,word,pronunciation,description,languageOrigin,partOfSpeech\n";
      
      // Add each word as a row
      words.forEach(word => {
        csvContent += wordToCSV(word) + "\n";
      });
      
      // Create blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.setAttribute('href', url);
      link.setAttribute('download', 'vocabguru-words.csv');
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: `Exported ${words.length} words to CSV file.`
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
      className="container mx-auto py-8 px-4"
    >
      <h1 className="text-3xl font-semibold mb-6">Integrations</h1>
      
      <Tabs defaultValue="import" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="import" className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-medium mb-4">Import Words from CSV</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Upload a CSV file with vocabulary words. The file must include columns for id, word, and description at minimum.
            </p>
            
            <div className="flex flex-col space-y-4">
              <Input 
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="border-dashed border-2"
                disabled={isImporting}
              />
              
              {csvFile && (
                <div className="text-sm text-gray-500">
                  Selected file: {csvFile.name} ({Math.round(csvFile.size / 1024)} KB)
                </div>
              )}
              
              {importProgress > 0 && (
                <div className="space-y-2">
                  <Progress value={importProgress} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>{importProgress}% complete</span>
                    <span>
                      {importStats.success} successful / {importStats.failed} failed
                    </span>
                  </div>
                </div>
              )}
              
              <Button
                onClick={handleImport}
                disabled={!csvFile || isImporting}
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                {isImporting ? (
                  <>Processing...</>
                ) : (
                  <>
                    <ArrowUpFromLine size={16} />
                    Import Words
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-medium mb-3">CSV Format Instructions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Your CSV file should have the following structure:
            </p>
            
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono overflow-x-auto">
              id,word,pronunciation,description,languageOrigin,partOfSpeech<br/>
              example1,Example,/ɪɡˈzæmpəl/,A representative or illustration of a specific thing,Latin,noun<br/>
              example2,Sample,/ˈsæmpəl/,A small part intended to show what the whole is like,Greek,noun
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="export" className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-medium mb-4">Export Words to CSV</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Download all your vocabulary words as a CSV file that can be opened in spreadsheet applications.
            </p>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {words.length} words available for export
              </div>
              
              <Button
                onClick={handleExport}
                disabled={isExporting || words.length === 0}
                className="flex items-center gap-2"
              >
                {isExporting ? (
                  <>Processing...</>
                ) : (
                  <>
                    <ArrowDownToLine size={16} />
                    Export to CSV
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default IntegrationsPage;
