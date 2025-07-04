import React, { useState, useCallback } from 'react';
import { ArrowUpFromLine, Upload, Brain, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { DynamicCsvService } from '@/services/dynamicCsvService';

interface AnalysisResult {
  mappings: Record<string, number>;
  confidence: number;
  recommendations: string[];
  preview: any[];
  aiEnhancements: string[];
}

export function AICSVImporter() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStats, setImportStats] = useState({ total: 0, imported: 0, skipped: 0, successful: [] as string[], errors: [] as string[] });
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
        setAnalysisResult(null);
        setImportProgress(0);
        setImportStats({ total: 0, imported: 0, skipped: 0, successful: [], errors: [] });
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
      setAnalysisResult(null);
      setImportProgress(0);
      setImportStats({ total: 0, imported: 0, skipped: 0, successful: [], errors: [] });
    }
  };

  const analyzeCSV = async () => {
    if (!csvFile) return;

    setIsAnalyzing(true);
    try {
      const text = await csvFile.text();
      const rows = text.split('\n').map(row => 
        row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
      );
      
      if (rows.length < 2) {
        throw new Error("CSV file must have at least a header row and one data row");
      }

      const headers = rows[0];
      const sampleRows = rows.slice(1, 4); // First 3 data rows for analysis

      console.log('🧠 Starting AI-powered CSV analysis...');
      const result = await DynamicCsvService.analyzeCsvStructure(headers, sampleRows);
      setAnalysisResult(result);

      toast({
        title: "AI Analysis Complete",
        description: `Analyzed CSV with ${Math.round(result.confidence * 100)}% confidence`,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImport = async () => {
    if (!csvFile || !analysisResult) return;

    setIsImporting(true);
    
    try {
      const text = await csvFile.text();
      const rows = text.split('\n').map(row => 
        row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
      );

      console.log('🚀 Starting AI-enhanced import process...');
      
      const results = await DynamicCsvService.processCsvData(
        rows, 
        analysisResult.mappings,
        { 
          skipFirstRow: true, 
          enrichMissingData: true, 
          batchSize: 3 // Smaller batches for AI processing
        }
      );

      setImportStats({
        total: rows.length - 1,
        imported: results.imported,
        skipped: results.skipped,
        successful: results.successful,
        errors: results.errors
      });
      setImportProgress(100);

      toast({
        title: "AI-Enhanced Import Complete",
        description: `Successfully imported ${results.imported} word profiles with AI enrichment. ${results.skipped} entries were skipped.`,
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
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered CSV Importer
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload any CSV format - our AI will intelligently map columns and enhance missing data automatically.
          </p>
        </CardHeader>
        <CardContent>
          <div 
            className={`border-2 ${dragActive ? 'border-primary' : 'border-dashed border-border'} rounded-lg p-8 transition-colors duration-200 flex flex-col items-center justify-center`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload size={32} className="text-muted-foreground mb-4" />
            <p className="text-center mb-4">
              Drop any CSV file here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground mb-4 text-center">
              No required format - AI adapts to your data structure
            </p>
            
            <Input 
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="max-w-xs"
              disabled={isAnalyzing || isImporting}
            />
          </div>

          {csvFile && (
            <div className="text-sm mt-4 p-3 bg-secondary/20 rounded border">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">{csvFile.name}</span>
                <Badge variant="outline">{Math.round(csvFile.size / 1024)} KB</Badge>
              </div>
            </div>
          )}

          {csvFile && !analysisResult && (
            <Button
              onClick={analyzeCSV}
              disabled={isAnalyzing}
              className="w-full mt-4 flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Brain className="h-4 w-4 animate-pulse" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Analyze CSV Structure
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              AI Analysis Results
              <Badge variant="secondary">
                {Math.round(analysisResult.confidence * 100)}% Confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="mappings" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="mappings">Column Mappings</TabsTrigger>
                <TabsTrigger value="preview">Data Preview</TabsTrigger>
                <TabsTrigger value="enhancements">AI Enhancements</TabsTrigger>
              </TabsList>
              
              <TabsContent value="mappings" className="space-y-3">
                <div className="space-y-2">
                  {analysisResult.recommendations.map((rec, index) => (
                    <div key={index} className="text-sm p-2 bg-secondary/20 rounded">
                      {rec}
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="space-y-3">
                {analysisResult.preview.map((row, index) => (
                  <div key={index} className="p-3 bg-secondary/20 rounded">
                    <h4 className="font-medium mb-2">Sample Row {index + 1}:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(row).map(([field, value]) => (
                        <div key={field}>
                          <span className="font-medium">{field}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="enhancements" className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-medium">AI Will Generate:</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {analysisResult.aiEnhancements.map((enhancement, index) => (
                    <Badge key={index} variant="outline" className="justify-start">
                      {enhancement}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Missing linguistic data will be automatically generated using AI to create comprehensive word profiles.
                </p>
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleImport}
              disabled={isImporting}
              className="w-full mt-4 flex items-center gap-2"
            >
              {isImporting ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Importing with AI Enhancement...
                </>
              ) : (
                <>
                  <ArrowUpFromLine className="h-4 w-4" />
                  Import with AI Enhancement
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Import Progress */}
      {isImporting && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Processing with AI enhancement...</span>
                <span>{importStats.imported} successful / {importStats.skipped} failed</span>
              </div>
              <Progress value={importProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Each word is being enhanced with AI-generated linguistic data including morphological analysis, etymology, and usage examples.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {importStats.total > 0 && !isImporting && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Import Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{importStats.imported}</div>
                <div className="text-sm text-muted-foreground">Imported</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{importStats.skipped}</div>
                <div className="text-sm text-muted-foreground">Skipped</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{importStats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}