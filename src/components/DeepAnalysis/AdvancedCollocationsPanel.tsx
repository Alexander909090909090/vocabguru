
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdvancedCollocation, AIWordAnalysisService } from "@/services/aiWordAnalysisService";
import { Loader2, Network } from "lucide-react";

interface AdvancedCollocationsPanelProps {
  word: string;
}

export function AdvancedCollocationsPanel({ word }: AdvancedCollocationsPanelProps) {
  const [collocations, setCollocations] = useState<AdvancedCollocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadCollocations();
  }, [word]);

  const loadCollocations = async () => {
    setLoading(true);
    try {
      const data = await AIWordAnalysisService.getAdvancedCollocations(word);
      setCollocations(data);
    } catch (error) {
      console.error('Error loading collocations:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(collocations.map(c => c.semantic_category))];
  const filteredCollocations = selectedCategory === 'all' 
    ? collocations 
    : collocations.filter(c => c.semantic_category === selectedCategory);

  const getStrengthColor = (strength: number) => {
    if (strength > 0.8) return 'bg-green-500';
    if (strength > 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Network className="h-5 w-5" />
          Advanced Collocations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-white/80">Analyzing collocations...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className="text-xs"
              >
                All Categories
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Collocation List */}
            <div className="grid gap-4">
              {filteredCollocations.map((collocation, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium text-lg">
                        {collocation.word}
                      </span>
                      <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                        {collocation.semantic_category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/70 text-sm">
                        Freq: {collocation.frequency}%
                      </span>
                    </div>
                  </div>

                  {/* Strength Indicator */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/80">Collocation Strength</span>
                      <span className="text-white/60">{Math.round(collocation.strength * 100)}%</span>
                    </div>
                    <Progress 
                      value={collocation.strength * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* Examples */}
                  <div className="space-y-2">
                    <h4 className="text-white/90 font-medium text-sm">Usage Examples:</h4>
                    <div className="grid gap-2">
                      {collocation.examples.slice(0, 3).map((example, idx) => (
                        <div key={idx} className="p-2 bg-white/5 rounded text-sm">
                          <span className="text-white/80 italic">"{example}"</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredCollocations.length === 0 && (
              <div className="text-center py-8 text-white/60">
                No collocations found for the selected category.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
