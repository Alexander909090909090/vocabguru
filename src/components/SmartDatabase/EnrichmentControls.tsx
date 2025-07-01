import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Zap, RefreshCw, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { ComprehensiveEnrichmentService } from "@/services/comprehensiveEnrichmentService";

interface EnrichmentControlsProps {
  wordProfileId: string;
}

export function EnrichmentControls({ wordProfileId }: EnrichmentControlsProps) {
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentProgress, setEnrichmentProgress] = useState(0);
  const [enrichmentStatus, setEnrichmentStatus] = useState<string>('ready');

  const handleEnrichWord = async () => {
    if (!wordProfileId) {
      toast.error('No word profile selected');
      return;
    }

    try {
      setIsEnriching(true);
      setEnrichmentStatus('initializing');
      setEnrichmentProgress(10);

      toast.info('Starting comprehensive word enrichment...');

      setEnrichmentStatus('processing');
      setEnrichmentProgress(30);

      // Use the correct method name from ComprehensiveEnrichmentService
      const result = await ComprehensiveEnrichmentService.enrichWordComprehensively(wordProfileId);

      setEnrichmentProgress(70);
      setEnrichmentStatus('finalizing');

      if (result.success) {
        setEnrichmentProgress(100);
        setEnrichmentStatus('completed');
        
        toast.success('Word enrichment completed successfully!', {
          description: `Quality improved from ${result.qualityScoreBefore}% to ${result.qualityScoreAfter}%`
        });

        // Reset after a delay
        setTimeout(() => {
          setEnrichmentStatus('ready');
          setEnrichmentProgress(0);
        }, 3000);
      } else {
        throw new Error(result.error || 'Enrichment failed');
      }
    } catch (error) {
      console.error('Enrichment error:', error);
      setEnrichmentStatus('error');
      toast.error('Failed to enrich word', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      
      setTimeout(() => {
        setEnrichmentStatus('ready');
        setEnrichmentProgress(0);
      }, 3000);
    } finally {
      setIsEnriching(false);
    }
  };

  const getStatusBadge = () => {
    switch (enrichmentStatus) {
      case 'ready':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Ready</Badge>;
      case 'initializing':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Initializing</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Processing</Badge>;
      case 'finalizing':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Finalizing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="text-white font-medium">AI Enhancement</span>
        </div>
        {getStatusBadge()}
      </div>

      {isEnriching && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Progress</span>
            <span className="text-white">{enrichmentProgress}%</span>
          </div>
          <Progress value={enrichmentProgress} className="h-2" />
        </div>
      )}

      <div className="grid gap-2">
        <Button
          onClick={handleEnrichWord}
          disabled={isEnriching}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isEnriching ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Enriching...
            </>
          ) : enrichmentStatus === 'completed' ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Enriched
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Enhance with AI
            </>
          )}
        </Button>

        {enrichmentStatus === 'ready' && (
          <p className="text-xs text-white/60 text-center">
            Use Calvarn AI to enhance this word with comprehensive linguistic analysis
          </p>
        )}
      </div>
    </div>
  );
}
