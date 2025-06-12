
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpFromLine, ArrowDownToLine, Upload, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { WordProfileService } from '@/services/wordProfileService';
import { WordProfile } from '@/types/wordProfile';
import { v4 as uuidv4 } from 'uuid';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const wordProfileToCSV = (profile: WordProfile): string => {
  const header = "word,primary_definition,language_origin,parts_of_speech,root_text,root_meaning";
  
  const csvRow = `${profile.word},"${profile.definitions?.primary || ''}","${profile.etymology?.language_of_origin || ''}","${profile.analysis?.parts_of_speech || ''}","${profile.morpheme_breakdown?.root?.text || ''}","${profile.morpheme_breakdown?.root?.meaning || ''}"`;
  
  return csvRow;
};

const csvToWordProfile = (row: string, headers: string[]): Partial<WordProfile> | null => {
  const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
  
  if (values.join('').trim() === '') {
    return null;
  }

  const headerMap: Record<string, number> = {};
  headers.forEach((header, index) => {
    headerMap[header.toLowerCase().trim()] = index;
  });

  const getValueByHeader = (possibleHeaders: string[]): string => {
    for (const header of possibleHeaders) {
      const index = headerMap[header];
      if (index !== undefined && values[index]) {
        return values[index];
      }
    }
    return '';
  };

  const word = getValueByHeader(['word', 'term', 'vocabulary', 'name']);
  if (!word) return null;

  const primaryDefinition = getValueByHeader(['definition', 'description', 'meaning', 'primary_definition']);
  const languageOrigin = getValueByHeader(['origin', 'language', 'language_origin', 'etymology']);
  const partOfSpeech = getValueByHeader(['part_of_speech', 'pos', 'parts_of_speech', 'type']);
  const rootText = getValueByHeader(['root', 'root_text', 'base_word']);
  const rootMeaning = getValueByHeader(['root_meaning', 'core_meaning', 'base_meaning']);

  const wordProfile: Partial<WordProfile> = {
    id: uuidv4(),
    word: word,
    morpheme_breakdown: {
      root: {
        text: rootText || word,
        meaning: rootMeaning || 'Not analyzed'
      }
    },
    etymology: {
      language_of_origin: languageOrigin || 'Unknown',
      historical_origins: 'Imported from CSV'
    },
    definitions: {
      primary: primaryDefinition || `Definition for ${word}`
    },
    word_forms: {},
    analysis: {
      parts_of_speech: partOfSpeech || 'noun'
    }
  };

  return wordProfile;
};

const IntegrationsPage: React.FC = () => {
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
      
      if (rows.length < 2) {
        throw new Error("CSV file must have at least a header row and one data row");
      }
      
      const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
      const totalRows = rows.length - 1;
      
      let successCount = 0;
      let failedCount = 0;
      
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].trim()) {
          const wordProfileData = csvToWordProfile(rows[i], headers);
          
          if (wordProfileData && wordProfileData.word) {
            try {
              await WordProfileService.createWordProfile(wordProfileData);
              successCount++;
            } catch (error) {
              console.error("Error adding word profile:", error);
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
        description: `Successfully imported ${successCount} word profiles to Supabase. ${failedCount} entries were skipped.`
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
  
  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const wordProfiles = await WordProfileService.getAllWordProfiles();
      
      let csvContent = "word,primary_definition,language_origin,parts_of_speech,root_text,root_meaning\n";
      
      wordProfiles.forEach(profile => {
        csvContent += wordProfileToCSV(profile) + "\n";
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.setAttribute('href', url);
      link.setAttribute('download', 'vocabguru-word-profiles.csv');
      document.body.appendChild(link);
      
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: `Exported ${wordProfiles.length} word profiles to CSV file.`
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
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5" />
              <h2 className="text-xl font-medium">Import Word Profiles to Supabase</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Upload your CSV file with word data. The system will automatically map columns and save directly to your Supabase database.
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
                <>Importing to Supabase...</>
              ) : (
                <>
                  <ArrowUpFromLine size={16} />
                  Import to Supabase
                </>
              )}
            </Button>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-medium mb-3">Supported CSV Formats</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              The system automatically detects and maps these column types:
            </p>
            
            <ul className="list-disc ml-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li><strong>Word columns:</strong> word, term, vocabulary, name</li>
              <li><strong>Definition columns:</strong> definition, description, meaning, primary_definition</li>
              <li><strong>Origin columns:</strong> origin, language, language_origin, etymology</li>
              <li><strong>Part of speech:</strong> part_of_speech, pos, parts_of_speech, type</li>
              <li><strong>Root word:</strong> root, root_text, base_word</li>
              <li><strong>Root meaning:</strong> root_meaning, core_meaning, base_meaning</li>
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="export" className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5" />
              <h2 className="text-xl font-medium">Export Word Profiles from Supabase</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Download all word profiles from your Supabase database as a CSV file.
            </p>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Export includes: word, primary definition, language origin, parts of speech, root text, and root meaning
              </div>
              
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2"
              >
                {isExporting ? (
                  <>Exporting...</>
                ) : (
                  <>
                    <ArrowDownToLine size={16} />
                    Export from Supabase
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
