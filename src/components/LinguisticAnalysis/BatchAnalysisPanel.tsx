
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AdvancedLinguisticProcessor } from '@/services/advancedLinguisticProcessor';
import { LinguisticAnalysisResult } from '@/types/linguisticAnalysis';
import { Brain, Download, Upload, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

export const BatchAnalysisPanel: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [results, setResults] = useState<LinguisticAnalysisResult[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  const parseWords = (text: string): string[] => {
    return text
      .split(/\s+/)
      .map(word => word.replace(/[^\w]/g, '').toLowerCase())
      .filter(word => word.length > 0)
      .filter((word, index, array) => array.indexOf(word) === index); // Remove duplicates
  };

  const startBatchAnalysis = async () => {
    const words = parseWords(inputText);
    
    if (words.length === 0) {
      toast.error('Please enter some words to analyze');
      return;
    }

    if (words.length > 100) {
      toast.error('Please limit to 100 words per batch');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    setIsPaused(false);

    try {
      const analysisResults = await AdvancedLinguisticProcessor.batchAnalyze(
        words,
        (progressPercent, current) => {
          setProgress(progressPercent);
          setCurrentWord(current);
        }
      );

      setResults(analysisResults);
      
      const successful = analysisResults.filter(r => r.success).length;
      toast.success(`Batch analysis completed! ${successful}/${words.length} words analyzed successfully.`);

    } catch (error) {
      console.error('Batch analysis error:', error);
      toast.error('Batch analysis failed');
    } finally {
      setIsProcessing(false);
      setCurrentWord('');
    }
  };

  const exportResults = () => {
    if (results.length === 0) return;

    const exportData = results.map(result => ({
      word: result.analysis?.word_profile?.word || 'unknown',
      success: result.success,
      confidence_score: result.metadata?.confidence_score,
      completeness_score: result.metadata?.completeness_score,
      processing_time_ms: result.metadata?.processing_time_ms,
      models_used: result.metadata?.models_used?.join(', '),
      error: result.error || null
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linguistic_analysis_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Results exported successfully');
  };

  const getSuccessRate = () => {
    if (results.length === 0) return 0;
    return (results.filter(r => r.success).length / results.length) * 100;
  };

  const getAverageConfidence = () => {
    const successful = results.filter(r => r.success && r.metadata?.confidence_score);
    if (successful.length === 0) return 0;
    
    const total = successful.reduce((sum, r) => sum + (r.metadata?.confidence_score || 0), 0);
    return (total / successful.length) * 100;
  };

  const getAverageProcessingTime = () => {
    const withTime = results.filter(r => r.metadata?.processing_time_ms);
    if (withTime.length === 0) return 0;
    
    const total = withTime.reduce((sum, r) => sum + (r.metadata?.processing_time_ms || 0), 0);
    return total / withTime.length;
  };

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Batch Linguistic Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Enter words or text to analyze (max 100 words):
            </label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter words separated by spaces or newlines..."
              rows={6}
              disabled={isProcessing}
            />
            <p className="text-xs text-muted-foreground">
              Words will be automatically cleaned and deduplicated. Current count: {parseWords(inputText).length}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={startBatchAnalysis}
              disabled={isProcessing || parseWords(inputText).length === 0}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Start Analysis
            </Button>
            
            {results.length > 0 && (
              <Button
                onClick={exportResults}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Results
              </Button>
            )}
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing: {currentWord}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold">{results.length}</p>
                <p className="text-sm text-muted-foreground">Total Words</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{Math.round(getSuccessRate())}%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{Math.round(getAverageConfidence())}%</p>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{(getAverageProcessingTime() / 1000).toFixed(1)}s</p>
                <p className="text-sm text-muted-foreground">Avg Time</p>
              </div>
            </div>

            {/* Results List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      {result.analysis?.word_profile?.word || 'unknown'}
                    </span>
                    <Badge variant={result.success ? 'default' : 'destructive'}>
                      {result.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {result.success && result.metadata && (
                      <>
                        <span>{Math.round((result.metadata.confidence_score || 0) * 100)}% confidence</span>
                        <span>•</span>
                        <span>{((result.metadata.processing_time_ms || 0) / 1000).toFixed(1)}s</span>
                      </>
                    )}
                    {!result.success && result.error && (
                      <span className="text-destructive text-xs">{result.error}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
