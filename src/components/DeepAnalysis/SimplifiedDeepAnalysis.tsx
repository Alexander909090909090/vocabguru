import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, BookOpen, Users, TrendingUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Header } from '@/components/Header';

interface SimplifiedDeepAnalysisProps {
  word: string;
}

const SimplifiedDeepAnalysis: React.FC<SimplifiedDeepAnalysisProps> = ({ word }) => {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState({
    etymology: 'Etymology details go here...',
    morphemes: 'Morpheme breakdown goes here...',
    usage: 'Usage examples go here...',
  });

  useEffect(() => {
    // Simulate fetching analysis data
    setTimeout(() => {
      setAnalysis({
        etymology: 'Derived from Latin "superfluus," meaning overflowing.',
        morphemes: 'Prefix: super- (above), Root: fluere (to flow), Suffix: -ous (full of)',
        usage: 'Commonly used to describe something unnecessary or excessive.',
      });
    }, 500);
  }, [word]);

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 group"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back
      </Button>

      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Simplified Deep Analysis: {word}
          </CardTitle>
          <CardDescription>
            Concise linguistic insights into the word "{word}"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gray-500" />
            <h3 className="text-lg font-semibold">Etymology</h3>
          </div>
          <p className="text-gray-700">{analysis.etymology}</p>
          <Separator />

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <h3 className="text-lg font-semibold">Morphemes</h3>
          </div>
          <p className="text-gray-700">{analysis.morphemes}</p>
          <Separator />

          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <h3 className="text-lg font-semibold">Usage</h3>
          </div>
          <p className="text-gray-700">{analysis.usage}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplifiedDeepAnalysis;
