
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsagePattern, AIWordAnalysisService } from "@/services/aiWordAnalysisService";
import { Loader2, MessageSquare, BookOpen } from "lucide-react";

interface UsagePatternsSectionProps {
  word: string;
}

export function UsagePatternsSection({ word }: UsagePatternsSectionProps) {
  const [patterns, setPatterns] = useState<UsagePattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsagePatterns();
  }, [word]);

  const loadUsagePatterns = async () => {
    setLoading(true);
    try {
      const data = await AIWordAnalysisService.getUsagePatterns(word);
      setPatterns(data);
    } catch (error) {
      console.error('Error loading usage patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRegisterIcon = (register: string) => {
    switch (register) {
      case 'academic': return <BookOpen className="h-4 w-4" />;
      case 'formal': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getRegisterColor = (register: string) => {
    switch (register) {
      case 'formal': return 'bg-blue-500/20 text-blue-100 border-blue-400';
      case 'informal': return 'bg-green-500/20 text-green-100 border-green-400';
      case 'academic': return 'bg-purple-500/20 text-purple-100 border-purple-400';
      case 'colloquial': return 'bg-orange-500/20 text-orange-100 border-orange-400';
      case 'technical': return 'bg-red-500/20 text-red-100 border-red-400';
      default: return 'bg-gray-500/20 text-gray-100 border-gray-400';
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Usage Patterns Across Registers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-white/80">Analyzing usage patterns...</span>
          </div>
        ) : (
          <Tabs defaultValue={patterns[0]?.register || 'formal'} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-white/10 backdrop-blur-md border-white/20">
              {patterns.map((pattern) => (
                <TabsTrigger 
                  key={pattern.register}
                  value={pattern.register}
                  className="text-white data-[state=active]:bg-primary data-[state=active]:text-white text-xs"
                >
                  <div className="flex items-center gap-1">
                    {getRegisterIcon(pattern.register)}
                    <span className="hidden sm:inline capitalize">{pattern.register}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {patterns.map((pattern) => (
              <TabsContent key={pattern.register} value={pattern.register} className="mt-6">
                <div className="space-y-4">
                  {/* Register Info */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={getRegisterColor(pattern.register)}>
                        {pattern.register.charAt(0).toUpperCase() + pattern.register.slice(1)} Register
                      </Badge>
                      <span className="text-white/70 text-sm">
                        Usage Frequency: {pattern.frequency}%
                      </span>
                    </div>
                    <Progress value={pattern.frequency} className="w-24 h-2" />
                  </div>

                  {/* Examples */}
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold">Examples in {pattern.register} contexts:</h4>
                    <div className="grid gap-4">
                      {pattern.examples.map((example, index) => (
                        <div key={index} className="p-4 bg-white/5 rounded-lg space-y-3">
                          <div className="border-l-4 border-primary pl-4">
                            <p className="text-white/90 italic text-lg">
                              "{example.sentence}"
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <span className="text-white/70 text-sm font-medium">Context: </span>
                              <span className="text-white/80 text-sm">{example.context}</span>
                            </div>
                            <div>
                              <span className="text-white/70 text-sm font-medium">Explanation: </span>
                              <span className="text-white/80 text-sm">{example.explanation}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
