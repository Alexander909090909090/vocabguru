import { EnhancedWordProfile } from "@/types/enhancedWordProfile";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Target, Users, Clock, Lightbulb } from "lucide-react";

interface ComprehensiveWordAnalysisProps {
  wordProfile: EnhancedWordProfile;
}

export function ComprehensiveWordAnalysis({ wordProfile }: ComprehensiveWordAnalysisProps) {
  const definitions = wordProfile.definitions;
  const morpheme = wordProfile.morpheme_breakdown;
  const etymology = wordProfile.etymology;
  const analysis = wordProfile.analysis;

  return (
    <div className="space-y-6">
      {/* Enhanced Morphological Breakdown */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Morphological Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Visual morpheme breakdown */}
            <div className="flex items-center justify-center gap-2 p-4 bg-secondary/20 rounded-lg">
              {morpheme.prefix && (
                <div className="text-center">
                  <div className="bg-blue-500/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded border-2 border-blue-500/30">
                    <div className="font-bold">{morpheme.prefix.text}</div>
                    <div className="text-xs mt-1">{morpheme.prefix.meaning}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Prefix</div>
                </div>
              )}
              
              <div className="text-center">
                <div className="bg-green-500/20 text-green-700 dark:text-green-300 px-4 py-2 rounded border-2 border-green-500/30">
                  <div className="font-bold text-lg">{morpheme.root.text}</div>
                  <div className="text-sm mt-1">{morpheme.root.meaning}</div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Root</div>
              </div>
              
              {morpheme.suffix && (
                <div className="text-center">
                  <div className="bg-purple-500/20 text-purple-700 dark:text-purple-300 px-3 py-2 rounded border-2 border-purple-500/30">
                    <div className="font-bold">{morpheme.suffix.text}</div>
                    <div className="text-xs mt-1">{morpheme.suffix.meaning}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Suffix</div>
                </div>
              )}
            </div>
            
            {/* Etymology details */}
            <div className="bg-secondary/10 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Etymology</h4>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Origin:</strong> {etymology.language_of_origin || 'Unknown'}
              </p>
              {etymology.historical_origins && (
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Historical Development:</strong> {etymology.historical_origins}
                </p>
              )}
              {etymology.word_evolution && (
                <p className="text-sm text-muted-foreground">
                  <strong>Evolution:</strong> {etymology.word_evolution}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Definitions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Comprehensive Definitions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="primary" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="primary">Primary</TabsTrigger>
              <TabsTrigger value="standard">Standard</TabsTrigger>
              <TabsTrigger value="extended">Extended</TabsTrigger>
              <TabsTrigger value="contextual">Contextual</TabsTrigger>
              <TabsTrigger value="specialized">Specialized</TabsTrigger>
            </TabsList>
            
            <TabsContent value="primary" className="mt-4">
              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="font-medium">{definitions.primary || 'No primary definition available'}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="standard" className="mt-4">
              <div className="space-y-2">
                {definitions.standard && definitions.standard.length > 0 ? (
                  definitions.standard.map((def, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-secondary/10 rounded">
                      <Badge variant="outline" className="min-w-max">{index + 1}</Badge>
                      <p className="text-sm">{def}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No standard definitions available</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="extended" className="mt-4">
              <div className="space-y-2">
                {definitions.extended && definitions.extended.length > 0 ? (
                  definitions.extended.map((def, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-secondary/10 rounded">
                      <Badge variant="outline" className="min-w-max">{index + 1}</Badge>
                      <p className="text-sm">{def}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No extended definitions available</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="contextual" className="mt-4">
              <div className="space-y-2">
                {definitions.contextual && definitions.contextual.length > 0 ? (
                  definitions.contextual.map((def, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-secondary/10 rounded">
                      <Badge variant="outline" className="min-w-max">{index + 1}</Badge>
                      <p className="text-sm">{def}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No contextual definitions available</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="specialized" className="mt-4">
              <div className="space-y-2">
                {definitions.specialized && definitions.specialized.length > 0 ? (
                  definitions.specialized.map((def, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-secondary/10 rounded">
                      <Badge variant="outline" className="min-w-max">{index + 1}</Badge>
                      <p className="text-sm">{def}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No specialized definitions available</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Usage Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usage Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.contextual_usage && (
              <div>
                <h4 className="font-medium mb-2">Contextual Usage</h4>
                <p className="text-sm text-muted-foreground">{analysis.contextual_usage}</p>
              </div>
            )}
            
            {analysis.common_collocations && (
              <div>
                <h4 className="font-medium mb-2">Common Collocations</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(analysis.common_collocations) ? (
                    analysis.common_collocations.map((collocation, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {collocation}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">{analysis.common_collocations}</p>
                  )}
                </div>
              </div>
            )}
            
            {analysis.example && (
              <div>
                <h4 className="font-medium mb-2">Example Usage</h4>
                <p className="text-sm italic bg-secondary/10 p-3 rounded">"{analysis.example}"</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Linguistic Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Part of Speech</h4>
              <Badge variant="outline">{analysis.parts_of_speech || wordProfile.partOfSpeech}</Badge>
            </div>
            
            {analysis.sentence_structure && (
              <div>
                <h4 className="font-medium mb-2">Sentence Structure</h4>
                <p className="text-sm text-muted-foreground">{analysis.sentence_structure}</p>
              </div>
            )}
            
            {analysis.cultural_historical_significance && (
              <div>
                <h4 className="font-medium mb-2">Cultural Significance</h4>
                <p className="text-sm text-muted-foreground">{analysis.cultural_historical_significance}</p>
              </div>
            )}
            
            {etymology.cultural_regional_variations && (
              <div>
                <h4 className="font-medium mb-2">Regional Variations</h4>
                <p className="text-sm text-muted-foreground">{etymology.cultural_regional_variations}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}