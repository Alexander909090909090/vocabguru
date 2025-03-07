import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useWords } from '@/context/WordsContext';
import { ArrowUpFromLine, ArrowDownToLine, X, Check, AlertCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Word } from '@/data/words';
import { v4 as uuidv4 } from 'uuid';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const wordToCSV = (word: Word): string => {
  const header = "id,word,pronunciation,description,languageOrigin,partOfSpeech";
  
  const csvRow = `${word.id},${word.word},${word.pronunciation || ''},${word.description.replace(/,/g, ';')},${word.languageOrigin},${word.partOfSpeech}`;
  
  return csvRow;
};

const detectHeaders = (headerRow: string): Record<string, string> => {
  const headers = headerRow.split(',').map(h => h.trim().toLowerCase());
  const headerMap: Record<string, string> = {};
  
  headers.forEach((header, index) => {
    if (header === 'word' || header === 'term' || header === 'vocabulary' || header === 'expression') {
      headerMap['word'] = index.toString();
    } else if (header === 'definition' || header === 'description' || header === 'meaning' || header === 'explanation') {
      headerMap['description'] = index.toString();
    } else if (header === 'pronunciation' || header === 'phonetics' || header === 'sound') {
      headerMap['pronunciation'] = index.toString();
    } else if (header === 'origin' || header === 'language' || header === 'languageorigin' || header === 'language_origin' || header === 'etymology') {
      headerMap['languageOrigin'] = index.toString();
    } else if (header === 'partofspeech' || header === 'part_of_speech' || header === 'pos' || header === 'wordtype' || header === 'word_type') {
      headerMap['partOfSpeech'] = index.toString();
    } else if (header === 'id' || header === 'identifier' || header === 'key') {
      headerMap['id'] = index.toString();
    }
  });
  
  return headerMap;
};

const csvToWord = (row: string, headerMap: Record<string, string>): Partial<Word> | null => {
  const values = row.split(',').map(v => v.trim());
  
  if (values.join('').trim() === '') {
    return null;
  }
  
  const wordData: Record<string, any> = {};
  
  if (!headerMap['id'] || !values[parseInt(headerMap['id'])]) {
    wordData.id = uuidv4();
  } else {
    wordData.id = values[parseInt(headerMap['id'])];
  }
  
  if (headerMap['word'] && values[parseInt(headerMap['word'])]) {
    wordData.word = values[parseInt(headerMap['word'])];
  } else {
    for (let i = 0; i < values.length; i++) {
      if (values[i] && values[i].length > 0 && values[i].length < 30 && /^[a-zA-Z\s-]+$/.test(values[i])) {
        wordData.word = values[i];
        break;
      }
    }
    
    if (!wordData.word) {
      return null;
    }
  }
  
  if (headerMap['description'] && values[parseInt(headerMap['description'])]) {
    wordData.description = values[parseInt(headerMap['description'])];
  } else {
    for (let i = 0; i < values.length; i++) {
      if (values[i] && values[i].length > 30) {
        wordData.description = values[i];
        break;
      }
    }
    
    if (!wordData.description) {
      wordData.description = `Definition for ${wordData.word}`;
    }
  }
  
  if (headerMap['pronunciation'] && values[parseInt(headerMap['pronunciation'])]) {
    wordData.pronunciation = values[parseInt(headerMap['pronunciation'])];
  }
  
  if (headerMap['languageOrigin'] && values[parseInt(headerMap['languageOrigin'])]) {
    wordData.languageOrigin = values[parseInt(headerMap['languageOrigin'])];
  } else {
    wordData.languageOrigin = "Unknown";
  }
  
  if (headerMap['partOfSpeech'] && values[parseInt(headerMap['partOfSpeech'])]) {
    wordData.partOfSpeech = values[parseInt(headerMap['partOfSpeech'])];
  } else {
    wordData.partOfSpeech = "noun";
  }
  
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
  const [dragActive, setDragActive] = useState(false);
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "text/csv" || file.name.endsWith('.csv')) {
        setCsvFile(file);
        setImportProgress(0);
        setImportStats({ total: 0, success: 0, failed: 0 });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV file",
          variant: "destructive"
        });
      }
    }
  }, []);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
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
      
      if (rows.length < 1) {
        throw new Error("CSV file appears to be empty");
      }
      
      const headerMap = detectHeaders(rows[0]);
      
      if (!headerMap['word']) {
        toast({
          title: "CSV format not recognized",
          description: "Could not identify a column containing words. Import will continue but may not be accurate.",
          variant: "default"
        });
      }
      
      const totalRows = rows.length - 1;
      
      let successCount = 0;
      let failedCount = 0;
      
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].trim()) {
          const wordData = csvToWord(rows[i], headerMap);
          
          if (wordData && wordData.id && wordData.word) {
            try {
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
      let csvContent = "id,word,pronunciation,description,languageOrigin,partOfSpeech\n";
      
      words.forEach(word => {
        csvContent += wordToCSV(word) + "\n";
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.setAttribute('href', url);
      link.setAttribute('download', 'vocabguru-words.csv');
      document.body.appendChild(link);
      
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
              Upload any CSV file with vocabulary words. Our system will automatically detect the format and convert it to the application's structure.
            </p>
            
            <div 
              className={`border-2 ${dragActive ? 'border-primary' : 'border-dashed border-gray-300'} rounded-lg p-8 transition-colors duration-200 flex flex-col items-center justify-center`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload size={40} className="text-gray-400 mb-4" />
              <p className="text-center mb-4">Drag and drop your CSV file here, or click to browse</p>
              
              <Input 
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="border-none"
                disabled={isImporting}
                fileUploadLabel="Any CSV format is supported - we'll figure it out!"
              />
            </div>
            
            {csvFile && (
              <div className="text-sm mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                <p className="font-medium">Selected file: {csvFile.name}</p>
                <p className="text-gray-500">Size: {Math.round(csvFile.size / 1024)} KB</p>
              </div>
            )}
            
            {importProgress > 0 && (
              <div className="space-y-2 mt-4">
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
              className="w-full sm:w-auto flex items-center justify-center gap-2 mt-4"
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
          
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-medium mb-3">Automatic Format Detection</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Our system will automatically detect common CSV formats and map them to the appropriate fields:
            </p>
            
            <ul className="list-disc ml-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>Word/Term/Vocabulary columns will be mapped to word name</li>
              <li>Definition/Description/Meaning columns will be mapped to word description</li>
              <li>Origin/Language/Etymology columns will be mapped to language origin</li>
              <li>POS/Part of Speech/Word Type columns will be mapped to part of speech</li>
              <li>Missing data will be filled with sensible defaults</li>
            </ul>
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
