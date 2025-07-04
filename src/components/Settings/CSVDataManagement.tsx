import React, { useState, useCallback } from 'react';
import { ArrowUpFromLine, ArrowDownToLine, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { WordProfileService } from '@/services/wordProfileService';
import { WordProfile } from '@/types/wordProfile';
import { v4 as uuidv4 } from 'uuid';

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
  const prefixText = getValueByHeader(['prefix', 'prefix_text']);
  const prefixMeaning = getValueByHeader(['prefix_meaning']);
  const suffixText = getValueByHeader(['suffix', 'suffix_text']);
  const suffixMeaning = getValueByHeader(['suffix_meaning']);

  const wordProfile: Partial<WordProfile> = {
    id: uuidv4(),
    word: word,
    morpheme_breakdown: {
      root: {
        text: rootText || word,
        meaning: rootMeaning || 'Not analyzed'
      },
      ...(prefixText && {
        prefix: {
          text: prefixText,
          meaning: prefixMeaning || 'Not analyzed'
        }
      }),
      ...(suffixText && {
        suffix: {
          text: suffixText,
          meaning: suffixMeaning || 'Not analyzed'
        }
      })
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

export function CSVDataManagement() {
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
        description: `Successfully imported ${successCount} word profiles. ${failedCount} entries were skipped.`
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
      
      let csvContent = "word,primary_definition,language_origin,parts_of_speech,root_text,root_meaning,prefix_text,prefix_meaning,suffix_text,suffix_meaning\n";
      
      wordProfiles.forEach(profile => {
        const csvRow = `${profile.word},"${profile.definitions?.primary || ''}","${profile.etymology?.language_of_origin || ''}","${profile.analysis?.parts_of_speech || ''}","${profile.morpheme_breakdown?.root?.text || ''}","${profile.morpheme_breakdown?.root?.meaning || ''}","${profile.morpheme_breakdown?.prefix?.text || ''}","${profile.morpheme_breakdown?.prefix?.meaning || ''}","${profile.morpheme_breakdown?.suffix?.text || ''}","${profile.morpheme_breakdown?.suffix?.meaning || ''}"`;
        csvContent += csvRow + "\n";
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
    <div className="space-y-6">
      {/* Import Section */}
      <div className="glass-card p-4 sm:p-6">
        <h3 className="text-lg font-medium mb-4">Import Word Profiles</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Upload CSV files with word data including morphological breakdowns, definitions, and etymology.
        </p>
        
        <div 
          className={`border-2 ${dragActive ? 'border-primary' : 'border-dashed border-border'} rounded-lg p-4 sm:p-8 transition-colors duration-200 flex flex-col items-center justify-center`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload size={32} className="text-muted-foreground mb-4" />
          <p className="text-center mb-4 text-sm sm:text-base">
            Drag and drop your CSV file here, or click to browse
          </p>
          
          <Input 
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="max-w-xs"
            disabled={isImporting}
          />
        </div>
        
        {csvFile && (
          <div className="text-sm mt-4 p-3 bg-secondary/20 rounded border">
            <p className="font-medium">Selected: {csvFile.name}</p>
            <p className="text-muted-foreground">Size: {Math.round(csvFile.size / 1024)} KB</p>
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
            <>Importing...</>
          ) : (
            <>
              <ArrowUpFromLine size={16} />
              Import CSV
            </>
          )}
        </Button>
      </div>

      {/* Export Section */}
      <div className="glass-card p-4 sm:p-6">
        <h3 className="text-lg font-medium mb-4">Export Word Profiles</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Download all word profiles as a CSV file including complete morphological data.
        </p>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Export includes: word, definitions, morphemes (prefix, root, suffix), etymology, and more
          </div>
          
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            {isExporting ? (
              <>Exporting...</>
            ) : (
              <>
                <ArrowDownToLine size={16} />
                Export CSV
              </>
            )}
          </Button>
        </div>
      </div>

      {/* CSV Format Guide */}
      <div className="glass-card p-4 sm:p-6 bg-secondary/10">
        <h3 className="text-lg font-medium mb-3">Supported CSV Format</h3>
        <p className="text-sm text-muted-foreground mb-3">
          The system automatically detects and maps these columns:
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <strong>Required columns:</strong>
            <ul className="list-disc ml-5 text-muted-foreground space-y-1 mt-1">
              <li>word, term, vocabulary, name</li>
              <li>definition, description, meaning</li>
            </ul>
          </div>
          <div>
            <strong>Optional columns:</strong>
            <ul className="list-disc ml-5 text-muted-foreground space-y-1 mt-1">
              <li>root, root_text, root_meaning</li>
              <li>prefix_text, prefix_meaning</li>
              <li>suffix_text, suffix_meaning</li>
              <li>origin, language, etymology</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}