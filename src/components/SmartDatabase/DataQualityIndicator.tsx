import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, XCircle, Info } from "lucide-react";
import { QualityAssuranceService } from "@/services/qualityAssuranceService";

interface DataQualityIndicatorProps {
  wordProfileId: string;
  showDetails?: boolean;
}

interface QualityReport {
  overallScore: number;
  completenessScore: number;
  accuracyScore: number;
  missingFields: string[];
  suggestions: string[];
  status: 'excellent' | 'good' | 'fair' | 'poor';
}

export function DataQualityIndicator({ wordProfileId, showDetails = false }: DataQualityIndicatorProps) {
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQualityReport = async () => {
      if (!wordProfileId) return;
      
      try {
        setLoading(true);
        const report = await QualityAssuranceService.performQualityAssessment(wordProfileId);
        
        // Ensure the report matches our interface
        const formattedReport: QualityReport = {
          overallScore: report.overallScore || 0,
          completenessScore: report.completenessScore || 0,
          accuracyScore: report.accuracyScore || 0,
          missingFields: report.missingFields || [],
          suggestions: report.suggestions || [],
          status: report.status || 'poor'
        };
        
        setQualityReport(formattedReport);
      } catch (error) {
        console.error('Error loading quality report:', error);
        // Set a default report on error
        setQualityReport({
          overallScore: 0,
          completenessScore: 0,
          accuracyScore: 0,
          missingFields: [],
          suggestions: ['Unable to assess quality'],
          status: 'poor'
        });
      } finally {
        setLoading(false);
      }
    };

    loadQualityReport();
  }, [wordProfileId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-500">Analyzing quality...</span>
      </div>
    );
  }

  if (!qualityReport) {
    return (
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-yellow-500" />
        <span className="text-sm text-gray-500">Quality data unavailable</span>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'good':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'fair':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'poor':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!showDetails) {
    return (
      <div className="flex items-center gap-2">
        {getStatusIcon(qualityReport.status)}
        <Badge variant="outline" className={getStatusColor(qualityReport.status)}>
          {Math.round(qualityReport.overallScore)}% Quality
        </Badge>
      </div>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-sm">
          {getStatusIcon(qualityReport.status)}
          Data Quality Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Overall Quality</span>
            <span className="text-white">{Math.round(qualityReport.overallScore)}%</span>
          </div>
          <Progress value={qualityReport.overallScore} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Completeness</span>
            <span className="text-white">{Math.round(qualityReport.completenessScore)}%</span>
          </div>
          <Progress value={qualityReport.completenessScore} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Accuracy</span>
            <span className="text-white">{Math.round(qualityReport.accuracyScore)}%</span>
          </div>
          <Progress value={qualityReport.accuracyScore} className="h-2" />
        </div>

        {qualityReport.missingFields.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white mb-2">Missing Fields</h4>
            <div className="flex flex-wrap gap-1">
              {qualityReport.missingFields.map((field, index) => (
                <Badge key={index} variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
                  {field}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {qualityReport.suggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white mb-2">Suggestions</h4>
            <ul className="text-xs text-white/70 space-y-1">
              {qualityReport.suggestions.slice(0, 3).map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
