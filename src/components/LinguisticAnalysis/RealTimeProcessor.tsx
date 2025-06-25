
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { AdvancedLinguisticProcessor } from '@/services/advancedLinguisticProcessor';
import { toast } from 'sonner';

interface ProcessingState {
  isProcessing: boolean;
  currentWord: string;
  progress: number;
  stage: string;
  results: any[];
  errors: string[];
}

interface RealTimeProcessorProps {
  onResults: (results: any[]) => void;
  maxWords?: number;
}

export const RealTimeProcessor: React.FC<RealTimeProcessorProps> = ({
  onResults,
  maxWords = 50
}) => {
  const [inputText, setInputText] = useState('');
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    currentWord: '',
    progress: 0,
    stage: 'idle',
    results: [],
    errors: []
  });
  const [streamingResults, setStreamingResults] = useState<any[]>([]);
  const [processingSpeed, setProcessingSpeed] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  // Real-time text processing as user types
  const [debouncedText, setDebouncedText] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(inputText);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputText]);

  useEffect(() => {
    if (debouncedText && !processingState.isProcessing) {
      performRealTimeAnalysis(debouncedText);
    }
  }, [debouncedText]);

  const performRealTimeAnalysis = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const words = text.trim().split(/\s+/).filter(word => 
      word.length > 2 && /^[a-zA-Z]+$/.test(word)
    ).slice(0, maxWords);

    if (words.length === 0) return;

    setProcessingState(prev => ({
      ...prev,
      isProcessing: true,
      stage: 'preprocessing',
      progress: 0,
      results: [],
      errors: []
    }));

    setStartTime(Date.now());

    try {
      const results: any[] = [];
      const totalWords = words.length;

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        
        setProcessingState(prev => ({
          ...prev,
          currentWord: word,
          progress: (i / totalWords) * 100,
          stage: `analyzing_${word}`
        }));

        try {
          const analysis = await AdvancedLinguisticProcessor.analyzeWord({ word });
          
          if (analysis.success) {
            results.push({
              word,
              analysis: analysis.analysis,
              timestamp: Date.now(),
              processingTime: analysis.metadata?.processing_time_ms || 0
            });

            // Update streaming results immediately
            setStreamingResults(prev => [...prev, results[results.length - 1]]);
          }
        } catch (error) {
          console.error(`Error analyzing word "${word}":`, error);
          setProcessingState(prev => ({
            ...prev,
            errors: [...prev.errors, `Failed to analyze "${word}"`]
          }));
        }

        // Calculate processing speed
        const elapsed = Date.now() - startTime;
        const wordsPerSecond = (i + 1) / (elapsed / 1000);
        setProcessingSpeed(wordsPerSecond);

        // Progressive disclosure - show results as they come
        if (results.length > 0) {
          onResults(results);
        }
      }

      setProcessingState(prev => ({
        ...prev,
        isProcessing: false,
        progress: 100,
        stage: 'complete',
        results
      }));

      toast.success(`Analyzed ${results.length} words in ${Math.round((Date.now() - startTime) / 1000)}s`);

    } catch (error) {
      console.error('Real-time processing failed:', error);
      setProcessingState(prev => ({
        ...prev,
        isProcessing: false,
        stage: 'error',
        errors: [...prev.errors, 'Processing pipeline failed']
      }));
      toast.error('Real-time analysis failed');
    }
  }, [maxWords, onResults, startTime]);

  const startBatchProcessing = () => {
    if (inputText.trim()) {
      performRealTimeAnalysis(inputText);
    }
  };

  const stopProcessing = () => {
    setProcessingState(prev => ({
      ...prev,
      isProcessing: false,
      stage: 'stopped'
    }));
  };

  const clearResults = () => {
    setStreamingResults([]);
    setProcessingState(prev => ({
      ...prev,
      results: [],
      errors: [],
      progress: 0,
      stage: 'idle'
    }));
  };

  const getStageDisplay = (stage: string) => {
    if (stage.startsWith('analyzing_')) {
      return `Analyzing: ${stage.replace('analyzing_', '')}`;
    }
    
    switch (stage) {
      case 'idle': return 'Ready to process';
      case 'preprocessing': return 'Preprocessing text';
      case 'complete': return 'Analysis complete';
      case 'stopped': return 'Processing stopped';
      case 'error': return 'Processing error';
      default: return stage;
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Real-Time Linguistic Processor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Input Text</label>
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or paste text for real-time analysis..."
              className="h-24"
              disabled={processingState.isProcessing}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {inputText.trim().split(/\s+/).filter(w => w.length > 2).length} words detected
              </span>
              <span>Max: {maxWords} words</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={startBatchProcessing}
              disabled={!inputText.trim() || processingState.isProcessing}
              className="flex items-center gap-2"
            >
              {processingState.isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {processingState.isProcessing ? 'Processing...' : 'Analyze'}
            </Button>
            
            {processingState.isProcessing && (
              <Button 
                onClick={stopProcessing}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop
              </Button>
            )}
            
            <Button 
              onClick={clearResults}
              variant="outline"
              className="flex items-center gap-2"
            >
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Processing Status */}
      <AnimatePresence>
        {(processingState.isProcessing || processingState.stage !== 'idle') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {processingState.isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : processingState.stage === 'complete' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : processingState.stage === 'error' ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Pause className="h-4 w-4 text-yellow-600" />
                      )}
                      <span className="font-medium">
                        {getStageDisplay(processingState.stage)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {processingState.isProcessing && (
                        <>
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {processingSpeed.toFixed(1)} words/sec
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.round((Date.now() - startTime) / 1000)}s
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <Progress value={processingState.progress} className="h-2" />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {processingState.results.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Analyzed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {streamingResults.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Complete</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {processingState.errors.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Errors</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(processingSpeed * 10) / 10}
                      </div>
                      <div className="text-xs text-muted-foreground">Words/sec</div>
                    </div>
                  </div>

                  {processingState.currentWord && (
                    <div className="text-center">
                      <Badge variant="outline" className="text-sm">
                        Current: {processingState.currentWord}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streaming Results Preview */}
      <AnimatePresence>
        {streamingResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Real-Time Results ({streamingResults.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                  {streamingResults.slice(-6).map((result, index) => (
                    <motion.div
                      key={`${result.word}-${result.timestamp}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50"
                    >
                      <div className="font-medium text-sm">{result.word}</div>
                      <div className="text-xs text-muted-foreground">
                        {result.processingTime}ms
                      </div>
                      <div className="text-xs text-green-600">
                        ✓ Analysis complete
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {processingState.errors.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Processing Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {processingState.errors.map((error, index) => (
                <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
