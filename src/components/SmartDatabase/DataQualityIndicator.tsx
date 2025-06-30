
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWordQuality } from '@/hooks/useSmartDatabase';
import { CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';

interface DataQualityIndicatorProps {
  wordProfileId: string;
  showDetails?: boolean;
}

export function DataQualityIndicator({ wordProfileId, showDetails = false }: DataQualityIndicatorProps) {
  const { qualityScore, missingFields, loading } = useWordQuality(wordProfileId);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Calculating quality...</span>
      </div>
    );
  }

  const getQualityLevel = (score: number) => {
    if (score >= 80) return { level: 'high', color: 'green', icon: CheckCircle };
    if (score >= 50) return { level: 'medium', color: 'yellow', icon: AlertTriangle };
    return { level: 'low', color: 'red', icon: XCircle };
  };

  const quality = getQualityLevel(qualityScore);
  const QualityIcon = quality.icon;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <QualityIcon className={`h-4 w-4 text-${quality.color}-500`} />
        <span className="text-sm font-medium">Quality: {qualityScore.toFixed(1)}%</span>
        <Badge 
          variant={quality.level === 'high' ? 'default' : quality.level === 'medium' ? 'secondary' : 'destructive'}
          className="text-xs"
        >
          {quality.level.toUpperCase()}
        </Badge>
      </div>

      {showDetails && (
        <>
          <Progress value={qualityScore} className="h-2" />
          
          {missingFields.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Missing fields:</p>
              <div className="flex flex-wrap gap-1">
                {missingFields.map(field => (
                  <Badge key={field} variant="outline" className="text-xs">
                    {field.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            {qualityScore >= 80 && "Excellent data quality - no enrichment needed"}
            {qualityScore >= 50 && qualityScore < 80 && "Good data quality - minor enrichment recommended"}
            {qualityScore < 50 && "Low data quality - enrichment required"}
          </div>
        </>
      )}
    </div>
  );
}
