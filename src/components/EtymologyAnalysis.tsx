
import { Word } from "@/data/words";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, BookOpen, GraduationCap, Languages } from "lucide-react";

interface EtymologyAnalysisProps {
  word: Word;
}

export function EtymologyAnalysis({ word }: EtymologyAnalysisProps) {
  const { etymology, languageOrigin } = word;
  
  return (
    <div className="mt-6">
      <h4 className="section-title mb-4">Etymology Analysis</h4>
      <Card className="bg-card/90 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <CardTitle>Word History</CardTitle>
            </div>
            <Badge variant="outline">{languageOrigin} Origin</Badge>
          </div>
          <CardDescription>
            Explore the historical development of "{word.word}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="origin" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="origin" className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Origin</span>
              </TabsTrigger>
              <TabsTrigger value="evolution" className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                <span className="hidden sm:inline">Evolution</span>
              </TabsTrigger>
              <TabsTrigger value="cultural" className="flex items-center gap-1">
                <Languages className="h-4 w-4" />
                <span className="hidden sm:inline">Cultural</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="origin" className="mt-4">
              <ScrollArea className="h-[180px] rounded-md border p-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-sm text-primary">Original Source</h5>
                  <p className="text-sm">{etymology.origin || "No origin information available."}</p>
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="evolution" className="mt-4">
              <ScrollArea className="h-[180px] rounded-md border p-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-sm text-primary">Historical Development</h5>
                  <p className="text-sm">{etymology.evolution || "No evolution information available."}</p>
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="cultural" className="mt-4">
              <ScrollArea className="h-[180px] rounded-md border p-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-sm text-primary">Cultural Variations</h5>
                  <p className="text-sm">{etymology.culturalVariations || "No cultural variations information available."}</p>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default EtymologyAnalysis;
